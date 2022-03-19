import {
  CartesianGrid,
  Line,
  LineChart,
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
};

export default function LineChartCard({
  title,
  width = 1000,
  height = 200,
  data,
  id,
  xAxisKey,
  dataKey,
}: Props) {
  return (
    <div className="card text-center mb-3">
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <LineChart width={width} height={height} data={data} id={id}>
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          <XAxis dataKey={xAxisKey} tick={false} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey={dataKey} stroke="#8884d8" />
        </LineChart>
      </div>
    </div>
  );
}
