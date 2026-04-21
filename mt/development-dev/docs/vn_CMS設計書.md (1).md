# Tài liệu Thiết kế CMS_20260317:ver_1.0.0

---

## 1. Tổng quan

Tài liệu này định nghĩa thiết kế CMS sử dụng Movable Type (sau đây gọi là MT) để quản lý nội dung bài viết của trang web AZ-COM và **cung cấp dữ liệu cho trang web dành cho hội viên (Member Site).**

### ▼ Phân chia vai trò

| Phân loại | Hệ thống | Vai trò |
| :--- | :--- | :--- |
| **CMS** | Movable Type | Quản lý bài viết / Danh mục / Thẻ / Tạo JSON API |
| **Front-end** | AWS Member Site | Lấy dữ liệu API / Hiển thị UI / Xác thực hội viên |

---

## 2. Sơ đồ hệ thống

```
Editor (Người biên tập)
  │
  │ Đăng bài viết
  ▼
Movable Type (CMS)
  │
  │ Xuất JSON API
  ▼
API (JSON)
  │
  ▼
AWS Member Site
  │
  ▼
Hiển thị giao diện người dùng (Member UI)
```

---

## 3. Cấu trúc Blog trên CMS

Mỗi nội dung sẽ được **quản lý như một Blog độc lập**.

| Nội dung | Thư mục (Directory) | Loại thực thể trong MT |
| :--- | :--- | :--- |
| Thông báo (News) | `/news` | Blog |
| Báo cáo hoạt động | `/activity-report` | Blog |
| Menu hỗ trợ | `/support` | Blog |
| Giới thiệu nhà cung cấp | `/supplier` | Blog |

---

## 4. Bản tin AZ-COM (Back number)

Bản tin AZ-COM không phải là một blog độc lập mà được **quản lý như một danh mục con (sub-category) trong Blog Thông báo (News).**

```
/news
 └ AZ-COM Newsletter (Bản tin AZ-COM)
```

### ▼ Ví dụ thiết lập:

| Key | Slug | Name |
| :--- | :--- | :--- |
| cat104 | `azcom-newsletter` | AZ-COM通信 (Bản tin AZ-COM) |

---

## 5. Cấu trúc bài viết

Bài viết sử dụng đối tượng **Entry** của Movable Type.

### ▼ Thông tin lưu trữ:

| Item | Nội dung |
| :--- | :--- |
| `post_id` | ID bài viết |
| `title` | Tiêu đề |
| `body` | Nội dung chính (HTML) |
| `thumbnail` | Ảnh thu nhỏ |
| `category` | Danh mục |
| `tags` | Thẻ |
| `published_at` | Ngày xuất bản |
| `display_target` | Đối tượng hiển thị |
| `ranking_enabled` | Có thuộc đối tượng xếp hạng không |

---

## 6. Thiết kế Danh mục (Category)

Danh mục có **cấu trúc 2 cấp**.

```
Danh mục cha (Parent)
└ Danh mục con (Child)
```

### ▼ Ví dụ:
```
Sự kiện (Event)
 ├ Đại hội cổ đông
 ├ Giải Golf
 ├ Đào tạo / Hội thảo
 └ Giao lưu khu vực
```

### ▼ Hiển thị UI:
* **Chỉ hiển thị danh mục con.**
* *Lưu ý: Danh mục cha chỉ dùng để sắp xếp trên CMS.*

---

## 7. URL Danh mục

### ▼ Cấu trúc URL:
* Trang danh sách: `/phân-loại/`
* Trang danh mục: `/phân-loại/{slug}/`

### ▼ Ví dụ:
* `/news/`
* `/news/office-announcement/`

---

## 8. Thiết kế Thẻ (Tag)

Thẻ được quản lý theo từng Blog (theo đặc tính của MT).
Về mặt vận hành, các thẻ sẽ được sử dụng theo khái niệm chung.

### ▼ Ví dụ thẻ:
`DX`, `BCP`, `An toàn`, `Nhân sự`, `Phúc lợi`

### ▼ Cấu trúc URL:
* `/phân-loại/tags_{tag_id}/`

### ▼ Ví dụ:
* `/news/tags_1001/`

---

## 9. Custom Fields (Trường tùy chỉnh)

### ▼ `display_target` (Đối tượng hiển thị)

| Giá trị | Ý nghĩa |
| :--- | :--- |
| `corporate` | Chỉ hiển thị trên trang Corporate |
| `member` | Chỉ hiển thị trên trang Hội viên |
| `both` | Hiển thị trên cả hai |

### ▼ `ranking_enabled` (Bật xếp hạng)

| Giá trị | Ý nghĩa |
| :--- | :--- |
| `0` | Không đưa vào xếp hạng |
| `1` | Đưa vào xếp hạng |

### ▼ Blog áp dụng:
`news`, `activity-report`, `support`

### ▼ Blog ngoại trừ:
`supplier`

---

## 10. Kiểm soát hiển thị

### ▼ Trang Corporate:
Hiển thị nếu `display_target` là `corporate` hoặc `both`.

### ▼ Trang Hội viên (Member Site):
Hiển thị nếu `display_target` là `member` hoặc `both`.

---

## 11. Xử lý ngoại lệ cho Bản tin AZ-COM

Bản tin AZ-COM có **quyền ưu tiên cao hơn `display_target`**.

### ▼ Thứ tự ưu tiên kiểm tra:
1. Kiểm tra nếu `category.key = cat104`
2. Sau đó mới kiểm tra `display_target`

### ▼ Chính sách hiển thị:
* **Member Site:** Hiển thị.
* **Corporate Site:** Không hiển thị.
* **Kết luận:** Bản tin AZ-COM = Bài viết dành riêng cho hội viên.

---

## 12. URL Bài viết

Cấu trúc: `/phân-loại/post_{id}/`

### ▼ Ví dụ:
* `/news/post_123/`
* `/activity-report/post_456/`
* `/support/post_789/`

---

## 13. Menu bên phải (Right Side Menu)

### ▼ Trang áp dụng:
Danh sách bài viết, Trang danh mục, Trang thẻ, Chi tiết bài viết.

### ▼ Thành phần:
Bảng xếp hạng (Ranking), Danh sách danh mục, Danh sách thẻ.

---

## 14. Quy định Xếp hạng (Ranking)

### ▼ Điều kiện:
* `ranking_enabled = 1`
* Trạng thái bài viết = `Published` (Đã xuất bản)

### ▼ Thứ tự sắp xếp:
`published_at DESC` (Mới nhất lên đầu)

### ▼ Số lượng hiển thị:
Tối đa 5 bài.

### ▼ Trường hợp thiếu dữ liệu:
Bổ sung bằng các bài viết mới nhất.

---

## 15. Kết nối API

MT sẽ cung cấp dữ liệu cho trang Hội viên thông qua **xuất file JSON tĩnh**.

### ▼ API Danh sách:
`/api/{blog}.json`
*(VD: `/api/news.json`, `/api/support.json`)*

### ▼ API Chi tiết:
`/api/{blog}/post_{post_id}.json`

### ▼ API Side Menu:
`/api/{blog}-sidebar.json`
*(Chứa dữ liệu: Ranking, Category, Tags)*

### ▼ API Bài viết mới nhất:
`/api/{blog}-latest.json`
*(Số lượng: 5 bài. Dùng cho: Trang chủ My Page)*

---

## 16. Quy định xuất HTML

```html
<div class="mt-content">
  </div>
```
### ▼ Mục đích:
Tránh xung đột CSS giữa CMS và trang web đích.

---

## 17. Tái tạo JSON (Regeneration)

Khi một bài viết được xuất bản, các file sau phải được tạo lại:
1. JSON Danh sách (List JSON)
2. JSON Chi tiết (Detail JSON)
3. JSON Side menu
4. JSON Bài viết mới nhất (Latest JSON)

---

## 18. Chính sách SEO

### ▼ Blog áp dụng:
`news`, `activity-report`, `support`, `supplier`

### ▼ Trang áp dụng:
Bài viết, Danh mục, Thẻ.

---

## 19. Bảo mật (Security)

### ▼ Đối tượng cần ngăn chặn rò rỉ:
* Rò rỉ bài viết dành cho hội viên.
* Rò rỉ trang thẻ.
* Rò rỉ qua công cụ tìm kiếm.

### ▼ Biện pháp:
Kiểm soát qua `display_target` và xử lý ngoại lệ cho Danh mục.

---

## 20. Luồng vận hành (Operation Flow)

1. Tạo bài viết.
2. Thiết lập Danh mục.
3. Thiết lập Thẻ.
4. Thiết lập `display_target`.
5. Thiết lập `ranking`.
6. Kiểm tra bản xem trước (Preview).
7. Xuất bản (Publish).
8. Xác nhận JSON đã được tạo.

---

## 21. Giả định mở rộng

Dự kiến trong tương lai sẽ bổ sung:
* Search API.
* Tìm kiếm theo thẻ.
* JSON theo từng danh mục.
* Tìm kiếm toàn văn (Full-text search).

---

## 22. Triết lý thiết kế

* **MT = CMS** (Quản lý nội dung)
* **API = Data Layer** (Lớp dữ liệu)
* **Member Site = UI** (Giao diện người dùng)

### ▼ Giá trị mang lại:
* Có thể thay đổi CMS linh hoạt.
* Tự do tùy biến UI.
* Đảm bảo khả năng mở rộng trong tương lai.