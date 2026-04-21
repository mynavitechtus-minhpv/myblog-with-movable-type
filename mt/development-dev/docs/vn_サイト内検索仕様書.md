# Tài liệu đặc tả chức năng tìm kiếm trong trang_20260414:ver_1.1.0

---

## Lịch sử chỉnh sửa

| Phiên bản | Ngày | Nội dung |
| --------- | ---- | -------- |
| 1.0.0 | 2026-04-14 | Phiên bản đầu tiên. Xác nhận và phản ánh các mục Q1〜Q9 dựa trên bản thảo |
| 1.1.0 | 2026-04-14 | Bổ sung trang cố định vào phạm vi tìm kiếm. Chỉnh sửa §4・§5・§6・§8・§11・§13 |

---

## 1. Mục đích

Tài liệu này định nghĩa phương hướng triển khai ban đầu cho chức năng tìm kiếm trong trang của website corporate AZ-COM.  
Trong giai đoạn triển khai ban đầu, ưu tiên hiệu suất tìm kiếm và khả năng bảo trì, **không sử dụng full-text search nặng mà sử dụng tìm kiếm đơn giản dựa trên JSON tĩnh**.

---

## 2. Phương hướng cơ bản

### 2-1. Phương thức tìm kiếm

* Xuất **JSON tĩnh dùng cho tìm kiếm** từ Movable Type
* Tại trang kết quả tìm kiếm, lấy JSON bằng JavaScript và thực hiện lọc ở phía client
* Không sử dụng công cụ tìm kiếm bên ngoài, full-text search phía server, hoặc tìm kiếm DB trong giai đoạn triển khai ban đầu

### 2-2. Lý do chọn phương hướng này

* Để phù hợp với phương hướng xuất HTML tĩnh / JSON tĩnh của MT
* Để không làm nặng query, giảm chi phí triển khai và bảo trì
* Bằng cách giới hạn phạm vi tìm kiếm, có thể giảm thiểu các kết quả không liên quan (noise)

---

## 3. Trang đích và URL

### 3-1. Trang kết quả tìm kiếm

* URL：`/search/`

### 3-2. Tham số query

* Từ khóa tìm kiếm：`q`
* Số trang：`page`

**Về tên tham số**  
Sử dụng `q`. Lý do：

* Các component header (PC / SP) đã được triển khai với `name="q"` nên không cần chỉnh sửa phía header, chi phí bằng 0
* `q` là quy ước giống với các công cụ tìm kiếm lớn như Google・Bing, là ký hiệu chuẩn cho tham số tìm kiếm trên Web
* Các công cụ phân tích truy cập (GA4 v.v.) cũng thường tự động nhận dạng `q` là query tìm kiếm

### 3-3. Ví dụ URL

* `/search/?q=BCP`
* `/search/?q=BCP&page=2`

---

## 4. Phạm vi đối tượng tìm kiếm

### 4-1. Danh sách trang đưa vào phạm vi

Các trang được đưa vào search index như sau. Phân loại theo loại nội dung.

#### A. Trang cố định (Fixed page)

| URL | Tên trang |
| --- | --------- |
| `/about/` | Giới thiệu về AZ-COM Network |
| `/greeting/` | Lời chào |
| `/history/` | Lịch sử |
| `/company/` | Thông tin công ty |
| `/bcp/` | BCP |

Trang cố định là nội dung tĩnh không thay đổi. Được quản lý dưới dạng "Web page" của MT hoặc HTML.

#### B. Trang chi tiết bài viết

| Pattern URL | Section |
| ----------- | ------- |
| `/news/post_{id}/` | Thông báo |
| `/activity-report/post_{id}/` | Báo cáo hoạt động |
| `/support/post_{id}/` | Menu hỗ trợ |

#### C. Ngoài phạm vi index (Trang danh sách)

Các trang danh sách sau đây không được đưa vào search index.  
Vì bản thân trang danh sách không phải là nội dung riêng lẻ, nên việc hiển thị trang chi tiết như một kết quả tìm kiếm sẽ hữu ích hơn.

* `/news/`
* `/activity-report/`
* `/support/`

### 4-2. Nội dung nằm ngoài phạm vi

* `/supplier/`：Là blog dành riêng cho trang member, nên bị loại trừ
* Bài viết dành riêng cho trang member (`display_target = member` v.v.)：Không phải dành cho corporate site nên bị loại trừ
* Danh sách theo category・danh sách theo tag (`/news/{slug}/`・`/news/tags_{id}` v.v.)：Loại trừ tương tự trang danh sách

### 4-3. Điều kiện xuất đối với bài viết

Đối với trang chi tiết bài viết, chỉ đưa vào những mục thỏa mãn TẤT CẢ các điều kiện sau.

1. Trạng thái bài viết là đã đăng (published)
2. `display_target = corporate` hoặc `display_target = both`
3. `category.slug != azcom-newsletter`（Loại trừ AZ-COM通信）

**Ghi chú**  
AZ-COM通信 được quản lý như sub-category (`category.slug = azcom-newsletter`) dưới `/news`.  
Không đưa vào search index của corporate site.

### 4-4. Điều kiện xuất đối với trang cố định

Vì tất cả trang cố định đều dành cho corporate site, nên đưa vào index nếu đang ở trạng thái đã đăng.  
Không thiết lập custom field `display_target` cho trang cố định.

---

## 5. Các mục đối tượng tìm kiếm

Nguồn lấy dữ liệu khác nhau tùy loại nội dung (trang cố định / bài viết).

### 5-1. Các mục được đưa vào đối tượng tìm kiếm

| Trường | Nguồn lấy (trang cố định) | Nguồn lấy (bài viết) | Ghi chú |
| ------ | ------------------------- | --------------------- | ------- |
| Tiêu đề | Tiêu đề trang (MT `PageTitle` v.v.) | `EntryTitle` | Giống với h1（tham khảo §5-5）|
| Mô tả (description) | Custom field `meta_description` | Custom field `meta_description` → `EntryExcerpt`（tham khảo §5-4）| Cùng tên field cho cả trang cố định và bài viết |
| Tên category | Không có（`null`） | `name` của primary child category | Trang cố định không có category |
| Tên tag | Không có（mảng rỗng） | `name` của tất cả tag trong bài viết | Trang cố định không có tag |
| Văn bản mục lục | Trích xuất từ danh sách mục lục trong body HTML | Giống trái | Tham khảo §5-2 |
| Văn bản tiêu đề H2 | Trích xuất từ `<h2>` trong body HTML | Giống trái | Tham khảo §5-3 |

### 5-2. Cách lấy văn bản mục lục（`toc_text`）

Văn bản mục lục được tạo bằng cách trích xuất danh sách mục lục có trong body bằng MT template.

**Tên class của markup mục lục chưa được xác định.** Sẽ quyết định các mục sau khi thiết kế bài viết và triển khai editor được xác nhận：

* Tên class HTML gán cho danh sách mục lục（ví dụ：`toc`、`entry-toc` v.v.）
* Cách phán định bài viết có mục lục và không có mục lục

Ví dụ triển khai trong MT template（trường hợp tên class là `toc`）：

```
<$mt:EntryBody regex_replace="/.*?<ul[^>]*class=\"toc\"[^>]*>(.*?)<\/ul>.*/s","$1" regex_replace="/<[^>]+>//g"$>
```

* Bài viết không có mục lục thì `toc_text` là chuỗi rỗng
* Cập nhật tài liệu này khi spec markup của mục lục được xác nhận

### 5-3. Cách lấy văn bản tiêu đề H2（`heading_text`）

Trích xuất văn bản của tag `<h2>` trong body HTML và nối lại bằng dấu cách half-width.

```
<$mt:EntryBody regex_replace="/.*?(<h2[^>]*>.*?<\/h2>).*/gs","$1" regex_replace="/<[^>]+>//g"$>
```

### 5-4. Fallback cho description

| Độ ưu tiên | Nguồn lấy | Ví dụ MT tag |
| ---------- | --------- | ------------ |
| 1 | Custom field `meta_description` | `<$mt:EntryCustomField basename="meta_description"$>` |
| 2 | Tóm tắt（EntryExcerpt）※Chỉ dành cho bài viết | `<$mt:EntryExcerpt$>` |

Cả trang cố định và bài viết đều sử dụng custom field `meta_description`.  
Vì trang cố định không có fallback（EntryExcerpt）, nên vận hành theo quy tắc bắt buộc phải nhập `meta_description`.

Triển khai fallback bằng `<mt:If>` trong template sinh JSON（chỉ dành cho bài viết）.

```
<mt:If tag="EntryCustomField basename='meta_description'">
<$mt:EntryCustomField basename="meta_description"$>
<mt:Else>
<$mt:EntryExcerpt$>
</mt:If>
```

### 5-5. Cách xử lý H1

Trong nội dung bài viết, `EntryTitle`（tiêu đề bài viết）sẽ được xuất ra như `<h1>` của trang.  
Do đó, văn bản `h1` đã được đưa vào đối tượng tìm kiếm thông qua field `title`, không cần trích xuất riêng.

Tương tự, `h1` của trang cố định cũng giống với tiêu đề trang（`PageTitle` v.v.）và được xử lý thông qua field `title`.

### 5-6. Các mục không đưa vào đối tượng tìm kiếm

* Toàn bộ nội dung body（văn bản đoạn thông thường）
* Tiêu đề H3 trở xuống
* Comment, bài viết liên quan, chú thích sidebar và các thông tin nằm ngoài body

---

## 6. Đặc tả search index

### 6-1. Nguồn lấy

Xuất dưới dạng JSON tĩnh từ Movable Type.  
Trang cố định và bài viết được gộp chung vào cùng một file.

### 6-2. Endpoint

* `/api/search-index.json`

### 6-3. Tổng quan schema

Tất cả record đều có field `type` chung để phân biệt trang cố định và bài viết.

| Trường | Kiểu dữ liệu | Trang cố định | Bài viết |
| ------ | ------------ | ------------- | -------- |
| `type` | string | `"page"` | `"entry"` |
| `id` | number / null | `null`（nhận dạng bằng URL）| `post_id`（ID bài viết）|
| `section` | string | `"about"` v.v. | `"news"` v.v. |
| `title` | string | Tiêu đề trang | Tiêu đề bài viết |
| `description` | string | Meta description | Custom field / EntryExcerpt |
| `date` | string / null | `null` | Ngày đăng（ISO 8601）|
| `category` | object / null | `null` | Primary child category |
| `tags` | array | `[]` | Mảng tag |
| `toc_text` | string | Trích từ mục lục body（nếu không có thì `""`）| Giống trái |
| `heading_text` | string | Trích từ H2 body（nếu không có thì `""`）| Giống trái |
| `url` | string | `/about/` v.v. | `/news/post_123` v.v. |
| `search_text` | string | Chuỗi tìm kiếm đã nối | Giống trái |

### 6-4. Ví dụ record：Trang cố định

```json
{
  "type": "page",
  "id": null,
  "section": "about",
  "title": "AZ-COMネットワークとは",
  "description": "AZ-COMネットワークは物流業界の中小企業を支援するネットワークです。",
  "date": null,
  "category": null,
  "tags": [],
  "toc_text": "AZ-COMネットワークの特長 サービス内容 加盟について",
  "heading_text": "AZ-COMネットワークの特長 サービス内容",
  "url": "/about/",
  "search_text": "AZ-COMネットワークとは AZ-COMネットワークは物流業界の中小企業を支援するネットワークです AZ-COMネットワークの特長 サービス内容 加盟について"
}
```

### 6-5. Ví dụ record：Bài viết

```json
{
  "type": "entry",
  "id": 123,
  "section": "news",
  "title": "BCP対策セミナー開催のお知らせ",
  "description": "BCP強化に向けたセミナーを開催します。",
  "date": "2026-01-01T10:00:00+09:00",
  "category": {
    "key": "cat101",
    "slug": "office-announcement",
    "name": "運営事務局からのお知らせ"
  },
  "tags": [
    { "key": "tag1002", "name": "BCP" }
  ],
  "toc_text": "開催概要 対象者 申込方法",
  "heading_text": "BCP対策の必要性 中小企業に求められる備え",
  "url": "/news/post_123",
  "search_text": "BCP対策セミナー開催のお知らせ BCP強化に向けたセミナーを開催します 運営事務局からのお知らせ BCP 開催概要 対象者 申込方法 BCP対策の必要性 中小企業に求められる備え"
}
```

**Về `category`**  
`category` trả về primary child category（1 bài viết 1 category）dưới dạng single object. Không phải array.  
Trang cố định thì `null`.

### 6-6. Quy tắc sinh `search_text`

`search_text` là chuỗi chuyên dùng cho tìm kiếm, được tạo bằng cách nối các mục sau với dấu cách half-width.  
Bỏ qua các field có giá trị `null` hoặc rỗng.

1. `title`
2. `description`
3. `category.name`（Chỉ dành cho bài viết. Bỏ qua đối với trang cố định）
4. `tags[].name`（Chỉ dành cho bài viết. Bỏ qua đối với trang cố định）
5. `toc_text`
6. `heading_text`

**Về chuẩn hóa（normalize）**  
`search_text` không được normalize tại thời điểm sinh. Thực hiện normalize phía JS khi tìm kiếm（tham khảo §7-1）.

### 6-7. Thời điểm cập nhật file JSON

* Bài viết：Rebuild MT khi đăng・cập nhật・xóa
* Trang cố định：Rebuild MT khi cập nhật trang

---

## 7. Logic tìm kiếm

### 7-1. Chuẩn hóa（Thực hiện phía JS）

Trước khi tìm kiếm, thực hiện chuẩn hóa sau ở phía JavaScript. Đối tượng là **cả query tìm kiếm** và **`search_text`**.

* Xóa khoảng trắng đầu và cuối
* Thống nhất khoảng trắng full-width thành half-width
* Nén các khoảng trắng liên tiếp thành một
* Chuyển chữ cái và số thành chữ thường（lowercase）

```javascript
function normalize(str) {
  return str
    .trim()
    .replace(/\u3000/g, ' ')   // Khoảng trắng full-width → half-width
    .replace(/\s+/g, ' ')      // Nén khoảng trắng liên tiếp
    .toLowerCase();
}
```

**Ghi chú**  
Lý do normalize phía JS chứ không phải lúc xuất MT：  
Nếu normalize lúc sinh JSON thì khả năng đọc của dữ liệu gốc giảm, khiến việc tái sử dụng và debug trong tương lai trở nên khó khăn.

### 7-2. Tách từ khóa

* Cho phép tìm kiếm nhiều từ bằng cách tách theo dấu cách

### 7-3. Phương thức phán định

* Sử dụng **tìm kiếm AND**
* Chỉ tính là kết quả khi TẤT CẢ từ sau khi tách đều có trong `search_text`

```javascript
const keywords = normalize(query).split(' ').filter(Boolean);
const results = index.filter(item => {
  const text = normalize(item.search_text);
  return keywords.every(kw => text.includes(kw));
});
```

### 7-4. Những gì không xử lý trong triển khai ban đầu

* Tìm kiếm mờ（fuzzy search）
* Từ điển biến thể cách viết
* Tìm kiếm từ đồng nghĩa
* Sửa lỗi typo
* Phân tích hình thái học（morphological analysis）

---

## 8. Thứ tự sắp xếp

Thứ tự hiển thị kết quả tìm kiếm như sau.

1. Hiển thị trang cố định ở đầu（Ưu tiên `type = "page"`）
2. Bài viết sắp xếp theo ngày đăng DESC
3. Nếu cùng ngày thì theo `id` DESC

**Lý do đặt trang cố định ở đầu**  
Trang cố định là thông tin cơ bản về tổ chức・tổng quan dịch vụ v.v., nên khi khớp với từ khóa thì việc ưu tiên hiển thị là phù hợp.

---

## 9. Đặc tả UI

### 9-1. Form tìm kiếm

* Khi chuyển đến trang kết quả tìm kiếm, hiển thị giá trị của `q` trong ô nhập liệu
* Nhấn nút tìm kiếm thì chuyển đến `/search/?q=xxx`
* Cũng có thể tìm kiếm bằng cách nhấn phím Enter
* Nhấn nút xóa thì làm trống giá trị đang nhập

### 9-2. Tiêu đề kết quả

* Định dạng hiển thị：`Kết quả tìm kiếm cho "Từ khóa"：XX kết quả`
* Hiển thị từ khóa đã nhập trong tiêu đề
* Hiển thị số lượng kết quả

### 9-3. Danh sách kết quả

Hiển thị các mục sau cho mỗi kết quả.

| Mục hiển thị | Trang cố định | Bài viết |
| ------------ | ------------- | -------- |
| Tiêu đề（link）| Hiển thị | Hiển thị |
| Category | Ẩn（vì `null`）| Hiển thị |
| Ngày đăng | Ẩn（vì `null`）| Hiển thị |
| Description | Hiển thị | Hiển thị |

Nếu 0 kết quả thì hiển thị thông báo không tìm thấy.

### 9-4. Đường dẫn tìm kiếm lại ở đầu trang

* Thường trực form tìm kiếm ở đầu trang kết quả để cho phép tìm kiếm lại

---

## 10. Đặc tả số lượng và phân trang（pagination）

### 10-1. Số lượng hiển thị

* **10 kết quả mỗi trang**
* Thống nhất với số lượng hiển thị của trang danh sách bài viết（10 kết quả）

### 10-2. Phân trang（Pagination）

* Hiển thị `prev / next / link số trang`
* Làm nổi bật trang hiện tại
* Pagination **tái sử dụng component pagination hiện có（`pagination.mtml` / `pagination.css`）**
* Thống nhất markup・CSS・biểu diễn trạng thái với spec component hiện có

**Lưu ý khi triển khai**  
Pagination của danh sách bài viết được kiểm soát ở phía server MT（1 trang = 1 file）.  
Pagination của trang tìm kiếm được **kiểm soát bằng JavaScript（client-side）**.  
Tái sử dụng markup của component hiện có, khi click thì cập nhật tham số `page` và vẽ lại phía JS.

---

## 11. Cấu trúc template・file

### 11-1. File sử dụng / thêm mới

| File | Loại | Vai trò |
| ---- | ---- | ------- |
| `pages/search.mtml` | Mới | Trang kết quả tìm kiếm（MT page）|
| `templates/components/search-form.mtml` | Mới | Component form tìm kiếm |
| `templates/components/pagination.mtml` | Tái sử dụng | Pagination |
| `assets/js/search.js` | Mới | Logic tìm kiếm・kiểm soát UI |
| Template xuất JSON tìm kiếm（bài viết）| Mới | Sinh record bài viết |
| Template xuất JSON tìm kiếm（trang cố định）| Mới | Sinh record trang cố định |

### 11-2. Vai trò triển khai

#### Phía MT

* Xuất JSON tìm kiếm tích hợp bài viết và trang cố định dưới dạng tĩnh
* Bài viết：Áp dụng filter theo điều kiện đăng・`display_target`・`category.slug` để giới hạn đối tượng xuất
* Trang cố định：Xuất tất cả trang đang ở trạng thái đã đăng（tham khảo §4-4）
* Sinh và xuất `search_text`

#### Phía front-end（`search.js`）

* Lấy tham số URL `q` / `page`
* Fetch `/api/search-index.json` chỉ một lần đầu tiên
* Thực hiện normalize từ khóa・phán định AND・đếm số lượng kết quả
* Kiểm soát hiển thị phân trang
* Hiển thị lại từ khóa vào ô nhập liệu

---

## 12. Yêu cầu phi chức năng・Phương hướng thiết kế JSON

### 12-1. Kích thước JSON và tải một lần

* Giữ search index nhẹ nhất có thể
* Không đưa toàn bộ nội dung body・HTML body vào search index
* Với quy mô 200〜300 bài viết, dự kiến khoảng 300〜600KB mỗi file
* **Cơ bản chỉ fetch JSON 1 lần đầu tiên**, cho phép tái sử dụng khi chuyển trang（memory cache）

### 12-2. Cache

* Cho phép cache CDN・browser dưới dạng JSON tĩnh
* Thiết lập header `Cache-Control` có xem xét đến tần suất cập nhật của danh sách bài viết（quyết định chi tiết khi triển khai）

### 12-3. Những gì không xử lý

* Không đưa hình ảnh vào điều kiện tìm kiếm
* Không thực hiện thêm request JSON trong quá trình phân trang（tải toàn bộ một lần）

---

## 13. Ràng buộc triển khai・Chỉ thị

* Tìm kiếm **không phải full-text search**
* Body **chỉ đến văn bản mục lục + tiêu đề H2** là đối tượng tìm kiếm
* Đối tượng tìm kiếm là trang cố định（5 trang như `/about/` v.v.）＋bài viết chi tiết（`/news/`・`/activity-report/`・`/support/`）
* `/supplier/` nằm ngoài phạm vi
* `AZ-COM通信` của `/news/`（`category.slug = azcom-newsletter`）bị loại trừ
* Trang danh sách bài viết（`/news/` v.v.）không được đưa vào search index
* Danh sách kết quả tìm kiếm là **10 kết quả mỗi trang**（thống nhất với trang danh sách）
* Pagination **tái sử dụng component hiện có**
* Form tìm kiếm cũng được tách thành component chung, xây dựng cấu trúc có thể tái sử dụng
* Tone UI tuân theo design guideline hiện có

---

## 14. Vấn đề còn lại・Xem xét trong tương lai

* Nếu trang tag trở nên quá nhiều thì xem xét noindex（tham khảo §11 trong `jp_カテゴリ・タグ・サイドメニュー仕様書.md`）
* Đánh giá lại kích thước JSON・thời gian tải khi số bài viết vượt quá 500
* Khi chuyển sang full-text search trong tương lai, có thể mở rộng dựa trên JSON schema này

---

## 15. Ghi chú về tính nhất quán với tài liệu thiết kế API

* Category có `key / slug / name`, field `category` là single object（không phải array）
* Tag có `key / name`, field `tags` là array
* `search_text` là field chỉ dành cho front-end, độc lập với các field chung trong tài liệu thiết kế API
* Form tìm kiếm trong header không thay đổi implementation hiện có（`azcom-header-toolbar.mtml` / `azcom-header-mobile-footer.mtml`）, tiếp tục sử dụng tham số `q`
