import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const chartData = [
  { name: "Mon", value: 250 },
  { name: "Tue", value: 150 },
  { name: "Wed", value: 1000 },
  { name: "Thu", value: 400 },
];

export default function Charts() {
  return (
    <div className="bg-white p-5 rounded-2xl shadow">
      <h3 className="font-bold mb-3">Stock Movement (FIFO/LIFO)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#0E514F" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
