# Thao tác ban đầu trên MT Server:
1. Tạo ra 4 blogs (Sites -> New)
- Thông báo (/news) => <SiteRoot>/news
- Báo cáo hoạt động (/activity-report) => <SiteRoot>/activity-report
- Menu hỗ trợ (/support) => <SiteRoot>/activity-report
- Giới thiệu nhà cung cấp (/supplier) => <SiteRoot>/activity-report

2. Tạo danh mục cho News
- Tạo một danh mục con (sub-category) => Mở Entries => Categories => Ađ => Label là **AZ-COM通信**, Basename là **azcom-newsletter**

3. Tạo Custom field (PENDING)
- News: 
- Activity Report: 
- Support: 

4. Tạo Template
- MT Admin mở Design => Templates
- Tạo **header.mtml** Trong ```Layout Templates``` => Coppy nội dung của **/templates/layout/header.mtml**
- Tạo **footer.mtml** Trong ```Layout Templates``` => Coppy nội dung của **/templates/layout/footer.mtml**
- Tạo **index.mtml** Trong ```Index Templates``` => Coppy nội dung của **/pages/index.mtml**
- Copy file này **/assets/css/base.css** và upload lên MT Cloud (FTP) => đúng path là /assets/css/base.css


