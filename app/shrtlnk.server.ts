import { Shrtlnk } from "@prisma/client";
import ShortUniqueId from "short-unique-id";
import { logger } from "~/utils/logger.server";
import { isUrlSafe } from "./safeBrowsingApi.server";
import { db } from "./utils/db.server";

export async function createShrtlnk(
  url: string,
  apiKey: string,
  eligibleForAd = true
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
  do {
    key = new ShortUniqueId({ dictionary: "alphanum_lower" }).randomUUID(6);
  } while (await doesKeyExist(key));
  return db.shrtlnk.create({
    data: { url, key, applicationId: application.id, eligibleForAd },
  });
}

export async function getShrtlnk(
  key: string,
  createLoadEntry = false
): Promise<Shrtlnk | null> {
  const link = await db.shrtlnk.findUnique({ where: { key } });
  if (link && createLoadEntry) {
    await db.shrtlnkLoad.create({
      data: {
        shrtlnkId: link.id,
      },
    });
  }
  return link;
}

async function doesKeyExist(key: string): Promise<boolean> {
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
