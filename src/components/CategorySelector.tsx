export default function CategorySelector({ categories, setCategory }: any) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((c: any) => (
        <button
          key={c.id ?? c}
          onClick={() => setCategory(c.id ?? c)}
          className="px-3 py-1 border rounded-full"
        >
          {c.name ?? c}
        </button>
      ))}
    </div>
  );
}
