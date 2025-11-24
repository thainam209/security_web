const { users, userdetails } = require('../models');
const cloudinary = require('../config/cloudinary.config');
const { Readable } = require('stream');

exports.getAllUsers = async (page, limit, role = null) => {
    // Nếu có filter role, dùng findOne với where
    if (role) {
        const usersList = await users.findAll({
            where: { role: role },
            limit: limit || 10,
            attributes: ['userid', 'fullname', 'email', 'role', 'profilepicture', 'createdat']
        });
        const totalItems = await users.count({ where: { role: role } });
        return { users: usersList, totalItems };
    }
    
    // Nếu không có filter, dùng findAll với pagination như cũ
    const usersData = await users.findAll(page, limit);
    if (usersData.length === 0) {
        return { users: [], totalItems: 0 };
    }

    const totalItems = usersData[0].total_count; // Lấy tổng số lượng từ dòng đầu tiên
    // Xóa cột total_count khỏi dữ liệu trả về
    const usersList = usersData.map(({ total_count, ...rest }) => rest);

    return { users: usersList, totalItems };
};

// Lấy thông tin user hiện tại (từ token)
exports.getUserById = async (userId) => {
    const user = await users.findOne({
        where: { userid: userId }
    });
    if (!user) {
        throw new Error('Không tìm thấy người dùng');
    }

    // Lấy userdetails nếu có
    const userDetails = await userdetails.findOne({
        where: { userid: userId }
    });

    return {
        ...user.toJSON(),
        userdetails: userDetails ? userDetails.toJSON() : null
    };
};

// Cập nhật thông tin user
exports.updateUser = async (userId, updateData, currentUserId) => {
    // Kiểm tra quyền: chỉ được update chính mình
    if (Number(userId) !== Number(currentUserId)) {
        throw new Error('Bạn không có quyền cập nhật thông tin người dùng này');
    }

    const user = await users.findOne({
        where: { userid: userId }
    });
    if (!user) {
        throw new Error('Không tìm thấy người dùng');
    }

    // Cập nhật thông tin user
    const { fullname, email, role } = updateData;
    
    if (fullname) {
        user.fullname = fullname;
    }
    if (email) {
        user.email = email;
    }
    if (role) {
        user.role = role;
    }
    
    await user.save();

    // Cập nhật hoặc tạo userdetails
    if (updateData.userdetails) {
        let userDetailsRecord = await userdetails.findOne({
            where: { userid: userId }
        });

        if (userDetailsRecord) {
            // Cập nhật
            if (updateData.userdetails.dateofbirth !== undefined) {
                userDetailsRecord.dateofbirth = updateData.userdetails.dateofbirth;
            }
            if (updateData.userdetails.address !== undefined) {
                userDetailsRecord.address = updateData.userdetails.address;
            }
            if (updateData.userdetails.phone !== undefined) {
                userDetailsRecord.phone = updateData.userdetails.phone;
            }
            await userDetailsRecord.save();
        } else {
            // Tạo mới
            userDetailsRecord = await userdetails.create({
                userid: userId,
                dateofbirth: updateData.userdetails.dateofbirth || null,
                address: updateData.userdetails.address || null,
                phone: updateData.userdetails.phone || null,
            });
        }
    }

    // Lấy lại thông tin đầy đủ
    return await exports.getUserById(userId);
};

// Upload avatar lên Cloudinary
const uploadAvatarToCloudinary = async (fileBuffer, folder = 'avatars') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'image',
                transformation: [
                    { width: 400, height: 400, crop: 'fill', quality: 'auto' },
                ],
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.secure_url);
                }
            }
        );
        const stream = Readable.from(fileBuffer);
        stream.pipe(uploadStream);
    });
};

// Upload avatar cho user
exports.uploadUserAvatar = async (userId, fileBuffer, currentUserId) => {
    // Kiểm tra quyền: chỉ được upload avatar cho chính mình
    if (Number(userId) !== Number(currentUserId)) {
        throw new Error('Bạn không có quyền upload avatar cho người dùng này');
    }

    const user = await users.findOne({
        where: { userid: userId }
    });
    if (!user) {
        throw new Error('Không tìm thấy người dùng');
    }

    const avatarUrl = await uploadAvatarToCloudinary(fileBuffer, 'avatars');
    user.profilepicture = avatarUrl;
    await user.save();

    return user;
};