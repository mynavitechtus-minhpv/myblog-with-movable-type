# Tài liệu hướng dẫn hiệu ứng thiết kế First View (FV) Trang chủ_20260305:ver_1.0.0

## URL đối tượng
- [https://www.azcom-net.jp/](https://www.azcom-net.jp/)

---

## 1. Mục đích của tài liệu

Tài liệu này là **hướng dẫn nhằm chia sẻ các sắc thái về hiệu ứng thiết kế và animation** tại khu vực First View (FV) của trang chủ.

Chúng tôi có cung cấp file `Animation.html` để tham khảo, tuy nhiên việc triển khai thực tế **cần được xây dựng theo cách tối ưu nhất phù hợp với đặc thù của Movable Type.**

### ▼ Các điểm quan trọng cần tái hiện:

* Nhịp độ (tempo) của animation.
* Nhịp điệu hiển thị của hình ảnh và văn bản.
* Khả năng hiển thị tốt trên cả PC và Mobile.
* Ấn tượng tổng thể sang trọng, cao cấp.

*Lưu ý: Không nhất thiết phải sử dụng nguyên văn mã nguồn từ HTML tham khảo.*

---

## 2. Concept của Animation

### Triển khai sắc nét và để lại dư vị tinh tế

Bằng cách chuyển đổi các slide một cách nhịp nhàng nhưng để văn bản hiển thị thong thả, chúng ta hướng tới biểu hiện cân bằng giữa:

* **Sự năng động (Dynamic)**
* **Sự tin cậy (Trust)**

### ▼ Ấn tượng mong muốn:

* Sự mạnh mẽ của ngành logistics.
* Niềm tin vào doanh nghiệp.
* Sự mở rộng của dịch vụ.

---

## 3. Thời gian hiển thị và Nhịp điệu

Animation dựa trên nguyên tắc **Chu kỳ 5 giây × Số lượng slide**.

| Hạng mục | Thời gian | Ý đồ hiệu ứng |
| :--- | :--- | :--- |
| Thời gian hiển thị slide | 5.0 giây | Triển khai nhịp nhàng, không gây nhàm chán. |
| Zoom hình ảnh | Từ lúc bắt đầu ~ 5 giây | Chuyển động nhỏ để ảnh không bị tĩnh. |
| Xuất hiện văn bản | 0.8 giây sau khi bắt đầu | Hiển thị sau một nhịp nghỉ. |
| Hiển thị văn bản | Thong thả | Đủ thời gian để người dùng kịp đọc. |
| Toàn bộ loop | 15 giây (3 ảnh) | Hoàn thiện như một câu chuyện. |

---

## 4. Animation hình ảnh

Áp dụng hiệu ứng zoom nhẹ cho hình ảnh.

### ▼ Chuyển động cơ bản:
```css
scale(1.0) → scale(1.1)
```
Phóng to chậm rãi trong vòng 5 giây.

### ▼ Mục đích:
* Giảm bớt sự cứng nhắc của ảnh tĩnh.
* Tạo chiều sâu cho không gian.
* Mang lại ấn tượng cao cấp.

*Có thể triển khai bằng CSS hoặc JS.*

---

## 5. Animation văn bản

### ▼ Cách xuất hiện:
Hiển thị như đang nổi lên từ dưới.
```css
opacity: 0;
transform: translateY(20px);
↓
opacity: 1;
transform: translateY(0);
```

### ▼ Thời điểm hiển thị:
```text
0.8 giây sau khi slide bắt đầu hiển thị.
```
*Quan trọng: Kiểm soát theo thời gian tương đối **"sau khi slide trở nên active"**, không dùng giây cố định từ lúc load trang.*

---

## 6. Layout bản PC

### ▼ Cấu trúc:
| Khu vực | Tỷ lệ |
| :--- | :--- |
| Hình ảnh | 60% |
| Văn bản | 40% |

### ▼ Chi tiết:
* **Khu vực hình ảnh:** Nằm bên trái, rộng khoảng 60%, cao 100%.
* **Khu vực văn bản:** Nằm bên phải, rộng khoảng 40%, căn giữa theo chiều dọc.

---

## 7. Layout bản Mobile (SP)

### ▼ Cấu trúc Layout:
```
┌─────────────┐
│   Hình ảnh  │
│    (75%)    │
├─────────────┤
│   Văn bản   │
└─────────────┘
```

### ▼ Chi tiết:
* **Khu vực hình ảnh:** Chiếm khoảng 75% chiều cao màn hình.
* **Văn bản:** Đặt dưới hình ảnh, ưu tiên khả năng đọc.
* **Bảo vệ chủ thể ảnh:**
  ```css
  object-position: center top;
  ```
  Điều chỉnh để người hoặc xe tải nằm ở phần giữa đến phía trên.

---

## 8. Đảm bảo khả năng hiển thị

Trên Mobile, văn bản và hình ảnh có thể bị chồng lấn.

### ▼ Biện pháp xử lý ví dụ:
* Text shadow (đổ bóng chữ).
* Background gradient (dải màu nền).
* Background bán trong suốt.

### ▼ Mục đích:
Duy trì trạng thái có thể đọc dễ dàng trên mọi thiết bị.

---

## 9. Về việc thể hiện đường biên hình ảnh

Trong HTML tham khảo có sử dụng:
* Gradient
* Layer rộng 101%

Đây chỉ là để xác nhận giao diện.

### ▼ Phương châm triển khai:
Nếu không xảy ra các lỗi sau thì không cần tái hiện giống hệt:
* Nhiễu đường biên (boundary noise).
* Vết cắt không tự nhiên.

**Ưu tiên giải pháp tối ưu từ phía đội ngũ sản xuất** nếu có cách làm tự nhiên hơn.

---

## 10. Hình ảnh sử dụng

### ▼ PC
* fv_001.png, fv_002.png, fv_003.png

### ▼ Mobile
* fv_sp_001.png, fv_sp_002.png, fv_sp_003.png

### ▼ Link Download:
- [https://drive.google.com/drive/u/0/folders/1RmrWnDrH3chTvEFr7ixOMKAe1PGEVG8M](https://drive.google.com/drive/u/0/folders/1RmrWnDrH3chTvEFr7ixOMKAe1PGEVG8M)

---

## 11. Lưu ý về triển khai (Movable Type)

* **HTML:** Xuất ra trong MT template.
* **CSS:** Thêm vào file CSS của theme.
* **JS (nếu cần):** Thêm vào file JS dùng chung.

---

## 12. Về HTML tham khảo

File `Animation.html` dùng để kiểm tra các mục sau:
* Nhịp độ animation.
* Zoom hình ảnh.
* Cách xuất hiện văn bản.
* Layout PC / SP.

### ▼ Lưu ý:
Không cần sử dụng cùng một mã code. **Ưu tiên "tái hiện cảm giác về kích thước và nhịp điệu".**

---

## 13. Thông điệp gửi đến người thực hiện / Kỹ sư

Trong phần FV này, chúng tôi coi trọng **hiệu ứng tinh tế (vẻ sang trọng)** hơn là sự "hào nhoáng".

### ▼ Các điểm quan trọng:
* Dễ đọc.
* Chuyển động điềm tĩnh.
* Cảm giác tin cậy.

HTML tham khảo chỉ là **tài liệu để chia sẻ sắc thái thiết kế.**

---

## Bổ sung (Mối quan hệ với Guideline tổng thể)

Vui lòng triển khai dựa trên nền tảng thiết kế chung (Ví dụ: Layout width, font, màu sắc, v.v.)
-> Design Guideline v1.0