import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();
router.use(protect);

const MAX_CHARS = 4000;

// Strips scripts/styles/tags down to plain readable text. Intentionally
// simple (no full "readability" parsing) since this just feeds AI context,
// not a rendered page.
function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

// Lets the chat input's "web" button pull in a page's text as context.
// Runs server-side because browsers block cross-origin fetches to
// arbitrary external sites (CORS) — this has none of that restriction.
router.post("/fetch-url", async (req, res) => {
  const { url } = req.body;

  if (!url || !/^https?:\/\//i.test(url)) {
    return res.status(400).json({ message: "Please provide a valid http(s) URL" });
  }

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DevixoBot/1.0)" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return res.status(400).json({ message: `Couldn't fetch that page (status ${response.status})` });
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      return res.status(400).json({ message: "That URL doesn't look like a readable web page" });
    }

    const html = await response.text();
    const fullText = htmlToText(html);
    res.json({ text: fullText.slice(0, MAX_CHARS), truncated: fullText.length > MAX_CHARS });
  } catch (err) {
    console.error("URL fetch error:", err.message);
    res.status(500).json({ message: "Failed to fetch that URL. It may be blocking automated requests, or timed out." });
  }
});

export default router;