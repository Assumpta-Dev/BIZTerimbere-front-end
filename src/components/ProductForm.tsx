import { useState } from "react";
import { categories } from "../data/data";
import { RiAddLine, RiArchiveDrawerLine } from "react-icons/ri";

export default function ProductForm() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [quantity, setQuantity] = useState(10);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E514F]/50">Quick add</p>
        <h3 className="text-lg font-bold text-slate-900 mt-0.5">Inventory Add</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              selectedCategory === c.id
                ? "bg-[#0E514F] text-white border-[#0E514F]"
                : "border-slate-200 text-slate-600 hover:border-[#0E514F]/30 hover:bg-slate-50"
            }`}
          >
            <RiArchiveDrawerLine className="text-sm" />
            {c.name}
          </button>
        ))}
      </div>

      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span className="font-medium">Quantity</span>
          <span className="font-bold text-[#0E514F]">{quantity} units</span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full accent-[#0E514F]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1">Manufactured</label>
          <input type="date" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0E514F] focus:ring-2 focus:ring-[#0E514F]/10 transition" />
        </div>
        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1">Expiry date</label>
          <input type="date" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0E514F] focus:ring-2 focus:ring-[#0E514F]/10 transition" />
        </div>
      </div>

      <button className="w-full flex items-center justify-center gap-2 bg-[#0E514F] text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition">
        <RiAddLine className="text-base" /> Add to Stock
      </button>
    </div>
  );
}
