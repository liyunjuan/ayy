# React/Vue 框架深度面试指南

## 目录

### React 部分
1. [React 核心原理](#react-1-核心原理)
2. [Fiber 架构](#react-2-fiber-架构)
3. [Hooks 原理](#react-3-hooks-原理)
4. [状态管理](#react-4-状态管理)
5. [性能优化](#react-5-性能优化)

### Vue 部分
6. [Vue 核心原理](#vue-6-核心原理)
7. [响应式系统](#vue-7-响应式系统)
8. [虚拟 DOM 与 Diff](#vue-8-虚拟-dom-与-diff)
9. [Composition API](#vue-9-composition-api)
10. [性能优化](#vue-10-性能优化)

### 通用部分
11. [框架对比](#11-框架对比)
12. [经典面试题](#12-经典面试题)

---

# React 部分

## React 1. 核心原理

### 1.1 JSX 转换

```jsx
// JSX 代码
const element = <h1 className="title">Hello, {name}!</h1>;

// Babel 转换（React 17 之前）
const element = React.createElement(
  'h1',
  { className: 'title' },
  'Hello, ',
  name,
  '!'
);

// React 17+ 新转换
import { jsx as _jsx } from 'react/jsx-runtime';
const element = _jsx('h1', {
  className: 'title',
  children: ['Hello, ', name, '!']
});

// createElement 实现
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === 'object' ? child : createTextElement(child)
      )
    }
  };
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  };
}
```

### 1.2 虚拟 DOM

```javascript
// 虚拟 DOM 结构
const vdom = {
  type: 'div',
  props: {
    className: 'container',
    children: [
      {
        type: 'h1',
        props: {
          children: [{ type: 'TEXT_ELEMENT', props: { nodeValue: 'Hello' } }]
        }
      },
      {
        type: 'p',
        props: {
          children: [{ type: 'TEXT_ELEMENT', props: { nodeValue: 'World' } }]
        }
      }
    ]
  }
};

// 渲染到真实 DOM
function render(vdom, container) {
  // 创建 DOM 节点
  const dom = vdom.type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(vdom.type);
  
  // 设置属性
  Object.keys(vdom.props)
    .filter(key => key !== 'children')
    .forEach(name => {
      dom[name] = vdom.props[name];
    });
  
  // 递归渲染子节点
  vdom.props.children.forEach(child => {
    render(child, dom);
  });
  
  // 挂载到容器
  container.appendChild(dom);
}
```

### 1.3 Reconciliation（协调）

```javascript
// Diff 算法（简化版）
function reconcile(parentDom, oldFiber, newVdom) {
  // 1. 类型相同，复用 DOM
  if (oldFiber && newVdom && oldFiber.type === newVdom.type) {
    return {
      ...newVdom,
      dom: oldFiber.dom,
      alternate: oldFiber,
      effectTag: 'UPDATE'
    };
  }
  
  // 2. 类型不同，创建新 DOM
  if (newVdom) {
    return {
      ...newVdom,
      dom: null,
      alternate: null,
      effectTag: 'PLACEMENT'
    };
  }
  
  // 3. 没有新节点，删除旧 DOM
  if (oldFiber) {
    return {
      ...oldFiber,
      effectTag: 'DELETION'
    };
  }
}

// 提交更新
function commitWork(fiber) {
  if (!fiber) return;
  
  const parentDom = fiber.parent.dom;
  
  if (fiber.effectTag === 'PLACEMENT' && fiber.dom) {
    parentDom.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === 'DELETION') {
    parentDom.removeChild(fiber.dom);
  }
  
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
```

---

## React 2. Fiber 架构

### 2.1 为什么需要 Fiber？

```
React 15 的问题：
• 递归遍历虚拟 DOM 树
• 同步执行，无法中断
• 大型应用卡顿

Fiber 解决方案：
• 可中断的递归
• 时间切片（Time Slicing）
• 优先级调度
• 并发模式（Concurrent Mode）
```

### 2.2 Fiber 数据结构

```javascript
// Fiber 节点结构
const fiber = {
  // 类型信息
  type: 'div',           // 元素类型或组件
  key: null,             // key
  
  // 关系指针
  parent: parentFiber,   // 父节点
  child: childFiber,     // 第一个子节点
  sibling: siblingFiber, // 下一个兄弟节点
  
  // 状态
  props: {},             // 属性
  state: {},             // 状态
  hooks: [],             // Hooks
  
  // 副作用
  effectTag: 'UPDATE',   // 'PLACEMENT' | 'UPDATE' | 'DELETION'
  effects: [],           // 副作用列表
  
  // DOM
  dom: domNode,          // 真实 DOM 节点
  
  // 双缓冲
  alternate: oldFiber,   // 旧 Fiber（上一次渲染）
};

// Fiber 树结构
// 
//        App
//       /
//     div
//    /   \
//   h1    p
//
// 链表结构：
// App.child → div
// div.child → h1
// h1.sibling → p
```

### 2.3 工作循环

```javascript
// 全局变量
let nextUnitOfWork = null;    // 下一个工作单元
let wipRoot = null;            // 工作中的根节点
let currentRoot = null;        // 当前根节点
let deletions = [];            // 待删除节点

// 主循环
function workLoop(deadline) {
  let shouldYield = false;
  
  while (nextUnitOfWork && !shouldYield) {
    // 执行工作单元
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    
    // 检查是否需要让出控制权
    shouldYield = deadline.timeRemaining() < 1;
  }
  
  // 所有工作完成，提交更新
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  
  // 请求下一帧
  requestIdleCallback(workLoop);
}

// 启动工作循环
requestIdleCallback(workLoop);

// 执行工作单元
function performUnitOfWork(fiber) {
  // 1. 执行工作
  if (fiber.type instanceof Function) {
    // 函数组件
    updateFunctionComponent(fiber);
  } else {
    // 原生 DOM 元素
    updateHostComponent(fiber);
  }
  
  // 2. 返回下一个工作单元（深度优先遍历）
  if (fiber.child) {
    return fiber.child;
  }
  
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}
```

### 2.4 两阶段提交

```javascript
// Render 阶段（可中断）
function performUnitOfWork(fiber) {
  // 构建 Fiber 树
  // 标记副作用
  // 可以被打断
}

// Commit 阶段（不可中断）
function commitRoot() {
  // 1. 处理删除
  deletions.forEach(commitWork);
  
  // 2. 处理更新和新增
  commitWork(wipRoot.child);
  
  // 3. 执行生命周期
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) return;
  
  // 同步处理所有 DOM 操作
  const parentDom = fiber.parent.dom;
  
  if (fiber.effectTag === 'PLACEMENT') {
    parentDom.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE') {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, parentDom);
  }
  
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
```

### 2.5 优先级调度

```javascript
// 优先级等级（Scheduler 包）
const ImmediatePriority = 1;      // 立即执行（点击、输入）
const UserBlockingPriority = 2;   // 用户交互（滚动、拖拽）
const NormalPriority = 3;         // 正常（数据请求）
const LowPriority = 4;            // 低优先级（分析）
const IdlePriority = 5;           // 空闲时（预加载）

// 调度更新
function scheduleUpdateOnFiber(fiber, lane) {
  // 标记更新
  markUpdateLaneFromFiberToRoot(fiber, lane);
  
  // 调度
  if (lane === ImmediatePriority) {
    performSyncWorkOnRoot(fiber);
  } else {
    scheduleCallback(lane, () => {
      performConcurrentWorkOnRoot(fiber);
    });
  }
}

// Lane 模型（React 18）
// 使用位运算管理优先级
const SyncLane = 0b0001;
const InputContinuousLane = 0b0010;
const DefaultLane = 0b0100;
const IdleLane = 0b1000;

// 合并优先级
const lanes = SyncLane | DefaultLane; // 0b0101

// 检查是否包含某个优先级
const hasSync = (lanes & SyncLane) !== 0;
```

---

## React 3. Hooks 原理

### 3.1 useState

```javascript
// 全局变量
let workInProgressHook = null;  // 当前 Hook
let currentHook = null;          // 旧 Hook

// useState 实现
function useState(initialState) {
  // 获取当前 Hook
  const hook = workInProgressHook || {
    state: initialState,
    queue: [],        // 更新队列
    next: null
  };
  
  // 执行更新队列
  hook.queue.forEach(action => {
    hook.state = typeof action === 'function'
      ? action(hook.state)
      : action;
  });
  hook.queue = [];
  
  // setState 函数
  const setState = (action) => {
    hook.queue.push(action);
    // 触发重新渲染
    scheduleUpdate();
  };
  
  // 保存 Hook
  workInProgressHook = hook;
  
  return [hook.state, setState];
}

// Hook 链表
// Fiber.hooks → hook1 → hook2 → hook3

// 为什么 Hook 不能在条件语句中？
// 因为依赖 Hook 调用顺序来匹配旧的 Hook
// 
// 错误示例：
function Component() {
  if (condition) {
    useState(0);  // 条件调用，顺序可能变化
  }
  useState('');   // 第几个 Hook 不确定
}
```

### 3.2 useEffect

```javascript
// useEffect 实现
function useEffect(callback, deps) {
  const hook = {
    callback,
    deps,
    cleanup: null
  };
  
  // 检查依赖是否变化
  const oldHook = currentHook;
  const hasChanged = !oldHook || !deps || deps.some((dep, i) => {
    return dep !== oldHook.deps[i];
  });
  
  if (hasChanged) {
    // 标记副作用
    fiber.effects.push({
      type: 'EFFECT',
      hook
    });
  }
  
  workInProgressHook = hook;
}

// 执行副作用（Commit 阶段）
function commitEffects(fiber) {
  fiber.effects.forEach(effect => {
    if (effect.type === 'EFFECT') {
      // 执行清理函数
      if (effect.hook.cleanup) {
        effect.hook.cleanup();
      }
      
      // 执行副作用
      effect.hook.cleanup = effect.hook.callback();
    }
  });
}

// useEffect 执行时机
// 1. 浏览器完成布局和绘制之后
// 2. 异步执行，不阻塞渲染

// useLayoutEffect vs useEffect
// useLayoutEffect: 同步执行，在 DOM 更新后、浏览器绘制前
// useEffect: 异步执行，在浏览器绘制后
```

### 3.3 useRef

```javascript
// useRef 实现
function useRef(initialValue) {
  const hook = workInProgressHook || {
    current: initialValue
  };
  
  workInProgressHook = hook;
  
  return hook;
}

// useRef vs useState
// • useRef 修改不触发重新渲染
// • useState 修改触发重新渲染
// • useRef 返回可变对象
// • useState 返回不可变值

// 使用场景
function Component() {
  const inputRef = useRef(null);
  const countRef = useRef(0);
  
  useEffect(() => {
    // 访问 DOM
    inputRef.current.focus();
    
    // 保存不需要触发渲染的值
    countRef.current++;
  });
  
  return <input ref={inputRef} />;
}
```

### 3.4 useMemo & useCallback

```javascript
// useMemo 实现
function useMemo(factory, deps) {
  const hook = workInProgressHook || {
    value: undefined,
    deps: undefined
  };
  
  const oldHook = currentHook;
  const hasChanged = !oldHook || !deps || deps.some((dep, i) => {
    return dep !== oldHook.deps[i];
  });
  
  if (hasChanged) {
    hook.value = factory();
    hook.deps = deps;
  }
  
  workInProgressHook = hook;
  return hook.value;
}

// useCallback 实现
function useCallback(callback, deps) {
  return useMemo(() => callback, deps);
}

// 使用场景
function Parent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  
  // 没有 useCallback，Child 每次都重新渲染
  const handleClick = () => {
    console.log(count);
  };
  
  // 有 useCallback，只在 count 变化时重新创建
  const memoizedHandleClick = useCallback(() => {
    console.log(count);
  }, [count]);
  
  return (
    <>
      <input value={text} onChange={e => setText(e.target.value)} />
      <Child onClick={memoizedHandleClick} />
    </>
  );
}

const Child = React.memo(({ onClick }) => {
  console.log('Child render');
  return <button onClick={onClick}>Click</button>;
});
```

### 3.5 自定义 Hook

```javascript
// 1. useLocalStorage
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });
  
  const setStoredValue = (value) => {
    setValue(value);
    localStorage.setItem(key, JSON.stringify(value));
  };
  
  return [value, setStoredValue];
}

// 2. useDebounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

// 3. useFetch
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setData(data);
          setLoading(false);
        }
      })
      .catch(error => {
        if (!cancelled) {
          setError(error);
          setLoading(false);
        }
      });
    
    return () => {
      cancelled = true;
    };
  }, [url]);
  
  return { data, loading, error };
}

// 4. useEventListener
function useEventListener(eventName, handler, element = window) {
  const savedHandler = useRef();
  
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  
  useEffect(() => {
    const eventListener = (event) => savedHandler.current(event);
    element.addEventListener(eventName, eventListener);
    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}
```

---

## React 4. 状态管理

### 4.1 Context

```javascript
// 创建 Context
const ThemeContext = React.createContext('light');

// Provider
function App() {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

// Consumer
function ThemedButton() {
  const { theme, setTheme } = useContext(ThemeContext);
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current theme: {theme}
    </button>
  );
}

// Context 原理
// 1. Provider 将 value 存储到 Fiber 节点
// 2. Consumer 向上查找最近的 Provider
// 3. value 变化时，通知所有 Consumer 重新渲染

// 性能问题
// Context value 变化，所有 Consumer 都会重新渲染
// 解决方案：拆分 Context
const ThemeContext = React.createContext();
const ThemeUpdateContext = React.createContext();

function App() {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext.Provider value={theme}>
      <ThemeUpdateContext.Provider value={setTheme}>
        <Toolbar />
      </ThemeUpdateContext.Provider>
    </ThemeContext.Provider>
  );
}
```

### 4.2 Redux

```javascript
// Store
const store = createStore(reducer, initialState, enhancer);

// Reducer
function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    default:
      return state;
  }
}

// Action Creator
function increment() {
  return { type: 'INCREMENT' };
}

// Dispatch
store.dispatch(increment());

// Subscribe
store.subscribe(() => {
  console.log(store.getState());
});

// Redux 原理（简化版）
function createStore(reducer, initialState) {
  let state = initialState;
  let listeners = [];
  
  const getState = () => state;
  
  const dispatch = (action) => {
    state = reducer(state, action);
    listeners.forEach(listener => listener());
  };
  
  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  };
  
  return { getState, dispatch, subscribe };
}

// React-Redux
import { Provider, useSelector, useDispatch } from 'react-redux';

function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  );
}

function Counter() {
  const count = useSelector(state => state.count);
  const dispatch = useDispatch();
  
  return (
    <>
      <div>{count}</div>
      <button onClick={() => dispatch(increment())}>+</button>
    </>
  );
}
```

### 4.3 Zustand

```javascript
import create from 'zustand';

// 创建 Store
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 }))
}));

// 使用
function Counter() {
  const { count, increment, decrement } = useStore();
  
  return (
    <>
      <div>{count}</div>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </>
  );
}

// 部分订阅（性能优化）
function Counter() {
  const count = useStore(state => state.count);
  // 只在 count 变化时重新渲染
}
```

---

## React 5. 性能优化

### 5.1 React.memo

```javascript
// 防止不必要的重新渲染
const Child = React.memo(({ name }) => {
  console.log('Child render');
  return <div>{name}</div>;
});

// 自定义比较函数
const Child = React.memo(
  ({ name, age }) => <div>{name}, {age}</div>,
  (prevProps, nextProps) => {
    // 返回 true 表示不重新渲染
    return prevProps.name === nextProps.name;
  }
);

// 原理
// 浅比较 props，相同则跳过渲染
```

### 5.2 useMemo & useCallback

见 3.4 节

### 5.3 列表优化

```javascript
// 1. 使用 key
function List({ items }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

// 2. 虚拟滚动
import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>{items[index].name}</div>
      )}
    </FixedSizeList>
  );
}

// 3. 分页/懒加载
function InfiniteList() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  
  useEffect(() => {
    fetch(`/api/items?page=${page}`)
      .then(res => res.json())
      .then(data => setItems([...items, ...data]));
  }, [page]);
  
  return (
    <div onScroll={handleScroll}>
      {items.map(item => <div key={item.id}>{item.name}</div>)}
    </div>
  );
}
```

### 5.4 代码分割

```javascript
// 1. React.lazy
const LazyComponent = React.lazy(() => import('./Component'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}

// 2. 路由懒加载
const Home = React.lazy(() => import('./pages/Home'));
const About = React.lazy(() => import('./pages/About'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
```

### 5.5 并发特性（React 18）

```javascript
// 1. useTransition
function App() {
  const [isPending, startTransition] = useTransition();
  const [input, setInput] = useState('');
  const [list, setList] = useState([]);
  
  const handleChange = (e) => {
    setInput(e.target.value);
    
    // 低优先级更新
    startTransition(() => {
      const result = filterList(e.target.value);
      setList(result);
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

// 2. useDeferredValue
function App() {
  const [input, setInput] = useState('');
  const deferredInput = useDeferredValue(input);
  
  return (
    <>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <List query={deferredInput} />
    </>
  );
}

// 3. Suspense for Data Fetching
function User({ userId }) {
  const user = use(fetchUser(userId)); // use() API
  return <div>{user.name}</div>;
}

function App() {
  return (
    <Suspense fallback={<div>Loading user...</div>}>
      <User userId={1} />
    </Suspense>
  );
}
```

---

# Vue 部分

## Vue 6. 核心原理

### 6.1 模板编译

```vue
<!-- 模板 -->
<template>
  <div id="app">
    <h1>{{ title }}</h1>
    <button @click="increment">{{ count }}</button>
  </div>
</template>

<!-- 编译后 -->
<script>
import { createVNode as _createVNode, toDisplayString as _toDisplayString } from 'vue'

export function render(_ctx) {
  return _createVNode('div', { id: 'app' }, [
    _createVNode('h1', null, _toDisplayString(_ctx.title)),
    _createVNode('button', {
      onClick: _ctx.increment
    }, _toDisplayString(_ctx.count))
  ])
}
</script>
```

**编译流程**：

```
Template → Parse → AST → Transform → Generate → Render Function

1. Parse: 模板 → AST（抽象语法树）
2. Transform: AST 优化（静态提升、事件缓存）
3. Generate: AST → 渲染函数代码
```

### 6.2 虚拟 DOM

```javascript
// VNode 结构
const vnode = {
  type: 'div',           // 元素类型
  props: {               // 属性
    id: 'app',
    onClick: handleClick
  },
  children: [            // 子节点
    { type: 'h1', children: 'Hello' },
    { type: 'p', children: 'World' }
  ],
  el: null,              // 真实 DOM 节点
  shapeFlag: 9,          // 标记类型
  patchFlag: 0,          // 优化标记
  dynamicProps: null,    // 动态属性
  key: null              // key
};

// 创建 VNode
function createVNode(type, props, children) {
  const shapeFlag = typeof type === 'string'
    ? ShapeFlags.ELEMENT
    : ShapeFlags.COMPONENT;
  
  return {
    type,
    props,
    children,
    shapeFlag,
    patchFlag: 0,
    el: null,
    key: props?.key || null
  };
}

// ShapeFlags（类型标记）
const ShapeFlags = {
  ELEMENT: 1,                  // 0001
  FUNCTIONAL_COMPONENT: 2,     // 0010
  STATEFUL_COMPONENT: 4,       // 0100
  TEXT_CHILDREN: 8,            // 1000
  ARRAY_CHILDREN: 16,          // 10000
  SLOTS_CHILDREN: 32,          // 100000
};
```

---

## Vue 7. 响应式系统

### 7.1 Vue 2 响应式（Object.defineProperty）

```javascript
// 简化实现
function defineReactive(obj, key, val) {
  const dep = new Dep(); // 依赖收集器
  
  Object.defineProperty(obj, key, {
    get() {
      // 依赖收集
      if (Dep.target) {
        dep.depend();
      }
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      val = newVal;
      // 通知更新
      dep.notify();
    }
  });
}

// Dep 类
class Dep {
  constructor() {
    this.subs = []; // 订阅者列表
  }
  
  depend() {
    if (Dep.target) {
      this.subs.push(Dep.target);
    }
  }
  
  notify() {
    this.subs.forEach(sub => sub.update());
  }
}

// Watcher 类
class Watcher {
  constructor(vm, exp, cb) {
    this.vm = vm;
    this.exp = exp;
    this.cb = cb;
    this.value = this.get();
  }
  
  get() {
    Dep.target = this;
    const value = this.vm[this.exp];
    Dep.target = null;
    return value;
  }
  
  update() {
    const newValue = this.get();
    if (newValue !== this.value) {
      this.value = newValue;
      this.cb.call(this.vm, newValue);
    }
  }
}

// 使用
const data = { count: 0 };
defineReactive(data, 'count', 0);

new Watcher(data, 'count', (newVal) => {
  console.log('count changed:', newVal);
});

data.count = 1; // 触发更新
```

**Vue 2 响应式问题**：

```javascript
// 1. 无法检测对象属性的添加/删除
const obj = { a: 1 };
obj.b = 2; // 不会触发更新

// 解决：Vue.set
Vue.set(obj, 'b', 2);

// 2. 无法检测数组索引和长度变化
const arr = [1, 2, 3];
arr[0] = 10; // 不会触发更新
arr.length = 0; // 不会触发更新

// 解决：重写数组方法
const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);

['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(method => {
  arrayMethods[method] = function(...args) {
    const result = arrayProto[method].apply(this, args);
    // 触发更新
    dep.notify();
    return result;
  };
});
```

### 7.2 Vue 3 响应式（Proxy）

```javascript
// reactive 实现
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      // 依赖收集
      track(target, key);
      const result = Reflect.get(target, key, receiver);
      
      // 深度响应
      if (typeof result === 'object' && result !== null) {
        return reactive(result);
      }
      
      return result;
    },
    
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      
      // 触发更新
      if (oldValue !== value) {
        trigger(target, key);
      }
      
      return result;
    },
    
    deleteProperty(target, key) {
      const hadKey = hasOwn(target, key);
      const result = Reflect.deleteProperty(target, key);
      
      if (hadKey && result) {
        trigger(target, key);
      }
      
      return result;
    }
  });
}

// 依赖收集
const targetMap = new WeakMap(); // WeakMap<target, Map<key, Set<effect>>>
let activeEffect = null;

function track(target, key) {
  if (!activeEffect) return;
  
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  
  dep.add(activeEffect);
}

// 触发更新
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  
  const dep = depsMap.get(key);
  if (!dep) return;
  
  dep.forEach(effect => effect());
}

// effect 函数
function effect(fn) {
  const effectFn = () => {
    activeEffect = effectFn;
    fn();
    activeEffect = null;
  };
  
  effectFn();
  return effectFn;
}

// 使用
const state = reactive({ count: 0 });

effect(() => {
  console.log('count:', state.count);
});

state.count++; // 触发更新
```

### 7.3 ref vs reactive

```javascript
// ref：基本类型响应式
function ref(value) {
  return {
    _value: value,
    get value() {
      track(this, 'value');
      return this._value;
    },
    set value(newValue) {
      this._value = newValue;
      trigger(this, 'value');
    }
  };
}

// 使用
const count = ref(0);
console.log(count.value); // 0
count.value++; // 触发更新

// reactive：对象响应式
const state = reactive({ count: 0 });
console.log(state.count); // 0
state.count++; // 触发更新

// 对比
// • ref 适合基本类型，需要 .value
// • reactive 适合对象，直接访问属性
// • ref 可以包裹对象，但推荐用 reactive
```

### 7.4 computed

```javascript
// computed 实现
function computed(getter) {
  let value;
  let dirty = true; // 脏标记
  
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = true;
      trigger(obj, 'value');
    }
  });
  
  const obj = {
    get value() {
      if (dirty) {
        value = effectFn();
        dirty = false;
      }
      track(obj, 'value');
      return value;
    }
  };
  
  return obj;
}

// 使用
const count = ref(0);
const double = computed(() => count.value * 2);

console.log(double.value); // 0
count.value++; // 触发 computed 更新
console.log(double.value); // 2
```

### 7.5 watch

```javascript
// watch 实现
function watch(source, callback, options = {}) {
  let getter;
  
  if (typeof source === 'function') {
    getter = source;
  } else {
    getter = () => traverse(source);
  }
  
  let oldValue, newValue;
  
  const job = () => {
    newValue = effectFn();
    callback(newValue, oldValue);
    oldValue = newValue;
  };
  
  const effectFn = effect(getter, {
    lazy: true,
    scheduler: () => {
      if (options.flush === 'post') {
        Promise.resolve().then(job);
      } else {
        job();
      }
    }
  });
  
  if (options.immediate) {
    job();
  } else {
    oldValue = effectFn();
  }
}

// 深度遍历
function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || value === null || seen.has(value)) {
    return value;
  }
  
  seen.add(value);
  
  for (const key in value) {
    traverse(value[key], seen);
  }
  
  return value;
}

// 使用
const count = ref(0);

watch(
  () => count.value,
  (newValue, oldValue) => {
    console.log('count changed:', newValue, oldValue);
  },
  { immediate: true }
);
```

---

## Vue 8. 虚拟 DOM 与 Diff

### 8.1 挂载

```javascript
// mount 实现
function mount(vnode, container) {
  const { type, props, children } = vnode;
  
  // 创建元素
  const el = document.createElement(type);
  vnode.el = el;
  
  // 设置属性
  if (props) {
    for (const key in props) {
      if (key.startsWith('on')) {
        const eventName = key.slice(2).toLowerCase();
        el.addEventListener(eventName, props[key]);
      } else {
        el.setAttribute(key, props[key]);
      }
    }
  }
  
  // 处理子节点
  if (typeof children === 'string') {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    children.forEach(child => {
      mount(child, el);
    });
  }
  
  // 挂载到容器
  container.appendChild(el);
}
```

### 8.2 Diff 算法

```javascript
// patch 实现
function patch(n1, n2, container) {
  // n1: 旧 VNode
  // n2: 新 VNode
  
  // 1. 类型不同，直接替换
  if (n1.type !== n2.type) {
    unmount(n1);
    mount(n2, container);
    return;
  }
  
  // 2. 类型相同，更新
  const el = (n2.el = n1.el);
  
  // 更新属性
  patchProps(n1.props, n2.props, el);
  
  // 更新子节点
  patchChildren(n1.children, n2.children, el);
}

// 更新属性
function patchProps(oldProps, newProps, el) {
  // 更新/新增属性
  for (const key in newProps) {
    if (newProps[key] !== oldProps?.[key]) {
      if (key.startsWith('on')) {
        const eventName = key.slice(2).toLowerCase();
        el.removeEventListener(eventName, oldProps[key]);
        el.addEventListener(eventName, newProps[key]);
      } else {
        el.setAttribute(key, newProps[key]);
      }
    }
  }
  
  // 删除属性
  for (const key in oldProps) {
    if (!(key in newProps)) {
      el.removeAttribute(key);
    }
  }
}

// 更新子节点
function patchChildren(c1, c2, container) {
  // c1: 旧子节点
  // c2: 新子节点
  
  // 1. 新子节点是文本
  if (typeof c2 === 'string') {
    if (Array.isArray(c1)) {
      c1.forEach(child => unmount(child));
    }
    container.textContent = c2;
  }
  // 2. 新子节点是数组
  else if (Array.isArray(c2)) {
    if (Array.isArray(c1)) {
      // 双端 Diff
      patchKeyedChildren(c1, c2, container);
    } else {
      container.textContent = '';
      c2.forEach(child => mount(child, container));
    }
  }
  // 3. 新子节点为空
  else {
    if (Array.isArray(c1)) {
      c1.forEach(child => unmount(child));
    } else {
      container.textContent = '';
    }
  }
}
```

### 8.3 双端 Diff

```javascript
// 双端 Diff（Vue 2）
function patchKeyedChildren(c1, c2, container) {
  let oldStartIdx = 0;
  let oldEndIdx = c1.length - 1;
  let newStartIdx = 0;
  let newEndIdx = c2.length - 1;
  
  let oldStartVNode = c1[oldStartIdx];
  let oldEndVNode = c1[oldEndIdx];
  let newStartVNode = c2[newStartIdx];
  let newEndVNode = c2[newEndIdx];
  
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (!oldStartVNode) {
      oldStartVNode = c1[++oldStartIdx];
    } else if (!oldEndVNode) {
      oldEndVNode = c1[--oldEndIdx];
    }
    // 1. 旧头 vs 新头
    else if (oldStartVNode.key === newStartVNode.key) {
      patch(oldStartVNode, newStartVNode, container);
      oldStartVNode = c1[++oldStartIdx];
      newStartVNode = c2[++newStartIdx];
    }
    // 2. 旧尾 vs 新尾
    else if (oldEndVNode.key === newEndVNode.key) {
      patch(oldEndVNode, newEndVNode, container);
      oldEndVNode = c1[--oldEndIdx];
      newEndVNode = c2[--newEndIdx];
    }
    // 3. 旧头 vs 新尾
    else if (oldStartVNode.key === newEndVNode.key) {
      patch(oldStartVNode, newEndVNode, container);
      container.insertBefore(oldStartVNode.el, oldEndVNode.el.nextSibling);
      oldStartVNode = c1[++oldStartIdx];
      newEndVNode = c2[--newEndIdx];
    }
    // 4. 旧尾 vs 新头
    else if (oldEndVNode.key === newStartVNode.key) {
      patch(oldEndVNode, newStartVNode, container);
      container.insertBefore(oldEndVNode.el, oldStartVNode.el);
      oldEndVNode = c1[--oldEndIdx];
      newStartVNode = c2[++newStartIdx];
    }
    // 5. 都没匹配，查找
    else {
      const idxInOld = c1.findIndex(node => node.key === newStartVNode.key);
      if (idxInOld > 0) {
        const vnodeToMove = c1[idxInOld];
        patch(vnodeToMove, newStartVNode, container);
        container.insertBefore(vnodeToMove.el, oldStartVNode.el);
        c1[idxInOld] = undefined;
      } else {
        mount(newStartVNode, container, oldStartVNode.el);
      }
      newStartVNode = c2[++newStartIdx];
    }
  }
  
  // 新增节点
  if (newStartIdx <= newEndIdx) {
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      mount(c2[i], container);
    }
  }
  
  // 删除节点
  if (oldStartIdx <= oldEndIdx) {
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      unmount(c1[i]);
    }
  }
}
```

### 8.4 快速 Diff（Vue 3）

```javascript
// 快速 Diff（最长递增子序列）
function patchKeyedChildren(c1, c2, container) {
  let i = 0;
  const l2 = c2.length;
  let e1 = c1.length - 1;
  let e2 = l2 - 1;
  
  // 1. 从头开始比较
  while (i <= e1 && i <= e2) {
    const n1 = c1[i];
    const n2 = c2[i];
    if (isSameVNodeType(n1, n2)) {
      patch(n1, n2, container);
    } else {
      break;
    }
    i++;
  }
  
  // 2. 从尾开始比较
  while (i <= e1 && i <= e2) {
    const n1 = c1[e1];
    const n2 = c2[e2];
    if (isSameVNodeType(n1, n2)) {
      patch(n1, n2, container);
    } else {
      break;
    }
    e1--;
    e2--;
  }
  
  // 3. 新增节点
  if (i > e1) {
    if (i <= e2) {
      while (i <= e2) {
        mount(c2[i], container);
        i++;
      }
    }
  }
  // 4. 删除节点
  else if (i > e2) {
    while (i <= e1) {
      unmount(c1[i]);
      i++;
    }
  }
  // 5. 乱序情况
  else {
    const s1 = i;
    const s2 = i;
    
    // 5.1 构建 key → index 映射
    const keyToNewIndexMap = new Map();
    for (i = s2; i <= e2; i++) {
      keyToNewIndexMap.set(c2[i].key, i);
    }
    
    // 5.2 遍历旧节点
    const toBePatched = e2 - s2 + 1;
    const newIndexToOldIndexMap = new Array(toBePatched).fill(0);
    let moved = false;
    let maxNewIndexSoFar = 0;
    
    for (i = s1; i <= e1; i++) {
      const prevChild = c1[i];
      const newIndex = keyToNewIndexMap.get(prevChild.key);
      
      if (newIndex === undefined) {
        // 删除
        unmount(prevChild);
      } else {
        newIndexToOldIndexMap[newIndex - s2] = i + 1;
        
        if (newIndex >= maxNewIndexSoFar) {
          maxNewIndexSoFar = newIndex;
        } else {
          moved = true;
        }
        
        patch(prevChild, c2[newIndex], container);
      }
    }
    
    // 5.3 移动节点（最长递增子序列）
    const increasingNewIndexSequence = moved
      ? getSequence(newIndexToOldIndexMap)
      : [];
    
    let j = increasingNewIndexSequence.length - 1;
    for (i = toBePatched - 1; i >= 0; i--) {
      const nextIndex = s2 + i;
      const nextChild = c2[nextIndex];
      
      if (newIndexToOldIndexMap[i] === 0) {
        // 新增
        mount(nextChild, container);
      } else if (moved) {
        if (j < 0 || i !== increasingNewIndexSequence[j]) {
          // 移动
          move(nextChild, container);
        } else {
          j--;
        }
      }
    }
  }
}

// 最长递增子序列
function getSequence(arr) {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = ((u + v) / 2) | 0;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  
  return result;
}
```

---

## Vue 9. Composition API

### 9.1 setup

```javascript
// setup 函数
export default {
  setup(props, context) {
    // props: 响应式的 props
    // context: { attrs, slots, emit, expose }
    
    const count = ref(0);
    
    function increment() {
      count.value++;
    }
    
    // 返回给模板使用
    return {
      count,
      increment
    };
  }
};

// setup 语法糖
<script setup>
import { ref } from 'vue';

const count = ref(0);

function increment() {
  count.value++;
}
</script>
```

### 9.2 生命周期

```javascript
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted
} from 'vue';

export default {
  setup() {
    onBeforeMount(() => {
      console.log('beforeMount');
    });
    
    onMounted(() => {
      console.log('mounted');
    });
    
    onBeforeUpdate(() => {
      console.log('beforeUpdate');
    });
    
    onUpdated(() => {
      console.log('updated');
    });
    
    onBeforeUnmount(() => {
      console.log('beforeUnmount');
    });
    
    onUnmounted(() => {
      console.log('unmounted');
    });
  }
};
```

### 9.3 Composables

```javascript
// 1. useMouse
export function useMouse() {
  const x = ref(0);
  const y = ref(0);
  
  function update(event) {
    x.value = event.pageX;
    y.value = event.pageY;
  }
  
  onMounted(() => {
    window.addEventListener('mousemove', update);
  });
  
  onUnmounted(() => {
    window.removeEventListener('mousemove', update);
  });
  
  return { x, y };
}

// 2. useFetch
export function useFetch(url) {
  const data = ref(null);
  const error = ref(null);
  const loading = ref(true);
  
  fetch(url)
    .then(res => res.json())
    .then(json => {
      data.value = json;
    })
    .catch(err => {
      error.value = err;
    })
    .finally(() => {
      loading.value = false;
    });
  
  return { data, error, loading };
}

// 3. useLocalStorage
export function useLocalStorage(key, defaultValue) {
  const value = ref(defaultValue);
  
  const item = localStorage.getItem(key);
  if (item) {
    value.value = JSON.parse(item);
  }
  
  watch(value, (newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue));
  });
  
  return value;
}
```

---

## Vue 10. 性能优化

### 10.1 编译优化

```vue
<!-- 静态提升 -->
<template>
  <div>
    <h1>Static Title</h1> <!-- 静态节点，提升到渲染函数外 -->
    <p>{{ message }}</p>
  </div>
</template>

<!-- 编译后 -->
<script>
const _hoisted_1 = _createVNode('h1', null, 'Static Title');

export function render(_ctx) {
  return _createVNode('div', null, [
    _hoisted_1, // 复用静态节点
    _createVNode('p', null, _toDisplayString(_ctx.message))
  ]);
}
</script>
```

**PatchFlag（更新标记）**：

```javascript
// 动态文本
<div>{{ message }}</div>
// PatchFlag: 1 (TEXT)

// 动态 class
<div :class="dynamicClass"></div>
// PatchFlag: 2 (CLASS)

// 动态 style
<div :style="dynamicStyle"></div>
// PatchFlag: 4 (STYLE)

// 动态属性
<div :id="dynamicId"></div>
// PatchFlag: 8 (PROPS)

// 完全静态
<div>Static</div>
// PatchFlag: -1 (HOISTED)
```

### 10.2 组件优化

```vue
<!-- 1. v-once -->
<template>
  <div v-once>
    <!-- 只渲染一次，不再更新 -->
    {{ expensiveComputation() }}
  </div>
</template>

<!-- 2. v-memo (Vue 3.2+) -->
<template>
  <div v-memo="[value1, value2]">
    <!-- 只在 value1 或 value2 变化时更新 -->
    {{ expensiveRender() }}
  </div>
</template>

<!-- 3. KeepAlive -->
<template>
  <KeepAlive>
    <component :is="currentView" />
  </KeepAlive>
</template>

<!-- 4. 异步组件 -->
<script setup>
import { defineAsyncComponent } from 'vue';

const AsyncComponent = defineAsyncComponent(() =>
  import('./Component.vue')
);
</script>
```

### 10.3 列表优化

```vue
<!-- 1. 使用 key -->
<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </ul>
</template>

<!-- 2. 虚拟滚动 -->
<script setup>
import { ref, computed } from 'vue';

const items = ref([...]);
const scrollTop = ref(0);
const itemHeight = 50;
const visibleCount = 20;

const visibleItems = computed(() => {
  const start = Math.floor(scrollTop.value / itemHeight);
  return items.value.slice(start, start + visibleCount);
});
</script>

<template>
  <div
    @scroll="scrollTop = $event.target.scrollTop"
    style="height: 1000px; overflow: auto;"
  >
    <div :style="{ height: items.length * itemHeight + 'px' }">
      <div
        v-for="item in visibleItems"
        :key="item.id"
        :style="{
          transform: `translateY(${item.index * itemHeight}px)`
        }"
      >
        {{ item.name }}
      </div>
    </div>
  </div>
</template>
```

### 10.4 响应式优化

```javascript
// 1. shallowRef（浅层响应）
const state = shallowRef({ count: 0 });
state.value.count++; // 不会触发更新
state.value = { count: 1 }; // 触发更新

// 2. shallowReactive
const state = shallowReactive({ nested: { count: 0 } });
state.nested.count++; // 不会触发更新
state.nested = { count: 1 }; // 触发更新

// 3. readonly
const original = reactive({ count: 0 });
const copy = readonly(original);
// copy.count++; // 警告

// 4. markRaw（标记为非响应式）
const obj = markRaw({ count: 0 });
const state = reactive({ obj });
state.obj.count++; // 不会触发更新
```

---

# 通用部分

## 11. 框架对比

### 11.1 核心差异

| 特性 | React | Vue |
|------|-------|-----|
| **数据流** | 单向数据流 | 双向绑定（v-model） |
| **模板** | JSX（更灵活） | Template（更易读） |
| **响应式** | 手动 setState/useState | 自动追踪依赖 |
| **学习曲线** | 陡峭（函数式编程） | 平缓（模板语法） |
| **性能** | Fiber 时间切片 | 编译优化、静态提升 |
| **生态** | 更丰富 | 官方维护更完善 |
| **TypeScript** | 完善 | 3.0+ 完善 |

### 11.2 适用场景

**React 适合**：
- 大型复杂应用
- 需要灵活性和可扩展性
- 团队有函数式编程经验
- 移动端（React Native）

**Vue 适合**：
- 中小型应用
- 快速开发
- 团队经验较少
- 渐进式接入

---

## 12. 经典面试题

### Q1: React Fiber 是什么？解决了什么问题？

见 React 2.1-2.5 节

### Q2: React Hooks 为什么不能在条件语句中？

见 React 3.1 节

### Q3: Vue 2 和 Vue 3 响应式的区别？

见 Vue 7.1-7.2 节

### Q4: Vue 的 Diff 算法？

见 Vue 8.2-8.4 节

### Q5: React 和 Vue 如何选择？

见 11.1-11.2 节

### Q6: useEffect 和 useLayoutEffect 的区别？

```
useEffect:
• 异步执行
• 在浏览器绘制后执行
• 不阻塞渲染

useLayoutEffect:
• 同步执行
• 在 DOM 更新后、浏览器绘制前执行
• 会阻塞渲染
• 适合需要同步测量 DOM 的场景
```

### Q7: Vue computed 和 watch 的区别？

```
computed:
• 计算属性
• 有缓存
• 依赖其他数据
• 必须有返回值

watch:
• 监听器
• 无缓存
• 监听数据变化
• 执行副作用
```

### Q8: React 性能优化手段？

见 React 5 节

### Q9: Vue 性能优化手段？

见 Vue 10 节

### Q10: 虚拟 DOM 一定比真实 DOM 快吗？

```
不一定！

虚拟 DOM 的优势：
• 减少不必要的 DOM 操作
• 批量更新
• 跨平台

虚拟 DOM 的劣势：
• 首次渲染慢（需要构建虚拟 DOM）
• 简单更新可能比直接操作 DOM 慢

结论：
虚拟 DOM 是一种权衡，通过牺牲部分性能换取：
• 更好的开发体验
• 更容易的状态管理
• 跨平台能力
```

---

## 面试技巧

### 答题思路
1. **原理题**：是什么 → 为什么 → 怎么做 → 示例
2. **对比题**：列举差异 → 分析原因 → 适用场景
3. **优化题**：现状 → 瓶颈 → 方案 → 效果

### 常见陷阱
1. Hooks 依赖调用顺序
2. useEffect 是异步的
3. Vue 2 响应式的局限性
4. 虚拟 DOM 不一定更快
5. React.memo 和 useMemo 的区别

### 加分项
1. 了解源码实现
2. 有性能优化实战经验
3. 能对比不同方案的优劣
4. 了解最新特性（React 18 Concurrent、Vue 3.4）
5. 有造轮子经验（实现简易版框架）
