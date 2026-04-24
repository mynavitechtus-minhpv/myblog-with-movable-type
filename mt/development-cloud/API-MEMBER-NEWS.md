# Member-site News API

Shape **MT Data API v1 compatible** — member-site Laravel có thể swap URL 1 dòng, dùng được ngay field `items`/`totalResults`/`body`/`createdDate`/`categories` giống như gọi thẳng `mt-data-api.cgi`.

All endpoints are served as static JSON files under the **News blog** on MT Cloud.

---

## 0. Why static JSON, not MT Data API?

Member-site hiện có (`az-com-platform-imp`) đã dùng MT Data API v1 native cho blog 9/11. Các endpoint bên dưới **chỉ cần thiết khi**:

- Cần pre-computed **ranking top-5** (MT Data API không expose CustomField `ranking_enabled`).
- Cần **display_target filter** (corporate/member/both) của CustomField — MT Data API v1 không filter CF được.
- Cần "newsletter always-show" logic (category `azcom-newsletter` luôn hiện với member).

→ Static JSON encapsulate 3 rule này trong MTML, member chỉ việc fetch.

Nếu không cần 3 rule trên → gọi thẳng `/mt-data-api.cgi/v1/sites/{id}/entries` như NotifyService hiện tại.

---

## 1. `GET /news/api/news.json` — Full member-visible list

Member-visible = `display_target ∈ {member, both}` **OR** entry thuộc category `azcom-newsletter`.

### Response

```json
{
  "totalResults": 42,
  "items": [
    {
      "id": 123,
      "title": "ITEM タイトル",
      "basename": "post_123",
      "permalink": "https://www.azcom-net.jp/news/post_123/",
      "createdDate": "2026-04-14T10:30:00+09:00",
      "categories": ["AZ-COM通信", "重要なお知らせ"],
      "tags": ["Tags1", "Tags2"],
      "blog": { "id": 2 },
      "thumbnail": "https://.../thumb.jpg",
      "excerpt": "summary ≤ 150 chars..."
    }
  ]
}
```

### Field reference

| Field | Type | Notes |
|---|---|---|
| `totalResults` | number | Total member-visible entries (full count, pre-pagination) |
| `items[]` | array | All member-visible items, newest first |
| `items[].id` | number | MT EntryID |
| `items[].title` | string | |
| `items[].basename` | string | `post_<id>` |
| `items[].permalink` | string | Absolute URL to detail page on MT-configured Blog URL |
| `items[].createdDate` | string | ISO 8601 with timezone |
| `items[].categories` | string[] | Array of category **label strings** |
| `items[].tags` | string[] | Array of tag **name strings** |
| `items[].blog.id` | number | Parent blog ID |
| `items[].thumbnail` | string | CustomField `thumbnail` URL, `""` when missing |
| `items[].excerpt` | string | MT-generated excerpt |

`body` is **not** included in list payload; fetch `/news/api/news/post_{id}.json` for full HTML body.

### Pagination

MT static cannot interpret `?page=N`. Member-site slices `items` client-side:

```ts
const PER_PAGE = 10;
const { items } = await fetch('/news/api/news.json').then(r => r.json());
const page = 3;
const pageItems = items.slice((page - 1) * PER_PAGE, page * PER_PAGE);
```

### Laravel consumption (drop-in)

```php
// app/Services/MtService.php
public function getMemberNewsList()
{
    return Http::get(config('services.mt.base').'/news/api/news.json')->json();
    // → identical shape to Http::get("...mt-data-api.cgi/v1/sites/{id}/entries")
}
```

Vue/Blade `NoticeItem.vue` / `notice-item-top.blade.php` **reuse as-is** —
`item.id`, `item.title`, `item.createdDate`, `item.categories[0]`, `item.blog.id`
are all present.

---

## 2. `GET /news/api/news/post_{id}.json` — Detail + prev/next

- `{id}` là `EntryID` (number). Ex: `/news/api/news/post_123.json`.
- Prev/next navigation honours the **member-visible filter** (unlike MT's native
  EntryPrevious/EntryNext which ignore CustomField filters).

### Response

```json
{
  "id": 123,
  "title": "...",
  "basename": "post_123",
  "permalink": "...",
  "createdDate": "...",
  "categories": ["..."],
  "tags": ["..."],
  "blog": { "id": 2 },
  "thumbnail": "...",
  "excerpt": "...",
  "body": "<p>full HTML body, JSON-escaped...</p>",

  "prev_post": {
    "id": 120, "title": "...", "permalink": "...", "createdDate": "...",
    "categories": [], "tags": [], "blog": {"id":2}, "thumbnail": "", "excerpt": "..."
  },
  "next_post": null
}
```

`prev_post` / `next_post` shape = list item shape (no `body` to keep payload small), or `null` if no neighbour.

### Laravel consumption

```php
public function getMemberNewsDetail($id)
{
    return Http::get(config('services.mt.base')."/news/api/news/post_{$id}.json")->json();
}
```

Notice body HTML rewriting (image proxy, `<a>` stripping) currently in `NotifyService::getNotifyById()` still applies.

---

## 3. `GET /news/api/news-latest.json` — 5 newest

```json
{
  "items": [ /* up to 5 items, same shape as #1 */ ]
}
```

- Always ≤ 5 entries.
- Shape identical to `items[]` in `/news/api/news.json`.

---

## 4. `GET /news/api/news-ranking.json` — Top 5 ranking

```json
{
  "ranking": [
    {
      "rank": 1,
      "id": 123, "title": "...", "basename": "post_123",
      "permalink": "...", "createdDate": "...",
      "categories": ["..."], "tags": ["..."],
      "blog": {"id": 2}, "thumbnail": "...", "excerpt": "..."
    }
  ]
}
```

Rule:

1. Phase 1 (pin): các entry có CustomField `ranking_enabled=1`, member-visible, sort by `authored_on desc`, tối đa 5.
2. Phase 2 (fill): còn slot → fill bằng entry member-visible mới nhất (không trùng phase 1).

→ Nếu cần metadata đầy đủ của ranked item → lookup bằng `id` trong `news.json` (đã cache).

---

## 5. `GET /news/api/news-sidebar.json` — Sidebar aggregate

```json
{
  "ranking": [ /* same as /news-ranking.json */ ],
  "categories": [
    { "id": 5, "label": "AZ-COM通信", "slug": "azcom-newsletter",
      "url": "/azcom-newsletter/", "count": 12 }
  ],
  "tags": [
    { "id": 15, "name": "Tags1", "url": "tags_15", "count": 3 }
  ]
}
```

- `categories[]` + `tags[]` là **filter menu data** (khác shape với `items[].categories`
  which is plain label strings). Giữ slug/url cho member-site build link filter.
- `ranking[]` identical với `/news-ranking.json` (1 request là đủ cho full sidebar).
- `count` là số entry thuộc category/tag **trên toàn blog**, chưa apply member filter.
  Nếu cần số member-visible chính xác → filter client-side từ `news.json`.

---

## 6. Laravel integration pattern (recommend)

Member-site Laravel chỉ cần thêm 1 service bọc MT endpoints:

```php
// app/Services/MtCorporateNewsService.php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class MtCorporateNewsService
{
    private string $base;

    public function __construct()
    {
        $this->base = config('services.mt.base'); // https://azcom-net-hbus.movabletype.biz
    }

    public function list(): array
    {
        return Cache::remember('mt-corp-news-list', 300, function () {
            return Http::timeout(5)->get("{$this->base}/news/api/news.json")->json();
        });
    }

    public function detail(int $id): array
    {
        return Cache::remember("mt-corp-news-$id", 300, function () use ($id) {
            return Http::timeout(5)->get("{$this->base}/news/api/news/post_{$id}.json")->json();
        });
    }

    public function sidebar(): array
    {
        return Cache::remember('mt-corp-news-sidebar', 300, function () {
            return Http::timeout(5)->get("{$this->base}/news/api/news-sidebar.json")->json();
        });
    }
}
```

Shape identical với `NotifyService::getNotifyList()` → Vue components reuse được thẳng. Chỉ khác:

- Source blog cố định là corporate News (blog 2), không pass `site_id`
- Đã pre-filtered `display_target` + `ranking_enabled` + newsletter rule

---

## 7. Update frequency & cache

- File sinh ra khi:
  - Thêm / sửa / xoá entry trong News blog
  - Admin thao tác Rebuild index template
- Member-site cache layer (Laravel Cache) 5 phút là đủ — có fallback rebuild lag.
- **Recommend**: query string versioning `?v={timestamp}` khi publish admin bump asset version, invalidate cache.

---

## 8. Error handling

Endpoint là static file → không có dynamic error code.

| Scenario | HTTP | Action |
|---|---|---|
| File tồn tại | 200 | Parse JSON |
| File chưa generate | 404 | MT admin chưa rebuild; fallback rỗng + log |
| MT Cloud down | Timeout/network | Laravel cache fallback; hoặc show stale |
| Malformed JSON | 200 + parse fail | Critical MT bug — alert admin |

Laravel retry:

```php
$result = retry(2, fn () => Http::timeout(5)->get($url)->json(), 500);
```

---

## 9. CORS (cross-origin)

Static JSON trả về bởi MT Cloud Apache. Nếu member-site browser fetch trực tiếp
(không qua Laravel backend) → cần MT Cloud emit `Access-Control-Allow-Origin`.

**Khuyến nghị**: Laravel backend làm proxy (pattern hiện tại của `NotifyService`) — không phát sinh CORS vì server-to-server.

---

## 10. Integration checklist

- [ ] MT Admin: tạo 4 Index Templates + 1 Archive Template ở News blog (xem `CLOUD-DEPLOY-MANIFEST.md` phần G3 / G4)
- [ ] MT Admin: điền `news_blog_id` thực tế vào module `azcom-member-config`
- [ ] MT Admin: rebuild News blog → verify 5 JSON file tạo ra ở `/news/api/`
- [ ] Member-site: tạo `App\Services\MtCorporateNewsService` (pattern mục #6)
- [ ] Member-site: cache 5 phút, timeout 5s, retry 2 lần
- [ ] Member-site: fallback (empty state) khi MT down
- [ ] QA: verify filter rule (member-visible, ranking, newsletter) đúng spec
