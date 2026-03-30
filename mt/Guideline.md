# Thao tác ban đầu trên MT Server:
## 1. Tạo ra 4 blogs (Sites -> New)
- Thông báo (/news) => <SiteRoot>/news
- Báo cáo hoạt động (/activity-report) => <SiteRoot>/activity-report
- Menu hỗ trợ (/support) => <SiteRoot>/activity-report
- Giới thiệu nhà cung cấp (/supplier) => <SiteRoot>/activity-report

## 2. Tạo danh mục cho News
- Tạo một danh mục con (sub-category) => Mở Entries => Categories => Add => Label là **AZ-COM通信**, Basename là **azcom-newsletter**

## 3. Tạo Custom field (PENDING)
- News: 
- Activity Report: 
- Support: 

## 4. 
4.1 Upload folder **assets/img** => MT Cloud (FTP) => đúng path là **.mt-static/assets/img**

4.2 Upload folder **assets/pdf** => MT Cloud (FTP) => đúng path là **.mt-static/assets/pdf**

## 5. Tạo Template

### MT Admin → Site AZ-COM (Renew) → Design → Templates

- Tạo **index.mtml** trong **Index Templates** → copy nội dung **`/pages/index.mtml`**
- Upload CSS/JS: **`assets/css/base.css`**, **`layout.css`**, **`utility.css`**, **`header.css`** (và **`footer.css`** khi bật footer) lên MT Cloud → path **`/mt-static/assets/css/`**
- Upload **`assets/js/header.js`** → **`/mt-static/assets/js/header.js`**

### MT Admin → System → Design → Templates (Global)

#### Head (meta — được `index.mtml` include)

- **`azcom-head-meta`** → **`/templates/layout/azcom-head-meta.mtml`**

#### Header (tiền tố `azcom-`)

- **`azcom-header`** (module chính) → **`/templates/layout/azcom-header.mtml`**
- **`azcom-header-logo`** → **`/templates/components/header/azcom-header-logo.mtml`**
- **`azcom-header-navigation`**（`<nav>` + 6件の `<li>` + mega Include） → **`/templates/components/header/azcom-header-navigation.mtml`**
- **`header-navigation`**（レガシー名） → **`/templates/components/header/header-navigation.mtml`**（中身は `<mt:Include module="azcom-header-navigation">` のみ）
- **`azcom-mega-menu-corporate`** → **`/templates/components/header/azcom-mega-menu-corporate.mtml`**
- **`azcom-mega-menu-business`** → **`/templates/components/header/azcom-mega-menu-business.mtml`**
- **`azcom-mega-menu-news`** → **`/templates/components/header/azcom-mega-menu-news.mtml`**
- **`azcom-mega-menu-activity`** → **`/templates/components/header/azcom-mega-menu-activity.mtml`**
- **`azcom-header-mobile-footer`** → **`/templates/components/header/azcom-header-mobile-footer.mtml`**
- **`azcom-header-toolbar`** → **`/templates/components/header/azcom-header-toolbar.mtml`**

#### Footer (tiền tố `azcom-`)

- **`azcom-footer`** (module chính) → **`/templates/layout/azcom-footer.mtml`**
- **`azcom-footer-contact`** → **`/templates/components/footer/azcom-footer-contact.mtml`**
- **`azcom-footer-logo`** → **`/templates/components/footer/azcom-footer-logo.mtml`**
- **`azcom-footer-navigation`** → **`/templates/components/footer/azcom-footer-navigation.mtml`**
- **`azcom-footer-copyright`** → **`/templates/components/footer/azcom-footer-copyright.mtml`**
