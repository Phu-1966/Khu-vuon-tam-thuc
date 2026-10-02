GÒ CAO — V3

Bản sửa trình đọc EPUB cho website Gò Cao.

Thay đổi chính:
- Chỉ khởi tạo epub.js sau khi người đọc bấm ĐỌC SÁCH.
- Tải EPUB thành ArrayBuffer rồi mở với epub.js, ổn định hơn trên Safari/iPhone.
- Chờ book.ready trước khi tạo vùng đọc.
- Có xử lý lỗi và cho phép bấm ĐỌC SÁCH lại nếu mở thất bại.
- Giữ nguyên giao diện, EPUB, bìa và các chức năng hiện có.

Các tệp:
README.txt
app.js
cover.jpg
go-cao-mau.jpg
index.html
phia-sau-buc-tuong.epub
style.css
