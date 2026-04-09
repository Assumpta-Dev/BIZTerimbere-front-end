import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  RiLeafLine, RiMailLine, RiLockLine,
  RiEyeLine, RiEyeOffLine, RiArrowRightLine,
  RiShieldCheckLine, RiTimeLine, RiBarChartBoxLine,
} from "react-icons/ri";

const highlights = [
  { icon: <RiShieldCheckLine />, text: "97% stock accuracy" },
  { icon: <RiTimeLine />, text: "Expiry alerts before losses" },
  { icon: <RiBarChartBoxLine />, text: "Inflation-aware pricing" },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      const errors = err?.response?.data?.errors;
      if (errors?.length) {
        setError(errors.map((e: any) => e.message).join(", "));
      } else {
        setError(msg || "Login failed. Please check your credentials.");
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
          style={{ backgroundImage: "radial-gradient(circle at 10% 80%, #FFF5B3 0%, transparent 55%)" }} />
        <div className="flex items-center gap-3 relative">
          <div className="w-9 h-9 rounded-xl bg-[#FFF5B3] flex items-center justify-center">
            <RiLeafLine className="text-[#0E514F] text-lg" />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">BIZTerimbere</p>
            <p className="text-white/40 text-[11px]">Inventory Platform</p>
          </div>
        </div>
        <div className="relative space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-3">Welcome back</p>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Your store is<br />running. Are you<br />watching it?
            </h2>
            <p className="text-sm text-white/60 mt-4 leading-6 max-w-xs">
              Sign in to see live stock levels, expiry alerts, and pricing recommendations waiting for you.
            </p>
          </div>
          <div className="space-y-3">
            {highlights.map((h) => (
              <div key={h.text} className="flex items-center gap-3 text-sm text-white/70">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#FFF5B3] shrink-0">
                  {h.icon}
                </div>
                {h.text}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/30 relative">Decision support for businesses in Rwanda and beyond.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-[#0E514F] flex items-center justify-center">
            <RiLeafLine className="text-[#FFF5B3] text-base" />
          </div>
          <span className="font-bold text-[#0E514F]">BIZTerimbere</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in</h1>
            <p className="text-sm text-slate-400 mt-1">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#0E514F] font-semibold hover:underline">Create one</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@store.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-[#0E514F] focus:ring-2 focus:ring-[#0E514F]/10 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Password</label>
                <button type="button" className="text-xs text-[#0E514F] font-semibold hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
            </div>

            {error && (
              <p className="text-xs text-rose-600 font-medium bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-[#0E514F] text-white text-sm font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-60 mt-2"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><RiArrowRightLine /> Sign in to dashboard</>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              By signing in you agree to our{" "}
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
