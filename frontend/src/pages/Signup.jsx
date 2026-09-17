import { useState } from "react";
import { Link } from "react-router-dom";
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
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export default function Signup() {
  const { signup, resendVerification } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState(null);
  const [resendStatus, setResendStatus] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try { const data = await signup(form.name, form.email, form.password); setSubmittedEmail(data.email || form.email); }
    catch (err) { setError(err.response?.data?.message || "Signup failed. Please try again."); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResendStatus("Sending...");
    try { const data = await resendVerification(submittedEmail); setResendStatus(data.message); }
    catch { setResendStatus("Failed to resend. Try again shortly."); }
  };

  if (submittedEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-700"><MailIcon /></div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Check your inbox</h2>
          <p className="mb-6 text-sm leading-relaxed text-gray-500">
            We sent a verification link to <span className="text-gray-900">{submittedEmail}</span>. Click it to activate your account.
          </p>
          <button onClick={handleResend} className="mb-3 w-full rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer">
            Resend email
          </button>
          {resendStatus && <p className="mb-3 text-xs text-gray-500">{resendStatus}</p>}
          <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900 hover:underline">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 cursor-pointer">
          <BackIcon />Back to home
        </Link>
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size={36} withText={false} />
          <h1 className="mt-5 text-2xl font-semibold text-gray-900">Create your account</h1>
          <p className="mt-1.5 text-sm text-gray-500">Free forever. No credit card needed.</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3">
              <span className="text-red-500"><AlertIcon /></span>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">Full name</label>
              <input id="name" type="text" name="name" required autoComplete="name" value={form.name} onChange={handleChange} placeholder="Alex Johnson"
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-100" />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
              <input id="email" type="email" name="email" required autoComplete="email" value={form.email} onChange={handleChange} placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-100" />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} name="password" required minLength={6} autoComplete="new-password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters"
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
                  </svg>Creating account
                </span>
              ) : "Create Account"}
            </button>
          </form>
          <p className="mt-5 text-center text-xs text-gray-400">By signing up you agree to our Terms and Privacy Policy.</p>
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="font-medium text-gray-900 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}