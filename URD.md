# URD – Chương trình Quản lý Đề Xuất Mua Hàng Hóa

## 1. Giới thiệu

### 1.1 Mục tiêu hệ thống

Hệ thống Quản lý Đề Xuất Mua Hàng Hóa được xây dựng nhằm:

- Quản lý quy trình tạo và phê duyệt đề xuất mua hàng hóa nội bộ.
- Kiểm soát ngân sách/định mức mua hàng theo đơn vị và danh mục.
- Chuẩn hóa luồng phê duyệt giữa các cấp.
- Theo dõi số lượng đề xuất, số lượng thực tế nhận hàng và chênh lệch chi phí.
- Hỗ trợ lưu vết lịch sử xử lý và minh bạch quy trình.

---

## 2. Phạm vi hệ thống

Hệ thống bao gồm các phân hệ:

1. Quản lý danh mục sản phẩm.
2. Quản lý đơn vị/phòng ban.
3. Quản lý cấu hình đề xuất.
4. Quản lý định mức theo đơn vị và danh mục.
5. Quản lý định mức theo đơn vị và danh mục.
6. Tạo phiếu đề xuất mua hàng.
7. Quy trình phê duyệt đề xuất.
8. Xác nhận đơn hàng và cập nhật số lượng thực tế.
9. Theo dõi trạng thái và lịch sử xử lý phiếu.

---

# 3. Danh mục chức năng

## 3.1 Quản lý danh mục sản phẩm

### Mô tả

Cho phép quản trị viên quản lý các danh mục hàng hóa và sản phẩm thuộc danh mục.

### Chức năng

- Thêm/Sửa/Xóa danh mục.
- Thêm/Sửa/Xóa sản phẩm.
- Gán sản phẩm vào danh mục.
- Khai báo:
    - Mã sản phẩm.
    - Tên sản phẩm.
    - Đơn giá.
    - Đơn vị tính.
    - Trạng thái sử dụng.

### Danh mục

- Mã danh mục
- Tên danh mục
- Trạng thái

### Sản phẩm

- Mã sản phẩm
- Tên sản phẩm
- Danh mục
- Đơn giá
- Đơn vị tính
- Trạng thái

---

# 3.2 Quản lý đơn vị

### Mô tả

Quản lý các đơn vị/phòng ban sử dụng hệ thống.

### Chức năng

- Thêm/Sửa/Xóa đơn vị.
- Cấu hình nhân sự thuộc đơn vị.
- Phân quyền sử dụng.

### Dữ liệu chính

- Mã đơn vị
- Tên đơn vị
- Người phụ trách
- Trạng thái

---

# 3.3 Quản lý cấu hình đề xuất

## Mô tả

Cho phép cấu hình:

- Danh mục được phép đề xuất.
- Đơn vị áp dụng.
- Nhân sự phê duyệt theo từng cấp.
- Định mức cho phép theo từng danh mục và đơn vị.

## Chức năng

- Tạo cấu hình đề xuất.
- Chọn đơn vị áp dụng.
- Chọn danh mục được phép sử dụng.
- Cấu hình nhân sự kiểm soát/phê duyệt.
- Cấu hình định mức theo:
    - Đơn vị
    - Danh mục
    - Khoảng thời gian

## Dữ liệu chính

### Thông tin cấu hình

- Mã cấu hình
- Tên cấu hình
- Trạng thái
- Ngày hiệu lực

### Danh mục cấu hình

- Danh mục
- Định mức cho phép
- Đơn vị áp dụng

### Nhân sự phê duyệt

- Đơn vị
- Cấp kiểm soát

---

# 3.4 Tạo phiếu đề xuất mua hàng

## Mô tả

Người dùng tạo phiếu đề xuất mua hàng dựa trên cấu hình đề xuất.

## Quy trình tạo phiếu

### Bước 1 – Chọn cấu hình đề xuất

Người dùng chọn:

- Cấu hình đề xuất
- Đơn vị áp dụng

Hệ thống tự động:

- Hiển thị các danh mục được phép đề xuất.
- Hiển thị định mức tương ứng.

---

### Bước 2 – Chọn danh mục đề xuất

Người dùng có thể chọn:

- Một hoặc nhiều danh mục trong cùng phiếu đề xuất.

---

### Bước 3 – Chọn sản phẩm

Trong từng danh mục:

- Chọn sản phẩm.
- Nhập số lượng cần mua.

Hệ thống tự động tính:

- Thành tiền từng sản phẩm.
- Tổng tiền từng danh mục.
- Tổng tiền toàn phiếu.

---

### Bước 4 – Kiểm tra định mức

Hệ thống tự động:

- Lấy định mức từ cấu hình.
- So sánh tổng tiền sử dụng với định mức.

Hiển thị:

- Định mức cho phép.
- Tổng tiền sử dụng.
- Chênh lệch còn lại.

### Công thức

- Thành tiền sản phẩm = Số lượng × Đơn giá
- Tổng tiền danh mục = Tổng thành tiền sản phẩm
- Chênh lệch = Định mức − Tổng tiền sử dụng

---

## Thông tin phiếu đề xuất

### Thông tin chung

- Mã phiếu
- Ngày tạo
- Người tạo
- Đơn vị
- Cấu hình đề xuất
- Trạng thái

### Chi tiết đề xuất

- Danh mục
- Sản phẩm
- Số lượng đề xuất
- Đơn giá
- Thành tiền
- Định mức
- Chênh lệch

---

# 4. Luồng phê duyệt

## 4.1 Trạng thái phiếu

| Trạng thái | Mô tả |
| --- | --- |
| Nháp | Người dùng đang tạo |
| Chờ trưởng đơn vị duyệt | Chờ cấp đơn vị xử lý |
| Chờ kiểm soát | Chờ cấp kiểm soát xử lý |
| Trả chỉnh sửa | Phiếu bị trả về |
|  |  |
| Chờ xác nhận đơn hàng | Người tạo xác nhận |
| Hoàn thành | Đã nhập số lượng thực tế |
| Từ chối | Phiếu bị từ chối |

---

# 4.2 Luồng xử lý chi tiết

## Bước 1 – Duyệ*t cấp* đơn vị

### Người xử lý

- Trưởng đơn vị được chọn khi tạo phiếu.

### Hành động

- Đồng ý
- Từ chối

### Kết quả

- Đồng ý → chuyển cấp kiểm soát.
- Từ chối → kết thúc phiếu.

---

## Bước 2 – Kiểm soát

### Người xử lý

Nhân sự kiểm soát được cấu hình theo:

- Đơn vị
- Cấu hình đề xuất

### Hành động

- Đồng ý
- Từ chối
- Trả chỉnh sửa

### Kết quả

- Đồng ý → chuyển bước xác nhận đơn hàng.
- Từ chối → kết thúc phiếu.
- Trả chỉnh sửa → trả về người tạo cập nhật.

---

## Bước 3 – Xác nhận đơn hàng

### Người xử lý

- Nhân sự tạo đề xuất.

### Hành động

- Xác nhận đơn hàng.

### Sau khi xác nhận

Hệ thống cho phép:

- Nhân sự nhận hàng cập nhật số lượng thực tế nhận.

---

# 5. Nhập số lượng thực tế

## Mô tả

Sau khi xác nhận đơn hàng:

- Người nhận hàng nhập số lượng thực tế trên từng dòng sản phẩm.

## Hệ thống tự động:

- Tính lại thành tiền thực tế.
- Tính lại tổng tiền theo danh mục.
- Tính lại chênh lệch định mức.

## Dữ liệu cập nhật

- Số lượng thực tế
- Thành tiền thực tế
- Tổng tiền thực tế
- Chênh lệch thực tế

---

# 6. Quy tắc nghiệp vụ

## Quy tắc tạo phiếu

- Một phiếu có thể chứa nhiều danh mục.
- Chỉ được chọn danh mục thuộc cấu hình đề xuất.
- Chỉ được chọn sản phẩm thuộc danh mục đã chọn.

---

## Quy tắc định mức

- Định mức được cấu hình theo:
    - Đơn vị
    - Danh mục
- Hệ thống phải cảnh báo khi vượt định mức.
- Có thể cấu hình:
    - Không cho lưu nếu vượt định mức.
    - Cho phép lưu nhưng cần phê duyệt bổ sung.

---

## Quy tắc phê duyệt

- Người tạo phiếu không được tự duyệt.
- Chỉ người đúng vai trò mới được thao tác.
- Mỗi hành động phải lưu lịch sử xử lý.

---

# 7. Nhật ký và lịch sử xử lý

## Hệ thống cần lưu:

- Người thao tác
- Thời gian thao tác
- Hành động
- Nội dung ghi chú

## Các hành động cần log

- Tạo phiếu
- Cập nhật phiếu
- Duyệt/Từ chối
- Trả chỉnh sửa
- Xác nhận đơn hàng
- Cập nhật số lượng thực tế

---

# 8. Báo cáo

## Báo cáo đề xuất

- Theo thời gian
- Theo đơn vị
- Theo trạng thái
- Theo danh mục

## Báo cáo định mức

- Đã sử dụng
- Còn lại
- Vượt định mức

## Báo cáo mua hàng thực tế

- Số lượng đề xuất
- Số lượng thực tế
- Chênh lệch

---

# 9. Yêu cầu phi chức năng

## Bảo mật

- Phân quyền theo vai trò.
- Chỉ hiển thị dữ liệu theo phạm vi được phép.

## Hiệu năng

- Hỗ trợ nhiều người dùng đồng thời.
- Tìm kiếm và lọc dữ liệu nhanh.

## Audit

- Lưu đầy đủ lịch sử thay đổi dữ liệu.

## Tích hợp

- Có khả năng tích hợp email/thông báo.
- Có API tích hợp ERP/kế toán trong tương lai.

---

# 10. Vai trò người dùng

| Vai trò | Chức năng |  |
| --- | --- | --- |
| Người tạo đề xuất | Tạo và theo dõi phiếu |  |
| Trưởng đơn vị | Duyệt cấp đơn vị |  |
| Kiểm soát | Kiểm soát đề xuất |  |
| Nhân sự nhận hàng | Cập nhật số lượng thực tế |  |
| Quản trị hệ thống | Quản lý danh mục/cấu hình/phân quyền |  |