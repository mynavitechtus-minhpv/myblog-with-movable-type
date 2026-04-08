# Tài liệu đặc tả xử lý ngoại lệ category (Phụ lục)_20260331:ver_1.1.0

---

## Tóm tắt chỉnh sửa

Ở phiên bản này, các nội dung sau đã được làm rõ:

* Quy định rõ việc AZ-COM通信 (`cat104 / azcom-newsletter`) được **bắt buộc xử lý như category chỉ dành cho hội viên**
* Quy định rõ rule **ưu tiên判定 category hơn `display_target`**
* Ghi rõ phạm vi ảnh hưởng đến danh sách / chi tiết / side menu / ranking / API
* Làm rõ điều kiện truy xuất API có chứa điều kiện AND / OR
* Ghi rõ tiền đề triển khai bằng static output qua MT template

---

## 1. Mục đích

Tài liệu này định nghĩa xử lý ngoại lệ cho category để **AZ-COM通信** được quản lý trong Movable Type (sau đây gọi là MT) như một nội dung chỉ dành cho site hội viên.

Mục tiêu là ngay cả khi editor cấu hình sai `display_target`, hệ thống vẫn tự xử lý đích hiển thị, để **bài viết này luôn hiển thị trên site hội viên và tuyệt đối không hiển thị trên site corporate**.

---

## 2. Category áp dụng

AZ-COM通信 được quản lý như child category dưới blog Thông báo (`/news`).

| key      | slug               | name     |
| -------- | ------------------ | -------- |
| `cat104` | `azcom-newsletter` | AZ-COM通信 |

---

## 3. Rule ưu tiên cao nhất

Thứ tự ưu tiên của điều khiển hiển thị trong tài liệu này là như sau.
Nghĩa là nếu category mục tiêu là `azcom-newsletter`, thì bất kể giá trị của `display_target` là gì, trên hệ thống bài viết đó vẫn sẽ được xử lý là **bài viết chỉ dành cho hội viên**.

```text
category > display_target
```

---

## 4. Chính sách hiển thị

Các bài viết thuộc category AZ-COM通信 sẽ được cưỡng chế theo rule sau.
Rule này được ưu tiên hơn `display_target`.

| Nơi hiển thị   | Có hiển thị hay không |
| -------------- | --------------------- |
| Site hội viên  | Hiển thị              |
| Site corporate | Không hiển thị        |

---

## 5. Quan hệ với display_target

Điều kiện hiển thị của bài viết thông thường như sau:

| Giá trị     | Nơi hiển thị       |
| ----------- | ------------------ |
| `corporate` | Chỉ site corporate |
| `member`    | Chỉ site hội viên  |
| `both`      | Cả hai             |

Tuy nhiên, các bài viết thuộc category AZ-COM通信 là ngoại lệ.

| category           | display_target | Site hội viên | Site corporate |
| ------------------ | -------------- | ------------- | -------------- |
| `azcom-newsletter` | `corporate`    | Hiển thị      | Không hiển thị |
| `azcom-newsletter` | `member`       | Hiển thị      | Không hiển thị |
| `azcom-newsletter` | `both`         | Hiển thị      | Không hiển thị |

Nói cách khác, riêng với category AZ-COM通信 thì sẽ **không dùng `display_target` để phán định**.

---

## 6. Phạm vi ảnh hưởng

Xử lý ngoại lệ này áp dụng cho toàn bộ các phần sau:

* Danh sách bài viết
* Chi tiết bài viết
* Side menu bên phải

  * Danh sách category
  * Danh sách tag
  * Ranking
* JSON API

  * API danh sách
  * API chi tiết
  * API side menu
  * API ranking
  * API bài viết mới nhất

---

## 7. Rule áp dụng theo từng màn hình

### 7.1 Danh sách bài viết

#### Site hội viên

Trong danh sách `/news`, bài viết AZ-COM通信 phải được bao gồm trong đối tượng hiển thị.

#### Site corporate

Trong danh sách `/news`, bài viết AZ-COM通信 luôn bị loại trừ.

---

### 7.2 Chi tiết bài viết

#### Site hội viên

Trang chi tiết của bài viết AZ-COM通信 là đối tượng hiển thị.

#### Site corporate

Trang chi tiết của bài viết AZ-COM通信 không phải là đối tượng output.

---

### 7.3 Side menu bên phải

Side menu bên phải gồm các phần sau:

* Ranking
* Danh sách category
* Danh sách tag

#### Site hội viên

Các bài viết và category liên quan đến AZ-COM通信 được phép hiển thị.

#### Site corporate

Category AZ-COM通信 và các bài viết tương ứng phải bị loại khỏi đối tượng hiển thị.

---

### 7.4 Ranking

#### Site hội viên

Bài viết AZ-COM通信 có thể trở thành đối tượng của ranking.

#### Site corporate

Bài viết AZ-COM通信 không được đưa vào ranking.
Chi tiết về ranking tuân theo `jp_ランキング機能仕様書`.

---

## 8. Đặc tả điều khiển API

Trong tài liệu này, điều kiện truy xuất API phải được mô tả rõ ràng, không mơ hồ, và phải thể hiện rõ AND / OR.

---

### 8.1 API nhóm news cho site hội viên

**Ví dụ đối tượng áp dụng:**

* `/api/news.json`
* `/api/news/post_{id}.json`
* `/api/news-sidebar.json`
* `/api/news-ranking.json`
* `/api/news-latest.json`

**Điều kiện lấy dữ liệu:**

```text
Trạng thái bài viết = 公開
AND
(
  display_target = member
  OR display_target = both
  OR category.slug = azcom-newsletter
)
```

Nghĩa là, các bài viết thuộc category AZ-COM通信 luôn phải được bao gồm trong output dành cho hội viên.

---

### 8.2 Output nhóm news cho site corporate

**Điều kiện lấy dữ liệu:**

```text
Trạng thái bài viết = 公開
AND
(
  display_target = corporate
  OR display_target = both
)
AND
category.slug != azcom-newsletter
```

Nghĩa là, các bài viết thuộc category AZ-COM通信 luôn phải bị loại trừ.

---

### 8.3 Áp dụng cho Ranking API

#### `news-ranking` cho site hội viên

```text
ranking_enabled = 1
AND Trạng thái bài viết = 公開
AND section = news
AND
(
  display_target = member
  OR display_target = both
  OR category.slug = azcom-newsletter
)
```

#### `news-ranking` cho site corporate

```text
ranking_enabled = 1
AND Trạng thái bài viết = 公開
AND section = news
AND
(
  display_target = corporate
  OR display_target = both
)
AND category.slug != azcom-newsletter
```

---

### 8.4 Áp dụng cho Latest API

#### `news-latest` cho site hội viên

```text
Trạng thái bài viết = 公開
AND
(
  display_target = member
  OR display_target = both
  OR category.slug = azcom-newsletter
)
```

#### Hiển thị latest cho site corporate

```text
Trạng thái bài viết = 公開
AND
(
  display_target = corporate
  OR display_target = both
)
AND category.slug != azcom-newsletter
```

---

## 9. Tính nhất quán với side menu

Theo đặc tả category / tag / side menu, side menu bên phải được hiển thị theo từng blog.
Trên cơ sở đó, đối với blog news, cần áp dụng thêm xử lý ngoại lệ này.

### 9.1 Danh sách category

* Site hội viên: có thể bao gồm `AZ-COM通信` trong đối tượng hiển thị
* Site corporate: không hiển thị `AZ-COM通信`

### 9.2 Danh sách tag

Bản thân tag được lấy theo từng blog, nhưng ở danh sách sau khi click tag và luồng dẫn tới bài viết thì phải áp dụng xử lý ngoại lệ này.

### 9.3 Ranking

Ranking không được mâu thuẫn với đặc tả category.

Cụ thể:

* Ranking của site hội viên: có thể hiển thị bài viết AZ-COM通信
* Ranking của site corporate: không được hiển thị bài viết AZ-COM通信

---

## 10. Các case giả định

### Case 1

```text
Category：AZ-COM通信
display_target：corporate
```

**Kết quả**

```text
Site hội viên：Hiển thị
Site corporate：Không hiển thị
```

### Case 2

```text
Category：AZ-COM通信
display_target：both
```

**Kết quả**

```text
Site hội viên：Hiển thị
Site corporate：Không hiển thị
```

### Case 3

```text
Category：運営事務局からのお知らせ
display_target：both
```

**Kết quả**

```text
Site hội viên：Hiển thị
Site corporate：Hiển thị
```

### Case 4

```text
Category：AZ-COM通信
ranking_enabled：1
display_target：corporate
```

**Kết quả**

```text
Ranking site hội viên：Là đối tượng hiển thị
Ranking site corporate：Không phải đối tượng hiển thị
```

---

## 11. Rule vận hành trên màn hình quản trị

Về mặt vận hành cho editor, khi tạo bài viết AZ-COM通信, khuyến nghị thiết lập như sau:

```text
Category：AZ-COM通信
display_target：member
```

Tuy nhiên, ngay cả khi cấu hình sai, hệ thống vẫn phải đảm bảo các điểm sau:

* Hiển thị trên site hội viên
* Không hiển thị trên site corporate

---

## 12. Phương châm triển khai

Xử lý ngoại lệ này sẽ được triển khai bằng static output thông qua MT template.

**Đối tượng triển khai**

* Template output JSON cho site hội viên
* Template hiển thị cho site corporate
* Template output side menu
* Template output ranking
* Template output latest article

**Tiền đề**

* Điều khiển bằng MT template
* Xử lý bằng static JSON output
* Không xử lý ở phía PHP server
* Không customize màn hình quản trị MT

---

## 13. Tư tưởng thiết kế

Đặc tả này là một biện pháp an toàn để hệ thống hấp thụ các lỗi nhập liệu từ CMS, với tư tưởng thiết kế như sau.
Bằng cách tuân thủ đúng thứ tự ưu tiên này, có thể duy trì tính nhất quán trong điều khiển hiển thị ở toàn bộ danh sách / chi tiết / side menu / ranking / API.

```text
category > display_target
```
