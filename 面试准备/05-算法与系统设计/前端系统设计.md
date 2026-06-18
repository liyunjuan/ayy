# 前端系统设计资深面试指南

## 目录
1. [系统设计基础](#1-系统设计基础)
2. [前端架构设计](#2-前端架构设计)
3. [组件设计](#3-组件设计)
4. [状态管理架构](#4-状态管理架构)
5. [大型应用设计](#5-大型应用设计)
6. [技术选型](#6-技术选型)
7. [性能设计](#7-性能设计)
8. [安全设计](#8-安全设计)
9. [实战案例](#9-实战案例)
10. [面试技巧](#10-面试技巧)

---

## 1. 系统设计基础

### 1.1 设计原则

```
SOLID 原则：

1. 单一职责原则（Single Responsibility）
   • 一个类/组件只做一件事
   • 降低耦合，提高内聚

2. 开闭原则（Open/Closed）
   • 对扩展开放，对修改关闭
   • 使用抽象和多态

3. 里氏替换原则（Liskov Substitution）
   • 子类可以替换父类
   • 不改变程序正确性

4. 接口隔离原则（Interface Segregation）
   • 接口最小化
   • 不强迫实现无用方法

5. 依赖倒置原则（Dependency Inversion）
   • 依赖抽象，不依赖具体
   • 高层模块不依赖低层模块

前端设计原则：

1. 组件化
2. 模块化
3. 分层架构
4. 关注点分离
5. 可测试性
6. 可维护性
7. 可扩展性
```

### 1.2 设计模式应用

```javascript
// 1. 单例模式（全局状态管理）
class Store {
  static instance = null;
  
  static getInstance() {
    if (!Store.instance) {
      Store.instance = new Store();
    }
    return Store.instance;
  }
  
  constructor() {
    if (Store.instance) {
      return Store.instance;
    }
    this.state = {};
    Store.instance = this;
  }
}

// 2. 工厂模式（组件创建）
class ComponentFactory {
  static create(type, props) {
    switch (type) {
      case 'button':
        return new Button(props);
      case 'input':
        return new Input(props);
      default:
        throw new Error(`Unknown type: ${type}`);
    }
  }
}

// 3. 观察者模式（事件系统）
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(cb => cb(data));
    }
  }
  
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}

// 4. 策略模式（表单验证）
class Validator {
  constructor() {
    this.strategies = {};
  }
  
  addStrategy(name, fn) {
    this.strategies[name] = fn;
  }
  
  validate(value, rules) {
    for (const rule of rules) {
      const [strategyName, ...args] = rule.split(':');
      const strategy = this.strategies[strategyName];
      
      if (!strategy(value, ...args)) {
        return false;
      }
    }
    return true;
  }
}

// 5. 装饰器模式（HOC）
function withLoading(Component) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) return <Loading />;
    return <Component {...props} />;
  };
}
```

---

## 2. 前端架构设计

### 2.1 分层架构

```
┌─────────────────────────────────────┐
│         View Layer (视图层)          │
│  • React/Vue Components             │
│  • UI 交互                          │
│  • 数据展示                         │
└─────────────────────────────────────┘
           ↓ ↑
┌─────────────────────────────────────┐
│      Controller Layer (控制层)       │
│  • 业务逻辑                         │
│  • 状态管理                         │
│  • 事件处理                         │
└─────────────────────────────────────┘
           ↓ ↑
┌─────────────────────────────────────┐
│       Service Layer (服务层)         │
│  • API 调用                         │
│  • 数据处理                         │
│  • 业务封装                         │
└─────────────────────────────────────┘
           ↓ ↑
┌─────────────────────────────────────┐
│       Data Layer (数据层)            │
│  • HTTP 请求                        │
│  • WebSocket                        │
│  • LocalStorage                     │
└─────────────────────────────────────┘
```

```javascript
// 实现示例

// 1. Data Layer
class ApiClient {
  async get(url) {
    const response = await fetch(url);
    return response.json();
  }
  
  async post(url, data) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}

// 2. Service Layer
class UserService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }
  
  async getUsers() {
    const data = await this.apiClient.get('/api/users');
    return data.users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email
    }));
  }
  
  async createUser(userData) {
    return this.apiClient.post('/api/users', userData);
  }
}

// 3. Controller Layer (React Hook)
function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  return { users, loading, error, reload: loadUsers };
}

// 4. View Layer
function UserList() {
  const { users, loading, error } = useUsers();
  
  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 2.2 MVC vs MVVM vs Flux

```javascript
// 1. MVC（传统后端模式）
// Model - View - Controller

// 2. MVVM（Vue 使用）
// Model - View - ViewModel

// Vue 示例
const app = new Vue({
  // Model
  data: {
    count: 0
  },
  
  // ViewModel
  methods: {
    increment() {
      this.count++;
    }
  },
  
  // View
  template: `
    <div>
      <p>{{ count }}</p>
      <button @click="increment">+</button>
    </div>
  `
});

// 3. Flux（React 推荐）
// View → Action → Dispatcher → Store → View

// Redux 示例
// Action
const increment = () => ({ type: 'INCREMENT' });

// Reducer (Store)
function counter(state = 0, action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    default:
      return state;
  }
}

// View
function Counter() {
  const count = useSelector(state => state.count);
  const dispatch = useDispatch();
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => dispatch(increment())}>+</button>
    </div>
  );
}
```

### 2.3 微前端架构

```javascript
// 1. iframe 方案（简单但限制多）
<iframe src="https://sub-app.com"></iframe>

// 2. Web Components
class SubApp extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<h1>Sub App</h1>';
  }
}
customElements.define('sub-app', SubApp);

// 3. qiankun（推荐）
// 主应用
import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:8081',
    container: '#container',
    activeRule: '/app1'
  }
]);

start();

// 子应用
export async function bootstrap() {}
export async function mount(props) {
  render(props);
}
export async function unmount(props) {
  destroy();
}

// 4. Module Federation（Webpack 5）
// 见工程化文档
```

---

## 3. 组件设计

### 3.1 组件设计原则

```javascript
// 1. 单一职责
// 差：一个组件做太多事
function UserProfile() {
  // 获取数据
  // 显示用户信息
  // 编辑用户
  // 删除用户
  // 上传头像
}

// 好：拆分职责
function UserProfile() {
  return (
    <>
      <UserInfo />
      <UserActions />
      <AvatarUploader />
    </>
  );
}

// 2. 可组合性
// 组合 > 继承
function Card({ title, children }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

// 使用
<Card title="User">
  <UserInfo />
</Card>

// 3. 可配置性
function Button({
  type = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  children
}) {
  return (
    <button
      className={`btn btn-${type} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// 4. 可扩展性
// 使用 children 或 render props
function List({ items, renderItem }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
```

### 3.2 Headless 组件

```javascript
// 逻辑与 UI 分离

// 1. Headless Select
function useSelect(options) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  
  const toggle = () => setIsOpen(!isOpen);
  const select = (option) => {
    setSelected(option);
    setIsOpen(false);
  };
  
  return {
    isOpen,
    selected,
    options,
    toggle,
    select
  };
}

// 使用
function MySelect() {
  const { isOpen, selected, options, toggle, select } = useSelect([
    { id: 1, label: 'Option 1' },
    { id: 2, label: 'Option 2' }
  ]);
  
  return (
    <div>
      <button onClick={toggle}>
        {selected ? selected.label : 'Select'}
      </button>
      {isOpen && (
        <ul>
          {options.map(option => (
            <li key={option.id} onClick={() => select(option)}>
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// 2. Headless Modal
function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);
  
  return { isOpen, open, close, toggle };
}
```

### 3.3 复合组件

```javascript
// Compound Components Pattern

const TabsContext = React.createContext();

function Tabs({ children, defaultIndex = 0 }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  
  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }) {
  return <div className="tab-list">{children}</div>;
}

function Tab({ index, children }) {
  const { activeIndex, setActiveIndex } = useContext(TabsContext);
  
  return (
    <button
      className={activeIndex === index ? 'active' : ''}
      onClick={() => setActiveIndex(index)}
    >
      {children}
    </button>
  );
}

function TabPanels({ children }) {
  return <div className="tab-panels">{children}</div>;
}

function TabPanel({ index, children }) {
  const { activeIndex } = useContext(TabsContext);
  
  return activeIndex === index ? <div>{children}</div> : null;
}

Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panels = TabPanels;
Tabs.Panel = TabPanel;

// 使用
function App() {
  return (
    <Tabs>
      <Tabs.List>
        <Tabs.Tab index={0}>Tab 1</Tabs.Tab>
        <Tabs.Tab index={1}>Tab 2</Tabs.Tab>
      </Tabs.List>
      
      <Tabs.Panels>
        <Tabs.Panel index={0}>Content 1</Tabs.Panel>
        <Tabs.Panel index={1}>Content 2</Tabs.Panel>
      </Tabs.Panels>
    </Tabs>
  );
}
```

---

## 4. 状态管理架构

### 4.1 状态分类

```
1. 服务器状态（Server State）
   • 从后端获取
   • 异步
   • 可能过期
   • 示例：用户信息、文章列表

2. UI 状态（UI State）
   • 前端控制
   • 同步
   • 临时
   • 示例：Modal 开关、Tab 索引

3. 全局状态（Global State）
   • 跨组件共享
   • 持久化
   • 示例：用户登录状态、主题

4. 本地状态（Local State）
   • 组件内部
   • 不共享
   • 示例：表单输入、Hover 状态
```

### 4.2 状态管理方案选择

```javascript
// 1. 本地状态：useState
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// 2. 跨组件状态：Context + useReducer
const AppContext = createContext();

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// 3. 复杂全局状态：Redux/Zustand
import create from 'zustand';

const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user })
}));

// 4. 服务器状态：React Query
function Users() {
  const { data, isLoading } = useQuery('users', fetchUsers);
  
  if (isLoading) return <Loading />;
  return <UserList users={data} />;
}

// 选择建议：
// • 优先本地状态（useState）
// • 少量跨组件状态用 Context
// • 复杂全局状态用 Zustand（轻量）或 Redux（重量）
// • 服务器状态用 React Query/SWR
```

### 4.3 状态同步策略

```javascript
// 1. 乐观更新
function useTodoMutation() {
  const queryClient = useQueryClient();
  
  return useMutation(updateTodo, {
    // 乐观更新
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries('todos');
      
      const previousTodos = queryClient.getQueryData('todos');
      
      queryClient.setQueryData('todos', (old) => {
        return [...old, newTodo];
      });
      
      return { previousTodos };
    },
    
    // 失败回滚
    onError: (err, newTodo, context) => {
      queryClient.setQueryData('todos', context.previousTodos);
    },
    
    // 成功后刷新
    onSettled: () => {
      queryClient.invalidateQueries('todos');
    }
  });
}

// 2. 防抖/节流
const debouncedUpdate = useMemo(
  () => debounce((value) => {
    updateServer(value);
  }, 500),
  []
);

// 3. 离线优先
class OfflineStore {
  constructor() {
    this.queue = [];
    window.addEventListener('online', () => this.sync());
  }
  
  async save(data) {
    if (navigator.onLine) {
      await api.save(data);
    } else {
      this.queue.push(data);
      localStorage.setItem('queue', JSON.stringify(this.queue));
    }
  }
  
  async sync() {
    const queue = JSON.parse(localStorage.getItem('queue') || '[]');
    
    for (const data of queue) {
      await api.save(data);
    }
    
    localStorage.removeItem('queue');
    this.queue = [];
  }
}
```

---

## 5. 大型应用设计

### 5.1 电商系统设计

```
功能模块：
1. 商品管理
2. 购物车
3. 订单系统
4. 支付系统
5. 用户中心

技术架构：

Frontend
├── pages/
│   ├── Home（首页）
│   ├── Product（商品详情）
│   ├── Cart（购物车）
│   ├── Checkout（结算）
│   └── Order（订单）
├── components/
│   ├── ProductCard
│   ├── CartItem
│   └── Payment
├── services/
│   ├── productService
│   ├── cartService
│   └── orderService
├── store/
│   ├── cartStore（Zustand）
│   └── userStore
└── utils/
    ├── api
    └── hooks

关键技术点：

1. 购物车设计
   • 本地存储（未登录）
   • 服务器同步（已登录）
   • 实时库存检查

2. 性能优化
   • 商品列表虚拟滚动
   • 图片懒加载
   • 路由懒加载
   • CDN 加速

3. 支付流程
   • 创建订单
   • 调用支付接口
   • 轮询支付状态
   • 支付回调处理

4. 状态管理
   • 用户信息：Context
   • 购物车：Zustand
   • 商品数据：React Query

5. 安全考虑
   • HTTPS
   • XSS 防御
   • CSRF Token
   • 支付签名验证
```

### 5.2 管理后台设计

```
功能模块：
1. 权限管理
2. 数据展示
3. 表单处理
4. 文件上传

技术选型：
• React + TypeScript
• Ant Design/MUI
• React Query
• React Router v6

目录结构：

src/
├── layouts/
│   ├── BasicLayout（基础布局）
│   └── BlankLayout（空白布局）
├── pages/
│   ├── Dashboard
│   ├── Users
│   └── Settings
├── components/
│   ├── Table（通用表格）
│   ├── Form（通用表单）
│   └── Upload（文件上传）
├── hooks/
│   ├── useAuth（权限）
│   ├── useTable（表格）
│   └── useForm（表单）
├── services/
│   └── api.ts
└── utils/
    ├── request.ts
    └── auth.ts

关键实现：

1. 权限系统
// 路由守卫
function PrivateRoute({ children, permission }) {
  const { hasPermission } = useAuth();
  
  if (!hasPermission(permission)) {
    return <Redirect to="/403" />;
  }
  
  return children;
}

// 按钮权限
function DeleteButton({ userId }) {
  const { hasPermission } = useAuth();
  
  if (!hasPermission('user:delete')) {
    return null;
  }
  
  return <Button onClick={() => deleteUser(userId)}>删除</Button>;
}

2. 通用表格
function useTable(api) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  
  const load = async () => {
    setLoading(true);
    const res = await api(pagination);
    setData(res.data);
    setLoading(false);
  };
  
  useEffect(() => { load(); }, [pagination]);
  
  return { data, loading, pagination, setPagination, reload: load };
}

3. 通用表单
function useForm(initialValues, onSubmit) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await onSubmit(values);
    } catch (err) {
      setErrors(err.errors);
    } finally {
      setSubmitting(false);
    }
  };
  
  return { values, setValues, errors, submitting, handleSubmit };
}
```

---

## 6. 技术选型

### 6.1 选型考虑因素

```
1. 项目特点
   • 规模：小/中/大
   • 周期：短期/长期
   • 团队：人数、经验

2. 技术因素
   • 性能要求
   • SEO 需求
   • 浏览器兼容性
   • 移动端支持

3. 生态因素
   • 社区活跃度
   • 文档完善度
   • 插件生态
   • 招聘难度

4. 业务因素
   • 迭代速度
   • 维护成本
   • 学习成本
   • 技术债务
```

### 6.2 框架选择

```
React vs Vue vs Angular

React:
✅ 生态最丰富
✅ 就业机会多
✅ 灵活性高
❌ 学习曲线陡
❌ 选择焦虑（状态管理、路由）

Vue:
✅ 上手容易
✅ 文档友好
✅ 官方方案完整
❌ 生态相对小
❌ 大型项目经验少

Angular:
✅ 大型企业应用
✅ 开箱即用
✅ TypeScript 原生
❌ 学习曲线最陡
❌ 灵活性低

选择建议：
• 创业公司/快速迭代：Vue
• 大厂/大型项目：React
• 企业级/政府项目：Angular
• 个人项目：看喜好
```

### 6.3 状态管理选择

```
Redux vs Zustand vs MobX vs Context

Redux:
✅ 生态最成熟
✅ DevTools 强大
✅ 中间件丰富
❌ 模板代码多
❌ 学习成本高

Zustand:
✅ 极简API
✅ 无模板代码
✅ 性能好
❌ 生态较小
❌ 缺少最佳实践

MobX:
✅ 响应式
✅ 代码简洁
❌ 魔法过多
❌ 调试困难

Context:
✅ 官方方案
✅ 零依赖
❌ 性能问题
❌ 不适合大型应用

选择建议：
• 简单应用：Context
• 中等应用：Zustand
• 复杂应用：Redux
• 快速开发：MobX
```

---

## 7. 性能设计

见《性能优化》文档

---

## 8. 安全设计

见《前端安全》文档

---

## 9. 实战案例

### 9.1 设计一个聊天系统

```
需求：
• 实时消息
• 消息历史
• 已读未读
• 在线状态
• 文件发送

技术方案：

1. 通信协议
   • WebSocket（实时消息）
   • HTTP（历史消息）

2. 架构设计
Frontend
├── pages/
│   └── Chat
├── components/
│   ├── MessageList
│   ├── MessageInput
│   └── ContactList
├── hooks/
│   ├── useWebSocket
│   └── useMessages
└── services/
    └── chatService

3. 核心实现

// WebSocket 管理
class WebSocketManager {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }
  
  connect() {
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      console.log('Connected');
      this.reconnectAttempts = 0;
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.emit(data.type, data);
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    this.ws.onclose = () => {
      console.log('Disconnected');
      this.reconnect();
    };
  }
  
  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, 1000 * this.reconnectAttempts);
    }
  }
  
  send(type, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    }
  }
  
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => cb(data));
    }
  }
}

// React Hook
function useChat(userId) {
  const [messages, setMessages] = useState([]);
  const [online, setOnline] = useState(false);
  const ws = useRef(null);
  
  useEffect(() => {
    ws.current = new WebSocketManager('ws://localhost:3000');
    ws.current.connect();
    
    ws.current.on('message', (data) => {
      setMessages(prev => [...prev, data.message]);
    });
    
    ws.current.on('online', (data) => {
      setOnline(data.online);
    });
    
    return () => ws.current.disconnect();
  }, []);
  
  const sendMessage = (content) => {
    const message = {
      id: Date.now(),
      userId,
      content,
      timestamp: new Date()
    };
    
    ws.current.send('message', message);
    setMessages(prev => [...prev, message]);
  };
  
  return { messages, online, sendMessage };
}

4. 性能优化
   • 消息虚拟滚动
   • 图片懒加载
   • 消息本地缓存
   • 分页加载历史

5. 安全考虑
   • WebSocket 认证
   • 消息加密
   • XSS 防御
   • 限流
```

---

## 10. 面试技巧

### 10.1 系统设计面试流程

```
1. 需求澄清（5分钟）
   • 功能需求
   • 非功能需求（性能、可用性）
   • 用户规模
   • 技术限制

2. 高层设计（10分钟）
   • 画架构图
   • 说明各层职责
   • 技术选型

3. 详细设计（20分钟）
   • 数据流
   • 状态管理
   • API 设计
   • 组件设计

4. 权衡讨论（10分钟）
   • 性能优化
   • 扩展性
   • 可维护性
   • 替代方案
```

### 10.2 常见问题

```
1. 设计一个前端路由系统
2. 设计一个虚拟列表组件
3. 设计一个表单验证系统
4. 设计一个权限管理系统
5. 设计一个实时聊天系统
6. 设计一个拖拽排序组件
7. 设计一个图片上传组件
8. 设计一个无限滚动列表
9. 设计一个前端监控系统
10. 设计一个微前端架构
```

### 10.3 沟通技巧

```
1. 边画边说
   • 画架构图
   • 标注数据流
   • 说明设计决策

2. 提出问题
   • 需求不清楚要问
   • 权衡时征求意见

3. 展示思考
   • 说出多个方案
   • 比较优缺点
   • 选择并解释

4. 时间管理
   • 不要陷入细节
   • 先整体后局部
   • 留时间讨论

5. 展示经验
   • 实际案例
   • 踩过的坑
   • 最佳实践
```

---

**记住**：系统设计没有标准答案，重要的是**思考过程**和**权衡决策**！