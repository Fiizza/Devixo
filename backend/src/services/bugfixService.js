import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "openai/gpt-oss-120b";

const SYSTEM_PROMPT = `You are an expert debugger for Devixo. The user will give you some
combination of: an error message, a stack trace, and/or a code snippet. Diagnose the bug and
respond with ONLY a single JSON object (no markdown fences, no prose outside it) matching
exactly this shape:

{
  "rootCause": "clear explanation of what's actually wrong and why it happens",
  "language": "the programming language of the code (best guess if not given)",
  "fixedCode": "the corrected code as a plain string, no markdown fences inside this field",
  "explanation": "what was changed and why it fixes the problem, 2-4 sentences"
}

Rules:
- If no code was provided, do your best to infer likely fixed code from the error/stack trace,
  or explain in "fixedCode" that no code was given to fix (as a plain string, not code).
- Keep "rootCause" and "explanation" concise and specific — reference actual variable/function
  names from the input where possible, not generic advice.
- Output raw JSON only.`;

export async function fixBug({ errorMessage, stackTrace, code, language }) {
  const parts = [];
  if (errorMessage?.trim()) parts.push(`Error message:\n${errorMessage.trim()}`);
  if (stackTrace?.trim()) parts.push(`Stack trace:\n${stackTrace.trim()}`);
  if (code?.trim()) parts.push(`Code (${language || "unknown language"}):\n${code.trim()}`);

  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.3,
    max_completion_tokens: 2500,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: parts.join("\n\n") },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content || "{}";
  try {
    const parsed = JSON.parse(raw);
    return {
      rootCause: parsed.rootCause || "Unable to determine root cause from the given information.",
      language: parsed.language || language || "text",
      fixedCode: parsed.fixedCode || "",
      explanation: parsed.explanation || "",
    };
  } catch (err) {
    console.error("Failed to parse bugfix JSON:", err.message, raw);
    return {
      rootCause: "The analysis completed, but the response couldn't be fully structured.",
      language: language || "text",
      fixedCode: raw.slice(0, 2000),
      explanation: "",
    };
  }
}
