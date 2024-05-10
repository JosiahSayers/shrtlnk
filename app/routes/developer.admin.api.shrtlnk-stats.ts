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

  const [shrtlnks, loads] = await db.$transaction([
    db.$queryRaw`
      SELECT sequential_dates.date, COUNT("Shrtlnk".*) AS shrtlnks_created
      FROM (SELECT (current_timestamp at time zone 'UTC')::date - sequential_dates.date AS DATE
        FROM generate_series(0, ${daysToQuery}::INT) AS sequential_dates(date)) sequential_dates
      LEFT JOIN "Shrtlnk" ON "Shrtlnk"."createdAt" BETWEEN sequential_dates.date AND sequential_dates.date + INTERVAL '1 day'
      GROUP BY sequential_dates.date
      ORDER BY date ASC
    `,
    db.$queryRaw`
      SELECT sequential_dates.date, COUNT("ShrtlnkLoad".*) AS shrtlnks_loaded
      FROM (SELECT (current_timestamp at time zone 'UTC')::date - sequential_dates.date AS DATE
        FROM generate_series(0, ${daysToQuery}::INT) AS sequential_dates(date)) sequential_dates
      LEFT JOIN "ShrtlnkLoad" ON "ShrtlnkLoad"."createdAt" BETWEEN sequential_dates.date AND sequential_dates.date + INTERVAL '1 day'
      GROUP BY sequential_dates.date
      ORDER BY date ASC
    `,
  ]);

  const safeData = safelyParseData({ shrtlnks, loads } as any);
  const combined: QueryResult = safeData.shrtlnks.map((shrtlnk: any) => {
    const matchingLoadsDay = safeData.loads.find(
      (load: any) => load.date === shrtlnk.date
    );

    return {
      ...shrtlnk,
      shrtlnks_loaded: matchingLoadsDay?.shrtlnks_loaded ?? 0,
    };
  });

  return json({ stats: combined });
}
