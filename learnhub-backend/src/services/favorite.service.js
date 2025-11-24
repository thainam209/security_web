const { favorites, courses } = require('../models');

/**
* Thêm một khóa học vào danh sách yêu thích của người dùng
*/
const addFavorite = async(userId, courseId) =>{
    const[favoriteItem, created] = await favorites.findOrCreate({
        where: { userid: userId, courseid: courseId },
        defaults:{
            userid: userId,
            courseid: courseId,
        }
    });
    if(!created){
        throw new Error('Khóa học này đã có trong danh sách yêu thích của bạn.');
    }
    return favoriteItem;  
};
/**
 * Lấy danh sách các khóa học yêu thích của người dùng
 */
const getFavoritesByUserId = async (userId) => {
  return await favorites.findAll({
    where: { userid: userId },
    include: [{
      model: courses,
      as: 'course', // Phải khớp với alias trong init-models.js
      attributes: ['courseid', 'coursename', 'price', 'imageurl'],
    }],
    order: [['addedat', 'DESC']],
  });
};

/**
 * Xóa một khóa học khỏi danh sách yêu thích của người dùng
 */
const removeFavorite = async (userId, courseId) =>{
    const result = await favorites.destroy({
        where: { userid: userId, courseid: courseId },
    });

    if(result === 0){
        throw new Error('Khóa học không tồn tại trong danh sách yêu thích của bạn.');
    }
    return result;
};

module.exports = {
    addFavorite,
    getFavoritesByUserId,
    removeFavorite,
};