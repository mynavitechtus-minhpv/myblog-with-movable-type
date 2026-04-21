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

## F. File parity check (dev ↔ cloud)

Các file MTML dưới đây phải **giống hệt** giữa `development-dev` và `development-cloud`:
- `templates/components/article/azcom-article-list-shell.mtml`
- `templates/components/article/azcom-article-sidebar-shell.mtml`
- `templates/api/api-news-list.mtml` (đã đồng bộ ngày 2026-04-14)
- `templates/api/api-sidebar.mtml`
- `templates/components/api/azcom-json-*.mtml`

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
