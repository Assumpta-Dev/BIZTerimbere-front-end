export default function QuantitySlider({ quantity, setQuantity }: any) {
  return (
    <div>
      <input
        type="range"
        min="1"
        max="100"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="w-full accent-[#0E514F]"
      />
      <p className="text-right">{quantity} units</p>
    </div>
  );
}
