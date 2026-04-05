# Hướng dẫn Upload Ảnh First View Hero Slider

## Ảnh cần thiết

Cần download và upload **6 ảnh** từ Google Drive:

### Desktop (PC) - 3 ảnh
- `fv-img-001.png` (1920x1080px khuyến nghị)
- `fv-img-002.png` (1920x1080px khuyến nghị)
- `fv-img-003.png` (1920x1080px khuyến nghị)

### Mobile (SP) - 3 ảnh
- `fv-sp-img-001.png` (750x1334px khuyến nghị)
- `fv-sp-img-002.png` (750x1334px khuyến nghị)
- `fv-sp-img-003.png` (750x1334px khuyến nghị)

## Link Download

https://drive.google.com/drive/u/0/folders/1RmrWnDrH3chTvEFr7ixOMKAe1PGEVG8M

## Hướng dẫn Upload

### Cách 1: Upload qua MT Admin (Khuyến nghị)

1. Login MT Admin: http://localhost:8082/cgi-bin/mt/mt.cgi
2. Vào `Manage` → `Assets`
3. Click `Upload` button
4. Chọn 6 file ảnh đã download
5. Đợi upload hoàn tất
6. Verify: ảnh xuất hiện trong Assets list

### Cách 2: Copy trực tiếp vào thư mục

```bash
# Copy 6 ảnh vào thư mục assets/img/
cp ~/Downloads/fv-img-*.png /Users/macbook_280/Downloads/movabletype/mt/assets/img/
cp ~/Downloads/fv-sp-img-*.png /Users/macbook_280/Downloads/movabletype/mt/assets/img/
```

## Verification

Sau khi upload, kiểm tra:

```bash
# List files
ls -lh /Users/macbook_280/Downloads/movabletype/mt/assets/img/fv-*.png

# Kết quả mong đợi: 6 files
# fv-img-001.png
# fv-img-002.png
# fv-img-003.png
# fv-sp-img-001.png
# fv-sp-img-002.png
# fv-sp-img-003.png
```

## Note

- Ảnh này sẽ được sử dụng trong Content Type "Hero Slider FV"
- Mỗi slide cần 1 ảnh PC + 1 ảnh SP
- Picture tag trong component sẽ tự động switch giữa PC/SP dựa trên media query
- Ảnh zoom effect cần quality tốt để tránh pixelated khi scale 1.0 → 1.1

---

**Created**: 2026-04-02
