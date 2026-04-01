import { useEffect, useMemo, useState } from "react";
import {
  RiArchiveDrawerLine, RiAlertLine, RiTimeLine, RiEqualizerLine,
  RiStockLine, RiArrowUpLine, RiArrowDownLine, RiSubtractLine,
  RiDownloadLine, RiLoader4Line, RiRefreshLine,
  RiSearchLine,
} from "react-icons/ri";
import { analyticsApi, categoriesApi, productsApi } from "../api/services";
import CollectionFooter from "../components/CollectionFooter";
import { normalizeText, paginateItems, sortItems } from "../utils/collection";

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
  const [categoryStats, setCategoryStats] = useState<Record<string, { totalUnits: number; topProduct: string }>>({});
  const [inventoryStatus, setInventoryStatus] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "quantity" | "sellingPrice" | "expiryDate">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [meta, setMeta] = useState<{ page: number; totalPages: number; total: number } | null>(null);
  const [trackingProduct, setTrackingProduct] = useState<any>(null);
  const [stockLogs, setStockLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [categorySortDir, setCategorySortDir] = useState<"asc" | "desc">("asc");
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryLimit, setCategoryLimit] = useState(6);

  useEffect(() => {
    Promise.all([
      categoriesApi.getAll(),
      analyticsApi.getInventoryStatus(),
      analyticsApi.getTopProducts(3, "30d"),
    ]).then(([cats, status, top]) => {
      const categoryList = cats.data.data ?? [];
      setCategories(categoryList);
      setInventoryStatus(status.data.data);
      setTopProducts(top.data.data ?? []);

      Promise.all(categoryList.map((c: any) => categoriesApi.getById(c.id)))
        .then((results) => {
          const stats: Record<string, { totalUnits: number; topProduct: string }> = {};
          for (const res of results) {
            const cat = res.data.data;
            const items = cat.products ?? [];
            const totalUnits = items.reduce((s: number, p: any) => s + (p.quantity ?? 0), 0);
            const topProduct = [...items].sort((a: any, b: any) => (b.quantity ?? 0) - (a.quantity ?? 0))[0]?.name ?? "—";
            stats[cat.id] = { totalUnits, topProduct };
          }
          setCategoryStats(stats);
        })
        .catch(console.error);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoadingProducts(true);
    productsApi.getAll({
      search: search || undefined,
      categoryId: selectedCategoryId || undefined,
      stockStatus: selectedStatus || undefined,
      sortBy,
      sortDir,
      page,
      limit,
    }).then((prods) => {
      setProducts(prods.data.data?.products ?? []);
      setMeta(prods.data.data?.meta ?? null);
    }).catch(console.error).finally(() => setLoadingProducts(false));
  }, [search, selectedCategoryId, selectedStatus, sortBy, sortDir, page, limit]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedCategoryId, selectedStatus, limit]);

  const refreshProducts = () => {
    setLoadingProducts(true);
    productsApi.getAll({
      search: search || undefined,
      categoryId: selectedCategoryId || undefined,
      stockStatus: selectedStatus || undefined,
      page,
      limit,
    }).then((prods) => {
      setProducts(prods.data.data?.products ?? []);
      setMeta(prods.data.data?.meta ?? null);
    }).catch(console.error).finally(() => setLoadingProducts(false));
  };

  const loadLogs = (product: any) => {
    setTrackingProduct(product);
    setLoadingLogs(true);
    productsApi.getStockLogs(product.id)
      .then((res) => setStockLogs(res.data.data ?? []))
      .catch(() => setStockLogs([]))
      .finally(() => setLoadingLogs(false));
  };

  const summary = useMemo(() => {
    const totalUnits = Object.values(categoryStats).reduce((s, c) => s + c.totalUnits, 0);
    const lowOrCritical = (inventoryStatus?.summary?.low ?? 0) + (inventoryStatus?.summary?.outOfStock ?? 0);
    const expiringSoon = inventoryStatus?.summary?.expiringSoon ?? 0;
    return { totalUnits, lowOrCritical, expiringSoon };
  }, [categoryStats, inventoryStatus]);

  const expiring = useMemo(() =>
    [...products]
      .filter((p: any) => p.expiryDate)
      .sort((a: any, b: any) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
      .slice(0, 3),
    [products]
  );
  const pagedCategories = useMemo(() => {
    const filtered = categories.filter((cat: any) =>
      !categorySearch || [cat.name, categoryStats[cat.id]?.topProduct].map(normalizeText).join(" ").includes(normalizeText(categorySearch))
    );

    return paginateItems(sortItems(filtered, (cat: any) => cat.name, categorySortDir), categoryPage, categoryLimit);
  }, [categories, categoryPage, categoryLimit, categorySearch, categorySortDir, categoryStats]);

  useEffect(() => {
    setCategoryPage(1);
  }, [categorySearch, categorySortDir, categoryLimit]);

  const handleExportSnapshot = () => {
    setExporting(true);
    try {
      const payload = {
        generatedAt: new Date().toISOString(),
        summary,
        categories,
        topProducts,
        products,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `inventory-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <Spinner />;

  const summaryCards = [
    { label: "Total units", value: summary.totalUnits.toLocaleString(), sub: "All active categories", icon: <RiArchiveDrawerLine className="text-xl" />, color: "text-[#0E514F]", bg: "bg-[#FFF5B3]" },
    { label: "Low & critical", value: String(summary.lowOrCritical), sub: "Need urgent reorder", icon: <RiAlertLine className="text-xl" />, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Expiring in 30 days", value: String(summary.expiringSoon), sub: "Promote or rotate first", icon: <RiTimeLine className="text-xl" />, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Total SKUs", value: String(inventoryStatus?.summary?.total ?? 0), sub: "Active products", icon: <RiEqualizerLine className="text-xl" />, color: "text-sky-600", bg: "bg-sky-50" },
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
        <div className="flex gap-2">
          <button
            onClick={refreshProducts}
            disabled={loadingProducts}
            className="inline-flex items-center gap-2 rounded-xl border border-[#0E514F]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#0E514F] hover:bg-[#0E514F]/5 transition disabled:opacity-60"
          >
            <RiRefreshLine /> Refresh
          </button>
          <button
            onClick={handleExportSnapshot}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0E514F] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition shrink-0 disabled:opacity-60"
          >
            <RiDownloadLine /> Export snapshot
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-5">
          <div className="md:col-span-2 relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, SKU, barcode..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#0E514F]"
            />
          </div>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0E514F]"
          >
            <option value="">All categories</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0E514F]"
          >
            <option value="">All status</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
            <option value="expiring">Expiring</option>
            <option value="expired">Expired</option>
          </select>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "quantity" | "sellingPrice" | "expiryDate")}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0E514F]"
            >
              <option value="name">Sort: Name</option>
              <option value="quantity">Sort: Quantity</option>
              <option value="sellingPrice">Sort: Price</option>
              <option value="expiryDate">Sort: Expiry</option>
            </select>
            <button
              onClick={() => setSortDir((d) => d === "asc" ? "desc" : "asc")}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-600"
            >
              {sortDir === "asc" ? "Asc" : "Desc"}
            </button>
          </div>
        </div>
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
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E514F]/50">Categories</p>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">Product groups</h2>
          </div>
          <div className="flex gap-2">
            <input
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder="Search categories"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#0E514F]"
            />
            <button
              onClick={() => setCategorySortDir((dir) => dir === "asc" ? "desc" : "asc")}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600"
            >
              {categorySortDir === "asc" ? "A-Z" : "Z-A"}
            </button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pagedCategories.items.map((cat: any) => {
            const stats = categoryStats[cat.id] ?? { totalUnits: 0, topProduct: "—" };
            return (
              <div key={cat.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[#0E514F] bg-[#E6FFFA]">
                    <RiArchiveDrawerLine className="text-xl" />
                  </div>
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                    {cat._count?.products ?? 0} SKUs
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#0E514F]">{cat.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{stats.totalUnits} units in pool</p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Top product</span>
                  <span className="font-semibold text-slate-700 truncate max-w-[120px]">
                    {stats.topProduct}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <CollectionFooter
          page={pagedCategories.meta.page}
          totalPages={pagedCategories.meta.totalPages}
          total={pagedCategories.meta.total}
          limit={categoryLimit}
          onPageChange={setCategoryPage}
          onLimitChange={setCategoryLimit}
          limitOptions={[6, 9, 12]}
        />
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
                      <button
                        onClick={() => loadLogs(item)}
                        className="mt-1.5 text-[11px] font-semibold text-[#0E514F] hover:underline"
                      >
                        Track movement
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <CollectionFooter
          page={meta?.page ?? page}
          totalPages={meta?.totalPages ?? 1}
          total={meta?.total ?? products.length}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
          limitOptions={[10, 12, 20, 50]}
        />
      </div>

      {trackingProduct && (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E514F]/50">Trace</p>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">Movement history: {trackingProduct.name}</h2>
            </div>
            <button
              onClick={() => setTrackingProduct(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Close
            </button>
          </div>
          {loadingLogs ? (
            <div className="py-10 flex items-center justify-center"><RiLoader4Line className="animate-spin text-2xl text-[#0E514F]" /></div>
          ) : stockLogs.length === 0 ? (
            <p className="px-6 py-8 text-sm text-slate-400 text-center">No stock movements found for this product.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Type", "Quantity", "Previous", "New", "Reason", "Date"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stockLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5 text-xs font-semibold text-slate-700">{log.type}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-700">{log.quantity}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{log.previousQty}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-slate-800">{log.newQty}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{log.reason || "—"}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

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
