# React 版本特性对比（17 vs 18 vs 19）

## 快速对比表

| 特性 | React 17 | React 18 | React 19 |
|------|----------|----------|----------|
| 发布时间 | 2020.10 | 2022.03 | 2024.12 |
| 定位 | 过渡版本 | 并发特性 | 全栈框架 |
| 核心变化 | 事件系统重构 | Concurrent Mode | Server Components |
| JSX 转换 | 新 JSX Transform | 同 17 | 同 17 |
| 并发渲染 | ❌ | ✅ | ✅（增强） |
| Server Components | ❌ | ❌ | ✅ |
| Automatic Batching | ❌ | ✅ | ✅ |
| Suspense | 基础支持 | 完整支持 | 增强支持 |

---

## React 17（过渡版本）

### 发布时间
**2020 年 10 月**

### 核心理念
> "No New Features" - 没有面向开发者的新特性，主要是为了后续渐进式升级做准备

### 主要特性

#### 1. 新的 JSX 转换（JSX Transform）

**React 17 之前：**
```jsx
import React from 'react';

function App() {
  return <h1>Hello World</h1>;
}
```

**React 17+：**
```jsx
// 不再需要引入 React！
function App() {
  return <h1>Hello World</h1>;
}
```

**原理变化：**
```jsx
// 旧的转换（React 16）
React.createElement('h1', null, 'Hello World')

// 新的转换（React 17+）
import { jsx as _jsx } from 'react/jsx-runtime';
_jsx('h1', { children: 'Hello World' })
```

**优势：**
- 减少 bundle 体积
- 提升编译速度
- 未来可以进行更多优化

#### 2. 事件委托改变

**React 16 及之前：**
```
事件委托到 document 上
```

**React 17：**
```
事件委托到 root 容器上
```

**示例：**
```jsx
// React 17+
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// 事件现在委托到 #root 上，而不是 document
```

**为什么改变？**
- 支持多个 React 版本共存（微前端场景）
- 与其他库更好地集成
- 避免事件冒泡到 document 的问题

#### 3. 事件系统改进

**去除事件池（Event Pooling）：**
```jsx
// React 16：需要 e.persist()
function handleClick(e) {
  setTimeout(() => {
    console.log(e.type); // ❌ 错误：事件对象被重用了
  }, 100);
}

// React 17：不需要了
function handleClick(e) {
  setTimeout(() => {
    console.log(e.type); // ✅ 正常工作
  }, 100);
}
```

**对齐浏览器行为：**
```jsx
// onScroll 不再冒泡（与浏览器一致）
// onFocus/onBlur 使用原生的 focusin/focusout
```

#### 4. 组件可以返回 undefined

```jsx
// React 16：报错
function App() {
  return undefined; // ❌ Error
}

// React 17：不报错（但会警告）
function App() {
  return undefined; // ⚠️ Warning
}
```

---

## React 18（并发特性）

### 发布时间
**2022 年 3 月**

### 核心理念
> "Concurrent React" - 引入并发渲染，提升用户体验

### 主要特性

#### 1. 并发渲染（Concurrent Rendering）

**核心概念：**
- React 可以中断渲染过程
- 可以同时准备多个版本的 UI
- 优先处理紧急更新

**启用方式：**
```jsx
// React 17（旧）
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));

// React 18（新）
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

#### 2. 自动批处理（Automatic Batching）

**React 17：**
```jsx
function handleClick() {
  setCount(c => c + 1);    // 渲染 1 次
  setFlag(f => !f);        // 渲染 1 次
  // 总共渲染 2 次（在异步操作中）
}

setTimeout(() => {
  setCount(c => c + 1);    // 渲染 1 次
  setFlag(f => !f);        // 渲染 1 次
  // 不会批处理！
}, 1000);
```

**React 18：**
```jsx
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 总共渲染 1 次（自动批处理）
}

setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 只渲染 1 次（自动批处理）✅
}, 1000);

fetch('/api').then(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 只渲染 1 次 ✅
});
```

**如何退出批处理：**
```jsx
import { flushSync } from 'react-dom';

function handleClick() {
  flushSync(() => {
    setCount(c => c + 1); // 立即渲染
  });
  
  flushSync(() => {
    setFlag(f => !f); // 立即渲染
  });
  // 总共渲染 2 次
}
```

#### 3. Transitions API

**区分紧急和非紧急更新：**

```jsx
import { useTransition } from 'react';

function SearchResults() {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  function handleChange(e) {
    // 紧急更新：立即响应用户输入
    setQuery(e.target.value);
    
    // 非紧急更新：可以被中断
    startTransition(() => {
      setResults(searchData(e.target.value));
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <SearchResults results={results} />
    </>
  );
}
```

**对比：**
```jsx
// 不使用 Transition（React 17）
function handleChange(e) {
  setQuery(e.target.value);
  setResults(searchData(e.target.value)); // 阻塞输入
}

// 使用 Transition（React 18）
function handleChange(e) {
  setQuery(e.target.value); // 立即响应
  startTransition(() => {
    setResults(searchData(e.target.value)); // 可中断
  });
}
```

#### 4. 新的 Hooks

**useTransition：**
```jsx
const [isPending, startTransition] = useTransition();

// isPending: 是否有 transition 正在进行
// startTransition: 标记非紧急更新
```

**useDeferredValue：**
```jsx
function SearchResults({ query }) {
  // 延迟更新 deferredQuery
  const deferredQuery = useDeferredValue(query);
  
  // query 立即更新，deferredQuery 延迟更新
  const results = useMemo(() => 
    searchData(deferredQuery), 
    [deferredQuery]
  );
  
  return <Results results={results} />;
}
```

**useId：**
```jsx
function NameField() {
  // 生成唯一 ID（SSR 安全）
  const id = useId();
  
  return (
    <>
      <label htmlFor={id}>Name:</label>
      <input id={id} type="text" />
    </>
  );
}
```

**useSyncExternalStore：**
```jsx
// 用于库作者，订阅外部状态
function useStore(store) {
  const state = useSyncExternalStore(
    store.subscribe,  // 订阅
    store.getState    // 获取快照
  );
  return state;
}
```

**useInsertionEffect：**
```jsx
// 用于 CSS-in-JS 库
function useCSS(rule) {
  useInsertionEffect(() => {
    // 在 DOM 变更之前插入样式
    document.head.appendChild(createStyleNode(rule));
  });
}
```

#### 5. Suspense 改进

**React 18 之前：**
```jsx
// 只支持 React.lazy
<Suspense fallback={<Spinner />}>
  <LazyComponent />
</Suspense>
```

**React 18：**
```jsx
// 支持数据获取
<Suspense fallback={<Spinner />}>
  <UserProfile userId={123} />
</Suspense>

function UserProfile({ userId }) {
  // 使用支持 Suspense 的数据获取库
  const user = use(fetchUser(userId));
  return <div>{user.name}</div>;
}
```

#### 6. Strict Mode 变化

**React 18 开发模式：**
```jsx
// 组件会被挂载两次（检测副作用）
useEffect(() => {
  console.log('mounted'); // 会打印 2 次
  
  return () => {
    console.log('unmounted');
  };
}, []);
```

**模拟过程：**
```
1. 挂载组件
2. 触发 useEffect
3. 卸载组件（清理副作用）
4. 重新挂载组件
5. 重新触发 useEffect
```

---

## React 19（全栈框架）

### 发布时间
**2024 年 12 月（正式版）**

### 核心理念
> "Full-Stack React" - 前后端一体化，React 成为全栈框架

### 主要特性

#### 1. React Server Components（RSC）

**概念：**
- 在服务器上运行的组件
- 不会打包到客户端 bundle
- 可以直接访问后端资源

**Server Component：**
```jsx
// app/UserProfile.server.jsx
async function UserProfile({ userId }) {
  // 直接访问数据库（服务端）
  const user = await db.user.findById(userId);
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

**Client Component：**
```jsx
'use client'; // 标记为客户端组件

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

**混合使用：**
```jsx
// Server Component
async function Page() {
  const posts = await fetchPosts();
  
  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          {/* Client Component */}
          <LikeButton postId={post.id} />
        </div>
      ))}
    </div>
  );
}
```

**优势：**
```
✅ 减少客户端 JavaScript
✅ 直接访问后端资源
✅ 自动代码分割
✅ 更好的 SEO
✅ 更快的首屏加载
```

#### 2. Actions

**表单处理：**
```jsx
// React 18（旧方式）
function Form() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await submitForm({ name });
    } catch (error) {
      // 处理错误
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button disabled={loading}>Submit</button>
    </form>
  );
}
```

**React 19（Actions）：**
```jsx
function Form() {
  async function submitAction(formData) {
    'use server'; // Server Action
    
    const name = formData.get('name');
    await saveToDatabase({ name });
  }
  
  return (
    <form action={submitAction}>
      <input name="name" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

**useActionState Hook：**
```jsx
import { useActionState } from 'react';

function Form() {
  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      const name = formData.get('name');
      
      if (!name) {
        return { error: 'Name is required' };
      }
      
      await submitForm({ name });
      return { success: true };
    },
    { error: null, success: false }
  );
  
  return (
    <form action={formAction}>
      <input name="name" />
      {state.error && <p style={{ color: 'red' }}>{state.error}</p>}
      <button disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

**useOptimistic Hook：**
```jsx
import { useOptimistic } from 'react';

function TodoList({ todos }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo) => [...state, { ...newTodo, pending: true }]
  );
  
  async function handleAdd(formData) {
    const title = formData.get('title');
    
    // 立即显示（乐观更新）
    addOptimisticTodo({ id: Date.now(), title });
    
    // 实际提交
    await submitTodo({ title });
  }
  
  return (
    <>
      {optimisticTodos.map(todo => (
        <div key={todo.id} style={{ opacity: todo.pending ? 0.5 : 1 }}>
          {todo.title}
        </div>
      ))}
      <form action={handleAdd}>
        <input name="title" />
        <button>Add</button>
      </form>
    </>
  );
}
```

#### 3. use Hook

**统一的资源获取：**
```jsx
import { use } from 'react';

function UserProfile({ userPromise }) {
  // 等待 Promise 完成
  const user = use(userPromise);
  
  return <div>{user.name}</div>;
}

// 使用
<Suspense fallback={<Spinner />}>
  <UserProfile userPromise={fetchUser(123)} />
</Suspense>
```

**读取 Context：**
```jsx
function Button() {
  // 可以在条件语句中使用
  if (someCondition) {
    const theme = use(ThemeContext);
    return <button className={theme}>Click</button>;
  }
  
  return <button>Default</button>;
}
```

**对比：**
```jsx
// React 18
function Component() {
  const value = useContext(MyContext); // ❌ 不能在条件中
  
  if (condition) {
    return <div>{value}</div>;
  }
}

// React 19
function Component() {
  if (condition) {
    const value = use(MyContext); // ✅ 可以在条件中
    return <div>{value}</div>;
  }
}
```

#### 4. ref 作为 prop

**React 18：**
```jsx
const MyInput = forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});
```

**React 19：**
```jsx
// 不需要 forwardRef！
function MyInput({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
```

#### 5. Context 改进

**React 18：**
```jsx
const ThemeContext = createContext(null);

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Page />
    </ThemeContext.Provider>
  );
}
```

**React 19：**
```jsx
const ThemeContext = createContext(null);

function App() {
  // 直接使用 Context 作为 Provider
  return (
    <ThemeContext value="dark">
      <Page />
    </ThemeContext>
  );
}
```

#### 6. 其他改进

**Document Metadata：**
```jsx
function Page() {
  return (
    <>
      <title>My Page</title>
      <meta name="description" content="Page description" />
      
      <div>Content</div>
    </>
  );
}
// title 和 meta 会自动提升到 <head>
```

**Stylesheet 优先级：**
```jsx
function Component() {
  return (
    <>
      <link rel="stylesheet" href="base.css" precedence="default" />
      <link rel="stylesheet" href="theme.css" precedence="high" />
      
      <div>Content</div>
    </>
  );
}
```

**async Scripts：**
```jsx
function Component() {
  return (
    <>
      <script src="analytics.js" async />
      <div>Content</div>
    </>
  );
}
// 自动去重，多次调用只加载一次
```

---

## 三个版本的核心区别

### 1. 渲染模式

```
React 17：同步渲染
- 一旦开始渲染，必须完成
- 长任务会阻塞用户交互

React 18：并发渲染
- 可以中断和恢复渲染
- 优先处理紧急更新
- 时间切片

React 19：并发渲染 + Server Components
- 服务端渲染部分
- 客户端渲染部分
- 无缝集成
```

### 2. 数据获取

```jsx
// React 17
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);
  
  if (!user) return <Spinner />;
  return <div>{user.name}</div>;
}

// React 18
function UserProfile({ userId }) {
  const user = use(fetchUser(userId)); // Suspense
  return <div>{user.name}</div>;
}

// React 19
async function UserProfile({ userId }) {
  const user = await db.user.findById(userId); // Server Component
  return <div>{user.name}</div>;
}
```

### 3. 状态更新

```jsx
// React 17
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
}
// 可能渲染 2 次（异步情况）

// React 18
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
}
// 自动批处理，只渲染 1 次

// React 19
function handleClick() {
  startTransition(() => {
    setCount(c => c + 1);
    setFlag(f => !f);
  });
}
// 可中断的批处理
```

### 4. 表单处理

```jsx
// React 17 & 18
function Form() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await submitForm({ name });
    setLoading(false);
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button disabled={loading}>Submit</button>
    </form>
  );
}

// React 19
function Form() {
  return (
    <form action={async (formData) => {
      'use server';
      await submitForm({ name: formData.get('name') });
    }}>
      <input name="name" />
      <button>Submit</button>
    </form>
  );
}
```

---

## 升级建议

### 从 React 17 升级到 18

**1. 更改入口：**
```jsx
// 旧
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));

// 新
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

**2. 处理自动批处理：**
```jsx
// 如果需要立即渲染
import { flushSync } from 'react-dom';

flushSync(() => {
  setCount(c => c + 1);
});
```

**3. 更新 TypeScript 类型：**
```bash
npm install --save-dev @types/react@18 @types/react-dom@18
```

**4. 测试 Strict Mode 双重调用：**
```jsx
useEffect(() => {
  // 确保清理函数正确
  return () => {
    // cleanup
  };
}, []);
```

### 从 React 18 升级到 19

**1. 使用新的 JSX runtime（如果还没有）**

**2. 迁移 forwardRef：**
```jsx
// 旧
const MyInput = forwardRef((props, ref) => {
  return <input ref={ref} />;
});

// 新
function MyInput({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
```

**3. 更新 Context 用法：**
```jsx
// 旧
<ThemeContext.Provider value="dark">

// 新
<ThemeContext value="dark">
```

**4. 考虑使用 Server Components（如果使用 Next.js 等框架）**

---

## 面试常考点

### Q1: React 18 的并发渲染是什么？

**答案：**
```
并发渲染允许 React 在渲染过程中：
1. 中断正在进行的渲染
2. 根据优先级调度不同的更新
3. 同时准备多个版本的 UI
4. 丢弃过期的渲染结果

核心 API：
- startTransition：标记非紧急更新
- useDeferredValue：延迟更新
- useTransition：获取 pending 状态

优势：
- 保持 UI 响应
- 避免阻塞用户交互
- 更好的用户体验
```

### Q2: React 19 的 Server Components 有什么优势？

**答案：**
```
优势：
1. 减少客户端 JavaScript 体积
2. 直接访问后端资源（数据库、文件系统）
3. 更好的首屏性能
4. 自动代码分割
5. 天然 SEO 优化

限制：
1. 不能使用 useState、useEffect 等 Hooks
2. 不能响应用户交互
3. 不能使用浏览器 API

使用场景：
- 数据获取
- 静态内容渲染
- SEO 关键页面
```

### Q3: React 18 的自动批处理和 React 17 有什么区别？

**答案：**
```jsx
// React 17
// 事件处理器中：批处理 ✅
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 只渲染 1 次
}

// 异步操作中：不批处理 ❌
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 渲染 2 次
}, 1000);

// React 18
// 所有地方都批处理 ✅
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 只渲染 1 次
}

setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 只渲染 1 次 ✅
}, 1000);

fetch('/api').then(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 只渲染 1 次 ✅
});
```

---

## 总结

| 版本 | 关键词 | 适用场景 |
|------|--------|----------|
| **React 17** | 过渡、稳定 | 维护老项目 |
| **React 18** | 并发、性能 | 大部分新项目 |
| **React 19** | 全栈、RSC | Next.js 等框架 |

**推荐：**
- 新项目：React 18+（稳定）
- 尝鲜：React 19（需要框架支持）
- 老项目：逐步升级到 18

---

**最后更新：2026-06-08**
