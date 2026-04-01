import { useEffect, useMemo, useState } from "react";
import {
  RiAlarmWarningLine,
  RiCheckDoubleLine,
  RiLoader4Line,
  RiRefreshLine,
  RiDeleteBin6Line,
  RiSearchLine,
} from "react-icons/ri";
import { alertsApi } from "../api/services";
import CollectionFooter from "../components/CollectionFooter";
import { normalizeText, paginateItems, sortItems } from "../utils/collection";

const badgeStyles: Record<string, string> = {
  LOW_STOCK: "bg-rose-50 text-rose-700 border border-rose-200",
  OUT_OF_STOCK: "bg-rose-50 text-rose-700 border border-rose-200",
  EXPIRY_SOON: "bg-amber-50 text-amber-700 border border-amber-200",
  EXPIRED: "bg-orange-50 text-orange-700 border border-orange-200",
  PRICE_SUGGESTION: "bg-sky-50 text-sky-700 border border-sky-200",
  INFLATION_ALERT: "bg-purple-50 text-purple-700 border border-purple-200",
};

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <RiLoader4Line className="text-3xl text-[#0E514F] animate-spin" />
    </div>
  );
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyAll, setBusyAll] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"createdAt" | "type" | "status">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const loadAlerts = async () => {
    const res = await alertsApi.getAll();
    setAlerts(res.data.data ?? []);
  };

  useEffect(() => {
    loadAlerts().catch(console.error).finally(() => setLoading(false));
  }, []);

  const unreadCount = useMemo(() => alerts.filter((a) => !a.isRead).length, [alerts]);
  const alertTypes = useMemo(
    () => Array.from(new Set(alerts.map((alert) => String(alert.type)).filter(Boolean))),
    [alerts]
  );
  const filteredAlerts = useMemo(() => {
    const items = alerts
      .filter((alert) => (selectedType ? alert.type === selectedType : true))
      .filter((alert) => (unreadOnly ? !alert.isRead : true))
      .filter((alert) => {
        if (!search) return true;
        const haystack = [alert.message, alert.type, alert.product?.name, alert.createdAt].map(normalizeText).join(" ");
        return haystack.includes(normalizeText(search));
      });

    const accessor = (alert: any) => {
      if (sortBy === "type") return alert.type;
      if (sortBy === "status") return alert.isRead ? 1 : 0;
      return alert.createdAt;
    };

    return sortItems(items, accessor, sortDir);
  }, [alerts, search, selectedType, unreadOnly, sortBy, sortDir]);
  const pagedAlerts = useMemo(() => paginateItems(filteredAlerts, page, limit), [filteredAlerts, page, limit]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedType, unreadOnly, sortBy, sortDir, limit]);

  const markRead = async (id: string) => {
    setBusyId(id);
    try {
      await alertsApi.markRead(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
    } finally {
      setBusyId(null);
    }
  };

  const markAllRead = async () => {
    setBusyAll(true);
    try {
      await alertsApi.markAllRead();
      setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    } finally {
      setBusyAll(false);
    }
  };

  const runChecks = async () => {
    setBusyAll(true);
    try {
      await alertsApi.runChecks();
      await loadAlerts();
    } finally {
      setBusyAll(false);
    }
  };

  const removeAlert = async (id: string) => {
    setBusyId(id);
    try {
      await alertsApi.delete(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-7 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E514F]/50">Notifications</p>
          <h1 className="text-3xl font-bold text-[#0E514F] tracking-tight mt-0.5">Alerts Center</h1>
          <p className="text-sm text-slate-500 mt-1">Review stock, expiry, pricing, and inflation alerts.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runChecks}
            disabled={busyAll}
            className="inline-flex items-center gap-2 rounded-xl border border-[#0E514F]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#0E514F] hover:bg-[#0E514F]/5 disabled:opacity-60"
          >
            <RiRefreshLine /> Run checks
          </button>
          <button
            onClick={markAllRead}
            disabled={busyAll || unreadCount === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0E514F] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            <RiCheckDoubleLine /> Mark all read
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">All alerts</h2>
          <span className="text-xs font-semibold bg-[#FFF5B3] text-[#0E514F] px-3 py-1 rounded-full">
            {filteredAlerts.length} visible
          </span>
        </div>

        <div className="px-6 py-4 border-b border-slate-100 grid gap-3 lg:grid-cols-[1.3fr_repeat(4,minmax(0,1fr))]">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alerts or products"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#0E514F]"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0E514F]"
          >
            <option value="">All types</option>
            {alertTypes.map((type) => (
              <option key={type} value={type}>{type.replace(/_/g, " ")}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "createdAt" | "type" | "status")}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0E514F]"
          >
            <option value="createdAt">Sort: Latest</option>
            <option value="type">Sort: Type</option>
            <option value="status">Sort: Status</option>
          </select>
          <button
            onClick={() => setSortDir((dir) => dir === "asc" ? "desc" : "asc")}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-600"
          >
            {sortDir === "asc" ? "Asc" : "Desc"}
          </button>
          <button
            onClick={() => setUnreadOnly((value) => !value)}
            className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${unreadOnly ? "border-[#0E514F] bg-[#0E514F]/5 text-[#0E514F]" : "border-slate-200 bg-slate-50 text-slate-600"}`}
          >
            {unreadOnly ? "Unread only" : `${unreadCount} unread`}
          </button>
        </div>

        {pagedAlerts.items.length === 0 ? (
          <p className="px-6 py-10 text-sm text-slate-400 text-center">No alerts yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {pagedAlerts.items.map((alert) => (
              <div key={alert.id} className={`px-6 py-4 flex items-start gap-4 ${alert.isRead ? "bg-white" : "bg-slate-50/70"}`}>
                <div className="w-9 h-9 rounded-xl bg-[#0E514F]/10 text-[#0E514F] flex items-center justify-center shrink-0 mt-0.5">
                  <RiAlarmWarningLine />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeStyles[alert.type] ?? "bg-slate-100 text-slate-600"}`}>
                      {String(alert.type).replace(/_/g, " ")}
                    </span>
                    {!alert.isRead && <span className="text-[10px] font-bold text-emerald-700">NEW</span>}
                  </div>
                  <p className="text-sm text-slate-700 leading-6">{alert.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(alert.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!alert.isRead && (
                    <button
                      onClick={() => markRead(alert.id)}
                      disabled={busyId === alert.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                    >
                      <RiCheckDoubleLine /> Read
                    </button>
                  )}
                  <button
                    onClick={() => removeAlert(alert.id)}
                    disabled={busyId === alert.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                  >
                    <RiDeleteBin6Line /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <CollectionFooter
          page={pagedAlerts.meta.page}
          totalPages={pagedAlerts.meta.totalPages}
          total={pagedAlerts.meta.total}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
          limitOptions={[10, 20, 30]}
        />
      </div>
    </div>
  );
}
