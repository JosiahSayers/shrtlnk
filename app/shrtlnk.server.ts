import { Shrtlnk } from "@prisma/client";
import ShortUniqueId from "short-unique-id";
import { logger } from "~/utils/logger.server";
import { isUrlSafe } from "./safeBrowsingApi.server";
import { db } from "./utils/db.server";

export async function createShrtlnk(
  url: string,
  apiKey: string,
  eligibleForAd?: boolean,
  customKey?: string
): Promise<Shrtlnk | null> {
  const application = await db.application.findFirst({ where: { apiKey } });
  if (!application) {
    logger.error(`application not found when creating shrtlnk. ${apiKey}`);
    return null;
  }

  if (
    !isValidUrl(url) ||
    /^(http)?(s)?(:\/\/)?(www.)?shrtlnk.dev/gm.test(url) ||
    !(await isUrlSafe(url))
  ) {
    await db.blockedUrl.create({
      data: {
        url,
        applicationId: application.id,
        foundBy: "Found at runtime",
      },
    });
    throw new Error("unsafe URL");
  }

  let key: string;
  console.log({ customKey });
  if (customKey && (await doesKeyExist(customKey))) {
    throw new DuplicateKeyError();
  } else if (customKey) {
    key = customKey;
  } else {
    do {
      key = new ShortUniqueId({ dictionary: "alphanum_lower" }).randomUUID(6);
    } while (await doesKeyExist(key));
  }

  const finalEligibleForAd = eligibleForAd ?? application.totalLoads > 500;

  return db.shrtlnk.create({
    data: {
      url,
      key,
      applicationId: application.id,
      eligibleForAd: finalEligibleForAd,
    },
  });
}

export async function getShrtlnk(
  key: string,
  createLoadEntry = false
): Promise<Shrtlnk | null> {
  const link = await db.shrtlnk.findUnique({ where: { key } });
  if (!link) {
    return null;
  }
  const isSafe = await isUrlSafe(link.url);
  if (!isSafe) {
    await db.$transaction([
      db.blockedUrl.create({
        data: {
          url: link.url,
          applicationId: link.applicationId ?? "unknown",
          foundBy: "Load Check",
          linkCreatedAt: link.createdAt,
        },
      }),
      db.shrtlnk.delete({ where: { id: link.id } }),
    ]);
    return null;
  }

  if (createLoadEntry) {
    await db.$transaction([
      db.shrtlnkLoad.create({
        data: {
          shrtlnkId: link.id,
        },
      }),
      db.application.update({
        where: { id: link.applicationId ?? undefined },
        data: { totalLoads: { increment: 1 } },
      }),
    ]);
  }
  return link;
}

export async function doesKeyExist(key: string): Promise<boolean> {
  return !!(await getShrtlnk(key));
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

export class DuplicateKeyError extends Error {}
