# Cloud CustomFields Spec — News Blog

> 4 CustomFields cần tạo trên MT Cloud cho blog **News**.
> Tất cả System Object = `article` (entry).
> Tạo theo đúng `Base name` để khớp với MTML hiện tại.

---

## Admin setup required

### 1) `thumbnail` (image)
- Type: `CustomField`
- Scope: Blog **News** (hoặc Website nếu muốn dùng chung)
- Purpose: Ảnh đại diện hiển thị trong card list page, sidebar ranking, JSON API.
- Dependency: `azcom-article-card`, `azcom-article-sidebar-ranking`, `azcom-json-article-item`, `azcom-json-sidebar-ranking`, `azcom-article-cf-entry`.

#### Field schema
- `thumbnail`
  - **System Object**: `article`
  - **Name**: `thumbnail`
  - **Description**: 一覧・ランキング・APIで使用するサムネイル画像
  - **Kinds**: `image`
  - **Required**: no
  - **Base name**: `thumbnail` ⚠ phải đúng tên này
  - **Template tags** (auto): `EntryDataThumbnail`
  - **Default**: (none)

#### MTML usage
```mtml
<$mt:EntryDataThumbnail asset_url="1"$>
```
> Phải có `asset_url="1"` để trả về URL string. Mặc định không có sẽ trả về HTML `<img>` tag → **không dùng được như URL**.

---

### 2) `display_target` (radio button)
- Type: `CustomField`
- Scope: Blog **News**
- Purpose: Quyết định bài viết hiển thị ở site nào (corporate / member / cả hai). Trống = backward compatible (hiện ở mọi nơi).
- Dependency: `azcom-article-query-corporate`, `azcom-article-sidebar-ranking`, `azcom-json-article-item`, `api-news-list`.

#### Field schema
- `display_target`
  - **System Object**: `article`
  - **Name**: `display_target`
  - **Description**: 表示対象サイト（コーポレート／会員／両方）
  - **Kinds**: `radio button`
  - **Required**: no
  - **Base name**: `display_target` ⚠ phải đúng tên này
  - **Template tags** (auto): `EntryDataDisplayTarget`
  - **Options** (mỗi dòng 1 option):
    ```
    corporate
    member
    both
    ```
  - **Default**: (để trống — bài cũ vẫn hiện)

#### MTML usage
```mtml
<mt:If name="cf_display_target" eq="corporate">…</mt:If>
<mt:If name="cf_display_target" eq="both">…</mt:If>
<mt:If name="cf_display_target" eq="">…</mt:If>  {# backward-compat: empty = show #}
```

---

### 3) `ranking_enabled` (checkbox)
- Type: `CustomField`
- Scope: Blog **News**
- Purpose: Đánh dấu bài để đưa vào sidebar ranking (top 5). Phase 1: chỉ ranking thủ công, không tính tự động.
- Dependency: `azcom-article-sidebar-ranking`, `azcom-json-sidebar-ranking`.

#### Field schema
- `ranking_enabled`
  - **System Object**: `article`
  - **Name**: `ranking_enabled`
  - **Description**: ランキング枠に表示（最大5件、新しい順）
  - **Kinds**: `checkbox`
  - **Required**: no
  - **Base name**: `ranking_enabled` ⚠ phải đúng tên này
  - **Template tags** (auto): `EntryDataRankingEnabled`
  - **Default**: unchecked
  - **Notes**: Khi checked, MT trả về `"1"`. Khi unchecked, trả về `""`.

#### MTML usage
```mtml
<mt:If name="cf_ranking_enabled" eq="1">
  {# include in ranking phase 1 #}
</mt:If>
```

---

### 4) `meta_description` (textarea)
- Type: `CustomField`
- Scope: Blog **News**
- Purpose: Override SEO meta description cho trang detail. Nếu để trống, fallback về `EntryExcerpt`.
- Dependency: `blog/news/detail.mtml`.

#### Field schema
- `meta_description`
  - **System Object**: `article`
  - **Name**: `meta_description`
  - **Description**: SEO用メタディスクリプション（空の場合は本文抜粋を使用）
  - **Kinds**: `textarea`
  - **Required**: no
  - **Base name**: `meta_description` ⚠ phải đúng tên này
  - **Template tags** (auto): `EntryDataMetaDescription`
  - **Default**: (none)
  - **Validation**: khuyến nghị 120–160 ký tự cho SEO.

#### MTML usage
```mtml
<mt:SetVarBlock name="meta_description">
  <mt:If tag="EntryDataMetaDescription" ne="">
    <$mt:EntryDataMetaDescription encode_html="1"$>
  <mt:Else>
    <$mt:EntryExcerpt remove_html="1" encode_html="1"$>
  </mt:If>
</mt:SetVarBlock>
```

---

## Setup order

1. **Bật CustomFields plugin** trên cloud (kiểm tra menu trái có "Custom Fields").
2. Vào **News blog → Custom Fields → New**.
3. Tạo lần lượt 4 CF theo đúng `Base name` ghi trên (đặt sai tên = MTML không đọc được → render rỗng).
4. **Tạo Template Module `azcom-article-cf-entry`** (Website level) — paste body từ:
   ```
   development-cloud/templates/components/article/azcom-article-cf-entry.mtml
   ```
5. Vào **`azcom-env-config`** module → đảm bảo set `env_has_cf = 1` cho cloud.
6. **Rebuild** blog News → kiểm tra:
   - `<site>/news/api/news-list.json` → `articles[i].thumbnail` là URL hợp lệ (không phải `<img...>`).
   - `<site>/news/api/sidebar.json` → `ranking[i].thumbnail` là URL hợp lệ.
   - `<site>/news/` → cards có ảnh thumbnail hiển thị đúng.

---

## Impact and verification

### Affected templates
- `azcom-article-cf-entry` (proxy module)
- `azcom-article-card`, `azcom-article-sidebar-ranking` (server-side render)
- `azcom-json-article-item`, `azcom-json-sidebar-ranking` (JSON output)
- `azcom-article-query-corporate` (filter logic)
- `blog/news/detail.mtml` (SEO meta)

### Backward compatibility
- Bài viết cũ chưa set CF → tất cả `cf_*` variables = `""`.
- `cf_display_target = ""` → bài VẪN hiện (xem condition `<mt:If name="cf_display_target" eq="">` trong query-corporate).
- `cf_ranking_enabled = ""` → bài KHÔNG vào ranking (chỉ "1" mới include).
- `cf_thumbnail_url = ""` → card hiện placeholder thay vì ảnh.
- `cf_meta_description = ""` → fallback về `EntryExcerpt`.

### Verification checklist
- [ ] 4 CF hiện ra trong Entry editor (kéo xuống dưới Title/Body).
- [ ] Save 1 entry với cả 4 field set → JSON API trả đúng giá trị.
- [ ] Bài cũ (chưa set CF) vẫn hiện trong `news-list.json` với `thumbnail: ""`.
- [ ] Bài có `display_target = member` KHÔNG xuất hiện trong corporate list.
- [ ] Bài có `ranking_enabled = checked` xuất hiện ở `sidebar.json` `ranking[]`.
- [ ] Detail page có `<meta name="description">` lấy từ CF nếu set, fallback excerpt nếu trống.

---

## Common pitfalls

| Sai lầm | Hậu quả | Fix |
|---|---|---|
| Đặt **Base name** khác (vd. `Thumbnail`, `display-target`) | MTML đọc rỗng, ảnh và filter đều fail | Đổi đúng snake_case như spec |
| `thumbnail` kind = `image` mà MTML dùng `<$mt:EntryCustomField basename="thumbnail">` | Output `<img src=...>` HTML thay vì URL → src attribute lồng nhau, broken | Dùng `<$mt:EntryDataThumbnail asset_url="1"$>` (đã fix trong cloud MTML) |
| `display_target` kind = `text` thay vì `radio button` | User typo dễ → filter sai | Dùng radio button + 3 option chuẩn |
| Quên tạo `azcom-article-cf-entry` module | Tất cả `cf_*` variable = "" → mọi bài hiện như nhau, không filter, không ranking | Tạo module trên Website (cấp cao hơn để các blog dùng chung) |
| `env_has_cf = 0` trên cloud | Module `azcom-article-cf-entry` không bao giờ được include → CF bị bypass | Set `env_has_cf = 1` trong `azcom-env-config` cloud version |
