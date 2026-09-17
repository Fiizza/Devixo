import { streamGenerate, GENERATOR_TYPES } from "../services/generateService.js";

export const listGeneratorTypes = (req, res) => {
  const types = Object.entries(GENERATOR_TYPES).map(([key, v]) => ({ key, label: v.label }));
  res.json({ types });
};

export const streamGeneration = async (req, res) => {
  const { type, prompt } = req.body;

  if (!type || !GENERATOR_TYPES[type]) {
    return res.status(400).json({ message: "Invalid or missing generation type" });
  }
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ message: "Please describe what you want generated" });
  }

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    await streamGenerate(type, prompt, (delta) => {
      res.write(`data: ${JSON.stringify({ text: delta })}\n\n`);
    });

    res.write(`event: done\ndata: {}\n\n`);
    res.end();
  } catch (err) {
    console.error("Generate stream error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to start generation" });
    } else {
      res.write(`event: error\ndata: ${JSON.stringify({ message: "Generation stream failed" })}\n\n`);
      res.end();
    }
  }
};
