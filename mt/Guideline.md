# Initial actions on MT Server:

## 1. Upload assets folder (FTP)
- Use FTP to upload **assets/** folder → to **`/mt-static/assets/`**
(include files css, js, img, pdf are in **assets/** folder)

## 2. Create Site Renew

### 2.1 MT Admin → Site AZ-COM (Renew) → Design → Templates

#### Home page (Index Templates)

| Index Template | Source Path Github |
| --- | --- |
| `index.mtml` | `/pages/index.mtml` |

#### Head Meta (Module Templates)

| Module template | Source Path Github |
| --- | --- |
| `azcom-head-meta` | `/templates/layout/azcom-head-meta.mtml` |

#### Shared (Module Templates)

| Module template | Source Path Github |
| --- | --- |
| `azcom-shared-legal-privacy` | `/templates/components/shared/azcom-shared-legal-privacy.mtml` |
| `azcom-shared-legal-terms` | `/templates/components/shared/azcom-shared-legal-terms.mtml` |
| `azcom-shared-logo-link` | `/templates/components/shared/azcom-shared-logo-link.mtml` |
| `azcom-shared-member-cta` | `/templates/components/shared/azcom-shared-member-cta.mtml` |

#### Header (Module Templates)

| Module template | Source Path Github |
| --- | --- |
| `azcom-header` | `/templates/layout/azcom-header.mtml` |
| `azcom-header-logo` | `/templates/components/header/azcom-header-logo.mtml` |
| `azcom-header-mobile-footer` | `/templates/components/header/azcom-header-mobile-footer.mtml` |
| `azcom-header-navigation` | `/templates/components/header/azcom-header-navigation.mtml` |
| `azcom-header-toolbar` | `/templates/components/header/azcom-header-toolbar.mtml` |
| `azcom-mega-menu-activity` | `/templates/components/header/azcom-mega-menu-activity.mtml` |
| `azcom-mega-menu-business` | `/templates/components/header/azcom-mega-menu-business.mtml` |
| `azcom-mega-menu-corporate` | `/templates/components/header/azcom-mega-menu-corporate.mtml` |
| `azcom-mega-menu-news` | `/templates/components/header/azcom-mega-menu-news.mtml` |

#### Footer (Module Templates)

| Module template | Source Path Github |
| --- | --- |
| `azcom-footer` | `/templates/layout/azcom-footer.mtml` |
| `azcom-footer-contact` | `/templates/components/footer/azcom-footer-contact.mtml` |
| `azcom-footer-copyright` | `/templates/components/footer/azcom-footer-copyright.mtml` |
| `azcom-footer-logo` | `/templates/components/footer/azcom-footer-logo.mtml` |
| `azcom-footer-nav-group-about` | `/templates/components/footer/azcom-footer-nav-group-about.mtml` |
| `azcom-footer-nav-group-activity` | `/templates/components/footer/azcom-footer-nav-group-activity.mtml` |
| `azcom-footer-nav-group-business` | `/templates/components/footer/azcom-footer-nav-group-business.mtml` |
| `azcom-footer-nav-group-coporate` | `/templates/components/footer/azcom-footer-nav-group-coporate.mtml` |
| `azcom-footer-nav-group-news` | `/templates/components/footer/azcom-footer-nav-group-news.mtml` |
| `azcom-footer-nav-sidebar` | `/templates/components/footer/azcom-footer-nav-sidebar.mtml` |
| `azcom-footer-navigation` | `/templates/components/footer/azcom-footer-navigation.mtml` |


#### FLoating Inquiry (Module Templates)

| Module template | Source Path Github |
| --- | --- |
| `azcom-home-floating-inquiry` | `/templates/components/floating-inquiry/azcom-home-floating-inquiry.mtml` |

#### Go to Top Button (Module Templates)

| Module template | Source Path Github |
| --- | --- |
| `azcom-go-to-top` | `/templates/components/shared/azcom-go-to-top.mtml` |



#### Slider (Content Type)

Name = **Slider**

| Field | Type | Label | Required | Description |
| --- | --- | --- | --- | --- |
| `logo_image` | Asset Image (Hình ảnh) | ロゴ画像 | Yes | |
| `logo_alt` | Single Line Text | 代替テキスト | Yes | |
| `slider_key` | Single Line Text | スライダーキー | Yes | Gợi ý value: top, about, recruit, v.v. |
| `sort_order` | Integer | 表示順 | No (nhưng nên nhập) | Dùng để sort logo theo ý muốn. |

1. Save
2. Create new Slider for Home:
2.1. Access "Assets" => Upload => Enter folder path "logo-partners" => upload images relate logo partners 
2.2. Access "Content data" => Slider => Create new item:  
2.3. Fill in the fields:
2.3.1. `logo_image` = Upload the image of logo partners from step 2.1
2.3.2. `logo_alt` = Enter "Company name (e.g. Company A, Company B, Company C, ...)"
2.3.3. `slider_key` = "top"
2.3.4. `sort_order` = Enter the sort order of the slider (e.g. 1, 2, 3, ...)
2.3.5. Save

#### Slider (Module Templates)

| Module template | Source Path Github |
| --- | --- |
| `azcom-slider-infinity` | `/templates/components/shared/azcom-slider-infinity.mtml` |

---

#### Information — News & Annual schedule (Module Templates)

| Module template | Source Path Github |
| --- | --- |
| `azcom-information-news` | `/templates/components/shared/azcom-information-news.mtml` |
| `azcom-query-news-corporate-latest` | `/templates/components/shared/azcom-query-news-corporate-latest.mtml` |
| `azcom-information-schedule` | `/templates/components/shared/azcom-information-schedule.mtml` |
| `azcom-information-schedule-slot` | `/templates/components/shared/azcom-information-schedule-slot.mtml` |

## 3. Blog「News」(お知らせ) — create in MT Admin (production)

### 3.1 Name convention (must be consistent)

- **Blog name** (Name field in Admin) must be **`News`** (case-sensitive), matching the fixed name in **`azcom-information-news`**.
- The TOP **Index** must be published in the **Website** context that includes this child blog (`include_blogs="children"`).

### 3.2 Create blog & paths

1. **Website AZ-COM** → **Create Blog** (child site) → set **Name** per convention (e.g. `News`).
2. **Settings → General**
   - **Site URL:** `https://<domain>/news/` (trailing `/`).
   - **Site Root:** real **filesystem** path where static files are written (must align with **DocumentRoot** / server mapping — production differs from local; no trailing `/` per MT hint).
   - **Publish archives outside of Site Root:** leave off unless architecture requires it.
3. **Settings → Publishing / General (Archive)**
   - **Preferred Archive:** **Entry** (Individual).
   - **File Extension:** `html`.

### 3.3 Archive mapping (per-entry URL)

1. **Settings → Publishing** (or from the Entry Archive template) → **Archive mapping** for **Entry**.
2. **File template (Custom):** `post_%E/%i`  
   - **Do not** add leading/trailing spaces (avoids *inappropriate whitespace* errors).
   - Output: `.../news/post_<id>/index.html` → public URL `.../news/post_<id>/`.

### 3.4 Entry detail template & (optional) listing

1. **Design → Templates → Create → Entry Archive:** add MTML for the detail page (e.g. `EntryTitle`, `EntryDate`, `EntryBody` inside `<article>`). **Save**.
2. **Tools → Rebuild** the News blog. Create an **Entry** → **Published** → open the permalink to verify.

### 3.5 Setup Custom Field & Category For News Blog

- Custom Field — display_target
   Type: CustomField
   Scope: Entry — Blog「お知らせ」(Name = News)
   Label: Display Target
   Basename: display_target
   Field type: Select List (Single)
   Options (value = label):
   - corporate = コーポレートのみ
   - member = 会員のみ
   - both = 両方
   Default: both
   Required: Yes

- Category — azcom-newsletter
   Name: AZ-COM通信
   Slug / Basename: azcom-newsletter
   Blog: News (/news)
   Description: Articles in this category are completely excluded from the corporate output.
   Verification: Check in Admin → News blog → Categories to see if the slug azcom-newsletter exists.
