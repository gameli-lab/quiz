import express from "express";
import {
  login,
  register,
  forgotPassword,
  validateResetToken,
  resetPassword,
  verify,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:token", validateResetToken);
router.post("/reset-password/:token", resetPassword);
router.get("/verify", verifyToken, verify);

export default router;
