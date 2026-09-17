import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const SYSTEM_PROMPT =
  "You are Devixo, a helpful assistant for developers. Use markdown formatting and fenced code blocks with a language tag for any code. " +
  "When asked to explain a file or piece of code — whether or not the user says 'line by line' — cover it thoroughly: walk through every section and every meaningful rule/statement, don't skip parts or collapse several into one vague summary line. If the user explicitly says 'line by line' or 'step by step', go further and address every individual line in order. For quick factual questions unrelated to explaining code, be clear and to the point instead.";
const MODEL = "openai/gpt-oss-120b";

export async function streamChatCompletion(messages, onDelta, maxCompletionTokens = 3072) {
  const stream = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    stream: true,
    temperature: 0.7,
    // Groq's free tier caps this model at 8K tokens/minute total (prompt +
    // completion). The caller sizes this dynamically based on how large
    // the prompt already is — a long-running conversation with a file
    // attached can have a big prompt on its own, so always requesting a
    // fixed budget on top of that risks going over the limit.
    max_completion_tokens: maxCompletionTokens,
  });
  let finishReason = null;
  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content;
    if (delta) onDelta(delta);
    if (chunk.choices?.[0]?.finish_reason) finishReason = chunk.choices[0].finish_reason;
  }
  if (finishReason === "length") {
    onDelta('\n\n_(Response cut off — it hit the length limit. Reply "continue" and I\'ll pick up where I left off.)_');
  }
}

const TITLE_SYSTEM_PROMPT =
  "Generate a short chat title (2-5 words, Title Case, no quotes, no trailing punctuation) that names the general topic of the user's message — e.g. 'Code Explanation', 'React Bug Fix', 'API Auth Help'. Describe the subject or task in general terms. Never include filenames, code, variable names, or file extensions in the title. Reply with only the title text.";

// Best-effort — a short, non-streaming call so a new conversation gets a
// meaningful topic title instead of a raw truncation of the first message
// (which, once file attachments are involved, is just "File: name.js").
export async function generateTitle(message) {
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: TITLE_SYSTEM_PROMPT },
        { role: "user", content: message.slice(0, 1500) },
      ],
      temperature: 0.3,
      max_completion_tokens: 16,
    });
    const title = completion.choices?.[0]?.message?.content?.trim().replace(/^["'.]+|["'.]+$/g, "");
    return title || null;
  } catch (err) {
    console.warn("Title generation failed, using fallback title:", err?.message || err);
    return null; // caller falls back to a heuristic title
  }
}