import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import Sidebar from "../components/Sidebar.jsx";
import api from "../api/axios.js";
import { useToast } from "../context/ToastContext.jsx";

const LANGUAGES = ["JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "SQL", "Other"];

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const SAMPLE = {
  errorMessage: "TypeError: Cannot read properties of undefined (reading 'name')",
  stackTrace: "at getUser (app.js:12:24)\nat main (app.js:20:10)",
  code: `function getUser(id) {
  const user = users.find(u => u.id === id);
  return user.name;
}`,
};

function FixedCodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* denied */ }
  };
  return (
    <div className="overflow-hidden rounded-lg border border-gray-300">
      <div className="flex select-none items-center justify-between border-b border-gray-300 bg-gray-100 px-3 py-2 text-xs text-gray-600">
        <span className="rounded bg-gray-900 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-white">{language}</span>
        <button onClick={handleCopy}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
            copied ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-200 hover:text-gray-900"
          }`}>
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
      <SyntaxHighlighter language={language} style={oneLight}
        customStyle={{ margin: 0, padding: "1rem", fontSize: "0.82rem", background: "#ffffff", lineHeight: 1.6 }}>
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export default function BugFixer() {
  const { showToast } = useToast();
  const [errorMessage, setErrorMessage] = useState("");
  const [stackTrace, setStackTrace] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const hasInput = errorMessage.trim() || stackTrace.trim() || code.trim();

  const handleFix = async () => {
    if (!hasInput) { setError("Add at least an error message, stack trace, or code."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const res = await api.post("/bugfix", { errorMessage, stackTrace, code, language });
      setResult(res.data.result);
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTrySample = () => {
    setErrorMessage(SAMPLE.errorMessage);
    setStackTrace(SAMPLE.stackTrace);
    setCode(SAMPLE.code);
    setLanguage("JavaScript");
    setResult(null); setError("");
  };

  const handleClear = () => {
    setErrorMessage(""); setStackTrace(""); setCode(""); setResult(null); setError("");
  };

  const fieldClass = "w-full resize-none overflow-y-auto bg-transparent font-mono text-[0.8rem] leading-relaxed text-gray-900 placeholder-gray-400 outline-none";

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-gray-200 py-5 pl-14 pr-6 lg:px-8">
          <h1 className="text-xl font-semibold text-gray-900">Bug Fixer</h1>
          <p className="mt-0.5 text-sm text-gray-500">Paste an error, a stack trace, and/or code — get the root cause and a fix.</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
            {/* Inputs */}
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex items-center justify-between">
                <select value={language} onChange={(e) => setLanguage(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-gray-900">
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <div className="flex items-center gap-2">
                  <button onClick={handleTrySample} className="text-xs font-medium text-gray-500 hover:text-gray-900 cursor-pointer">Try a sample</button>
                  {hasInput && <button onClick={handleClear} className="text-xs font-medium text-gray-500 hover:text-gray-900 cursor-pointer">Clear</button>}
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-300">
                <div className="border-b border-gray-200 p-4">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Error message</label>
                  <textarea value={errorMessage} onChange={(e) => setErrorMessage(e.target.value)}
                    placeholder="e.g. TypeError: Cannot read properties of undefined (reading 'name')"
                    spellCheck={false} rows={2} style={{ maxHeight: 96 }} className={fieldClass} />
                </div>

                <div className="border-b border-gray-200 p-4">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Stack trace <span className="font-normal text-gray-400">(optional)</span></label>
                  <textarea value={stackTrace} onChange={(e) => setStackTrace(e.target.value)}
                    placeholder="Paste the stack trace here..." spellCheck={false} rows={3} style={{ maxHeight: 140 }} className={fieldClass} />
                </div>

                <div className="p-4">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Code</label>
                  <textarea value={code} onChange={(e) => setCode(e.target.value)}
                    placeholder="Paste the relevant code here..." spellCheck={false} rows={8} style={{ maxHeight: 260 }} className={fieldClass} />
                </div>
              </div>

              {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

              <button onClick={handleFix} disabled={loading || !hasInput}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer">
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>Diagnosing...
                  </>
                ) : ("Fix It")}
              </button>
            </div>

            {/* Results */}
            <div className="flex flex-1 flex-col">
              {!result && !loading && (
                <div className="flex h-80 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50/60 text-center">
                  <p className="text-sm font-medium text-gray-500">Your diagnosis will appear here</p>
                </div>
              )}

              {loading && (
                <div className="flex h-80 flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50/60 text-center">
                  <svg className="mb-3 h-6 w-6 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-600">Diagnosing the issue...</p>
                </div>
              )}

              {result && !loading && (
                <div className="animate-fade-in-up space-y-5">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="mb-1 text-sm font-semibold text-gray-900">Root Cause</p>
                    <p className="text-sm leading-relaxed text-gray-600">{result.rootCause}</p>
                  </div>

                  {result.fixedCode && (
                    <div>
                      <p className="mb-2 text-sm font-semibold text-gray-900">Fixed Code</p>
                      <FixedCodeBlock code={result.fixedCode} language={result.language} />
                    </div>
                  )}

                  {result.explanation && (
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <p className="mb-1 text-sm font-semibold text-gray-900">Explanation</p>
                      <p className="text-sm leading-relaxed text-gray-600">{result.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}