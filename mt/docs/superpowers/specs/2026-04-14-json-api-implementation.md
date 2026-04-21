# JSON API Implementation Specification

**Date**: 2026-04-14  
**Status**: Draft  
**Author**: AI Assistant  
**Approach**: Hybrid (Phase 1 Only - JSON API Generation)

---

## 1. Overview

### 1.1 Purpose

Generate static JSON API endpoints from Movable Type content to enable:
- **Reuse**: Member sites (NextJS/React) consume same data as Corporate site
- **Performance**: JSON files cached, faster Member site data fetching
- **Maintenance**: Centralized content filtering logic

### 1.2 Scope

**In Scope**:
- Create MT Index/Archive Templates to generate static JSON files
- JSON endpoints for: news list, category/tag archives, article detail, sidebar
- Support pagination (`?page`, `?limit` parameters)
- CustomFields compatibility (local dev bypass, Cloud direct)

**Out of Scope** (This Phase):
- HTML template refactoring (Corporate site HTML remains MTML-based)
- Client-side JavaScript rendering
- Custom MT Perl plugins for JSON parsing in MTML

### 1.3 Architecture

```
┌─────────────────────────────────────────────────────┐
│              MT Content Database                     │
│         (Entries, Categories, Tags, CFs)            │
└───────────────┬─────────────────────────────────────┘
                │
                │ Publish Event
                ▼
    ┌───────────────────────────────┐
    │   JSON API Templates          │
    │   (MT Index/Archive Templates)│
    │                               │
    │  - api-news-list.mtml         │
    │  - api-news-category.mtml     │
    │  - api-news-tag.mtml          │
    │  - api-news-detail.mtml       │
    │  - api-sidebar.mtml           │
    └──────────┬────────────────────┘
               │
               │ Generate Static Files
               ▼
    ┌──────────────────────────────┐
    │   Static JSON Files          │
    │   /api/*.json                │
    │                              │
    │  - news-list.json            │
    │  - news-category-{slug}.json │
    │  - news-tag-{id}.json        │
    │  - news-detail-{id}.json     │
    │  - sidebar.json              │
    └──────────┬───────────────────┘
               │
               │ HTTP GET
               ▼
    ┌─────────────────────────────┐
    │   Member Sites              │
    │   (NextJS/React/Vue)        │
    │   - Fetch JSON              │
    │   - Render UI               │
    └─────────────────────────────┘
```

**Note**: Corporate site HTML templates remain unchanged (existing MTML logic).

---

## 2. JSON API Endpoints

### 2.1 Endpoint List

| Endpoint | HTTP Method | Template Type | Purpose | Pagination |
|----------|-------------|---------------|---------|------------|
| `/api/news-list.json` | GET | Index Template | All news articles | ✅ Yes |
| `/api/news-category-{slug}.json` | GET | Archive Template (Category) | Category-filtered articles | ✅ Yes |
| `/api/news-tag-{id}.json` | GET | Archive Template (Tag) | Tag-filtered articles | ✅ Yes |
| `/api/news-detail-{id}.json` | GET | Archive Template (Entry) | Single article detail | ❌ No |
| `/api/sidebar.json` | GET | Index Template | Sidebar data (ranking, categories, tags) | ❌ No |

### 2.2 Query Parameters

**List endpoints** (`news-list`, `news-category-*`, `news-tag-*`):
- `page` (integer, default: `1`) - Page number
- `limit` (integer, default: `10`, max: `50`) - Items per page

**Examples**:
- `/api/news-list.json` → Page 1, 10 items
- `/api/news-list.json?page=2` → Page 2, 10 items
- `/api/news-list.json?page=1&limit=20` → Page 1, 20 items
- `/api/news-category-security.json?page=3&limit=15` → Security category, page 3, 15 items

**Implementation Note**: MT Archive Templates cannot read URL query parameters directly. Pagination will be handled by generating separate JSON files per page:
- `/api/news-list.json` → Page 1 (default, no suffix)
- `/api/news-list-page-2.json` → Page 2
- `/api/news-list-page-3.json` → Page 3

Alternatively, implement a thin server-side proxy (Node.js/Perl CGI) to parse `?page` and serve correct JSON file.

---

## 3. JSON Response Schemas

### 3.1 List Response Schema

**Endpoint**: `/api/news-list.json`, `/api/news-category-{slug}.json`, `/api/news-tag-{id}.json`

```json
{
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "total_pages": 5,
    "has_prev": false,
    "has_next": true,
    "prev_url": null,
    "next_url": "/api/news-list-page-2.json"
  },
  "articles": [
    {
      "id": 8,
      "title": "記事タイトル",
      "slug": "post_8",
      "url": "/news/post_8/",
      "thumbnail": "/assets/images/news/thumb.jpg",
      "categories": [
        {
          "id": 3,
          "label": "セキュリティ",
          "slug": "security",
          "url": "/news/security/"
        }
      ],
      "date": "2026.04.14",
      "datetime": "2026-04-14T10:30:00+09:00",
      "excerpt": "記事の概要テキスト...",
      "tags": ["タグA", "タグB"]
    }
  ]
}
```

**Field Descriptions**:

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `meta.total` | integer | Count query | Total matching entries |
| `meta.page` | integer | Template var | Current page number |
| `meta.limit` | integer | Template var | Items per page |
| `meta.total_pages` | integer | Calculated | `ceil(total / limit)` |
| `meta.has_prev` | boolean | Calculated | `page > 1` |
| `meta.has_next` | boolean | Calculated | `page < total_pages` |
| `meta.prev_url` | string\|null | Calculated | Previous page JSON URL |
| `meta.next_url` | string\|null | Calculated | Next page JSON URL |
| `articles[].id` | integer | `<$mt:EntryID$>` | Entry ID |
| `articles[].title` | string | `<$mt:EntryTitle$>` | Entry title |
| `articles[].slug` | string | `post_<$mt:EntryID$>` | URL slug |
| `articles[].url` | string | `/news/post_<$mt:EntryID$>/` | Absolute URL path |
| `articles[].thumbnail` | string | `cf_thumbnail_url` CustomField | Thumbnail image URL |
| `articles[].category.id` | integer | `<$mt:CategoryID$>` | Primary category ID |
| `articles[].category.label` | string | `<$mt:CategoryLabel$>` | Category display name |
| `articles[].category.slug` | string | `<$mt:CategoryBasename$>` | Category basename |
| `articles[].category.url` | string | `/news/<$mt:CategoryBasename$>/` | Category archive URL |
| `articles[].date` | string | `<$mt:EntryDate format="%Y.%m.%d"$>` | Display date (YYYY.MM.DD) |
| `articles[].datetime` | string | `<$mt:EntryDate format_name="iso8601"$>` | ISO 8601 datetime |
| `articles[].excerpt` | string | `<$mt:EntryExcerpt$>` | Entry excerpt/summary |
| `articles[].tags` | array[string] | `<mt:EntryTags><$mt:TagName$></mt:EntryTags>` | Tag names |

**Filtering Rules** (same as existing `azcom-article-query-corporate`):
- Exclude entries with `display_target` CustomField != `corporate` (Cloud only)
- Exclude entries from `azcom-newsletter` category (basename check)
- Sort by `authored_on` descending

---

### 3.2 Detail Response Schema

**Endpoint**: `/api/news-detail-{id}.json`

```json
{
  "article": {
    "id": 8,
    "title": "記事タイトル",
    "slug": "post_8",
    "url": "/news/post_8/",
    "thumbnail": "/assets/images/news/thumb.jpg",
    "category": {
      "id": 3,
      "label": "セキュリティ",
      "slug": "security",
      "url": "/news/security/"
    },
    "date": "2026.04.14",
    "datetime": "2026-04-14T10:30:00+09:00",
    "excerpt": "記事の概要テキスト...",
    "body_html": "<div class=\"mt-content\"><p>記事本文HTML...</p></div>",
    "tags": ["タグA", "タグB"],
    "meta": {
      "description": "SEO meta description text",
      "published_at": "2026-04-14T10:30:00+09:00",
      "updated_at": "2026-04-14T15:20:00+09:00"
    }
  }
}
```

**Additional Fields** (vs. list schema):

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `article.body_html` | string | `<$mt:EntryBody$>` | Full article HTML content |
| `article.meta.description` | string | `cf_meta_description` CustomField | SEO meta description |
| `article.meta.published_at` | string | `<$mt:EntryDate format_name="iso8601"$>` | Original publish datetime |
| `article.meta.updated_at` | string | `<$mt:EntryModifiedDate format_name="iso8601"$>` | Last modified datetime |

---

### 3.3 Sidebar Response Schema

**Endpoint**: `/api/sidebar.json`

```json
{
  "ranking": [
    {
      "rank": 1,
      "id": 5,
      "title": "ランキング記事タイトル",
      "url": "/news/post_5/",
      "thumbnail": "/assets/images/news/rank1.jpg",
      "date": "2026.04.10",
      "datetime": "2026-04-10T09:00:00+09:00"
    }
  ],
  "categories": [
    {
      "id": 3,
      "label": "セキュリティ",
      "slug": "security",
      "url": "/news/security/",
      "count": 15
    }
  ],
  "tags": [
    {
      "id": 2,
      "name": "タグA",
      "url": "/news/tags_2/",
      "count": 8
    }
  ]
}
```

**Field Descriptions**:

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `ranking[].rank` | integer | Loop counter | Rank position (1-5) |
| `ranking[].id` | integer | `<$mt:EntryID$>` | Entry ID |
| `ranking[].title` | string | `<$mt:EntryTitle$>` | Entry title |
| `ranking[].url` | string | `/news/post_<$mt:EntryID$>/` | Article URL |
| `ranking[].thumbnail` | string | `cf_thumbnail_url` CustomField | Thumbnail URL |
| `ranking[].date` | string | `<$mt:EntryDate format="%Y.%m.%d"$>` | Display date |
| `ranking[].datetime` | string | `<$mt:EntryDate format_name="iso8601"$>` | ISO datetime |
| `categories[].id` | integer | `<$mt:CategoryID$>` | Category ID |
| `categories[].label` | string | `<$mt:CategoryLabel$>` | Category name |
| `categories[].slug` | string | `<$mt:CategoryBasename$>` | Category basename |
| `categories[].url` | string | `/news/<$mt:CategoryBasename$>/` | Category URL |
| `categories[].count` | integer | `<$mt:CategoryCount$>` | Entry count in category |
| `tags[].id` | integer | `<$mt:TagID$>` | Tag ID |
| `tags[].name` | string | `<$mt:TagName$>` | Tag name |
| `tags[].url` | string | `/news/tags_<$mt:TagID$>/` | Tag archive URL |
| `tags[].count` | integer | `<$mt:TagCount$>` | Entry count for tag |

**Data Rules**:
- **Ranking**: Max 5 items, filtered by `cf_ranking_enabled` CustomField = `1`, sorted by `authored_on` descending (same as `azcom-article-sidebar-ranking`)
- **Categories**: Only child categories (exclude parent "News" category), exclude "azcom-newsletter" category (same as `azcom-article-sidebar`)
- **Tags**: All tags used by published entries, sorted by count descending

---

## 4. MT Admin Setup

### 4.1 Template Structure

All JSON templates will be created in both environments:
- `development-dev/templates/api/` (local, CF bypass logic)
- `development-cloud/templates/api/` (Cloud, direct CF tags)

**Template List**:

| Template Name | Type | Output File | Archive Mapping |
|---------------|------|-------------|-----------------|
| `API: News List` | Index Template | `/api/news-list.json` | N/A |
| `API: News Category` | Archive Template (Category) | `/api/news-category-<$mt:CategoryBasename$>.json` | Category Archive |
| `API: News Tag` | Archive Template (Tag) | `/api/news-tag-<$mt:TagID$>.json` | Tag Archive |
| `API: News Detail` | Archive Template (Entry) | `/api/news-detail-<$mt:EntryID$>.json` | Entry Archive |
| `API: Sidebar` | Index Template | `/api/sidebar.json` | N/A |

### 4.2 Template Modules

**New Modules**:
- `azcom-json-meta` - Generate JSON `meta` object (pagination)
- `azcom-json-article-item` - Generate single article JSON object
- `azcom-json-sidebar-ranking` - Generate ranking JSON array
- `azcom-json-sidebar-categories` - Generate categories JSON array
- `azcom-json-sidebar-tags` - Generate tags JSON array

**Reused Modules**:
- `azcom-env-config` - Environment detection (`env_has_cf`)
- `azcom-article-cf-entry` - CustomFields proxy (Cloud mode)

### 4.3 Archive Mapping Configuration

**Category Archive** (`API: News Category`):
- **Archive Type**: Category
- **Archive Path**: `api/news-category-<$mt:CategoryBasename$>.json`
- **Publish Type**: Static

**Tag Archive** (`API: News Tag`):
- **Archive Type**: Tag
- **Archive Path**: `api/news-tag-<$mt:TagID$>.json`
- **Publish Type**: Static

**Entry Archive** (`API: News Detail`):
- **Archive Type**: Entry
- **Archive Path**: `api/news-detail-<$mt:EntryID$>.json`
- **Publish Type**: Static

---

## 5. Implementation Details

### 5.1 JSON Encoding

**Challenge**: MTML does not have native JSON encoding. Manual escaping required.

**Solution**: Create `azcom-json-escape` module for common escaping:

```mtml
<!-- azcom-json-escape.mtml -->
<mt:SetVarBlock name="json_escaped"><mt:Var name="input_text" strip_linefeeds="1" encode_json="1"></mt:SetVarBlock>
```

**MT Built-in JSON Encoding**:
- `encode_json="1"` modifier: Escapes `"`, `\`, control characters
- `strip_linefeeds="1"` modifier: Removes `\n`, `\r`

**Example**:
```mtml
"title": "<$mt:EntryTitle encode_json="1"$>"
```

### 5.2 Pagination Logic

**Problem**: MT Archive Templates generate per-category/tag, not per-page.

**Solution**: Use `<mt:PagerBlock>` for multi-page generation.

**Example** (`api-news-list.mtml`):
```mtml
<mt:SetVar name="limit" value="10">
<mt:SetVar name="total" value="<$mt:EntryCount$>">

<mt:PagerBlock>
  <mt:SetVar name="page" value="<$mt:Var name="__pager_current_page__"$>">
  
  {
    "meta": {
      "total": <$mt:Var name="total"$>,
      "page": <$mt:Var name="page"$>,
      "limit": <$mt:Var name="limit"$>,
      "total_pages": <$mt:Var name="__pager_total_pages__"$>,
      "has_prev": <mt:IfPreviousResults>true<mt:Else>false</mt:IfPreviousResults>,
      "has_next": <mt:IfMoreResults>true<mt:Else>false</mt:IfMoreResults>,
      "prev_url": <mt:IfPreviousResults>"<$mt:PreviousLink$>"<mt:Else>null</mt:IfPreviousResults>,
      "next_url": <mt:IfMoreResults>"<$mt:NextLink$>"<mt:Else>null</mt:IfMoreResults>
    },
    "articles": [
      <mt:Entries limit="<$mt:Var name="limit"$>" offset="<$mt:Var name="__pager_offset__"$>">
        {
          "id": <$mt:EntryID$>,
          "title": "<$mt:EntryTitle encode_json="1"$>",
          ...
        }<mt:Unless name="__last__">,</mt:Unless>
      </mt:Entries>
    ]
  }
</mt:PagerBlock>
```

**Output Files**:
- `/api/news-list.json` (page 1)
- `/api/news-list/page/2.json` (page 2)
- `/api/news-list/page/3.json` (page 3)

**URL Structure**: MT generates paginated archives automatically via `<mt:PagerBlock>`.

### 5.3 CustomFields Compatibility

**Local Dev** (`development-dev/`):
```mtml
<!-- Include env config -->
<mt:Include module="azcom-env-config">

<!-- Set defaults -->
<mt:SetVar name="cf_thumbnail_url" value="">
<mt:SetVar name="cf_display_target" value="corporate">
<mt:SetVar name="cf_ranking_enabled" value="0">

<!-- Load CF values if available -->
<mt:If name="env_has_cf" eq="1">
  <mt:Include module="azcom-article-cf-entry">
</mt:If>

<!-- Use variables -->
"thumbnail": "<$mt:Var name="cf_thumbnail_url" encode_json="1"$>"
```

**Cloud** (`development-cloud/`):
```mtml
<!-- Direct CF tags -->
"thumbnail": "<$mt:EntryCustomField basename="thumbnail" encode_json="1"$>"
```

### 5.4 Filtering Logic

**Reuse existing filter logic from `azcom-article-query-corporate`**:

```mtml
<mt:Entries lastn="300" sort_by="authored_on" sort_order="descend">
  <!-- CF variables -->
  <mt:SetVar name="cf_display_target" value="">
  <mt:SetVar name="cf_thumbnail_url" value="">
  
  <mt:If name="env_has_cf" eq="1">
    <mt:Include module="azcom-article-cf-entry">
  </mt:If>
  
  <!-- Filter: display_target (Cloud only) -->
  <mt:If name="env_has_cf" eq="1">
    <mt:If name="cf_display_target" ne="corporate">
      <mt:Continue>
    </mt:If>
  </mt:If>
  
  <!-- Filter: exclude azcom-newsletter category -->
  <mt:SetVar name="is_newsletter" value="0">
  <mt:EntryCategories>
    <mt:If name="__first__">
      <mt:SetVar name="cat_basename" value="<$mt:CategoryBasename$>">
      <mt:If name="cat_basename" eq="azcom-newsletter">
        <mt:SetVar name="is_newsletter" value="1">
      </mt:If>
    </mt:If>
  </mt:EntryCategories>
  
  <mt:If name="is_newsletter" eq="1">
    <mt:Continue>
  </mt:If>
  
  <!-- Output article JSON -->
  {
    "id": <$mt:EntryID$>,
    ...
  }<mt:Unless name="__last__">,</mt:Unless>
</mt:Entries>
```

---

## 6. File Structure

### 6.1 Development-Dev (Local)

```
development-dev/
├── templates/
│   └── api/
│       ├── api-news-list.mtml          # Index Template
│       ├── api-news-category.mtml      # Category Archive
│       ├── api-news-tag.mtml           # Tag Archive
│       ├── api-news-detail.mtml        # Entry Archive
│       └── api-sidebar.mtml            # Index Template
├── templates/components/
│   └── api/
│       ├── azcom-json-meta.mtml        # Meta object generator
│       ├── azcom-json-article-item.mtml # Article JSON object
│       ├── azcom-json-sidebar-ranking.mtml
│       ├── azcom-json-sidebar-categories.mtml
│       └── azcom-json-sidebar-tags.mtml
```

### 6.2 Development-Cloud (Cloud MT)

```
development-cloud/
├── templates/
│   └── api/
│       ├── api-news-list.mtml          # Direct CF tags
│       ├── api-news-category.mtml
│       ├── api-news-tag.mtml
│       ├── api-news-detail.mtml
│       └── api-sidebar.mtml
├── templates/components/
│   └── api/
│       └── (same modules, CF-specific versions)
```

### 6.3 Output Structure

```
/api/
├── news-list.json                      # All news, page 1
├── news-list/
│   ├── page/
│   │   ├── 2.json                      # Page 2
│   │   └── 3.json                      # Page 3
├── news-category-security.json         # Security category, page 1
├── news-category-security/
│   └── page/
│       └── 2.json
├── news-tag-2.json                     # Tag ID 2, page 1
├── news-detail-8.json                  # Entry ID 8 detail
├── news-detail-9.json                  # Entry ID 9 detail
└── sidebar.json                        # Global sidebar data
```

---

## 7. Testing & Validation

### 7.1 JSON Schema Validation

**Tools**:
- Online: [JSONLint](https://jsonlint.com/), [JSON Schema Validator](https://www.jsonschemavalidator.net/)
- CLI: `jq` (validate syntax)

**Test Command**:
```bash
# Validate JSON syntax
curl http://localhost:8082/api/news-list.json | jq .

# Check field types
curl http://localhost:8082/api/news-list.json | jq '.articles[0].id | type'  # Should be "number"
curl http://localhost:8082/api/news-list.json | jq '.articles[0].title | type'  # Should be "string"
```

### 7.2 Functional Tests

**Test Cases**:

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| API-001 | Access `/api/news-list.json` | 200 OK, valid JSON, 10 items (default) |
| API-002 | Access `/api/news-list/page/2.json` | 200 OK, page 2 items |
| API-003 | Access `/api/news-category-security.json` | 200 OK, only security category entries |
| API-004 | Access `/api/news-tag-2.json` | 200 OK, only entries with tag ID 2 |
| API-005 | Access `/api/news-detail-8.json` | 200 OK, entry 8 detail with `body_html` |
| API-006 | Access `/api/sidebar.json` | 200 OK, ranking (max 5), categories, tags |
| API-007 | Verify `meta.total_pages` calculation | `ceil(total / limit)` |
| API-008 | Verify `meta.has_next` when on last page | `false` |
| API-009 | Verify `cf_display_target != "corporate"` excluded (Cloud only) | No non-corporate entries |
| API-010 | Verify `azcom-newsletter` category excluded | No newsletter entries |
| API-011 | Verify JSON encoding (title with `"` chars) | Escaped as `\"` |
| API-012 | Verify empty thumbnail fallback | `thumbnail: ""` when CF missing |

### 7.3 Performance Tests

**Metrics**:
- Build time for 100 entries: < 30 seconds
- JSON file size: < 100KB per page (10 items)
- HTTP response time: < 50ms (static file)

**Test Command**:
```bash
# Measure file size
ls -lh /path/to/api/news-list.json

# Measure response time
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8082/api/news-list.json
```

---

## 8. Deployment

### 8.1 Local Development

1. Create templates in `development-dev/templates/api/`
2. Upload templates to MT Admin → Design → Templates
3. Set template type (Index / Archive)
4. Configure Archive Mapping (Category/Tag/Entry archives)
5. Rebuild: "Design" → "Publish" → "Publish Selected Templates"
6. Verify output: `http://localhost:8082/api/*.json`

### 8.2 Cloud Deployment

1. Create templates in `development-cloud/templates/api/`
2. Upload to Cloud MT Admin
3. Configure Archive Mapping (same as local)
4. Rebuild: Publish all templates
5. Verify output: `https://{domain}/api/*.json`
6. Test from Member site: `fetch('https://{domain}/api/news-list.json')`

### 8.3 Rebuild Strategy

**When to Rebuild JSON**:
- New entry published
- Entry updated (title, content, CF, category, tags)
- Category/Tag renamed/deleted
- Ranking order changes (CF `ranking_enabled` updated)

**Rebuild Order**:
1. Entry Archive (`api-news-detail-*.json`) - individual entry JSON
2. Category/Tag Archives (`api-news-category-*.json`, `api-news-tag-*.json`) - filtered lists
3. Index Templates (`api-news-list.json`, `api-sidebar.json`) - global lists
4. HTML templates (unchanged, but rebuild if needed)

**Automation**: Configure MT Admin → Settings → Publishing → "Rebuild automatically when new entry published"

---

## 9. Maintenance

### 9.1 Adding New Fields

**Example**: Add `author` field to article JSON.

1. Update JSON schema (Section 3.1):
   ```json
   "author": {
     "id": 1,
     "name": "山田太郎",
     "email": "yamada@example.com"
   }
   ```

2. Update `azcom-json-article-item.mtml`:
   ```mtml
   "author": {
     "id": <$mt:EntryAuthorID$>,
     "name": "<$mt:EntryAuthorDisplayName encode_json="1"$>",
     "email": "<$mt:EntryAuthorEmail encode_json="1"$>"
   }
   ```

3. Rebuild JSON templates
4. Update Member site API client

### 9.2 Changing Pagination Limit

**Default**: 10 items per page  
**Max**: 50 items per page (prevent large JSON files)

To change default:
1. Edit `azcom-json-meta.mtml`
2. Update `<mt:SetVar name="limit" value="20">` (change to desired default)
3. Rebuild templates

### 9.3 Troubleshooting

**Issue**: JSON syntax error (missing comma, unclosed bracket)  
**Solution**: Use `jq` to validate:
```bash
curl http://localhost:8082/api/news-list.json | jq .
# Error: parse error: Expected separator between values at line X
```

**Issue**: Empty `articles` array  
**Solution**: Check filter logic (display_target, newsletter category exclusion)

**Issue**: Missing thumbnail URL  
**Solution**: Verify CustomField `thumbnail` exists and has value

**Issue**: Pagination links broken  
**Solution**: Verify `<mt:PagerBlock>` generates correct page structure

---

## 10. Future Enhancements (Out of Scope)

### 10.1 Phase 2: HTML Template Refactoring

- Refactor Corporate site HTML templates to fetch JSON API
- Requires custom MT plugin for JSON parsing in MTML
- Enables single-source-of-truth for content logic

### 10.2 Dynamic Query Parameter Support

- Implement server-side proxy (Node.js/Perl CGI) to parse `?page=X&limit=Y`
- Map query params to static JSON files
- Enable REST-like API behavior

### 10.3 Real-time API

- Replace static JSON generation with Perl CGI endpoints
- Query MT database on-demand (no rebuild required)
- Trade-off: Performance vs. freshness

---

## 11. Success Criteria

**Phase 1 Complete When**:
- ✅ All 5 JSON endpoints generate valid JSON
- ✅ Pagination works (page 1, 2, 3... files generated)
- ✅ Filtering logic matches existing MTML (display_target, newsletter exclusion)
- ✅ CustomFields compatibility (local dev + Cloud)
- ✅ Member site can fetch and render JSON successfully
- ✅ Build time < 30s for 100 entries
- ✅ JSON syntax validated (jq passes)
- ✅ Test cases API-001 to API-012 pass

**Acceptance Test**:
1. Member site developer fetches `/api/news-list.json`
2. Renders 10 articles with correct data (title, thumbnail, category, date)
3. Navigates to page 2 via `meta.next_url`
4. Fetches category JSON (`/api/news-category-security.json`)
5. Renders filtered articles
6. Clicks article → fetches detail JSON (`/api/news-detail-8.json`)
7. Renders full article with `body_html`

---

## 12. References

- Existing Spec: `docs/superpowers/specs/2026-04-14-news-listing-design.md`
- Existing Spec: `docs/superpowers/specs/spec-ranking.md`
- Existing Spec: `development-dev/docs/spec-categoy.md`
- Design Guideline: `_docs/vn_デザインガイドライン (4).md`
- MT Documentation: [Movable Type Template Tags](https://www.movabletype.org/documentation/appendices/tags/)
- JSON Encoding: [RFC 8259](https://tools.ietf.org/html/rfc8259)

---

## 13. Appendix

### 13.1 Example: Full Article JSON Item

```json
{
  "id": 8,
  "title": "新しいセキュリティ対策について",
  "slug": "post_8",
  "url": "/news/post_8/",
  "thumbnail": "/assets/images/news/security-2026.jpg",
  "category": {
    "id": 3,
    "label": "セキュリティ",
    "slug": "security",
    "url": "/news/security/"
  },
  "date": "2026.04.14",
  "datetime": "2026-04-14T10:30:00+09:00",
  "excerpt": "最新のセキュリティ脅威に対応するための新しい対策を導入しました。",
  "tags": ["セキュリティ", "アップデート", "お知らせ"]
}
```

### 13.2 Example: Full Sidebar JSON

```json
{
  "ranking": [
    {
      "rank": 1,
      "id": 12,
      "title": "2026年度の新サービスリリース",
      "url": "/news/post_12/",
      "thumbnail": "/assets/images/news/service-2026.jpg",
      "date": "2026.04.01",
      "datetime": "2026-04-01T09:00:00+09:00"
    },
    {
      "rank": 2,
      "id": 10,
      "title": "クラウドサービスの料金改定について",
      "url": "/news/post_10/",
      "thumbnail": "/assets/images/news/pricing.jpg",
      "date": "2026.03.25",
      "datetime": "2026-03-25T14:00:00+09:00"
    }
  ],
  "categories": [
    {
      "id": 3,
      "label": "セキュリティ",
      "slug": "security",
      "url": "/news/security/",
      "count": 15
    },
    {
      "id": 4,
      "label": "プロダクト",
      "slug": "product",
      "url": "/news/product/",
      "count": 23
    }
  ],
  "tags": [
    {
      "id": 2,
      "name": "アップデート",
      "url": "/news/tags_2/",
      "count": 18
    },
    {
      "id": 5,
      "name": "お知らせ",
      "url": "/news/tags_5/",
      "count": 32
    }
  ]
}
```

---

**Document Version**: 1.0  
**Last Updated**: 2026-04-14  
**Next Review**: After Phase 1 implementation
