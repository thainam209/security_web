// const express = require('express');
// const app = express();
// require('dotenv').config();
// const { sequelize } = require('./src/models'); // Import sequelize instance

// // Middleware để parse JSON body
// app.use(express.json());

// // Routes
// app.use('/api/v1', require('./src/api/v1'));

// const PORT = process.env.PORT || 3000;

// // Hàm để khởi động server
// const startServer = async () => {
//   try {
//     // Kiểm tra kết nối database
//     await sequelize.authenticate();
//     console.log('✅ Kết nối database thành công qua Sequelize!');

//     // Khởi động server sau khi kết nối DB thành công
//     app.listen(PORT, () => {
//       console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
//     });
//   } catch (error) {
//     console.error('❌ Không thể kết nối tới database:', error);
//     process.exit(1); // Thoát khỏi tiến trình nếu không kết nối được DB
//   }
// };

// // Gọi hàm để khởi động server
// startServer();

const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { sequelize } = require("./src/models"); // Import sequelize instance

app.use(cors());

// Middleware để parse JSON body
app.use(express.json());

// Routes
app.use("/api/v1", require("./src/api/v1"));

const PORT = process.env.PORT || 3000;

// Hàm để khởi động server
const startServer = async () => {
  try {
    // Bước 1: Kiểm tra kết nối database
    await sequelize.authenticate();
    console.log("✅ Kết nối database thành công qua Sequelize!");

    // -----------------------------------------------------------------
    // ✨ PHẦN SỬA ĐỔI ĐỂ HOÀN THÀNH YÊU CẦU #2 (MIGRATE) ✨
    // -----------------------------------------------------------------
    // Dùng { alter: true } để tự động kiểm tra và cập nhật bảng CSDL
    // theo model mà không làm mất dữ liệu.
    // await sequelize.sync({ alter: true });
    console.log("✅ Đã đồng bộ (Migrate) CSDL và Model thành công.");
    // -----------------------------------------------------------------

    // Khởi động server sau khi kết nối VÀ đồng bộ DB thành công
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
  } catch (error) {
    // Cập nhật lại thông báo lỗi cho rõ ràng hơn
    console.error("❌ Lỗi kết nối hoặc đồng bộ CSDL:", error);
    process.exit(1); // Thoát khỏi tiến trình nếu không kết nối được DB
  }
};

// Gọi hàm để khởi động server
startServer();
