# Cấu trúc tham khảo cho SP Hamburger Menu (Tham khảo)
Tài liệu này tổng hợp **một ví dụ về cách tổ chức cấu trúc** dựa trên thực tế triển khai hiện tại.

Mục đích không phải là bắt buộc thực hiện ngay, mà là **chia sẻ tư duy về cấu trúc để tối ưu hóa khả năng mở rộng và bảo trì** trong tương lai.

---

## Bối cảnh
Trong cách triển khai hiện tại, các phần tử hiển thị trong Hamburger Menu trên SP bao gồm:

* Navigation (Điều hướng)
* Search (Tìm kiếm)
* CTA (Luồng cho hội viên)
* Logo
* Legal links (Link pháp lý)

Tất cả hiện đang nằm bên trong thẻ `nav`.
Về mặt vận hành thì không có vấn đề gì, nhưng về mặt cấu trúc:

* Navigation
* Các thành phần UI khác

đang bị trộn lẫn trong cùng một layer.

---

## Tư duy thiết kế

Về bản chất, Menu trên SP không chỉ là "Nav" mà là một "Drawer UI".
Vì vậy, việc chia tách trách nhiệm (Responsibility) như dưới đây sẽ giúp cấu trúc trở nên rõ ràng hơn:

---

### Phân tách cấu trúc

```
drawer (Tổng thể)
 ├ nav (Chỉ chứa Navigation)
 └ footer (Chứa Search / CTA / Logo / Legal links)
```

---

## Cấu trúc tham khảo (HTML)

```html
<header class="c-header">
  <div class="c-header__inner">
    <div class="c-header__logo">
      <a href="/">AZ-COM</a>
    </div>

    <div class="c-header__toolbar">
      <button class="js-hamburger" aria-label="Open menu">☰</button>
    </div>
  </div>

  <div class="c-header__drawer" hidden>
    
    <nav class="c-header__nav" aria-label="Global Navigation">
      <ul class="c-header__menu">
        <li class="c-header__item">
          <button class="js-accordion">
            Giới thiệu pháp nhân
          </button>
          <ul class="c-header__submenu">
            <li><a href="#">Lời chào từ Chủ tịch</a></li>
            <li><a href="#">Lịch sử hình thành</a></li>
          </ul>
        </li>
      </ul>
    </nav>

    <div class="c-header__mobile-footer">

      <form class="c-header__search">
        <input type="text" placeholder="Tìm kiếm trong site">
        <button type="submit">Tìm kiếm</button>
      </form>

      <a href="#" class="c-header__cta">
        Dành cho hội viên
      </a>

      <div class="c-header__footer-logo">
        AZ-COM
      </div>

      <div class="c-header__legal">
        <a href="#">Điều khoản sử dụng</a>
        <a href="#">Chính sách bảo mật</a>
      </div>

    </div>

  </div>
</header>
```

---

## JS (Điều khiển đóng/mở)

```js
const hamburger = document.querySelector('.js-hamburger');
const drawer = document.querySelector('.c-header__drawer');

hamburger.addEventListener('click', () => {
  const isOpen = drawer.hasAttribute('hidden');

  if (isOpen) {
    drawer.removeAttribute('hidden');
    document.body.classList.add('is-locked');
  } else {
    drawer.setAttribute('hidden', '');
    document.body.classList.remove('is-locked');
  }
});
```

---

## CSS (Cơ bản)

```css
.c-header__drawer {
  position: fixed;
  inset: 0;
  background: #fff;
  overflow-y: auto;
  z-index: 1000;
}

.c-header__nav {
  padding: 24px;
}

.c-header__mobile-footer {
  padding: 24px;
  border-top: 1px solid #ddd;
}
```

---

## Ưu điểm của cấu trúc này

### 1. Trách nhiệm (Responsibility) rõ ràng
* `nav` = Chỉ chứa điều hướng.
* `footer` = Chứa các UI bổ trợ.
-> Cấu trúc ngữ nghĩa (Semantic) sẽ sạch sẽ hơn.

### 2. Dễ dàng mở rộng
Ví dụ:
* Di chuyển Search lên trên.
* Cố định CTA.
* Chỉ cho phần Footer thành Sticky.
-> Tất cả đều thực hiện rất dễ dàng.

### 3. Điều khiển JS đơn giản hơn
* Có thể xử lý dưới khái niệm "Đóng/mở Drawer".
-> Không bị phụ thuộc vào class `.nav`.

### 4. Dễ dàng hỗ trợ Accessibility (A11y)
* Quản lý Focus.
* Điều khiển thuộc tính `aria`.
-> Việc phân tách vai trò giúp xử lý A11y thuận tiện hơn rất nhiều.

---

## Bổ sung
Cách triển khai hiện tại không có vấn đề gì lớn, tuy nhiên dựa trên các điểm sau:
* UI phức tạp (3 tầng, có Search, CTA).
* Khả năng mở rộng cao trong tương lai.

Việc **thống nhất khái niệm "Drawer"** sẽ giúp hệ thống an toàn và ổn định hơn.

---

# Comment
Tôi đã tổng hợp phương án tổ chức cấu trúc cho Hamburger Menu để các bạn tham khảo.
(Đây không phải là phủ nhận cách làm hiện tại, mà chỉ là tài liệu tham khảo hướng tới việc mở rộng trong tương lai).

Vì tài liệu này tập trung vào việc phân tách trách nhiệm giữa Drawer và Navigation, rất mong các bạn dành chút thời gian xem qua nhé.
