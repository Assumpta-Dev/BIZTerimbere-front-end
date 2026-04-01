import { ReactNode } from "react";

interface Props {
  title: string;
  value: string;
  icon: ReactNode;
  bg: string;
}

export default function Card({ title, value, icon, bg }: Props) {
  return (
    <div className={`p-5 rounded-2xl flex items-center justify-between ${bg}`}>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <h2 className="text-2xl font-bold text-[#0E514F]">{value}</h2>
      </div>

      <div className="bg-[#FFF5B3] p-3 rounded-xl text-[#0E514F]">{icon}</div>
    </div>
  );
}
