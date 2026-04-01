import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TrendAreaChartProps<T extends Record<string, string | number>> {
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

const TrendAreaChart = <T extends Record<string, string | number>>({
  title,
  subtitle,
  data,
  dataKey,
  secondaryDataKey,
  xKey,
  colors,
}: TrendAreaChartProps<T>) => {
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
          <AreaChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="trendPrimaryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.35} />
                <stop offset="95%" stopColor={primaryColor} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="trendSecondaryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.45} />
                <stop offset="95%" stopColor={secondaryColor} stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#dbe4e4" vertical={false} />
            <XAxis dataKey={String(xKey)} stroke="#64748b" tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ borderRadius: 16, borderColor: "#dbe4e4", backgroundColor: "#FFFFFE" }} />
            <Legend />
            <Area
              type="monotone"
              dataKey={String(dataKey)}
              stroke={primaryColor}
              fill="url(#trendPrimaryGradient)"
              strokeWidth={3}
              activeDot={{ r: 6 }}
            />
            {secondaryDataKey ? (
              <Area
                type="monotone"
                dataKey={String(secondaryDataKey)}
                stroke={secondaryColor}
                fill="url(#trendSecondaryGradient)"
                strokeWidth={3}
                activeDot={{ r: 6 }}
              />
            ) : null}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendAreaChart;