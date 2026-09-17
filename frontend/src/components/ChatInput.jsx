import { useEffect, useRef, useState } from "react";

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const AttachIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);
const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Text-based files only — reading a binary file as text would just insert
// garbage into the prompt, so we deliberately keep this list narrow.
const TEXT_FILE_EXTENSIONS = [
  ".txt", ".md", ".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".go", ".rs",
  ".rb", ".php", ".json", ".css", ".html", ".sql", ".yml", ".yaml", ".c",
  ".cpp", ".cs", ".sh", ".env", ".xml", ".log", ".ipynb",
];
const MAX_FILE_CHARS = 8000;
const MAX_TEXTAREA_HEIGHT = 200; // px — beyond this it scrolls instead of growing

// .ipynb is JSON, not prose — dumping the raw JSON (execution_count,
// metadata, output blobs, etc.) wastes chars and confuses the model.
// Pull out just the cell source so what gets attached is actually readable.
function extractIpynbText(raw) {
  try {
    const nb = JSON.parse(raw);
    const cells = Array.isArray(nb.cells) ? nb.cells : [];
    if (!cells.length) return raw;
    return cells
      .map((c, i) => {
        const src = Array.isArray(c.source) ? c.source.join("") : c.source || "";
        const label = c.cell_type === "markdown" ? "Markdown" : "Code";
        return `# --- Cell ${i + 1} (${label}) ---\n${src}`;
      })
      .join("\n\n");
  } catch {
    return raw; // not valid JSON — fall back to raw text rather than failing
  }
}

export default function ChatInput({ value, onChange, onSend, disabled, autoFocus }) {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [attachError, setAttachError] = useState("");

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  // Auto-grow the textarea as the user types, up to a max height, then
  // let it scroll internally instead of growing forever.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [value]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled) return;
    if (!value.trim() && attachments.length === 0) return;
    onSend(value, attachments);
    setAttachments([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // ── Attach: reads a text/code file client-side, keeps it as a file chip
  // (like Claude's file attachments) instead of dumping its content into
  // the textarea — the textarea stays free for the user's own message.
  const handleAttachClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    setAttachError("");

    const ext = `.${file.name.split(".").pop()}`.toLowerCase();
    if (!TEXT_FILE_EXTENSIONS.includes(ext)) {
      setAttachError(`Couldn't attach "${file.name}" — only text/code files are supported.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      let text = String(reader.result || "");
      if (ext === ".ipynb") text = extractIpynbText(text);
      text = text.slice(0, MAX_FILE_CHARS);
      setAttachments((prev) => [...prev, { id: `${file.name}-${Date.now()}`, name: file.name, content: text }]);
      textareaRef.current?.focus();
    };
    reader.onerror = () => setAttachError(`Couldn't read "${file.name}" — please try again.`);
    reader.readAsText(file);
  };

  const removeAttachment = (id) => setAttachments((prev) => prev.filter((a) => a.id !== id));

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white px-6 py-4">
      <div className="mx-auto max-w-3xl">
        {attachError && <p className="mb-2 text-xs text-red-500">{attachError}</p>}

        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((a) => (
              <span key={a.id} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 py-1 pl-2 pr-1 text-xs font-medium text-gray-700">
                <FileIcon />
                <span className="max-w-[160px] truncate">{a.name}</span>
                <button type="button" onClick={() => removeAttachment(a.id)} title="Remove file"
                  className="flex h-4 w-4 items-center justify-center rounded text-gray-400 hover:bg-gray-200 hover:text-gray-700 cursor-pointer">
                  <CloseIcon />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm transition-colors focus-within:border-gray-900">
          <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Message Devixo..."
            disabled={disabled}
            style={{ maxHeight: MAX_TEXTAREA_HEIGHT }}
            className="flex-1 resize-none overflow-y-auto bg-transparent py-1.5 text-sm text-gray-900 placeholder-gray-400 outline-none disabled:opacity-50"
          />

          <div className="flex items-center gap-1 pb-0.5">
            <button
              type="button"
              onClick={handleAttachClick}
              title="Attach a text or code file"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
            >
              <AttachIcon />
            </button>

            <button
              type="submit"
              disabled={disabled || (!value.trim() && attachments.length === 0)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-white transition-colors cursor-pointer ${
                disabled
                  ? "animate-pulse bg-black cursor-not-allowed"
                  : !value.trim() && attachments.length === 0
                  ? "bg-black opacity-30 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
              }`}
            >
              <SendIcon />
            </button>
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-gray-400">Shift + Enter for new line</p>
      </div>
    </form>
  );
}