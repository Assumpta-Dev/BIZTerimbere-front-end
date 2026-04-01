import React, { useState } from "react";
import { FiPlus } from "react-icons/fi";

const PlusIcon = FiPlus as React.ComponentType;
const CATEGORIES = ["Dairy", "Bakery", "Produce", "Meat", "Canned Goods"];

const ProductEntry = () => {
  const [qty, setQty] = useState(10);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-brand mb-6">Quick Inventory Add</h3>

      <div className="space-y-6">
        {/* Category Selection */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className="px-4 py-2 rounded-full border border-gray-200 hover:bg-brand hover:text-white transition-colors text-sm"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Quantity Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Quantity
            </label>
            <span className="text-brand font-bold">{qty} units</span>
          </div>
          <input
            type="range"
            min="0"
            max="500"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand"
          />
        </div>

        {/* Date Selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 uppercase">
              Manufactured
            </label>
            <input
              type="date"
              className="w-full mt-1 p-2 border rounded-lg focus:ring-brand outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase">
              Expiry Date
            </label>
            <input
              type="date"
              className="w-full mt-1 p-2 border rounded-lg focus:ring-brand outline-none"
            />
          </div>
        </div>

        <button className="w-full py-4 bg-brand text-white rounded-xl font-bold flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity">
          <PlusIcon /> <span>Add to Stock</span>
        </button>
      </div>
    </div>
  );
};

export default ProductEntry;
