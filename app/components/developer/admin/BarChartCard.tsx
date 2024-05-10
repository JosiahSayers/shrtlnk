import { HStack, Spinner } from "@chakra-ui/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  title: string;
  width?: number;
  height?: number;
  data: any;
  id: string;
  xAxisKey: string;
  dataKey: string;
  loading?: boolean;
};

export default function BarChartCard({
  title,
  width = 1000,
  height = 200,
  data,
  id,
  xAxisKey,
  dataKey,
  loading,
}: Props) {
  return (
    <div className="card text-center mb-3">
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        {loading ? (
          <HStack justifyContent="center" alignItems="center" height={height}>
            <Spinner size="xl" />
          </HStack>
        ) : (
          <ResponsiveContainer height={height}>
            <BarChart width={width} height={height} data={data} id={id}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={dataKey} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
