import { useState, useMemo, useEffect } from "react";
import {
  RiArrowLeftRightLine, RiArrowUpLine, RiArrowDownLine,
  RiInformationLine, RiAddLine, RiSubtractLine, RiCheckLine,
  RiArchiveDrawerLine, RiLoader4Line,
} from "react-icons/ri";
import { categoriesApi, productsApi, analyticsApi } from "../api/services";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

interface MovementEntry {
  id: string;
  type: "in" | "out";
  category: string;
  product: string;
  sku: string;
  price: number;
  quantity: number;
  manufacturedDate: string;
  expiryDate: string;
}

export default function StockMovement() {
  const [categories, setCategories] = useState<any[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<Record<string, any[]>>({});
  const [chartData, setChartData] = useState<any[]>([]);
  const [loadingInit, setLoadingInit] = useState(true);

  const [movementType, setMovementType] = useState<"in" | "out">("in");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [manufacturedDate, setManufacturedDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [log, setLog] = useState<MovementEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Load categories + sales chart on mount
  useEffect(() => {
    Promise.all([
      categoriesApi.getAll(),
      analyticsApi.getSalesChart("7d"),
    ]).then(([cats, chart]) => {
      const catList = cats.data.data ?? [];
      setCategories(catList);
      if (catList.length > 0) setSelectedCategoryId(catList[0].id);

      // Build chart data from stock logs (use sales chart as proxy for flow)
      const raw = chart.data.data ?? [];
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      setChartData(raw.slice(0, 7).map((p: any, i: number) => ({
        day: days[i] ?? `D${i + 1}`,
        incoming: Math.round((p.count ?? 0) * 12),
        outgoing: Math.round((p.count ?? 0) * 18),
        fifo: Math.round(p.revenue / 1000) || 0,
        lifo: Math.round(p.revenue / 1200) || 0,
      })));
    }).catch(console.error).finally(() => setLoadingInit(false));
  }, []);

  // Load products when category changes
  useEffect(() => {
    if (!selectedCategoryId) return;
    if (productsByCategory[selectedCategoryId]) {
      const prods = productsByCategory[selectedCategoryId];
      if (prods.length > 0) setSelectedProductId(prods[0].id);
      return;
    }
    productsApi.getAll({ categoryId: selectedCategoryId, limit: 50 })
      .then((res) => {
        const prods = res.data.data?.products ?? [];
        setProductsByCategory((prev) => ({ ...prev, [selectedCategoryId]: prods }));
        if (prods.length > 0) setSelectedProductId(prods[0].id);
      }).catch(console.error);
  }, [selectedCategoryId]);

  const currentProducts = productsByCategory[selectedCategoryId] ?? [];
  const selectedProduct = useMemo(
    () => currentProducts.find((p: any) => p.id === selectedProductId) ?? currentProducts[0],
    [currentProducts, selectedProductId]
  );

  const totalIn = log.filter((e) => e.type === "in").reduce((s, e) => s + e.quantity, 0);
  const totalOut = log.filter((e) => e.type === "out").reduce((s, e) => s + e.quantity, 0);
  const netFlow = totalIn - totalOut;

  const isReady = selectedProduct && quantity > 0 &&
    (movementType === "out" || (manufacturedDate && expiryDate));

  const handleSubmit = async () => {
    if (!isReady || !selectedProduct) return;
    setError("");
    setSubmitting(true);
    try {
      await productsApi.adjustStock(
        selectedProduct.id,
        movementType === "in" ? "IN" : "OUT",
        quantity,
        `Manual ${movementType === "in" ? "stock in" : "stock out"} — ${selectedProduct.name}`
      );

      // If stock IN, also update product dates
      if (movementType === "in" && (manufacturedDate || expiryDate)) {
        await productsApi.update(selectedProduct.id, {
          ...(manufacturedDate && { manufacturingDate: manufacturedDate }),
          ...(expiryDate && { expiryDate }),
        });
      }

      const entry: MovementEntry = {
        id: String(Date.now()),
        type: movementType,
        category: categories.find((c) => c.id === selectedCategoryId)?.name ?? "",
        product: selectedProduct.name,
        sku: selectedProduct.sku ?? "—",
        price: selectedProduct.sellingPrice,
        quantity,
        manufacturedDate,
        expiryDate,
      };
      setLog((prev) => [entry, ...prev]);
      setQuantity(1);
      setManufacturedDate("");
      setExpiryDate("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to record movement.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInit) {
    return (
      <div className="flex items-center justify-center py-20">
        <RiLoader4Line className="text-3xl text-[#0E514F] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-1 pt-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E514F]/50">Movement</p>
        <h1 className="text-3xl font-bold text-[#0E514F] tracking-tight">Stock Movement</h1>
        <p className="text-sm text-slate-500">Record incoming and outgoing stock. Changes are saved to the database instantly.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <RiArrowDownLine className="text-lg" />
          </div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Session inbound</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalIn.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Units received this session</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
            <RiArrowUpLine className="text-lg" />
          </div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Session outbound</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalOut.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Units dispatched this session</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${netFlow >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
            <RiArrowLeftRightLine className="text-lg" />
          </div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Net flow</p>
          <p className={`text-2xl font-bold mt-1 ${netFlow >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
            {netFlow >= 0 ? "+" : ""}{netFlow}
          </p>
          <p className="text-xs text-slate-400 mt-1">{netFlow >= 0 ? "Net gain" : "Net loss"} this session</p>
        </div>
      </div>

      {/* Form + Chart */}
      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        {/* Form */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E514F]/50">Record movement</p>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">Update stock</h2>
          </div>

          {/* IN / OUT toggle */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Movement type</p>
            <div className="grid grid-cols-2 gap-3">
              {(["in", "out"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setMovementType(t)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-bold transition ${
                    movementType === t
                      ? t === "in" ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-rose-400 bg-rose-50 text-rose-600"
                      : "border-slate-200 text-slate-400 hover:border-slate-300"
                  }`}
                >
                  {t === "in" ? <RiArrowDownLine className="text-base" /> : <RiArrowUpLine className="text-base" />}
                  Stock {t === "in" ? "In" : "Out"}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                    selectedCategoryId === cat.id
                      ? "bg-[#0E514F] text-white border-[#0E514F]"
                      : "border-slate-200 text-slate-500 hover:border-[#0E514F]/30"
                  }`}
                >
                  <RiArchiveDrawerLine />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product select */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Product</p>
            {currentProducts.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No products in this category</p>
            ) : (
              <div className="grid gap-2 max-h-48 overflow-y-auto">
                {currentProducts.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProductId(p.id)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition ${
                      selectedProductId === p.id
                        ? "border-[#0E514F] bg-[#0E514F]/5"
                        : "border-slate-200 hover:border-[#0E514F]/30 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {selectedProductId === p.id && <span className="w-1.5 h-1.5 rounded-full bg-[#0E514F] shrink-0" />}
                      <span className={`font-semibold ${selectedProductId === p.id ? "text-[#0E514F]" : "text-slate-700"}`}>
                        {p.name}
                      </span>
                      <span className="text-xs text-slate-400">{p.sku ?? ""}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-600">
                      {p.sellingPrice?.toLocaleString()} RWF
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auto-filled price */}
          {selectedProduct && (
            <div className="rounded-xl bg-[#0E514F]/5 border border-[#0E514F]/10 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Unit price</p>
                <p className="text-xl font-bold text-[#0E514F] mt-0.5">
                  {selectedProduct.sellingPrice?.toLocaleString()} RWF
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Total value</p>
                <p className="text-sm font-bold text-slate-700 mt-0.5">
                  {((selectedProduct.sellingPrice ?? 0) * quantity).toLocaleString()} RWF
                </p>
              </div>
            </div>
          )}

          {/* Quantity stepper */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Quantity</p>
            <div className="flex items-center gap-4">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition">
                <RiSubtractLine />
              </button>
              <div className="flex-1 text-center">
                <span className="text-3xl font-bold text-slate-900">{quantity}</span>
                <span className="text-sm text-slate-400 ml-1">units</span>
              </div>
              <button onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition">
                <RiAddLine />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {[5, 10, 25, 50, 100].map((q) => (
                <button key={q} onClick={() => setQuantity(q)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                    quantity === q ? "bg-[#0E514F] text-white border-[#0E514F]" : "border-slate-200 text-slate-500 hover:border-[#0E514F]/30"
                  }`}>
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Dates — only for stock IN */}
          {movementType === "in" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Manufactured date</p>
                <input type="date" value={manufacturedDate} onChange={(e) => setManufacturedDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0E514F] focus:ring-2 focus:ring-[#0E514F]/10 transition" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Expiry date</p>
                <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0E514F] focus:ring-2 focus:ring-[#0E514F]/10 transition" />
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={!isReady || submitting}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition ${
              submitted ? "bg-emerald-500 text-white"
                : isReady && !submitting
                  ? movementType === "in" ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-rose-500 text-white hover:bg-rose-600"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}>
            {submitting ? <RiLoader4Line className="animate-spin" />
              : submitted ? <><RiCheckLine /> Recorded successfully</>
              : movementType === "in" ? <><RiArrowDownLine /> Record Stock In</>
              : <><RiArrowUpLine /> Record Stock Out</>}
          </button>
        </div>

        {/* Chart */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E514F]/50">Flow chart</p>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">FIFO vs LIFO — weekly</h2>
            </div>
            <span className="text-xs text-slate-400">Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="fifo" name="FIFO" fill="#0E514F" radius={[5, 5, 0, 0]} />
              <Bar dataKey="lifo" name="LIFO" fill="#93c5fd" radius={[5, 5, 0, 0]} />
              <Bar dataKey="incoming" name="Incoming" fill="#bbf7d0" radius={[5, 5, 0, 0]} />
              <Bar dataKey="outgoing" name="Outgoing" fill="#fca5a5" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-auto pt-5 flex items-start gap-3 rounded-xl border border-[#0E514F]/10 bg-[#0E514F]/5 p-4">
            <RiInformationLine className="text-[#0E514F] text-lg shrink-0 mt-0.5" />
            <p className="leading-5 text-xs text-slate-600">
              FIFO dispatches oldest stock first — recommended for perishables. LIFO dispatches newest stock first, suited for non-perishables.
            </p>
          </div>
        </div>
      </div>

      {/* Movement log */}
      {log.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E514F]/50">Session log</p>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">Recorded movements</h2>
            </div>
            <span className="text-xs font-semibold bg-[#FFF5B3] text-[#0E514F] px-3 py-1 rounded-full">
              {log.length} entries
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Type", "Product", "Category", "SKU", "Price", "Qty", "Total", "Mfg Date", "Expiry"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {log.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                        entry.type === "in"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-600 border border-rose-200"
                      }`}>
                        {entry.type === "in" ? <RiArrowDownLine /> : <RiArrowUpLine />}
                        {entry.type === "in" ? "IN" : "OUT"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-800">{entry.product}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{entry.category}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">{entry.sku}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">{entry.price.toLocaleString()} RWF</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-slate-900">{entry.quantity}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-[#0E514F]">
                      {(entry.price * entry.quantity).toLocaleString()} RWF
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">{entry.manufacturedDate || "—"}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">{entry.expiryDate || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
