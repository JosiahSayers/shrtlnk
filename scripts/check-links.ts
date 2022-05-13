import { PrismaClient, Shrtlnk } from "@prisma/client";
import { promises } from "fs";
import path from "path";
import ProgressBar from "progress";
import { getUrlBatchResponses } from "~/safeBrowsingApi.server";

const db = new PrismaClient();

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

async function writeToFile(threatMatches: any[]) {
  const dedupedIds = new Set<string>();
  threatMatches.forEach((match) => {
    if (match?.threat?.id) {
      dedupedIds.add(match.threat.id);
    }
  });
  const asString = JSON.stringify(threatMatches, null, 2);
  await promises.writeFile(
    path.join(process.cwd(), "check-link-results.json"),
    asString
  );
  console.log({
    threatMatches: threatMatches.length,
    dedupedIds: dedupedIds.size,
  });
  console.log(`Found ${dedupedIds.size} unsafe links, deleting them...`);
  await db.shrtlnk.deleteMany({
    where: { id: { in: Array.from(dedupedIds) } },
  });
}

async function go() {
  const totalLinks = await db.shrtlnk.count();
  const bar = new ProgressBar(":current/:total (:percent) |:bar|", {
    total: totalLinks,
  });

  let currentBatch: Shrtlnk[] = [];
  let offset = 0;
  const threatMatches: any[] = [];
  do {
    currentBatch = await getBatchOfLinks(offset);
    const safetyResults = await processBatch(currentBatch);
    threatMatches.push(...safetyResults);
    offset += 100;
    bar.tick(100);
  } while (currentBatch.length === 100);
  await writeToFile(threatMatches);
}

// async function getInvalidUrls() {
//   const allLinks = await db.shrtlnk.findMany();
//   const invalidUrls: Shrtlnk[] = [];
//   allLinks.forEach((link) => {
//     try {
//       new URL(link.url);
//     } catch (e) {
//       invalidUrls.push(link);
//     }
//   });
//   console.log(`Found ${invalidUrls.length} invalid URLs, deleting them...`);
//   await Promise.all(
//     invalidUrls.map((shrtlnk) =>
//       db.shrtlnk.delete({ where: { id: shrtlnk.id } })
//     )
//   );
// }

go();
// getInvalidUrls();
