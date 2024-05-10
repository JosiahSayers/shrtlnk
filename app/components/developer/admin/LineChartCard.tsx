import { HStack, Spinner } from "@chakra-ui/react";
import { capitalCase } from "change-case";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
  dataKeys: string | string[];
  loading?: boolean;
};

const colors = ["#8884d8", "#84aad8", "#b284d8"];

export default function LineChartCard({
  title,
  width = 1000,
  height = 200,
  data,
  id,
  xAxisKey,
  dataKeys,
  loading,
}: Props) {
  const dataKeyArray = Array.isArray(dataKeys) ? dataKeys : [dataKeys];

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
            <LineChart width={width} height={height} data={data} id={id}>
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
              <XAxis dataKey={xAxisKey} tick={false} />
              <YAxis />
              <Tooltip />
              {dataKeyArray.length > 1 && <Legend />}
              {dataKeyArray.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index]}
                  name={capitalCase(key)}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
