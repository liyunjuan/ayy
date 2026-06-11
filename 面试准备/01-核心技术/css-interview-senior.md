# CSS 面试整理 - 资深前端工程师（完整版）

> 面向 9 年经验前端，深度覆盖：原理剖析、工程实践、架构设计、面试真题

---

## 目录

- [一、渲染原理与性能优化](#一渲染原理与性能优化)
- [二、CSS 核心机制深度剖析](#二css-核心机制深度剖析)
- [三、布局体系完全指南](#三布局体系完全指南)
- [四、CSS 架构与工程化](#四css-架构与工程化)
- [五、动画与交互](#五动画与交互)
- [六、响应式设计与移动端](#六响应式设计与移动端)
- [七、现代 CSS 特性](#七现代-css-特性)
- [八、CSS 预处理器与工具链](#八css-预处理器与工具链)
- [九、浏览器兼容性](#九浏览器兼容性)
- [十、CSS 安全与最佳实践](#十css-安全与最佳实践)
- [十一、经典面试题详解](#十一经典面试题详解)
- [十二、手写题与实战场景](#十二手写题与实战场景)
- [十三、高频面试问答](#十三高频面试问答)

---

## 一、渲染原理与性能优化

### 1.1 浏览器渲染流程

**完整渲染管线**

```
HTML → DOM Tree
CSS  → CSSOM Tree
         ↓
    Render Tree（DOM + CSSOM）
         ↓
      Layout（计算几何信息）
         ↓
      Paint（绘制像素）
         ↓
    Composite（合成层）
```

**关键路径优化**
```html
<!-- ❌ CSS 阻塞渲染 -->
<link rel="stylesheet" href="style.css">

<!-- ✅ 非关键 CSS 异步加载 -->
<link rel="preload" href="style.css" as="style" onload="this.rel='stylesheet'">

<!-- ✅ 媒体查询避免阻塞 -->
<link rel="stylesheet" href="print.css" media="print">
```

---

### 1.2 Layout（回流/重排）

**触发 Layout 的属性**
```css
/* 几何属性 */
width, height, padding, margin, border
top, left, right, bottom
display, position, float
font-size, line-height, text-align
overflow, min-width, max-height
/* ... 等所有影响布局的属性 */
```

**避免强制同步布局（Layout Thrashing）**
```javascript
// ❌ 读写交替，触发多次回流
elements.forEach(el => {
  const height = el.offsetHeight; // 读（触发回流）
  el.style.height = height + 10 + 'px'; // 写
});

// ✅ 批量读取，批量写入
const heights = elements.map(el => el.offsetHeight); // 批量读
elements.forEach((el, i) => {
  el.style.height = heights[i] + 10 + 'px'; // 批量写
});
```

**FastDOM 模式**
```javascript
// 使用 requestAnimationFrame 分离读写
fastdom.measure(() => {
  const height = element.offsetHeight;
  fastdom.mutate(() => {
    element.style.height = height + 'px';
  });
});
```

---

### 1.3 Paint（重绘）

**触发 Paint 的属性**
```css
/* 视觉属性 */
color, background, border-color, border-style
box-shadow, border-radius, outline
visibility, text-decoration
```

**Paint 层级优化**
```css
/* 减少 paint 区域 */
.card {
  /* ❌ box-shadow 导致整个元素重绘 */
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* ✅ 用伪元素隔离阴影 */
.card::after {
  content: '';
  position: absolute;
  inset: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: -1;
}
```

---

### 1.4 Composite（合成）

**GPU 加速属性（仅触发合成）**
```css
transform: translate/scale/rotate/skew/matrix/3d
opacity
filter
will-change
backface-visibility
perspective
```

**提升到合成层的条件**
1. 3D 或 perspective transform
2. `<video>` `<canvas>` `<iframe>`
3. CSS filters
4. `will-change: transform/opacity`
5. `animation` 或 `transition` 作用于 transform/opacity
6. `position: fixed`（部分浏览器）

**实战优化**
```css
/* ❌ 动画触发 Layout */
@keyframes bad {
  from { left: 0; }
  to { left: 100px; }
}

/* ✅ 只触发 Composite */
@keyframes good {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}

/* 提前告知浏览器 */
.animated {
  will-change: transform;
}

/* 动画结束后清理 */
.animated.done {
  will-change: auto;
}
```

**合成层陷阱**
```css
/* ❌ 层爆炸：每个子元素都被提升 */
.parent {
  transform: translateZ(0);
}
.parent > .child { /* 被动提升 */ }

/* ✅ 用 isolation 隔离 */
.parent {
  isolation: isolate;
}
```

---

### 1.5 性能测量工具

**Chrome DevTools**
```
1. Performance 面板
   - Main：查看 Layout/Paint/Composite 耗时
   - Frames：查看 FPS
   - Layers：查看合成层

2. Rendering 面板
   - Paint flashing：高亮重绘区域（绿色）
   - Layer borders：显示合成层边界（橙色/青色）
   - Frame Rendering Stats：实时 FPS

3. Coverage 面板
   - 查找未使用的 CSS（红色条）

4. Lighthouse
   - 性能评分和优化建议
```

**性能 API**
```javascript
// 测量 CLS（累积布局偏移）
new PerformanceObserver(list => {
  list.getEntries().forEach(entry => {
    console.log('CLS:', entry.value);
  });
}).observe({ entryTypes: ['layout-shift'] });

// 测量 LCP（最大内容绘制）
new PerformanceObserver(list => {
  const entries = list.getEntries();
  const lastEntry = entries[entries.length - 1];
  console.log('LCP:', lastEntry.renderTime);
}).observe({ entryTypes: ['largest-contentful-paint'] });
```

---

### 1.6 高级性能优化技巧

**CSS Containment（包含）**
```css
/* 告诉浏览器元素是独立的 */
.card {
  contain: layout;        /* 内部布局不影响外部 */
  contain: paint;         /* 绘制不会溢出边界 */
  contain: size;          /* 尺寸计算不依赖子元素 */
  contain: layout paint;  /* 组合使用 */
  contain: strict;        /* = layout paint size */
  contain: content;       /* = layout paint */
}
```

**content-visibility（延迟渲染）**
```css
/* 虚拟滚动优化 */
.list-item {
  content-visibility: auto; /* 屏幕外元素跳过渲染 */
  contain-intrinsic-size: 0 500px; /* 占位尺寸，避免滚动条跳动 */
}

/* 首屏外内容延迟渲染 */
.below-fold {
  content-visibility: auto;
}
```

**实测效果**：大列表渲染性能提升 5-10 倍

---

## 二、CSS 核心机制深度剖析

### 2.1 层叠上下文（Stacking Context）

**创建层叠上下文的完整条件**
```css
/* 1. 根元素 <html> */

/* 2. position + z-index */
position: relative/absolute/fixed/sticky;
z-index: 非 auto;

/* 3. position: fixed/sticky（即使 z-index: auto） */
position: fixed;

/* 4. opacity < 1 */
opacity: 0.99;

/* 5. transform 不为 none */
transform: translateZ(0);

/* 6. filter 不为 none */
filter: blur(5px);

/* 7. perspective 不为 none */
perspective: 1000px;

/* 8. clip-path 不为 none */
clip-path: circle(50%);

/* 9. mask / mask-image / mask-border */
mask: url(mask.png);

/* 10. mix-blend-mode 不为 normal */
mix-blend-mode: multiply;

/* 11. isolation: isolate */
isolation: isolate; /* 显式创建，最清晰 */

/* 12. will-change: transform/opacity/filter */
will-change: transform;

/* 13. contain: layout/paint */
contain: paint;

/* 14. Flex/Grid 子项 + z-index 非 auto */
.parent { display: flex; }
.child { z-index: 1; } /* 创建层叠上下文 */
```

**层叠顺序（从下到上）**
```
1. 层叠上下文的 background/border
2. z-index < 0 的子层叠上下文
3. 非定位的块级元素
4. 非定位的浮动元素
5. 非定位的内联元素
6. z-index: auto 或 0 的定位元素
7. z-index > 0 的子层叠上下文
```

**经典面试题**
```html
<div class="a" style="position:relative; z-index:1;">
  <div class="a1" style="position:absolute; z-index:9999;">A1</div>
</div>
<div class="b" style="position:relative; z-index:2;">
  <div class="b1" style="position:absolute; z-index:-1;">B1</div>
</div>

<!-- 问：A1 和 B1 谁在上面？ -->
<!-- 答：B1 在上面 -->
<!-- 原因：A1 在 z-index:1 的上下文内，B1 在 z-index:2 的上下文内 -->
```

**实战陷阱：模态框被遮挡**
```css
/* ❌ 问题代码 */
.header {
  position: relative;
  z-index: 100; /* 创建了层叠上下文 */
}
.modal {
  position: fixed;
  z-index: 9999; /* 无效！在根层叠上下文中只有 auto */
}

/* ✅ 解决方案 1：移除 header 的 z-index */
.header {
  position: relative;
  /* 不设置 z-index */
}

/* ✅ 解决方案 2：modal 挂载到 body */
ReactDOM.createPortal(<Modal />, document.body);

/* ✅ 解决方案 3：用 CSS 变量统一管理 */
:root {
  --z-header: 100;
  --z-modal: 1000;
}
```

---

### 2.2 BFC（Block Formatting Context）

**触发 BFC 的方法（完整）**
```css
/* 1. 根元素 <html> */

/* 2. float */
float: left/right;

/* 3. position */
position: absolute/fixed;

/* 4. display */
display: inline-block;
display: flow-root; /* 最佳，语义明确，无副作用 */
display: flex/inline-flex;
display: grid/inline-grid;
display: table/table-cell/table-caption;

/* 5. overflow */
overflow: hidden/auto/scroll;
overflow-x/y: hidden/auto/scroll;

/* 6. contain */
contain: layout/content/paint;

/* 7. column-count / column-width */
column-count: 2;
```

**BFC 特性**
1. 内部盒子垂直排列
2. 盒子垂直方向的距离由 margin 决定，同一 BFC 内相邻盒子 margin 会折叠
3. BFC 区域不会与 float 元素重叠
4. 计算 BFC 高度时，浮动元素也参与
5. BFC 是一个独立容器，内外元素互不影响

**应用场景 1：清除浮动**
```html
<style>
/* ❌ 高度塌陷 */
.container {
  border: 2px solid;
}
.float {
  float: left;
  width: 100px;
  height: 100px;
}

/* ✅ 方案 1：overflow hack（副作用：可能裁切内容） */
.container {
  overflow: hidden;
}

/* ✅ 方案 2：display: flow-root（最佳，无副作用） */
.container {
  display: flow-root;
}

/* ✅ 方案 3：伪元素 clearfix（传统方案） */
.clearfix::after {
  content: '';
  display: block;
  clear: both;
}
</style>
```

**应用场景 2：防止 margin 塌陷**
```html
<style>
/* ❌ margin 塌陷：父子元素 margin 合并 */
.parent {
  background: lightblue;
}
.child {
  margin-top: 50px; /* 父元素也会向下移动 */
}

/* ✅ 触发 BFC */
.parent {
  display: flow-root; /* 或 overflow: hidden */
}
</style>
```

**应用场景 3：两栏自适应布局**
```html
<style>
.sidebar {
  float: left;
  width: 200px;
  background: lightblue;
}
.main {
  overflow: hidden; /* 触发 BFC，不被浮动覆盖 */
  background: lightcoral;
}
</style>

<div class="container">
  <aside class="sidebar">侧边栏</aside>
  <main class="main">主内容区域会自动填充剩余宽度</main>
</div>
```

**其他格式化上下文**
```css
/* IFC（Inline Formatting Context）*/
/* 内联元素排列，line-height、vertical-align 生效 */

/* FFC（Flex Formatting Context）*/
display: flex; /* justify-content、align-items 等生效 */

/* GFC（Grid Formatting Context）*/
display: grid; /* grid-template、grid-area 等生效 */
```

---

### 2.3 选择器优先级与特异性

**优先级规则**
```
!important > 内联样式 > ID选择器 > 类/属性/伪类 > 标签/伪元素 > 通配符
```

**特异性计算（Specificity）**
```
[a, b, c, d]

a: 内联样式（1 或 0）
b: ID 选择器数量
c: 类、属性、伪类数量
d: 标签、伪元素数量
```

**示例**
```css
/* [0, 0, 0, 1] */
p { }

/* [0, 0, 1, 1] */
p.class { }

/* [0, 1, 0, 0] */
#id { }

/* [0, 1, 2, 2] */
#nav .list li a:hover { }
/* ID:1, 类:1, 伪类:1, 标签:2 */

/* [0, 0, 0, 0]（但最后应用） */
:where(#id .class) { } /* :where() 特异性为 0 */

/* [0, 1, 2, 2] */
:is(#id .class) li a:hover { } /* :is() 取最高特异性 */
```

**常见陷阱**
```css
/* ❌ 以为会生效，实际被覆盖 */
.button {
  background: blue !important; /* [0, 0, 1, 0] + !important */
}

/* 后面的 !important 优先级更高（特异性相同时后者胜出） */
.btn {
  background: red !important; /* [0, 0, 1, 0] + !important */
}
```

**最佳实践**
```css
/* ❌ 避免过高特异性 */
#header nav ul li a { }

/* ✅ 降低特异性，使用类 */
.nav-link { }

/* ❌ 避免 !important */
.button {
  color: red !important;
}

/* ✅ 提高选择器特异性 */
.page .button {
  color: red;
}

/* ✅ 或使用 :where() 降低特异性 */
:where(#sidebar) .button {
  color: red; /* 特异性只有 [0, 0, 1, 0] */
}
```

---

### 2.4 盒模型

**标准盒模型 vs IE 盒模型**
```css
/* 标准盒模型（W3C）*/
.box {
  box-sizing: content-box; /* 默认 */
  width: 200px;
  padding: 20px;
  border: 5px solid;
}
/* 实际宽度 = 200 + 20*2 + 5*2 = 250px */

/* IE 盒模型（border-box）*/
.box {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 5px solid;
}
/* 实际宽度 = 200px（padding 和 border 包含在内）*/
```

**全局设置**
```css
/* 现代项目推荐 */
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

**margin 折叠（Collapsing Margins）**
```html
<style>
/* 场景 1：相邻兄弟元素 */
.box1 { margin-bottom: 30px; }
.box2 { margin-top: 20px; }
/* 实际间距：30px（取最大值，不是 50px） */

/* 场景 2：父子元素（无边界） */
.parent { margin-top: 20px; }
.child { margin-top: 30px; }
/* 父元素会向下移动 30px（取最大值） */

/* 解决方案 */
.parent {
  /* 方案 1 */
  border-top: 1px solid transparent;
  /* 方案 2 */
  padding-top: 1px;
  /* 方案 3 */
  overflow: hidden; /* 触发 BFC */
}

/* 场景 3：空元素 */
.empty {
  margin-top: 20px;
  margin-bottom: 30px;
}
/* 自身 margin 会折叠成 30px */
</style>
```

---

### 2.5 继承与初始值

**可继承的属性**
```css
/* 文本相关 */
font-family, font-size, font-weight, font-style
line-height, letter-spacing, word-spacing
text-align, text-indent, text-transform
white-space, color

/* 列表 */
list-style, list-style-type, list-style-position

/* 表格 */
border-collapse, border-spacing

/* 光标 */
cursor

/* 可见性 */
visibility
```

**不可继承的属性**
```css
/* 大部分盒模型属性 */
width, height, margin, padding, border
display, position, float
overflow, background
```

**控制继承**
```css
.child {
  color: inherit;    /* 继承父元素的值 */
  color: initial;    /* 重置为 CSS 规范的初始值 */
  color: unset;      /* 可继承则 inherit，否则 initial */
  color: revert;     /* 重置为浏览器默认样式 */
  
  /* CSS4 */
  all: unset;        /* 重置所有属性 */
}
```

---

## 三、布局体系完全指南

### 3.1 Flexbox 深度解析

**容器属性**
```css
.container {
  display: flex; /* 或 inline-flex */
  
  /* 主轴方向 */
  flex-direction: row | row-reverse | column | column-reverse;
  
  /* 换行 */
  flex-wrap: nowrap | wrap | wrap-reverse;
  
  /* 简写：flex-direction + flex-wrap */
  flex-flow: row wrap;
  
  /* 主轴对齐 */
  justify-content: flex-start | flex-end | center | space-between | space-around | space-evenly;
  
  /* 交叉轴对齐 */
  align-items: flex-start | flex-end | center | baseline | stretch;
  
  /* 多行对齐 */
  align-content: flex-start | flex-end | center | space-between | space-around | stretch;
  
  /* 间距（CSS3）*/
  gap: 20px; /* row-gap + column-gap */
  row-gap: 10px;
  column-gap: 20px;
}
```

**子项属性**
```css
.item {
  /* 排序 */
  order: 0; /* 默认 0，数值越小越靠前 */
  
  /* 放大比例 */
  flex-grow: 0; /* 默认 0，不放大 */
  
  /* 缩小比例 */
  flex-shrink: 1; /* 默认 1，空间不足时缩小 */
  
  /* 基础尺寸 */
  flex-basis: auto; /* 默认 auto，可设置 px/%/em 等 */
  
  /* 简写：flex-grow flex-shrink flex-basis */
  flex: 1; /* = 1 1 0% */
  flex: auto; /* = 1 1 auto */
  flex: none; /* = 0 0 auto */
  
  /* 单独对齐 */
  align-self: auto | flex-start | flex-end | center | baseline | stretch;
}
```

**flex 简写详解**
```css
/* 默认值 */
flex: 0 1 auto;
/* flex-grow: 0 不放大 */
/* flex-shrink: 1 空间不足时缩小 */
/* flex-basis: auto 基于内容宽度 */

/* 单值语法 */
flex: 1; /* = 1 1 0% */
flex: 200px; /* = 1 1 200px */
flex: auto; /* = 1 1 auto */
flex: none; /* = 0 0 auto */

/* 双值语法 */
flex: 1 2; /* grow shrink, basis 为 0% */
flex: 1 200px; /* grow basis, shrink 为 1 */

/* 三值语法 */
flex: 1 2 200px; /* grow shrink basis */
```

**常见布局场景**

**1. 垂直水平居中**
```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
```

**2. 自适应导航**
```css
.nav {
  display: flex;
  gap: 20px;
}
.nav-item {
  flex: none; /* 固定尺寸 */
}
.nav-spacer {
  flex: 1; /* 占据剩余空间 */
}
```

**3. 圣杯布局**
```css
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.header,
.footer {
  flex: none; /* 固定高度 */
}
.main {
  flex: 1; /* 占据剩余高度 */
}
```

**4. 等分列**
```css
.row {
  display: flex;
  gap: 20px;
}
.col {
  flex: 1; /* 等分 */
}
```

**5. 比例列**
```css
.row {
  display: flex;
}
.col-1 { flex: 1; }
.col-2 { flex: 2; }
.col-3 { flex: 3; }
/* 比例 1:2:3 */
```

**Flexbox 陷阱与技巧**

**陷阱 1：min-width 问题**
```css
/* ❌ flex 子项不会缩小到比内容更小 */
.item {
  flex: 1;
  /* 默认 min-width: auto（内容宽度） */
}

/* ✅ 允许缩小 */
.item {
  flex: 1;
  min-width: 0;
}
```

**陷阱 2：flex-basis vs width**
```css
.item {
  flex-basis: 200px;
  width: 100px;
}
/* flex-basis 优先级更高，实际宽度基于 200px */
```

**技巧：最后一行左对齐**
```css
.container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
/* 在容器末尾添加空元素占位 */
.container::after {
  content: '';
  flex: auto;
}
```

---

### 3.2 Grid 布局完全指南

**容器属性**
```css
.container {
  display: grid; /* 或 inline-grid */
  
  /* 定义列 */
  grid-template-columns: 200px 1fr 2fr;
  grid-template-columns: repeat(3, 1fr);
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  
  /* 定义行 */
  grid-template-rows: 100px auto 100px;
  
  /* 定义区域 */
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
  
  /* 简写 */
  grid-template: rows / columns;
  
  /* 间距 */
  gap: 20px; /* row-gap + column-gap */
  row-gap: 10px;
  column-gap: 20px;
  
  /* 隐式网格 */
  grid-auto-rows: 100px;
  grid-auto-columns: 1fr;
  grid-auto-flow: row | column | dense;
  
  /* 对齐 */
  justify-items: start | end | center | stretch;
  align-items: start | end | center | stretch;
  justify-content: start | end | center | stretch | space-between | space-around | space-evenly;
  align-content: start | end | center | stretch | space-between | space-around | space-evenly;
  
  /* 简写 */
  place-items: align-items justify-items;
  place-content: align-content justify-content;
}
```

**子项属性**
```css
.item {
  /* 列位置 */
  grid-column-start: 1;
  grid-column-end: 3; /* 或 span 2 */
  grid-column: 1 / 3; /* 简写 */
  
  /* 行位置 */
  grid-row-start: 1;
  grid-row-end: 3;
  grid-row: 1 / 3;
  
  /* 区域 */
  grid-area: header; /* 使用命名区域 */
  grid-area: 1 / 1 / 3 / 3; /* row-start / col-start / row-end / col-end */
  
  /* 单独对齐 */
  justify-self: start | end | center | stretch;
  align-self: start | end | center | stretch;
  place-self: align-self justify-self;
}
```

**Grid 单位**
```css
/* fr（fraction，剩余空间的份数）*/
grid-template-columns: 1fr 2fr; /* 1:2 分配剩余空间 */

/* minmax() */
grid-template-columns: minmax(100px, 1fr); /* 最小 100px，最大 1fr */

/* auto */
grid-template-columns: auto 1fr auto; /* 基于内容自动调整 */

/* fit-content() */
grid-template-columns: fit-content(200px); /* 最大 200px，内容不足时收缩 */

/* repeat() */
grid-template-columns: repeat(3, 1fr); /* 重复 3 次 */

/* auto-fill vs auto-fit */
/* auto-fill：尽可能多列，空列保留 */
grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

/* auto-fit：尽可能多列，空列折叠 */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
```

**常见布局场景**

**1. 12 列栅格系统**
```css
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
}
.col-6 {
  grid-column: span 6;
}
.col-4 {
  grid-column: span 4;
}
```

**2. 圣杯布局**
```css
.layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}
.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }
```

**3. 响应式卡片（无媒体查询）**
```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}
/* 自动适配列数，无需 @media */
```

**4. 瀑布流布局**
```css
.masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-auto-rows: 10px; /* 小单元行高 */
  gap: 10px;
}
.item {
  grid-row-end: span 30; /* 占据多行 */
}

/* 或使用 CSS Grid Level 3（实验性）*/
.masonry {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: masonry; /* 自动瀑布流 */
}
```

**5. 居中布局**
```css
.container {
  display: grid;
  place-items: center; /* = align-items: center + justify-items: center */
  min-height: 100vh;
}
```

**Grid vs Flexbox 选择**

| 场景 | 推荐 |
|------|------|
| 一维布局（行或列） | Flexbox |
| 二维布局（行和列） | Grid |
| 内容驱动（大小由内容决定） | Flexbox |
| 布局驱动（固定网格结构） | Grid |
| 动态数量的子项 | Flexbox |
| 复杂对齐需求 | Grid |
| 响应式卡片网格 | Grid |
| 导航栏 | Flexbox |

---

### 3.3 定位（Position）

**定位类型**
```css
/* static（默认）*/
position: static; /* 不受 top/right/bottom/left 影响 */

/* relative（相对定位）*/
position: relative;
top: 10px; /* 相对自身原位置偏移 */
/* 不脱离文档流，原位置保留 */

/* absolute（绝对定位）*/
position: absolute;
top: 0;
left: 0;
/* 相对最近的非 static 祖先定位 */
/* 脱离文档流 */

/* fixed（固定定位）*/
position: fixed;
bottom: 20px;
right: 20px;
/* 相对视口定位 */
/* 脱离文档流 */

/* sticky（粘性定位）*/
position: sticky;
top: 0;
/* 滚动到阈值前 relative，到达后 fixed */
/* 不脱离文档流 */
```

**定位基准点**
```html
<style>
.parent {
  position: relative; /* 设置为定位基准点 */
}
.child {
  position: absolute;
  top: 0;
  left: 0; /* 相对 .parent 定位 */
}
</style>
```

**居中技巧**
```css
/* 方案 1：50% + transform */
.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 方案 2：inset + margin auto */
.center {
  position: absolute;
  inset: 0; /* = top:0 right:0 bottom:0 left:0 */
  margin: auto;
  width: 200px;
  height: 100px;
}
```

**sticky 实战**
```css
/* 粘性导航 */
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
}

/* 表格头部固定 */
thead th {
  position: sticky;
  top: 0;
  background: white;
}
```

**sticky 失效原因**
1. 父元素设置了 `overflow: hidden/auto/scroll`
2. 父元素高度不够（sticky 元素无滚动空间）
3. 未设置 top/bottom/left/right
4. 父元素使用了 flex/grid 布局（部分浏览器）

---

### 3.4 浮动（Float）

**基本用法**
```css
.float-left {
  float: left;
}
.float-right {
  float: right;
}
.float-none {
  float: none; /* 默认 */
}
```

**清除浮动**
```css
/* 方法 1：clear */
.clearfix {
  clear: both; /* 清除左右两侧浮动 */
}

/* 方法 2：伪元素（最常用）*/
.clearfix::after {
  content: '';
  display: block;
  clear: both;
}

/* 方法 3：触发 BFC */
.container {
  overflow: hidden;
  /* 或 display: flow-root; */
}
```

**浮动布局实战**
```css
/* 文字环绕图片 */
img {
  float: left;
  margin-right: 20px;
}

/* 两栏布局 */
.sidebar {
  float: left;
  width: 200px;
}
.main {
  margin-left: 220px; /* 或触发 BFC */
}

/* 三栏布局（圣杯/双飞翼）*/
/* 见前文 */
```

**现代替代**：Flexbox/Grid 已完全替代浮动布局，仅用于文字环绕等场景

---

## 四、CSS 架构与工程化

### 4.1 CSS 方法论对比

#### BEM（Block Element Modifier）

**命名规则**
```css
/* Block（块） */
.card { }

/* Element（元素） */
.card__header { }
.card__body { }
.card__footer { }

/* Modifier（修饰符） */
.card--featured { }
.card__header--large { }
```

**实战示例**
```html
<div class="card card--featured">
  <div class="card__header card__header--large">
    <h3 class="card__title">标题</h3>
  </div>
  <div class="card__body">内容</div>
  <div class="card__footer">
    <button class="card__button card__button--primary">按钮</button>
  </div>
</div>
```

**优点**
- 命名语义清晰
- 避免样式冲突
- 易于维护

**缺点**
- 类名冗长
- HTML 膨胀

---

#### OOCSS（Object Oriented CSS）

**原则**
1. 分离结构和皮肤
2. 分离容器和内容

**示例**
```css
/* ❌ 耦合的写法 */
.sidebar .button {
  padding: 10px;
  background: blue;
  color: white;
}

/* ✅ OOCSS */
/* 结构 */
.button {
  padding: 10px;
}
/* 皮肤 */
.button-primary {
  background: blue;
  color: white;
}
/* 容器无关 */
```

---

#### SMACSS（Scalable and Modular Architecture for CSS）

**分类**
```css
/* Base（基础）*/
html, body, a { }

/* Layout（布局）*/
.l-header { }
.l-sidebar { }

/* Module（模块）*/
.card { }
.nav { }

/* State（状态）*/
.is-active { }
.is-disabled { }

/* Theme（主题）*/
.theme-dark { }
```

---

#### Atomic CSS（原子化 CSS）

**理念**：一个类只做一件事

**示例（Tailwind CSS）**
```html
<div class="flex items-center justify-between p-4 bg-white rounded shadow">
  <h3 class="text-lg font-bold">标题</h3>
  <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    按钮
  </button>
</div>
```

**优点**
- CSS 体积可控（样式复用率高）
- 不需要命名（提高开发效率）
- 样式和结构在一处（易于维护）

**缺点**
- HTML 膨胀
- 学习成本（记忆类名）
- 语义化不足

---

### 4.2 CSS Modules

**原理**：自动生成唯一类名，实现局部作用域

**示例**
```css
/* styles.module.css */
.button {
  padding: 10px;
  background: blue;
}

.primary {
  background: green;
}
```

```javascript
// React
import styles from './styles.module.css';

<button className={styles.button}>按钮</button>
<button className={`${styles.button} ${styles.primary}`}>主按钮</button>
```

**生成的 HTML**
```html
<button class="styles__button___3k2j1">按钮</button>
```

**组合（Composes）**
```css
/* base.module.css */
.button {
  padding: 10px;
  border: none;
  cursor: pointer;
}

/* styles.module.css */
.primary {
  composes: button from './base.module.css';
  background: blue;
  color: white;
}
```

**全局样式**
```css
:global(.legacy-class) {
  color: red;
}

/* 或 */
.button :global(.icon) {
  margin-right: 5px;
}
```

---

### 4.3 CSS-in-JS

**方案对比**

| 方案 | 运行时 | 样式提取 | 性能 |
|------|--------|----------|------|
| **styled-components** | ✅ | ❌ | 中 |
| **Emotion** | ✅ | ✅ | 中 |
| **Linaria** | ❌ | ✅ | 高 |
| **Vanilla Extract** | ❌ | ✅ | 高 |

**styled-components 示例**
```javascript
import styled from 'styled-components';

const Button = styled.button`
  padding: 10px 20px;
  background: ${props => props.primary ? 'blue' : 'gray'};
  color: white;
  border: none;
  cursor: pointer;
  
  &:hover {
    opacity: 0.8;
  }
`;

<Button primary>主按钮</Button>
```

**动态样式**
```javascript
const Box = styled.div`
  width: ${props => props.size}px;
  background: ${props => props.theme.primaryColor};
`;

// 主题
import { ThemeProvider } from 'styled-components';

<ThemeProvider theme={{ primaryColor: 'blue' }}>
  <Box size={200} />
</ThemeProvider>
```

**优点**
- 动态样式能力强
- 自动作用域隔离
- 主题切换方便
- TypeScript 支持好

**缺点**
- 运行时开销（styled-components/Emotion）
- 调试困难（类名自动生成）
- SSR 配置复杂

---

### 4.4 样式隔离方案

#### Shadow DOM

```javascript
class MyCard extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 20px;
        }
        .title {
          color: blue;
        }
      </style>
      <div class="card">
        <h3 class="title">标题</h3>
        <slot></slot>
      </div>
    `;
  }
}
customElements.define('my-card', MyCard);
```

**特点**
- 完全隔离（外部样式不影响内部）
- 原生支持
- 配合 Web Components 使用

---

#### CSS Layers（@layer）

```css
/* 定义层级顺序 */
@layer base, components, utilities;

@layer base {
  h1 { font-size: 2em; }
}

@layer components {
  .button { padding: 10px; }
}

@layer utilities {
  .text-center { text-align: center; }
}

/* utilities 优先级最高，无需提高选择器权重 */
```

**解决问题**
- 控制优先级，无需 `!important`
- 框架样式和业务样式分层
- 第三方库样式隔离

---

### 4.5 PostCSS 与插件生态

**常用插件**
```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),           // 自动添加浏览器前缀
    require('postcss-preset-env'),     // 使用未来 CSS 特性
    require('postcss-nested'),         // 嵌套语法
    require('cssnano'),                // 压缩
    require('postcss-pxtorem'),        // px 转 rem
  ]
};
```

**autoprefixer**
```css
/* 输入 */
.box {
  display: flex;
  user-select: none;
}

/* 输出 */
.box {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
```

---

## 五、动画与交互

### 5.1 Transition（过渡）

**语法**
```css
.box {
  transition: property duration timing-function delay;
  
  /* 示例 */
  transition: all 0.3s ease 0s;
  transition: opacity 0.3s, transform 0.3s;
}
```

**属性**
```css
transition-property: all | none | width, height, ...;
transition-duration: 0.3s;
transition-timing-function: ease | linear | ease-in | ease-out | ease-in-out | cubic-bezier(0.1, 0.7, 1.0, 0.1);
transition-delay: 0s;
```

**实战示例**
```css
/* 按钮悬停 */
.button {
  background: blue;
  transition: background 0.3s;
}
.button:hover {
  background: darkblue;
}

/* 卡片缩放 */
.card {
  transition: transform 0.3s;
}
.card:hover {
  transform: scale(1.05);
}

/* 淡入淡出 */
.modal {
  opacity: 0;
  transition: opacity 0.3s;
}
.modal.show {
  opacity: 1;
}
```

**性能优化**
```css
/* ❌ 触发 Layout */
.box {
  transition: width 0.3s;
}

/* ✅ 只触发 Composite */
.box {
  transition: transform 0.3s;
}
```

---

### 5.2 Animation（动画）

**定义动画**
```css
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 或使用百分比 */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}
```

**使用动画**
```css
.box {
  animation: fade-in 0.5s ease-out;
  
  /* 完整语法 */
  animation-name: fade-in;
  animation-duration: 0.5s;
  animation-timing-function: ease-out;
  animation-delay: 0s;
  animation-iteration-count: 1; /* 或 infinite */
  animation-direction: normal; /* normal | reverse | alternate | alternate-reverse */
  animation-fill-mode: forwards; /* none | forwards | backwards | both */
  animation-play-state: running; /* running | paused */
}
```

**实战动画**

**1. 加载动画**
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

**2. 脉冲效果**
```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}

.pulsing {
  animation: pulse 2s ease-in-out infinite;
}
```

**3. 打字机效果**
```css
@keyframes typing {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes blink {
  50% { border-color: transparent; }
}

.typewriter {
  width: 0;
  white-space: nowrap;
  overflow: hidden;
  border-right: 2px solid;
  animation: 
    typing 3s steps(30) forwards,
    blink 0.5s step-end infinite;
}
```

---

### 5.3 缓动函数（Easing）

**预设**
```css
ease;          /* cubic-bezier(0.25, 0.1, 0.25, 1) */
linear;        /* cubic-bezier(0, 0, 1, 1) */
ease-in;       /* cubic-bezier(0.42, 0, 1, 1) */
ease-out;      /* cubic-bezier(0, 0, 0.58, 1) */
ease-in-out;   /* cubic-bezier(0.42, 0, 0.58, 1) */
```

**自定义（cubic-bezier）**
```css
/* 工具：https://cubic-bezier.com/ */
transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55); /* 回弹效果 */
```

**steps（逐帧动画）**
```css
@keyframes sprite {
  to { background-position: -1000px 0; }
}

.sprite {
  animation: sprite 1s steps(10) infinite;
  /* 将动画分成 10 帧 */
}
```

---

### 5.4 高级动画技巧

**动画暂停/播放**
```css
.box {
  animation: spin 2s linear infinite;
  animation-play-state: paused;
}
.box:hover {
  animation-play-state: running;
}
```

**动画延迟（级联效果）**
```css
.item:nth-child(1) { animation-delay: 0s; }
.item:nth-child(2) { animation-delay: 0.1s; }
.item:nth-child(3) { animation-delay: 0.2s; }

/* 或用 calc */
.item {
  animation: fade-in 0.5s;
  animation-delay: calc(var(--index) * 0.1s);
}
```

**监听动画事件（JavaScript）**
```javascript
element.addEventListener('animationstart', (e) => {
  console.log('动画开始', e.animationName);
});

element.addEventListener('animationend', (e) => {
  console.log('动画结束');
  element.remove(); // 动画完成后移除元素
});

element.addEventListener('animationiteration', (e) => {
  console.log('动画循环');
});
```

---

### 5.5 硬件加速

**触发 GPU 加速**
```css
/* 方法 1：transform 3D */
.box {
  transform: translateZ(0); /* 或 translate3d(0, 0, 0) */
}

/* 方法 2：will-change */
.box {
  will-change: transform;
}

/* 方法 3：backface-visibility */
.box {
  backface-visibility: hidden;
}
```

**注意事项**
1. 不要滥用（每个层占用内存）
2. 动画结束后清理 `will-change`
3. 移动端谨慎使用（内存有限）

---

## 六、响应式设计与移动端

### 6.1 媒体查询（Media Queries）

**语法**
```css
@media [media-type] and (condition) {
  /* styles */
}
```

**媒体类型**
```css
@media screen { } /* 屏幕 */
@media print { }  /* 打印 */
@media speech { } /* 屏幕阅读器 */
@media all { }    /* 所有（默认）*/
```

**常用断点**
```css
/* 移动端优先（Mobile First）*/
/* xs: 0-575px */
.container { width: 100%; }

/* sm: 576px+ */
@media (min-width: 576px) {
  .container { max-width: 540px; }
}

/* md: 768px+ */
@media (min-width: 768px) {
  .container { max-width: 720px; }
}

/* lg: 992px+ */
@media (min-width: 992px) {
  .container { max-width: 960px; }
}

/* xl: 1200px+ */
@media (min-width: 1200px) {
  .container { max-width: 1140px; }
}

/* xxl: 1400px+ */
@media (min-width: 1400px) {
  .container { max-width: 1320px; }
}
```

**条件组合**
```css
/* AND */
@media (min-width: 768px) and (max-width: 1024px) { }

/* OR */
@media (max-width: 768px), (orientation: portrait) { }

/* NOT */
@media not screen and (color) { }

/* ONLY（兼容旧浏览器）*/
@media only screen and (min-width: 768px) { }
```

**特性查询**
```css
/* 宽度 */
@media (min-width: 768px) { }
@media (max-width: 768px) { }
@media (width >= 768px) { } /* CSS4 范围语法 */

/* 高度 */
@media (min-height: 600px) { }

/* 方向 */
@media (orientation: portrait) { }  /* 竖屏 */
@media (orientation: landscape) { } /* 横屏 */

/* 像素比（Retina 屏）*/
@media (-webkit-min-device-pixel-ratio: 2),
       (min-resolution: 192dpi) { }

/* 宽高比 */
@media (aspect-ratio: 16/9) { }

/* 颜色 */
@media (min-color: 8) { }

/* 指针设备 */
@media (hover: hover) { } /* 支持悬停（非触摸屏）*/
@media (pointer: coarse) { } /* 粗糙指针（触摸屏）*/
@media (pointer: fine) { } /* 精确指针（鼠标）*/

/* 深色模式 */
@media (prefers-color-scheme: dark) { }
@media (prefers-color-scheme: light) { }

/* 减少动画 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

---

### 6.2 响应式布局技巧

**Flexbox 响应式**
```css
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.col {
  flex: 1 1 300px; /* 最小 300px，自动换行 */
}
```

**Grid 响应式（无媒体查询）**
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}
```

**Clamp（流式排版）**
```css
/* clamp(min, preferred, max) */
h1 {
  font-size: clamp(1.5rem, 5vw, 3rem);
  /* 最小 1.5rem，最大 3rem，中间按视口宽度缩放 */
}

.container {
  width: clamp(300px, 90%, 1200px);
}
```

---

### 6.3 移动端适配方案

#### 方案 1：Viewport 单位

```css
.box {
  width: 50vw;   /* 50% 视口宽度 */
  height: 50vh;  /* 50% 视口高度 */
  font-size: 5vw;
}
```

**问题**：iOS Safari 的 100vh 包含地址栏高度

**解决**：使用 `dvh`（dynamic viewport height）
```css
.fullscreen {
  height: 100dvh; /* CSS4，动态视口高度 */
}

/* 或 JavaScript */
document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
.fullscreen {
  height: calc(var(--vh) * 100);
}
```

---

#### 方案 2：rem（基于根字体）

```javascript
// 根据屏幕宽度设置根字体大小
(function() {
  const baseWidth = 375; // 设计稿宽度
  const baseFontSize = 16;
  
  function setRem() {
    const scale = document.documentElement.clientWidth / baseWidth;
    document.documentElement.style.fontSize = baseFontSize * scale + 'px';
  }
  
  setRem();
  window.addEventListener('resize', setRem);
})();
```

```css
/* 设计稿 100px */
.box {
  width: 6.25rem; /* 100 / 16 */
}
```

**PostCSS 自动转换**
```javascript
// postcss-pxtorem
module.exports = {
  plugins: [
    require('postcss-pxtorem')({
      rootValue: 16,
      propList: ['*'],
      selectorBlackList: ['.no-rem'], /* 排除 */
    })
  ]
};
```

---

#### 方案 3：vw（纯 CSS）

```css
/* 设计稿 375px */
.box {
  width: 26.67vw; /* 100 / 375 * 100 */
}
```

**PostCSS 自动转换**
```javascript
// postcss-px-to-viewport
module.exports = {
  plugins: [
    require('postcss-px-to-viewport')({
      viewportWidth: 375,
      unitPrecision: 5,
      viewportUnit: 'vw',
    })
  ]
};
```

---

### 6.4 移动端常见问题

**1. 1px 边框**
```css
/* 方案 1：伪元素 + scale */
.border::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: #e5e5e5;
  transform: scaleY(0.5);
  transform-origin: 0 0;
}

/* 四边边框 */
.border::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px solid #e5e5e5;
  transform: scale(0.5);
  transform-origin: 0 0;
  width: 200%;
  height: 200%;
  box-sizing: border-box;
  pointer-events: none;
}

/* 方案 2：媒体查询 */
.border {
  border: 1px solid #e5e5e5;
}
@media (-webkit-min-device-pixel-ratio: 2) {
  .border {
    border-width: 0.5px;
  }
}

/* 方案 3：SVG */
.border {
  border: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='1'%3E%3Cline x1='0' y1='0' x2='100%25' y2='0' stroke='%23e5e5e5'/%3E%3C/svg%3E");
  background-repeat: repeat-x;
  background-position: bottom;
}
```

**2. 点击延迟（300ms）**
```html
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
```
```css
a, button {
  touch-action: manipulation; /* 禁用双击缩放 */
}
```

**3. 滚动不流畅**
```css
.scroll-container {
  -webkit-overflow-scrolling: touch; /* iOS 弹性滚动 */
}
```

**4. 输入框被键盘遮挡**
```javascript
// iOS
window.addEventListener('resize', () => {
  if (document.activeElement.tagName === 'INPUT') {
    document.activeElement.scrollIntoView({ block: 'center' });
  }
});
```

**5. 安全区域适配（刘海屏）**
```html
<meta name="viewport" content="viewport-fit=cover">
```
```css
.header {
  padding-top: env(safe-area-inset-top);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

.footer {
  padding-bottom: env(safe-area-inset-bottom);
}

/* 或使用 max() */
.footer {
  padding-bottom: max(20px, env(safe-area-inset-bottom));
}
```

---

## 七、现代 CSS 特性

### 7.1 CSS Variables（自定义属性）

**定义和使用**
```css
:root {
  --primary-color: #007bff;
  --spacing: 8px;
  --font-size-large: 1.5rem;
}

.button {
  background: var(--primary-color);
  padding: calc(var(--spacing) * 2);
  font-size: var(--font-size-large);
}

/* 后备值 */
.box {
  color: var(--text-color, #333); /* 如果 --text-color 未定义，使用 #333 */
}
```

**作用域**
```css
:root {
  --color: blue;
}

.card {
  --color: red; /* 覆盖全局变量 */
}

.card .title {
  color: var(--color); /* red */
}
```

**动态主题切换**
```css
:root {
  --bg: white;
  --text: black;
}

[data-theme="dark"] {
  --bg: #1a1a1a;
  --text: white;
}

body {
  background: var(--bg);
  color: var(--text);
  transition: background 0.3s, color 0.3s;
}
```

```javascript
// 切换主题
document.documentElement.setAttribute('data-theme', 'dark');

// 动态修改变量
document.documentElement.style.setProperty('--primary-color', '#ff0000');

// 读取变量
getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
```

**响应式变量**
```css
:root {
  --spacing: 8px;
}

@media (min-width: 768px) {
  :root {
    --spacing: 16px;
  }
}

.box {
  padding: var(--spacing); /* 自动响应 */
}
```

---

### 7.2 容器查询（@container）

**基于父容器而非视口**
```css
.card-container {
  container-type: inline-size; /* 或 size / normal */
  /* container-name: card; */ /* 可选：命名容器 */
}

/* 当容器宽度 >= 400px 时 */
@container (min-width: 400px) {
  .card {
    display: flex;
  }
  
  .card img {
    width: 200px;
  }
}

/* 命名容器 */
.sidebar {
  container-name: sidebar;
  container-type: inline-size;
}

@container sidebar (max-width: 300px) {
  .widget {
    font-size: 14px;
  }
}
```

**容器查询单位**
```css
@container (min-width: 400px) {
  .card {
    /* cqw: 1% 容器宽度 */
    /* cqh: 1% 容器高度 */
    padding: 2cqw;
    font-size: 5cqw;
  }
}
```

---

### 7.3 逻辑属性（Logical Properties）

**国际化友好（自动适配 RTL）**
```css
/* 传统物理属性 */
margin-left: 20px;
padding-right: 10px;
border-left: 1px solid;

/* 逻辑属性 */
margin-inline-start: 20px;   /* LTR: left, RTL: right */
padding-inline-end: 10px;    /* LTR: right, RTL: left */
border-inline-start: 1px solid;

/* 块级方向（垂直）*/
margin-block-start: 20px;    /* top */
margin-block-end: 20px;      /* bottom */
padding-block: 10px 20px;    /* top bottom */

/* 内联方向（水平）*/
margin-inline: 10px 20px;    /* start end */
padding-inline-start: 10px;  /* start */

/* 尺寸 */
inline-size: 200px;          /* width */
block-size: 100px;           /* height */
max-inline-size: 500px;      /* max-width */

/* 定位 */
inset-inline-start: 0;       /* left */
inset-inline-end: 0;         /* right */
inset-block-start: 0;        /* top */
inset-block-end: 0;          /* bottom */
inset: 0;                    /* top right bottom left */
inset-inline: 0;             /* start end */
inset-block: 0;              /* start end */
```

---

### 7.4 :is() 和 :where()

**:is()（匹配列表）**
```css
/* 传统写法 */
header a:hover,
main a:hover,
footer a:hover {
  color: red;
}

/* :is() 简化 */
:is(header, main, footer) a:hover {
  color: red;
}
```

**特异性**
```css
/* :is() 取参数中最高的特异性 */
:is(#id, .class) a { } /* [0, 1, 0, 1] (ID) */

/* :where() 特异性为 0 */
:where(#id, .class) a { } /* [0, 0, 0, 1] (只有 a) */
```

**实战用例**
```css
/* 任意层级的 disabled 按钮 */
:is(button, .btn):disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 表单元素聚焦 */
:is(input, textarea, select):focus {
  outline: 2px solid blue;
}

/* 降低特异性，方便覆盖 */
:where(.card) .title {
  font-size: 20px; /* 特异性只有 [0, 0, 1, 0] */
}
```

---

### 7.5 :has()（父选择器）

**选择包含特定子元素的父元素**
```css
/* 包含图片的卡片 */
.card:has(img) {
  display: grid;
  grid-template-columns: 200px 1fr;
}

/* 没有图片的卡片 */
.card:not(:has(img)) {
  display: block;
}

/* 包含 error 类的表单 */
form:has(.error) {
  border-color: red;
}

/* 紧邻的兄弟元素 */
h2:has(+ p) {
  margin-bottom: 0.5em;
}

/* 选择前一个兄弟 */
li:has(+ li:hover) {
  background: lightblue;
}
```

**实战用例**
```css
/* 表单验证 */
.form-group:has(input:invalid) {
  border-color: red;
}

.form-group:has(input:valid) {
  border-color: green;
}

/* 复选框样式 */
label:has(input[type="checkbox"]:checked) {
  font-weight: bold;
}

/* 空状态 */
.list:not(:has(li)) .empty-message {
  display: block;
}
```

---

### 7.6 CSS Nesting（嵌套）

**原生嵌套（CSS Nesting Module）**
```css
.card {
  padding: 20px;
  
  /* & 代表父选择器 */
  & .title {
    font-size: 24px;
  }
  
  & > .body {
    margin-top: 10px;
  }
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  
  &.featured {
    border: 2px solid gold;
  }
  
  @media (max-width: 768px) {
    & {
      padding: 10px;
    }
  }
}
```

**编译后**
```css
.card {
  padding: 20px;
}
.card .title {
  font-size: 24px;
}
.card > .body {
  margin-top: 10px;
}
.card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
.card.featured {
  border: 2px solid gold;
}
@media (max-width: 768px) {
  .card {
    padding: 10px;
  }
}
```

---

### 7.7 其他现代特性

**aspect-ratio（宽高比）**
```css
.video {
  aspect-ratio: 16 / 9; /* 宽高比 16:9 */
}

.square {
  aspect-ratio: 1; /* 正方形 */
}
```

**accent-color（强调色）**
```css
input[type="checkbox"],
input[type="radio"],
input[type="range"] {
  accent-color: #007bff;
}
```

**overscroll-behavior（滚动边界）**
```css
.modal {
  overscroll-behavior: contain; /* 阻止滚动链 */
}
```

**scroll-behavior（平滑滚动）**
```css
html {
  scroll-behavior: smooth;
}
```

**scroll-snap（滚动吸附）**
```css
.container {
  scroll-snap-type: x mandatory;
  overflow-x: scroll;
}

.item {
  scroll-snap-align: center;
}
```

---

## 八、CSS 预处理器与工具链

### 8.1 Sass/SCSS

**变量**
```scss
$primary-color: #007bff;
$spacing: 8px;

.button {
  background: $primary-color;
  padding: $spacing * 2;
}
```

**嵌套**
```scss
.nav {
  ul {
    list-style: none;
  }
  
  li {
    display: inline-block;
  }
  
  a {
    color: blue;
    
    &:hover {
      color: darkblue;
    }
  }
}
```

**Mixin（混入）**
```scss
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.box {
  @include flex-center;
}

/* 带参数 */
@mixin button($bg, $color: white) {
  background: $bg;
  color: $color;
  padding: 10px 20px;
}

.btn-primary {
  @include button(#007bff);
}
```

**函数**
```scss
@function strip-unit($value) {
  @return $value / ($value * 0 + 1);
}

@function rem($px) {
  @return #{strip-unit($px) / 16}rem;
}

.box {
  font-size: rem(24px); /* 1.5rem */
}
```

**继承（@extend）**
```scss
%button-base {
  padding: 10px;
  border: none;
  cursor: pointer;
}

.btn-primary {
  @extend %button-base;
  background: blue;
}

.btn-secondary {
  @extend %button-base;
  background: gray;
}
```

---

### 8.2 Less

**变量**
```less
@primary-color: #007bff;
@spacing: 8px;

.button {
  background: @primary-color;
  padding: @spacing * 2;
}
```

**Mixin**
```less
.flex-center() {
  display: flex;
  justify-content: center;
  align-items: center;
}

.box {
  .flex-center();
}

/* 带参数 */
.button(@bg, @color: white) {
  background: @bg;
  color: @color;
}

.btn {
  .button(#007bff);
}
```

---

### 8.3 工具链推荐

**Stylelint（代码检查）**
```javascript
// .stylelintrc.js
module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    'selector-class-pattern': '^[a-z][a-zA-Z0-9]+$', /* 驼峰命名 */
    'color-hex-length': 'short',
    'declaration-block-no-redundant-longhand-properties': true,
  }
};
```

**PurgeCSS（移除无用样式）**
```javascript
// purgecss.config.js
module.exports = {
  content: ['./src/**/*.html', './src/**/*.js'],
  css: ['./src/**/*.css'],
  safelist: ['safe-class'], /* 白名单 */
};
```

---

## 九、浏览器兼容性

### 9.1 前缀处理

**自动添加（Autoprefixer）**
```css
/* 输入 */
.box {
  display: flex;
  user-select: none;
}

/* 输出 */
.box {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
```

---

### 9.2 特性检测

**@supports（CSS 特性查询）**
```css
/* 检测 Grid 支持 */
@supports (display: grid) {
  .container {
    display: grid;
  }
}

/* 不支持时降级 */
@supports not (display: grid) {
  .container {
    display: flex;
  }
}

/* AND */
@supports (display: grid) and (gap: 20px) {
  .container {
    display: grid;
    gap: 20px;
  }
}

/* OR */
@supports (display: -webkit-box) or (display: flex) {
  .container {
    display: flex;
  }
}
```

**JavaScript 检测**
```javascript
// CSS 属性
if (CSS.supports('display', 'grid')) {
  console.log('支持 Grid');
}

// CSS 条件
if (CSS.supports('(display: grid) and (gap: 20px)')) {
  console.log('支持 Grid + gap');
}

// 特性检测
if ('IntersectionObserver' in window) {
  // 使用 IntersectionObserver
}
```

---

### 9.3 常见兼容性问题

**Flexbox（IE 10-11）**
```css
/* ❌ IE 不支持 */
.container {
  display: flex;
  gap: 20px; /* IE 不支持 gap */
}

/* ✅ 降级方案 */
.container {
  display: -ms-flexbox; /* IE 10 */
  display: flex;
}

.item {
  margin-right: 20px; /* 用 margin 代替 gap */
}

.item:last-child {
  margin-right: 0;
}
```

**Grid（IE 不支持）**
```css
/* 检测并降级 */
.container {
  display: flex; /* 降级方案 */
}

@supports (display: grid) {
  .container {
    display: grid;
  }
}
```

---

## 十、CSS 安全与最佳实践

### 10.1 CSS 注入防御

**避免用户输入直接进入样式**
```html
<!-- ❌ 危险 -->
<div style="background: {{user_input}}"></div>

<!-- ✅ 白名单验证 -->
<div class="{{validated_class}}"></div>
```

---

### 10.2 性能最佳实践

**1. 选择器性能**
```css
/* ❌ 慢：浏览器从右向左解析 */
* { }
div * { }
div > div > div > a { }
[href] { }

/* ✅ 快 */
.class { }
#id { }
.parent > .child { }
```

**2. 避免昂贵属性**
```css
/* ❌ 性能差 */
box-shadow: 0 0 50px 50px rgba(0,0,0,0.5);
filter: blur(10px);
border-radius: 50%;

/* ✅ 优化 */
/* 用伪元素隔离阴影 */
/* 用图片代替 blur */
/* 减小 blur 半径 */
```

**3. 减少重排重绘**
```javascript
// ❌ 触发多次重排
el.style.width = '100px';
el.style.height = '100px';
el.style.margin = '10px';

// ✅ 批量修改
el.style.cssText = 'width:100px; height:100px; margin:10px;';

// 或
el.classList.add('new-style');
```

---

## 十一、经典面试题详解

### 11.1 实现水平垂直居中（10 种方法）

```css
/* 1. Flexbox */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 2. Grid（最简洁）*/
.container {
  display: grid;
  place-items: center;
}

/* 3. 绝对定位 + transform */
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 4. 绝对定位 + margin auto */
.child {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 200px;
  height: 100px;
}

/* 5. 绝对定位 + calc */
.child {
  position: absolute;
  top: calc(50% - 50px);
  left: calc(50% - 100px);
  width: 200px;
  height: 100px;
}

/* 6. 表格布局 */
.container {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}

/* 7. line-height（单行文本）*/
.container {
  line-height: 200px;
  text-align: center;
}

/* 8. writing-mode */
.container {
  writing-mode: vertical-lr;
  text-align: center;
}
.child {
  writing-mode: horizontal-tb;
  display: inline-block;
}

/* 9. Grid（子项）*/
.child {
  margin: auto;
}
.container {
  display: grid;
}

/* 10. Flexbox（子项）*/
.child {
  margin: auto;
}
.container {
  display: flex;
}
```

---

### 11.2 实现三栏布局

**圣杯布局**
```html
<div class="container">
  <div class="main">main</div>
  <div class="left">left</div>
  <div class="right">right</div>
</div>

<style>
.container {
  padding: 0 200px; /* 为左右留空间 */
}

.main {
  float: left;
  width: 100%;
  background: lightblue;
}

.left {
  float: left;
  width: 200px;
  margin-left: -100%; /* 向左移动到行首 */
  position: relative;
  left: -200px; /* 移入左侧空间 */
  background: lightcoral;
}

.right {
  float: left;
  width: 200px;
  margin-left: -200px; /* 向左移动自身宽度 */
  position: relative;
  right: -200px; /* 移入右侧空间 */
  background: lightgreen;
}
</style>
```

**双飞翼布局**
```html
<div class="container">
  <div class="main-wrap">
    <div class="main">main</div>
  </div>
  <div class="left">left</div>
  <div class="right">right</div>
</div>

<style>
.main-wrap {
  float: left;
  width: 100%;
}

.main {
  margin: 0 200px; /* 内部 margin 代替外部 padding */
  background: lightblue;
}

.left {
  float: left;
  width: 200px;
  margin-left: -100%;
  background: lightcoral;
}

.right {
  float: left;
  width: 200px;
  margin-left: -200px;
  background: lightgreen;
}
</style>
```

**现代方案（Grid）**
```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
}
```

---

### 11.3 实现两列等高布局

```css
/* 方案 1：Flexbox */
.container {
  display: flex;
}
.left,
.right {
  flex: 1;
}

/* 方案 2：Grid */
.container {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

/* 方案 3：padding + 负 margin */
.container {
  overflow: hidden;
}
.col {
  float: left;
  width: 50%;
  padding-bottom: 9999px;
  margin-bottom: -9999px;
}

/* 方案 4：表格布局 */
.container {
  display: table;
}
.col {
  display: table-cell;
}
```

---

### 11.4 实现 Sticky Footer

```css
/* 方案 1：Flexbox */
body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main {
  flex: 1;
}

/* 方案 2：Grid */
body {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

/* 方案 3：calc */
.main {
  min-height: calc(100vh - 100px); /* 100px = header + footer */
}
```

---

## 十二、手写题与实战场景

### 12.1 实现三角形

```css
/* 上三角 */
.triangle-up {
  width: 0;
  height: 0;
  border-left: 50px solid transparent;
  border-right: 50px solid transparent;
  border-bottom: 50px solid blue;
}

/* 右三角 */
.triangle-right {
  width: 0;
  height: 0;
  border-top: 50px solid transparent;
  border-bottom: 50px solid transparent;
  border-left: 50px solid blue;
}
```

---

### 12.2 实现扇形

```css
.sector {
  width: 0;
  height: 0;
  border: 100px solid transparent;
  border-top-color: blue;
  border-radius: 50%;
}
```

---

### 12.3 实现对话框气泡

```css
.bubble {
  position: relative;
  padding: 10px;
  background: lightblue;
  border-radius: 8px;
}

.bubble::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 20px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid lightblue;
}
```

---

### 12.4 实现进度条

```html
<div class="progress-bar">
  <div class="progress" style="width: 60%"></div>
</div>

<style>
.progress-bar {
  width: 100%;
  height: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  transition: width 0.3s;
}
</style>
```

---

### 12.5 实现骨架屏

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  to {
    background-position: -200% 0;
  }
}
```

---

## 十三、高频面试问答

### Q1：CSS 选择器有哪些？优先级如何？

**选择器类型**
- 基础：`*` `div` `.class` `#id`
- 关系：`>` `+` `~` ` `（空格）
- 属性：`[attr]` `[attr=value]` `[attr^=value]` `[attr$=value]` `[attr*=value]`
- 伪类：`:hover` `:focus` `:nth-child()` `:not()`
- 伪元素：`::before` `::after` `::first-line`

**优先级**：`!important > 内联 > ID > 类 > 标签 > *`

**特异性计算**：`[a, b, c, d]`（详见前文）

---

### Q2：说说盒模型

**标准盒模型**：`width` = 内容宽度  
**IE 盒模型**：`width` = 内容 + padding + border

**切换**：`box-sizing: content-box | border-box`

**最佳实践**：全局设置 `box-sizing: border-box`

---

### Q3：BFC 是什么？如何触发？有什么作用？

**定义**：Block Formatting Context，独立的渲染区域

**触发条件**：
- `overflow: hidden/auto/scroll`
- `display: flow-root/flex/grid/inline-block`
- `float: left/right`
- `position: absolute/fixed`

**作用**：
1. 清除浮动
2. 防止 margin 塌陷
3. 阻止元素被浮动元素覆盖

---

### Q4：层叠上下文是什么？

**定义**：元素在 Z 轴上的层叠顺序

**创建条件**：
- `position` + `z-index` 非 auto
- `opacity < 1`
- `transform/filter/perspective` 不为 none
- `isolation: isolate`
- flex/grid 子项 + z-index

**层叠顺序**：（详见前文）

---

### Q5：Flex 布局的原理？flex: 1 是什么意思？

**原理**：一维布局，基于主轴和交叉轴

**flex: 1** = `flex-grow: 1` + `flex-shrink: 1` + `flex-basis: 0%`

**含义**：平分剩余空间

---

### Q6：Grid 和 Flexbox 的区别？

| 维度 | Flexbox | Grid |
|------|---------|------|
| 布局方向 | 一维（行或列） | 二维（行和列） |
| 驱动方式 | 内容驱动 | 布局驱动 |
| 适用场景 | 导航栏、工具栏 | 页面整体布局、卡片网格 |

---

### Q7：重排（reflow）和重绘（repaint）的区别？

**重排**：改变几何属性（width, height, position），重新计算布局  
**重绘**：改变视觉属性（color, background），重新绘制像素  
**性能**：重排 > 重绘 > 合成

**优化**：用 `transform/opacity` 代替 `width/height/left/top`

---

### Q8：如何实现响应式设计？

1. 媒体查询（@media）
2. Flexbox/Grid 弹性布局
3. 相对单位（rem, em, %, vw/vh）
4. clamp() 流式排版
5. 容器查询（@container）
6. 图片响应式（srcset, picture）

---

### Q9：CSS 性能优化有哪些？

1. 减少选择器复杂度
2. 避免昂贵属性（box-shadow, filter）
3. 用 transform/opacity 做动画
4. 关键 CSS 内联
5. 异步加载非关键 CSS
6. PurgeCSS 移除无用样式
7. CSS Containment（contain）
8. content-visibility

---

### Q10：移动端 1px 问题如何解决？

1. 伪元素 + scale(0.5)
2. SVG border
3. 媒体查询设置 0.5px
4. border-image

（详见前文）

---

## 面试准备策略

### 1. 知识体系（按重要性）

**必须掌握（★★★）**
- 盒模型、BFC、层叠上下文
- Flexbox、Grid 布局
- 定位（position）
- 选择器优先级
- 重排/重绘/合成
- 响应式设计

**重要（★★）**
- CSS 架构（BEM, CSS Modules）
- 动画（transition, animation）
- 预处理器（Sass）
- 性能优化
- 移动端适配

**加分项（★）**
- 现代 CSS 特性（容器查询, :has(), CSS Layers）
- CSS Houdini
- 工程化实践

---

### 2. 准备策略

1. **深度优先**：挑 5 个模块深入研究，能讲原理+实战+优化
2. **结合项目**：每个知识点准备一个项目案例
3. **代码演示**：准备 CodePen 链接，可现场演示
4. **性能视角**：任何方案都从性能角度分析 trade-offs
5. **模拟面试**：找人提问或自问自答

---

### 3. 面试话术模板

**回答结构**：
1. 定义（是什么）
2. 原理（为什么）
3. 应用（怎么用）
4. 优化（如何更好）
5. 案例（项目经验）

**示例**：

> **面试官**：说说 Flex 布局  
> **你**：Flex 是一维布局系统（定义），基于主轴和交叉轴分配空间（原理）。常用于导航栏、工具栏等场景（应用）。性能优于 float 和 table 布局（优化）。我在 XX 项目中用 Flex 实现了响应式导航，比原来的方案减少了 30% 代码（案例）。

---

**祝面试成功！如有疑问随时交流。** 🎯
