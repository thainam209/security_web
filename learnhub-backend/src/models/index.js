'use strict';

const sequelize = require('../config/db.config'); // 1. Import sequelize instance từ config
const initModels = require('./init-models');    // 2. Import hàm initModels

// 3. Gọi hàm initModels để khởi tạo tất cả model với sequelize
const models = initModels(sequelize);

// 4. Export sequelize và tất cả các model đã được khởi tạo
module.exports = {
  sequelize,
  ...models // Dùng spread syntax (...) để export từng model riêng lẻ
};