import { reviewCode } from "../services/reviewService.js";
const MAX_CODE_LENGTH = 20000;

export const submitReview = async (req, res) => {
  const { code, language } = req.body;
  if (!code || !code.trim()) return res.status(400).json({ message: "Please paste some code to review" });
  if (!language) return res.status(400).json({ message: "Please choose a language" });
  if (code.length > MAX_CODE_LENGTH) {
    return res.status(400).json({ message: `Code is too long (max ${MAX_CODE_LENGTH.toLocaleString()} characters).` });
  }
  try {
    const review = await reviewCode(code, language);
    res.json({ review });
  } catch (err) {
    console.error("Code review error:", err);
    res.status(500).json({ message: "Failed to generate review. Please try again." });
  }
};
