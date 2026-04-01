import React from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface TrendBarChartProps<T extends Record<string, string | number>> {
  title: string;
  subtitle?: string;
  data: T[];
  dataKey: keyof T;
  secondaryDataKey?: keyof T;
  xKey: keyof T;
  colors?: {
    primary?: string;
    secondary?: string;
  };
}

const TrendBarChart = <T extends Record<string, string | number>>({
  title,
  subtitle,
  data,
  dataKey,
  secondaryDataKey,
  xKey,
  colors,
}: TrendBarChartProps<T>) => {
  const primaryColor = colors?.primary ?? "#0E514F";
  const secondaryColor = colors?.secondary ?? "#FFF5B3";

  return (
    <div className="rounded-[28px] border border-[#0E514F]/10 bg-[#FFFFFE] p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h3 className="text-xl font-bold text-[#0E514F]">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }} barGap={10}>
            <CartesianGrid strokeDasharray="3 3" stroke="#dbe4e4" vertical={false} />
            <XAxis dataKey={String(xKey)} stroke="#64748b" tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ borderRadius: 16, borderColor: "#dbe4e4", backgroundColor: "#FFFFFE" }} />
            <Legend />
            <Bar dataKey={String(dataKey)} fill={primaryColor} radius={[10, 10, 0, 0]} />
            {secondaryDataKey ? (
              <Bar dataKey={String(secondaryDataKey)} fill={secondaryColor} radius={[10, 10, 0, 0]} />
            ) : null}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendBarChart;