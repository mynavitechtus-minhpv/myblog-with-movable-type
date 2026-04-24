# Cloud Deploy Manifest — News List + JSON API

> Single source of truth cho việc deploy lên **MT Cloud**.
> Mọi file dưới đây đều **ngắn gọn, có ý nghĩa cụ thể**, sắp theo **đúng thứ tự thao tác**.

---

## A. Overview kiến trúc

```
                    [ MT Cloud Admin ]
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
  Index Templates    Index Templates       Template Modules
  (HTML pages)       (JSON API output)     (reusable parts)
        │                   │                   │
        └─────── Rebuild ───┴───────────────────┘
                            │
                            ▼
                  Static files in /news/
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
        index.html (shell)       api/*.json (data)
                │                       │
                └───── browser fetch ◄──┘
                            │
                            ▼
                article-list.js + article-sidebar.js
                  (slice + render client-side)
```

**Nguyên tắc**: Server publish HTML shell + JSON; JS fetch JSON, render cards & pagination phía client.

---

## B. Thao tác trên MT Cloud Admin

### B1. Template Modules (cấp **Website**) — tạo TRƯỚC

| # | Module name | Source path | Vai trò |
|---|---|---|---|
| 1 | `azcom-env-config` | `development-dev/templates/components/shared/azcom-env-config.mtml` | Feature flag CF. Cloud cần set `env_has_cf = 1`. |
| 2 | `azcom-site-root-path` | `development-dev/templates/components/global/azcom-site-root-path.mtml` | Trả về `<$mt:BlogRelativeURL$>` cho asset URL. |
| 2b | `azcom-article-cf-entry` | `development-cloud/templates/components/article/azcom-article-cf-entry.mtml` | **Bắt buộc trên cloud.** Đọc 4 CustomField của entry → set `cf_*` variables (`cf_thumbnail_url`, `cf_display_target`, `cf_ranking_enabled`, `cf_meta_description`). Chỉ chạy khi `env_has_cf=1`. |
| 3 | `azcom-json-article-item` | `development-cloud/templates/components/api/azcom-json-article-item.mtml` | Render 1 article thành JSON object (id, title, url, thumbnail, categories[], tags[], date). |
| 4 | `azcom-json-sidebar-categories` | `development-cloud/templates/components/api/azcom-json-sidebar-categories.mtml` | Mảng JSON categories cho sidebar. |
| 5 | `azcom-json-sidebar-tags` | `development-cloud/templates/components/api/azcom-json-sidebar-tags.mtml` | Mảng JSON tags cho sidebar. |
| 6 | `azcom-json-sidebar-ranking` | `development-cloud/templates/components/api/azcom-json-sidebar-ranking.mtml` | Mảng JSON top-N ranking cho sidebar. |
| 7 | `azcom-article-card` | `development-cloud/templates/components/article/azcom-article-card.mtml` | Card MTML server-side (dùng cho pages khác list). |
| 8 | `azcom-article-query-corporate` | `development-cloud/templates/components/article/azcom-article-query-corporate.mtml` | Filter logic: chỉ lấy entries có `cf_display_target = corporate/both/empty`. |
| 9 | `azcom-article-sidebar-ranking` | `development-cloud/templates/components/article/azcom-article-sidebar-ranking.mtml` | Sidebar ranking server-side (legacy, có thể bỏ nếu chỉ dùng JSON). |
| 10 | **`azcom-article-list-shell`** | `development-cloud/templates/components/article/azcom-article-list-shell.mtml` | **NEW** — HTML shell (skeleton + container + error + nav) cho list page. JS điền data. |
| 11 | **`azcom-article-sidebar-shell`** | `development-cloud/templates/components/article/azcom-article-sidebar-shell.mtml` | **NEW** — HTML shell cho sidebar. JS điền data. |

> Module 1, 2, 7-9 là dùng chung dev/cloud nhưng cloud có version riêng cho 7-9 vì dùng CF trực tiếp.

### B2. Index Templates (cấp **Blog: News**) — JSON API

| # | Template name | Source | Output path | Vai trò |
|---|---|---|---|---|
| 12 | `API: News List` | `development-cloud/templates/api/api-news-list.mtml` | `/news/api/news-list.json` | Trả **toàn bộ** filtered articles trong 1 payload. JS slice client-side. |
| 13 | `API: Sidebar` | `development-cloud/templates/api/api-sidebar.mtml` | `/news/api/sidebar.json` | Aggregate ranking + categories + tags. |
| 14 | `API: News Detail` | `development-cloud/templates/api/api-news-detail.mtml` | `/news/api/news-detail/{id}.json` | (Optional, future) chi tiết entry dạng JSON. |
| 15 | `API: News Category` | `development-cloud/templates/api/api-news-category.mtml` | `/news/api/news-category/{slug}.json` | (Optional, future) list theo category. |
| 16 | `API: News Tag` | `development-cloud/templates/api/api-news-tag.mtml` | `/news/api/news-tag/{slug}.json` | (Optional, future) list theo tag. |

### B3. Index Templates (cấp **Blog: News**) — HTML pages

| # | Template name | Source | Output path | Vai trò |
|---|---|---|---|---|
| 17 | `お知らせ一覧` (index) | `development-cloud/blog/news/index.mtml` | `/news/index.html` | Trang list. Include 2 shell modules + load JS. |
| 18 | `お知らせ詳細` (detail) | `development-cloud/blog/news/detail.mtml` | `/news/post_{id}/index.html` | Trang chi tiết bài viết. |
| 19 | `カテゴリ` (category) | `development-cloud/blog/news/category.mtml` | `/news/category/{slug}/index.html` | Trang category. |
| 20 | `タグ` (tag) | `development-cloud/blog/news/tag.mtml` | `/news/tag/{slug}/index.html` | Trang tag. |

### B4. Static assets — upload qua FTP/SSH (không phải Admin)

Đường dẫn server: **`<site-root>/assets/`**

#### CSS (`assets/css/`)
| File | Vai trò |
|---|---|
| `base.css` | Design tokens, CSS variables, reset. |
| `layout.css` | Layout containers (`.l-container`, grid). |
| `utility.css` | Utility classes (gradients, spacing helpers). |
| `header.css` / `footer.css` | Header & footer. |
| `breadcrumb.css` | Breadcrumb. |
| `subpage-hero.css` | Hero section của subpages. |
| `floating-button.css` / `go-to-top.css` | Floating UI. |
| **`skeleton.css`** | **NEW** — Pulse animation cho loading state (skeleton cards + sidebar items). |
| `article-card.css` | Style cho `.c-article-card` — share giữa SSR và CSR. |
| `article-page.css` | Layout `.p-article-list` + error states + outline button. |
| `article-sidebar.css` | Style sidebar (ranking, categories, tags) + error states. |
| `pagination.css` | Style `.c-pagination`. |

#### JavaScript (`assets/js/`)
| File | Vai trò |
|---|---|
| **`api-client.js`** | `MTApiClient` class — auto-detect site root (đọc `<meta name="site-root">`), GET với timeout 10s, retry 2 lần, classify error (`network`/`timeout`/`http`/`parse`). |
| **`article-list.js`** | Generic CSR cho article list. Đọc config từ `data-*` attrs trên `#article-list-container`, fetch endpoint, slice theo `data-page-size`, render cards + pagination. URL state qua `?page=N` + popstate. |
| **`article-sidebar.js`** | Generic CSR cho sidebar. Đọc `data-sidebar-endpoint`, render ranking/categories/tags hoặc skeleton/error. |
| `go-to-top.js` | Scroll to top button. |
| `header.js` / `floating-inquiry.js` / `slider-infinite.js` / `home.js` | Các script đã có sẵn của site. |

---

## C. Setup order (làm đúng thứ tự)

1. **Tạo 4 CustomFields** trên blog News theo `CLOUD-CUSTOMFIELDS-SPEC.md` (`thumbnail`, `display_target`, `ranking_enabled`, `meta_description`).
2. **Upload static assets** (CSS + JS) lên server (`assets/css/skeleton.css`, `assets/js/api-client.js`, `article-list.js`, `article-sidebar.js` là file mới quan trọng nhất).
3. **MT Admin → Website Templates → Template Modules**: tạo 12 module ở mục **B1** theo thứ tự (env-config + site-root-path + cf-entry đầu, sau đó các module phụ thuộc).
4. **MT Admin → Blog: News → Index Templates**: tạo 5 API templates ở **B2** với output path đúng (`api/news-list.json`, `api/sidebar.json`, …).
5. **MT Admin → Blog: News → Index Templates**: tạo / cập nhật 4 HTML templates ở **B3** (index, detail, category, tag).
6. **Rebuild**: blog **News** → "Rebuild → All Files".
6. **Verify**:
   - `<site>/news/api/news-list.json` → có `meta.total` và `articles: [...]` đầy đủ.
   - `<site>/news/api/sidebar.json` → có `ranking`, `categories`, `tags`.
   - `<site>/news/` → render skeleton → 10 cards/page → pagination 2+ trang.
   - Click số trang → URL đổi `?page=N`, scroll smooth lên `#main`.
   - Network tab → JS files load với `?v=…` đúng version, không 404.

---

## D. Reusability cho blog khác (recruit, research, …)

Pattern hoàn toàn dùng lại được. Chỉ cần:
1. Copy `API: News List` → `API: Recruit List`, đổi entries filter logic, xuất ra `api/recruit-list.json`.
2. Trong `recruit/index.mtml` chỉ cần:
   ```mtml
   <mt:SetVar name="article_list_endpoint" value="api/recruit-list.json">
   <mt:SetVar name="article_list_page_size" value="12">
   <mt:SetVarBlock name="article_list_empty_message">求人情報はまだありません。</mt:SetVarBlock>
   <mt:Include module="azcom-article-list-shell">
   ```
3. **Không động** vào JS, CSS, hay shell module.

---

## E. Files có thể XÓA (không còn dùng)

### E1. Docs trung gian (đã consolidate vào spec chính)

```
mt/PAGINATION-FIX-GUIDE.md
mt/PAGINATION-SOLUTION.md
mt/docs/API-CLIENT-GUIDE.md
mt/docs/API-PATH-FIX.md
mt/docs/API-URL-FIX.md
mt/docs/CLIENT-SIDE-RENDERING-SOLUTION.md
mt/docs/QUICK-FIX-META-TAG.md
```

> **Lý do**: Các file này là note ghi lại quá trình debug từng vòng. Spec cuối cùng nằm ở `docs/superpowers/specs/2026-04-14-article-list-pattern.md` và `2026-04-14-json-api-implementation.md`.

### E2. Asset file demo

```
mt/assets/js/api-client-example.js
```

> **Lý do**: Chỉ là code mẫu hướng dẫn dùng `MTApiClient`. Production không reference.

### E3. Published artefacts cũ (regenerate khi rebuild)

```
mt/published/news/api/        ← old path (nếu site mới chỉ dùng /renew/news/)
mt/published/news/post_*/     ← đã được Git rename sang /renew/news/post_*/
```

> **Lý do**: Đường dẫn cũ `published/news/...` đã bị thay bằng `published/renew/news/...` theo cấu trúc URL mới (`/renew/news/`). Nếu xác nhận không còn dùng URL cũ thì xóa luôn cả folder `published/news/`.

> ⚠ Trước khi xóa `published/news/`, nên `git mv` còn lại hoặc verify Apache không serve URL cũ.

### E4. (Optional) Nếu không dùng API news-detail/category/tag

Phase 1 hiện tại chỉ JS dùng `news-list.json` + `sidebar.json`. Các file dưới đây là **chuẩn bị cho Phase 2** (member site fetch detail/category/tag). Nếu chưa cần, có thể **chưa tạo trên MT Admin** (giữ source ở repo để reference):

```
development-dev/templates/api/api-news-detail.mtml
development-dev/templates/api/api-news-category.mtml
development-dev/templates/api/api-news-tag.mtml
development-cloud/templates/api/api-news-detail.mtml
development-cloud/templates/api/api-news-category.mtml
development-cloud/templates/api/api-news-tag.mtml
```

---

## G. Member-site JSON API (Phase 2)

> Bộ API mới phục vụ **member site** (AWS). Không động tới API corporate hiện có.
> **Tất cả 5 endpoint đều sinh ra trong News blog** để base URL thống nhất `/<news-blog-root>/api/...`.
> Cấu trúc endpoint (xem chi tiết ở `API-MEMBER-NEWS.md`):
>
> ```
> /news/api/news.json                 — list
> /news/api/news/post_<id>.json       — detail
> /news/api/news-latest.json          — 5 mới nhất
> /news/api/news-ranking.json         — top 5 ranking
> /news/api/news-sidebar.json         — ranking + categories + tags
> ```
>
> Corporate-site API (`/news/api/news-list.json`, `/news/api/sidebar.json`) tên khác → không đụng.

### G1. CustomFields — đã đủ
Không cần tạo CustomField mới. Dùng lại 4 CF hiện có (`thumbnail`, `display_target`, `ranking_enabled`, `meta_description`).
Logic filter: hiển thị cho member khi `display_target ∈ {member, both}` **hoặc** entry thuộc category `azcom-newsletter`.

### G2. Template Modules (cấp **Website**) — tạo / cập nhật

| # | Module name | Source path | Mới / Sửa | Vai trò |
|---|---|---|---|---|
| M1 | `azcom-member-config` | `development-cloud/templates/components/shared/azcom-member-config.mtml` | **Mới** | Set `news_blog_id` (admin điền ID thật của News blog). Pagination thuộc về client member-site. |
| M2 | `azcom-article-query-member` | `development-cloud/templates/components/api/azcom-article-query-member.mtml` | **Mới** | Đặt flag `is_member_visible` cho entry hiện tại. |
| M3 | `azcom-json-member-article-item` | `development-cloud/templates/components/api/azcom-json-member-article-item.mtml` | **Mới** | JSON shape spec 10: `category` object + `tags:[{key,name}]`. |
| M4 | `azcom-json-sidebar-ranking-entry` | `development-cloud/templates/components/api/azcom-json-sidebar-ranking-entry.mtml` | **Mới** | Sub-module per-entry cho ranking (chia sẻ corporate + member, không duplicate code). |
| M5 | `azcom-json-sidebar-ranking` | `development-cloud/templates/components/api/azcom-json-sidebar-ranking.mtml` | **Sửa** | Thêm param `sidebar_audience` (corporate/member) + `ranking_blog_ids`. Backward-compat: default corporate, blog-scope cũ vẫn hoạt động. |
| M6 | `azcom-json-sidebar-categories` | `development-cloud/templates/components/api/azcom-json-sidebar-categories.mtml` | **Sửa** | Thêm param `include_newsletter` (0/1) + `categories_blog_ids`. |
| M7 | `azcom-json-sidebar-tags` | `development-cloud/templates/components/api/azcom-json-sidebar-tags.mtml` | **Sửa** | Thêm param `tags_blog_ids`. |

> **Lưu ý**: 3 module `Sửa` vẫn 100% backward-compat với flow corporate hiện có — không cần cập nhật `api-sidebar.mtml` / `api-news-list.mtml`.

### G3. Index Templates cấp **Blog: News** — 4 file JSON member

> Các template này đặt trong **News blog** (không phải Website) để URL tương đối `api/...` publish ra dưới root của News blog → thống nhất với detail.

| # | Template name | Source | Output path (relative to News blog root) | Vai trò |
|---|---|---|---|---|
| W1 | `API Member: News List` | `development-cloud/templates/api/api-member-news-list.mtml` | `api/news.json` | Toàn bộ entries member-visible + `meta.total`. Client tự paginate (slice mảng). |
| W2 | `API Member: News Ranking` | `development-cloud/templates/api/api-member-news-ranking.mtml` | `api/news-ranking.json` | Top-5 ranking (include newsletter). |
| W3 | `API Member: News Latest` | `development-cloud/templates/api/api-member-news-latest.mtml` | `api/news-latest.json` | 5 bài mới nhất (fixed). |
| W4 | `API Member: News Sidebar` | `development-cloud/templates/api/api-member-news-sidebar.mtml` | `api/news-sidebar.json` | `{ranking, categories, tags}` (categories giữ newsletter). |

### G4. Archive Template cấp **Blog: News** — 1 file JSON detail

| # | Template name | Source | Archive type | Custom mapping | Vai trò |
|---|---|---|---|---|---|
| B1 | `API Member: News Detail` | `development-cloud/blog/news/api-member-detail.mtml` | **Entry** | `api/news/post_<$mt:EntryID$>.json` | 1 file / entry. Kèm `body_html` + `prev_post` / `next_post` đã filter theo member. |

> **Archive path token**: không dùng `%e` (padded 000123) hay `%i` (basename, fallback về `index.html`) → **dùng MT tag trực tiếp** `post_<$mt:EntryID$>.json` để có filename `post_123.json` đúng như slug trong JSON.
> MT cho phép **nhiều Archive Template cùng Entry archive type**; template này chạy **song song** với HTML detail (`post_<id>/index.html`), không xung đột.

### G5. Setup order — Phase 2 (member site)

1. **Điền `news_blog_id`** trong module `azcom-member-config`: vào MT Admin → News blog → General → copy Blog ID, paste vào module.
2. **Tạo 4 module mới** (M1–M4) + cập nhật 3 module sửa (M5–M7) ở cấp **Website**.
3. **Tạo 4 Index Templates** (W1–W4) ở cấp **Blog: News**, set Output File đúng như bảng G3 (`api/news.json`, `api/news-ranking.json`, `api/news-latest.json`, `api/news-sidebar.json`).
4. **Tạo 1 Archive Template** (B1) ở cấp **Blog: News**:
   - Archive Type: `Entry`.
   - Custom mapping: thêm new mapping với file template `api/news/post_<$mt:EntryID$>.json`.
5. **Rebuild**:
   - News blog → "Rebuild → Indexes only" để sinh 4 file JSON ở `<news>/api/`.
   - News blog → "Rebuild → All" để sinh thêm detail JSON cho từng entry.
6. **Verify** (xem phần G6).

### G6. Verification checklist

```
# List payload
curl <news>/api/news.json | jq '.meta, .articles[0]'
# → meta.total = số entries member-visible. articles[0] có shape spec 10.

# Filter check
curl <news>/api/news.json | jq '[.articles[] | select(.category.slug == "azcom-newsletter")] | length'
# → > 0 (newsletter phải hiển thị cho member)

curl <news>/api/news.json | jq '[.articles[] | {id,display:.__corp_only}] | length'
# → các entry display_target=corporate KHÔNG xuất hiện

# Ranking
curl <news>/api/news-ranking.json | jq '.ranking | length'
# → 1..5

# Latest
curl <news>/api/news-latest.json | jq '.latest | length'
# → 5 (nếu đủ entries member-visible)

# Sidebar
curl <news>/api/news-sidebar.json | jq 'keys'
# → ["categories","ranking","tags"]

# Detail + prev/next
curl <news>/api/news/post_123.json | jq '.prev_post, .next_post'
# → null hoặc object với shape spec 10 (key/name cho category/tags)
```

### G7. Rủi ro đã biết

- **Pagination client-side**: MT static không hiểu `?page=N`. Member team fetch 1 lần `news.json` rồi tự slice mảng `articles` theo page-size do client quyết định (MT không enforce).
- **Scale detail**: mỗi entry = 1 file JSON khi rebuild. 10k entries → 10k files (OK với static hosting, nhưng rebuild time tăng).
- **Entry cap 1000**: template list scan tối đa 1000 entries, phù hợp giai đoạn hiện tại; nếu vượt cần nâng.

---

## F. File parity check (dev ↔ cloud)

Các file MTML dưới đây phải **giống hệt** giữa `development-dev` và `development-cloud`:
- `templates/components/article/azcom-article-list-shell.mtml`
- `templates/components/article/azcom-article-sidebar-shell.mtml`
- `templates/api/api-news-list.mtml` (đã đồng bộ ngày 2026-04-14)
- `templates/api/api-sidebar.mtml`
- `templates/components/api/azcom-json-*.mtml`
- `templates/components/api/azcom-article-query-member.mtml`
- `templates/components/shared/azcom-member-config.mtml`
- `templates/api/api-member-news-*.mtml`
- `blog/news/api-member-detail.mtml`

Các file **khác nhau** giữa dev/cloud (do CF):
- `templates/components/article/azcom-article-card.mtml`
- `templates/components/article/azcom-article-query-corporate.mtml`
- `templates/components/article/azcom-article-sidebar-ranking.mtml`
- `blog/news/*.mtml` (cloud không include `azcom-env-config`)

Verify command:
```bash
diff development-dev/templates/components/article/azcom-article-list-shell.mtml \
     development-cloud/templates/components/article/azcom-article-list-shell.mtml
diff development-dev/templates/api/api-news-list.mtml \
     development-cloud/templates/api/api-news-list.mtml
```
