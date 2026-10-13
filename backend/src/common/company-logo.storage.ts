import { BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";
import { join } from "path";

// The saved file's extension comes from the image type, never from the uploaded
// name, so a file called "logo.html" can't be saved and served as a web page.
const EXTENSIONS: Record<string, string> = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/webp": ".webp",
};

export const companyLogoStorage = diskStorage({
    destination: join(process.cwd(), "uploads/company-logos"),
    filename(req, file, cb) {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);

        // Keep a readable part of the original name: letters, digits, - and _ only
        const dot = file.originalname.lastIndexOf(".");
        const baseName = (dot > 0 ? file.originalname.substring(0, dot) : file.originalname)
            .replace(/[^a-zA-Z0-9_-]+/g, "-")
            .slice(0, 50);

        // Combine: [Unique Number]-[Original Name][Extension]
        cb(null, `${unique}-${baseName}${EXTENSIONS[file.mimetype] ?? ".png"}`);
    }
});

export const companyLogoFilter = (req, file, cb) => {
    if (!(file.mimetype in EXTENSIONS)) {
        return cb(new BadRequestException("Only PNG, JPEG, JPG and WebP files are allowed."), false);
    }

    cb(null, true);
};