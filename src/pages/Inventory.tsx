import { useEffect, useMemo, useState } from "react";
import {
  RiArchiveDrawerLine, RiAlertLine, RiTimeLine, RiEqualizerLine,
  RiStockLine, RiArrowUpLine, RiArrowDownLine, RiSubtractLine,
  RiDownloadLine, RiLoader4Line,
} from "react-icons/ri";
import { analyticsApi, categoriesApi, productsApi } from "../api/services";

const statusStyles: Record<string, string> = {
  healthy: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  low: "bg-amber-50 text-amber-700 border border-amber-200",
  expiring: "bg-orange-50 text-orange-700 border border-orange-200",
  critical: "bg-rose-50 text-rose-700 border border-rose-200",
};
const statusDot: Record<string, string> = {
  healthy: "bg-emerald-400", low: "bg-amber-400",
  expiring: "bg-orange-400", critical: "bg-rose-500",
};

function getStatus(p: any): string {
  if (p.quantity === 0) return "critical";
  if (p.isExpiringSoon) return "expiring";
  if (p.isLowStock) return "low";
  return "healthy";
}

const fmt = (v: string) =>
  new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const daysUntil = (v: string) =>
  Math.ceil((new Date(v).getTime() - Date.now()) / 86400000);

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <RiLoader4Line className="text-3xl text-[#0E514F] animate-spin" />
    </div>
  );
}

export default function Inventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [inventoryStatus, setInventoryStatus] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productsApi.getAll({ limit: 100 }),
      categoriesApi.getAll(),
      analyticsApi.getInventoryStatus(),
      analyticsApi.getTopProducts(3, "30d"),
    ]).then(([prods, cats, status, top]) => {
      setProducts(prods.data.data?.products ?? []);
      setCategories(cats.data.data ?? []);
      setInventoryStatus(status.data.data);
      setTopProducts(top.data.data ?? []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    const totalUnits = products.reduce((s: number, p: any) => s + p.quantity, 0);
    const lowOrCritical = (inventoryStatus?.summary?.low ?? 0) + (inventoryStatus?.summary?.outOfStock ?? 0);
    const expiringSoon = inventoryStatus?.summary?.expiringSoon ?? 0;
    return { totalUnits, lowOrCritical, expiringSoon };
  }, [products, inventoryStatus]);

  const expiring = useMemo(() =>
    [...products]
      .filter((p: any) => p.expiryDate)
      .sort((a: any, b: any) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
      .slice(0, 3),
    [products]
  );

  if (loading) return <Spinner />;

  const summaryCards = [
    { label: "Total units", value: summary.totalUnits.toLocaleString(), sub: "All active categories", icon: <RiArchiveDrawerLine className="text-xl" />, color: "text-[#0E514F]", bg: "bg-[#FFF5B3]" },
    { label: "Low & critical", value: String(summary.lowOrCritical), sub: "Need urgent reorder", icon: <RiAlertLine className="text-xl" />, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Expiring in 30 days", value: String(summary.expiringSoon), sub: "Promote or rotate first", icon: <RiTimeLine className="text-xl" />, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Total SKUs", value: String(products.length), sub: "Active products", icon: <RiEqualizerLine className="text-xl" />, color: "text-sky-600", bg: "bg-sky-50" },
  ];

  return (
    <div className="space-y-7 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-1 pt-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E514F]/50">Inventory</p>
          <h1 className="text-3xl font-bold text-[#0E514F] tracking-tight mt-0.5">Stock Control Center</h1>
          <p className="text-sm text-slate-500 mt-1">Track stock health, mismatches, and expiry risk in one view.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-[#0E514F] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition shrink-0">
          <RiDownloadLine /> Export snapshot
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.color} flex items-center justify-center mb-4`}>
              {c.icon}
            </div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{c.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{c.value}</p>
            <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Category grid */}
      <div>
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E514F]/50">Categories</p>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">Product groups</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((cat: any) => {
            const items = products.filter((p: any) => p.category?.name === cat.name || p.categoryId === cat.id);
            const total = items.reduce((s: number, p: any) => s + p.quantity, 0);
            const fastest = [...items].sort((a: any, b: any) => b.sellingPrice - a.sellingPrice)[0];
            return (
              <div key={cat.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[#0E514F] bg-[#E6FFFA]">
                    <RiArchiveDrawerLine className="text-xl" />
                  </div>
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                    {cat._count?.products ?? items.length} SKUs
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#0E514F]">{cat.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{total} units in pool</p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Top product</span>
                  <span className="font-semibold text-slate-700 truncate max-w-[120px]">
                    {fastest?.name ?? "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live register table */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E514F]/50">Register</p>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">Live stock register</h2>
          </div>
          <span className="text-xs font-semibold bg-[#FFF5B3] text-[#0E514F] px-3 py-1 rounded-full">
            {products.length} lines
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Product", "Qty / Threshold", "Manufactured", "Expiry", "Cost / Price", "Status"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((item: any) => {
                const status = getStatus(item);
                const days = item.expiryDate ? daysUntil(item.expiryDate) : null;
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot[status]}`} />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-400">{item.sku ?? "—"} · {item.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-800">{item.quantity}</p>
                      <p className="text-xs text-slate-400">min {item.lowStockThreshold}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.manufacturingDate ? fmt(item.manufacturingDate) : "—"}
                    </td>
                    <td className="px-5 py-4">
                      {item.expiryDate ? (
                        <>
                          <p className="text-sm text-slate-700">{fmt(item.expiryDate)}</p>
                          <p className={`text-xs font-medium ${days !== null && days <= 5 ? "text-rose-500" : "text-slate-400"}`}>
                            {days !== null ? `${days}d left` : "—"}
                          </p>
                        </>
                      ) : <span className="text-xs text-slate-400">No expiry</span>}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {item.costPrice?.toLocaleString()} / {item.sellingPrice?.toLocaleString()} RWF
                      </p>
                      <p className="text-xs text-slate-400">Margin {item.profitMargin}%</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyles[status]}`}>
                        {status}
                      </span>
                      <p className={`text-xs mt-1 font-medium flex items-center gap-0.5 ${item.quantity > item.lowStockThreshold ? "text-emerald-600" : item.quantity > 0 ? "text-amber-600" : "text-rose-500"}`}>
                        {item.quantity > item.lowStockThreshold ? <RiArrowUpLine /> : item.quantity > 0 ? <RiSubtractLine /> : <RiArrowDownLine />}
                        {item.quantity > item.lowStockThreshold ? "good" : item.quantity > 0 ? "low" : "out"}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top sellers + Expiring */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E514F]/50">Performance</p>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">Top sellers</h2>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#FFF5B3] flex items-center justify-center text-[#0E514F]">
              <RiStockLine className="text-lg" />
            </div>
          </div>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No sales data yet</p>
            ) : topProducts.map((item: any, i: number) => (
              <div key={item.productId} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                <span className="text-xs font-bold text-slate-400 w-5 shrink-0">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{item.productName}</p>
                  <p className="text-xs text-slate-400">{item.category}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-[#0E514F]">{item.totalQuantitySold} sold</p>
                  <p className="text-xs text-slate-400">{item.currentStock} left</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E514F]/50">Expiry watch</p>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">Expiring soon</h2>
            </div>
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
              <RiTimeLine className="text-lg" />
            </div>
          </div>
          <div className="space-y-3">
            {expiring.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No expiring products</p>
            ) : expiring.map((item: any) => {
              const days = daysUntil(item.expiryDate);
              const status = getStatus(item);
              return (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${days <= 2 ? "bg-rose-100 text-rose-600" : "bg-orange-100 text-orange-600"}`}>
                    {days}d
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                    <p className="text-xs text-slate-400">Expires {fmt(item.expiryDate)}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize shrink-0 ${statusStyles[status]}`}>
                    {status === "critical" || status === "expiring" ? "Promote now" : "Monitor"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
