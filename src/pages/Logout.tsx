import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  RiLeafLine, RiUserLine, RiShieldLine, RiTimeLine,
  RiStackLine, RiRadioButtonLine, RiLogoutBoxRLine, RiArrowLeftLine,
} from "react-icons/ri";

export default function Logout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-[#0E514F] flex items-center justify-center shadow-md">
            <RiLeafLine className="text-[#FFF5B3] text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-[#0E514F]">BIZTerimbere</h1>
          <p className="mt-1 text-sm text-slate-400">Smart Inventory &amp; Profit Optimization</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          {/* User info */}
          <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4 mb-6">
            <div className="w-11 h-11 rounded-xl bg-[#FFF5B3] text-[#0E514F] flex items-center justify-center shrink-0">
              <RiUserLine className="text-lg" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{user?.name ?? "Manager"}</p>
              <p className="text-xs text-slate-400">{user?.email ?? ""}</p>
              <p className="text-xs text-slate-400">{user?.businessName ?? ""}</p>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6">
            <RiShieldLine className="mt-0.5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Confirm sign-out</p>
              <p className="mt-1 text-xs text-amber-700 leading-5">
                You will be signed out of this session. Any unsaved changes to settings or pending stock entries may be lost.
              </p>
            </div>
          </div>

          {/* Session snapshot */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: <RiTimeLine />, label: "Session", value: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) },
              { icon: <RiStackLine />, label: "Method", value: "FIFO Active", highlight: true },
              { icon: <RiRadioButtonLine />, label: "Status", value: "Live", green: true },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-slate-50 p-3 text-center">
                <div className="mx-auto mb-2 w-8 h-8 rounded-lg bg-[#FFF5B3] text-[#0E514F] flex items-center justify-center text-sm">
                  {s.icon}
                </div>
                <p className="text-[10px] text-slate-400">{s.label}</p>
                <p className={`mt-0.5 text-xs font-semibold ${s.green ? "text-emerald-600" : s.highlight ? "text-[#0E514F]" : "text-slate-700"}`}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#0E514F] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
            >
              <RiLogoutBoxRLine />
              Yes, sign me out
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#0E514F]/15 bg-[#FFF5B3] px-6 py-3 text-sm font-semibold text-[#0E514F] hover:bg-yellow-200 transition"
            >
              <RiArrowLeftLine />
              Go back
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          BIZTerimbere — Decision support for businesses in Rwanda and beyond.
        </p>
      </div>
    </div>
  );
}
