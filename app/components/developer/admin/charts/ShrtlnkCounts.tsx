import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import BarChartCard from "~/components/developer/admin/BarChartCard";
import { loader } from "~/routes/developer.admin.api.user-counts";

export default function ShrtlnkCounts() {
  const fetcher = useFetcher<typeof loader>();

  useEffect(() => {
    fetcher.load("/developer/admin/api/shrtlnk-counts");
  }, []);

  return (
    <BarChartCard
      title="Shrtlnk Totals"
      data={fetcher.data?.stats}
      id="shrtlnk-stats"
      xAxisKey="name"
      dataKey="count"
      loading={fetcher.state === "loading" || fetcher.data === undefined}
    />
  );
}
