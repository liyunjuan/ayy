# 前端性能优化资深面试指南

## 目录
1. [性能指标](#1-性能指标)
2. [加载性能优化](#2-加载性能优化)
3. [运行时性能优化](#3-运行时性能优化)
4. [渲染性能优化](#4-渲染性能优化)
5. [网络优化](#5-网络优化)
6. [图片优化](#6-图片优化)
7. [代码优化](#7-代码优化)
8. [缓存策略](#8-缓存策略)
9. [性能监控](#9-性能监控)
10. [性能分析工具](#10-性能分析工具)
11. [实战案例](#11-实战案例)
12. [经典面试题](#12-经典面试题)

---

## 1. 性能指标

### 1.1 核心 Web Vitals

```javascript
// Google 定义的三大核心指标

// 1. LCP (Largest Contentful Paint) - 最大内容绘制
// 测量：页面主要内容加载时间
// 标准：< 2.5s（优秀）、2.5-4s（需改进）、> 4s（差）

new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('LCP:', entry.renderTime || entry.loadTime);
  }
}).observe({ entryTypes: ['largest-contentful-paint'] });

// 2. FID (First Input Delay) - 首次输入延迟
// 测量：用户首次交互到浏览器响应的时间
// 标准：< 100ms（优秀）、100-300ms（需改进）、> 300ms（差）

new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    const fid = entry.processingStart - entry.startTime;
    console.log('FID:', fid);
  }
}).observe({ entryTypes: ['first-input'] });

// 3. CLS (Cumulative Layout Shift) - 累积布局偏移
// 测量：视觉稳定性，元素意外移动
// 标准：< 0.1（优秀）、0.1-0.25（需改进）、> 0.25（差）

let cls = 0;
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      cls += entry.value;
    }
  }
  console.log('CLS:', cls);
}).observe({ entryTypes: ['layout-shift'] });
```

### 1.2 其他重要指标

```javascript
// 1. FCP (First Contentful Paint) - 首次内容绘制
// 首次 DOM 内容渲染时间
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.name === 'first-contentful-paint') {
      console.log('FCP:', entry.startTime);
    }
  }
}).observe({ entryTypes: ['paint'] });

// 2. TTI (Time to Interactive) - 可交互时间
// 页面完全可交互的时间
// 通过 Lighthouse 测量

// 3. TBT (Total Blocking Time) - 总阻塞时间
// FCP 到 TTI 之间所有长任务的阻塞时间总和

// 4. SI (Speed Index) - 速度指数
// 页面内容可见的速度

// 5. TTFB (Time to First Byte) - 首字节时间
// 浏览器收到服务器第一个字节的时间
const ttfb = performance.timing.responseStart - performance.timing.requestStart;
console.log('TTFB:', ttfb);

// 6. FMP (First Meaningful Paint) - 首次有意义绘制
// 主要内容出现的时间（已被 LCP 替代）

// 7. DOMContentLoaded
// DOM 解析完成时间
const domReady = performance.timing.domContentLoadedEventEnd - 
                 performance.timing.navigationStart;
console.log('DOMContentLoaded:', domReady);

// 8. Load
// 页面完全加载时间
const loadTime = performance.timing.loadEventEnd - 
                 performance.timing.navigationStart;
console.log('Load Time:', loadTime);
```

### 1.3 性能预算

```javascript
// 设置性能预算

const performanceBudget = {
  // 时间预算
  FCP: 1800,      // 1.8s
  LCP: 2500,      // 2.5s
  TTI: 3800,      // 3.8s
  TBT: 300,       // 300ms
  
  // 资源预算
  javascript: 300,  // KB
  css: 100,         // KB
  images: 1000,     // KB
  fonts: 100,       // KB
  total: 1500,      // KB
  
  // 请求数预算
  requests: 50
};

// 检查是否超出预算
function checkBudget(metrics, budget) {
  const violations = [];
  
  for (const [metric, value] of Object.entries(metrics)) {
    if (budget[metric] && value > budget[metric]) {
      violations.push({
        metric,
        value,
        budget: budget[metric],
        excess: value - budget[metric]
      });
    }
  }
  
  return violations;
}

// Webpack 性能预算配置
module.exports = {
  performance: {
    maxAssetSize: 300000,      // 单个资源 300KB
    maxEntrypointSize: 500000, // 入口总大小 500KB
    hints: 'warning'           // 超出时警告
  }
};
```

---

## 2. 加载性能优化

### 2.1 资源加载优化

```html
<!-- 1. 预加载关键资源 -->
<!-- preload: 当前页面必需，高优先级 -->
<link rel="preload" href="/critical.css" as="style">
<link rel="preload" href="/critical.js" as="script">
<link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossorigin>

<!-- 2. 预获取未来资源 -->
<!-- prefetch: 未来可能需要，低优先级 -->
<link rel="prefetch" href="/next-page.js">
<link rel="prefetch" href="/next-page.css">

<!-- 3. 预连接 -->
<!-- preconnect: 提前建立连接（DNS + TCP + TLS） -->
<link rel="preconnect" href="https://api.example.com">
<link rel="preconnect" href="https://cdn.example.com" crossorigin>

<!-- 4. DNS 预解析 -->
<!-- dns-prefetch: 仅 DNS 解析 -->
<link rel="dns-prefetch" href="//api.example.com">

<!-- 5. 预渲染 -->
<!-- prerender: 完全渲染页面（慎用，消耗大） -->
<link rel="prerender" href="/next-page.html">

<!-- 优先级对比 -->
<!-- preload > preconnect > dns-prefetch > prefetch > prerender -->
```

### 2.2 脚本加载优化

```html
<!-- 1. defer: 异步下载，DOM 解析后按顺序执行 -->
<script src="/script.js" defer></script>

<!-- 2. async: 异步下载，下载完立即执行（不保证顺序） -->
<script src="/analytics.js" async></script>

<!-- 3. 模块脚本（默认 defer） -->
<script type="module" src="/app.js"></script>

<!-- 4. 内联关键脚本 -->
<script>
  // 关键初始化代码
  window.APP_CONFIG = {...};
</script>

<!-- 5. 动态加载 -->
<script>
  // 按需加载
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  // 条件加载
  if (needsPolyfill) {
    loadScript('/polyfill.js').then(() => {
      loadScript('/app.js');
    });
  } else {
    loadScript('/app.js');
  }
</script>

<!-- 6. 脚本执行顺序 -->
<!--
正常：阻塞 HTML 解析
defer：HTML 解析完成后，DOMContentLoaded 前执行
async：下载完立即执行，可能在 HTML 解析中
-->
```

### 2.3 样式加载优化

```html
<!-- 1. 内联关键 CSS -->
<style>
  /* 首屏关键样式 */
  .header { ... }
  .hero { ... }
</style>

<!-- 2. 异步加载非关键 CSS -->
<link rel="preload" href="/non-critical.css" as="style" onload="this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/non-critical.css"></noscript>

<!-- 3. 媒体查询分离 -->
<link rel="stylesheet" href="/print.css" media="print">
<link rel="stylesheet" href="/mobile.css" media="(max-width: 768px)">

<!-- 4. 字体加载优化 -->
<style>
  @font-face {
    font-family: 'Custom';
    src: url('/font.woff2') format('woff2');
    font-display: swap; /* 立即显示后备字体 */
  }
</style>

<!-- font-display 选项 -->
<!--
auto: 浏览器默认
block: 阻塞 3s，然后显示后备字体
swap: 立即显示后备字体（推荐）
fallback: 100ms 阻塞，3s 后放弃
optional: 100ms 阻塞，然后根据网络决定
-->
```

### 2.4 代码拆分

```javascript
// 1. 动态 import（推荐）
// 路由懒加载
const Home = () => import('./pages/Home');
const About = () => import('./pages/About');

// React 路由懒加载
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  );
}

// Vue 路由懒加载
const routes = [
  {
    path: '/',
    component: () => import('./pages/Home.vue')
  },
  {
    path: '/about',
    component: () => import('./pages/About.vue')
  }
];

// 2. Webpack 代码拆分
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 提取 node_modules
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          name: 'vendor'
        },
        // 提取公共代码
        common: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
          name: 'common'
        }
      }
    }
  }
};

// 3. 按需加载（魔法注释）
import(
  /* webpackChunkName: "lodash" */
  /* webpackPrefetch: true */
  'lodash'
).then(({ default: _ }) => {
  console.log(_.join(['Hello', 'World'], ' '));
});

// 4. Tree Shaking
// package.json
{
  "sideEffects": false  // 所有模块无副作用
}

// 或指定有副作用的文件
{
  "sideEffects": ["*.css", "*.scss"]
}

// 5. 组件懒加载
// 使用 React.lazy
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// 使用 loadable-components
import loadable from '@loadable/component';
const HeavyComponent = loadable(() => import('./HeavyComponent'));
```

### 2.5 资源压缩

```javascript
// 1. Gzip 压缩
// Nginx 配置
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
gzip_comp_level 6;

// 2. Brotli 压缩（更好）
// Nginx 配置
brotli on;
brotli_types text/plain text/css application/json application/javascript;

// 3. Webpack 压缩
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // 删除 console
            drop_debugger: true
          }
        }
      }),
      new CssMinimizerPlugin()
    ]
  }
};

// 4. 图片压缩
// imagemin-webpack-plugin
const ImageminPlugin = require('imagemin-webpack-plugin').default;

plugins: [
  new ImageminPlugin({
    pngquant: { quality: '65-90' },
    mozjpeg: { quality: 85 }
  })
];

// 5. 文件哈希
module.exports = {
  output: {
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js'
  }
};
```

---

## 3. 运行时性能优化

### 3.1 长任务拆分

```javascript
// 1. requestIdleCallback
function processLargeArray(array) {
  let index = 0;
  
  function chunk() {
    const deadline = requestIdleCallback((idleDeadline) => {
      // 有空闲时间就处理
      while (idleDeadline.timeRemaining() > 0 && index < array.length) {
        processItem(array[index]);
        index++;
      }
      
      // 还有数据继续处理
      if (index < array.length) {
        chunk();
      }
    });
  }
  
  chunk();
}

// 2. 时间切片（Time Slicing）
function timeSlicing(tasks, chunkSize = 50) {
  let index = 0;
  
  function run() {
    const end = Math.min(index + chunkSize, tasks.length);
    
    for (; index < end; index++) {
      tasks[index]();
    }
    
    if (index < tasks.length) {
      setTimeout(run, 0); // 让出控制权
    }
  }
  
  run();
}

// 使用
const tasks = Array.from({ length: 10000 }, (_, i) => () => {
  console.log(i);
});
timeSlicing(tasks);

// 3. React Concurrent Mode（React 18）
import { startTransition } from 'react';

function handleChange(e) {
  // 高优先级：立即更新输入框
  setInputValue(e.target.value);
  
  // 低优先级：延迟更新列表
  startTransition(() => {
    setFilteredList(filterLargeList(e.target.value));
  });
}

// 4. Web Worker
// main.js
const worker = new Worker('worker.js');

worker.postMessage({ data: largeArray });

worker.onmessage = (e) => {
  console.log('Result:', e.data);
};

// worker.js
self.onmessage = (e) => {
  const result = heavyComputation(e.data);
  self.postMessage(result);
};
```

### 3.2 防抖与节流

```javascript
// 1. 防抖（Debounce）
// 连续触发只执行最后一次
function debounce(fn, delay) {
  let timer = null;
  
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 使用
const handleSearch = debounce((value) => {
  console.log('Search:', value);
}, 300);

input.addEventListener('input', (e) => {
  handleSearch(e.target.value);
});

// 2. 节流（Throttle）
// 固定时间内只执行一次
function throttle(fn, delay) {
  let lastTime = 0;
  
  return function(...args) {
    const now = Date.now();
    
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

// 使用
const handleScroll = throttle(() => {
  console.log('Scroll:', window.scrollY);
}, 100);

window.addEventListener('scroll', handleScroll);

// 3. 节流（定时器版本）
function throttle2(fn, delay) {
  let timer = null;
  
  return function(...args) {
    if (timer) return;
    
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}

// 4. 高级防抖（立即执行 + 延迟）
function debounceAdvanced(fn, delay, immediate = false) {
  let timer = null;
  
  return function(...args) {
    const callNow = immediate && !timer;
    
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!immediate) {
        fn.apply(this, args);
      }
    }, delay);
    
    if (callNow) {
      fn.apply(this, args);
    }
  };
}

// 5. 使用场景对比
// 防抖：搜索框输入、窗口 resize
// 节流：滚动、鼠标移动、游戏射击
```

### 3.3 虚拟滚动

```javascript
// 虚拟滚动实现
class VirtualList {
  constructor(container, items, itemHeight) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    
    // 可见区域高度
    this.viewportHeight = container.clientHeight;
    // 可见项数量
    this.visibleCount = Math.ceil(this.viewportHeight / itemHeight);
    // 缓冲项数量
    this.bufferCount = 3;
    
    this.render();
    this.bindEvents();
  }
  
  render() {
    const scrollTop = this.container.scrollTop;
    
    // 计算起始索引
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / this.itemHeight) - this.bufferCount
    );
    
    // 计算结束索引
    const endIndex = Math.min(
      this.items.length,
      startIndex + this.visibleCount + this.bufferCount * 2
    );
    
    // 获取可见项
    const visibleItems = this.items.slice(startIndex, endIndex);
    
    // 计算偏移量
    const offsetY = startIndex * this.itemHeight;
    
    // 渲染
    this.container.innerHTML = `
      <div style="height: ${this.items.length * this.itemHeight}px; position: relative;">
        <div style="transform: translateY(${offsetY}px);">
          ${visibleItems.map(item => `
            <div style="height: ${this.itemHeight}px;">
              ${item.content}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  bindEvents() {
    let rafId = null;
    
    this.container.addEventListener('scroll', () => {
      if (rafId) return;
      
      rafId = requestAnimationFrame(() => {
        this.render();
        rafId = null;
      });
    });
  }
}

// 使用
const items = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  content: `Item ${i}`
}));

const virtualList = new VirtualList(
  document.getElementById('container'),
  items,
  50 // 每项高度 50px
);

// 使用第三方库（推荐）
// react-window
import { FixedSizeList } from 'react-window';

function App() {
  return (
    <FixedSizeList
      height={600}
      itemCount={10000}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>Item {index}</div>
      )}
    </FixedSizeList>
  );
}
```

### 3.4 懒加载

```javascript
// 1. Intersection Observer（推荐）
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
}, {
  rootMargin: '50px' // 提前 50px 加载
});

// 使用
document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img);
});

// 2. 原生懒加载
<img src="image.jpg" loading="lazy" alt="Image">

// 3. 图片懒加载类
class LazyLoad {
  constructor(selector, options = {}) {
    this.images = document.querySelectorAll(selector);
    this.options = {
      rootMargin: '50px',
      threshold: 0,
      ...options
    };
    
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      this.options
    );
    
    this.observe();
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }
  
  loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    
    if (src) {
      img.src = src;
    }
    
    if (srcset) {
      img.srcset = srcset;
    }
    
    img.classList.add('loaded');
  }
  
  observe() {
    this.images.forEach(img => {
      this.observer.observe(img);
    });
  }
}

// 使用
new LazyLoad('img[data-src]');

// 4. 组件懒加载
// React
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}

// Vue
export default {
  components: {
    HeavyComponent: () => import('./HeavyComponent.vue')
  }
};

// 5. 数据懒加载（无限滚动）
class InfiniteScroll {
  constructor(container, loadMore) {
    this.container = container;
    this.loadMore = loadMore;
    this.loading = false;
    
    this.bindEvents();
  }
  
  bindEvents() {
    this.container.addEventListener('scroll', () => {
      if (this.loading) return;
      
      const { scrollTop, scrollHeight, clientHeight } = this.container;
      
      // 距离底部 100px 时加载
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        this.loading = true;
        
        this.loadMore().then(() => {
          this.loading = false;
        });
      }
    });
  }
}

// 使用
new InfiniteScroll(container, async () => {
  const data = await fetchMoreData();
  renderData(data);
});
```

---

## 4. 渲染性能优化

### 4.1 减少回流（Reflow）

```javascript
// 1. 批量修改样式
// 差：多次回流
element.style.width = '100px';
element.style.height = '100px';
element.style.margin = '10px';

// 好：一次回流
element.style.cssText = 'width: 100px; height: 100px; margin: 10px;';

// 更好：使用 class
element.className = 'new-style';

// 2. 批量修改 DOM
// 差：多次回流
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  document.body.appendChild(div); // 每次都回流
}

// 好：使用 DocumentFragment
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  fragment.appendChild(div);
}
document.body.appendChild(fragment); // 只回流一次

// 3. 读写分离
// 差：强制同步布局
for (let i = 0; i < 1000; i++) {
  const width = element.offsetWidth; // 读取
  element.style.width = width + 10 + 'px'; // 修改
  // 每次都触发回流
}

// 好：读写分离
const width = element.offsetWidth; // 先读取
for (let i = 0; i < 1000; i++) {
  element.style.width = width + 10 + 'px'; // 后修改
}

// 4. 离线 DOM 操作
// 方式1：display: none
element.style.display = 'none'; // 脱离文档流
// 进行大量修改
element.style.display = 'block'; // 恢复，一次回流

// 方式2：DocumentFragment（上面已展示）

// 方式3：cloneNode
const clone = element.cloneNode(true);
// 修改 clone
element.parentNode.replaceChild(clone, element);

// 5. 使用 transform/opacity（不触发回流）
// 差：触发回流
element.style.left = '100px';

// 好：只触发合成
element.style.transform = 'translateX(100px)';

// 6. 避免表格布局
// 表格一个单元格变化，整个表格回流

// 7. 避免 CSS 表达式（IE）
// width: expression(document.body.offsetWidth - 10);
```

### 4.2 GPU 加速

```css
/* 1. 创建独立图层 */
.element {
  will-change: transform;
  /* 或 */
  transform: translateZ(0);
  /* 或 */
  transform: translate3d(0, 0, 0);
}

/* 2. 动画使用 transform/opacity */
/* 差：触发回流 */
@keyframes move {
  from { left: 0; }
  to { left: 100px; }
}

/* 好：只触发合成 */
@keyframes move {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}

/* 3. will-change 提示浏览器 */
.element {
  will-change: transform, opacity;
}

/* 注意：不要滥用 */
/* 差：所有元素都创建图层 */
* {
  will-change: transform;
}

/* 好：只在需要时启用 */
.element:hover {
  will-change: transform;
}

/* 4. 使用 CSS contain */
.element {
  contain: layout; /* 内部变化不影响外部 */
  contain: paint;  /* 绘制边界 */
  contain: size;   /* 大小不影响子元素 */
  contain: strict; /* 包含所有 */
}
```

### 4.3 requestAnimationFrame

```javascript
// 1. 使用 rAF 进行动画
// 差：使用 setTimeout
let left = 0;
function animate() {
  left += 5;
  element.style.left = left + 'px';
  setTimeout(animate, 16); // 约 60fps
}

// 好：使用 rAF
let left = 0;
function animate() {
  left += 5;
  element.style.left = left + 'px';
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// 2. 批量 DOM 操作
const updates = [];

function scheduleUpdate(fn) {
  updates.push(fn);
  
  if (updates.length === 1) {
    requestAnimationFrame(() => {
      const toUpdate = updates.splice(0);
      toUpdate.forEach(fn => fn());
    });
  }
}

// 使用
scheduleUpdate(() => {
  element1.style.width = '100px';
});
scheduleUpdate(() => {
  element2.style.height = '200px';
});
// 两次更新会在同一帧执行

// 3. 滚动节流
let rafId = null;

window.addEventListener('scroll', () => {
  if (rafId) return;
  
  rafId = requestAnimationFrame(() => {
    handleScroll();
    rafId = null;
  });
});

// 4. 测量与更新分离
function measure() {
  // 读取布局信息
  const width = element.offsetWidth;
  
  requestAnimationFrame(() => {
    // 下一帧再修改
    element.style.width = width + 10 + 'px';
  });
}
```

### 4.4 避免强制同步布局

```javascript
// 强制同步布局（Layout Thrashing）
// 浏览器被迫在 JS 执行中同步计算布局

// 差：强制同步布局
function resizeAllElements() {
  const elements = document.querySelectorAll('.item');
  
  elements.forEach(el => {
    const width = el.offsetWidth; // 读取，触发布局
    el.style.width = width * 2 + 'px'; // 修改
    // 下次读取又触发布局，循环往复
  });
}

// 好：批量读取，批量修改
function resizeAllElements() {
  const elements = document.querySelectorAll('.item');
  
  // 阶段1：批量读取
  const widths = Array.from(elements).map(el => el.offsetWidth);
  
  // 阶段2：批量修改
  elements.forEach((el, i) => {
    el.style.width = widths[i] * 2 + 'px';
  });
}

// 使用 FastDOM 库
import fastdom from 'fastdom';

fastdom.measure(() => {
  // 读取
  const width = element.offsetWidth;
  
  fastdom.mutate(() => {
    // 修改
    element.style.width = width * 2 + 'px';
  });
});
```

---

## 5. 网络优化

### 5.1 HTTP/2 优化

```javascript
// HTTP/2 特性

// 1. 多路复用
// 不需要合并文件，可以独立缓存
// HTTP/1.1 需要合并：bundle.js
// HTTP/2 可以分离：moduleA.js, moduleB.js, moduleC.js

// 2. 服务器推送
// Nginx 配置
location /index.html {
  http2_push /style.css;
  http2_push /script.js;
}

// Node.js (http2)
const http2 = require('http2');

const server = http2.createSecureServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
});

server.on('stream', (stream, headers) => {
  if (headers[':path'] === '/') {
    // 推送资源
    stream.pushStream({ ':path': '/style.css' }, (err, pushStream) => {
      pushStream.respondWithFile('./style.css');
    });
    
    stream.respondWithFile('./index.html');
  }
});

// 3. 头部压缩（HPACK）
// 自动完成，无需手动优化

// 4. 二进制分帧
// 自动完成，无需手动优化
```

### 5.2 资源优先级

```html
<!-- 1. 使用 preload 提升优先级 -->
<link rel="preload" href="/critical.css" as="style">
<link rel="preload" href="/critical.js" as="script">

<!-- 2. 使用 fetchpriority 属性（实验性） -->
<img src="/hero.jpg" fetchpriority="high">
<script src="/analytics.js" fetchpriority="low"></script>

<!-- 3. 资源提示优先级 -->
<!--
preload > preconnect > dns-prefetch > prefetch
-->

<!-- 4. 脚本优先级 -->
<!-- 正常：高优先级，阻塞 -->
<script src="/app.js"></script>

<!-- defer：中优先级，异步 -->
<script src="/app.js" defer></script>

<!-- async：低优先级，异步 -->
<script src="/analytics.js" async></script>

<!-- 5. 图片优先级 -->
<!-- 首屏图片：高优先级 -->
<img src="/hero.jpg" loading="eager">

<!-- 懒加载图片：低优先级 -->
<img src="/footer.jpg" loading="lazy">
```

### 5.3 CDN 优化

```javascript
// 1. 使用 CDN
// 静态资源托管到 CDN
const CDN_URL = 'https://cdn.example.com';

// Webpack 配置
module.exports = {
  output: {
    publicPath: process.env.NODE_ENV === 'production' 
      ? 'https://cdn.example.com/' 
      : '/'
  }
};

// 2. 多域名分片（HTTP/1.1 优化，HTTP/2 不需要）
const CDN_DOMAINS = [
  'https://cdn1.example.com',
  'https://cdn2.example.com',
  'https://cdn3.example.com'
];

function getCDN(index) {
  return CDN_DOMAINS[index % CDN_DOMAINS.length];
}

// 3. 就近访问
// 使用智能 DNS 解析到最近的 CDN 节点

// 4. 预热
// 上线前预先缓存到 CDN 节点

// 5. 回源优化
// 设置合理的缓存策略
Cache-Control: public, max-age=31536000, immutable
```

### 5.4 请求优化

```javascript
// 1. 减少请求数
// 合并文件（HTTP/1.1）
// 雪碧图
// 内联小文件
// 使用 SVG Sprite

// 2. 并发请求
// 浏览器同域名并发限制：6-8 个
// 使用多域名或 HTTP/2

// 3. 请求合并
// 接口合并
const data = await fetch('/api/batch', {
  method: 'POST',
  body: JSON.stringify({
    requests: [
      { url: '/api/user', method: 'GET' },
      { url: '/api/posts', method: 'GET' }
    ]
  })
});

// 4. 取消无用请求
const controller = new AbortController();

fetch('/api/data', { signal: controller.signal })
  .then(res => res.json())
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('Request cancelled');
    }
  });

// 组件卸载时取消
useEffect(() => {
  const controller = new AbortController();
  
  fetch('/api/data', { signal: controller.signal });
  
  return () => {
    controller.abort();
  };
}, []);

// 5. 请求缓存
const cache = new Map();

async function fetchWithCache(url) {
  if (cache.has(url)) {
    return cache.get(url);
  }
  
  const data = await fetch(url).then(res => res.json());
  cache.set(url, data);
  
  return data;
}

// 6. 请求防抖
let pendingRequest = null;

async function fetchWithDebounce(url) {
  if (pendingRequest) {
    return pendingRequest;
  }
  
  pendingRequest = fetch(url)
    .then(res => res.json())
    .finally(() => {
      pendingRequest = null;
    });
  
  return pendingRequest;
}
```

---

## 6. 图片优化

### 6.1 图片格式选择

```javascript
// 图片格式对比

// 1. JPEG
// 适合：照片、复杂图像
// 特点：有损压缩、不支持透明
// 大小：中等

// 2. PNG
// 适合：图标、Logo、需要透明背景
// 特点：无损压缩、支持透明
// 大小：较大

// 3. WebP（推荐）
// 适合：所有场景
// 特点：有损/无损、支持透明、比 JPEG/PNG 小 25-35%
// 兼容性：现代浏览器

// 4. AVIF（新格式）
// 适合：所有场景
// 特点：比 WebP 更小
// 兼容性：较新浏览器

// 5. SVG
// 适合：图标、Logo、简单图形
// 特点：矢量、可缩放、体积小
// 大小：最小

// 6. GIF
// 适合：简单动画
// 特点：支持动画、颜色少（256色）
// 大小：较大
// 替代：使用 video 标签
```

### 6.2 响应式图片

```html
<!-- 1. srcset（不同分辨率） -->
<img 
  src="image-400.jpg" 
  srcset="
    image-400.jpg 400w,
    image-800.jpg 800w,
    image-1200.jpg 1200w
  "
  sizes="(max-width: 600px) 400px, (max-width: 900px) 800px, 1200px"
  alt="Responsive Image"
>

<!-- 2. picture（不同格式/裁剪） -->
<picture>
  <!-- AVIF -->
  <source srcset="image.avif" type="image/avif">
  
  <!-- WebP -->
  <source srcset="image.webp" type="image/webp">
  
  <!-- JPEG fallback -->
  <img src="image.jpg" alt="Image">
</picture>

<!-- 3. 艺术方向（不同裁剪） -->
<picture>
  <!-- 移动端：竖版 -->
  <source 
    media="(max-width: 768px)" 
    srcset="image-mobile.jpg"
  >
  
  <!-- 桌面端：横版 -->
  <source 
    media="(min-width: 769px)" 
    srcset="image-desktop.jpg"
  >
  
  <img src="image-desktop.jpg" alt="Image">
</picture>

<!-- 4. 暗色模式 -->
<picture>
  <source 
    srcset="image-dark.jpg" 
    media="(prefers-color-scheme: dark)"
  >
  <img src="image-light.jpg" alt="Image">
</picture>
```

### 6.3 图片压缩

```javascript
// 1. 工具压缩
// TinyPNG、ImageOptim、Squoosh

// 2. Webpack 压缩
// image-webpack-loader
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader'
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: { quality: 85 },
              pngquant: { quality: [0.65, 0.90] },
              webp: { quality: 85 }
            }
          }
        ]
      }
    ]
  }
};

// 3. 运行时压缩（Canvas）
function compressImage(file, quality = 0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', quality);
      };
    };
    
    reader.readAsDataURL(file);
  });
}

// 使用
input.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const compressed = await compressImage(file, 0.8);
  // 上传 compressed
});
```

### 6.4 图片懒加载

见 3.4 节

### 6.5 渐进式图片

```html
<!-- 1. 低质量图片占位符（LQIP） -->
<img 
  src="image-low.jpg" 
  data-src="image-high.jpg"
  class="lazy"
  alt="Image"
>

<style>
  .lazy {
    filter: blur(10px);
    transition: filter 0.3s;
  }
  
  .lazy.loaded {
    filter: blur(0);
  }
</style>

<script>
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const highSrc = img.dataset.src;
        
        const tempImg = new Image();
        tempImg.src = highSrc;
        tempImg.onload = () => {
          img.src = highSrc;
          img.classList.add('loaded');
        };
        
        observer.unobserve(img);
      }
    });
  });
  
  document.querySelectorAll('.lazy').forEach(img => {
    observer.observe(img);
  });
</script>

<!-- 2. Base64 内联小图 -->
<img src="data:image/png;base64,iVBORw0KGg..." alt="Small Icon">

<!-- 3. 渐进式 JPEG -->
<!-- 使用工具转换为渐进式 JPEG -->
<!-- ImageMagick: convert input.jpg -interlace Plane output.jpg -->
```

---

## 7. 代码优化

### 7.1 JavaScript 优化

```javascript
// 1. 避免全局查找
// 差：每次都查找 document
for (let i = 0; i < 1000; i++) {
  document.getElementById('box').innerHTML = i;
}

// 好：缓存引用
const box = document.getElementById('box');
for (let i = 0; i < 1000; i++) {
  box.innerHTML = i;
}

// 2. 避免 with、eval
// 差：破坏作用域链
with (obj) {
  console.log(property);
}

// 好：直接访问
console.log(obj.property);

// 3. 使用事件委托
// 差：每个元素绑定
items.forEach(item => {
  item.addEventListener('click', handleClick);
});

// 好：父元素委托
parent.addEventListener('click', (e) => {
  if (e.target.matches('.item')) {
    handleClick(e);
  }
});

// 4. 避免内存泄漏
// 及时清理引用
const elements = [];
function cleanup() {
  elements.length = 0;
}

// 移除事件监听
element.removeEventListener('click', handler);

// 清理定时器
clearInterval(timer);

// 使用 WeakMap/WeakSet
const weakMap = new WeakMap();
weakMap.set(obj, value); // obj 被回收时，value 也会被回收

// 5. 使用对象池
class ObjectPool {
  constructor(factory, size) {
    this.factory = factory;
    this.pool = Array.from({ length: size }, factory);
    this.inUse = new Set();
  }
  
  acquire() {
    const obj = this.pool.find(o => !this.inUse.has(o));
    if (obj) {
      this.inUse.add(obj);
      return obj;
    }
    const newObj = this.factory();
    this.pool.push(newObj);
    this.inUse.add(newObj);
    return newObj;
  }
  
  release(obj) {
    this.inUse.delete(obj);
  }
}

// 6. 避免闭包陷阱
// 差：闭包保留大对象
function createClosure() {
  const largeData = new Array(1000000);
  return function() {
    console.log(largeData[0]);
  };
}

// 好：只保留需要的值
function createClosure() {
  const largeData = new Array(1000000);
  const firstItem = largeData[0];
  return function() {
    console.log(firstItem);
  };
}
```

### 7.2 React 优化

```javascript
// 1. React.memo
const Child = React.memo(({ name, age }) => {
  return <div>{name}, {age}</div>;
}, (prevProps, nextProps) => {
  // 返回 true 表示不重新渲染
  return prevProps.name === nextProps.name;
});

// 2. useMemo
function Component({ items }) {
  // 只在 items 变化时重新计算
  const expensiveValue = useMemo(() => {
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);
  
  return <div>{expensiveValue}</div>;
}

// 3. useCallback
function Parent() {
  const [count, setCount] = useState(0);
  
  // 只在 count 变化时重新创建
  const handleClick = useCallback(() => {
    console.log(count);
  }, [count]);
  
  return <Child onClick={handleClick} />;
}

// 4. 虚拟滚动
import { FixedSizeList } from 'react-window';

function App() {
  return (
    <FixedSizeList
      height={600}
      itemCount={10000}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>Item {index}</div>
      )}
    </FixedSizeList>
  );
}

// 5. 代码拆分
const LazyComponent = lazy(() => import('./Component'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}

// 6. useTransition（React 18）
function App() {
  const [isPending, startTransition] = useTransition();
  const [input, setInput] = useState('');
  const [list, setList] = useState([]);
  
  const handleChange = (e) => {
    setInput(e.target.value);
    
    startTransition(() => {
      setList(filterLargeList(e.target.value));
    });
  };
  
  return (
    <>
      <input value={input} onChange={handleChange} />
      {isPending && <div>Loading...</div>}
      <List items={list} />
    </>
  );
}

// 7. key 优化
// 差：使用 index
{items.map((item, index) => (
  <div key={index}>{item.name}</div>
))}

// 好：使用唯一 id
{items.map(item => (
  <div key={item.id}>{item.name}</div>
))}
```

### 7.3 Vue 优化

```vue
<!-- 1. v-once（只渲染一次） -->
<div v-once>
  {{ expensiveComputation() }}
</div>

<!-- 2. v-memo（条件缓存，Vue 3.2+） -->
<div v-memo="[value1, value2]">
  {{ expensiveRender() }}
</div>

<!-- 3. 计算属性缓存 -->
<script>
export default {
  computed: {
    expensiveValue() {
      // 自动缓存
      return this.items.reduce((sum, item) => sum + item.value, 0);
    }
  }
}
</script>

<!-- 4. 虚拟滚动 -->
<template>
  <RecycleScroller
    :items="items"
    :item-size="50"
    key-field="id"
  >
    <template #default="{ item }">
      <div>{{ item.name }}</div>
    </template>
  </RecycleScroller>
</template>

<!-- 5. 异步组件 -->
<script>
export default {
  components: {
    AsyncComponent: () => import('./AsyncComponent.vue')
  }
}
</script>

<!-- 6. KeepAlive -->
<template>
  <KeepAlive>
    <component :is="currentView" />
  </KeepAlive>
</template>

<!-- 7. 函数式组件 -->
<script>
export default {
  functional: true,
  render(h, context) {
    return h('div', context.props.text);
  }
}
</script>

<!-- 8. shallowRef/shallowReactive -->
<script setup>
import { shallowRef } from 'vue';

// 大对象使用浅层响应
const state = shallowRef({ nested: { count: 0 } });

// 修改整个对象才触发更新
state.value = { nested: { count: 1 } };
</script>
```

---

## 8. 缓存策略

### 8.1 HTTP 缓存

```javascript
// 1. 强缓存
// Expires（HTTP/1.0，已过时）
Expires: Wed, 21 Oct 2027 07:28:00 GMT

// Cache-Control（HTTP/1.1，推荐）
Cache-Control: max-age=31536000 // 1 年

// 指令：
// max-age=<seconds>: 有效期
// no-cache: 每次验证（协商缓存）
// no-store: 完全不缓存
// public: 可被中间代理缓存
// private: 只能被浏览器缓存
// immutable: 永不过期（适合指纹文件）

// 2. 协商缓存
// Last-Modified / If-Modified-Since
Last-Modified: Wed, 21 Oct 2024 07:28:00 GMT

// 请求
If-Modified-Since: Wed, 21 Oct 2024 07:28:00 GMT

// 响应
HTTP/1.1 304 Not Modified

// ETag / If-None-Match（优先级更高）
ETag: "abc123"

// 请求
If-None-Match: "abc123"

// 响应
HTTP/1.1 304 Not Modified

// 3. 缓存策略
// HTML: no-cache（每次验证）
Cache-Control: no-cache

// 带哈希的静态资源: 强缓存 + immutable
Cache-Control: public, max-age=31536000, immutable

// API: no-store（不缓存）
Cache-Control: no-store, private

// 图片/字体: 短期缓存
Cache-Control: public, max-age=604800 // 7 天
```

### 8.2 Service Worker 缓存

```javascript
// sw.js
const CACHE_NAME = 'v1';
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/scripts/main.js'
];

// 1. 安装
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// 2. 拦截请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 缓存命中
        if (response) {
          return response;
        }
        
        // 请求网络
        return fetch(event.request).then((response) => {
          // 缓存新资源
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone);
              });
          }
          return response;
        });
      })
  );
});

// 3. 更新缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 4. 缓存策略

// Cache First（缓存优先）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// Network First（网络优先）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});

// Stale While Revalidate（过期重新验证）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
            return networkResponse;
          });
        
        return cachedResponse || fetchPromise;
      })
  );
});
```

### 8.3 本地缓存

```javascript
// 1. LocalStorage
// 同步、持久化、5-10MB
localStorage.setItem('key', 'value');
const value = localStorage.getItem('key');
localStorage.removeItem('key');
localStorage.clear();

// 2. SessionStorage
// 同步、会话级、5-10MB
sessionStorage.setItem('key', 'value');

// 3. IndexedDB
// 异步、持久化、无限制
const request = indexedDB.open('MyDatabase', 1);

request.onsuccess = (event) => {
  const db = event.target.result;
  
  // 读取
  const transaction = db.transaction(['users'], 'readonly');
  const store = transaction.objectStore('users');
  const getRequest = store.get(1);
  
  getRequest.onsuccess = () => {
    console.log(getRequest.result);
  };
};

// 4. Cache API
caches.open('v1').then((cache) => {
  cache.add('/index.html');
  cache.match('/index.html').then((response) => {
    console.log(response);
  });
});

// 5. 内存缓存
const cache = new Map();

function memoize(fn) {
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  };
}

// 使用
const fibonacci = memoize((n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});
```

---

## 9. 性能监控

### 9.1 Performance API

```javascript
// 1. Navigation Timing
const timing = performance.timing;

const metrics = {
  // DNS 查询时间
  dns: timing.domainLookupEnd - timing.domainLookupStart,
  
  // TCP 连接时间
  tcp: timing.connectEnd - timing.connectStart,
  
  // TLS 握手时间
  tls: timing.secureConnectionStart > 0 
    ? timing.connectEnd - timing.secureConnectionStart 
    : 0,
  
  // 请求时间
  request: timing.responseStart - timing.requestStart,
  
  // 响应时间
  response: timing.responseEnd - timing.responseStart,
  
  // DOM 解析时间
  domParse: timing.domInteractive - timing.domLoading,
  
  // 资源加载时间
  resourceLoad: timing.loadEventStart - timing.domContentLoadedEventEnd,
  
  // 首字节时间（TTFB）
  ttfb: timing.responseStart - timing.navigationStart,
  
  // DOM Ready
  domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
  
  // 页面完全加载
  load: timing.loadEventEnd - timing.navigationStart
};

console.log(metrics);

// 2. Resource Timing
const resources = performance.getEntriesByType('resource');

resources.forEach(resource => {
  console.log({
    name: resource.name,
    duration: resource.duration,
    size: resource.transferSize,
    type: resource.initiatorType
  });
});

// 3. User Timing
// 自定义性能标记
performance.mark('task-start');

// 执行任务
doTask();

performance.mark('task-end');

// 测量时间
performance.measure('task-duration', 'task-start', 'task-end');

const measure = performance.getEntriesByName('task-duration')[0];
console.log('Task duration:', measure.duration);

// 4. Performance Observer
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.duration);
  }
});

observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
```

### 9.2 自定义监控

```javascript
// 性能监控类
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }
  
  init() {
    // 监听页面加载
    window.addEventListener('load', () => {
      this.collectPageMetrics();
    });
    
    // 监听 LCP
    this.observeLCP();
    
    // 监听 FID
    this.observeFID();
    
    // 监听 CLS
    this.observeCLS();
  }
  
  collectPageMetrics() {
    const timing = performance.timing;
    
    this.metrics = {
      ...this.metrics,
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      ttfb: timing.responseStart - timing.navigationStart,
      domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
      load: timing.loadEventEnd - timing.navigationStart
    };
    
    this.report();
  }
  
  observeLCP() {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.metrics.lcp = entry.renderTime || entry.loadTime;
      }
      this.report();
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  }
  
  observeFID() {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.metrics.fid = entry.processingStart - entry.startTime;
      }
      this.report();
    }).observe({ entryTypes: ['first-input'] });
  }
  
  observeCLS() {
    let cls = 0;
    
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          cls += entry.value;
        }
      }
      this.metrics.cls = cls;
      this.report();
    }).observe({ entryTypes: ['layout-shift'] });
  }
  
  report() {
    // 上报到服务器
    navigator.sendBeacon('/api/performance', JSON.stringify({
      metrics: this.metrics,
      url: location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    }));
  }
}

// 使用
new PerformanceMonitor();
```

### 9.3 错误监控

```javascript
// 1. 全局错误监听
window.onerror = (message, source, lineno, colno, error) => {
  const errorInfo = {
    message,
    source,
    lineno,
    colno,
    stack: error?.stack,
    userAgent: navigator.userAgent,
    url: location.href,
    timestamp: Date.now()
  };
  
  // 上报
  navigator.sendBeacon('/api/error', JSON.stringify(errorInfo));
  
  return false; // 不阻止默认行为
};

// 2. Promise 错误
window.addEventListener('unhandledrejection', (event) => {
  const errorInfo = {
    reason: event.reason,
    promise: event.promise,
    url: location.href,
    timestamp: Date.now()
  };
  
  navigator.sendBeacon('/api/error', JSON.stringify(errorInfo));
});

// 3. 资源加载错误
window.addEventListener('error', (event) => {
  if (event.target !== window) {
    const errorInfo = {
      type: 'resource',
      tagName: event.target.tagName,
      src: event.target.src || event.target.href,
      url: location.href,
      timestamp: Date.now()
    };
    
    navigator.sendBeacon('/api/error', JSON.stringify(errorInfo));
  }
}, true); // 捕获阶段

// 4. React Error Boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    const errorData = {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
      url: location.href,
      timestamp: Date.now()
    };
    
    fetch('/api/error', {
      method: 'POST',
      body: JSON.stringify(errorData)
    });
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

// 5. Vue 错误处理
Vue.config.errorHandler = (err, vm, info) => {
  const errorData = {
    error: err.toString(),
    info,
    url: location.href,
    timestamp: Date.now()
  };
  
  fetch('/api/error', {
    method: 'POST',
    body: JSON.stringify(errorData)
  });
};
```

---

## 10. 性能分析工具

### 10.1 Chrome DevTools

```javascript
// 1. Performance 面板
// 记录性能
// 分析火焰图
// 查看长任务

// 2. Lighthouse
// 自动化性能测试
// 生成报告
// 优化建议

// 3. Network 面板
// 查看资源加载
// 分析瀑布图
// 检查缓存

// 4. Coverage 面板
// 查看代码覆盖率
// 删除无用代码

// 5. Memory 面板
// 查看内存使用
// 检测内存泄漏
// 堆快照

// 6. Performance Monitor
// 实时监控
// CPU 使用率
// 内存使用
```

### 10.2 Webpack Bundle Analyzer

```javascript
// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html'
    })
  ]
};

// 运行
npm run build -- --analyze
```

### 10.3 web-vitals

```javascript
// 测量 Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics({ name, value, id }) {
  navigator.sendBeacon('/api/analytics', JSON.stringify({
    metric: name,
    value,
    id,
    url: location.href
  }));
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

---

## 11. 实战案例

### 11.1 首屏优化案例

```javascript
// 问题：首屏加载慢（5s）
// 目标：< 2s

// 分析：
// 1. bundle.js 3MB（太大）
// 2. 20 张图片未压缩（10MB）
// 3. 无缓存策略
// 4. 未使用 CDN

// 优化方案：

// 1. 代码拆分
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor'
        },
        common: {
          minChunks: 2,
          name: 'common'
        }
      }
    }
  }
};

// 2. 路由懒加载
const Home = () => import('./pages/Home');
const About = () => import('./pages/About');

// 3. 图片优化
// - 压缩：TinyPNG
// - 懒加载：loading="lazy"
// - WebP：<picture>
// - CDN：上传到 CDN

// 4. 缓存策略
// Nginx 配置
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

location = /index.html {
  add_header Cache-Control "no-cache";
}

// 5. 资源预加载
<link rel="preload" href="/critical.css" as="style">
<link rel="preconnect" href="https://cdn.example.com">

// 结果：
// bundle.js: 3MB → 500KB（vendor: 300KB, main: 200KB）
// 图片: 10MB → 2MB（压缩 + WebP）
// 首屏时间: 5s → 1.8s ✅
```

### 11.2 列表性能优化

```javascript
// 问题：10000 条数据列表卡顿

// 优化方案：

// 1. 虚拟滚动
import { FixedSizeList } from 'react-window';

function List({ items }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          {items[index].name}
        </div>
      )}
    </FixedSizeList>
  );
}

// 2. 分页/无限滚动
function InfiniteList() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadMore();
  }, [page]);
  
  async function loadMore() {
    setLoading(true);
    const data = await fetch(`/api/items?page=${page}`).then(res => res.json());
    setItems([...items, ...data]);
    setLoading(false);
  }
  
  return (
    <div onScroll={handleScroll}>
      {items.map(item => <div key={item.id}>{item.name}</div>)}
      {loading && <div>Loading...</div>}
    </div>
  );
}

// 3. 搜索防抖
const debouncedSearch = useMemo(
  () => debounce((value) => {
    setFilteredItems(items.filter(item => 
      item.name.includes(value)
    ));
  }, 300),
  [items]
);

// 结果：
// 渲染时间: 5s → 100ms ✅
// 滚动流畅度: 10fps → 60fps ✅
```

### 11.3 SPA 性能优化

```javascript
// 问题：单页应用首次加载慢

// 优化方案：

// 1. SSR/SSG
// Next.js
export async function getServerSideProps() {
  const data = await fetchData();
  return { props: { data } };
}

// 2. 预渲染
// prerender-spa-plugin
new PrerenderSPAPlugin({
  routes: ['/', '/about', '/contact']
});

// 3. 路由预加载
<Link 
  to="/about" 
  onMouseEnter={() => import('./pages/About')}
>
  About
</Link>

// 4. 骨架屏
function SkeletonScreen() {
  return (
    <div className="skeleton">
      <div className="skeleton-header" />
      <div className="skeleton-content" />
    </div>
  );
}

// 5. PWA
// service-worker.js
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

// 结果：
// FCP: 3s → 1.2s ✅
// TTI: 5s → 2.5s ✅
```

---

## 12. 经典面试题

### Q1: 如何优化首屏加载时间？

见 11.1 节

### Q2: 什么是 Web Vitals？如何优化？

见 1.1 节

### Q3: 如何减少页面回流和重绘？

见 4.1 节

### Q4: 防抖和节流的区别？如何实现？

见 3.2 节

### Q5: 如何实现虚拟滚动？

见 3.3 节

### Q6: 图片懒加载的实现方式？

见 3.4 节和 6.4 节

### Q7: HTTP 缓存策略有哪些？

见 8.1 节

### Q8: 如何优化长列表性能？

见 11.2 节

### Q9: webpack 如何优化打包体积？

```javascript
// 1. 代码拆分
optimization: {
  splitChunks: {
    chunks: 'all'
  }
}

// 2. Tree Shaking
// package.json
"sideEffects": false

// 3. 压缩
new TerserPlugin()

// 4. 按需引入
import { Button } from 'antd';

// 5. externals
externals: {
  'react': 'React',
  'react-dom': 'ReactDOM'
}

// 6. DllPlugin（已过时，使用 hard-source-webpack-plugin）

// 7. 分析
new BundleAnalyzerPlugin()
```

### Q10: React 性能优化手段？

见 7.2 节

---

## 面试技巧

### 答题思路
1. **指标定义**：什么指标 → 标准值 → 测量方法
2. **优化方案**：问题分析 → 优化手段 → 效果对比
3. **工具使用**：Chrome DevTools → Lighthouse → 第三方工具

### 常见陷阱
1. 过度优化（性能 vs 可维护性）
2. 忽略真实场景（本地快≠用户快）
3. 只关注加载（运行时性能同样重要）
4. 忽略监控（优化后要持续监控）

### 加分项
1. 了解 Web Vitals
2. 有实际优化经验（数据对比）
3. 熟悉性能分析工具
4. 关注用户体验（不只是数字）
5. 了解 HTTP/2、HTTP/3 等新技术

---

**性能优化原则**：
1. **测量优先**：先测量，再优化
2. **关注瓶颈**：80/20 原则
3. **渐进增强**：基础功能优先
4. **持续监控**：优化是持续的过程
5. **用户为中心**：感知性能 > 实际性能
