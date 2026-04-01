import React from "react";

interface StatPillProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone?: "brand" | "warning" | "soft";
}

const toneMap = {
  brand: "border-[#0E514F]/10 bg-[#0E514F] text-[#FFFFFE]",
  warning: "border-amber-200 bg-[#FFF5B3] text-[#0E514F]",
  soft: "border-slate-200 bg-white text-slate-700",
};

const StatPill: React.FC<StatPillProps> = ({ label, value, icon, tone = "soft" }) => {
  return (
    <div className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 shadow-sm ${toneMap[tone]}`}>
      {icon ? <span className="text-base">{icon}</span> : null}
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">{label}</span>
        <span className="text-sm font-bold">{value}</span>
      </div>
    </div>
  );
};

export default StatPill;