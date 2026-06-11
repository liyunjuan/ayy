# AI 提示词工程实战指南

## 目录
1. [提示词基础](#提示词基础)
2. [高级提示词技巧](#高级提示词技巧)
3. [前端开发场景提示词](#前端开发场景提示词)
4. [Prompt 模式库](#prompt-模式库)
5. [反模式与避坑指南](#反模式与避坑指南)
6. [实战案例](#实战案例)

---

## 提示词基础

### 1. 提示词结构

#### 基础结构
```
[角色定义] + [任务描述] + [约束条件] + [输出格式] + [示例]
```

#### 示例
```
你是一位资深的前端架构师。

请帮我设计一个可扩展的状态管理方案。

要求：
- 支持 TypeScript
- 适用于中大型项目
- 考虑性能优化
- 易于测试

请以 Markdown 格式输出，包含：
1. 方案概述
2. 技术选型
3. 代码示例
4. 最佳实践

参考示例：
[示例内容...]
```

### 2. 五大核心原则

#### 1. 清晰性（Clarity）
```
❌ 差：帮我写个组件
✅ 好：创建一个 React TypeScript 组件，实现带搜索功能的下拉选择器，支持多选和异步数据加载
```

#### 2. 具体性（Specificity）
```
❌ 差：优化这段代码
✅ 好：优化以下代码的性能，重点关注：
1. 减少不必要的重渲染
2. 优化事件处理
3. 改进数据结构
```

#### 3. 上下文（Context）
```
❌ 差：这个 bug 怎么修？
✅ 好：我在使用 React 18 + TypeScript + Vite，遇到以下错误：
[错误信息]
相关代码：
[代码片段]
已尝试的方案：
[列表]
```

#### 4. 约束性（Constraints）
```
✅ 明确约束：
- 代码不超过 50 行
- 只使用原生 JavaScript，不用框架
- 兼容 IE11
- 响应时间不超过 100ms
```

#### 5. 格式化（Format）
```
✅ 指定输出格式：
请以 JSON 格式返回结果：
{
  "summary": "简短总结",
  "code": "完整代码",
  "explanation": "详细说明"
}
```

---

## 高级提示词技巧

### 1. Zero-Shot Prompting（零样本）

```
直接提问，不提供示例。适用于简单任务。

示例：
---
将以下代码转换为 TypeScript：
const add = (a, b) => a + b;
---
```

### 2. Few-Shot Prompting（少样本）

```typescript
const fewShotPrompt = `
将函数转换为 TypeScript，包含完整类型定义。

示例 1:
输入: const greet = (name) => "Hello " + name;
输出:
function greet(name: string): string {
  return "Hello " + name;
}

示例 2:
输入: const sum = (arr) => arr.reduce((a, b) => a + b, 0);
输出:
function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

现在转换：
输入: const filter = (arr, fn) => arr.filter(fn);
`;
```

### 3. Chain of Thought（思维链）

```typescript
const chainOfThoughtPrompt = `
请帮我优化以下 React 组件的性能。

要求按照以下步骤思考：
1. 首先，识别代码中的性能问题
2. 然后，分析每个问题的原因
3. 接着，提出具体的优化方案
4. 最后，给出优化后的完整代码

原始代码：
\`\`\`tsx
function UserList({ users }) {
  return (
    <div>
      {users.map((user, index) => (
        <div key={index} onClick={() => console.log(user)}>
          {user.name}
        </div>
      ))}
    </div>
  );
}
\`\`\`

请逐步分析并优化。
`;
```

### 4. Self-Consistency（自洽性）

```typescript
// 让 AI 从多个角度思考，然后综合答案
const selfConsistencyPrompt = `
从以下三个角度评估这段代码：

1. 性能角度：有哪些性能问题？
2. 可维护性角度：代码是否易于维护？
3. 安全性角度：是否存在安全隐患？

代码：
[代码片段]

最后，综合三个角度给出总体评价和改进建议。
`;
```

### 5. Tree of Thought（思维树）

```typescript
const treeOfThoughtPrompt = `
设计一个复杂的表单验证系统。请探索以下三种可能的架构方案：

方案 A：基于 Schema 的验证
- 优点：[...]
- 缺点：[...]
- 适用场景：[...]

方案 B：基于 Hook 的验证
- 优点：[...]
- 缺点：[...]
- 适用场景：[...]

方案 C：基于装饰器的验证
- 优点：[...]
- 缺点：[...]
- 适用场景：[...]

然后，综合评估选择最佳方案，并给出理由和实现代码。
`;
```

### 6. ReAct（推理+行动）

```typescript
const reactPrompt = `
你是一个调试助手。当遇到 bug 时，请按以下流程：

思考：分析问题可能的原因
行动：提出验证假设的方法
观察：根据结果调整思路
重复：直到找到解决方案

示例：
---
用户报告：页面加载时数据显示为 undefined

思考：可能是异步数据加载时机问题
行动：检查组件是否在数据返回前就渲染了
观察：确实存在竞态条件
思考：需要添加加载状态
行动：实现 loading 状态和条件渲染
结果：问题解决
---

现在帮我调试：[问题描述]
`;
```

### 7. Role-Playing（角色扮演）

```typescript
const rolePlayingPrompt = `
请扮演一位拥有 15 年经验的前端架构师，你：
- 曾在 Google、Facebook 工作
- 主导过多个大型项目的架构设计
- 对性能优化有深入研究
- 擅长权衡技术方案的利弊

现在，请以这个身份回答：
如何设计一个支持百万级用户的实时聊天系统的前端架构？
`;
```

---

## 前端开发场景提示词

### 1. 代码生成

#### 组件生成
```typescript
const componentPrompt = `
创建一个 React TypeScript 组件：可搜索的多选下拉框

功能需求：
- 支持搜索过滤选项
- 支持多选
- 显示已选数量徽章
- 支持全选/取消全选
- 支持异步数据加载
- 响应式设计

技术要求：
- 使用 React 18+ Hooks
- TypeScript 严格模式
- 使用 Tailwind CSS
- 包含 Props 类型定义
- 添加 JSDoc 注释

性能考虑：
- 虚拟滚动（选项超过 100 个时）
- 防抖搜索
- 记忆化计算

请提供完整的组件代码，包括：
1. 类型定义
2. 组件实现
3. 使用示例
`;
```

#### API 集成
```typescript
const apiIntegrationPrompt = `
创建一个类型安全的 API 客户端，用于与 RESTful API 交互。

要求：
1. 使用 TypeScript 泛型
2. 支持请求/响应拦截器
3. 自动错误处理
4. 请求取消功能
5. 请求重试机制
6. 响应缓存

API 端点示例：
- GET /api/users - 获取用户列表
- POST /api/users - 创建用户
- PUT /api/users/:id - 更新用户
- DELETE /api/users/:id - 删除用户

请提供：
1. 类型定义
2. API 客户端实现
3. 使用示例
4. 错误处理最佳实践
`;
```

### 2. 代码审查

```typescript
const codeReviewPrompt = `
作为一位资深的前端 Code Reviewer，请审查以下代码：

\`\`\`tsx
${codeToReview}
\`\`\`

审查维度：
1. 🔴 严重问题（必须修复）
   - 安全漏洞
   - 性能严重问题
   - 功能性 bug

2. 🟡 中等问题（建议修复）
   - 代码异味
   - 轻微性能问题
   - 可维护性问题

3. 🟢 优化建议
   - 代码风格
   - 最佳实践
   - 可读性提升

请按照以下格式输出：

## 严重问题 🔴
[问题描述 + 具体代码位置 + 修复建议 + 修复后的代码]

## 中等问题 🟡
[...]

## 优化建议 🟢
[...]

## 总结
- 代码质量评分：X/10
- 主要优点：
- 改进重点：
`;
```

### 3. 重构建议

```typescript
const refactoringPrompt = `
请对以下代码提供重构建议，目标是提高可维护性和可读性。

原始代码：
\`\`\`typescript
${originalCode}
\`\`\`

请提供：

1. 问题分析
   - 当前代码的主要问题
   - 代码异味识别
   - 违反的设计原则

2. 重构方案
   - 提取函数/组件
   - 简化复杂逻辑
   - 改进命名
   - 优化数据结构

3. 重构后的代码
   \`\`\`typescript
   // 完整的重构代码
   \`\`\`

4. 对比说明
   - 重构前后的差异
   - 改进点说明
   - 潜在的权衡

5. 后续建议
   - 测试策略
   - 迁移步骤
   - 注意事项
`;
```

### 4. 性能优化

```typescript
const performancePrompt = `
分析并优化以下 React 组件的性能：

\`\`\`tsx
${componentCode}
\`\`\`

性能分析维度：
1. 渲染性能
   - 不必要的重渲染
   - 昂贵的计算
   - 大型列表渲染

2. 内存使用
   - 内存泄漏风险
   - 不必要的内存占用

3. 网络性能
   - API 调用优化
   - 数据预加载

4. 用户体验
   - 加载状态
   - 错误处理
   - 交互响应

请提供：
1. 性能瓶颈分析（使用 React DevTools Profiler 的视角）
2. 优化后的代码
3. 性能提升说明（预期改进百分比）
4. 注意事项和权衡
`;
```

### 5. Bug 修复

```typescript
const bugFixPrompt = `
帮我修复以下 bug：

## 问题描述
${bugDescription}

## 错误信息
\`\`\`
${errorMessage}
\`\`\`

## 相关代码
\`\`\`typescript
${relevantCode}
\`\`\`

## 复现步骤
1. ${step1}
2. ${step2}
3. ${step3}

## 环境信息
- React 版本：${reactVersion}
- 浏览器：${browser}
- 其他依赖：${dependencies}

## 已尝试的方案
- ${attemptedSolution1}
- ${attemptedSolution2}

请提供：
1. 根本原因分析
2. 修复代码
3. 为什么这个方案能解决问题
4. 如何预防类似问题
5. 相关的单元测试
`;
```

### 6. 测试用例生成

```typescript
const testGenerationPrompt = `
为以下函数/组件生成完整的测试用例：

\`\`\`typescript
${codeToTest}
\`\`\`

测试要求：
1. 使用 Jest + React Testing Library
2. 覆盖所有功能路径
3. 包含边界情况
4. 测试错误处理
5. 测试异步行为
6. 测试用户交互

请提供：
1. 测试套件结构
2. 完整的测试代码
3. Mock 数据和 Mock 函数
4. 测试覆盖率预期

测试格式：
\`\`\`typescript
describe('ComponentName', () => {
  describe('基础功能', () => {
    it('should...', () => {
      // Arrange
      // Act
      // Assert
    });
  });

  describe('边界情况', () => {
    // ...
  });

  describe('错误处理', () => {
    // ...
  });
});
\`\`\`
`;
```

---

## Prompt 模式库

### 1. 代码解释器模式

```typescript
const codeExplainerPrompt = `
作为一位前端导师，请用初学者能理解的方式解释以下代码：

\`\`\`typescript
${complexCode}
\`\`\`

解释格式：
1. 整体概述（一句话说明代码作用）
2. 逐行解释（对关键代码行进行注释）
3. 概念说明（解释使用的技术和模式）
4. 实际应用（这种写法在什么场景下使用）
5. 扩展阅读（相关概念和最佳实践）

请用简单的语言，避免过于技术化的术语。
如果必须使用术语，请先解释它的含义。
`;
```

### 2. 对比分析模式

```typescript
const comparisonPrompt = `
比较以下两种实现方案，帮我选择最适合的：

方案 A：
\`\`\`typescript
${solutionA}
\`\`\`

方案 B：
\`\`\`typescript
${solutionB}
\`\`\`

对比维度：
1. 性能（运行时、内存占用）
2. 可维护性（代码清晰度、可扩展性）
3. 复杂度（学习曲线、实现难度）
4. 兼容性（浏览器支持、依赖项）
5. 使用场景（最适合什么情况）

请提供：
- 详细对比表格
- 各自的优缺点
- 推荐方案及理由
- 潜在的组合方案
`;
```

### 3. 渐进式优化模式

```typescript
const progressiveOptimizationPrompt = `
请对以下代码进行三个层次的优化：

原始代码：
\`\`\`typescript
${originalCode}
\`\`\`

## 第一层：基础优化（保持结构不变）
- 修复明显问题
- 改进命名
- 添加类型注解

## 第二层：结构优化（轻度重构）
- 提取重复逻辑
- 简化复杂条件
- 优化数据流

## 第三层：架构优化（深度重构）
- 引入设计模式
- 重新组织代码
- 考虑可扩展性

每层请提供：
1. 优化后的代码
2. 改动说明
3. 优缺点分析
4. 适用场景
`;
```

### 4. 问题诊断模式

```typescript
const diagnosticPrompt = `
我的应用出现了性能问题，请帮我诊断：

## 症状
- 页面加载慢
- 交互卡顿
- 内存持续增长

## 相关代码
\`\`\`typescript
${suspectedCode}
\`\`\`

## 已收集的数据
- 初始加载时间：${loadTime}ms
- 包体积：${bundleSize}MB
- 主线程任务时间：${mainThreadTime}ms

请像医生诊断病人一样，按照以下流程：

1. 初步诊断
   - 可能的问题列表
   - 严重程度评估

2. 详细检查
   - 需要检查的指标
   - 如何使用浏览器 DevTools
   - 如何分析 Performance 面板

3. 确诊
   - 根本原因
   - 影响范围

4. 治疗方案
   - 立即修复（quick fix）
   - 长期优化
   - 预防措施

5. 复查建议
   - 如何验证修复效果
   - 需要监控的指标
`;
```

### 5. 架构设计模式

```typescript
const architecturePrompt = `
请为以下需求设计前端架构方案：

## 项目背景
- 项目类型：${projectType}
- 团队规模：${teamSize}
- 预期用户量：${expectedUsers}
- 核心功能：${coreFeatures}

## 技术约束
- 必须使用：${requiredTech}
- 兼容性要求：${compatibility}
- 性能目标：${performanceGoals}

## 非功能需求
- 可维护性
- 可扩展性
- 可测试性
- 安全性

请提供：

1. 整体架构图（用 Mermaid 语法）
\`\`\`mermaid
graph TD
  A[用户界面] --> B[状态管理]
  B --> C[API 层]
  ...
\`\`\`

2. 技术栈选型
   - 框架/库选择 + 理由
   - 关键依赖项
   - 构建工具

3. 目录结构
\`\`\`
src/
├── components/
├── features/
├── services/
...
\`\`\`

4. 核心模块设计
   - 状态管理
   - 路由设计
   - API 集成
   - 错误处理

5. 关键决策说明
   - 为什么这样设计
   - 权衡了哪些因素
   - 潜在的风险

6. 实施路线图
   - Phase 1：MVP
   - Phase 2：功能完善
   - Phase 3：优化
`;
```

---

## 反模式与避坑指南

### 1. 避免的提示词反模式

#### ❌ 反模式 1：过于模糊
```
差：帮我写个登录页面
```

#### ✅ 改进
```
好：创建一个 React 登录页面组件，包含：
- 邮箱和密码输入框
- 表单验证（邮箱格式、密码长度 >= 8）
- 记住我选项
- 忘记密码链接
- 使用 React Hook Form 进行表单管理
- TypeScript 类型定义
- Tailwind CSS 样式
```

#### ❌ 反模式 2：假设 AI 知道上下文
```
差：这个错误怎么修？
```

#### ✅ 改进
```
好：我在使用 React + TypeScript，遇到以下错误：

错误信息：
"Type 'string | undefined' is not assignable to type 'string'"

相关代码：
\`\`\`typescript
const user = users.find(u => u.id === userId);
const name: string = user.name; // 错误在这里
\`\`\`

已尝试：
1. 使用可选链 user?.name（但需要 string 类型）
2. 添加类型断言（不太安全）

如何正确处理这种情况？
```

#### ❌ 反模式 3：一次请求太多
```
差：创建一个完整的电商网站，包括用户系统、商品管理、购物车、支付集成、后台管理...
```

#### ✅ 改进
```
好：首先，创建一个商品列表组件，功能包括：
- 展示商品卡片（图片、名称、价格）
- 分页功能
- 加载状态
- 响应式布局

后续我会逐步扩展其他功能。
```

### 2. 常见陷阱

#### 陷阱 1：期望 AI 运行代码
```
❌ "运行这段代码并告诉我输出是什么"
✅ "分析这段代码的逻辑，推断可能的输出"
```

#### 陷阱 2：要求实时数据
```
❌ "检查 npm 上最新版本的 React"
✅ "假设使用 React 18，如何实现这个功能？"
```

#### 陷阱 3：过度依赖 AI
```
❌ 完全不看代码，直接使用 AI 生成的内容
✅ 理解 AI 生成的代码，进行必要的调整和测试
```

### 3. 提示词优化检查清单

```
☑️ 明确指定了技术栈和版本？
☑️ 提供了足够的上下文？
☑️ 约束条件清晰吗？
☑️ 期望的输出格式明确吗？
☑️ 任务拆分得够小吗？
☑️ 包含了示例或参考吗？
☑️ 考虑了边界情况吗？
☑️ 指定了质量标准吗？
```

---

## 实战案例

### 案例 1：生成可复用的表单组件

```typescript
const prompt = `
创建一个高度可复用的 React 表单组件库。

## 核心组件

1. Form - 表单容器
2. FormField - 字段包装器
3. Input - 文本输入
4. Select - 下拉选择
5. Checkbox - 复选框
6. Radio - 单选按钮

## 功能要求

### 表单验证
- 支持同步和异步验证
- 内置常见验证规则（required, email, min, max, pattern）
- 自定义验证规则
- 字段级和表单级验证

### 状态管理
- 表单值管理
- 错误状态
- 触摸状态（用户是否与字段交互）
- 提交状态

### 类型安全
- 完整的 TypeScript 类型定义
- 泛型支持，确保表单数据类型安全

### 用户体验
- 实时验证（可配置时机：onChange, onBlur, onSubmit）
- 错误信息显示
- 加载状态
- 禁用状态

## 技术要求

- React 18 + TypeScript
- 使用 Context API 管理表单状态
- 使用自定义 Hook 封装逻辑
- 支持受控和非受控模式
- 无外部依赖（除 React）

## 示例用法

\`\`\`tsx
<Form onSubmit={handleSubmit} validationSchema={schema}>
  <FormField name="email" label="邮箱">
    <Input type="email" placeholder="请输入邮箱" />
  </FormField>

  <FormField name="password" label="密码">
    <Input type="password" />
  </FormField>

  <FormField name="remember" label="记住我">
    <Checkbox />
  </FormField>

  <button type="submit">提交</button>
</Form>
\`\`\`

请提供：
1. 完整的类型定义
2. 所有组件的实现代码
3. 使用文档
4. 单元测试示例
`;
```

### 案例 2：性能优化诊断

```typescript
const prompt = `
我的 React 应用出现严重的性能问题，需要你帮我系统性地诊断和优化。

## 问题症状

1. 初始加载
   - 白屏时间：4.5s
   - 可交互时间：6.2s
   - 首次内容绘制：2.3s

2. 运行时性能
   - 列表滚动时明显卡顿
   - 输入框输入有延迟
   - 页面切换慢

3. 内存问题
   - 长时间使用后变慢
   - 开发者工具显示内存持续增长

## 技术栈

- React 18
- React Router v6
- Zustand（状态管理）
- TanStack Query（数据获取）
- Tailwind CSS
- Vite

## 可疑代码片段

### 1. 大型列表渲染
\`\`\`tsx
function ProductList({ products }) {
  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
\`\`\`

### 2. 全局状态
\`\`\`tsx
const useAppStore = create((set) => ({
  user: null,
  products: [],
  cart: [],
  orders: [],
  // ... 30+ 个状态字段
  updateUser: (user) => set({ user }),
  addToCart: (item) => set((state) => ({ cart: [...state.cart, item] })),
  // ...
}));
\`\`\`

### 3. 数据获取
\`\`\`tsx
function Dashboard() {
  const { data: user } = useQuery(['user'], fetchUser);
  const { data: products } = useQuery(['products'], fetchProducts);
  const { data: orders } = useQuery(['orders'], fetchOrders);
  const { data: analytics } = useQuery(['analytics'], fetchAnalytics);
  // ... 10+ 个并行请求

  return <div>{/* ... */}</div>;
}
\`\`\`

## 构建配置

\`\`\`typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  // 没有其他优化配置
});
\`\`\`

## 请提供

1. 完整的诊断报告
   - 按优先级列出问题
   - 每个问题的影响程度
   - 预期改善空间

2. 详细的优化方案
   - 立即可做的优化（quick wins）
   - 中期优化计划
   - 长期架构改进

3. 优化后的代码
   - 所有需要修改的代码片段
   - 新增的工具函数/Hook
   - 配置文件调整

4. 验证方法
   - 如何测量优化效果
   - 关键性能指标
   - 推荐的监控工具

5. 最佳实践文档
   - 团队应该遵循的性能准则
   - 如何预防类似问题
   - Code Review 检查清单
`;
```

### 案例 3：从设计稿到代码

```typescript
const prompt = `
根据以下 Figma 设计稿，生成 React 组件代码。

## 设计稿描述

### 组件：用户资料卡片

结构：
┌─────────────────────────────────┐
│  [头像]  用户名                   │
│          @username                │
│                                   │
│  这是用户的个人简介文本...         │
│                                   │
│  📍 Beijing · 🔗 website.com     │
│                                   │
│  [ 关注 ]  [ 消息 ]  [ ︙ ]       │
└─────────────────────────────────┘

### 样式规格

颜色：
- 背景：#FFFFFF
- 主文本：#1F2937
- 次要文本：#6B7280
- 边框：#E5E7EB
- 主要按钮：#3B82F6
- 主要按钮悬停：#2563EB

间距：
- 卡片内边距：24px
- 元素间距：12px
- 按钮内边距：8px 16px

字体：
- 用户名：16px, font-weight: 600
- username：14px, font-weight: 400
- 简介：14px, line-height: 1.5
- 位置信息：12px

圆角：
- 卡片：12px
- 头像：50%
- 按钮：6px

尺寸：
- 卡片最大宽度：360px
- 头像：64x64px
- 按钮高度：36px

### 交互状态

- 按钮悬停：背景色变深，添加阴影
- 关注按钮点击：切换为"已关注"状态，样式变为次要按钮
- 更多菜单：点击显示下拉菜单（分享、举报、屏蔽）

### 响应式

- 移动端（<640px）：卡片占满宽度，减小内边距

## 要求

1. 使用 React + TypeScript
2. 使用 Tailwind CSS（完全按设计稿还原）
3. 组件接收 Props：
   \`\`\`typescript
   interface UserCardProps {
     user: {
       id: string;
       name: string;
       username: string;
       avatar: string;
       bio: string;
       location: string;
       website: string;
       isFollowing: boolean;
     };
     onFollow: () => void;
     onMessage: () => void;
     onShare: () => void;
     onReport: () => void;
     onBlock: () => void;
   }
   \`\`\`

4. 实现所有交互
5. 完全响应式
6. 包含适当的 a11y 属性
7. 添加过渡动画

请提供：
1. 完整的组件代码
2. 使用示例
3. 如果有额外的子组件，一并提供
`;
```

---

## 提示词模板速查表

### 快速模板

```typescript
// 代码生成
`创建 ${componentType}，功能：${features}，技术栈：${techStack}`

// 代码审查
`审查以下代码，重点关注：${focusAreas}\n\`\`\`${code}\`\`\``

// Bug 修复
`修复 bug：${description}，错误：${error}，代码：${code}`

// 性能优化
`优化性能：${code}，关注：${performanceAspects}`

// 解释代码
`用简单的语言解释：${code}`

// 重构
`重构以提高可维护性：${code}`

// 测试
`为以下代码生成测试：${code}`

// 文档
`为以下 API 生成文档：${code}`
```

---

**掌握提示词工程，让 AI 成为你的编程伙伴！** 🚀
