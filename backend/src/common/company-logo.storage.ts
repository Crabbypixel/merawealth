import { BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";
import { extname, join } from "path";

export const companyLogoStorage = diskStorage({
    destination: join(process.cwd(), "uploads/company-logos"),
    filename(req, file, cb) {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);

        // Extract the original name without its extension
        const originalNameWithoutExt = file.originalname.substring(0, file.originalname.lastIndexOf('.'));

        // Combine: [Unique Number]-[Original Name][Extension]
        cb(null, `${unique}-${originalNameWithoutExt}${extname(file.originalname)}`);
    }
});

export const companyLogoFilter = (req, file, cb) => {
    const allowed = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
    ];

    if (!allowed.includes(file.mimetype)) {
        return cb(new BadRequestException("Only PNG, JPEG, JPG and WebP files are allowed."), false);
    }

    cb(null, true);
};