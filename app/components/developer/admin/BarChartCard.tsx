import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

type Props = {
  title: string;
  width?: number;
  height?: number;
  data: any;
  id: string;
  xAxisKey: string;
  dataKey: string;
};

export default function BarChartCard({
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
        <BarChart width={width} height={height} data={data} id={id}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          <Tooltip />
          <Bar dataKey={dataKey} fill="#8884d8" />
        </BarChart>
      </div>
    </div>
  );
}
