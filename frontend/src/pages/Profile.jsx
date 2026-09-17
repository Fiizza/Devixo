import { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import { useToast } from "../context/ToastContext.jsx";

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default function Profile() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(user?.name || "");
  const [status, setStatus] = useState(null);
  const initials = user?.name ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus("saving");
    try { const res = await api.put("/user/profile", { name }); setUser(res.data.user); setStatus("success"); showToast("Profile updated", "success"); setTimeout(() => setStatus(null), 3000); }
    catch { setStatus("error"); showToast("Failed to save profile", "error"); }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-gray-200 py-5 pl-14 pr-6 lg:px-8">
          <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
          <p className="mt-0.5 text-sm text-gray-500">Manage your personal information.</p>
        </div>
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-2xl">
            <div className="mb-6 flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-lg font-semibold text-gray-700">{initials}</div>
              <div><p className="font-semibold text-gray-900">{user?.name}</p><p className="text-sm text-gray-500">{user?.email}</p></div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-sm font-semibold text-gray-700">Personal information</h2>
              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">Full name</label>
                  <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-100" />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">Email address</label>
                  <input id="email" type="email" value={user?.email || ""} disabled
                    className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-400 outline-none" />
                  <p className="mt-1.5 text-xs text-gray-400">Email cannot be changed.</p>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button type="submit" disabled={status === "saving"}
                    className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer">
                    {status === "saving" ? (
                      <span className="flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>Saving
                      </span>
                    ) : "Save Changes"}
                  </button>
                  {status === "success" && <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700"><CheckIcon />Saved successfully</span>}
                  {status === "error" && <span className="flex items-center gap-1.5 text-sm font-medium text-red-600"><AlertIcon />Failed to save</span>}
                </div>
              </form>
            </div>
            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-1 text-sm font-semibold text-gray-700">Danger zone</h2>
              <p className="mb-4 text-sm text-gray-500">Permanently delete your account and all your data.</p>
              <button type="button" disabled title="Coming soon" className="cursor-not-allowed rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-300">
                Delete account — Coming soon
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
