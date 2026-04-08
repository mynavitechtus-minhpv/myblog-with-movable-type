# Admin setup: Information（お知らせ & 年間スケジュール）

Tài liệu cho [News-and-Schedule.md](News-and-Schedule.md). **Trách nhiệm tách module:**

| Thành phần | Nguồn | CSS |
|------------|--------|-----|
| Shell + H2「インフォメーション」+ `l-container` + block お知らせ (display-only) | [azcom-information-news.mtml](../templates/components/shared/azcom-information-news.mtml) | [information-news.css](../../assets/css/information-news.css) |
| Query engine: lấy news corporate, lọc `azcom-newsletter` + `display_target` | [azcom-query-news-corporate-latest.mtml](../templates/components/shared/azcom-query-news-corporate-latest.mtml) | (không có CSS riêng) |
| 年間スケジュール — `section` + `l-container` + slot | [azcom-information-schedule.mtml](../templates/components/shared/azcom-information-schedule.mtml) + [azcom-information-schedule-slot.mtml](../templates/components/shared/azcom-information-schedule-slot.mtml) | [information-schedule.css](../../assets/css/information-schedule.css) |

Mirror CSS: `development-dev/assets/css/` giữ đồng bộ với `assets/css/`.

## Admin setup required

### 0) Field `display_target` — MT Premium / OSS limitation

> **MT OSS (bản hiện tại) không hỗ trợ CustomFields.**
> Plugin `CustomFields::Field` chỉ có trong **MT Premium / MT Advanced (商用版)**.
>
> **Hành vi hiện tại (MT OSS):**
> Template `azcom-query-news-corporate-latest.mtml` dùng `EntryCustomField basename='display_target'`.
> Vì plugin không được cài, tag trả về chuỗi rỗng → fallback `eq=""` kích hoạt →
> tất cả bài không thuộc `azcom-newsletter` đều được coi là `display_target = both` → hiển thị trên corporate.
> Đây là hành vi an toàn và đúng spec cho phase hiện tại.
>
> **Khi nâng lên MT Premium:**
> 1. Vào Admin → News blog → Custom Fields → tạo field mới:
>    - Label: `表示対象`
>    - Basename: `display_target`
>    - Type: Select List (Single)
>    - Options: `corporate` / `member` / `both` (default: `both`)
> 2. Gán `display_target` cho các bài viết hiện có.
> 3. Rebuild TOP — filter sẽ hoạt động tự động, không cần sửa template.
>
> **Thay thế trong MT OSS (nếu cần filter ngay):**
> Dùng **Tags** làm proxy: gán tag `display-member` cho bài chỉ dành hội viên.
> Cần sửa thêm logic trong `azcom-query-news-corporate-latest.mtml` — trao đổi riêng.

### 1) Blog「お知らせ」(News)

- **Type**: Blog (chuẩn MT)
- **Scope**: Website — blog archive dưới `news/` (hoặc URL tương đương sau static publish)
- **Purpose**: Nguồn `mt:Entries` tối đa 5 bài mới nhất (module **news**)
- **Dependency**: Blog con **Name** = **`News`** (khớp [azcom-information-news.mtml](../templates/components/shared/azcom-information-news.mtml)). [index.mtml](../pages/index.mtml) truyền `information_news_lastn`, `information_news_sort_by`, `information_news_sort_order`, `information_news_show_list_cta` (rỗng = ẩn nút「お知らせ一覧」, `value="1"` = hiện). Link entry +「一覧」cố định trong module: `/news/post_{id}/`, `/news/`.

### 2) URL & biến (News + link từ Schedule)

- **Permalink bài** khớp `news/post_{id}/` (module dùng `href` tĩnh `/news/post_<EntryID>/`).  
- **Danh sách お知らせ:** `/news/` (cố định trong module).

### 3) 年間スケジュール — chỉnh trong template

- **Mục đích**: Mỗi năm là một **slot** — [azcom-information-schedule.mtml](../templates/components/shared/azcom-information-schedule.mtml) chứa 3 block `SetVar` + `Include module="azcom-information-schedule-slot"`.
- **Thêm slot**: copy một block (3× `SetVar` + 1× `Include`) và điền giá trị.
- **Ảnh**: file trong `assets/img/`; `schedule_slot_img` = **tên file**; để trống = placeholder.
- **Link**: **`schedule_slot_href`** = URL đích (vd. `/news/post_123/`). Chưa có trang đích: đặt **`#`**.

**Biến mỗi slot** ([azcom-information-schedule-slot.mtml](../templates/components/shared/azcom-information-schedule-slot.mtml)):

| SetVar | Ý nghĩa |
|--------|---------|
| `schedule_slot_label` | Nhãn hiển thị (vd. `2026年度`) |
| `schedule_slot_img` | Tên file ảnh trong `assets/img/` hoặc rỗng |
| `schedule_slot_href` | URL đích hoặc `#` |

### 4) MTML usage (tham chiếu)

**News** — `index.mtml` → `azcom-information-news` → `azcom-query-news-corporate-latest`:

```mtml
<%-- index.mtml — không đổi --%>
<mt:SetVar name="information_news_lastn" value="5">
<mt:SetVar name="information_news_sort_by" value="authored_on">
<mt:SetVar name="information_news_sort_order" value="descend">
<mt:SetVar name="information_news_show_list_cta" value="1">
<mt:Include module="azcom-information-news">
```

**Điều kiện lọc trong `azcom-query-news-corporate-latest.mtml`** (spec §8.2):
```
status = published (mt:Entries chỉ lấy published entries theo mặc định)
AND (display_target = corporate OR display_target = both OR display_target = "" [fallback])
AND category.basename != azcom-newsletter
```

**Tái sử dụng query module ở template khác:**
```mtml
<mt:SetVar name="news_query_limit" value="3">
<mt:Include module="azcom-query-news-corporate-latest">
```

**Schedule** — một slot trong `azcom-information-schedule.mtml`:

```mtml
<mt:SetVar name="schedule_slot_label" value="2026年度">
<mt:SetVar name="schedule_slot_img" value="">
<mt:SetVar name="schedule_slot_href" value="/news/post_201/">
<mt:Include module="azcom-information-schedule-slot">
```

(Chưa có URL thật: `value="#"`.)

### 5) Setup order

1. Blog お知らせ — **Name** = `News` + permalink; trong `index.mtml` SetVar `information_news_lastn` / `sort_by` / `sort_order` / `information_news_show_list_cta` trước Include news (URL chuẩn trong module).
2. Xác nhận Category `azcom-newsletter` (basename = `azcom-newsletter`) tồn tại trong News blog.
3. (MT Premium only) Tạo Custom Field `display_target` → gán cho bài viết hiện có.
4. Chỉnh `schedule_slot_href` / ảnh / nhãn trong `azcom-information-schedule.mtml`; upload ảnh vào `assets/img/` nếu cần.
5. Rebuild TOP; kiểm tra 5 bài news, empty state, CTA button, blank schedule card.

### 6) Impact and verification

- **Templates**: [index.mtml](../pages/index.mtml) → [azcom-information-news.mtml](../templates/components/shared/azcom-information-news.mtml) (display) → [azcom-query-news-corporate-latest.mtml](../templates/components/shared/azcom-query-news-corporate-latest.mtml) (query).
- **Checklist:**
  - [ ] 5 news hiển thị, sắp xếp descend theo `authored_on`
  - [ ] Bài thuộc category `azcom-newsletter` không xuất hiện
  - [ ] (MT Premium) Bài có `display_target = member` không xuất hiện
  - [ ] Empty state hiển thị khi không có bài nào đủ điều kiện
  - [ ] URL `post_{id}/`; schedule dùng `#` khi chưa có đích; SP/PC ổn
  - [ ] Xóa bài cũ hoặc thay đổi `display_target` → rebuild → kết quả cập nhật đúng
