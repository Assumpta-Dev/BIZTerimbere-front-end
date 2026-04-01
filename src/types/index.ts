export interface ProductOption {
  name: string;
  price: number;
  sku: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  icon: string;
  color: string;
  products: ProductOption[];
}

export interface StockInsight {
  label: string;
  value: string;
  change?: string;
  tone: "primary" | "warning" | "success" | "danger";
}

export interface ProductInventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  systemStock: number;
  physicalStock: number;
  threshold: number;
  price: number;
  costPrice: number;
  manufacturedDate: string;
  expiryDate: string;
  trend: "rising" | "stable" | "declining";
  status: "healthy" | "low" | "expiring" | "critical";
  location: string;
  dailySales: number;
}

export interface DashboardMetric {
  title: string;
  value: string;
  helper: string;
  icon: string;
  color: string;
  bg: string;
}

export interface TrendPoint {
  name: string;
  value: number;
  forecast?: number;
}

export interface StockMovementPoint {
  day: string;
  fifo: number;
  lifo: number;
  incoming: number;
  outgoing: number;
}

export interface PriceComparison {
  product: string;
  currentPrice: number;
  minRecommended: number;
  marketAverage: number;
  change24h: string;
  weeklyChange: string;
  condition: string;
}

export interface CustomerInsight {
  name: string;
  spend: string;
  orders: number;
  region: string;
}

export interface GeoSale {
  region: string;
  sales: number;
  growth: string;
}

export interface SuggestionItem {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
}

export interface EconomySignal {
  inflation: string;
  exchangeRate: string;
  confidence: string;
  recommendation: string;
}

export interface ReportCardData {
  title: string;
  value: string;
  helper: string;
}

export interface PresentationSlide {
  id: number;
  title: string;
  accent: string;
  bullets: string[];
}
