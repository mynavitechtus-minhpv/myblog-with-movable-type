# Tài liệu hướng dẫn triển khai: Section Information (News & Annual Schedule)

1. Tổng quan
Triển khai 2 block hiển thị trong phần "Information" của Trang chủ. Việc triển khai cần cân nhắc đến số lượng hiển thị, nguồn lấy dữ liệu, URL chuyển trang, xử lý khi chưa có dữ liệu và khả năng bảo trì/cập nhật trong tương lai.

Thông báo (News)
Lịch trình năm (Annual Schedule)
2. Tiền đề triển khai
Triển khai dựa trên việc tích hợp với Movable Type (MT).
Thống nhất đặt tên class với tiền tố c-.
Breakpoint (SP/PC):
SP: 0 〜 767px
PC: 768px 〜
Quản lý CSS theo từng component, tập trung vào file component.css.
Nghiêm cấm sử dụng Inline CSS.
3. Cấu trúc Section
Các block trong Section Information trên Trang chủ được sắp xếp theo thứ tự:

Tiêu đề Section: インフォメーション (Information)
Thông báo (News)
Lịch trình năm (Annual Schedule)
4. Đặc tả triển khai: Thông báo (News)
4.1 Đối tượng lấy dữ liệu
Lấy các bài viết được tạo trong Blog "Thông báo" (News) trên trang quản trị MT.
Directory: news/
Chỉ lấy các bài viết ở trạng thái Public.
4.2 Số lượng hiển thị
Hiển thị tối đa 5 bài viết mới nhất.
Nếu ít hơn 5 bài, chỉ hiển thị số lượng hiện có.
Đảm bảo layout không bị vỡ ngay cả khi có 0 bài viết.
4.3 Thứ tự sắp xếp
Giảm dần theo ngày xuất bản (Mới nhất lên đầu).
4.4 Các hạng mục hiển thị
Ngày xuất bản.
Tiêu đề bài viết.
Link dẫn đến trang chi tiết.
4.5 URL chuyển trang
URL trang chi tiết thống nhất theo cấu trúc: news/post_{id}/
(Trong đó {id} là ID bài viết trong MT. Bắt buộc có dấu gạch chéo / ở cuối).

5. Đặc tả triển khai: Lịch trình năm (Annual Schedule)
5.1 Phương châm cơ bản
Mỗi lịch trình năm được xử lý theo cụm: 1 bài viết + 1 hình ảnh. Đây không phải là dạng lấy bài viết tự động đơn thuần như News, mà cần triển khai theo cấu trúc có thể quản lý và thay thế riêng biệt cho khung hiển thị trên Trang chủ.

5.2 Đối tượng hiển thị ban đầu (3 mục)
Sử dụng hình ảnh lưu trữ trên Google Drive:

Năm 2026: Link Drive → URL: news/post_{id}/
Năm 2025: Link Drive → URL: news/post_{id}/
Năm 2024: Link Drive → URL: news/post_{id}/
5.3 Nội dung hiển thị
Hình ảnh tương ứng với năm.
Nhãn (Label) hoặc Tiêu đề năm.
Link đến trang chi tiết.
5.4 URL chuyển trang
Thống nhất: news/post_{id}/

5.5 Trường hợp chưa có bài viết
Nếu bài viết tương ứng chưa được tạo, hiển thị thẻ trống (Empty Card) không thể click.

Duy trì diện mạo của khung thẻ.
Không đặt liên kết (href), không dùng dummy URL.
Không làm vỡ layout.
6. Vận hành cập nhật hàng năm
Lịch trình năm sẽ được cập nhật hàng năm. Ví dụ khi thêm bài viết năm 2027:

Trước: 2026, 2025, 2024.
Sau: 2027, 2026, 2025 (Xóa hoặc ẩn thông tin năm 2024).
Quan trọng: Vì ảnh và URL bài viết đi theo bộ, việc cập nhật nội dung trên Trang chủ sẽ được thực hiện thủ công (Manual Update) mỗi khi chuyển giao năm.
7. Lưu ý khi triển khai Lịch trình năm
Không triển khai theo logic tự động lấy 3 bài mới nhất từ thư mục news/.

Lý do: Hình ảnh và bài viết cần quản lý theo bộ; Nhãn năm cần hiển thị cố định; Cần kiểm soát việc hiển thị thẻ trống dễ dàng hơn.
Phương án khuyến nghị
Phương án A: Thiết lập 3 slot riêng biệt cho Trang chủ (VD: schedule_slot_1: Năm, Ảnh, ID bài viết).
Phương án B: Cố định 3 slot trong template và cho phép thiết lập Năm/Ảnh/Link riêng cho từng slot.
Ưu tiên cấu trúc mà người vận hành không biết code cũng có thể thay thế dễ dàng.
8. Cấu trúc HTML khuyến nghị
<section class="c-information">
  <div class="c-information__inner">
    <h2 class="c-information__title">インフォメーション</h2>
    
    <section class="c-information__news">
      <h3 class="c-information__heading">お知らせ</h3>
      <ul class="c-news-list">
        <li class="c-news-list__item">
          <a class="c-news-list__link" href="/news/post_123/">
            <time class="c-news-list__date">2025.12.16</time>
            <span class="c-news-list__text">Tiêu đề bài viết</span>
            <span class="c-news-list__icon">→</span>
          </a>
        </li>
      </ul>
      <a class="c-button c-button--primary" href="/news/">Xem tất cả</a>
    </section>

    <section class="c-information__schedule">
      <h3 class="c-information__heading">年間スケジュール</h3>
      <div class="c-schedule-list">
        <a class="c-schedule-card" href="/news/post_201/">
          <img class="c-schedule-card__image" src="..." alt="2026">
          <span class="c-schedule-card__label">Năm 2026</span>
        </a>
        <div class="c-schedule-card c-schedule-card--blank" aria-disabled="true">
          <span class="c-schedule-card__label">Năm 2024</span>
        </div>
      </div>
    </section>
  </div>
</section>
9. Tóm tắt quy tắc thực hiện*
Thông báo
Nguồn lấy là blog "Thông báo" trên màn hình quản lý MT
Thư mục là news/
Chỉ áp dụng cho bài viết đã được công khai
Hiển thị 5 bài gần nhất
• Đường dẫn chuyển tiếp là news/post_{id}/
Lịch trình hàng năm
Sẽ bắt đầu với 3 khung: 2026 / 2025 / 2024
Mỗi khung là một bộ "hình ảnh + năm + URL bài viết"
• Đường dẫn chuyển tiếp là news/post_{id}/
• Khi bài viết chưa được tạo, sẽ hiển thị thẻ trống không thể nhấp
• Mỗi năm, thủ công cập nhật năm và hình ảnh hiển thị

10. Checklist kiểm tra
[ ] News hiển thị tối đa 5 bài mới nhất, sắp xếp giảm dần theo ngày.
[ ] URL bài viết thống nhất dạng news/post_{id}/.
[ ] Lịch trình năm hiển thị đúng 3 slot.
[ ] Thẻ trống (chưa có bài) không thể click và layout ổn định.
[ ] Có thể thay thế Ảnh/Năm/URL của Lịch trình năm theo bộ một cách dễ dàng.
[ ] Layout ổn định trên cả SP và PC.
11. Message to Engineers
Đối với phần Lịch trình năm (Annual Schedule), hãy ưu tiên việc quản lý 3 slot hiển thị riêng biệt thay vì tự động lấy danh sách bài viết. Component này yêu cầu cập nhật thủ công hàng năm gồm cả hình ảnh và liên kết, vì vậy hãy xây dựng cấu trúc sao cho việc thay thế nội dung (thay đổi ID bài viết hoặc upload ảnh mới) trở nên thuận tiện nhất cho người vận hành.