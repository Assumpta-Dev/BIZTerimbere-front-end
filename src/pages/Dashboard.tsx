import { useEffect, useState } from "react";
import {
  RiAlertLine, RiArrowUpLine, RiArrowDownLine,
  RiExchangeDollarLine, RiBarChartLine, RiArrowRightLine,
  RiTimeLine, RiShieldCheckLine, RiStockLine, RiLoader4Line,
  RiSearchLine,
  RiCheckDoubleLine, RiDeleteBin6Line,
} from "react-icons/ri";
import { analyticsApi, economicApi, alertsApi, productsApi, categoriesApi } from "../api/services";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";
import CollectionFooter from "../components/CollectionFooter";
import { sortItems } from "../utils/collection";

const priorityColor: Record<string, string> = {
  High: "bg-rose-50 text-rose-600 border border-rose-200",
  Medium: "bg-amber-50 text-amber-700 border border-amber-200",
  Low: "bg-slate-100 text-slate-500 border border-slate-200",
  LOW_STOCK: "bg-rose-50 text-rose-600 border border-rose-200",
  OUT_OF_STOCK: "bg-rose-50 text-rose-600 border border-rose-200",
  EXPIRY_SOON: "bg-amber-50 text-amber-700 border border-amber-200",
  EXPIRED: "bg-orange-50 text-orange-700 border border-orange-200",
  PRICE_SUGGESTION: "bg-sky-50 text-sky-700 border border-sky-200",
  INFLATION_ALERT: "bg-purple-50 text-purple-700 border border-purple-200",
};

const statusDot: Record<string, string> = {
  healthy: "bg-emerald-400", low: "bg-amber-400",
  expiring: "bg-orange-400", critical: "bg-rose-500",
};

function getProductStatus(p: any): string {
  if (p.quantity === 0) return "critical";
  if (p.isExpiringSoon) return "expiring";
  if (p.isLowStock) return "low";
  return "healthy";
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <RiLoader4Line className="text-3xl text-[#0E514F] animate-spin" />
    </div>
  );
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [economic, setEconomic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [productMeta, setProductMeta] = useState<{ page: number; totalPages: number; total: number } | null>(null);

  const [stockSearch, setStockSearch] = useState("");
  const [stockCategoryId, setStockCategoryId] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [stockSortBy, setStockSortBy] = useState<"name" | "quantity" | "sellingPrice">("name");
  const [stockSortDir, setStockSortDir] = useState<"asc" | "desc">("asc");
  const [stockPage, setStockPage] = useState(1);
  const [stockLimit, setStockLimit] = useState(5);

  const [alertSearch, setAlertSearch] = useState("");
  const [alertType, setAlertType] = useState("");
  const [alertUnreadOnly, setAlertUnreadOnly] = useState(false);
  const [alertPage, setAlertPage] = useState(1);
  const [alertLimit] = useState(4);
  const [busyAlertId, setBusyAlertId] = useState<string | null>(null);
  const [alertSortDir, setAlertSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    Promise.all([
      analyticsApi.getDashboard(),
      analyticsApi.getSalesChart("7d"),
      alertsApi.getAll(),
      productsApi.getAll({ page: 1, limit: 5 }),
      economicApi.getIndicators(),
      categoriesApi.getAll(),
    ]).then(([dash, chart, al, prods, eco, cats]) => {
      setDashboard(dash.data.data);
      // Map chart data to {name, value} format
      const raw = chart.data.data ?? [];
      setChartData(raw.map((p: any, i: number) => ({
        name: p.date ? new Date(p.date).toLocaleDateString("en-US", { weekday: "short" }) : `Day ${i + 1}`,
        value: p.revenue ?? 0,
        forecast: p.revenue ? Math.round(p.revenue * 0.92) : 0,
      })));
      setAlerts(al.data.data ?? []);
      setProducts(prods.data.data?.products ?? []);
      setProductMeta(prods.data.data?.meta ?? null);
      setEconomic(eco.data.data);
      setCategories(cats.data.data ?? []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoadingProducts(true);
    productsApi.getAll({
      search: stockSearch || undefined,
      categoryId: stockCategoryId || undefined,
      stockStatus: stockStatus || undefined,
      sortBy: stockSortBy,
      sortDir: stockSortDir,
      page: stockPage,
      limit: stockLimit,
    }).then((res) => {
      setProducts(res.data.data?.products ?? []);
      setProductMeta(res.data.data?.meta ?? null);
    }).catch(console.error).finally(() => setLoadingProducts(false));
  }, [stockSearch, stockCategoryId, stockStatus, stockPage, stockLimit, stockSortBy, stockSortDir]);

  const refreshAlerts = () => {
    setLoadingAlerts(true);
    alertsApi.getAll()
      .then((res) => setAlerts(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoadingAlerts(false));
  };

  const filteredAlerts = sortItems(
    alerts
    .filter((a: any) => (alertType ? a.type === alertType : true))
    .filter((a: any) => (alertUnreadOnly ? !a.isRead : true))
    .filter((a: any) => (alertSearch ? String(a.message).toLowerCase().includes(alertSearch.toLowerCase()) : true)),
    (alert: any) => alert.createdAt,
    alertSortDir
  );

  const pagedAlerts = filteredAlerts.slice((alertPage - 1) * alertLimit, alertPage * alertLimit);
  const totalAlertPages = Math.max(1, Math.ceil(filteredAlerts.length / alertLimit));

  const markAlertRead = async (id: string) => {
    setBusyAlertId(id);
    try {
      await alertsApi.markRead(id);
      setAlerts((prev) => prev.map((a: any) => (a.id === id ? { ...a, isRead: true } : a)));
    } finally {
      setBusyAlertId(null);
    }
  };

  const deleteAlert = async (id: string) => {
    setBusyAlertId(id);
    try {
      await alertsApi.delete(id);
      setAlerts((prev) => prev.filter((a: any) => a.id !== id));
    } finally {
      setBusyAlertId(null);
    }
  };

  if (loading) return <Spinner />;

  const metrics = [
    {
      title: "Low Stock Alerts",
      value: dashboard?.lowStockProducts ?? "—",
      helper: "Products below threshold",
      icon: <RiAlertLine className="text-xl" />,
      color: "text-rose-600", bg: "bg-rose-50",
    },
    {
      title: "Today's Revenue",
      value: dashboard?.todayRevenue != null
        ? `RWF ${Number(dashboard.todayRevenue).toLocaleString()}`
        : "—",
      helper: `${dashboard?.todaySalesCount ?? 0} transactions today`,
      icon: <RiStockLine className="text-xl" />,
      color: "text-emerald-700", bg: "bg-emerald-50",
    },
    {
      title: "Inflation Watch",
      value: economic?.inflationRate ? `${economic.inflationRate}%` : "—",
      helper: economic?.recommendation?.slice(0, 50) + "…" ?? "Loading…",
      icon: <RiExchangeDollarLine className="text-xl" />,
      color: "text-amber-700", bg: "bg-amber-50",
    },
    {
      title: "Total Products",
      value: dashboard?.totalProducts ?? "—",
      helper: `${dashboard?.totalCategories ?? 0} categories tracked`,
      icon: <RiShieldCheckLine className="text-xl" />,
      color: "text-sky-700", bg: "bg-sky-50",
    },
  ];

  return (
    <div className="space-y-7 pb-8">
      <div className="flex flex-col gap-1 pt-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E514F]/50">Overview</p>
        <h1 className="text-3xl font-bold text-[#0E514F] tracking-tight">Good morning, Manager</h1>
        <p className="text-sm text-slate-500 flex items-center gap-1.5">
          <RiTimeLine className="text-[#0E514F]" />
          FIFO active — system tracking live
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.title} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{m.title}</p>
                <p className="text-2xl font-bold text-slate-900">{m.value}</p>
                <p className={`text-xs font-medium ${m.color}`}>{m.helper}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${m.bg} ${m.color} shrink-0`}>
                {m.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Alerts */}
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E514F]/60">Sales trend</p>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">Weekly revenue</h2>
            </div>
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
              <RiBarChartLine /> Last 7 days
            </span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0E514F" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0E514F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v: number) => [`RWF ${v.toLocaleString()}`, ""]} />
                <Area type="monotone" dataKey="value" name="Revenue" stroke="#0E514F" fill="url(#gActual)" strokeWidth={2.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-slate-400">No sales data yet</div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E514F]/60">Alerts</p>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">Action queue</h2>
            </div>
            <span className="text-xs bg-[#FFF5B3] text-[#0E514F] font-semibold px-3 py-1 rounded-full">{filteredAlerts.length} items</span>
          </div>

          <div className="grid gap-2 mb-4">
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={alertSearch}
                onChange={(e) => { setAlertSearch(e.target.value); setAlertPage(1); }}
                placeholder="Search alerts"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs outline-none focus:border-[#0E514F]"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={alertType}
                onChange={(e) => { setAlertType(e.target.value); setAlertPage(1); }}
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs outline-none focus:border-[#0E514F]"
              >
                <option value="">All types</option>
                {Object.keys(priorityColor).filter((k) => k === k.toUpperCase()).map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                ))}
              </select>
              <button
                onClick={() => { setAlertUnreadOnly((v) => !v); setAlertPage(1); }}
                className={`rounded-lg border px-2 py-2 text-xs font-semibold ${alertUnreadOnly ? "border-[#0E514F] text-[#0E514F] bg-[#0E514F]/5" : "border-slate-200 text-slate-500 bg-slate-50"}`}
              >
                Unread only
              </button>
              <button
                onClick={() => { setAlertSortDir((dir) => dir === "asc" ? "desc" : "asc"); setAlertPage(1); }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-semibold text-slate-600"
              >
                {alertSortDir === "asc" ? "Oldest" : "Newest"}
              </button>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            {pagedAlerts.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No active alerts</p>
            ) : pagedAlerts.map((alert: any) => (
              <div key={alert.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${priorityColor[alert.type] ?? priorityColor.Low}`}>
                  {alert.type?.replace("_", " ")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-600 leading-5">{alert.message}</p>
                  <div className="flex gap-2 mt-2">
                    {!alert.isRead && (
                      <button
                        onClick={() => markAlertRead(alert.id)}
                        disabled={busyAlertId === alert.id}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 hover:underline disabled:opacity-60"
                      >
                        <RiCheckDoubleLine /> Mark read
                      </button>
                    )}
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      disabled={busyAlertId === alert.id}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 hover:underline disabled:opacity-60"
                    >
                      <RiDeleteBin6Line /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 mt-3">
            <div className="pb-3 text-[11px]">
              <button
                onClick={() => { refreshAlerts(); }}
                disabled={loadingAlerts}
                className="font-semibold text-[#0E514F] hover:underline disabled:opacity-60"
              >
                Refresh
              </button>
            </div>
            <CollectionFooter
              page={alertPage}
              totalPages={totalAlertPages}
              total={filteredAlerts.length}
              limit={alertLimit}
              onPageChange={setAlertPage}
              label={`Page ${alertPage} of ${totalAlertPages}`}
            />
          </div>
        </div>
      </div>

      {/* Live stock snapshot */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E514F]/60">Inventory</p>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">Live stock snapshot</h2>
          </div>
          <Link to="/inventory" className="flex items-center gap-1.5 text-xs font-semibold text-[#0E514F] hover:underline">
            View all <RiArrowRightLine />
          </Link>
        </div>

        <div className="px-6 py-3 border-b border-slate-100 grid gap-2 md:grid-cols-5">
          <div className="md:col-span-2 relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={stockSearch}
              onChange={(e) => { setStockSearch(e.target.value); setStockPage(1); }}
              placeholder="Search stock..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs outline-none focus:border-[#0E514F]"
            />
          </div>
          <select
            value={stockCategoryId}
            onChange={(e) => { setStockCategoryId(e.target.value); setStockPage(1); }}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs outline-none focus:border-[#0E514F]"
          >
            <option value="">All categories</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={stockStatus}
            onChange={(e) => { setStockStatus(e.target.value); setStockPage(1); }}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs outline-none focus:border-[#0E514F]"
          >
            <option value="">All status</option>
            <option value="low">Low</option>
            <option value="out">Out</option>
            <option value="expiring">Expiring</option>
            <option value="expired">Expired</option>
          </select>
          <div className="flex gap-2">
            <select
              value={stockSortBy}
              onChange={(e) => setStockSortBy(e.target.value as "name" | "quantity" | "sellingPrice")}
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs outline-none focus:border-[#0E514F]"
            >
              <option value="name">Name</option>
              <option value="quantity">Qty</option>
              <option value="sellingPrice">Price</option>
            </select>
            <button
              onClick={() => setStockSortDir((d) => d === "asc" ? "desc" : "asc")}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-semibold text-slate-600"
            >
              {stockSortDir === "asc" ? "Asc" : "Desc"}
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {loadingProducts ? (
            <div className="h-[160px] flex items-center justify-center"><RiLoader4Line className="text-2xl text-[#0E514F] animate-spin" /></div>
          ) : products.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No products yet</p>
          ) : products.map((item: any) => {
            const status = getProductStatus(item);
            return (
              <div key={item.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot[status]}`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.sku} · {item.category?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.quantity}</p>
                    <p className="text-xs text-slate-400">units</p>
                  </div>
                  <div>
                    <p className={`text-xs font-semibold flex items-center gap-0.5 ${item.quantity > (item.lowStockThreshold ?? 0) ? "text-emerald-600" : "text-rose-500"}`}>
                      {item.quantity > (item.lowStockThreshold ?? 0) ? <RiArrowUpLine /> : <RiArrowDownLine />}
                      {item.quantity > (item.lowStockThreshold ?? 0) ? "good" : "low"}
                    </p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${
                    status === "healthy" ? "bg-emerald-50 text-emerald-700" :
                    status === "low" ? "bg-amber-50 text-amber-700" :
                    status === "expiring" ? "bg-orange-50 text-orange-700" :
                    "bg-rose-50 text-rose-700"
                  }`}>
                    {status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <CollectionFooter
          page={productMeta?.page ?? stockPage}
          totalPages={productMeta?.totalPages ?? 1}
          total={productMeta?.total ?? products.length}
          limit={stockLimit}
          onPageChange={setStockPage}
          onLimitChange={setStockLimit}
          limitOptions={[5, 10, 20]}
        />
      </div>
    </div>
  );
}
