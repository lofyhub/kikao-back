import multer, { FileFilterCallback } from "multer";

export function checkImageUploadFileType(file: Express.Multer.File, cb:FileFilterCallback) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(file.originalname.toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error: jpeg, jpg, png, gif Images Only!'));
    }
}
