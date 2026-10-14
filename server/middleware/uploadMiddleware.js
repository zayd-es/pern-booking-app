import multer from "multer";

// by claude: 5MB per image, only jpeg/png/webp, max 4 files
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const multerUpload = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 5 * 1024 * 1024, files: 4 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Only JPG, PNG and WEBP images are allowed"));
  },
});

// by claude: wrap multer so its errors become a clean 400 JSON response
const upload = {
  array: (field, max) => (req, res, next) => {
    multerUpload.array(field, max)(req, res, (err) => {
      if (!err) return next();
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "Each image must be 5MB or smaller"
          : err.code === "LIMIT_UNEXPECTED_FILE" || err.code === "LIMIT_FILE_COUNT"
            ? "You can upload up to 4 images"
            : err.message || "Upload failed";
      return res.status(400).json({ success: false, message });
    });
  },
};

export default upload;
