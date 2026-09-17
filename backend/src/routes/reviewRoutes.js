import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { submitReview } from "../controllers/reviewController.js";
const router = Router();
router.use(protect);
router.post("/", submitReview);
export default router;
