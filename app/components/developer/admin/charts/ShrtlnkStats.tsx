import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import LineChartCard from "~/components/developer/admin/LineChartCard";
import { loader } from "~/routes/developer.admin.api.shrtlnk-stats";

type Props = {
  daysToQuery: number;
};

export default function ShrtlnkStats({ daysToQuery }: Props) {
  const fetcher = useFetcher<typeof loader>();

  useEffect(() => {
    const params = new URLSearchParams({ days: daysToQuery.toString() });
    fetcher.load(`/developer/admin/api/shrtlnk-stats?${params}`);
  }, [daysToQuery]);

  return (
    <LineChartCard
      title="Shrtlnks"
      data={fetcher.data?.stats}
      id="shrtlnks-created"
      xAxisKey="date"
      dataKeys={["shrtlnks_created", "shrtlnks_loaded"]}
      loading={fetcher.state === "loading" || fetcher.data === undefined}
    />
  );
}
