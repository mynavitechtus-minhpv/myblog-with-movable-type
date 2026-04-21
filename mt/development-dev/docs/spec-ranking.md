# Tài liệu đặc tả chức năng Ranking_20260331:ver_1.1.0

---

## Tóm tắt chỉnh sửa

Ở phiên bản này, các nội dung sau đã được cập nhật:

* Bổ sung điều kiện **section一致 (phải cùng section)** trong điều kiện lấy ranking
* Làm rõ điều kiện **display_target**
* Bổ sung **xử lý ngoại lệ category** vào điều kiện ranking
* Đồng bộ cách xử lý AZ-COM通信 với đặc tả category ngoại lệ
* Làm rõ sự nhất quán với side menu API / category / tag
* Xác định rõ số lượng hiển thị tối đa là 5

---

## 1. Mục đích

Tài liệu này định nghĩa chức năng ranking hiển thị ở side menu bên phải của các trang bài viết trong site AZ-COM.
Ranking này không phải là tự động theo PV mà là **ranking thủ công được chỉ định trong CMS**.

Mục tiêu:

* Tạo luồng dẫn tới các bài viết nổi bật
* Tăng tỷ lệ người dùng duyệt trong site
* Cho phép quản lý bài hiển thị từ CMS

---

## 2. Vị trí hiển thị

Ranking được hiển thị ở side menu bên phải của các trang sau:

**Trang áp dụng**

* Trang danh sách bài viết
* Trang danh sách category
* Trang danh sách tag
* Trang chi tiết bài viết

Thiết kế và vị trí tuân theo Figma.

---

## 3. Nội dung áp dụng

Ranking được hiển thị theo từng section:

* お知らせ（`/news`）
* 活動報告（`/activity-report`）
* 支援メニュー（`/support`）
* サプライヤー紹介（`/supplier`）

### 3.1 Xử lý AZ-COM通信

AZ-COM通信 không phải section riêng mà là child category của `/news`.

```
category.key = cat104
category.slug = azcom-newsletter
```

Do đó, bài viết AZ-COM通信 được **bao gồm trong candidate của ranking section news**.
Tuy nhiên việc hiển thị phụ thuộc vào đặc tả xử lý ngoại lệ category.

---

## 4. Số lượng hiển thị

Số lượng hiển thị ranking là **tối đa 5 bài**.

* Nếu vượt quá 5 → chỉ hiển thị top 5
* Nếu ít hơn 5 → áp dụng rule bổ sung

---

## 5. Thuộc tính quản lý

Ranking được quản lý theo đơn vị bài viết.

### 5.1 ranking_enabled

| Giá trị | Ý nghĩa             |
| ------- | ------------------- |
| `0`     | Không thuộc ranking |
| `1`     | Thuộc ranking       |

---

## 6. Điều kiện cơ bản để lấy ranking

Bài viết thuộc ranking phải thỏa tất cả điều kiện sau:

```
ranking_enabled = 1
AND Trạng thái bài viết = 公開
AND Section trùng khớp
AND Thỏa điều kiện hiển thị
AND Thỏa xử lý ngoại lệ category
```

### 6.1 Section一致

Chỉ lấy bài viết thuộc cùng section với trang hiện tại.

#### Ví dụ

* `/news/` → chỉ hiển thị bài news
* `/support/` → chỉ hiển thị bài support

Không được trộn section khác.

---

## 7. Điều kiện hiển thị (display_target)

| Giá trị     | Nơi hiển thị       |
| ----------- | ------------------ |
| `corporate` | Chỉ site corporate |
| `member`    | Chỉ site hội viên  |
| `both`      | Cả hai             |

### 7.1 Section có display_target

* news
* activity-report
* support

### 7.2 Section không có display_target

* supplier

Supplier là blog chỉ dành cho hội viên → chỉ cần bài public.

---

## 8. Điều kiện hiển thị theo site

### 8.1 Site corporate

```
display_target = corporate
OR display_target = both
```

※ Loại trừ bài thuộc category ngoại lệ

---

### 8.2 Site hội viên

```
display_target = member
OR display_target = both
```

※ Có thể bao gồm thêm bài từ category ngoại lệ

---

## 9. Quan hệ với xử lý ngoại lệ category

Rule quan trọng nhất:

```
category > display_target
```

AZ-COM通信 (`cat104 / azcom-newsletter`) sẽ được xử lý như sau:

| Môi trường     | Hiển thị       |
| -------------- | -------------- |
| Site hội viên  | Hiển thị       |
| Site corporate | Không hiển thị |

### 9.1 Trong ranking news

* Site hội viên → có thể hiển thị AZ-COM通信
* Site corporate → không được hiển thị

---

## 10. API ranking

API ranking được output dạng JSON static theo section:

```
/api/{section}-ranking.json
```

### Ví dụ

* `/api/news-ranking.json`
* `/api/activity-report-ranking.json`
* `/api/support-ranking.json`
* `/api/supplier-ranking.json`

---

## 11. Điều kiện theo từng section

### 11.1 news（site hội viên）

```
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

---

### 11.2 news（site corporate）

```
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

### 11.3 activity-report（site hội viên）

```
ranking_enabled = 1
AND Trạng thái bài viết = 公開
AND section = activity-report
AND
(
  display_target = member
  OR display_target = both
)
```

---

### 11.4 activity-report（site corporate）

```
ranking_enabled = 1
AND Trạng thái bài viết = 公開
AND section = activity-report
AND
(
  display_target = corporate
  OR display_target = both
)
```

---

### 11.5 support（site hội viên）

```
ranking_enabled = 1
AND Trạng thái bài viết = 公開
AND section = support
AND
(
  display_target = member
  OR display_target = both
)
```

---

### 11.6 support（site corporate）

```
ranking_enabled = 1
AND Trạng thái bài viết = 公開
AND section = support
AND
(
  display_target = corporate
  OR display_target = both
)
```

---

### 11.7 supplier

```
ranking_enabled = 1
AND Trạng thái bài viết = 公開
AND section = supplier
```

---

## 12. Thứ tự hiển thị

1. Bài có `ranking_enabled = 1`
2. Sắp xếp theo ngày publish DESC
3. Nếu trùng thời gian → `post_id` DESC
4. Chỉ lấy tối đa 5 bài

※ Không sử dụng `ranking_order`

---

## 13. Rule bổ sung (fallback)

Nếu ít hơn 5 bài:

### 13.1 Điều kiện bổ sung

```
ranking_enabled = 0
AND Trạng thái bài viết = 公開
AND Section一致
AND Thỏa điều kiện hiển thị
AND Thỏa xử lý ngoại lệ category
```

### 13.2 Thứ tự hiển thị

1. Bài ranking_enabled = 1
2. Bài bổ sung

### 13.3 Rule quan trọng

Ngay cả khi bổ sung:

* Phải giữ section一致
* Phải áp dụng display_target
* Phải áp dụng category ngoại lệ

→ Không được hiển thị sai AZ-COM通信

---

## 14. Khi có ≥ 6 bài ranking

* Sắp xếp theo publish DESC
* Chỉ hiển thị top 5
* Bỏ các bài từ thứ 6 trở đi

---

## 15. Đồng bộ với side menu

Ranking là một phần của side menu:

* Ranking
* Category
* Tag

Phải đảm bảo đồng bộ với:

* Category spec
* Tag spec
* Side menu spec
* API spec
* Category exception spec

Đặc biệt với news:

→ Rule hiển thị AZ-COM通信 phải一致 ở toàn bộ:

* List
* Detail
* Sidebar
* Ranking

---

## 16. Case giả định

### Case 1

```
A：news / corporate / ranking_enabled=1
B：news / member / ranking_enabled=1
C：news / both / ranking_enabled=1
```

**Corporate**

```
A
C
(+ bổ sung)
```

**Member**

```
B
C
(+ bổ sung)
```

---

### Case 2

```
D：news / azcom-newsletter / corporate / ranking_enabled=1
```

**Kết quả**

```
Member：Hiển thị
Corporate：Không hiển thị
```

---

### Case 3

```
E：support / both / ranking_enabled=1
F：activity-report / both / ranking_enabled=1
Current：/support/
```

**Kết quả**

```
Chỉ hiển thị E
F bị loại vì khác section
```

---

## 17. MT管理画面

Nên có thể kiểm tra các thông tin sau trong danh sách bài viết:

* Ranking対象
* Title
* Status
* Author
* Category
* Publish date

Nếu khó implement → có thể bỏ qua.

---

## 18. Rule vận hành

Cần kiểm tra:

* ranking_enabled
* Trạng thái publish
* display_target
* Section đúng
* Category AZ-COM通信
* Kết quả hiển thị trên từng site

---

## 19. Điều kiện triển khai

* Điều khiển bằng MT template
* Output JSON static
* Không dùng PHP

---

## 20. Phương châm thiết kế

Ưu tiên:

* Đơn giản trong CMS
* Đồng bộ với category spec
* Đồng bộ với side menu
* Tránh sai lệch implement
* Phù hợp MT static

Không sử dụng:

* Ranking riêng theo site
* ranking_order
* Điều chỉnh bằng PHP

---

## 21. Mở rộng tương lai

Không nằm trong phạm vi hiện tại:

* PV ranking
* Weekly ranking
* Monthly ranking
* Auto ranking
