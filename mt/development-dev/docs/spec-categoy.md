# Tài liệu đặc tả Category / Tag / Sidebar_20260331:ver_1.1.0

---

## Tổng quan cập nhật

Trong phiên bản này, đã xử lý và thống nhất các điểm sau:

* Thống nhất URL category thành `/{section}/{slug}/`
* Thống nhất URL tag thành `/{section}/tags_{id}`
* Thống nhất URL chi tiết bài viết thành `/{section}/post_{id}`
* Làm rõ rule hiển thị category / tag ở sidebar bên phải
* Làm rõ sự đồng bộ với tài liệu thiết kế API
* Bổ sung định nghĩa về AZ-COM通信

---

## 1. Cấu trúc nội dung

Cấu trúc CMS của hệ thống như sau.
Mỗi nội dung được quản lý như một blog độc lập.

| Nội dung            | URL              | MT   |
| ------------------- | ---------------- | ---- |
| Thông báo           | /news            | Blog |
| Báo cáo hoạt động   | /activity-report | Blog |
| Menu hỗ trợ         | /support         | Blog |
| Giới thiệu supplier | /supplier        | Blog |

### 1.1 Cách xử lý AZ-COM通信

AZ-COM通信 không phải là blog riêng biệt, mà được quản lý như một **child category** của blog Thông báo (`/news`).

#### Ví dụ:

```
category.key = cat104
category.slug = azcom-newsletter
category.name = AZ-COM通信
```

---

## 2. Đặc tả Category

Thiết kế category tuân theo tài liệu sau:

```
pj_az-com_基本設計：カテゴリ一覧
```

### 2.1 Cấu trúc category

Category có cấu trúc 2 cấp:

```
Parent Category
└ Child Category
```

#### Ví dụ:

```
Sự kiện
├ Tổng hội
├ Golf
├ Hội thảo / Seminar
└ Giao lưu khu vực
```

### 2.2 Triển khai trên MT

Sử dụng chức năng category của Movable Type.

### 2.3 Quy tắc hiển thị UI

Trên UI, parent category chỉ dùng cho mục đích quản lý, chỉ hiển thị child category.

**Mục đích của parent category**

* Tổ chức quản lý CMS
* Quản lý cấu trúc category

**Hiển thị**

* Chỉ hiển thị child category

**Không hiển thị**

* Parent category

---

### 2.4 Quy tắc URL

URL category không bao gồm parent category.

```
Danh sách: /{section}/
Danh sách theo category: /{section}/{slug}/
Danh sách theo tag: /{section}/tags_{id}
Chi tiết: /{section}/post_{id}
```

#### Ví dụ:

```
/news/
/news/office-announcement/
/news/tags_1001
/news/post_123
```

---

### 2.5 Ghi chú

```
{section}：news / activity-report / support / supplier
{slug}：slug của child category được gán cho bài viết
{id}：ID nhận diện tag
{id}：ID bài viết
```

---

### 2.6 Trang category

Trang category sẽ hiển thị danh sách bài viết thuộc child category tương ứng.

---

## 3. Đặc tả Tag

Thiết kế tag tuân theo tài liệu sau:

```text
pj_az-com_基本設計：タグ一覧
```

### 3.1 Quản lý tag

Tag được quản lý theo từng blog.

Tuy nhiên trong vận hành, các tag có cùng tên sẽ được sử dụng theo rule chung.

**Đối tượng áp dụng**

* Thông báo
* Báo cáo hoạt động
* Menu hỗ trợ
* Supplier

---

### 3.2 Triển khai trên MT

Sử dụng chức năng tag của Movable Type.

Theo đặc tả MT, tag được quản lý riêng theo từng blog.
Vì vậy dù cùng tên, tag ở các blog khác nhau vẫn là tag độc lập về mặt hệ thống.

---

### 3.3 Định danh tag

Tag sẽ có `tag_key` để dùng làm định danh nội bộ (khác với tên hiển thị).

Giá trị `{id}` trong URL sẽ tương ứng với định danh này.

#### Ví dụ:

```
tag1001
tag2001
tag3001
tag4001
```

---

### 3.4 Quy tắc URL tag

URL danh sách theo tag:

```
/{section}/tags_{id}
```

#### Ví dụ:

```
/news/tags_1001
/activity-report/tags_2001
/support/tags_3001
/supplier/tags_4001
```

---

### 3.5 Hiển thị trang tag

Trang tag chỉ hiển thị bài viết thuộc cùng blog.

#### Ví dụ:

```
/news/tags_1001
```

#### Hiển thị:

```
Các bài viết trong blog news có tag_id = 1001
```

---

## 4. URL bài viết

URL chi tiết bài viết:

```text
/{section}/post_{id}
```

#### Ví dụ:

```
/news/post_123
/activity-report/post_456
/support/post_789
/supplier/post_1001
```

---

## 5. Đặc tả sidebar bên phải

Trong các trang nội dung bài viết, sẽ hiển thị sidebar bên phải.

**Trang áp dụng**

* Trang danh sách bài viết
* Trang category
* Trang tag
* Trang chi tiết bài viết

---

## 6. Cấu trúc sidebar bên phải

Sidebar gồm các thành phần:

* Ranking
* Danh sách category
* Danh sách tag

---

## 7. Hiển thị danh sách category

Sidebar chỉ hiển thị child category.

**Hiển thị**

* Child category

**Không hiển thị**

* Parent category

#### Ví dụ hiển thị:

```
Tổng hội
Golf
Seminar
```

#### Ví dụ không hiển thị:

```text
Sự kiện
```

---

## 8. Quy tắc hiển thị tag

Sidebar sẽ hiển thị toàn bộ tag thuộc blog hiện tại.

---

### 8.1 Trang danh sách bài viết

#### Ví dụ:

```
/news/
```

#### Tag hiển thị:

```
Tất cả tag thuộc blog news
```

---

### 8.2 Trang category

#### Ví dụ:

```
/news/office-announcement/
```

#### Tag hiển thị:

```
Tất cả tag của blog news
```

---

### 8.3 Trang tag

#### Ví dụ:

```
/news/tags_1001
```

#### Tag hiển thị:

```
Tất cả tag của blog news
```

---

### 8.4 Trang chi tiết bài viết

#### Ví dụ:

```
/news/post_1001
```

#### Tag hiển thị:

```
Tất cả tag của blog news
```

---

### 8.5 Giới hạn số lượng hiển thị

Không giới hạn số lượng tag hiển thị.

---

## 9. Điều khiển bằng MT template

Việc lấy category và tag được xử lý theo blog hiện tại trong MT template.

---

### 9.1 Lấy category

Chỉ lấy child category:

```
<mt:SubCategories>
<li>
<a href="<$mt:CategoryArchiveLink$>">
<$mt:CategoryLabel$>
</a>
</li>
</mt:SubCategories>
```

---

### 9.2 Lấy tag

Lấy toàn bộ tag thuộc blog hiện tại.

---

## 10. Tái sử dụng sidebar

Sidebar được chuẩn hóa thành module template dùng chung.

#### Ví dụ:

```
module_sidebar
```

#### Cách gọi:

```
<mt:Include module="module_sidebar">
```

---

## 11. Chính sách SEO

**Trang áp dụng**

* Trang chi tiết bài viết
* Trang category
* Trang tag

Các trang trên mặc định là **index**.
※ Nếu số lượng trang tag quá nhiều, có thể xem xét `noindex` trong tương lai.

---

## 12. Quy tắc vận hành

### Các trường bắt buộc khi tạo bài viết

| Trường   | Bắt buộc |
| -------- | -------- |
| Category | Bắt buộc |
| Tag      | Bắt buộc |

---

## 13. Màn hình dự kiến

```
Trang bài viết
├ Category
├ Tag
└ Sidebar
   ├ Ranking
   ├ Category (chỉ child)
   └ Tag
```

---

## 14. Bổ sung về đồng bộ với API

* Category có cấu trúc `key / slug / name`
* Tag có `key / name` (không có slug)
* URL tag sử dụng format `tags_{id}`
* `{id}` của tag tương ứng với `tag_key`
* AZ-COM通信 được xử lý như child category của `/news`
* API cho site member phải tuân theo đặc tả trả về category / tag / sidebar trong tài liệu API