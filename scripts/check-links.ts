import { PrismaClient, Shrtlnk } from "@prisma/client";
import ProgressBar from "progress";
import { getUrlBatchResponses, ThreatMatch } from "~/safeBrowsingApi.server";

const db = new PrismaClient();
type AugmentedThreatMatch = ThreatMatch & { threat: { id: string } };

async function getBatchOfLinks(offset?: number) {
  return db.shrtlnk.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    skip: offset ?? 0,
  });
}

async function processBatch(links: Shrtlnk[]) {
  const mapped = links.map((link) => link.url.toLowerCase());
  const safetyResults = await getUrlBatchResponses(mapped);
  if (!safetyResults) {
    console.log({
      safetyResults,
      links: mapped,
    });
    console.error("Failed to call API");
  }
  const withIds =
    safetyResults?.matches?.map((result) => {
      const copy = JSON.parse(JSON.stringify(result));
      copy.threat.id = links.find((link) => link.url === copy.threat.url)?.id;
      return copy;
    }) || [];
  return withIds;
}

async function processThreats(
  threatMatches: AugmentedThreatMatch[]
): Promise<number> {
  const dedupedIds = new Set<string>();
  threatMatches.forEach((match) => {
    if (match?.threat?.id) {
      dedupedIds.add(match.threat.id);
    }
  });
  const finalIds = Array.from(dedupedIds);
  const links = await db.shrtlnk.findMany({
    where: { id: { in: finalIds } },
  });

  await db.blockedUrl.createMany({
    data: links.map((link) => ({
      url: link.url,
      applicationId: link.applicationId!,
      foundBy: process.env.FOUND_BY || "CRON Job",
    })),
  });

  await db.shrtlnk.deleteMany({
    where: { id: { in: finalIds } },
  });

  return finalIds.length;
}

export async function cleanLinks() {
  const log = await db.cleanLinksLog.create({ data: {} });
  const totalLinks = await db.shrtlnk.count();
  const bar = new ProgressBar(":current/:total (:percent) |:bar|", {
    total: totalLinks,
  });
  let currentBatch: Shrtlnk[] = [];
  let offset = 0;
  const threatMatches: AugmentedThreatMatch[] = [];
  try {
    do {
      currentBatch = await getBatchOfLinks(offset);
      const safetyResults = await processBatch(currentBatch);
      threatMatches.push(...safetyResults);
      offset += 100;
      bar.tick(currentBatch.length < 100 ? currentBatch.length : 100);
    } while (currentBatch.length === 100);
    const totalThreatsFound = await processThreats(threatMatches);
    await db.cleanLinksLog.update({
      where: { id: log.id },
      data: {
        status: "success",
        completedAt: new Date(),
        totalThreatsFound,
      },
    });
  } catch (e) {
    await db.cleanLinksLog.update({
      where: { id: log.id },
      data: { status: "failure", completedAt: new Date() },
    });
  }
}

cleanLinks();
