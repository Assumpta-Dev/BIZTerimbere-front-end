import { useEffect, useState } from "react";
import { analyticsApi } from "../api/services";
import { presentationSlides } from "../data/data";
import {
  RiFileTextLine, RiPrinterLine, RiDownloadLine, RiCheckLine,
  RiStackLine, RiBarChartBoxLine, RiShieldCheckLine, RiClipboardLine,
  RiLoader4Line,
} from "react-icons/ri";

const currency = (v: number) =>
  new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(v);

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <RiLoader4Line className="text-3xl text-[#0E514F] animate-spin" />
    </div>
  );
}

export default function Reports() {
  const [profit, setProfit] = useState<any>(null);
  const [inventoryStatus, setInventoryStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.getProfitAnalysis("30d"),
      analyticsApi.getInventoryStatus(),
    ]).then(([p, inv]) => {
      setProfit(p.data.data);
      setInventoryStatus(inv.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const wasteEstimate = inventoryStatus?.expiredProducts?.reduce(
    (s: number, p: any) => s + (p.estimatedLoss ?? 0), 0
  ) ?? 0;

  const reportCards = [
    {
      title: "Waste prevented",
      value: wasteEstimate > 0 ? currency(wasteEstimate) : "RWF 0",
      helper: "Estimated loss from expired products",
    },
    {
      title: "Profit margin",
      value: profit?.profitMargin ? `${profit.profitMargin}%` : "—",
      helper: "Net margin over last 30 days",
    },
    {
      title: "Total revenue",
      value: profit?.totalRevenue ? currency(profit.totalRevenue) : "—",
      helper: `${profit?.totalTransactions ?? 0} transactions this month`,
    },
    {
      title: "Avg daily revenue",
      value: profit?.avgDailyRevenue ? currency(profit.avgDailyRevenue) : "—",
      helper: "Average revenue per day (30d)",
    },
  ];

  const kpiBlocks = [
    {
      title: "Total profit",
      value: profit?.totalProfit ? currency(profit.totalProfit) : "—",
      helper: "Net profit over last 30 days",
      icon: <RiStackLine className="text-lg" />,
    },
    {
      title: "Price compliance",
      value: `${inventoryStatus?.summary?.healthy ?? 0} healthy`,
      helper: "Products within optimal stock range",
      icon: <RiShieldCheckLine className="text-lg" />,
    },
    {
      title: "Avg transaction",
      value: profit?.avgTransactionValue ? currency(profit.avgTransactionValue) : "—",
      helper: "Average value per sale transaction",
      icon: <RiBarChartBoxLine className="text-lg" />,
    },
  ];

  return (
    <div className="space-y-7 pb-8">
      {/* Header */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#0E514F]/5 px-4 py-1.5 text-xs font-semibold text-[#0E514F]">
              <RiFileTextLine />
              Executive reporting pack
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Business report for stock efficiency &amp; pricing performance
            </h1>
            <p className="text-sm leading-6 text-slate-500">
              A document-style summary for leadership review, investor conversations, and internal operational planning.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row shrink-0">
            <button onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0E514F] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition">
              <RiPrinterLine /> Print summary
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0E514F]/15 bg-[#FFF5B3] px-5 py-2.5 text-sm font-semibold text-[#0E514F] hover:bg-[#fff08a] transition">
              <RiDownloadLine /> Export deck
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {reportCards.map((card) => (
            <div key={card.title} className="rounded-xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">{card.title}</p>
                <div className="w-8 h-8 rounded-lg bg-[#FFF5B3] text-[#0E514F] flex items-center justify-center">
                  <RiCheckLine className="text-sm" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="text-xs text-slate-400 mt-2 leading-5">{card.helper}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Executive summary + Board snapshot */}
      <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E514F]/50">Summary</p>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">Key business outcomes</h2>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#0E514F] text-white flex items-center justify-center">
              <RiClipboardLine className="text-lg" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-5 space-y-4 text-sm leading-7 text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">BIZTerimbere improved decision quality</span>{" "}
              by converting movement, expiry, and pricing signals into practical actions for daily store operations.
              The latest reporting window shows better stock alignment, improved markdown timing, and clearer margin protection.
            </p>
            <p>
              Fast-moving lines remain resilient, but vulnerable categories still need tighter reorder discipline.
              The strongest improvements came from expiry control and restock precision.
            </p>
            {profit && (
              <p>
                Over the last 30 days, <span className="font-semibold text-slate-900">{profit.totalTransactions} transactions</span> generated{" "}
                <span className="font-semibold text-slate-900">{currency(profit.totalRevenue)}</span> in revenue with a{" "}
                <span className="font-semibold text-slate-900">{profit.profitMargin}% profit margin</span>.
              </p>
            )}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {kpiBlocks.map((block) => (
              <div key={block.title} className="rounded-xl border border-[#0E514F]/10 bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{block.title}</p>
                  <div className="text-[#0E514F]">{block.icon}</div>
                </div>
                <p className="text-2xl font-bold text-slate-900">{block.value}</p>
                <p className="text-xs text-slate-400 mt-1.5 leading-5">{block.helper}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-[#0E514F] p-6 text-white shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Readiness</p>
              <h2 className="text-xl font-bold mt-0.5">Board-facing snapshot</h2>
            </div>
            <RiFileTextLine className="text-2xl text-[#FFF5B3]" />
          </div>
          <div className="space-y-3">
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/50">Inventory health</p>
              <p className="mt-1.5 text-base font-semibold text-[#FFF5B3]">
                {inventoryStatus?.summary?.healthy ?? 0} healthy · {inventoryStatus?.summary?.low ?? 0} low · {inventoryStatus?.summary?.outOfStock ?? 0} out
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/50">Payment breakdown</p>
              <div className="mt-1.5 space-y-1">
                {profit?.paymentBreakdown?.slice(0, 3).map((p: any) => (
                  <div key={p.mode} className="flex justify-between text-xs text-white/80">
                    <span>{p.mode.replace("_", " ")}</span>
                    <span className="font-semibold">{p.count} sales</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-[#FFF5B3]/20 bg-[#FFF5B3]/10 p-4 text-sm leading-5 text-white/80">
              Emphasises waste reduction, pricing discipline, and replenishment precision as the three strongest drivers of margin stability.
            </div>
          </div>
        </div>
      </div>

      {/* Presentation slides */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between mb-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E514F]/50">Slides</p>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">Presentation deck</h2>
            <p className="text-sm text-slate-400 mt-0.5">Document-style story for the product and its impact</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#FFF5B3] text-[#0E514F] px-3 py-1.5 rounded-full">
            <RiStackLine /> {presentationSlides.length} slides
          </span>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {presentationSlides.map((slide) => (
            <article key={slide.id}
              className="rounded-xl border border-slate-100 bg-slate-50 p-5 hover:border-[#0E514F]/20 hover:bg-white transition-all">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#0E514F]/50">Slide {slide.id}</p>
                  <h3 className="text-base font-bold text-slate-900 mt-1 leading-snug">{slide.title}</h3>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#FFF5B3] text-[#0E514F] flex items-center justify-center shrink-0">
                  <RiStackLine className="text-base" />
                </div>
              </div>
              <div className="rounded-lg border-l-4 border-[#0E514F] bg-white px-4 py-3 mb-4">
                <p className="text-sm font-medium text-slate-700 leading-5">{slide.accent}</p>
              </div>
              <ul className="space-y-2">
                {slide.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2.5 text-sm text-slate-500 leading-5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0E514F] shrink-0" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
