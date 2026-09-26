import type { ErrorRequestHandler } from "express";
import multer from "multer";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "File is too large (max 10 MB)" : "Invalid upload";
    res.status(400).json({ error: message });
    return;
  }

  if (err.type === "entity.parse.failed") {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
};
