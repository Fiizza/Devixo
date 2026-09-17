import { useRef, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { MarkdownContent } from "../components/ChatMessage.jsx";
import { streamGenerate } from "../api/generateStream.js";
import { useToast } from "../context/ToastContext.jsx";

const TYPES = [
  { key: "react-component", label: "React Component", placeholder: "e.g. A pricing card with a title, price, feature list, and a CTA button" },
  { key: "fastapi", label: "FastAPI Endpoint", placeholder: "e.g. A POST /users endpoint that validates email and hashes the password" },
  { key: "sql", label: "SQL Query", placeholder: "e.g. Top 5 customers by total order value in the last 30 days" },
  { key: "dockerfile", label: "Dockerfile", placeholder: "e.g. A multi-stage Dockerfile for a Node.js + Express app" },
  { key: "readme", label: "README", placeholder: "e.g. A CLI tool written in Python that converts CSV to JSON" },
  { key: "regex", label: "Regex", placeholder: "e.g. Match a valid international phone number" },
  { key: "explain", label: "Explain Code", placeholder: "Paste the code you want explained..." },
];

export default function CodeGenerator() {
  const { showToast } = useToast();
  const [type, setType] = useState("react-component");
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");

  const activeType = TYPES.find((t) => t.key === type);

  const handleTypeChange = (key) => {
    setType(key);
    setOutput("");
    setError("");
  };

  const pendingRef = useRef("");
  const frameRef = useRef(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || streaming) return;
    setError("");
    setOutput("");
    setStreaming(true);
    pendingRef.current = "";

    const flush = () => {
      frameRef.current = null;
      if (!pendingRef.current) return;
      const chunk = pendingRef.current;
      pendingRef.current = "";
      setOutput((prev) => prev + chunk);
    };

    await streamGenerate({
      type,
      prompt,
      onDelta: (delta) => {
        pendingRef.current += delta;
        if (!frameRef.current) frameRef.current = requestAnimationFrame(flush);
      },
      onDone: () => {
        if (frameRef.current) { cancelAnimationFrame(frameRef.current); frameRef.current = null; }
        flush();
        setStreaming(false);
      },
      onError: (msg) => {
        if (frameRef.current) { cancelAnimationFrame(frameRef.current); frameRef.current = null; }
        setError(msg); setStreaming(false); showToast(msg, "error");
      },
    });
  };

  const handleClear = () => { setPrompt(""); setOutput(""); setError(""); };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-gray-200 py-5 pl-14 pr-6 lg:px-8">
          <h1 className="text-xl font-semibold text-gray-900">Code Generator</h1>
          <p className="mt-0.5 text-sm text-gray-500">Describe what you need — one backend, seven generators.</p>
        </div>

        {/* Type selector */}
        <div className="shrink-0 border-b border-gray-200 px-8 py-3">
          <select value={type} onChange={(e) => handleTypeChange(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-gray-900">
            {TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  {activeType.key === "explain" ? "Your code" : "Describe what you need"}
                </label>
                {prompt && (
                  <button onClick={handleClear} className="text-xs font-medium text-gray-500 hover:text-gray-900 cursor-pointer">
                    Clear
                  </button>
                )}
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeType.placeholder}
                spellCheck={activeType.key !== "explain"}
                rows={activeType.key === "explain" ? 8 : 3}
                className={`w-full resize-none rounded-lg border border-gray-300 bg-white p-4 text-sm leading-relaxed text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-900 ${activeType.key === "explain" ? "font-mono text-[0.82rem]" : ""}`}
              />
              {error && (
                <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
              )}
              <button
                onClick={handleGenerate}
                disabled={streaming || !prompt.trim()}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                {streaming ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  "Generate"
                )}
              </button>
            </div>

            {/* Output */}
            {(output || streaming) && (
              <div className="mt-6 animate-fade-in-up">
                <p className="mb-2 text-sm font-medium text-gray-700">Result</p>
                <div className="code-surface code-text rounded-lg border p-5 text-sm leading-relaxed shadow-sm" style={{ borderColor: "#e5e7eb" }}>
                  <MarkdownContent content={output} isStreaming={streaming} />
                </div>
              </div>
            )}

            {!output && !streaming && (
              <div className="mt-6 flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50/60 text-center">
                <p className="text-sm font-medium text-gray-500">Your generated {activeType.label.toLowerCase()} will appear here</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}