import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import LineChartCard from "~/components/developer/admin/LineChartCard";
import { loader } from "~/routes/developer.admin.api.user-stats";

type Props = {
  daysToQuery: number;
};

export default function UserStats({ daysToQuery }: Props) {
  const fetcher = useFetcher<typeof loader>();

  useEffect(() => {
    const params = new URLSearchParams({ days: daysToQuery.toString() });
    fetcher.load(`/developer/admin/api/user-stats?${params}`);
  }, [daysToQuery]);

  return (
    <LineChartCard
      title="Users"
      data={fetcher.data?.stats}
      id="user-signups"
      xAxisKey="date"
      dataKeys={["users_created", "apps_created"]}
      loading={fetcher.state === "loading" || fetcher.data === undefined}
    />
  );
}
