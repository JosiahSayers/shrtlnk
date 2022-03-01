import { Shrtlnk } from "@prisma/client";
import { db } from "./utils/db.server";
import ShortUniqueId from "short-unique-id";

const shrtlnkKeyCharacters = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
];

export async function createShrtlnk(
  url: string,
  apiKey: string
): Promise<Shrtlnk | null> {
  const application = await db.application.findFirst({ where: { apiKey } });
  if (!application) return null;

  let key: string;
  do {
    key = new ShortUniqueId({ dictionary: "alphanum" }).randomUUID(6);
  } while (await doesKeyExist(key));
  return db.shrtlnk.create({
    data: { url, key, applicationId: application.id },
  });
}

async function doesKeyExist(key: string): Promise<boolean> {
  return !!(await db.shrtlnk.findFirst({ where: { key } }));
}
