// src/api/v1/category.route.js
const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/category.controller');

// Các route này giờ đã khớp với tên hàm trong controller
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
