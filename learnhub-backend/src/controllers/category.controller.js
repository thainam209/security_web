// src/controllers/category.controller.js
const categoryService = require('../services/category.service');

// Đồng bộ tên hàm với file route để dễ quản lý
const categoryController = {
    // [POST] /api/v1/categories
    createCategory: async (req, res) => {
        try {
            const { categoryName, description } = req.body;
            if (!categoryName) {
                return res.status(400).json({ message: "Category name is required." });
            }
            const newCategory = await categoryService.createCategory({ categoryname: categoryName, description });
            res.status(201).json({
                message: "Tạo danh mục thành công!",
                data: newCategory
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // [GET] /api/v1/categories
    getAllCategories: async (req, res) => {
        try {
            const categories = await categoryService.getAllCategories();
            res.status(200).json({
                message: "Lấy danh sách danh mục thành công!",
                data: categories
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // [GET] /api/v1/categories/:id
    getCategoryById: async (req, res) => {
        try {
            const category = await categoryService.getCategoryById(req.params.id);
            if (category) {
                res.status(200).json({
                    message: "Tìm thấy danh mục!",
                    data: category
                });
            } else {
                res.status(404).json({ message: 'Không tìm thấy danh mục!' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // [PUT] /api/v1/categories/:id
    updateCategory: async (req, res) => {
        try {
            const updatedCategory = await categoryService.updateCategory(req.params.id, req.body);
            if (updatedCategory) {
                res.status(200).json({
                    message: "Cập nhật danh mục thành công!",
                    data: updatedCategory
                });
            } else {
                res.status(404).json({ message: 'Không tìm thấy danh mục!' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // [DELETE] /api/v1/categories/:id
    deleteCategory: async (req, res) => {
        try {
            const result = await categoryService.deleteCategory(req.params.id);
            if (result) {
                res.status(200).json({ message: 'Xóa danh mục thành công!' });
            } else {
                res.status(404).json({ message: 'Không tìm thấy danh mục!' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = categoryController;
