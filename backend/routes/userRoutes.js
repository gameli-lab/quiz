import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import multer from "multer";
import path from "path";
import {
  updateProfile,
  getSettings,
  updateSettings,
} from "../controllers/userController.js";

const router = express.Router();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/avatars");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb("Error: Images only (jpeg, jpg, png)!");
    }
  },
});

// Profile routes
router.put("/profile", verifyToken, upload.single("avatar"), updateProfile);

// Settings routes
router.get("/settings", verifyToken, getSettings);
router.put("/settings", verifyToken, updateSettings);

export default router;
