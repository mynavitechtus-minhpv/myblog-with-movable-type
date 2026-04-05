# Hướng dẫn Test Hero First View Slider

## Test Checklist đầy đủ

### Desktop Testing (1440px+)

#### Animation Timing
- [ ] **15 giây loop**: 3 slides hoàn thành 1 chu kỳ trong 15 giây
- [ ] **5 giây/slide**: Mỗi slide hiển thị đúng 5 giây
- [ ] **Image zoom**: Ảnh phóng to mượt từ scale(1.0) → scale(1.1) trong 5 giây
- [ ] **Text delay 0.8s**: Text xuất hiện sau 0.8 giây kể từ khi slide active
- [ ] **Text stagger 0.5s**: Mỗi dòng text cách nhau 0.5 giây (nếu có nhiều dòng)

#### Layout PC (60/40)
- [ ] Image box chiếm 60% width, nằm bên trái
- [ ] Content box chiếm 40% width, nằm bên phải
- [ ] Text căn giữa theo chiều dọc (vertical center)
- [ ] Gradient overlay tự nhiên, không có boundary noise
- [ ] SVG decoration hiển thị mờ (~15% opacity)

#### Text Animation
- [ ] **Slide 1**: 1 dòng text xuất hiện sau 0.8s
- [ ] **Slide 2**: 2 dòng text (0.8s + 1.3s)
- [ ] **Slide 3**: 3 dòng text (0.8s + 1.3s + 1.8s)
- [ ] Fade-in effect: opacity 0 → 1
- [ ] Translate effect: translateY(20px) → 0
- [ ] Text không bị jitter hoặc flicker

### Tablet Testing (768px - 1024px)
- [ ] Layout responsive điều chỉnh padding phù hợp
- [ ] Font size giảm xuống 28px (--font-size-2xl)
- [ ] Text vẫn readable và không bị chồng lấn
- [ ] Animation timing giữ nguyên

### Mobile Testing (< 768px)

#### Layout SP
- [ ] Image box chiếm 75vh (75% chiều cao viewport)
- [ ] Content box nằm dưới, overlay lên ảnh (~10% from bottom)
- [ ] `object-position: center top` giữ chủ thể ảnh (người/xe)
- [ ] Ảnh SP load đúng (fv-sp-img-*.png), không phải ảnh PC

#### Text Readability
- [ ] Text shadow/gradient đủ để đọc rõ trên ảnh
- [ ] Font size giảm xuống phù hợp mobile (28px)
- [ ] Text không bị cắt hoặc ra ngoài viewport
- [ ] Gradient overlay từ dưới lên (white 0% → transparent 80%)

#### Mobile Interactions
- [ ] Touch swipe pause animation briefly (0.5s)
- [ ] Pause on touch/hold slider
- [ ] Resume animation sau khi release

### Performance Testing

#### Loading
- [ ] No layout shift (CLS) khi first load
- [ ] Ảnh slide 1 load eager, slide 2-3 lazy load
- [ ] CSS/JS defer load không block render
- [ ] Total blocking time < 300ms

#### Animation Performance
- [ ] Smooth 60fps animation (check DevTools Performance)
- [ ] No dropped frames khi zoom ảnh
- [ ] Text animation mượt mà, không lag
- [ ] GPU acceleration hoạt động (check Layers)

#### Accessibility
- [ ] Reduced motion: animation tắt khi user set preference
- [ ] ARIA live region announce slide changes
- [ ] Keyboard navigation: pause/resume slider
- [ ] Screen reader đọc được nội dung text

### Cross-browser Testing
- [ ] Chrome/Edge (Blink engine)
- [ ] Firefox (Gecko engine)
- [ ] Safari (WebKit engine) - macOS/iOS
- [ ] Mobile Chrome/Safari

### Interaction Testing

#### Hover (Desktop only)
- [ ] Hover vào slider → animation pause
- [ ] Move out → animation resume
- [ ] Pause state giữ nguyên progress

#### Touch (Mobile)
- [ ] Swipe right → pause briefly
- [ ] Swipe left → pause briefly
- [ ] No accidental zoom khi interact

## Test Commands

### Dev Server
```bash
cd /Users/macbook_280/Downloads/movabletype/mt
docker compose up -d
```

### Check URLs
- Admin: http://localhost:8082/cgi-bin/mt/mt.cgi
- Published site: http://localhost:8082/ (sau khi rebuild)

### Browser DevTools Checks

#### Performance Tab
1. Open DevTools → Performance
2. Click Record
3. Wait for 15 seconds (full loop)
4. Stop recording
5. Check:
   - FPS không drop dưới 55fps
   - No long tasks (> 50ms)
   - Paint/Composite times < 16ms

#### Layers Tab (Chrome)
1. DevTools → More tools → Layers
2. Verify:
   - `.c-hero-fv__slide` có layer riêng
   - `.c-hero-fv__slide-img` có layer riêng (will-change: transform)
   - `.c-hero-fv__line` có layer riêng (will-change: opacity, transform)

#### Network Tab
1. Hard refresh (Cmd+Shift+R)
2. Verify:
   - hero-fv.css load < 100ms
   - hero-fv.js load < 50ms
   - Images load progressively (lazy)
   - Total page load < 3s

### Responsive Testing

#### Chrome DevTools Responsive Mode
```
Cmd+Shift+M (Mac) or Ctrl+Shift+M (Windows)
```

Test preset devices:
- **Desktop**: 1920×1080, 1440×900
- **Tablet**: iPad Air (820×1180), iPad Pro (1024×1366)
- **Mobile**: iPhone 12 Pro (390×844), iPhone SE (375×667)

#### Manual Resize
Drag browser window từ wide → narrow, verify:
- Breakpoint 768px switch layout mượt
- No horizontal scroll
- No text overflow

## Bug Report Template

Nếu phát hiện lỗi, report theo format:

```
**Bug**: [Mô tả ngắn gọn]

**Steps to reproduce**:
1. ...
2. ...
3. ...

**Expected**: [Kết quả mong đợi]
**Actual**: [Kết quả thực tế]

**Environment**:
- Browser: Chrome 120 / Firefox 121 / Safari 17
- Device: Desktop / Tablet / Mobile
- Screen size: 1920×1080 / 375×667 / ...
- OS: macOS 14 / Windows 11 / iOS 17

**Screenshot/Video**: [Attach nếu có]
```

## Known Limitations

1. **Animation pause/resume**: Swipe gesture chỉ pause briefly, không control slide index
2. **Prefers-reduced-motion**: Animation tắt hẳn, chỉ hiển thị slide 1
3. **Old browsers**: IE11 không support (no CSS custom properties, no IntersectionObserver)
4. **Low-end devices**: Animation có thể drop frames trên Android cũ (< Android 7)

## Success Criteria

✅ **Pass** nếu:
- Tất cả checklist items pass
- FPS average > 55fps
- No console errors
- Text readable trên mọi devices
- Animation timing đúng spec (15s loop, 5s/slide, 0.8s text delay)

❌ **Fail** nếu:
- Animation lag hoặc jitter
- Text không đọc được trên mobile
- Layout break ở breakpoints
- Performance issues (dropped frames, long tasks)

---

**Created**: 2026-04-02
**Version**: 1.0.0
