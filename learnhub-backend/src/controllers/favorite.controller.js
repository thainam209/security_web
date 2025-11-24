const favoriteService = require('../services/favorite.service');

const favoriteController = {
    //[POST] /api/v1/favorites
    addFavorite: async (req, res) => {
        try {
            const userId = req.user.id;
            const { courseId } = req.body;
            const favoriteItem = await favoriteService.addFavorite(userId, courseId);
            res.status(201).json({
                message: 'Khóa học đã được thêm vào danh sách yêu thích.',
                data: favoriteItem
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    //[Get] /api/v1/favorites/
    getFavorites: async (req, res) => {
        try {
            const userId = req.user.id;
            const favoritesItem = await favoriteService.getFavoritesByUserId(userId);
            res.status(200).json({
                message: 'Lấy danh sách yêu thích thành công.',
                data: favoritesItem
            });
        } catch (error) {
            // THÊM DÒNG NÀY ĐỂ IN LỖI CHI TIẾT RA TERMINAL
            console.log('--- LỖI KHI LẤY GIỎ HÀNG ---', error);
            res.status(500).json({ message: 'Lỗi hệ thống khi lấy danh sách yêu thích.' });
        }
    },

    //[DELETE] /api/v1/favorites/:courseId
    removeFavorite: async (req, res) => {
        try {
            const userId = req.user.id;
            const { courseId } = req.params;
            await favoriteService.removeFavorite(userId, Number(courseId));
            res.status(200).json({
                message: 'Khóa học đã được xóa khỏi danh sách yêu thích.',
            })
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = favoriteController;