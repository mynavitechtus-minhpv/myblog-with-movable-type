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