import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  RiDashboardLine, RiArchiveDrawerLine, RiArrowLeftRightLine,
  RiBarChartBoxLine, RiFileTextLine, RiSettingsLine,
  RiLogoutBoxRLine, RiLeafLine, RiBellLine,
} from "react-icons/ri";
import { useAuth } from "../context/AuthContext";
import { alertsApi } from "../api/services";

const links = [
  { to: "/dashboard", icon: RiDashboardLine, label: "Dashboard" },
  { to: "/inventory", icon: RiArchiveDrawerLine, label: "Inventory" },
  { to: "/stock", icon: RiArrowLeftRightLine, label: "Stock Movement" },
  { to: "/analytics", icon: RiBarChartBoxLine, label: "Analytics" },
  { to: "/reports", icon: RiFileTextLine, label: "Reports" },
  { to: "/settings", icon: RiSettingsLine, label: "Settings" },
  { to: "/alerts", icon: RiBellLine, label: "Alerts" },
];

export default function Sidebar() {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    alertsApi.getUnreadCount()
      .then((res) => setUnread(res.data.data?.count ?? 0))
      .catch(() => {});
  }, []);

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-[#0E514F] flex flex-col z-50 overflow-y-auto">
      {/* Brand */}
      <div className="px-6 pt-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFF5B3] flex items-center justify-center shrink-0">
            <RiLeafLine className="text-[#0E514F] text-lg" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-base leading-tight truncate">BIZTerimbere</p>
            <p className="text-white/50 text-[11px] mt-0.5 tracking-wide truncate">
              {user?.businessName ?? "Inventory Platform"}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/8"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`text-lg shrink-0 ${isActive ? "text-[#FFF5B3]" : ""}`} />
                <span className="flex-1">{label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FFF5B3]" />}
              </>
            )}
          </NavLink>
        ))}

        {unread > 0 && (
          <div className="px-4 py-1">
            <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center inline-block">
              {unread > 99 ? "99+" : unread} new alerts
            </span>
          </div>
        )}
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-6 border-t border-white/10 pt-4 space-y-1">
        {user && (
          <div className="px-4 py-2.5 rounded-xl bg-white/5 mb-2">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-[11px] text-white/40 truncate">{user.email}</p>
          </div>
        )}
        <NavLink
          to="/logout"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/8 transition-all duration-150"
        >
          <RiLogoutBoxRLine className="text-lg shrink-0" />
          <span>Sign out</span>
        </NavLink>
      </div>
    </aside>
  );
}
