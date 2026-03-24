---
name: mt-workflow-guard
description: Giám sát quy trình làm việc với Movable Type (MT), đảm bảo đồng bộ hóa tài sản (assets) nghiêm ngặt và yêu cầu thiết lập Admin khi cần thiết. Sử dụng khi làm việc với MT templates, MTML, CSS/JS assets, hoặc bất kỳ thay đổi frontend/template nào trong dự án này.
---

# Giám sát Quy trình làm việc Movable Type (MT Workflow Guard)

## Mục đích

Đảm bảo tất cả các công việc liên quan đến Movable Type luôn tuân thủ quy trình dự án:

1. Dự án MT dựa trên Docker.
2. Theo dõi Template trong thư mục `development-dev`.
3. Nguồn Frontend (CSS/JS) trong thư mục `assets`.
4. Yêu cầu thiết lập Admin chi tiết ngay lập tức khi cần thực thể mới.

## Quy tắc Không thể Thương lượng (Non-Negotiable)

- **Source of Truth:** Thư mục `assets` là nguồn duy nhất cho các file frontend.
- **Quy tắc Mirroring:** Sau khi chỉnh sửa `assets/css/*` hoặc `assets/js/*`, PHẢI sao chép nội dung chính xác sang file tương ứng trong `development-dev/assets/*`.
- **An toàn:** Không tự động đồng bộ file hình ảnh trừ khi được yêu cầu.
- **Phạm vi:** Không đọc hoặc sửa file `.env` trừ khi được phép.

## Danh sách Kiểm tra Thực thi (Execution Flow)

- [ ] Xác nhận phạm vi thay đổi (template, css/js, hoặc cả hai).
- [ ] Chỉnh sửa file nguồn trong `assets` trước đối với các thay đổi css/js.
- [ ] **Mirroring:** Sao chép nội dung chính xác sang `development-dev/assets`.
- [ ] Cập nhật các template MTML trong `development-dev` khi được yêu cầu.
- [ ] Kiểm tra các liên kết/đường dẫn trong template có trỏ đúng vào các đường dẫn tài sản có thể truy cập qua Docker không.
- [ ] **Escalation:** Nếu cần thêm thực thể Admin (CustomField, v.v.), hãy dừng lại và đưa ra yêu cầu thiết lập Admin chi tiết.

## Định dạng Yêu cầu Admin (Escalation)

Khi nhiệm vụ yêu cầu thêm `CustomField`, `ContentType`, hoặc `Template` mới trong Admin, hãy cung cấp yêu cầu chi tiết với:

1. Tên đề xuất.
2. Loại thực thể (`CustomField` / `ContentType` / `Template`).
3. Phạm vi (Website, Blog, ContentType, Entry, Category, v.v.).
4. Schema đầy đủ (key, label, data type, v.v.).
5. Mục đích sử dụng MTML và đoạn code ví dụ.
6. Thứ tự thiết lập an toàn.

## Khi nào áp dụng Skill này

Áp dụng tự động khi người dùng yêu cầu:
- Chỉnh sửa MT templates hoặc MTML.
- Thay đổi CSS/JS trong dự án này.
- Đồng bộ hóa `assets` và `development-dev/assets`.
- Triển khai hành vi frontend gắn liền với MT templates.
- Xem xét liệu các thực thể Admin có cần được tạo trước hay không.
