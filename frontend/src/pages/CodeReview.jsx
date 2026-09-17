import { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import api from "../api/axios.js";
import { useToast } from "../context/ToastContext.jsx";

const LANGUAGES = ["JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "SQL", "HTML/CSS", "Other"];

const SAMPLE_CODE = `function getUser(id) {
  const user = users.find(u => u.id == id);
  return user.name;
}

async function fetchData(url) {
  const res = await fetch(url);
  const data = res.json();
  return data;
}`;

const SEVERITY_STYLES = { High: "bg-gray-900 text-white", Medium: "bg-gray-500 text-white", Low: "bg-gray-200 text-gray-600" };

const SECTIONS = [
  { key: "bugs", label: "Bugs", hasSeverity: true },
  { key: "securityIssues", label: "Security Issues", hasSeverity: true },
  { key: "performanceSuggestions", label: "Performance Suggestions", hasSeverity: true },
  { key: "improvements", label: "Improvements", hasSeverity: false },
  { key: "bestPractices", label: "Best Practices", hasSeverity: false },
];

const CodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
);

function ResultSection({ label, hasSeverity, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h3 className="flex items-center gap-2 px-5 pb-2 pt-4 text-sm font-semibold text-gray-900">
        {label}<span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">{items.length}</span>
      </h3>
      <div>
        {items.map((item, i) => (
          <div key={i} className="border-t border-gray-100 px-5 py-3 first:border-t-0">
            <div className="mb-1 flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-gray-900">{item.title}</p>
              {hasSeverity && item.severity && (
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_STYLES[item.severity] || SEVERITY_STYLES.Low}`}>{item.severity}</span>
              )}
            </div>
            <p className="text-sm leading-relaxed text-gray-500">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CodeReview() {
  const { showToast } = useToast();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [review, setReview] = useState(null);

  const totalIssues = review ? SECTIONS.reduce((sum, s) => sum + (review[s.key]?.length || 0), 0) : 0;

  const handleReview = async () => {
    if (!code.trim()) { setError("Paste some code first."); return; }
    setError(""); setLoading(true); setReview(null);
    try { const res = await api.post("/review", { code, language }); setReview(res.data.review); }
    catch (err) { const msg = err.response?.data?.message || "Something went wrong. Please try again."; setError(msg); showToast(msg, "error"); }
    finally { setLoading(false); }
  };

  const handleTrySample = () => { setCode(SAMPLE_CODE); setLanguage("JavaScript"); setReview(null); setError(""); };
  const handleClear = () => { setCode(""); setReview(null); setError(""); };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-gray-200 py-5 pl-14 pr-6 lg:px-8">
          <h1 className="text-xl font-semibold text-gray-900">Code Review</h1>
          <p className="mt-0.5 text-sm text-gray-500">Paste your code, choose a language, and get structured feedback.</p>
        </div>
        <div className="flex-1 overflow-hidden px-8 py-6">
          <div className="mx-auto grid h-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="flex min-h-0 flex-col overflow-y-auto pr-1">
              <div className="mb-3 flex items-center justify-between">
                <select value={language} onChange={(e) => setLanguage(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-gray-900">
                  {LANGUAGES.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
                </select>
                <div className="flex items-center gap-2">
                  <button onClick={handleTrySample} className="text-xs font-medium text-gray-500 hover:text-gray-900 cursor-pointer">Try a sample</button>
                  {code && <button onClick={handleClear} className="text-xs font-medium text-gray-500 hover:text-gray-900 cursor-pointer">Clear</button>}
                </div>
              </div>
              <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder="Paste your code here..." spellCheck={false}
                className="h-80 w-full resize-none rounded-lg border border-gray-300 bg-white p-4 font-mono text-[0.82rem] leading-relaxed text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-900" />
              {error && <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
              <button onClick={handleReview} disabled={loading || !code.trim()}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer">
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>Analyzing your code
                  </>
                ) : (<><CodeIcon />Review Code</>)}
              </button>
            </div>
            <div className="flex min-h-0 flex-col overflow-y-auto pr-1">
              {!review && !loading && (
                <div className="flex h-80 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50/60 text-center lg:h-full">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200 text-gray-500"><CodeIcon /></div>
                  <p className="text-sm font-medium text-gray-500">Your review will appear here</p>
                  <p className="mt-1 max-w-xs text-xs text-gray-400">Paste code on the left and click "Review Code" to get started.</p>
                </div>
              )}
              {loading && (
                <div className="flex h-80 flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50/60 text-center lg:h-full">
                  <svg className="mb-3 h-6 w-6 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-600">Analyzing your code...</p>
                  <p className="mt-1 text-xs text-gray-400">Checking for bugs, security issues, and more</p>
                </div>
              )}
              {review && !loading && (
                <div className="animate-fade-in-up overflow-hidden rounded-lg border border-gray-200">
                  <div className="border-b border-gray-200 bg-gray-50/60 px-5 py-4">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">Summary</p>
                      <span className="rounded-full bg-gray-900 px-2 py-0.5 text-xs font-medium text-white">{totalIssues} {totalIssues === 1 ? "finding" : "findings"}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-600">{review.summary}</p>
                  </div>
                  {totalIssues === 0 && <p className="px-5 py-4 text-sm text-gray-500">No issues found in the categories we check. Nice work.</p>}
                  <div className="divide-y divide-gray-100">
                    {SECTIONS.map((s) => <ResultSection key={s.key} label={s.label} hasSeverity={s.hasSeverity} items={review[s.key]} />)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}