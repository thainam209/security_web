const jwt = require('jsonwebtoken');
require('dotenv').config(); // Nạp các biến từ file .env

const authMiddleware = (req, res, next) => {
    // Lấy token từ header 'Authorization'
    // Client thường gửi token theo định dạng: "Bearer [token]"
    const authHeader = req.header('Authorization');

    // Kiểm tra xem header Authorization hoặc token có tồn tại không
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Không có quyền truy cập. Vui lòng đăng nhập.' });
    }

    // Tách lấy phần token từ chuỗi "Bearer [token]"
    const token = authHeader.split(' ')[1];

    try {
        // Xác thực token bằng chuỗi bí mật
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);

        // Nếu token hợp lệ, payload đã giải mã sẽ được trả về.
        // Gắn payload (chứa thông tin user như id, email, role) vào đối tượng request.
        req.user = decodedPayload;

        // Chuyển sang middleware hoặc controller tiếp theo
        next();
    } catch (error) {
        // Nếu token không hợp lệ (hết hạn, sai chữ ký,...)
        res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
};

module.exports = authMiddleware;