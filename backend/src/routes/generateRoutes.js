import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { streamGeneration, listGeneratorTypes } from "../controllers/generateController.js";
const router = Router();
router.use(protect);
router.get("/types", listGeneratorTypes);
router.post("/", streamGeneration);
export default router;
