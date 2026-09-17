import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useAuth } from "../context/AuthContext.jsx";

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
const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);

// The model occasionally stuffs a mini code snippet inside a markdown table
// cell using a literal two-character "\n" (table cells can't contain a real
// line break without breaking the row). Left alone it shows up on screen as
// a visible backslash-n. Collapse those to a space — but only outside real
// fenced code blocks, so an intentional "\n" inside actual source code (e.g.
// print("a\nb")) is never touched.
function normalizeEscapedSequences(text) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts
    .map((part) => (part.startsWith("```") ? part : part.replace(/\\n/g, " ").replace(/\\t/g, " ").replace(/ {2,}/g, " ")))
    .join("");
}

// This app embeds a user's attached file wrapped in a random per-file tag
// (not plain "```", since a file's own source can legitimately contain
// triple backticks — ChatMessage.jsx itself is a good example — which
// would fool a naive "up to the next ```" match and leak part of the file
// as raw text). The tag makes the boundary unambiguous regardless of what
// the file itself contains. The full block still reaches the model
// unchanged; this only changes what's rendered on screen.
const FILE_BLOCK_RE = /File:\s*(.+?)\n<<<file:([a-z0-9]+)>>>\n[\s\S]*?<<<endfile:\2>>>/gi;
// Legacy format from before the tag existed — kept so older stored
// messages still collapse to a chip. Still vulnerable to the same
// collision the tag fixes, but only for messages sent before this fix.
const LEGACY_FILE_BLOCK_RE = /File:\s*(.+?)\n```[^\n]*\n[\s\S]*?```/g;

function extractFileChips(content) {
  const files = [];
  let text = content.replace(FILE_BLOCK_RE, (_match, name) => { files.push(name.trim()); return ""; });
  text = text.replace(LEGACY_FILE_BLOCK_RE, (_match, name) => { files.push(name.trim()); return ""; });
  return { text: text.trim(), files };
}

function CodeBlock({ className, children, isStreaming }) {
  const [copied, setCopied] = useState(false);
  const language = (className || "").replace("language-", "") || "plaintext";
  const code = String(children).replace(/\n$/, "");
  const lineCount = code.split("\n").length;

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* denied */ }
  };

  return (
    <div className="code-surface animate-cell-in my-3 w-full min-w-0 overflow-hidden rounded-lg border" style={{ borderColor: "#d1d5db" }}>
      <div className="code-surface-header flex select-none items-center justify-between border-b px-3 py-2 text-xs">
        <span className="flex items-center gap-2">
          <span className="rounded bg-gray-900 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-white">{language}</span>
          <span className="code-text-muted">{lineCount} {lineCount === 1 ? "line" : "lines"}</span>
        </span>
        <button onClick={handleCopy} disabled={isStreaming || !code.trim()}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            isStreaming || !code.trim() ? "code-text-muted cursor-not-allowed"
              : copied ? "cursor-pointer bg-gray-900 text-white"
              : "code-surface code-copy-btn cursor-pointer"
          }`}>
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
      {!code.trim() ? (
        <p className="code-surface code-text-muted p-4 text-sm italic">
          {isStreaming ? "Writing code..." : "(No code was returned for this block.)"}
        </p>
      ) : isStreaming ? (
        <pre ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}
          className="code-surface code-text w-full min-w-0 overflow-auto p-4 font-mono text-[0.82rem] leading-[1.6]" style={{ margin: 0, maxHeight: 420 }}>
          <code>{code}</code>
        </pre>
      ) : (
        <SyntaxHighlighter language={language} style={oneLight} showLineNumbers={lineCount > 4}
          customStyle={{ margin: 0, padding: "1rem", fontSize: "0.82rem", background: "#ffffff", color: "#1f2937", lineHeight: 1.6, width: "100%", maxHeight: 420, overflow: "auto" }}
          lineNumberStyle={{ color: "#c4c4c8", minWidth: "2em" }}>
          {code}
        </SyntaxHighlighter>
      )}
    </div>
  );
}

const TypingDots = () => (
  <span className="inline-flex gap-1 py-1">
    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
  </span>
);

const AssistantAvatar = () => (
  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8 5 3 12 8 19" /><polyline points="16 5 21 12 16 19" />
    </svg>
  </div>
);

function UserAvatar() {
  const { user } = useAuth();
  const initials = user?.name ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U";
  return <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold text-gray-700">{initials}</div>;
}

function CopyMessageButton({ content, isUser }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* denied */ }
  };
  return (
    <button onClick={handleCopy}
      className={`mt-2 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer ${
        isUser ? "text-white/70 hover:text-white" : "text-gray-400 hover:text-gray-700"
      }`}>
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? "Copied message" : "Copy message"}
    </button>
  );
}

// The markdown/code rendering on its own, with no avatar or chat-bubble
// chrome — used inside chat bubbles here, and reused as-is for full-width
// "output card" results (Code Generator, etc.) so those aren't squeezed
// into a bubble's 80%-width column.
export function MarkdownContent({ content, isStreaming = false, isUser = false }) {
  if (!content) return <TypingDots />;
  const normalized = normalizeEscapedSequences(content);

  // A code block should only render in the lightweight "still typing"
  // preview if IT is the one currently growing — not just because the
  // overall message hasn't finished yet. Otherwise, on any answer with
  // several code blocks (like a section-by-section file walkthrough),
  // every earlier block stays stuck in preview mode for the whole reply
  // and then ALL of them flip to syntax-highlighted at the same instant
  // the message finishes — a visible "everything shakes at once" moment.
  const fenceCount = (normalized.match(/```/g) || []).length;
  const hasOpenTrailingFence = isStreaming && fenceCount % 2 === 1;
  const completedFenceBlocks = Math.floor(fenceCount / 2);
  let blockIndex = 0;

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
      code({ className, children, ...props }) {
        const codeString = String(children);
        const isInline = !className && !codeString.includes("\n");
        if (isInline) {
          return <code className={`rounded px-1.5 py-0.5 font-mono text-[0.85em] ${isUser ? "bg-white/15" : "code-surface code-text"}`} {...props}>{children}</code>;
        }
        const thisBlockIsStreaming = hasOpenTrailingFence && blockIndex === completedFenceBlocks;
        blockIndex += 1;
        return <CodeBlock className={className} isStreaming={thisBlockIsStreaming}>{children}</CodeBlock>;
      },
      p({ children }) { return <p className="mb-2.5 whitespace-pre-wrap leading-relaxed last:mb-0">{children}</p>; },
      ul({ children }) { return <ul className="mb-2.5 list-disc space-y-1.5 pl-5 last:mb-0">{children}</ul>; },
      ol({ children }) { return <ol className="mb-2.5 list-decimal space-y-1.5 pl-5 last:mb-0">{children}</ol>; },
      li({ children }) { return <li className="leading-relaxed">{children}</li>; },
      h1({ children }) { return <h1 className="mb-2 mt-4 text-lg font-semibold text-gray-900 first:mt-0">{children}</h1>; },
      h2({ children }) { return <h2 className="mb-2 mt-4 text-base font-semibold text-gray-900 first:mt-0">{children}</h2>; },
      h3({ children }) { return <h3 className="mb-1.5 mt-3 text-sm font-semibold text-gray-900 first:mt-0">{children}</h3>; },
      hr() { return <hr className="my-4 border-gray-200" />; },
      blockquote({ children }) {
        return <blockquote className={`my-2.5 border-l-2 pl-3 italic ${isUser ? "border-white/30 text-white/80" : "border-gray-300 text-gray-500"}`}>{children}</blockquote>;
      },
      strong({ children }) { return <strong className="font-semibold">{children}</strong>; },
      table({ children }) { return <div className="my-3 overflow-x-auto rounded-lg border border-gray-200"><table className="w-full border-collapse text-left text-xs">{children}</table></div>; },
      thead({ children }) { return <thead className="bg-gray-50 text-gray-600">{children}</thead>; },
      th({ children }) { return <th className="border-b border-gray-200 px-3 py-2 font-semibold">{children}</th>; },
      td({ children }) { return <td className="border-b border-gray-100 px-3 py-2 text-gray-700">{children}</td>; },
      a({ children, href }) {
        return <a href={href} target="_blank" rel="noreferrer" className={isUser ? "underline" : "text-gray-900 underline underline-offset-2"}>{children}</a>;
      },
    }}>{normalized}</ReactMarkdown>
  );
}

export default function ChatMessage({ role, content, isStreaming = false }) {
  const isUser = role === "user";
  const { text: displayText, files } = isUser ? extractFileChips(content) : { text: content, files: [] };
  return (
    <div className={`group flex min-w-0 items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      {isUser ? <UserAvatar /> : <AssistantAvatar />}
      <div className={`flex min-w-0 max-w-[80%] flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div className={`min-w-0 rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser ? "bg-black text-white" : "border border-gray-200 bg-white text-gray-800 shadow-sm"}`}>
          {files.length > 0 && (
            <div className={`flex flex-wrap gap-1.5 ${displayText ? "mb-2" : ""}`}>
              {files.map((name, i) => (
                <span key={i} className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium ${isUser ? "bg-white/15 text-white" : "border border-gray-200 bg-gray-50 text-gray-700"}`}>
                  <FileIcon />
                  <span className="max-w-[160px] truncate">{name}</span>
                </span>
              ))}
            </div>
          )}
          {displayText && <MarkdownContent content={displayText} isStreaming={isStreaming} isUser={isUser} />}
        </div>
        {content && !isStreaming && <CopyMessageButton content={content} isUser={isUser} />}
      </div>
    </div>
  );
}