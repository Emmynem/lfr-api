import multer, { memoryStorage } from "multer";
import { promisify } from "util";

const image_allowed_extensions = ["image/png", "image/PNG", "image/jpg", "image/JPG", "image/jpeg", "image/JPEG", "image/jfif", "image/JFIF", "image/webp", "image/WEBP"];
const image_or_pdf_allowed_extensions = ["image/png", "image/PNG", "image/jpg", "image/JPG", "image/jpeg", "image/JPEG", "image/jfif", "image/JFIF", "image/webp", "image/WEBP", "application/pdf", "application/PDF"];
const document_allowed_extensions = ["image/png", "image/PNG", "image/jpg", "image/JPG", "image/jpeg", "image/JPEG", "image/jfif", "image/JFIF", "image/webp", "image/WEBP", "application/pdf", "application/PDF", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/x-zip-compressed", "text/plain", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.presentationml.presentation"];
const media_allowed_extensions = ["audio/mpeg", "audio/wav", "audio/ogg", "video/x-matroska", "video/mp4", "video/x-m4v"];

const imageFilter = (req, file, cb) => {
    // if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|jfif|JFIF|webp|WEBP)$/)) {
    if (!image_allowed_extensions.includes(file.mimetype)) {
        return cb(new Error('Only image files are allowed!'), false);
    } else {
        cb(null, true);
    }
};

const documentFilter = (req, file, cb) => {
    if (!document_allowed_extensions.includes(file.mimetype)) {
        return cb(new Error('Only Images, Texts, Docs, Powerpoint and Excel, PDFs files are allowed!'), false);
    } else {
        cb(null, true);
    }
};

const imageOrPdfFilter = (req, file, cb) => {
    if (!image_or_pdf_allowed_extensions.includes(file.mimetype)) {
        return cb(new Error('Only pdf/image files are allowed!'), false);
    } else {
        cb(null, true);
    }
};

const mediaFilter = (req, file, cb) => {
    if (!media_allowed_extensions.includes(file.mimetype)) {
        return cb(new Error('Only media (Audio and Video files) files are allowed!'), false);
    } else {
        cb(null, true);
    }
};

let uploadCategoryImage = multer({ fileFilter: imageFilter, storage: memoryStorage() }).single("image");
export const categoryImageMiddleware = promisify(uploadCategoryImage);

let uploadPostImage = multer({ fileFilter: imageFilter, storage: memoryStorage() }).single("image");
export const postImageMiddleware = promisify(uploadPostImage);

let uploadEventImage = multer({ fileFilter: imageFilter, storage: memoryStorage() }).single("image");
export const eventImageMiddleware = promisify(uploadEventImage);

let uploadBannerImage = multer({ fileFilter: imageFilter, storage: memoryStorage() }).single("image");
export const bannerImageMiddleware = promisify(uploadBannerImage);
