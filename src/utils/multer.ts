// Check File Type
export function checkImageUploadFileType(file: any, cb: any) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(file.originalname.toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: jpeg, jpg, png, gif Images Only!');
    }
}