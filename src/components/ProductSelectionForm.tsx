import React, { useEffect, useMemo, useState } from "react";
import { Box, Check, Grid3x3, Plus, Tag, Calendar } from "lucide-react";
import { categories } from "../data/data";
import { CategoryRecord, ProductOption } from "../types";

interface ProductSelectionFormProps {
  onAddProduct?: (payload: {
    category: CategoryRecord;
    product: ProductOption;
    quantity: number;
    manufacturedDate: string;
    expiryDate: string;
    price: number;
  }) => void;
}

const quantityOptions = [10, 25, 50, 100, 250, 500];

const ProductSelectionForm: React.FC<ProductSelectionFormProps> = ({
  onAddProduct,
}) => {
  const initialCategory = categories[0] as CategoryRecord | undefined;
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialCategory?.id ?? "",
  );
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(
    quantityOptions[0],
  );
  const [manufacturedDate, setManufacturedDate] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");

  const selectedCategory = useMemo(
    () =>
      categories.find((category) => category.id === selectedCategoryId) as
        | CategoryRecord
        | undefined,
    [selectedCategoryId],
  );

  const categoryProducts = useMemo<ProductOption[]>(
    () => selectedCategory?.products ?? [],
    [selectedCategory],
  );

  useEffect(() => {
    const firstProduct = categoryProducts[0];
    setSelectedProductId(firstProduct?.sku ?? "");
  }, [selectedCategoryId, categoryProducts]);

  const selectedProduct = useMemo(
    () => categoryProducts.find((product) => product.sku === selectedProductId),
    [categoryProducts, selectedProductId],
  );

  const resolvedPrice = selectedProduct?.price ?? 0;
  const isReady = Boolean(
    selectedCategory && selectedProduct && manufacturedDate && expiryDate,
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !selectedCategory ||
      !selectedProduct ||
      !manufacturedDate ||
      !expiryDate
    ) {
      return;
    }

    onAddProduct?.({
      category: selectedCategory,
      product: selectedProduct,
      quantity: selectedQuantity,
      manufacturedDate,
      expiryDate,
      price: resolvedPrice,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-[#0E514F]/10 bg-[#FFFFFE] p-6 shadow-sm"
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0E514F]/60">
            Product intake
          </p>
          <h3 className="text-2xl font-bold text-[#0E514F]">
            Select stock details
          </h3>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF5B3] px-4 py-2 text-sm font-medium text-[#0E514F]">
          <Check />
          Guided, zero-typing workflow
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <label className="space-y-2">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Grid3x3 className="text-[#0E514F]" />
            Category
          </span>
          <select
            value={selectedCategoryId}
            onChange={(event) => setSelectedCategoryId(event.target.value)}
            className="w-full rounded-2xl border border-[#0E514F]/15 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0E514F] focus:ring-2 focus:ring-[#0E514F]/10"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Box className="text-[#0E514F]" />
            Product
          </span>
          <select
            value={selectedProductId}
            onChange={(event) => setSelectedProductId(event.target.value)}
            className="w-full rounded-2xl border border-[#0E514F]/15 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0E514F] focus:ring-2 focus:ring-[#0E514F]/10"
          >
            {categoryProducts.map((product) => (
              <option key={product.sku} value={product.sku}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Plus className="text-[#0E514F]" />
          Quantity
        </div>
        <div className="flex flex-wrap gap-3">
          {quantityOptions.map((quantity) => {
            const isActive = selectedQuantity === quantity;

            return (
              <button
                key={quantity}
                type="button"
                onClick={() => setSelectedQuantity(quantity)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? "bg-[#0E514F] text-[#FFFFFE] shadow-sm" : "border border-[#0E514F]/10 bg-white text-[#0E514F] hover:bg-[#FFF5B3]"}`}
              >
                {quantity} units
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <label className="space-y-2">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Calendar className="text-[#0E514F]" />
            Manufactured date
          </span>
          <input
            type="date"
            value={manufacturedDate}
            onChange={(event) => setManufacturedDate(event.target.value)}
            className="w-full rounded-2xl border border-[#0E514F]/15 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0E514F] focus:ring-2 focus:ring-[#0E514F]/10"
          />
        </label>

        <label className="space-y-2">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Calendar className="text-[#0E514F]" />
            Expiry date
          </span>
          <input
            type="date"
            value={expiryDate}
            onChange={(event) => setExpiryDate(event.target.value)}
            className="w-full rounded-2xl border border-[#0E514F]/15 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0E514F] focus:ring-2 focus:ring-[#0E514F]/10"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-[#0E514F]/10 bg-[#0E514F]/5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-[#0E514F]">
            <Tag />
            Auto-filled unit price
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {resolvedPrice.toLocaleString()} RWF
          </p>
          <p className="text-sm text-slate-500">
            Price updates automatically when a product is selected.
          </p>
        </div>

        <button
          type="submit"
          disabled={!isReady}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0E514F] px-5 py-3 text-sm font-semibold text-[#FFFFFE] shadow-sm transition hover:bg-[#0b4341] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus />
          Add Product
        </button>
      </div>
    </form>
  );
};

export default ProductSelectionForm;
