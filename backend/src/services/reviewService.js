import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "openai/gpt-oss-120b";

const SYSTEM_PROMPT = `You are a senior code reviewer for Devixo. You will be given a code
snippet and its language. Analyze it carefully and respond with ONLY a single JSON object
(no markdown fences, no prose before or after) matching exactly this shape:

{
  "summary": "one or two sentence overall assessment",
  "bugs": [{ "title": "short title", "description": "explanation", "severity": "High" | "Medium" | "Low" }],
  "securityIssues": [{ "title": "short title", "description": "explanation", "severity": "High" | "Medium" | "Low" }],
  "performanceSuggestions": [{ "title": "short title", "description": "explanation", "severity": "High" | "Medium" | "Low" }],
  "improvements": [{ "title": "short title", "description": "explanation" }],
  "bestPractices": [{ "title": "short title", "description": "explanation" }]
}

Rules:
- Every array may be empty if there is genuinely nothing to report in that category — do not invent issues.
- Keep each "description" concise: 1-3 sentences, specific to this code.
- "severity" is required for bugs, securityIssues, and performanceSuggestions only.
- Output raw JSON only. No backticks, no "json" label, no explanation outside the object.`;

export async function reviewCode(code, language) {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.3,
    max_completion_tokens: 2048,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Language: ${language}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`` },
    ],
  });
  const raw = completion.choices?.[0]?.message?.content || "{}";
  try {
    const parsed = JSON.parse(raw);
    return {
      summary: parsed.summary || "Review complete.",
      bugs: Array.isArray(parsed.bugs) ? parsed.bugs : [],
      securityIssues: Array.isArray(parsed.securityIssues) ? parsed.securityIssues : [],
      performanceSuggestions: Array.isArray(parsed.performanceSuggestions) ? parsed.performanceSuggestions : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      bestPractices: Array.isArray(parsed.bestPractices) ? parsed.bestPractices : [],
    };
  } catch (err) {
    console.error("Failed to parse review JSON:", err.message, raw);
    return {
      summary: "The review completed, but the response couldn't be fully structured. Raw output below.",
      bugs: [], securityIssues: [], performanceSuggestions: [],
      improvements: [{ title: "Raw model output", description: raw.slice(0, 1000) }],
      bestPractices: [],
    };
  }
}
