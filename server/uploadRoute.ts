import { Router } from "express";
import multer from "multer";
import { storagePut } from "./storage";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB per file

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, HEIC, PDF`));
    }
  },
});

export function registerUploadRoute(app: Router) {
  // ── Single file upload (existing behaviour) ──────────────────────────────────
  app.post(
    "/api/upload",
    upload.single("file"),
    async (req, res) => {
      try {
        if (!req.file) {
          res.status(400).json({ error: "No file provided" });
          return;
        }

        const key = (req.body?.key as string | undefined)?.trim();
        if (!key) {
          res.status(400).json({ error: "Missing key field" });
          return;
        }

        const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);
        res.json({ url, key, mimeType: req.file.mimetype });
      } catch (err: any) {
        console.error("[Upload] Error:", err);
        res.status(500).json({ error: err.message ?? "Upload failed" });
      }
    }
  );

  // ── Multi-file upload (up to 5 files, for house plan sets) ───────────────────
  // Client sends FormData with fields: files[] (multiple) + keys[] (one per file)
  app.post(
    "/api/upload-multi",
    upload.array("files", 5),
    async (req, res) => {
      try {
        const files = req.files as Express.Multer.File[] | undefined;
        if (!files || files.length === 0) {
          res.status(400).json({ error: "No files provided" });
          return;
        }

        // keys[] can be sent as a comma-separated string or repeated form fields
        let keys: string[] = [];
        const rawKeys = req.body?.keys;
        if (Array.isArray(rawKeys)) {
          keys = rawKeys.map((k: string) => k.trim());
        } else if (typeof rawKeys === "string") {
          keys = rawKeys.split(",").map((k) => k.trim());
        }

        if (keys.length !== files.length) {
          res.status(400).json({ error: "keys[] count must match files[] count" });
          return;
        }

        const results = await Promise.all(
          files.map(async (file, i) => {
            const { url } = await storagePut(keys[i], file.buffer, file.mimetype);
            return { url, key: keys[i], mimeType: file.mimetype, name: file.originalname };
          })
        );

        res.json({ files: results });
      } catch (err: any) {
        console.error("[Upload-Multi] Error:", err);
        res.status(500).json({ error: err.message ?? "Upload failed" });
      }
    }
  );
}
