import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "openai/gpt-oss-120b";

// One backend endpoint, different system prompt per generation type —
// exactly the Day 4 plan.
export const GENERATOR_TYPES = {
  "react-component": {
    label: "React Component",
    system:
      "You are an expert React developer. Generate a clean, modern functional React component " +
      "based on the user's request, using hooks where appropriate and Tailwind utility classes for " +
      "styling. Return the full component in a single fenced ```jsx code block, followed by a short " +
      "2-3 sentence explanation of props and usage.",
  },
  fastapi: {
    label: "FastAPI Endpoint",
    system:
      "You are an expert Python/FastAPI developer. Generate a complete, working FastAPI route or " +
      "small router based on the user's request, including imports and Pydantic models where " +
      "relevant. Return the code in a single fenced ```python code block, followed by a short " +
      "explanation.",
  },
  sql: {
    label: "SQL Query",
    system:
      "You are an expert SQL developer. Generate a correct, efficient SQL query based on the user's " +
      "request. Return the query in a single fenced ```sql code block, followed by a short " +
      "explanation of what it does.",
  },
  dockerfile: {
    label: "Dockerfile",
    system:
      "You are an expert in Docker and containerization. Generate a production-ready, minimal " +
      "Dockerfile based on the user's request (assume reasonable defaults if details are missing). " +
      "Return it in a single fenced ```dockerfile code block, followed by a short explanation of key " +
      "choices (base image, layer caching, etc).",
  },
  readme: {
    label: "README",
    system:
      "You are an expert technical writer. Generate a clear, well-structured README.md based on the " +
      "user's project description, including sections like Overview, Installation, Usage, and any " +
      "others that make sense for the project. Return the full README in a single fenced ```markdown " +
      "code block.",
  },
  regex: {
    label: "Regex",
    system:
      "You are a regex expert. Generate a correct regular expression based on the user's request. " +
      "Return the pattern in a single fenced code block, then explain what it matches with one or two " +
      "concrete examples.",
  },
  explain: {
    label: "Explain Code",
    system:
      "You are an expert code reviewer and teacher. The user will paste a piece of code. Explain what " +
      "it does step by step, in plain language a mid-level developer can follow, and call out any " +
      "non-obvious parts. Do not rewrite the code unless explicitly asked.",
  },
};

export async function streamGenerate(type, userPrompt, onDelta) {
  const config = GENERATOR_TYPES[type];
  if (!config) throw new Error("Unknown generation type");

  const stream = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: config.system },
      { role: "user", content: userPrompt },
    ],
    stream: true,
    temperature: type === "explain" ? 0.4 : 0.55,
    max_completion_tokens: 3000,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content;
    if (delta) onDelta(delta);
  }
}
