import {
  CategoryRecord,
  CustomerInsight,
  DashboardMetric,
  EconomySignal,
  GeoSale,
  PresentationSlide,
  PriceComparison,
  ProductInventoryItem,
  ReportCardData,
  StockMovementPoint,
  SuggestionItem,
  TrendPoint,
} from "../types";

export const categories: CategoryRecord[] = [
  {
    id: "dairy",
    name: "Dairy",
    icon: "dairy",
    color: "#E6FFFA",
    products: [
      { name: "Fresh Milk 1L", price: 1000, sku: "DAR-001" },
      { name: "Yogurt Cup", price: 1200, sku: "DAR-002" },
      { name: "Cheddar Cheese", price: 2800, sku: "DAR-003" },
    ],
  },
  {
    id: "bakery",
    name: "Bakery",
    icon: "bakery",
    color: "#FFF8E1",
    products: [
      { name: "Family Bread", price: 700, sku: "BAK-001" },
      { name: "Croissant", price: 900, sku: "BAK-002" },
      { name: "Mandazi Pack", price: 500, sku: "BAK-003" },
    ],
  },
  {
    id: "produce",
    name: "Produce",
    icon: "produce",
    color: "#F1F8E9",
    products: [
      { name: "Bananas", price: 500, sku: "PRD-001" },
      { name: "Tomatoes", price: 800, sku: "PRD-002" },
      { name: "Avocados", price: 650, sku: "PRD-003" },
    ],
  },
  {
    id: "meat",
    name: "Meat",
    icon: "meat",
    color: "#FDECEC",
    products: [
      { name: "Chicken", price: 3500, sku: "MET-001" },
      { name: "Beef Steak", price: 4800, sku: "MET-002" },
      { name: "Minced Meat", price: 4200, sku: "MET-003" },
    ],
  },
  {
    id: "canned-goods",
    name: "Canned Goods",
    icon: "canned-goods",
    color: "#EEF2FF",
    products: [
      { name: "Beans Tin", price: 800, sku: "CND-001" },
      { name: "Tomato Paste", price: 950, sku: "CND-002" },
      { name: "Sweet Corn", price: 1100, sku: "CND-003" },
    ],
  },
  {
    id: "beverages",
    name: "Beverages",
    icon: "beverages",
    color: "#E8F5FF",
    products: [
      { name: "Mineral Water", price: 600, sku: "BEV-001" },
      { name: "Mango Juice", price: 1200, sku: "BEV-002" },
      { name: "Soft Drink", price: 900, sku: "BEV-003" },
    ],
  },
];

export const inventoryItems: ProductInventoryItem[] = [
  {
    id: "1",
    name: "Fresh Milk 1L",
    category: "Dairy",
    sku: "DAR-001",
    quantity: 64,
    systemStock: 64,
    physicalStock: 62,
    threshold: 20,
    price: 1000,
    costPrice: 760,
    manufacturedDate: "2026-03-18",
    expiryDate: "2026-04-05",
    trend: "rising",
    status: "expiring",
    location: "Kimironko Shelf A2",
    dailySales: 18,
  },
  {
    id: "2",
    name: "Family Bread",
    category: "Bakery",
    sku: "BAK-001",
    quantity: 28,
    systemStock: 28,
    physicalStock: 28,
    threshold: 18,
    price: 700,
    costPrice: 430,
    manufacturedDate: "2026-03-31",
    expiryDate: "2026-04-02",
    trend: "rising",
    status: "low",
    location: "Main Rack B1",
    dailySales: 22,
  },
  {
    id: "3",
    name: "Bananas",
    category: "Produce",
    sku: "PRD-001",
    quantity: 120,
    systemStock: 120,
    physicalStock: 117,
    threshold: 40,
    price: 500,
    costPrice: 260,
    manufacturedDate: "2026-03-29",
    expiryDate: "2026-04-04",
    trend: "stable",
    status: "healthy",
    location: "Produce Island",
    dailySales: 36,
  },
  {
    id: "4",
    name: "Chicken",
    category: "Meat",
    sku: "MET-001",
    quantity: 12,
    systemStock: 12,
    physicalStock: 10,
    threshold: 15,
    price: 3500,
    costPrice: 2700,
    manufacturedDate: "2026-03-27",
    expiryDate: "2026-04-03",
    trend: "rising",
    status: "critical",
    location: "Cold Room C3",
    dailySales: 9,
  },
  {
    id: "5",
    name: "Beans Tin",
    category: "Canned Goods",
    sku: "CND-001",
    quantity: 96,
    systemStock: 96,
    physicalStock: 96,
    threshold: 25,
    price: 800,
    costPrice: 520,
    manufacturedDate: "2026-01-10",
    expiryDate: "2026-08-21",
    trend: "stable",
    status: "healthy",
    location: "Aisle D4",
    dailySales: 11,
  },
  {
    id: "6",
    name: "Mango Juice",
    category: "Beverages",
    sku: "BEV-002",
    quantity: 34,
    systemStock: 34,
    physicalStock: 31,
    threshold: 22,
    price: 1200,
    costPrice: 760,
    manufacturedDate: "2026-03-12",
    expiryDate: "2026-05-28",
    trend: "declining",
    status: "healthy",
    location: "Fridge F1",
    dailySales: 7,
  },
];

export const dashboardMetrics: DashboardMetric[] = [
  {
    title: "Low Stock Alerts",
    value: "12",
    helper: "4 need urgent reorder today",
    icon: "alert",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    title: "Today's Movement",
    value: "1,248 units",
    helper: "Inbound +420 / Outbound -828",
    icon: "movement",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  {
    title: "Inflation Watch",
    value: "+5.4%",
    helper: "Min price floor increased for 8 items",
    icon: "inflation",
    color: "text-amber-700",
    bg: "bg-amber-50",
  },
  {
    title: "Stock Accuracy",
    value: "97.1%",
    helper: "Physical vs system variance on 6 SKUs",
    icon: "accuracy",
    color: "text-sky-700",
    bg: "bg-sky-50",
  },
];

export const salesTrendData: TrendPoint[] = [
  { name: "Mon", value: 240000, forecast: 230000 },
  { name: "Tue", value: 190000, forecast: 205000 },
  { name: "Wed", value: 320000, forecast: 285000 },
  { name: "Thu", value: 280000, forecast: 290000 },
  { name: "Fri", value: 400000, forecast: 370000 },
  { name: "Sat", value: 460000, forecast: 430000 },
  { name: "Sun", value: 350000, forecast: 340000 },
];

export const stockMovementData: StockMovementPoint[] = [
  { day: "Mon", fifo: 220, lifo: 180, incoming: 110, outgoing: 205 },
  { day: "Tue", fifo: 260, lifo: 190, incoming: 140, outgoing: 228 },
  { day: "Wed", fifo: 240, lifo: 175, incoming: 120, outgoing: 210 },
  { day: "Thu", fifo: 280, lifo: 215, incoming: 165, outgoing: 250 },
  { day: "Fri", fifo: 320, lifo: 235, incoming: 190, outgoing: 292 },
  { day: "Sat", fifo: 360, lifo: 250, incoming: 220, outgoing: 315 },
];

export const demandTrendData: TrendPoint[] = [
  { name: "Week 1", value: 68, forecast: 72 },
  { name: "Week 2", value: 72, forecast: 75 },
  { name: "Week 3", value: 79, forecast: 81 },
  { name: "Week 4", value: 83, forecast: 86 },
  { name: "Week 5", value: 88, forecast: 92 },
];

export const priceComparisonData: PriceComparison[] = [
  {
    product: "Fresh Milk 1L",
    currentPrice: 1000,
    minRecommended: 1080,
    marketAverage: 1120,
    change24h: "+2.1%",
    weeklyChange: "+3.8%",
    condition: "Inflation pressure + high turnover",
  },
  {
    product: "Chicken",
    currentPrice: 3500,
    minRecommended: 3680,
    marketAverage: 3750,
    change24h: "+1.5%",
    weeklyChange: "+4.2%",
    condition: "Cold-chain cost rise",
  },
  {
    product: "Bananas",
    currentPrice: 500,
    minRecommended: 520,
    marketAverage: 540,
    change24h: "-0.6%",
    weeklyChange: "+1.3%",
    condition: "Stable harvest supply",
  },
  {
    product: "Mango Juice",
    currentPrice: 1200,
    minRecommended: 1180,
    marketAverage: 1240,
    change24h: "-1.1%",
    weeklyChange: "-2.4%",
    condition: "Demand cooling",
  },
];

export const stockInsights: SuggestionItem[] = [
  {
    title: "Restock chicken before tomorrow afternoon",
    description:
      "Demand remains strong and physical stock has fallen below threshold by 5 units.",
    priority: "High",
  },
  {
    title: "Discount fresh milk bundles",
    description:
      "Expiry window is within 5 days; use bundle pricing to avoid waste and protect margin.",
    priority: "High",
  },
  {
    title: "Increase minimum bread production",
    description:
      "Bread is among the top purchased products and weekend trend predicts 14% higher sales.",
    priority: "Medium",
  },
  {
    title: "Hold juice price for 48 hours",
    description:
      "Market average is still above your current price, but demand is softening this week.",
    priority: "Low",
  },
];

export const topCustomers: CustomerInsight[] = [
  { name: "Kigali Fresh Mart", spend: "RWF 420,000", orders: 18, region: "Gasabo" },
  { name: "Nyabugogo Retail Hub", spend: "RWF 365,000", orders: 15, region: "Nyarugenge" },
  { name: "Green Basket Shop", spend: "RWF 290,000", orders: 11, region: "Kicukiro" },
  { name: "Sunrise Mini Market", spend: "RWF 246,000", orders: 10, region: "Musanze" },
];

export const geographicSales: GeoSale[] = [
  { region: "Gasabo", sales: 42, growth: "+12%" },
  { region: "Nyarugenge", sales: 28, growth: "+8%" },
  { region: "Kicukiro", sales: 18, growth: "+6%" },
  { region: "Musanze", sales: 12, growth: "+4%" },
];

export const economySignal: EconomySignal = {
  inflation: "5.4%",
  exchangeRate: "1 USD = 1,318 RWF",
  confidence: "High confidence",
  recommendation:
    "Protect margins on fast movers with a 3–6% price floor while keeping entry-level staples stable.",
};

export const reportCards: ReportCardData[] = [
  { title: "Waste prevented", value: "RWF 182,000", helper: "Through expiry alerts and faster markdowns" },
  { title: "Potential margin uplift", value: "+14.8%", helper: "Using current smart pricing recommendations" },
  { title: "Restock precision", value: "91%", helper: "Forecasted demand aligned with actual movement" },
  { title: "Stock count variance", value: "2.9%", helper: "Difference between physical and system stock" },
];

export const presentationSlides: PresentationSlide[] = [
  {
    id: 1,
    title: "BIZTerimbere – Smart Inventory & Profit Optimization",
    accent: "Problem-driven, insight-led inventory platform",
    bullets: [
      "Decision support system for SMEs, supermarkets, pharmacies, and growing retailers.",
      "Combines inventory visibility, demand analysis, and pricing intelligence.",
      "Built to help businesses survive, adapt, and grow in changing economic conditions.",
    ],
  },
  {
    id: 2,
    title: "Problem",
    accent: "Retail businesses lose value because stock and pricing decisions are reactive.",
    bullets: [
      "20–30% inventory loss due to poor stock management.",
      "Over 60% of SMEs lack digital inventory tools.",
      "Inflation reduces profit when pricing is not adjusted.",
    ],
  },
  {
    id: 3,
    title: "Impact",
    accent: "Inventory mistakes directly reduce annual profit potential.",
    bullets: [
      "Expired products create financial loss.",
      "Overstocking ties up capital.",
      "Understocking causes missed sales.",
      "Businesses can lose 15–25% of potential profit annually.",
    ],
  },
  {
    id: 4,
    title: "Solution",
    accent: "BIZTerimbere turns stock data into timely business actions.",
    bullets: [
      "Tracks inventory in real time.",
      "Monitors product movement and demand shifts.",
      "Suggests optimal pricing based on market conditions.",
    ],
  },
  {
    id: 5,
    title: "Key Features",
    accent: "Designed for speed, clarity, and decision quality.",
    bullets: [
      "FIFO & LIFO inventory management.",
      "Barcode-ready product capture flow.",
      "Expiry alerts and low-stock thresholds.",
      "Dynamic pricing and demand detection.",
    ],
  },
  {
    id: 6,
    title: "How It Works",
    accent: "Simple operating flow for daily use.",
    bullets: [
      "Select category and product.",
      "Track stock automatically and record movement.",
      "Generate smart price suggestions, restock alerts, and expiry warnings.",
    ],
  },
  {
    id: 7,
    title: "Economic Intelligence",
    accent: "Pricing is aligned to demand, cost, and macro conditions.",
    bullets: [
      "Inflation can raise recommended minimum selling prices.",
      "Low demand can trigger price reductions to improve turnover.",
      "Protects profit while reducing dead stock risk.",
    ],
  },
  {
    id: 8,
    title: "Monetisation",
    accent: "Accessible model for SMEs with room to scale.",
    bullets: [
      "Freemium basic inventory tracking.",
      "Paid insights and pricing suggestions.",
      "Subscription range: $3–$10/month.",
    ],
  },
  {
    id: 9,
    title: "Impact",
    accent: "Quantified operational gains for businesses.",
    bullets: [
      "Reduce inventory waste by 20–30%.",
      "Improve pricing decisions by 15–25%.",
      "Increase profit margins by 10–20%.",
      "Improve stock efficiency by 30%+.",
    ],
  },
  {
    id: 10,
    title: "Conclusion",
    accent: "Move from guesswork to intelligent decision-making.",
    bullets: [
      "Know what to stock.",
      "Know how to price.",
      "Reduce losses and increase profit.",
      "BIZTerimbere is not just a tool — it is a decision support system.",
    ],
  },
];
