// src/services/category.service.js
const { categories } = require('../models/'); // Import model từ file index của models

const categoryService = {
    /**
     * Tạo mới một danh mục
     * @param {object} data - Dữ liệu cho danh mục mới (categoryName, description)
     * @returns {Promise<Category>}
     */
    createCategory: async (data) => {
        // Sequelize sẽ tự động ánh xạ categoryName -> categoryname khi tạo record
        return await categories.create(data);
    },

    /**
     * Lấy tất cả danh mục
     * @returns {Promise<Category[]>}
     */
    getAllCategories: async () => {
        return await categories.findAll();
    },

    /**
     * Lấy một danh mục theo ID
     * @param {number} id - ID của danh mục
     * @returns {Promise<Category|null>}
     */
    getCategoryById: async (id) => {
        return await categories.findByPk(id);
    },

    /**
     * Cập nhật danh mục
     * @param {number} id - ID của danh mục cần cập nhật
     * @param {object} data - Dữ liệu cần cập nhật
     * @returns {Promise<Category|null>}
     */
    updateCategory: async (id, data) => {
        const category = await categories.findByPk(id);
        if (category) {
            return await category.update(data);
        }
        return null;
    },

    /**
     * Xóa danh mục
     * @param {number} id - ID của danh mục cần xóa
     * @returns {Promise<boolean>}
     */
    deleteCategory: async (id) => {
        const category = await categories.findByPk(id);
        if (category) {
            await category.destroy();
            return true;
        }
        return false;
    }
};

module.exports = categoryService;
