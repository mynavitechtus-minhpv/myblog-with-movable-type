# Hướng dẫn thiết kế (Design Guidelines) _20260324:ver_2.0.0

---

## 1. Mục đích (目的)
Tài liệu này định nghĩa các quy tắc thiết kế UI và triển khai cho hệ thống AZ-COM Network. Trong phiên bản này, bên cạnh thiết kế component, chúng tôi mở rộng thêm các quy tắc về Typography, Spacing, Border Radius, thiết kế Responsive và quy tắc triển khai code để thống nhất tiêu chuẩn đánh giá giữa thiết kế và thực tế.

### Mục tiêu:
- Đảm bảo tính nhất quán của thiết kế.
- Thống nhất cách triển khai Front-end.
- Tối ưu hóa thiết kế Template cho Movable Type.
- Nâng cao tính tái sử dụng của các UI Component.
- Tăng cường khả năng bảo trì khi thêm trang mới.

---

## 2. Layout (レイアウト)
### 2.1 Breakpoints
| Thiết bị | Độ rộng (Width) |
| --- | --- |
| Mobile | `< 768px` |
| Tablet | `768px - 1024px` |
| Desktop | `> 1024px` |

### 2.2 Thiết lập độ rộng tối đa (最大幅設定)
#### Mobile
| Tên gọi | Độ rộng | Công dụng |
| --- | --- | --- |
| Mobile Container | 375px | Tổng độ rộng trang SP |
| Mobile Content 335px | 335px | Khu vực nội dung SP 1 |
| Mobile Content 280px | 280px | Khu vực nội dung SP 2 |

#### Desktop
| Tên gọi | Độ rộng | Công dụng |
| --- | --- | --- |
| Desktop Container | 1440px | Tổng độ rộng trang PC |
| Desktop Content 1280px | 1280px | Khu vực nội dung PC 1 |
| Desktop Content 1120px | 1120px | Khu vực nội dung PC 2 |

### 2.3 Quy tắc vận dụng Container
- Tiêu chuẩn toàn màn hình là `1440px`.
- Độ rộng nội dung tiêu chuẩn là `1280px`.
- Ưu tiên sử dụng `1120px` cho các khu vực có nhiều văn bản hoặc bài giải thích.
- Đối với SP, lấy `375px` làm chuẩn thiết kế, khu vực nội dung (văn bản, card) tiêu chuẩn là `335px`.
- Cho phép thu hẹp xuống `280px` đối với các khu vực cần đặc biệt chú trọng vào khả năng đọc.

---

## 3. Hệ thống màu sắc (カラーシステム)
### 3.1 Primary Color
| Tên | HEX | Công dụng |
| --- | --- | --- |
| Primary Dark | `#22326e` | Header chính, văn bản quan trọng, nhận diện thương hiệu |
| Primary Blue | `#1c64f2` | Link, trạng thái Active, nút CTA |
| Light Blue | `#e8f0fe` | Background, nền Card, khu vực Highlight |
| Light Blue 2 | `#b9cffb` | Border, nền phụ (Secondary background) |

### 3.2 Accent Color
| Tên | HEX | Công dụng |
| --- | --- | --- |
| Accent Red | `#df4661` | Heading, văn bản nhấn mạnh, các yếu tố trang trí nhấn |
| Accent Red Dark | `#bc2630` | Điểm kết thúc Gradient, trạng thái Hover, khi nhấn mạnh |

### 3.3 Neutral Color
| Tên | HEX | Công dụng |
| --- | --- | --- |
| Text Primary | `#424242` | Văn bản nội dung chính, nội dung chủ chốt |
| Text Secondary | `#757575` | Văn bản phụ, thông tin bổ sung |
| White | `#ffffff` | Nền, nền Card, text trên nền tối |
| Gray Background | `#f5f7fa` | Nền trang |
| Border | `#e0e0e0` | Đường viền, đường phân cách |

### 3.4 Gradient
| Tên | Định nghĩa | Công dụng |
| --- | --- | --- |
| Red Gradient | `linear-gradient(to right, #df4661, #bc2630)` | Nút CTA, yếu tố nhấn mạnh |
| Blue Gradient | `linear-gradient(to bottom right, #22326e, #1c64f2)` | Hero section, Background |

### 3.5 Ví dụ định nghĩa Design Token
```css
:root {
  /* Primary */
  --color-primary-dark: #22326e;
  --color-primary: #1c64f2;
  --color-primary-light: #e8f0fe;
  --color-primary-light-2: #b9cffb;

  /* Accent */
  --color-accent: #df4661;
  --color-accent-dark: #bc2630;

  /* Neutral */
  --color-text-primary: #424242;
  --color-text-secondary: #757575;
  --color-white: #ffffff;
  --color-bg: #f5f7fa;
  --color-border: #e0e0e0;

  /* Gradient */
  --gradient-primary: linear-gradient(to bottom right, #22326e, #1c64f2);
  --gradient-accent: linear-gradient(to right, #df4661, #bc2630);
}
```

### 3.6 Quy tắc sử dụng
- `Primary Dark` dùng cho Heading đại diện thương hiệu hoặc điều hướng quan trọng.
- `Primary Blue` dùng cho Button, Link, các yếu tố tương tác.
- `Accent Red` không dùng tràn lan, chỉ giới hạn ở các vị trí nhấn mạnh.
- `Blue Gradient` dùng cho Hero, Key Visual, hoặc các mảng nền rộng.
- `Red Gradient` dùng cho các yếu tố nhấn mạnh hạn chế như CTA chính.
- Màu văn bản chính mặc định là `Text Primary`.
- Giải thích bổ sung, ngày tháng, chú thích sử dụng `Text Secondary`.

---

## 4. Typography (タイポグラフィ)
### 4.1 Font Family
#### Noto Sans JP
- Font chính. Sử dụng cho văn bản tiếng Nhật.
| Weight | Công dụng |
| --- | --- |
| 400 / Regular | Văn bản nội dung (Body) |
| 500 / Medium | Văn bản nhấn mạnh |
| 700 / Bold | Tiêu đề (Heading) |

#### Helvetica
- Font phụ. Sử dụng cho Label, văn bản chỉ gồm chữ số và chữ cái Latin.
| Weight | Công dụng |
| --- | --- |
| 700 / Bold | Point 01, Point 02, biểu diễn nhãn (Label) |

### 4.2 Type Scale (Body / Dùng chung PC・SP)
| Loại | Công dụng | Font Size | Font Weight | Line Height |
| --- | --- | --- | --- | --- |
| Body Large | Văn bản nội dung, đoạn giải thích | 16px | 500 | 24px |
| Body Regular | Văn bản nội dung | 16px | 400 | 24px |
| Small Text | Breadcrumb, text bổ sung, caption | 14px | 400 | 20px |
| Label - Bold | Label, Tag, Badge text | 16px | 700 | 32px |

### 4.3 Type Scale (Heading / PC)
| Loại | Công dụng | Font Size | Font Weight | Line Height |
| --- | --- | --- | --- | --- |
| H1 | Page Title, Hero Section Heading | 40px | 700 | 52px |
| H2 | Section Heading, Phân cách nội dung chính | 32px | 700 | 44px |
| H3 | Sub-section Heading | 24px | 700 | 44px |
| H4 | Heading trong Card, Section nhỏ | 20px | 700 | 32px |

### 4.4 Type Scale (Heading / SP)
| Loại | Công dụng | Font Size | Font Weight | Line Height |
| --- | --- | --- | --- | --- |
| H1 | Page Title, Hero Section Heading | 30px | 700 | 52px |
| H2 | Section Heading trên SP | 26px | 700 | 36px |
| H3 | Sub-section Heading trên SP | 20px | 700 | 28px |
| H4 | Heading trong Card trên SP | 18px | 700 | 26px |

### 4.5 Quy tắc Line-height
Kích thước chữ và line-height phải luôn được định nghĩa theo bộ.
| Loại | Giá trị khuyến nghị |
| --- | --- |
| Body (16px) | 1.6 - 1.75 |
| Body lớn | 1.6 |
| Heading | 1.3 - 1.4 |
| Nav / Button | 1.4 |

### 4.6 Ví dụ khuyến nghị cho Mobile
| Yếu tố | rem | px |
| --- | --- | --- |
| Body | 1rem | 16px |
| h1 | 2rem | 32px |
| h2 | 1.75rem | 28px |
| h3 | 1.375rem | 22px |

### 4.7 Quy tắc Responsive
- H1: `40px → 30px`
- H2: `32px → 26px`
- H3: `24px → 20px`
- H4: `20px → 18px`
- Body / Small Text về nguyên tắc giữ nguyên kích thước.
- Trên SP, không cưỡng ép thu nhỏ cỡ chữ mà đảm bảo khả năng đọc bằng cách điều chỉnh Margin và độ rộng.

### 4.8 Ví dụ triển khai (Code)
*(Lược bỏ phần code để đảm bảo tính ngắn gọn, tham khảo quy chuẩn ở mục 4.1 - 4.7)*

---

## 5. Spacing (スペーシング)
### 5.1 Spacing Scale
Hệ thống spacing dựa trên đơn vị cơ bản 8px. Một số giá trị bổ trợ 4px, 10px được sử dụng thêm.
| Size | Token | Công dụng |
| --- | --- | --- |
| 4px | XS | Gap nhỏ, giữa icon và text |
| 8px | SM | Giữa các yếu tố trong component |
| 10px | SM++ | Padding trên SP, Gap trong Card |
| 16px | MD | Giữa nội dung trong card, yếu tố trong section |
| 20px | MD+ | Container Padding trên SP |
| 24px | LG | Padding của card, giữa các section |
| 32px | XL | Khoảng trống lớn giữa section, margin lớn trong card |
| 40px | 2XL | Giữa các major section |
| 48px | 3XL | Giữa các nhóm card |
| 60px | 4XL | Phân cách section lớn |
| 64px | 5XL | Giữa các page section |
| 80px | 6XL | Padding của page container (Desktop) |

### 5.2 Spacing dành cho Smartphone
Điều chỉnh theo kích thước màn hình như sau:
- Container Padding: `80px (Desktop) → 20px (SP)`
- Giữa các Section: `64px → 40px`
- Gap trong Card: `16px → 10px`
- Gap giữa các Button: Cho phép `7px, 8px, 9px` tùy vị trí sử dụng.

### 5.3 Quy tắc sử dụng
- Lấy `8px` làm tiêu chuẩn tối thiểu, điều chỉnh chi tiết bằng giá trị bổ trợ `4px`.
- `10px` chỉ sử dụng hạn chế như padding nội bộ trên SP.
- Ưu tiên `24px` làm padding tiêu chuẩn cho Card.
- `64px` là khoảng cách tiêu chuẩn giữa các section.
- `80px` là giá trị chuẩn cho padding của page container trên Desktop.

---

## 6. Bo góc (Border Radius / 角丸)
### 6.1 Token Bo góc
| Token | Giá trị | Công dụng |
| --- | --- | --- |
| `--radius-sm` | 4px | Yếu tố nhỏ, Tag, bo góc tối thiểu |
| `--radius-md` | 8px | Card, Button tiêu chuẩn, UI cơ bản |
| `--radius-lg` | 12px | Card nhấn mạnh, Tab, Modal... |
| `--radius-pill` | 9999px | Nút CTA chính, Nút bo tròn mạnh |

### 6.2 Quy tắc vận hành
- Bo góc cơ bản là `8px`.
- UI nhấn mạnh đặc biệt là `12px`.
- Nút CTA bo tròn mạnh **sử dụng `pill` (9999px) cho cả PC và SP**.
- Không sử dụng giá trị cố định 32px, thống nhất dùng `9999px` cho kiểu pill.
- Giá trị bổ trợ `10px` không được dùng làm token bo góc.

### 6.3 Ví dụ triển khai
```css
:root {
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-pill: 9999px;
}
```

---

## 7. Thiết kế Component (コンポーネント設計)
### 7.1 Quy tắc đặt tên
```css
.c-[Tên Component]
.c-[Tên Component]__element
.c-[Tên Component]--modifier
```
*(VD: .c-button, .c-card)*

### 7.2 Button
#### Loại: Primary, Accent, Outline, Pill.
#### Đặc tả chung:
- Text trên button ưu tiên `Bold`.
- Điều hướng chính ưu tiên kiểu Pill.
- Đảm bảo đủ padding trái/phải bên trong nút.
- Khoảng cách giữa Icon và Text là `4px - 8px`.

### 7.3 Card
Dùng cho: List bài viết, List nội dung, News, Annual Schedule, Activity Report Summary.
Cấu trúc: `thumbnail, category, title, description, link`.

### 7.4 Header
Cấu trúc: `logo, global navigation, member button, search button`.
Chỉ dẫn: Nền trắng, "Dành cho hội viên" dùng kiểu Pill, Tìm kiếm dùng icon tròn độc lập.

### 7.5 Footer
Cấu trúc: `logo, footer navigation, member button, static links, copyright`.
Chỉ dẫn: Duy trì tính nhận diện cho các nút điều hướng chính giống Header.

### 7.6 Breadcrumb
Font size 14px, Line height 20px, màu Text Secondary.

### 7.7 Label / Tag
Font phụ (Helvetica), 16px, Bold, Line height 32px.

### 7.8 Pagination
Phân chia rõ trạng thái: Số trang, Back, Next. Active dùng Primary Blue.

### 7.9 Floating Button
Dùng cho: Yêu cầu tài liệu, Liên hệ.
Chỉ dẫn: Mặc định kiểu Pill, có Shadow để không bị chìm trên nền nội dung.

### 7.10 CTA Section
Dùng cho: Liên hệ, Yêu cầu tài liệu, Nhập hội.
Chỉ dẫn: Cho phép dùng màu thương hiệu cho Background, ưu tiên dẫn dắt thị giác.

---

## 8. Component tích hợp MT (MT連携コンポーネント)
Thiết kế dựa trên giả định tích hợp MT (Movable Type).

### 8.1 Card bài viết: Lấy dữ liệu từ `title, category.name, thumbnail, excerpt, published_at`.
### 8.2 Pagination: Sử dụng `page_numbers, has_prev / has_next`.
### 8.3 Navigation: Menu dựa trên `page / category`.
### 8.4 Side Menu: Ranking (tối đa 5 bài), Category list, Tag list.
### 8.5 Lưu ý triển khai: Định nghĩa style nội dung bài viết trong wrapper `.mt-content`.

---

## 9. Thiết kế CSS (CSS設計)
### 9.1 Cấu trúc file: `base.css, layout.css, component.css, page.css, utility.css`.
### 9.2 Chiến lược Layer: Phân tách từ Reset, khung Layout đến Component và Utility.
### 9.3 Quy tắc triển khai:
- **Bắt buộc:** Dùng CSS Variable, Design Token, PC/SP Responsive, Class tái sử dụng.
- **Cấm:** Inline CSS, Chỉ định màu trực tiếp (hard-code), Viết cứng cỡ chữ, Dùng quá nhiều quy tắc bo góc khác nhau cho cùng mục đích.

---

## 10. Hướng dẫn sử dụng (使用ガイドライン)
### 10.1 Khuyến nghị: Sử dụng Heading phân cấp, đảm bảo Line-height, chia đoạn văn bản hợp lý.
### 10.2 Điều cần tránh: Thay đổi cỡ chữ quá mức, Line-height quá hẹp, trộn lẫn quá nhiều font family, độ tương phản màu thấp.

---

## 11. Ghi chú triển khai (実装メモ)
- Nút điều hướng chính ở Header/Footer dùng kiểu **pill** cho cả PC/SP.
- Hiệu ứng viền/ring nhạt bên ngoài nút CTA dùng `box-shadow` hoặc pseudo-element thay vì border.
- Tránh lạm dụng Background Gradient cho các component nhỏ.
- Ưu tiên spacing đảm bảo layout không vỡ khi nội dung tăng lên.