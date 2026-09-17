import { ConversationModel } from "../models/conversationModel.js";
import { MessageModel } from "../models/messageModel.js";
import { streamChatCompletion, generateTitle } from "../services/aiService.js";

export const listConversations = async (req, res) => {
  const conversations = await ConversationModel.listByUser(req.userId);
  res.json({ conversations });
};

export const getConversation = async (req, res) => {
  const conversation = await ConversationModel.findById(req.params.id, req.userId);
  if (!conversation) return res.status(404).json({ message: "Conversation not found" });
  const messages = await MessageModel.listByConversation(conversation.id);
  res.json({ conversation, messages });
};

export const deleteConversation = async (req, res) => {
  await ConversationModel.delete(req.params.id, req.userId);
  res.json({ message: "Deleted" });
};

// Strips fenced code blocks and "File: x.ext" attachment headers so the
// title source is the human-written note, not dumped file/code content.
const stripForTitle = (text) =>
  text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^File:\s*.+$/gim, " ")
    .replace(/\s+/g, " ")
    .trim();

// Fallback used only if the AI title call fails — still avoids surfacing
// raw code/filenames as the conversation title.
const fallbackTitle = (strippedText, originalText) => {
  if (strippedText) {
    return strippedText.length > 50 ? `${strippedText.slice(0, 50)}...` : strippedText;
  }
  const fileMatch = originalText.match(/^File:\s*(.+)$/im);
  return fileMatch ? `Chat about ${fileMatch[1].trim()}` : "New Chat";
};

// Instant, no-API-call guesses for very common openers — covers the exact
// kind of message being used to test this (a plain greeting) even if the
// AI title call below is slow, rate-limited, or fails outright.
const QUICK_TITLE_PATTERNS = [
  { re: /^(hi|hello|hey|yo|hola|greetings)\b/i, title: "Greetings" },
  { re: /\b(explain|walk (me )?through|break down|what'?s?\s+in(side)?)\b.*\b(code|file|function|class|script)\b/i, title: "Code Explanation" },
  { re: /\bfix\s+(this|the|my)?\s*bugs?\b/i, title: "Bug Fix" },
  { re: /\bcode\s+review\b/i, title: "Code Review" },
];
const quickTitle = (text) => (QUICK_TITLE_PATTERNS.find((p) => p.re.test(text)) || {}).title || null;

const deriveInstantTitle = (text) => {
  const stripped = stripForTitle(text);
  return quickTitle(stripped) || fallbackTitle(stripped, text);
};

// The AI title call is a separate Groq request — if it's slow or hits a
// rate limit (easy to do on the free tier during heavy testing), it
// shouldn't delay the actual answer. Runs after the response has already
// started, and just updates the title in place once it resolves; the
// frontend already refreshes the sidebar when the response finishes, so
// no extra plumbing is needed for the updated title to show up.
const refineTitleInBackground = (conversationId, message) => {
  const stripped = stripForTitle(message);
  generateTitle(stripped || message)
    .then((aiTitle) => { if (aiTitle) return ConversationModel.updateTitle(conversationId, aiTitle); })
    .catch(() => {}); // best-effort — the instant title already covers this conversation
};

// A file attached once was getting re-sent in full on every later message
// in the same conversation, since we send the whole history each turn —
// that's what let a long conversation's token cost grow unbounded and
// eventually trip Groq's per-minute token limit. Older turns keep a short
// placeholder instead; only the current (last) message is left untouched,
// since that's the one actually being answered right now.
const FILE_BLOCK_RE = /File:\s*(.+?)\n<<<file:([a-z0-9]+)>>>\n[\s\S]*?<<<endfile:\2>>>/gi;
const stripOldFileAttachments = (text) =>
  text.replace(FILE_BLOCK_RE, (_match, name) => `[Previously attached file: ${name.trim()} — content omitted here to save space]`);

// Also cap how many past turns get sent at all, as a safety net for
// long conversations even without file attachments involved.
const MAX_HISTORY_MESSAGES = 12;

export const streamChat = async (req, res) => {
  const { message, conversationId } = req.body;
  if (!message || !message.trim()) return res.status(400).json({ message: "Message is required" });

  try {
    let conversation;
    let isNewConversation = false;
    if (conversationId) {
      conversation = await ConversationModel.findById(conversationId, req.userId);
      if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    } else {
      conversation = await ConversationModel.create(req.userId, deriveInstantTitle(message));
      isNewConversation = true;
    }

    if (isNewConversation) refineTitleInBackground(conversation.id, message);

    await MessageModel.create(conversation.id, "user", message);
    const history = await MessageModel.listByConversation(conversation.id);
    const trimmedHistory = history.slice(-MAX_HISTORY_MESSAGES);
    // Keep whichever message MOST RECENTLY attached a file fully intact —
    // not just the literal last message. Otherwise a follow-up like
    // "continue" (which isn't itself a file attachment) becomes the new
    // "last" message, so the actual file gets stripped to a placeholder
    // right when the model most needs it to keep answering about it.
    let lastFileMsgIdx = -1;
    for (let i = trimmedHistory.length - 1; i >= 0; i--) {
      if (trimmedHistory[i].content.includes("<<<file:")) { lastFileMsgIdx = i; break; }
    }
    const anthropicMessages = trimmedHistory.map((m, idx) => ({
      role: m.role,
      content: idx === lastFileMsgIdx ? m.content : stripOldFileAttachments(m.content),
    }));

    // Rough token estimate (~4 chars/token, a common approximation for
    // English text and code) — used only to size the completion budget
    // safely, not for anything requiring precision.
    const promptChars = anthropicMessages.reduce((sum, m) => sum + m.content.length, 0);
    const estimatedPromptTokens = Math.ceil(promptChars / 4) + 100; // +100 for the system prompt
    const completionBudget = Math.max(512, Math.min(3072, 7500 - estimatedPromptTokens));

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    res.write(`event: meta\ndata: ${JSON.stringify({ conversationId: conversation.id, title: conversation.title })}\n\n`);

    let fullText = "";
    await streamChatCompletion(anthropicMessages, (delta) => {
      fullText += delta;
      res.write(`data: ${JSON.stringify({ text: delta })}\n\n`);
    }, completionBudget);

    await MessageModel.create(conversation.id, "assistant", fullText);
    await ConversationModel.touch(conversation.id);
    res.write(`event: done\ndata: {}\n\n`);
    res.end();
  } catch (err) {
    console.error("Chat stream error:", err);
    const isRateLimit = err?.status === 429 || err?.status === 413 || err?.error?.error?.code === "rate_limit_exceeded";
    const userMessage = isRateLimit
      ? "Hit the per-minute usage limit on the free tier — wait about a minute and try again."
      : "AI stream failed";
    if (!res.headersSent) res.status(500).json({ message: "Server error starting chat stream" });
    else { res.write(`event: error\ndata: ${JSON.stringify({ message: userMessage })}\n\n`); res.end(); }
  }
};