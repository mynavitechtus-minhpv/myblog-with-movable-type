# Hướng dẫn Setup Content Type "Hero Slider FV" trong MT Admin

## Admin setup required

### 1) Content Type: Hero Slider FV
- **Type**: ContentType
- **Scope**: Website (toàn site)
- **Purpose**: Quản lý 3 slides cho First View trang chủ với text đa dòng và ảnh responsive PC/SP
- **Dependency**: Component `azcom-hero-fv.mtml` phụ thuộc vào Content Type này

### 2) Field schema

**Tên Content Type**: `Hero Slider FV`

Các fields cần tạo:

1. **slide_title**
   - Label: `Tiêu đề slide`
   - Type: `Single-Line Text`
   - Required: `Yes`
   - Max Length: `100`
   - Default: (empty)
   - Notes: Dùng cho alt text và heading nội bộ, hiển thị tại content-box

2. **slide_line_1**
   - Label: `Text dòng 1`
   - Type: `Single-Line Text`
   - Required: `No`
   - Max Length: `50`
   - Default: (empty)
   - Notes: Dòng text đầu tiên xuất hiện với animation (0.8s delay)

3. **slide_line_2**
   - Label: `Text dòng 2`
   - Type: `Single-Line Text`
   - Required: `No`
   - Max Length: `50`
   - Default: (empty)
   - Notes: Dòng text thứ 2 xuất hiện sau line 1 (0.5s sau line 1)

4. **slide_line_3**
   - Label: `Text dòng 3`
   - Type: `Single-Line Text`
   - Required: `No`
   - Max Length: `50`
   - Default: (empty)
   - Notes: Dòng text thứ 3 xuất hiện sau line 2 (0.5s sau line 2)

5. **image_pc**
   - Label: `Ảnh PC (1920x1080)`
   - Type: `Asset (Image)`
   - Required: `Yes`
   - Default: None
   - Validation: None
   - Notes: Ảnh hiển thị trên desktop, khuyến nghị 1920x1080px (fv-img-001/002/003.png)

6. **image_sp**
   - Label: `Ảnh SP (750x1334)`
   - Type: `Asset (Image)`
   - Required: `Yes`
   - Default: None
   - Validation: None
   - Notes: Ảnh hiển thị trên mobile, khuyến nghị 750x1334px (fv-sp-img-001/002/003.png)

7. **sort_order**
   - Label: `Thứ tự hiển thị`
   - Type: `Number`
   - Required: `Yes`
   - Default: `1`
   - Validation: Min=1, Max=3
   - Notes: Thứ tự slide từ 1-3, quyết định animation timing

### 3) MTML usage

Component template sẽ sử dụng Content Type này như sau:

```mtml
<mt:Contents content_type="Hero Slider FV" sort_by="field:sort_order" sort_order="asc" limit="3">
  <div class="c-hero-fv__slide" data-slide-index="<mt:ContentIndex>">
    <div class="c-hero-fv__image-box">
      <picture>
        <source media="(max-width: 767px)" srcset="<mt:ContentField content_field="image_sp"><mt:AssetURL encode_html="1"></mt:ContentField>">
        <img src="<mt:ContentField content_field="image_pc"><mt:AssetURL encode_html="1"></mt:ContentField>" 
             class="c-hero-fv__slide-img" 
             alt="<mt:ContentField content_field="slide_title" encode_html="1">">
      </picture>
    </div>
    <div class="c-hero-fv__content-box">
      <mt:If name="slide_line_1">
        <span class="c-hero-fv__line c-hero-fv__line-1"><mt:ContentField content_field="slide_line_1"></span>
      </mt:If>
      <mt:If name="slide_line_2">
        <span class="c-hero-fv__line c-hero-fv__line-2"><mt:ContentField content_field="slide_line_2"></span>
      </mt:If>
      <mt:If name="slide_line_3">
        <span class="c-hero-fv__line c-hero-fv__line-3"><mt:ContentField content_field="slide_line_3"></span>
      </mt:If>
    </div>
  </div>
</mt:Contents>
```

### 4) Setup order

**Bước 1: Tạo Content Type**
1. Login vào MT Admin: http://localhost:8082/cgi-bin/mt/mt.cgi
2. Vào menu `Design` → `Content Types`
3. Click `Create Content Type`
4. Điền thông tin:
   - **Name**: `Hero Slider FV`
   - **Description**: `First View hero slider cho trang chủ - 3 slides với text animation`
5. Click `Save`

**Bước 2: Thêm Fields**

Tạo từng field theo thứ tự trên với các settings:

1. Click `Add Field` → chọn type phù hợp
2. Điền Label, Unique ID (tự động từ label)
3. Set Required/Optional
4. Set Default value nếu có
5. Click `Save`

Lặp lại cho 7 fields: slide_title, slide_line_1, slide_line_2, slide_line_3, image_pc, image_sp, sort_order

**Bước 3: Tạo 3 Content Entries**

Sau khi Content Type đã có đủ fields:

1. Vào `Manage` → `Content Data` → chọn `Hero Slider FV`
2. Click `Create Entry`

**Entry 1:**
- slide_title: `物流の未来を、ともに創る`
- slide_line_1: `物流の未来を、ともに創る`
- slide_line_2: (empty)
- slide_line_3: (empty)
- image_pc: Upload `fv-img-001.png`
- image_sp: Upload `fv-sp-img-001.png`
- sort_order: `1`

**Entry 2:**
- slide_title: `物流企業の未来を加速させるパートナー`
- slide_line_1: `物流企業の未来を`
- slide_line_2: `加速させるパートナー`
- slide_line_3: (empty)
- image_pc: Upload `fv-img-002.png`
- image_sp: Upload `fv-sp-img-002.png`
- sort_order: `2`

**Entry 3:**
- slide_title: `物流業界の課題を解決し成長エンジンに`
- slide_line_1: `物流業界の課題を解決し`
- slide_line_2: `パートナー企業の`
- slide_line_3: `成長エンジンに`
- image_pc: Upload `fv-img-003.png`
- image_sp: Upload `fv-sp-img-003.png`
- sort_order: `3`

**Bước 4: Upload Images**

Trước khi tạo entries, cần có 6 ảnh trong Assets:
- Download từ: https://drive.google.com/drive/u/0/folders/1RmrWnDrH3chTvEFr7ixOMKAe1PGEVG8M
- Upload vào MT Assets: `Manage` → `Assets` → `Upload`
- Hoặc copy trực tiếp vào thư mục `mt/assets/img/`

**Bước 5: Rebuild Site**

1. Vào `Tools` → `Rebuild`
2. Chọn Website/Blog
3. Click `Rebuild`

### 5) Impact and verification

**Affected templates:**
- `development-dev/pages/index.mtml` - thay thế placeholder FV section
- Template module mới: `azcom-hero-fv.mtml`

**Backward compatibility:**
- ✅ Safe - chỉ thay thế section placeholder, không ảnh hưởng template khác

**Verification checklist:**

- [ ] Content Type "Hero Slider FV" xuất hiện trong admin
- [ ] 7 fields hiển thị đúng thứ tự khi create entry
- [ ] 3 entries được tạo với đầy đủ text và ảnh
- [ ] Ảnh PC/SP đã upload vào Assets
- [ ] Template `azcom-hero-fv.mtml` đọc được data từ Content Type
- [ ] 3 slides hiển thị trên trang chủ với text đúng
- [ ] Ảnh PC xuất hiện trên desktop, ảnh SP trên mobile
- [ ] Animation chạy đúng: 15s loop, 5s/slide
- [ ] Text fade-in với translateY đúng timing 0.8s
- [ ] Layout PC 60/40 và SP 75vh + text overlay hoạt động tốt

## Notes

- Content Type này chỉ dùng cho First View trang chủ, không reuse cho slider khác
- Nếu muốn thêm/bớt slides: chỉnh limit trong MTML loop và update CSS animation delays
- Field `sort_order` quan trọng - quyết định animation timing delays
- Khuyến nghị dùng ảnh chất lượng cao (1920x1080 PC, 750x1334 SP) để đảm bảo zoom effect mượt

---

**Created**: 2026-04-02
**For Project**: Movable Type 8.8.2 - AZ-COM Network
