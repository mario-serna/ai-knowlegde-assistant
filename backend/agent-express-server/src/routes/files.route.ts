import { Router } from "express";
import multer from "multer";
import fileController from "../controllers/file.controller";
const router = Router({ mergeParams: true });

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only text, csv and PDF files
    if (
      file.mimetype === "text/plain" ||
      file.mimetype === "application/pdf" ||
      file.mimetype === "text/csv"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only text, csv and PDF files are allowed"));
    }
  },
});

// Upload file to a session
router.post(
  "/",
  upload.single("file"),
  fileController.uploadFile
);

// Get files for a session
router.get("/", fileController.getFiles);

// Get file chunks for a session
router.get("/chunks", fileController.getFileChunks);

// Search for similar chunks
router.post("/search", fileController.searchSimilarChunks);

// Delete a file
router.delete("/:fileId", fileController.deleteFile);

export default router;
