## Thành viên:
# Lê Thái Nam - 22810310397 
# Cao Thành Đại - 22810310392

# Giới thiệu về đề tài:
Tạo các lỗi XSS, SQLinjection giả của web và dùng Burp Suite/ZAP để test và phát hiện
# Công nghệ sử dụng: nodejs + sequelize + postgreSQL + cloudinary
# Cấu trúc thư mục dự án:
# Gồm 2 thư mục chính là backend và frontend:
# backend: Mã nguồn xử lý chính nằm trong thư mục src:
    + api: thiết kế các api để sử dụng ở giao diện(sử dụng các hàm trong controller)
    + model: các model tương đương với các bảng trong db
    + config: cấu hình kết nối db và cloud
    + controller: các hàm xử lý các hành động từ người dùng đến hệ thống
    + service: viết các hàm (như là câu lệnh truy vấn) để lấy dữ liệu từ db
# frontend:chứa giao diện các trang web của dự án
# Import db: cài đặt postgreSQL -> tạo db -> vào querytool+openfile ->chọn file .sql muốn import ->excute
# Câu lệnh chạy dự án: npm install(cài các thư viện), nếu thiếu nhìn log và import thêm -> tạo 2 terminal và cd đến thư mục backend,frontend
+ Ở backend: npm run dev
+ Ở frontend: npm run dev
# Hướng dẫn config db, cloud, key api: nằm ở file config.txt
# video demo: https://www.youtube.com/watch?v=t4pGzAz5ihg
# Tài khoản test: admin@example.com
# Mật khẩu: Admin123
 
