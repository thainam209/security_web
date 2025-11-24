// src/middlewares/upload-video.middleware.js
const multer = require('multer');
const path = require('path');

// Cấu hình multer để lưu file tạm thời vào memory
const storage = multer.memoryStorage();

// Filter để chỉ chấp nhận file video
const fileFilter = (req, file, cb) => {
  // Kiểm tra extension
  const allowedExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file video (mp4, mov, avi, wmv, flv, webm, mkv)'), false);
  }
};

// Cấu hình multer cho video (giới hạn lớn hơn ảnh)
// Lưu ý: Cloudinary free tier có giới hạn, nhưng có thể upload file lớn với upload_large_stream
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // Giới hạn 500MB
  },
});

// Middleware để upload một file video với field name là 'video'
const uploadVideo = upload.single('video');

module.exports = uploadVideo;

