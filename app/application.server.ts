import { Application } from "@prisma/client";
import ShortUniqueId from "short-unique-id";
import { db } from "./utils/db.server";

type ApplicationWithData = Application & {
  shrtlnksCreated: number;
  shrtlnkLoads: number;
  blockedUrls: number;
};

export async function getApplicationsWithCounts(
  userId: string
): Promise<ApplicationWithData[]> {
  const apps = await db.application.findMany({
    where: { userId },
    include: {
      _count: {
        select: {
          blockedUrls: true,
          shrtlnks: true,
        },
      },
    },
  });

  return apps.map((app) => ({
    ...app,
    shrtlnkLoads: app.totalLoads,
    shrtlnksCreated: app._count.shrtlnks,
    blockedUrls: app._count.blockedUrls,
  }));
}

export async function createApp({
  name,
  website,
  userId,
}: {
  name: string;
  website: string;
  userId: string;
}) {
  let apiKey: string;
  do {
    apiKey = new ShortUniqueId().randomUUID(45);
  } while (await db.application.findFirst({ where: { apiKey } }));

  return db.application.create({
    data: {
      name,
      website,
      userId,
      apiKey,
    },
  });
}

export async function updateApp({
  id,
  name,
  website,
}: {
  id: string;
  name: string;
  website: string;
}) {
  return db.application.update({
    where: { id },
    data: {
      name,
      website,
    },
  });
}

export async function getApp(id: string) {
  return db.application.findFirst({ where: { id } });
}

export async function deleteApp(id: string) {
  return db.application.delete({
    where: { id },
  });
}

export async function getAppByApiKey(apiKey: string) {
  return db.application.findFirst({ where: { apiKey } });
}
