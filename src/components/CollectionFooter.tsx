import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";

interface CollectionFooterProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
  label?: string;
}

export default function CollectionFooter({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = [5, 10, 20],
  label,
}: CollectionFooterProps) {
  return (
    <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
      <div>{label ?? `Page ${page} of ${totalPages} (${total} items)`}</div>
      <div className="flex items-center gap-2">
        {onLimitChange && (
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1"
          >
            {limitOptions.map((option) => (
              <option key={option} value={option}>{option}/page</option>
            ))}
          </select>
        )}
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="rounded-lg border border-slate-200 px-2 py-1 disabled:opacity-40"
        >
          <RiArrowLeftSLine />
        </button>
        <span>{page}/{totalPages}</span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="rounded-lg border border-slate-200 px-2 py-1 disabled:opacity-40"
        >
          <RiArrowRightSLine />
        </button>
      </div>
    </div>
  );
}
