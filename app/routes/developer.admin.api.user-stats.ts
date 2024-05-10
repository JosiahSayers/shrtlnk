import { json } from "@remix-run/node";
import { LoaderFunctionArgs } from "react-router";
import { defaultDaysToQuery } from "~/routes/developer.admin._index";
import { db } from "~/utils/db.server";
import { safelyParseData } from "~/utils/safely-parse";
import { requireAdminRole } from "~/utils/session.server";

type QueryResult = {
  stats: Array<{
    date: string;
    users_created: number;
    apps_created: number;
  }>;
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdminRole(request);
  const searchParams = new URL(request.url).searchParams;
  const daysToQuery = Number(searchParams.get("days")) || defaultDaysToQuery;

  const [users, applications] = await db.$transaction([
    db.$queryRaw`
    SELECT sequential_dates.date, COUNT("User".*) AS users_created
        FROM (SELECT (current_timestamp at time zone 'UTC')::date - sequential_dates.date AS DATE
          FROM generate_series(0, ${daysToQuery}::INT) AS sequential_dates(date)) sequential_dates
        LEFT JOIN "User" ON "User"."createdAt" BETWEEN sequential_dates.date AND sequential_dates.date + INTERVAL '1 day'
        GROUP BY sequential_dates.date
        ORDER BY date ASC
    `,
    db.$queryRaw`
    SELECT sequential_dates.date, COUNT("Application".*) AS apps_created
        FROM (SELECT (current_timestamp at time zone 'UTC')::date - sequential_dates.date AS DATE
          FROM generate_series(0, ${daysToQuery}::INT) AS sequential_dates(date)) sequential_dates
        LEFT JOIN "Application" ON "Application"."createdAt" BETWEEN sequential_dates.date AND sequential_dates.date + INTERVAL '1 day'
        GROUP BY sequential_dates.date
        ORDER BY date ASC
    `,
  ]);

  [].find;
  const safeData = safelyParseData({ users, applications } as any);
  const combined: QueryResult = safeData.users.map((day: any) => {
    const matchingAppDay = safeData.applications.find(
      (appDay: any) => appDay.date === day.date
    );

    return {
      ...day,
      apps_created: matchingAppDay?.apps_created ?? 0,
    };
  });

  return json({ stats: combined });
}
