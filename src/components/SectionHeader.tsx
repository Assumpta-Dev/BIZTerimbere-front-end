import React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  align?: "left" | "center";
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
  icon: Icon,
  align = "left",
}) => {
  const aligned =
    align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div
      className={`flex flex-col gap-4 rounded-3xl border border-[#0E514F]/10 bg-[#FFFFFE] p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 ${align === "center" ? "sm:flex-col" : ""}`}
    >
      <div className={`flex gap-4 ${aligned}`}>
        {Icon ? (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF5B3] text-2xl text-[#0E514F] shadow-sm">
            <Icon />
          </div>
        ) : null}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-[#0E514F]">
            {title}
          </h2>
          {subtitle ? (
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      {action ? (
        <div className={align === "center" ? "" : "sm:shrink-0"}>{action}</div>
      ) : null}
    </div>
  );
};

export default SectionHeader;
