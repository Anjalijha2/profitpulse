import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { FILE_UPLOAD } from '../config/constants.js';

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (FILE_UPLOAD.ALLOWED_EXTENSIONS.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Only Excel files are allowed (${FILE_UPLOAD.ALLOWED_EXTENSIONS.join(', ')})`), false);
    }
};

export const upload = multer({
    storage,
    limits: {
        fileSize: FILE_UPLOAD.MAX_SIZE, // 10MB
    },
    fileFilter,
});
