import api from "./client";

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  register: (name: string, businessName: string, email: string, password: string) =>
    api.post("/auth/register", { name, businessName, email, password }),

  getProfile: () => api.get("/auth/profile"),

  updateProfile: (data: { name?: string; businessName?: string }) =>
    api.put("/auth/profile", data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put("/auth/change-password", { currentPassword, newPassword }),
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll: () => api.get("/categories"),
  getById: (id: string) => api.get(`/categories/${id}`),
  create: (name: string, description?: string) =>
    api.post("/categories", { name, description }),
  update: (id: string, data: { name?: string; description?: string }) =>
    api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const productsApi = {
  getAll: (params?: {
    search?: string;
    categoryId?: string;
    stockStatus?: string;
    page?: number;
    limit?: number;
  }) => api.get("/products", { params }),

  getById: (id: string) => api.get(`/products/${id}`),

  getLowStock: () => api.get("/products/low-stock"),

  getExpiring: (days = 5) => api.get("/products/expiring", { params: { days } }),

  getByBarcode: (barcode: string) => api.get(`/products/barcode/${barcode}`),

  create: (data: {
    name: string;
    categoryId: string;
    sku?: string;
    costPrice: number;
    sellingPrice: number;
    quantity?: number;
    lowStockThreshold?: number;
    unit?: string;
    manufacturingDate?: string;
    expiryDate?: string;
    stockMethod?: "FIFO" | "LIFO";
    barcode?: string;
    supplier?: string;
    location?: string;
  }) => api.post("/products", data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/products/${id}`, data),

  delete: (id: string) => api.delete(`/products/${id}`),

  adjustStock: (
    id: string,
    type: "IN" | "OUT" | "ADJUSTMENT",
    quantity: number,
    reason?: string
  ) => api.patch(`/products/${id}/stock`, { type, quantity, reason }),

  getStockLogs: (id: string) => api.get(`/products/${id}/stock-logs`),
};

// ─── Sales ────────────────────────────────────────────────────────────────────
export const salesApi = {
  create: (
    items: { productId: string; quantity: number }[],
    paymentMode?: "CASH" | "MOBILE_MONEY" | "CARD" | "CREDIT",
    notes?: string
  ) => api.post("/sales", { items, paymentMode, notes }),

  getAll: (params?: {
    startDate?: string;
    endDate?: string;
    paymentMode?: string;
    page?: number;
    limit?: number;
  }) => api.get("/sales", { params }),

  getById: (id: string) => api.get(`/sales/${id}`),

  getToday: () => api.get("/sales/today"),

  delete: (id: string) => api.delete(`/sales/${id}`),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  getDashboard: () => api.get("/analytics/dashboard"),

  getSalesChart: (period: "7d" | "30d" | "90d" | "12m" = "7d") =>
    api.get("/analytics/sales-chart", { params: { period } }),

  getTopProducts: (limit = 3, period: "7d" | "30d" | "90d" = "30d") =>
    api.get("/analytics/top-products", { params: { limit, period } }),

  getCategoryBreakdown: (period: "7d" | "30d" = "30d") =>
    api.get("/analytics/categories", { params: { period } }),

  getInventoryStatus: () => api.get("/analytics/inventory-status"),

  getProfitAnalysis: (period: "7d" | "30d" | "90d" = "30d") =>
    api.get("/analytics/profit", { params: { period } }),
};

// ─── Economic ─────────────────────────────────────────────────────────────────
export const economicApi = {
  getIndicators: () => api.get("/economic/indicators"),
  getPriceSuggestions: () => api.get("/economic/price-suggestions"),
  getHistoricalInflation: (years = 5) =>
    api.get("/economic/historical-inflation", { params: { years } }),
  getExchangeRate: () => api.get("/economic/exchange-rate"),
};

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const alertsApi = {
  getAll: (unreadOnly = false) =>
    api.get("/alerts", { params: { unreadOnly } }),
  getUnreadCount: () => api.get("/alerts/unread-count"),
  markRead: (id: string) => api.patch(`/alerts/${id}/read`),
  markAllRead: () => api.patch("/alerts/mark-all-read"),
  runChecks: () => api.post("/alerts/run-checks"),
  delete: (id: string) => api.delete(`/alerts/${id}`),
};
