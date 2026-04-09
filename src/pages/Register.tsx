import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  RiLeafLine,
  RiUserLine,
  RiStoreLine,
  RiMailLine,
  RiLockLine,
  RiEyeLine,
  RiEyeOffLine,
  RiArrowRightLine,
  RiCheckLine,
} from "react-icons/ri";

const perks = [
  "Free to start — no credit card",
  "FIFO & LIFO inventory ready",
  "Expiry alerts and restock signals",
  "Inflation-aware pricing engine",
];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", store: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedName = form.name.trim();
    const normalizedStore = form.store.trim();
    const normalizedEmail = form.email.trim();

    if (!normalizedName || !normalizedStore || !normalizedEmail || !form.password) {
      setError("Please fill in all fields."); return;
    }
    if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
      setError("Please enter a valid email address."); return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }
    setError("");
    setSubmitting(true);
    try {
      await register(normalizedName, normalizedStore, normalizedEmail, form.password);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      const errors = err?.response?.data?.errors;
      if (errors?.length) {
        setError(errors.map((entry: any) => entry.message).join(", "));
      } else {
        setError(msg || "Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFE] flex">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[44%] bg-[#0E514F] flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 90% 10%, #FFF5B3 0%, transparent 55%)" }} />

        {/* Brand */}
        <div className="flex items-center gap-3 relative">
          <div className="w-9 h-9 rounded-xl bg-[#FFF5B3] flex items-center justify-center">
            <RiLeafLine className="text-[#0E514F] text-lg" />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">BIZTerimbere</p>
            <p className="text-white/40 text-[11px]">Inventory Platform</p>
          </div>
        </div>

        {/* Main copy */}
        <div className="relative space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-3">Get started free</p>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Set up your store<br />in under<br />2 minutes.
            </h2>
            <p className="text-sm text-white/60 mt-4 leading-6 max-w-xs">
              Create your account and start tracking inventory, pricing, and demand from day one.
            </p>
          </div>

          <div className="space-y-3">
            {perks.map((p) => (
              <div key={p} className="flex items-center gap-3 text-sm text-white/70">
                <div className="w-5 h-5 rounded-full bg-[#FFF5B3]/20 flex items-center justify-center shrink-0">
                  <RiCheckLine className="text-[#FFF5B3] text-xs" />
                </div>
                {p}
              </div>
            ))}
          </div>

          {/* Fake testimonial */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/70 leading-5 italic">
              "We cut our expiry losses by 28% in the first month. The alerts actually work."
            </p>
            <p className="text-xs text-white/40 mt-2 font-semibold">— Kigali Fresh Mart, Gasabo</p>
          </div>
        </div>

        <p className="text-xs text-white/30 relative">
          Decision support for businesses in Rwanda and beyond.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile brand */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-[#0E514F] flex items-center justify-center">
            <RiLeafLine className="text-[#FFF5B3] text-base" />
          </div>
          <span className="font-bold text-[#0E514F]">BIZTerimbere</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create your account</h1>
            <p className="text-sm text-slate-400 mt-1">
              Already have one?{" "}
              <Link to="/login" className="text-[#0E514F] font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                Your name
              </label>
              <div className="relative">
                <RiUserLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="text"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Full name"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-[#0E514F] focus:ring-2 focus:ring-[#0E514F]/10 transition"
                />
              </div>
            </div>

            {/* Store name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                Store / business name
              </label>
              <div className="relative">
                <RiStoreLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="text"
                  value={form.store}
                  onChange={set("store")}
                  placeholder="e.g. Kigali Fresh Mart"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-[#0E514F] focus:ring-2 focus:ring-[#0E514F]/10 transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="you@store.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-[#0E514F] focus:ring-2 focus:ring-[#0E514F]/10 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-[#0E514F] focus:ring-2 focus:ring-[#0E514F]/10 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
              {/* Password strength hint */}
              {form.password.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        form.password.length >= i * 3
                          ? form.password.length >= 10 ? "bg-emerald-400" : "bg-amber-400"
                          : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-rose-600 font-medium bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-[#0E514F] text-white text-sm font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-60 mt-2"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><RiArrowRightLine /> Create account &amp; go to dashboard</>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              By creating an account you agree to our{" "}
              <span className="text-[#0E514F] font-semibold cursor-pointer hover:underline">Terms</span>{" "}
              and{" "}
              <span className="text-[#0E514F] font-semibold cursor-pointer hover:underline">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
