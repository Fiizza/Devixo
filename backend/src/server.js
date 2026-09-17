import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import generateRoutes from "./routes/generateRoutes.js";
import bugfixRoutes from "./routes/bugfixRoutes.js";
import utilRoutes from "./routes/utilRoutes.js";
// ...

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

app.get("/", (req, res) => res.json({ status: "Devixo API running" }));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/generate", generateRoutes);
app.use("/api/bugfix", bugfixRoutes);
app.use("/api/util", utilRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Vercel's Node runtime imports this file and calls the exported handler
// directly per-request — it never actually calls app.listen() above (that
// line is a no-op there, harmless to leave in for local dev with `npm run dev`).
export default app;