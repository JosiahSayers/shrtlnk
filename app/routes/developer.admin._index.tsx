import { FormLabel, HStack, Select } from "@chakra-ui/react";
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import BarChartCard from "~/components/developer/admin/BarChartCard";
import LineChartCard from "~/components/developer/admin/LineChartCard";
import { db } from "~/utils/db.server";

const defaultDaysToQuery = 10;

export const loader: LoaderFunction = async ({ request }) => {
  const searchParams = new URL(request.url).searchParams;
  const daysToQuery = Number(searchParams.get("days")) || defaultDaysToQuery;

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
        FROM (SELECT (current_timestamp at time zone 'UTC')::date - sequential_dates.date AS DATE
          FROM generate_series(0, ${daysToQuery}::INT) AS sequential_dates(date)) sequential_dates
        LEFT JOIN "User" ON "User"."createdAt" BETWEEN sequential_dates.date AND sequential_dates.date + INTERVAL '1 day'
        GROUP BY sequential_dates.date
        ORDER BY date ASC`,
    appsCreated: await db.$queryRaw`
        SELECT sequential_dates.date, COUNT("Application".*) AS apps_created
          FROM (SELECT (current_timestamp at time zone 'UTC')::date - sequential_dates.date AS DATE
            FROM generate_series(0, ${daysToQuery}::INT) AS sequential_dates(date)) sequential_dates
        LEFT JOIN "Application" ON "Application"."createdAt" BETWEEN sequential_dates.date AND sequential_dates.date + INTERVAL '1 day'
        GROUP BY sequential_dates.date
        ORDER BY date ASC`,
    shrtlnks: await db.$queryRaw`
        SELECT sequential_dates.date, COUNT("Shrtlnk".*) AS shrtlnks_created
        FROM (SELECT (current_timestamp at time zone 'UTC')::date - sequential_dates.date AS DATE
          FROM generate_series(0, ${daysToQuery}::INT) AS sequential_dates(date)) sequential_dates
        LEFT JOIN "Shrtlnk" ON "Shrtlnk"."createdAt" BETWEEN sequential_dates.date AND sequential_dates.date + INTERVAL '1 day'
        GROUP BY sequential_dates.date
        ORDER BY date ASC`,
    shrtlnkLoads: await db.$queryRaw`
        SELECT sequential_dates.date, COUNT("ShrtlnkLoad".*) AS shrtlnks_loaded
        FROM (SELECT (current_timestamp at time zone 'UTC')::date - sequential_dates.date AS DATE
          FROM generate_series(0, ${daysToQuery}::INT) AS sequential_dates(date)) sequential_dates
        LEFT JOIN "ShrtlnkLoad" ON "ShrtlnkLoad"."createdAt" BETWEEN sequential_dates.date AND sequential_dates.date + INTERVAL '1 day'
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
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div className="container">
      <HStack justify="flex-end" mb="1rem">
        <FormLabel htmlFor="days">Days to show:</FormLabel>
        <Select
          id="days"
          bg="white"
          w={75}
          onChange={(event) => setSearchParams({ days: event.target.value })}
          value={searchParams.get("days") ?? defaultDaysToQuery}
        >
          {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
            <option key={day}>{day}</option>
          ))}
        </Select>
      </HStack>

      <LineChartCard
        title="Shrtlnks"
        data={data?.shrtlnks.map((shrtlnk: any) => ({
          ...shrtlnk,
          ...data?.shrtlnkLoads.find((load: any) => load.date === shrtlnk.date),
        }))}
        id="shrtlnks-created"
        xAxisKey="date"
        dataKeys={["shrtlnks_created", "shrtlnks_loaded"]}
      />

      <LineChartCard
        title="Users"
        data={data?.users.map((user: any) => ({
          ...user,
          ...data?.appsCreated.find((app: any) => app.date === user.date),
        }))}
        id="user-signups"
        xAxisKey="date"
        dataKeys={["users_created", "apps_created"]}
      />

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
    </div>
  );
}
