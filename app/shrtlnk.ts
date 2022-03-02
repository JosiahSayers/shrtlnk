import { Shrtlnk } from "@prisma/client";
import { db } from "./utils/db.server";
import ShortUniqueId from "short-unique-id";

export async function createShrtlnk(
  url: string,
  apiKey: string
): Promise<Shrtlnk | null> {
  const application = await db.application.findFirst({ where: { apiKey } });
  console.log({ apiKey, application });
  if (!application) return null;

  let key: string;
  do {
    key = new ShortUniqueId({ dictionary: "alphanum" }).randomUUID(6);
  } while (await doesKeyExist(key));
  return db.shrtlnk.create({
    data: { url, key, applicationId: application.id },
  });
}

export async function getShrtlnk(key: string): Promise<Shrtlnk | null> {
  return db.shrtlnk.findFirst({ where: { key } });
}

async function doesKeyExist(key: string): Promise<boolean> {
  return !!(await db.shrtlnk.findFirst({ where: { key } }));
}
