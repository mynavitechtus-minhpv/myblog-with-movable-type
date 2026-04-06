# Admin setup: Information（お知らせ & 年間スケジュール）

Tài liệu cho [News-and-Schedule.md](News-and-Schedule.md). **Trách nhiệm tách module:**

| Thành phần | Nguồn | CSS |
|------------|--------|-----|
| Shell + H2「インフォメーション」+ `l-container` + block お知らせ | [azcom-information-news.mtml](../templates/components/shared/azcom-information-news.mtml) (`section.c-information--news`) | [information-news.css](../../assets/css/information-news.css) |
| 年間スケジュール — `section` + `l-container` + slot | [azcom-information-schedule.mtml](../templates/components/shared/azcom-information-schedule.mtml) + [azcom-information-schedule-slot.mtml](../templates/components/shared/azcom-information-schedule-slot.mtml) | [information-schedule.css](../../assets/css/information-schedule.css) |

Mirror CSS: `development-dev/assets/css/` giữ đồng bộ với `assets/css/`.

## Admin setup required

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

**News** — `azcom-information-news.mtml` (blog name cố định `News`; limit/sort từ index):

```mtml
<mt:SetVar name="information_news_lastn" value="5">
<mt:SetVar name="information_news_sort_by" value="authored_on">
<mt:SetVar name="information_news_sort_order" value="descend">
<mt:SetVar name="information_news_show_list_cta" value="1">
<mt:Include module="azcom-information-news">
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
2. Chỉnh `schedule_slot_href` / ảnh / nhãn trong `azcom-information-schedule.mtml`; upload ảnh vào `assets/img/` nếu cần.
3. Rebuild TOP; kiểm tra empty / blank card.

### 6) Impact and verification

- **Templates**: [index.mtml](../pages/index.mtml) — SetVar + `Include` news + schedule + `information-news.css` / `information-schedule.css`; mỗi module tự bọc `section` / `l-container` tương ứng.
- **Checklist:** 5 news; URL `post_{id}/`; schedule dùng `#` khi chưa có đích; SP/PC ổn.
