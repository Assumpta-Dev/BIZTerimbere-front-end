import React from "react";

type Tone = "brand" | "warning" | "neutral";

interface InsightCardProps {
  title: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  tone?: Tone;
}

const toneClasses: Record<Tone, { shell: string; iconWrap: string; helper: string }> = {
  brand: {
    shell: "border-[#0E514F]/10 bg-[#FFFFFE]",
    iconWrap: "bg-[#0E514F] text-[#FFFFFE]",
    helper: "text-[#0E514F]",
  },
  warning: {
    shell: "border-amber-200 bg-[#FFFFFE]",
    iconWrap: "bg-[#FFF5B3] text-[#0E514F]",
    helper: "text-amber-700",
  },
  neutral: {
    shell: "border-slate-200 bg-[#FFFFFE]",
    iconWrap: "bg-slate-100 text-[#0E514F]",
    helper: "text-slate-500",
  },
};

const InsightCard: React.FC<InsightCardProps> = ({
  title,
  value,
  helper,
  icon,
  tone = "brand",
}) => {
  const palette = toneClasses[tone];

  return (
    <div className={`rounded-3xl border p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 ${palette.shell}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
          <p className={`text-sm font-medium ${palette.helper}`}>{helper}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl shadow-sm ${palette.iconWrap}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default InsightCard;