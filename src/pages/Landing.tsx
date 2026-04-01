import { useNavigate } from "react-router-dom";
import {
  RiLeafLine,
  RiArrowRightLine,
  RiShieldCheckLine,
  RiBarChartBoxLine,
  RiAlertLine,
  RiTimeLine,
  RiArrowDownLine,
  RiArrowUpLine,
  RiCheckLine,
  RiStockLine,
  RiGlobalLine,
  RiArchiveDrawerLine,
} from "react-icons/ri";

const features = [
  {
    icon: <RiArchiveDrawerLine className="text-xl" />,
    title: "Live inventory tracking",
    desc: "Know exactly what is in stock, where it is, and when it expires — updated in real time.",
  },
  {
    icon: <RiBarChartBoxLine className="text-xl" />,
    title: "Demand & sales analytics",
    desc: "See which products move fastest, forecast demand, and act before stock runs out.",
  },
  {
    icon: <RiStockLine className="text-xl" />,
    title: "Smart pricing engine",
    desc: "Protect margins automatically. Price floors adjust based on inflation and market signals.",
  },
  {
    icon: <RiAlertLine className="text-xl" />,
    title: "Expiry & restock alerts",
    desc: "Get notified before products expire or fall below threshold — not after the loss happens.",
  },
  {
    icon: <RiGlobalLine className="text-xl" />,
    title: "Economic intelligence",
    desc: "Inflation rates and exchange signals feed directly into your pricing recommendations.",
  },
  {
    icon: <RiShieldCheckLine className="text-xl" />,
    title: "FIFO & LIFO dispatch",
    desc: "Choose how stock is picked. FIFO for perishables, LIFO for non-perishables — your call.",
  },
];

const stats = [
  { value: "20–30%", label: "Inventory waste reduced" },
  { value: "15–25%", label: "Pricing decisions improved" },
  { value: "91%", label: "Restock precision rate" },
  { value: "97%", label: "Stock accuracy achieved" },
];

const mockMetrics = [
  { label: "Low Stock Alerts", value: "12", color: "text-rose-600", bg: "bg-rose-50" },
  { label: "Today's Movement", value: "1,248 units", color: "text-emerald-700", bg: "bg-emerald-50" },
  { label: "Inflation Watch", value: "+5.4%", color: "text-amber-700", bg: "bg-amber-50" },
  { label: "Stock Accuracy", value: "97.1%", color: "text-sky-700", bg: "bg-sky-50" },
];

const mockItems = [
  { name: "Fresh Milk 1L", sku: "DAR-001", qty: 64, status: "expiring", dot: "bg-orange-400" },
  { name: "Chicken", sku: "MET-001", qty: 12, status: "critical", dot: "bg-rose-500" },
  { name: "Bananas", sku: "PRD-001", qty: 120, status: "healthy", dot: "bg-emerald-400" },
  { name: "Family Bread", sku: "BAK-001", qty: 28, status: "low", dot: "bg-amber-400" },
];

const statusStyle: Record<string, string> = {
  healthy: "bg-emerald-50 text-emerald-700",
  low: "bg-amber-50 text-amber-700",
  expiring: "bg-orange-50 text-orange-700",
  critical: "bg-rose-50 text-rose-700",
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFFFE] text-slate-900 font-sans">

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-[#FFFFFE]/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0E514F] flex items-center justify-center">
              <RiLeafLine className="text-[#FFF5B3] text-base" />
            </div>
            <span className="font-bold text-[#0E514F] text-base">BIZTerimbere</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-500">
            <a href="#features" className="hover:text-[#0E514F] transition">Features</a>
            <a href="#preview" className="hover:text-[#0E514F] transition">Preview</a>
            <a href="#stats" className="hover:text-[#0E514F] transition">Results</a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-semibold text-[#0E514F] hover:underline transition"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate("/register")}
              className="text-sm font-semibold bg-[#0E514F] text-white px-4 py-2 rounded-xl hover:opacity-90 transition"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-20 pb-16 grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 bg-[#0E514F]/5 border border-[#0E514F]/10 text-[#0E514F] text-xs font-semibold px-3 py-1.5 rounded-full">
            <RiShieldCheckLine />
            Built for retailers in Rwanda &amp; beyond
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
            Stop guessing.<br />
            <span className="text-[#0E514F]">Start knowing</span> what<br />
            your stock is doing.
          </h1>

          <p className="text-base text-slate-500 leading-7 max-w-md">
            BIZTerimbere gives small and growing businesses real-time inventory control, demand forecasting, and inflation-aware pricing — all in one place.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/register")}
              className="inline-flex items-center gap-2 bg-[#0E514F] text-white text-sm font-bold px-6 py-3 rounded-xl hover:opacity-90 transition"
            >
              Create free account <RiArrowRightLine />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 border border-[#0E514F]/20 text-[#0E514F] text-sm font-bold px-6 py-3 rounded-xl hover:bg-[#0E514F]/5 transition"
            >
              Sign in to dashboard
            </button>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            {["No credit card needed", "Free to start", "FIFO & LIFO ready"].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <RiCheckLine className="text-emerald-500" /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Mock dashboard preview */}
        <div id="preview" className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          {/* Mock top bar */}
          <div className="bg-[#0E514F] px-5 py-3 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <span className="ml-3 text-xs text-white/60 font-medium">BIZTerimbere — Dashboard</span>
          </div>

          <div className="p-5 space-y-4">
            {/* Metric cards */}
            <div className="grid grid-cols-2 gap-3">
              {mockMetrics.map((m) => (
                <div key={m.label} className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{m.label}</p>
                  <p className={`text-lg font-bold mt-1 ${m.color}`}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Mini stock table */}
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Live stock register</p>
              </div>
              <div className="divide-y divide-slate-50">
                {mockItems.map((item) => (
                  <div key={item.sku} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.dot}`} />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{item.name}</p>
                        <p className="text-[10px] text-slate-400">{item.sku}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-700">{item.qty} units</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusStyle[item.status]}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini chart bars */}
            <div className="rounded-xl border border-slate-100 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-3">Weekly sales trend</p>
              <div className="flex items-end gap-1.5 h-14">
                {[55, 38, 72, 60, 88, 95, 70].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-md bg-[#0E514F]"
                      style={{ height: `${h}%`, opacity: 0.7 + i * 0.04 }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1.5">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i} className="flex-1 text-center text-[9px] text-slate-300">{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="bg-[#0E514F] py-14">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-[#FFF5B3]">{s.value}</p>
                <p className="text-sm text-white/60 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0E514F]/50 mb-2">What you get</p>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Everything your store needs</h2>
          <p className="text-slate-500 text-sm mt-3 max-w-md mx-auto leading-6">
            From daily stock tracking to inflation-aware pricing — built for businesses that can't afford to guess.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFF5B3] text-[#0E514F] flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-6">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-5 pb-20">
        <div className="rounded-2xl bg-[#0E514F] p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #FFF5B3 0%, transparent 55%), radial-gradient(circle at 80% 20%, #FFF5B3 0%, transparent 45%)" }} />
          <div className="relative space-y-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Get started today</p>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Your inventory is waiting<br />to be managed properly.
            </h2>
            <p className="text-sm text-white/60 max-w-sm mx-auto leading-6">
              Join businesses already using BIZTerimbere to reduce waste, protect margins, and make smarter stock decisions.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={() => navigate("/register")}
                className="inline-flex items-center gap-2 bg-[#FFF5B3] text-[#0E514F] text-sm font-bold px-6 py-3 rounded-xl hover:bg-yellow-200 transition"
              >
                Create your account <RiArrowRightLine />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 border border-white/20 text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0E514F] flex items-center justify-center">
              <RiLeafLine className="text-[#FFF5B3] text-sm" />
            </div>
            <span className="text-sm font-bold text-[#0E514F]">BIZTerimbere</span>
          </div>
          <p className="text-xs text-slate-400">Decision support for businesses in Rwanda and beyond.</p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1"><RiArrowDownLine className="text-emerald-500" /> Inbound</span>
            <span className="flex items-center gap-1"><RiArrowUpLine className="text-rose-400" /> Outbound</span>
            <span className="flex items-center gap-1"><RiTimeLine className="text-amber-500" /> Expiry watch</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
