import { Application } from "@prisma/client";
import { db } from "./utils/db.server";

type ApplicationWithData = Application & {
  shrtlnksCreated: number;
  shrtlnkLoads: number;
  blockedUrls: number;
};

export async function getApplicationsWithCounts(
  userId: number
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
