// src/middlewares/upload.middleware.js
const multer = require('multer');
const path = require('path');

// Cấu hình multer để lưu file tạm thời vào memory
// (Vì chúng ta sẽ upload trực tiếp lên Cloudinary, không cần lưu vào disk)
const storage = multer.memoryStorage();

// Filter để chỉ chấp nhận file ảnh
const fileFilter = (req, file, cb) => {
  // Kiểm tra extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, webp)'), false);
  }
};

// Cấu hình multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
  },
});

// Middleware để upload một file với field name là 'image'
const uploadImage = upload.single('image');

module.exports = uploadImage;

