// src/config/db.config.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Kiểm tra xem biến môi trường DATABASE_URL đã được thiết lập chưa
if (!process.env.DATABASE_URL) {
  throw new Error('FATAL ERROR: DATABASE_URL is not defined in .env file.');
}

// Khởi tạo một đối tượng Sequelize mới
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false, // Tắt logging SQL query ra console, có thể bật 'console.log' để debug
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Cần thiết cho các kết nối tới Neon, Heroku Postgres,...
    }
  },
});

module.exports = sequelize;
