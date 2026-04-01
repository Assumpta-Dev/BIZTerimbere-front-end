export type SortDirection = "asc" | "desc";

export const normalizeText = (value: unknown) => String(value ?? "").toLowerCase();

export const compareValues = (left: unknown, right: unknown) => {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  const leftDate = left instanceof Date ? left.getTime() : Date.parse(String(left));
  const rightDate = right instanceof Date ? right.getTime() : Date.parse(String(right));
  if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate)) {
    return leftDate - rightDate;
  }

  return String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: "base" });
};

export const sortItems = <T>(
  items: T[],
  accessor: (item: T) => unknown,
  direction: SortDirection = "asc"
) => {
  const factor = direction === "asc" ? 1 : -1;
  return [...items].sort((a, b) => compareValues(accessor(a), accessor(b)) * factor);
};

export const paginateItems = <T>(items: T[], page: number, limit: number) => {
  const safeLimit = Math.max(1, limit);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * safeLimit;

  return {
    items: items.slice(start, start + safeLimit),
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      start: total === 0 ? 0 : start + 1,
      end: Math.min(start + safeLimit, total),
    },
  };
};
