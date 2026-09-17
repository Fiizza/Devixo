import { fixBug } from "../services/bugfixService.js";
const MAX_LENGTH = 20000;

export const submitBugfix = async (req, res) => {
  const { errorMessage, stackTrace, code, language } = req.body;

  if (!errorMessage?.trim() && !stackTrace?.trim() && !code?.trim()) {
    return res.status(400).json({ message: "Please provide at least an error message, stack trace, or code" });
  }
  const totalLength = (errorMessage || "").length + (stackTrace || "").length + (code || "").length;
  if (totalLength > MAX_LENGTH) {
    return res.status(400).json({ message: `Input is too long (max ${MAX_LENGTH.toLocaleString()} characters combined).` });
  }

  try {
    const result = await fixBug({ errorMessage, stackTrace, code, language });
    res.json({ result });
  } catch (err) {
    console.error("Bug fix error:", err);
    res.status(500).json({ message: "Failed to analyze the bug. Please try again." });
  }
};
