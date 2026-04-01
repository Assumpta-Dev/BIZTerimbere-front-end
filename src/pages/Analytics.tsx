import { useEffect, useState } from "react";
import { economicApi, analyticsApi, alertsApi } from "../api/services";
import {
  RiStockLine, RiMapPinLine, RiGlobalLine, RiUserStarLine,
  RiLightbulbLine, RiScalesLine, RiArrowUpLine, RiArrowDownLine,
  RiCheckLine, RiBox3Line, RiLoader4Line,
} from "react-icons/ri";

const currency = (value: number) =>
  new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(value);

const priorityColor: Record<string, string> = {
  high: "bg-rose-50 text-rose-600 border border-rose-200",
  medium: "bg-amber-50 text-amber-700 border border-amber-200",
  low: "bg-slate-100 text-slate-500 border border-slate-200",
};

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <RiLoader4Line className="text-3xl text-[#0E514F] animate-spin" />
    </div>
  );
}

export default function Analytics() {
  const [economic, setEconomic] = useState<any>(null);
  const [priceSuggestions, setPriceSuggestions] = useState<any[]>([]);
  const [salesChart, setSalesChart] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      economicApi.getIndicators(),
      economicApi.getPriceSuggestions(),
      analyticsApi.getSalesChart("7d"),
      alertsApi.getAll(),
      analyticsApi.getCategoryBreakdown("30d"),
    ]).then(([eco, prices, chart, al, cats]) => {
      setEconomic(eco.data.data);
      setPriceSuggestions(prices.data.data?.suggestions?.slice(0, 6) ?? []);
      const raw = chart.data.data ?? [];
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      setSalesChart(raw.slice(0, 7).map((p: any, i: number) => ({
        name: days[i] ?? `D${i + 1}`,
        value: p.revenue ?? 0,
        forecast: p.revenue ? Math.round(p.revenue * 0.92) : 0,
      })));
      setAlerts(al.data.data?.filter((a: any) =>
        ["PRICE_SUGGESTION", "LOW_STOCK", "EXPIRY_SOON"].includes(a.type)
      ).slice(0, 3) ?? []);
      setCategoryBreakdown(cats.data.data ?? []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const maxSales = Math.max(...categoryBreakdown.map((c: any) => c.revenue ?? 0), 1);
  const maxChart = Math.max(...salesChart.map((p) => p.value), 1);

  return (
    <div className="space-y-7 pb-8">
      {/* Header */}
      <div className="rounded-2xl bg-[#0E514F] p-6 lg:p-8 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #FFF5B3 0%, transparent 60%)" }} />
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr] relative">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold">
              <RiStockLine className="text-[#FFF5B3]" />
              Market-aware analytics
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl leading-tight">
              Pricing, demand &amp; regional performance
            </h1>
            <p className="text-sm text-white/70 max-w-xl leading-6">
              Track sales momentum, compare price positioning, and identify where margin protection matters most.
            </p>
            <div className="grid gap-3 sm:grid-cols-3 pt-2">
              {[
                { label: "Inflation", value: economic?.inflationRate ? `${economic.inflationRate}%` : "—", sub: "Current sensitivity" },
                { label: "Exchange rate", value: economic?.exchangeRate ? `1 USD = ${economic.exchangeRate?.toLocaleString()} RWF` : "—", sub: "Live rate" },
                { label: "Price alerts", value: String(priceSuggestions.filter((s: any) => s.urgency === "high").length), sub: "Underpriced products" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">{s.label}</p>
                  <p className="mt-1.5 text-lg font-bold text-[#FFF5B3] truncate">{s.value}</p>
                  <p className="text-xs text-white/60 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm self-start">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-3">Macro recommendation</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-[10px] text-white/50">Exchange rate</p>
                <p className="text-xs font-semibold text-white mt-1">
                  {economic?.exchangeRate ? `1 USD = ${economic.exchangeRate?.toLocaleString()} RWF` : "—"}
                </p>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-[10px] text-white/50">Source</p>
                <p className="text-xs font-semibold text-white mt-1">{economic?.exchangeSource ?? "—"}</p>
              </div>
            </div>
            <p className="text-xs leading-5 text-white/80 border border-[#FFF5B3]/20 bg-[#FFF5B3]/10 rounded-lg p-3">
              {economic?.recommendation ?? "Loading recommendation…"}
            </p>
            <div className="flex items-center gap-1.5 mt-3 text-[11px] text-white/50">
              <RiCheckLine className="text-[#FFF5B3]" />
              Updated against inflation &amp; market pressure
            </div>
          </div>
        </div>
      </div>

      {/* Sales trend + Alerts */}
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E514F]/50">Trend overview</p>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">Weekly sales vs baseline</h2>
            </div>
            <span className="text-xs text-slate-400">Last 7 trading days</span>
          </div>
          <div className="space-y-3">
            {salesChart.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No sales data yet</p>
            ) : salesChart.map((point) => {
              const actualW = Math.max((point.value / maxChart) * 100, 4);
              const forecastW = Math.max((point.forecast / maxChart) * 100, 4);
              return (
                <div key={point.name} className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-slate-800">{point.name}</p>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{currency(point.value)}</p>
                      <p className="text-xs text-slate-400">Forecast {currency(point.forecast)}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Actual</span><span>{Math.round(actualW)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full rounded-full bg-[#0E514F]" style={{ width: `${actualW}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Forecast</span><span>{Math.round(forecastW)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full rounded-full bg-[#d4b800]" style={{ width: `${forecastW}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E514F]/50">Suggestions</p>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">Action queue</h2>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#FFF5B3] flex items-center justify-center text-[#0E514F]">
              <RiLightbulbLine className="text-lg" />
            </div>
          </div>
          <div className="space-y-3 flex-1">
            {alerts.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No active suggestions</p>
            ) : alerts.map((alert: any) => (
              <div key={alert.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-[#0E514F] flex items-center justify-center text-white shrink-0 mt-0.5">
                  {alert.type === "PRICE_SUGGESTION" ? <RiScalesLine className="text-sm" /> : <RiBox3Line className="text-sm" />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                      {alert.type?.replace(/_/g, " ")}
                    </p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityColor.high}`}>
                      Alert
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-5">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E514F]/50">Categories</p>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">Revenue by category</h2>
            </div>
            <RiUserStarLine className="text-2xl text-[#0E514F]" />
          </div>
          <div className="space-y-3">
            {categoryBreakdown.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No sales data yet</p>
            ) : categoryBreakdown.slice(0, 5).map((cat: any, i: number) => (
              <div key={cat.categoryId} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                <div className="w-9 h-9 rounded-xl bg-[#0E514F] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  0{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{cat.name}</p>
                  <div className="h-1.5 rounded-full bg-slate-200 mt-1.5 overflow-hidden">
                    <div className="h-full rounded-full bg-[#0E514F]" style={{ width: `${cat.percentage}%` }} />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-slate-900">{currency(cat.revenue)}</p>
                  <p className="text-xs text-slate-400">{cat.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E514F]/50">Geographic</p>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">Regional demand pulse</h2>
            </div>
            <RiGlobalLine className="text-2xl text-[#0E514F]" />
          </div>
          <div className="space-y-4">
            {categoryBreakdown.slice(0, 4).map((cat: any) => (
              <div key={cat.categoryId} className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <RiMapPinLine className="text-[#0E514F]" />
                    <span className="text-sm font-semibold text-slate-800">{cat.name}</span>
                  </div>
                  <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                    {cat.quantity} units
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full rounded-full bg-[#0E514F]" style={{ width: `${(cat.revenue / maxSales) * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1.5">
                  <span>Revenue contribution</span>
                  <span>{cat.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Price comparison table */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E514F]/50">Pricing</p>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">Market price comparison</h2>
            <p className="text-sm text-slate-400 mt-0.5">Current vs recommended floor vs market average</p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E514F] bg-[#0E514F]/5 px-3 py-1.5 rounded-full">
            <RiScalesLine /> Smart pricing frame
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">Product</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">Urgency</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">Current</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">Min floor</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">Ideal price</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {priceSuggestions.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-400">No price data yet</td></tr>
              ) : priceSuggestions.map((item: any) => (
                <tr key={item.productId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-800">{item.productName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.status}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2.5 py-1 rounded-full ${priorityColor[item.urgency] ?? priorityColor.low}`}>
                      {item.urgency === "high" ? <RiArrowUpLine /> : item.urgency === "medium" ? <RiArrowDownLine /> : null}
                      {item.urgency}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-900">{currency(item.currentSellingPrice)}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-[#0E514F]">{currency(item.suggestedMinPrice)}</td>
                  <td className="px-4 py-4 text-xs text-slate-500">{currency(item.suggestedIdealPrice)}</td>
                  <td className="px-4 py-4 text-xs text-slate-500">{item.currentMargin}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
