import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import BarChartCard from "~/components/developer/admin/BarChartCard";
import LineChartCard from "~/components/developer/admin/LineChartCard";
import { db } from "~/utils/db.server";

export const loader: LoaderFunction = async () => {
  const data = {
    userStats: [
      { name: "Users", count: await db.user.count() },
      {
        name: "Admins",
        count: await db.user.count({ where: { role: "Admin" } }),
      },
      { name: "Applications", count: await db.application.count() },
    ],
    shrtlnkStats: [
      { name: "Shrtlnks", count: await db.shrtlnk.count() },
      { name: "Shrtlnk Loads", count: await db.shrtlnkLoad.count() },
      { name: "Blocked URLs", count: await db.blockedUrl.count() },
    ],
    users: await db.$queryRaw`
        SELECT sequential_dates.date, COUNT("User".*) AS users_created
        FROM (SELECT CURRENT_DATE - sequential_dates.date AS DATE
          FROM generate_series(0, 30) AS sequential_dates(date)) sequential_dates
        LEFT JOIN "User" ON "User"."createdAt"::DATE = sequential_dates.date
        GROUP BY sequential_dates.date
        ORDER BY date ASC`,
    appsCreated: await db.$queryRaw`
        SELECT sequential_dates.date, COUNT("Application".*) AS apps_created
          FROM (SELECT CURRENT_DATE - sequential_dates.date AS DATE
            FROM generate_series(0, 30) AS sequential_dates(date)) sequential_dates
        LEFT JOIN "Application" ON "Application"."createdAt"::DATE = sequential_dates.date
        GROUP BY sequential_dates.date
        ORDER BY date ASC`,
    shrtlnks: await db.$queryRaw`
        SELECT sequential_dates.date, COUNT("Shrtlnk".*) AS shrtlnks_created
        FROM (SELECT CURRENT_DATE - sequential_dates.date AS DATE
          FROM generate_series(0, 30) AS sequential_dates(date)) sequential_dates
        LEFT JOIN "Shrtlnk" ON "Shrtlnk"."createdAt"::DATE = sequential_dates.date
        GROUP BY sequential_dates.date
        ORDER BY date ASC`,
    shrtlnkLoads: await db.$queryRaw`
        SELECT sequential_dates.date, COUNT("ShrtlnkLoad".*) AS shrtlnks_loaded
        FROM (SELECT CURRENT_DATE - sequential_dates.date AS DATE
          FROM generate_series(0, 30) AS sequential_dates(date)) sequential_dates
        LEFT JOIN "ShrtlnkLoad" ON "ShrtlnkLoad"."createdAt"::DATE = sequential_dates.date
        GROUP BY sequential_dates.date
        ORDER BY date ASC`,
  };

  const safeData = JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (typeof value === "bigint") {
        return Number(value);
      }

      if (key === "date") {
        return value.split("T")[0];
      }

      return value;
    })
  );

  return json(safeData);
};

export default function AdminIndex() {
  const data = useLoaderData();

  return (
    <div className="container">
      <BarChartCard
        title="Shrtlnk Totals"
        data={data?.shrtlnkStats}
        id="shrtlnk-stats"
        xAxisKey="name"
        dataKey="count"
      />

      <BarChartCard
        title="User Totals"
        data={data?.userStats}
        id="user-stats"
        xAxisKey="name"
        dataKey="count"
      />

      <LineChartCard
        title="New Shrtlnks"
        data={data?.shrtlnks}
        id="shrtlnks-created"
        xAxisKey="date"
        dataKey="shrtlnks_created"
      />

      <LineChartCard
        title="Shrtlnks Loaded"
        data={data?.shrtlnkLoads}
        id="shrtlnks-loaded"
        xAxisKey="date"
        dataKey="shrtlnks_loaded"
      />

      <LineChartCard
        title="New Users"
        data={data?.users}
        id="user-signups"
        xAxisKey="date"
        dataKey="users_created"
      />

      <LineChartCard
        title="New Applications"
        data={data?.appsCreated}
        id="new-apps"
        xAxisKey="date"
        dataKey="apps_created"
      />
    </div>
  );
}
