import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import ChatMessage from "../components/ChatMessage.jsx";
import ChatInput from "../components/ChatInput.jsx";
import api from "../api/axios.js";
import { streamChat } from "../api/chatStream.js";
import { useToast } from "../context/ToastContext.jsx";

function groupByDate(conversations) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday); startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const sevenDaysAgo = new Date(startOfToday); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const groups = { Today: [], Yesterday: [], "Previous 7 days": [], Older: [] };
  for (const c of conversations) {
    const updated = new Date(c.updated_at);
    if (updated >= startOfToday) groups.Today.push(c);
    else if (updated >= startOfYesterday) groups.Yesterday.push(c);
    else if (updated >= sevenDaysAgo) groups["Previous 7 days"].push(c);
    else groups.Older.push(c);
  }
  return Object.entries(groups).filter(([, list]) => list.length > 0);
}

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(Boolean(id));
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const bottomRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const pendingRef = useRef("");
  const frameRef = useRef(null);
  const networkDoneRef = useRef(false);
  const revealedCharsRef = useRef(0);
  const skipHistoryFetchRef = useRef(false);

  const loadConversations = async () => {
    try { const res = await api.get("/chat/conversations"); setConversations(res.data.conversations); }
    catch { /* non-fatal */ }
    finally { setHistoryLoading(false); }
  };

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    if (!id) { setMessages([]); return; }
    if (skipHistoryFetchRef.current) {
      // This id change came from our own navigate() right after creating a
      // new conversation — the local messages (the user's message + the
      // live streaming reply) are already correct and already showing.
      // Re-fetching here would flash a loading skeleton over them and then
      // overwrite the in-progress reply with whatever's saved so far.
      skipHistoryFetchRef.current = false;
      return;
    }
    setLoadingHistory(true);
    api.get(`/chat/conversations/${id}`)
      .then((res) => setMessages(res.data.messages.map((m) => ({ role: m.role, content: m.content }))))
      .catch(() => setError("Couldn't load this conversation"))
      .finally(() => setLoadingHistory(false));
  }, [id]);

  // Only snap to bottom if the user was already there — otherwise a
  // reader scrolled up mid-stream would get yanked back down on every
  // update, which is its own kind of "shaking."
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) { bottomRef.current?.scrollIntoView({ behavior: "auto" }); return; }
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, search]);

  const groupedConversations = useMemo(() => groupByDate(filteredConversations), [filteredConversations]);
  const conversationToDelete = conversations.find((c) => c.id === confirmDeleteId);

  const handleSend = async (text, attachments = []) => {
    setError(""); setInputValue("");

    // Attachments render as chips while composing; once sent, fold their
    // content into the message the model (and history) actually sees.
    // A random tag per file makes the boundary unambiguous even if the
    // file's own content contains literal triple backticks (see
    // ChatMessage.jsx's extractFileChips for why plain ``` isn't safe here).
    const attachmentBlocks = attachments.map((a) => {
      const tag = Math.random().toString(36).slice(2, 10);
      return `File: ${a.name}\n<<<file:${tag}>>>\n\`\`\`\n${a.content}\n\`\`\`\n<<<endfile:${tag}>>>`;
    }).join("\n\n");
    const fullMessage = [text.trim(), attachmentBlocks].filter(Boolean).join("\n\n");
    if (!fullMessage) return;

    setMessages((prev) => [...prev, { role: "user", content: fullMessage }, { role: "assistant", content: "" }]);
    setStreaming(true);
    let convId = id;

    // pendingRef holds text received but not yet shown. Groq can generate
    // far faster than reading speed, so flushing everything the instant it
    // arrives looks like chunks dumping onto the screen rather than a
    // smooth type-out. Instead, reveal at a steady pace each frame, and
    // auto-accelerate if a backlog builds up so we never drag noticeably
    // behind the real response — this also means "streaming" shouldn't
    // clear until the reveal has actually caught up, not just when the
    // network call finishes.
    pendingRef.current = "";
    networkDoneRef.current = false;
    revealedCharsRef.current = 0;

    const tick = () => {
      frameRef.current = null;
      if (pendingRef.current) {
        const remaining = pendingRef.current;
        // Re-rendering the whole markdown tree gets more expensive as the
        // response grows (more sections, more code blocks), so a fixed
        // reveal rate visibly slows down near the end of a long answer.
        // Raise the floor as more has already been shown, to keep the
        // pace roughly steady regardless of response length.
        const revealFloor = revealedCharsRef.current > 3000 ? 14 : revealedCharsRef.current > 1200 ? 8 : 5;
        const revealCount = Math.max(revealFloor, Math.ceil(remaining.length / 6));
        const chunk = remaining.slice(0, revealCount);
        pendingRef.current = remaining.slice(revealCount);
        revealedCharsRef.current += chunk.length;
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = { ...last, content: last.content + chunk };
          return updated;
        });
      }
      if (pendingRef.current || !networkDoneRef.current) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setStreaming(false);
        loadConversations();
      }
    };

    await streamChat({
      message: fullMessage, conversationId: convId,
      onMeta: (meta) => { if (!convId) { convId = meta.conversationId; skipHistoryFetchRef.current = true; navigate(`/chat/${convId}`, { replace: true }); loadConversations(); } },
      onDelta: (delta) => {
        pendingRef.current += delta;
        if (!frameRef.current) frameRef.current = requestAnimationFrame(tick);
      },
      onDone: () => {
        networkDoneRef.current = true;
        // Don't force-flush the remaining backlog — let it keep revealing
        // at its own (auto-accelerating) pace so the tail end still reads
        // like typing, not a sudden dump the instant the network finishes.
        if (!frameRef.current) frameRef.current = requestAnimationFrame(tick);
      },
      onError: (msg) => {
        if (frameRef.current) { cancelAnimationFrame(frameRef.current); frameRef.current = null; }
        setError(msg); setStreaming(false);
      },
    });
  };

  const handleNewChat = () => navigate("/chat");
  const requestDelete = (convId, e) => { e.stopPropagation(); setConfirmDeleteId(convId); };
  const confirmDelete = async () => {
    const convId = confirmDeleteId;
    const title = conversations.find((c) => c.id === convId)?.title;
    setConfirmDeleteId(null);
    await api.delete(`/chat/conversations/${convId}`);
    await loadConversations();
    if (Number(id) === convId) navigate("/chat");
    showToast(title ? `Deleted "${title}"` : "Conversation deleted", "success");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar history={{
        groups: groupedConversations, loading: historyLoading, search, onSearch: setSearch, onNewChat: handleNewChat,
        onDelete: requestDelete, onSelect: (convId) => navigate(`/chat/${convId}`), activeId: Number(id) || null,
      }} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden px-6 pb-6 pt-14 lg:pt-6">
          <div className="mx-auto max-w-3xl space-y-4">
            {loadingHistory && (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className={`flex items-start gap-2.5 ${i % 2 ? "flex-row-reverse" : ""}`}>
                    <div className="h-7 w-7 shrink-0 animate-pulse rounded-lg bg-gray-100" />
                    <div className={`h-16 w-2/3 animate-pulse rounded-2xl bg-gray-100`} style={{ animationDelay: `${i * 0.1}s` }} />
                  </div>
                ))}
              </div>
            )}
            {!loadingHistory && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <h2 className="mb-1.5 text-xl font-medium text-gray-900">What's on your mind today?</h2>
                <p className="max-w-sm text-sm text-gray-500">Drop in some code, an error, or an idea — let's work through it together.</p>
              </div>
            )}
            {!loadingHistory && messages.map((m, i) => (
              <div key={i} className="animate-fade-in-up">
                <ChatMessage role={m.role} content={m.content} isStreaming={streaming && i === messages.length - 1} />
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        {error && <p className="shrink-0 border-t border-gray-200 bg-red-50 px-6 py-2 text-center text-sm text-red-600">{error}</p>}

        <ChatInput value={inputValue} onChange={setInputValue} onSend={handleSend} disabled={streaming} autoFocus={messages.length === 0} />
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setConfirmDeleteId(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
            <h3 className="mb-1.5 text-base font-semibold text-gray-900">Delete this conversation?</h3>
            <p className="mb-5 text-sm text-gray-500">
              {conversationToDelete ? <>"{conversationToDelete.title}" will be permanently deleted. This can't be undone.</> : "This conversation will be permanently deleted. This can't be undone."}
            </p>
            <div className="flex justify-end gap-2.5">
              <button onClick={() => setConfirmDeleteId(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={confirmDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}