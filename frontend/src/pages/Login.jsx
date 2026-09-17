import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default function Login() {
  const { login, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setNeedsVerification(false); setResendStatus(""); setLoading(true);
    try { await login(form.email, form.password); navigate("/chat"); }
    catch (err) {
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
      setNeedsVerification(Boolean(err.response?.data?.needsVerification));
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResendStatus("Sending...");
    try { const data = await resendVerification(form.email); setResendStatus(data.message); }
    catch { setResendStatus("Failed to resend. Try again shortly."); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 cursor-pointer">
          <BackIcon />Back to home
        </Link>
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size={36} withText={false} />
          <h1 className="mt-5 text-2xl font-semibold text-gray-900">Welcome back</h1>
          <p className="mt-1.5 text-sm text-gray-500">Sign in to your workspace</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3">
              <div className="flex items-start gap-2">
                <span className="text-red-500"><AlertIcon /></span>
                <p className="text-sm text-red-600">{error}</p>
              </div>
              {needsVerification && (
                <button type="button" onClick={handleResend} className="mt-2 text-xs font-medium text-gray-900 underline decoration-gray-400 underline-offset-2 hover:decoration-gray-900 cursor-pointer">
                  Resend verification email
                </button>
              )}
              {resendStatus && <p className="mt-1 text-xs text-gray-500">{resendStatus}</p>}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
              <input id="email" type="email" name="email" required autoComplete="email" value={form.email} onChange={handleChange} placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-100" />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} name="password" required autoComplete="current-password" value={form.password} onChange={handleChange} placeholder="••••••••"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-100" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}
                  className="absolute right-3 top-0 flex h-full items-center text-xs font-medium text-gray-500 transition-colors hover:text-gray-900 cursor-pointer">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full rounded-lg bg-black py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>Signing in
                </span>
              ) : "Sign In"}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">
          No account? <Link to="/signup" className="font-medium text-gray-900 hover:underline">Create one free</Link>
        </p>
      </div>
    </div>
  );
}