import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";

const states = {
  verifying: {
    icon: (
      <svg className="h-6 w-6 animate-spin text-gray-700" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    ), iconBg: "bg-gray-100", heading: "Verifying your email…",
  },
  success: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ), iconBg: "bg-gray-100", heading: "Email verified!",
  },
  error: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ), iconBg: "bg-red-50", heading: "Verification failed",
  },
};

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeVerification } = useAuth();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("We're confirming your email address. This only takes a second.");
  const hasRun = useRef(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) { setStatus("error"); setMessage("Missing verification token. Please use the link from your email."); return; }
    if (hasRun.current) return;
    hasRun.current = true;
    api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((res) => {
        completeVerification(res.data.user, res.data.token);
        setStatus("success");
        setMessage("Your email has been confirmed. Redirecting you to chat…");
        setTimeout(() => navigate("/chat"), 1500);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "The link may be invalid or expired. Please request a new one.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { icon, iconBg, heading } = states[status];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12">
      <Link to="/" className="mb-8 cursor-pointer"><Logo size={32} textClassName="text-sm" /></Link>
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white px-8 py-10 text-center shadow-sm">
        <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full ${iconBg}`}>{icon}</div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">{heading}</h2>
        <p className="text-sm leading-relaxed text-gray-500">{message}</p>
        {status === "error" && (
          <div className="mt-6 space-y-3">
            <Link to="/login" className="block w-full rounded-lg bg-black py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 cursor-pointer">Back to login</Link>
            <button type="button" onClick={() => navigate("/signup")} className="block w-full rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer">Create a new account</button>
          </div>
        )}
        {status === "success" && (
          <div className="mt-5">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>Redirecting…
            </div>
          </div>
        )}
      </div>
      {status !== "error" && (
        <p className="mt-6 text-sm text-gray-500">
          Wrong account? <Link to="/login" className="font-medium text-gray-900 hover:underline">Sign in with another</Link>
        </p>
      )}
    </div>
  );
}
