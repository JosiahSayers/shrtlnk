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
  const applications = await db.application.findMany({
    where: { userId },
    include: {
      _count: {
        select: { blockedUrls: true },
      },
      shrtlnks: {
        include: {
          _count: {
            select: { loads: true },
          },
        },
      },
    },
  });

  return applications.map((app) => ({
    ...app,
    shrtlnkLoads: app.shrtlnks.reduce(
      (count, link) => count + link._count.loads,
      0
    ),
    shrtlnksCreated: app.shrtlnks.length,
    blockedUrls: app._count.blockedUrls,
    shrtlnks: undefined,
    _count: undefined,
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
