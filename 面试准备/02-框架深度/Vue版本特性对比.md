# Vue 版本特性对比（Vue 2 vs Vue 3）

## 快速对比表

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 发布时间 | 2016.09 | 2020.09 |
| 当前版本 | 2.7.x（最终版） | 3.4.x / 3.5.x |
| 响应式系统 | Object.defineProperty | Proxy |
| 组合方式 | Options API | Composition API |
| TypeScript | 部分支持 | 完整支持 |
| 性能 | 基准 | 快 1.3-2 倍 |
| 包体积 | 基准 | 小 41% |
| 碎片 | 需要根元素 | 支持 Fragments |
| Teleport | ❌ | ✅ |
| Suspense | ❌ | ✅ |
| 多根节点 | ❌ | ✅ |

---

## Vue 2（稳定版本）

### 发布时间
**2016 年 9 月**（最终版本 2.7 发布于 2022 年 7 月）

### 核心特性

#### 1. Options API

```vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
export default {
  name: 'Counter',
  
  // 数据
  data() {
    return {
      count: 0
    }
  },
  
  // 计算属性
  computed: {
    doubleCount() {
      return this.count * 2
    }
  },
  
  // 方法
  methods: {
    increment() {
      this.count++
    }
  },
  
  // 生命周期
  created() {
    console.log('Component created')
  },
  
  mounted() {
    console.log('Component mounted')
  }
}
</script>
```

#### 2. 响应式系统（Object.defineProperty）

```javascript
// Vue 2 响应式原理
function defineReactive(obj, key, val) {
  Object.defineProperty(obj, key, {
    get() {
      // 依赖收集
      track(obj, key)
      return val
    },
    set(newVal) {
      if (newVal !== val) {
        val = newVal
        // 触发更新
        trigger(obj, key)
      }
    }
  })
}

// 使用
const data = { count: 0 }
defineReactive(data, 'count', 0)

data.count = 1 // 触发更新
```

**局限性：**
```javascript
// ❌ 无法检测到数组索引变化
this.items[0] = newValue // 不会触发更新

// ❌ 无法检测到新增属性
this.obj.newProp = 'value' // 不会触发更新

// ✅ 必须使用 Vue.set
Vue.set(this.items, 0, newValue)
Vue.set(this.obj, 'newProp', 'value')

// ✅ 或使用数组方法
this.items.splice(0, 1, newValue)
```

#### 3. 生命周期

```javascript
export default {
  beforeCreate() {
    // 实例初始化后，数据观测和事件配置之前
  },
  
  created() {
    // 实例创建完成，数据观测完成
    // 可以访问 data、computed、methods
  },
  
  beforeMount() {
    // 挂载开始前，render 函数首次被调用
  },
  
  mounted() {
    // 实例被挂载后
    // 可以访问 DOM
  },
  
  beforeUpdate() {
    // 数据更新时，DOM 更新前
  },
  
  updated() {
    // 数据更新后，DOM 更新完成
  },
  
  beforeDestroy() {
    // 实例销毁前
    // 适合清理定时器、取消订阅等
  },
  
  destroyed() {
    // 实例销毁后
  }
}
```

#### 4. Mixins（代码复用）

```javascript
// 混入
const counterMixin = {
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}

// 使用
export default {
  mixins: [counterMixin],
  
  mounted() {
    this.increment() // 可以使用 mixin 的方法
  }
}
```

**Mixin 的问题：**
```javascript
// ❌ 命名冲突
const mixin1 = {
  data() {
    return { count: 0 }
  }
}

const mixin2 = {
  data() {
    return { count: 10 } // 冲突！
  }
}

// ❌ 不清楚数据来源
export default {
  mixins: [mixin1, mixin2, mixin3],
  
  mounted() {
    console.log(this.count) // 这个 count 来自哪里？
  }
}
```

#### 5. 插槽（Slot）

```vue
<!-- 父组件 -->
<template>
  <Card>
    <template v-slot:header>
      <h1>标题</h1>
    </template>
    
    <template v-slot:default>
      <p>内容</p>
    </template>
  </Card>
</template>

<!-- Card 组件 -->
<template>
  <div class="card">
    <div class="card-header">
      <slot name="header"></slot>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
  </div>
</template>
```

---

## Vue 3（现代版本）

### 发布时间
**2020 年 9 月**（当前版本 3.4.x / 3.5.x）

### 核心特性

#### 1. Composition API

**基础用法：**
```vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 响应式数据
const count = ref(0)

// 计算属性
const doubleCount = computed(() => count.value * 2)

// 方法
function increment() {
  count.value++
}

// 生命周期
onMounted(() => {
  console.log('Component mounted')
})
</script>
```

**对比 Options API：**
```vue
<!-- Options API（Vue 2 风格） -->
<script>
export default {
  data() {
    return {
      count: 0
    }
  },
  computed: {
    doubleCount() {
      return this.count * 2
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}
</script>

<!-- Composition API（Vue 3 推荐） -->
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const doubleCount = computed(() => count.value * 2)
const increment = () => count.value++
</script>
```

#### 2. 响应式系统（Proxy）

**Vue 3 响应式原理：**
```javascript
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      // 依赖收集
      track(target, key)
      const result = Reflect.get(target, key, receiver)
      
      // 深度响应式
      if (typeof result === 'object' && result !== null) {
        return reactive(result)
      }
      
      return result
    },
    
    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)
      
      // 触发更新
      if (oldValue !== value) {
        trigger(target, key)
      }
      
      return result
    }
  })
}
```

**优势：**
```javascript
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  items: []
})

// ✅ 可以检测数组索引变化
state.items[0] = 'new value' // 会触发更新

// ✅ 可以检测新增属性
state.newProp = 'value' // 会触发更新

// ✅ 可以检测数组长度变化
state.items.length = 0 // 会触发更新

// ✅ 可以检测删除属性
delete state.count // 会触发更新
```

**ref vs reactive：**
```javascript
import { ref, reactive } from 'vue'

// ref：包装基本类型
const count = ref(0)
console.log(count.value) // 需要 .value
count.value++ // 修改需要 .value

// reactive：包装对象
const state = reactive({
  count: 0,
  name: 'Vue'
})
console.log(state.count) // 不需要 .value
state.count++ // 修改不需要 .value

// ref 也可以包装对象
const user = ref({ name: 'John' })
console.log(user.value.name) // 需要 .value
```

#### 3. 生命周期（Composition API）

```vue
<script setup>
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted
} from 'vue'

// beforeCreate 和 created 被 setup 替代

onBeforeMount(() => {
  console.log('Before mount')
})

onMounted(() => {
  console.log('Mounted')
  // 可以访问 DOM
})

onBeforeUpdate(() => {
  console.log('Before update')
})

onUpdated(() => {
  console.log('Updated')
})

onBeforeUnmount(() => {
  console.log('Before unmount')
  // 清理工作
})

onUnmounted(() => {
  console.log('Unmounted')
})
</script>
```

**对比表：**
```
Options API          Composition API
────────────────────────────────────
beforeCreate         setup()
created              setup()
beforeMount          onBeforeMount
mounted              onMounted
beforeUpdate         onBeforeUpdate
updated              onUpdated
beforeDestroy        onBeforeUnmount
destroyed            onUnmounted
```

#### 4. Composables（代码复用）

**自定义 Composable：**
```javascript
// composables/useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  const doubleCount = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  return {
    count,
    doubleCount,
    increment,
    decrement
  }
}
```

**使用 Composable：**
```vue
<script setup>
import { useCounter } from './composables/useCounter'

const { count, doubleCount, increment, decrement } = useCounter(10)
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
  </div>
</template>
```

**对比 Mixin：**
```javascript
// ❌ Mixin（Vue 2）
// - 命名冲突
// - 来源不明确
// - 难以传参

// ✅ Composable（Vue 3）
// - 清晰的来源
// - 支持传参
// - 更好的类型推导
const { count: count1 } = useCounter(0)
const { count: count2 } = useCounter(10)
```

**常用 Composables 示例：**

```javascript
// useMousePosition
import { ref, onMounted, onUnmounted } from 'vue'

export function useMousePosition() {
  const x = ref(0)
  const y = ref(0)
  
  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }
  
  onMounted(() => {
    window.addEventListener('mousemove', update)
  })
  
  onUnmounted(() => {
    window.removeEventListener('mousemove', update)
  })
  
  return { x, y }
}

// useFetch
import { ref } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)
  
  async function fetchData() {
    loading.value = true
    try {
      const response = await fetch(url)
      data.value = await response.json()
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }
  
  fetchData()
  
  return { data, error, loading, refetch: fetchData }
}

// useLocalStorage
import { ref, watch } from 'vue'

export function useLocalStorage(key, initialValue) {
  const storedValue = localStorage.getItem(key)
  const value = ref(storedValue ? JSON.parse(storedValue) : initialValue)
  
  watch(value, (newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue))
  }, { deep: true })
  
  return value
}
```

#### 5. Teleport（传送门）

**基础用法：**
```vue
<template>
  <div>
    <button @click="showModal = true">打开模态框</button>
    
    <!-- 传送到 body -->
    <Teleport to="body">
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <p>模态框内容</p>
          <button @click="showModal = false">关闭</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showModal = ref(false)
</script>
```

**实际应用：**
```vue
<!-- 通知组件 -->
<Teleport to="#notifications">
  <Notification v-for="n in notifications" :key="n.id" :notification="n" />
</Teleport>

<!-- 全屏遮罩 -->
<Teleport to="body">
  <div v-if="loading" class="loading-overlay">
    <Spinner />
  </div>
</Teleport>
```

#### 6. Suspense（异步组件）

**基础用法：**
```vue
<template>
  <Suspense>
    <!-- 异步组件 -->
    <template #default>
      <AsyncComponent />
    </template>
    
    <!-- 加载中显示 -->
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent(() => 
  import('./components/HeavyComponent.vue')
)
</script>
```

**与 async setup 配合：**
```vue
<!-- AsyncComponent.vue -->
<script setup>
// 可以在顶层使用 await
const data = await fetch('/api/data').then(r => r.json())
</script>

<template>
  <div>{{ data }}</div>
</template>
```

**嵌套 Suspense：**
```vue
<template>
  <Suspense>
    <template #default>
      <UserProfile>
        <Suspense>
          <template #default>
            <UserPosts />
          </template>
          <template #fallback>
            <div>加载帖子中...</div>
          </template>
        </Suspense>
      </UserProfile>
    </template>
    <template #fallback>
      <div>加载用户中...</div>
    </template>
  </Suspense>
</template>
```

#### 7. Fragments（多根节点）

**Vue 2（必须有根元素）：**
```vue
<template>
  <div>  <!-- 必需的包裹元素 -->
    <h1>Title</h1>
    <p>Content</p>
  </div>
</template>
```

**Vue 3（支持多根节点）：**
```vue
<template>
  <h1>Title</h1>
  <p>Content</p>
  <footer>Footer</footer>
</template>
```

#### 8. 性能优化

**静态提升（Static Hoisting）：**
```vue
<template>
  <!-- 这个 div 是静态的 -->
  <div class="static">Static Content</div>
  
  <!-- 这个 div 是动态的 -->
  <div>{{ dynamicContent }}</div>
</template>

<!-- Vue 3 编译后 -->
<script>
// 静态节点被提升到 render 函数外
const _hoisted_1 = { class: "static" }
const _hoisted_2 = "Static Content"

export function render() {
  return [
    createVNode("div", _hoisted_1, _hoisted_2),
    createVNode("div", null, ctx.dynamicContent)
  ]
}
</script>
```

**Patch Flag（更新标记）：**
```vue
<template>
  <div>
    <span>{{ msg }}</span>
    <span class="static">Static</span>
  </div>
</template>

<!-- Vue 3 会标记哪些节点需要更新 -->
<!-- 只有 {{ msg }} 的 span 会被标记 -->
```

**Tree Shaking：**
```javascript
// Vue 2：所有功能都打包
import Vue from 'vue'

// Vue 3：按需引入
import { ref, computed } from 'vue' // 只打包用到的
```

#### 9. TypeScript 支持

**Vue 3 完整类型支持：**
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

// 类型推导
const count = ref(0) // Ref<number>
const name = ref('Vue') // Ref<string>

// 显式类型
const user = ref<{ name: string; age: number }>({
  name: 'John',
  age: 30
})

// 计算属性类型推导
const doubleCount = computed(() => count.value * 2) // ComputedRef<number>

// 函数类型
function increment(): void {
  count.value++
}

// Props 类型定义
interface Props {
  title: string
  count?: number
}

const props = defineProps<Props>()

// Emit 类型定义
const emit = defineEmits<{
  (e: 'update', value: number): void
  (e: 'delete'): void
}>()
</script>
```

**组件类型：**
```typescript
import { defineComponent, PropType } from 'vue'

interface User {
  id: number
  name: string
}

export default defineComponent({
  props: {
    user: {
      type: Object as PropType<User>,
      required: true
    },
    mode: {
      type: String as PropType<'light' | 'dark'>,
      default: 'light'
    }
  },
  
  setup(props) {
    // props.user 的类型是 User
    // props.mode 的类型是 'light' | 'dark'
  }
})
```

---

## Vue 3 新版本特性

### Vue 3.3（2023.05）

**更好的 TypeScript 支持：**
```vue
<script setup lang="ts">
// 泛型组件
defineProps<{
  items: T[]
  modelValue: T
}>()

// 外部类型导入
import type { User } from './types'

defineProps<{
  user: User
}>()

// defineEmits 类型改进
const emit = defineEmits<{
  update: [id: number]
  delete: [id: number, reason: string]
}>()
</script>
```

**defineSlots()：**
```vue
<script setup lang="ts">
defineSlots<{
  default(props: { msg: string }): any
  header(props: { title: string }): any
}>()
</script>
```

### Vue 3.4（2024.01）

**性能提升：**
```
- 解析速度提升 2 倍
- 响应式系统优化
- 编译优化
- 内存占用减少
```

**v-bind 简写：**
```vue
<template>
  <!-- 旧语法 -->
  <div :id="id" :class="className">

  <!-- 新语法 -->
  <div :id :class="className">
</template>

<script setup>
const id = 'my-id'
const className = 'my-class'
</script>
```

**defineModel()（简化 v-model）：**
```vue
<!-- 子组件 -->
<script setup>
// Vue 3.4 之前
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

// Vue 3.4
const model = defineModel()
// 自动创建 props 和 emit
</script>

<template>
  <input v-model="model" />
</template>
```

### Vue 3.5（2024 下半年）

**响应式 Props 解构：**
```vue
<script setup>
// 现在可以直接解构，保持响应式
const { count, title } = defineProps({
  count: Number,
  title: String
})

// 不需要再使用 toRefs
watchEffect(() => {
  console.log(count) // 响应式
})
</script>
```

**Reactivity Transform（响应式语法糖）：**
```vue
<script setup>
// 不需要 .value
let count = $ref(0)
let doubled = $computed(() => count * 2)

function increment() {
  count++ // 直接修改，不需要 .value
}
</script>
```

**SSR 性能提升：**
```
- 懒加载水合（Lazy Hydration）
- 流式渲染优化
- 更好的缓存策略
```

---

## Vue 2 vs Vue 3 详细对比

### 1. 代码组织方式

**Vue 2（Options API）：**
```vue
<script>
export default {
  data() {
    return {
      // 用户相关
      user: null,
      userLoading: false,
      
      // 帖子相关
      posts: [],
      postsLoading: false
    }
  },
  
  computed: {
    // 用户相关
    userName() {
      return this.user?.name
    },
    
    // 帖子相关
    postCount() {
      return this.posts.length
    }
  },
  
  methods: {
    // 用户相关
    async fetchUser() {
      this.userLoading = true
      this.user = await api.getUser()
      this.userLoading = false
    },
    
    // 帖子相关
    async fetchPosts() {
      this.postsLoading = true
      this.posts = await api.getPosts()
      this.postsLoading = false
    }
  },
  
  mounted() {
    this.fetchUser()
    this.fetchPosts()
  }
}
</script>
```

**Vue 3（Composition API）：**
```vue
<script setup>
// 用户相关逻辑聚合在一起
const user = ref(null)
const userLoading = ref(false)
const userName = computed(() => user.value?.name)

async function fetchUser() {
  userLoading.value = true
  user.value = await api.getUser()
  userLoading.value = false
}

// 帖子相关逻辑聚合在一起
const posts = ref([])
const postsLoading = ref(false)
const postCount = computed(() => posts.value.length)

async function fetchPosts() {
  postsLoading.value = true
  posts.value = await api.getPosts()
  postsLoading.value = false
}

// 或者提取为 Composable
// const { user, userName, fetchUser } = useUser()
// const { posts, postCount, fetchPosts } = usePosts()

onMounted(() => {
  fetchUser()
  fetchPosts()
})
</script>
```

### 2. 代码复用

**Vue 2（Mixin）：**
```javascript
// mixin.js
export default {
  data() {
    return {
      loading: false
    }
  },
  methods: {
    async fetchData() {
      this.loading = true
      // fetch logic
      this.loading = false
    }
  }
}

// 使用
export default {
  mixins: [mixin]
}
```

**Vue 3（Composable）：**
```javascript
// composable.js
export function useFetch(url) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  async function fetchData() {
    loading.value = true
    try {
      data.value = await fetch(url).then(r => r.json())
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }
  
  return { data, loading, error, fetchData }
}

// 使用
const { data, loading, fetchData } = useFetch('/api/users')
```

### 3. 性能对比

```
指标              Vue 2    Vue 3    提升
────────────────────────────────────────
初始渲染          100ms    57ms     43%
更新性能          100ms    75ms     25%
内存占用          100MB    59MB     41%
Bundle 大小       32KB     19KB     41%
```

### 4. 响应式对比

**Vue 2 限制：**
```javascript
// ❌ 不能检测数组索引
this.items[0] = newValue

// ❌ 不能检测对象新增属性
this.obj.newProp = value

// ❌ 不能检测数组长度变化
this.items.length = 0

// ✅ 必须使用特殊方法
this.$set(this.items, 0, newValue)
this.$set(this.obj, 'newProp', value)
```

**Vue 3 改进：**
```javascript
// ✅ 都能检测
state.items[0] = newValue
state.obj.newProp = value
state.items.length = 0
```

---

## 迁移指南

### 从 Vue 2 迁移到 Vue 3

#### 1. 破坏性更改

**生命周期重命名：**
```javascript
// Vue 2
beforeDestroy → onBeforeUnmount
destroyed → onUnmounted
```

**v-model 变化：**
```vue
<!-- Vue 2 -->
<MyComponent v-model="value" />
<!-- 等价于 -->
<MyComponent :value="value" @input="value = $event" />

<!-- Vue 3 -->
<MyComponent v-model="value" />
<!-- 等价于 -->
<MyComponent :modelValue="value" @update:modelValue="value = $event" />
```

**$listeners 移除：**
```vue
<!-- Vue 2 -->
<template>
  <div v-on="$listeners">
</template>

<!-- Vue 3 -->
<template>
  <div v-bind="$attrs">
</template>
```

**过滤器移除：**
```vue
<!-- Vue 2 -->
{{ message | capitalize }}

<!-- Vue 3 -->
{{ capitalize(message) }}
```

#### 2. 迁移策略

**方案 1：渐进式迁移（推荐）**
```
1. 升级到 Vue 2.7（兼容层）
2. 使用 Composition API
3. 逐步迁移组件
4. 最后升级到 Vue 3
```

**方案 2：直接迁移**
```
1. 使用 @vue/compat（兼容版本）
2. 运行迁移工具
3. 修复警告
4. 测试
5. 移除兼容层
```

**迁移工具：**
```bash
# 安装迁移助手
npm install @vue/compat

# 使用兼容版本
import { createApp } from '@vue/compat'

// 配置
configureCompat({
  MODE: 2, // Vue 2 模式
  FEATURE_ID: false // 关闭特定警告
})
```

---

## 生态系统对比

### 核心库

| 库 | Vue 2 | Vue 3 |
|---|-------|-------|
| 路由 | vue-router@3 | vue-router@4 |
| 状态管理 | vuex@3 | pinia / vuex@4 |
| DevTools | Vue DevTools | Vue DevTools (新版) |
| 测试 | @vue/test-utils@1 | @vue/test-utils@2 |

### 流行组件库

| 组件库 | Vue 2 | Vue 3 |
|--------|-------|-------|
| Element UI | ✅ | Element Plus |
| Ant Design | ✅ | Ant Design Vue 3 |
| Vuetify | ✅ | Vuetify 3 |
| Naive UI | ❌ | ✅ |
| Arco Design | ❌ | ✅ |

---

## 面试常考点

### Q1: Vue 2 和 Vue 3 响应式原理的区别？

**答案：**
```javascript
// Vue 2: Object.defineProperty
// 缺点：
// 1. 无法检测数组索引变化
// 2. 无法检测对象新增/删除属性
// 3. 需要递归遍历整个对象
// 4. 性能开销大

// Vue 3: Proxy
// 优点：
// 1. 可以检测所有类型的变化
// 2. 惰性响应式（访问时才代理）
// 3. 性能更好
// 4. 更好的类型推导
```

### Q2: Composition API 相比 Options API 有什么优势？

**答案：**
```
1. 代码组织：
   - 按逻辑关注点组织
   - 相关代码聚合在一起

2. 代码复用：
   - Composable 更灵活
   - 避免 Mixin 的命名冲突

3. TypeScript 支持：
   - 完整的类型推导
   - 更好的 IDE 支持

4. Tree Shaking：
   - 按需引入
   - 更小的打包体积

5. 逻辑提取：
   - 更容易提取和测试
   - 更好的可维护性
```

### Q3: Vue 3 性能为什么更好？

**答案：**
```
1. 编译优化：
   - 静态提升
   - Patch Flag
   - Tree Flattening

2. Proxy 响应式：
   - 更快的初始化
   - 惰性响应式

3. 更小的体积：
   - Tree Shaking
   - Composition API

4. 优化的 Diff 算法：
   - 更快的 VNode 创建
   - 更精确的更新
```

---

## 总结

### 选择建议

**使用 Vue 2（维护模式）：**
```
✅ 老项目维护
✅ 依赖大量 Vue 2 插件
✅ 团队不熟悉新特性
```

**使用 Vue 3（推荐）：**
```
✅ 新项目
✅ 追求性能
✅ 需要 TypeScript
✅ 需要最新特性
```

### 学习路径

```
1. Vue 3 基础
   ├── Composition API
   ├── 响应式系统
   └── 生命周期

2. 进阶特性
   ├── Composable
   ├── Teleport
   └── Suspense

3. 生态系统
   ├── Vue Router
   ├── Pinia
   └── 组件库

4. 最佳实践
   ├── TypeScript 集成
   ├── 性能优化
   └── 测试
```

**最后更新：2026-06-08**
