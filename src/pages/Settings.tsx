import { useState, useEffect } from "react";
import {
  RiSettingsLine, RiSaveLine, RiUserLine, RiStackLine,
  RiBellLine, RiGlobalLine,
  RiLockLine, RiShieldLine, RiLoader4Line,
} from "react-icons/ri";
import { useAuth } from "../context/AuthContext";
import { alertsApi, analyticsApi, authApi, productsApi, salesApi } from "../api/services";

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  helper?: string;
}

function Toggle({ checked, onChange, label, helper }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {helper && <p className="mt-0.5 text-xs text-slate-400">{helper}</p>}
      </div>
      <button
        onClick={onChange}
        aria-label={label}
        className={`relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0E514F]/30 ${checked ? "bg-[#0E514F]" : "bg-slate-200"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [stockMethod, setStockMethod] = useState<"fifo" | "lifo">("fifo");
  const [notifications, setNotifications] = useState({
    lowStock: true, expiry: true, priceFloor: true, dailySummary: false, inflationAlert: true,
  });
  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    store: user?.businessName ?? "",
    currency: "RWF",
  });
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [security, setSecurity] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordMsg, setPasswordMsg] = useState("");
  const [actionsMsg, setActionsMsg] = useState("");
  const [sourceStatus, setSourceStatus] = useState<{ inflation: string; exchange: string }>({ inflation: "Checking...", exchange: "Checking..." });

  useEffect(() => {
    if (user) setProfile({ name: user.name, email: user.email, store: user.businessName, currency: "RWF" });

    try {
      const savedNotifications = localStorage.getItem("settings.notifications");
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    } catch {
      // ignore invalid local settings
    }

    productsApi.getAll({ limit: 1 })
      .then((res) => {
        const first = res.data.data?.products?.[0];
        if (first?.stockMethod) setStockMethod(String(first.stockMethod).toLowerCase() === "lifo" ? "lifo" : "fifo");
      })
      .catch(() => {});

    Promise.all([
      analyticsApi.getProfitAnalysis("30d"),
      alertsApi.getUnreadCount(),
    ]).then(() => {
      setSourceStatus({ inflation: "Connected", exchange: "Connected" });
    }).catch(() => {
      setSourceStatus({ inflation: "Unavailable", exchange: "Unavailable" });
    });
  }, [user]);

  const toggleNotification = (key: keyof typeof notifications) =>
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      await authApi.updateProfile({ name: profile.name, businessName: profile.store });
      const productsRes = await productsApi.getAll({ limit: 100 });
      const products = productsRes.data.data?.products ?? [];
      const target = stockMethod.toUpperCase();
      const toUpdate = products.filter((p: any) => p.stockMethod !== target);
      if (toUpdate.length > 0) {
        await Promise.all(toUpdate.map((p: any) => productsApi.update(p.id, { stockMethod: target })));
      }

      localStorage.setItem("settings.notifications", JSON.stringify(notifications));
      updateUser({ name: profile.name, businessName: profile.store });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setSaveError(err?.response?.data?.message ?? "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMsg("");
    if (!security.currentPassword || !security.newPassword || !security.confirmPassword) {
      setPasswordMsg("Fill all password fields.");
      return;
    }
    if (security.newPassword.length < 6) {
      setPasswordMsg("New password must be at least 6 characters.");
      return;
    }
    if (security.newPassword !== security.confirmPassword) {
      setPasswordMsg("New passwords do not match.");
      return;
    }

    try {
      await authApi.changePassword(security.currentPassword, security.newPassword);
      setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordMsg("Password changed successfully.");
    } catch (err: any) {
      setPasswordMsg(err?.response?.data?.message ?? "Failed to change password.");
    }
  };

  const handleResetNotifications = async () => {
    setActionsMsg("");
    try {
      await alertsApi.markAllRead();
      setActionsMsg("All alerts marked as read.");
    } catch {
      setActionsMsg("Failed to reset notifications.");
    }
  };

  const handleExportBackup = async () => {
    setActionsMsg("");
    try {
      const [profileRes, inventoryRes, salesRes, alertsRes] = await Promise.all([
        authApi.getProfile(),
        analyticsApi.getInventoryStatus(),
        salesApi.getAll({ page: 1, limit: 100 }),
        alertsApi.getAll(),
      ]);

      const payload = {
        exportedAt: new Date().toISOString(),
        profile: profileRes.data.data,
        inventory: inventoryRes.data.data,
        sales: salesRes.data.data?.sales ?? [],
        alerts: alertsRes.data.data ?? [],
        localPreferences: { notifications, stockMethod },
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bizterimbere-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setActionsMsg("Backup exported successfully.");
    } catch {
      setActionsMsg("Failed to export backup.");
    }
  };

  return (
    <div className="space-y-7 pb-8">
      {/* Header */}
      <div className="rounded-2xl bg-[#0E514F] p-6 lg:p-8 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FFF5B3] flex items-center justify-center text-[#0E514F] shrink-0">
              <RiSettingsLine className="text-2xl" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Configuration</p>
              <h1 className="text-2xl font-bold mt-0.5">Settings &amp; Preferences</h1>
              <p className="text-sm text-white/60 mt-0.5">Manage inventory rules, alerts, pricing, and account details.</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition shrink-0 disabled:opacity-60 ${saved ? "bg-emerald-400 text-white" : "bg-[#FFF5B3] text-[#0E514F] hover:bg-yellow-200"}`}
          >
            {saving ? <RiLoader4Line className="animate-spin" /> : <RiSaveLine />}
            {saved ? "Saved!" : "Save changes"}
          </button>
        </div>
      </div>

      {/* Profile */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FFF5B3] text-[#0E514F] flex items-center justify-center">
            <RiUserLine className="text-lg" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Store profile</h2>
            <p className="text-xs text-slate-400">Update business name, contact, and locale settings.</p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {([
            { label: "Manager name", key: "name", type: "text", placeholder: "Your name" },
            { label: "Email address", key: "email", type: "email", placeholder: "your@email.com" },
            { label: "Store / branch name", key: "store", type: "text", placeholder: "Branch name" },
            { label: "Currency", key: "currency", type: "text", placeholder: "RWF" },
          ] as const).map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</label>
              <input
                type={type}
                value={profile[key]}
                onChange={(e) => setProfile((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#0E514F] focus:ring-2 focus:ring-[#0E514F]/10"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dispatch method */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FFF5B3] text-[#0E514F] flex items-center justify-center">
            <RiStackLine className="text-lg" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Inventory dispatch method</h2>
            <p className="text-xs text-slate-400">Choose how stock is picked when orders are fulfilled.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {(["fifo", "lifo"] as const).map((method) => (
            <button
              key={method}
              onClick={() => setStockMethod(method)}
              className={`rounded-xl border-2 p-5 text-left transition ${stockMethod === method ? "border-[#0E514F] bg-[#0E514F]/5" : "border-slate-200 hover:border-[#0E514F]/30"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-[#0E514F]">{method.toUpperCase()}</span>
                {stockMethod === method && (
                  <span className="text-[10px] font-bold bg-[#0E514F] text-white px-2.5 py-0.5 rounded-full">Active</span>
                )}
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">
                {method === "fifo" ? "First-In First-Out" : "Last-In First-Out"}
              </p>
              <p className="text-xs text-slate-400 leading-5">
                {method === "fifo"
                  ? "Dispatches oldest stock first. Recommended for perishables to reduce expiry losses."
                  : "Dispatches newest stock first. Suitable for non-perishable goods."}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FFF5B3] text-[#0E514F] flex items-center justify-center">
            <RiBellLine className="text-lg" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Notification preferences</h2>
            <p className="text-xs text-slate-400">Control which system alerts are active for your store.</p>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {([
            { key: "lowStock", label: "Low stock alerts", helper: "Alert when stock falls below threshold" },
            { key: "expiry", label: "Expiry warnings", helper: "Alert when products expire within 5 days" },
            { key: "priceFloor", label: "Price floor breaches", helper: "Alert when selling price falls below recommended minimum" },
            { key: "dailySummary", label: "Daily summary report", helper: "Receive end-of-day stock and sales digest" },
            { key: "inflationAlert", label: "Inflation & market updates", helper: "Alert when macroeconomic signals change significantly" },
          ] as const).map(({ key, label, helper }) => (
            <div key={key} className="py-4 first:pt-0 last:pb-0">
              <Toggle checked={notifications[key]} onChange={() => toggleNotification(key)} label={label} helper={helper} />
            </div>
          ))}
        </div>
      </div>

      {/* Data sources */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FFF5B3] text-[#0E514F] flex items-center justify-center">
            <RiGlobalLine className="text-lg" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Economic data sources</h2>
            <p className="text-xs text-slate-400">External APIs used for inflation and exchange rate signals.</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { name: "World Bank Inflation API", url: "api.worldbank.org/v2/country/RW/indicator/FP.CPI.TOTL.ZG", status: sourceStatus.inflation },
            { name: "Exchange Rate API", url: "api.exchangerate-api.com/v4/latest/USD", status: sourceStatus.exchange },
          ].map((source) => (
            <div key={source.name} className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0E514F] text-white flex items-center justify-center shrink-0">
                  <RiGlobalLine className="text-sm" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{source.name}</p>
                  <p className="text-xs text-slate-400">{source.url}</p>
                </div>
              </div>
              <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${source.status === "Connected" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                {source.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Security + System actions */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#FFF5B3] text-[#0E514F] flex items-center justify-center">
              <RiLockLine className="text-lg" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Security</h2>
              <p className="text-xs text-slate-400">Manage access and session preferences.</p>
            </div>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              value={security.currentPassword}
              onChange={(e) => setSecurity((p) => ({ ...p, currentPassword: e.target.value }))}
              placeholder="Current password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0E514F]"
            />
            <input
              type="password"
              value={security.newPassword}
              onChange={(e) => setSecurity((p) => ({ ...p, newPassword: e.target.value }))}
              placeholder="New password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0E514F]"
            />
            <input
              type="password"
              value={security.confirmPassword}
              onChange={(e) => setSecurity((p) => ({ ...p, confirmPassword: e.target.value }))}
              placeholder="Confirm new password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0E514F]"
            />
            <button
              onClick={handleChangePassword}
              className="w-full rounded-xl bg-[#0E514F] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Change password
            </button>
            {passwordMsg && <p className="text-xs text-slate-500">{passwordMsg}</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <RiShieldLine className="text-lg" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">System actions</h2>
              <p className="text-xs text-slate-400">Irreversible operations. Use with care.</p>
            </div>
          </div>
          <div className="space-y-2">
            <button
              onClick={handleResetNotifications}
              className="flex w-full items-center justify-between rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm text-rose-700 hover:bg-rose-50 transition"
            >
              Reset all notifications
            </button>
            <button
              onClick={handleExportBackup}
              className="flex w-full items-center justify-between rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm text-rose-700 hover:bg-rose-50 transition"
            >
              Export full data backup
            </button>
            {actionsMsg && <p className="text-xs text-slate-500 mt-2">{actionsMsg}</p>}
          </div>
        </div>
      </div>

      {saveError && (
        <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2">{saveError}</p>
      )}
      {/* Save footer */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-400">Changes are applied to the current session and synced on save.</p>
        <button
          onClick={handleSave}
          className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition ${saved ? "bg-emerald-500 text-white" : "bg-[#0E514F] text-white hover:opacity-90"}`}
        >
          <RiSaveLine />
          {saved ? "Saved successfully!" : "Save all settings"}
        </button>
      </div>
    </div>
  );
}
