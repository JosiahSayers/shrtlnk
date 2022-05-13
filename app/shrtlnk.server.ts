import { Shrtlnk } from "@prisma/client";
import ShortUniqueId from "short-unique-id";
import { isUrlSafe } from "./safeBrowsingApi.server";
import { db } from "./utils/db.server";

export async function createShrtlnk(
  url: string,
  apiKey: string
): Promise<Shrtlnk | null> {
  const application = await db.application.findFirst({ where: { apiKey } });
  if (!application) return null;

  if (
    !isValidUrl(url) ||
    /^(http)?(s)?(:\/\/)?(www.)?shrtlnk.dev/gm.test(url) ||
    !(await isUrlSafe(url))
  ) {
    throw new Error("unsafe URL");
  }

  let key: string;
  do {
    key = new ShortUniqueId({ dictionary: "alphanum_lower" }).randomUUID(6);
  } while (await doesKeyExist(key));
  return db.shrtlnk.create({
    data: { url, key, applicationId: application.id },
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
