import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { submitBugfix } from "../controllers/bugfixController.js";
const router = Router();
router.use(protect);
router.post("/", submitBugfix);
export default router;
