# E2E测试完整指南

> End-to-End Testing 端到端测试实战文档
> 更新时间：2026-06-23

---

## 目录

1. [E2E测试概述](#1-e2e测试概述)
2. [测试工具选型](#2-测试工具选型)
3. [Cypress实战](#3-cypress实战)
4. [Playwright实战](#4-playwright实战)
5. [最佳实践](#5-最佳实践)
6. [CICD集成](#6-cicd集成)
7. [常见问题与解决方案](#7-常见问题与解决方案)

---

## 1. E2E测试概述

### 1.1 什么是E2E测试

**定义：** 从用户角度出发，模拟真实用户操作，测试完整业务流程的自动化测试。

**核心特点：**
- 真实浏览器环境
- 完整业务流程
- 用户视角
- 自动化执行

### 1.2 测试金字塔

```
           ┌──────────┐
           │   E2E    │  10% - 慢、昂贵、全面
           ├──────────┤
           │  集成测试 │  20% - 模块协作
           ├──────────┤
           │  单元测试 │  70% - 快速、大量、隔离
           └──────────┘
```

**比例建议：** 70% 单元 + 20% 集成 + 10% E2E

### 1.3 何时使用E2E测试

**✅ 适合场景：**
- 核心业务流程（登录、支付、下单）
- 关键用户路径
- 跨系统集成
- 回归测试

**❌ 不适合场景：**
- 所有边界情况（用单元测试）
- UI样式验证
- 纯逻辑计算
- 高频变动的功能

---

## 2. 测试工具选型

### 2.1 主流工具对比

| 工具 | 优势 | 劣势 | 适用场景 |
|------|------|------|---------|
| **Cypress** | 开发体验好<br>自动等待<br>实时重载 | 只支持Chromium系<br>不支持多标签页 | 中小型项目<br>快速迭代 |
| **Playwright** | 多浏览器支持<br>并行执行快<br>支持多标签 | 生态较新 | 大型项目<br>跨浏览器测试 |
| **Selenium** | 生态成熟<br>多语言支持 | 配置复杂<br>执行慢 | 遗留项目<br>需要IE支持 |

### 2.2 选型建议

**新项目推荐：** Cypress 或 Playwright

**选择标准：**
```javascript
if (需要跨浏览器测试 || 多标签页操作) {
  选择 Playwright
} else if (快速上手 && 开发体验优先) {
  选择 Cypress
} else if (需要IE支持 || 多语言团队) {
  选择 Selenium
}
```

---

## 3. Cypress实战

### 3.1 快速开始

```bash
# 1. 安装
npm install cypress --save-dev

# 2. 初始化
npx cypress open

# 3. 项目结构
cypress/
├── e2e/              # 测试文件
│   └── login.cy.js
├── fixtures/         # 测试数据
│   └── users.json
├── support/          # 自定义命令
│   ├── commands.js
│   └── e2e.js
└── cypress.config.js # 配置文件
```

### 3.2 核心示例：登录流程

```javascript
// cypress/e2e/login.cy.js
describe('用户登录流程', () => {
  beforeEach(() => {
    // 测试前准备
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('https://example.com/login')
  })

  it('成功登录并跳转到首页', () => {
    // 1. 输入用户名
    cy.get('[data-testid="username"]')
      .type('test@example.com')
    
    // 2. 输入密码
    cy.get('[data-testid="password"]')
      .type('password123')
    
    // 3. 点击登录
    cy.get('[data-testid="login-btn"]').click()
    
    // 4. 验证跳转
    cy.url().should('include', '/dashboard')
    
    // 5. 验证用户信息
    cy.contains('欢迎回来').should('be.visible')
    
    // 6. 验证token存储
    cy.window()
      .its('localStorage.token')
      .should('exist')
  })

  it('密码错误显示提示', () => {
    cy.get('[data-testid="username"]').type('test@example.com')
    cy.get('[data-testid="password"]').type('wrongpassword')
    cy.get('[data-testid="login-btn"]').click()
    
    cy.contains('用户名或密码错误')
      .should('be.visible')
    cy.url().should('include', '/login')
  })
})
```

### 3.3 核心API

```javascript
// ========== 元素操作 ==========
cy.get('[data-testid="btn"]')        // 查找元素
  .click()                           // 点击
  .type('text')                      // 输入
  .clear()                           // 清空
  .check()                           // 选中checkbox
  .select('option')                  // 选择select

// ========== 断言 ==========
cy.get('.element')
  .should('be.visible')              // 可见
  .should('have.text', 'Hello')      // 文本内容
  .should('have.class', 'active')    // 包含class
  .should('not.exist')               // 不存在

// ========== 等待 ==========
cy.wait(1000)                        // 等待时间（不推荐）
cy.wait('@apiRequest')               // 等待API（推荐）
cy.get('.loading').should('not.exist') // 等待元素消失

// ========== 网络拦截 ==========
cy.intercept('GET', '/api/users', {
  statusCode: 200,
  body: [{ id: 1, name: 'Alice' }]
}).as('getUsers')

cy.visit('/users')
cy.wait('@getUsers')
```

### 3.4 自定义命令

```javascript
// cypress/support/commands.js

// 登录命令
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login')
    cy.get('[data-testid="username"]').type(email)
    cy.get('[data-testid="password"]').type(password)
    cy.get('[data-testid="login-btn"]').click()
    cy.url().should('not.include', '/login')
  })
})

// API登录（更快）
Cypress.Commands.add('loginByAPI', (email, password) => {
  cy.request('POST', '/api/login', {
    email,
    password
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token)
  })
})

// 使用
cy.login('test@example.com', 'password123')
cy.loginByAPI('test@example.com', 'password123')
```

### 3.5 完整业务流程测试

```javascript
// cypress/e2e/shopping.cy.js
describe('电商购物流程', () => {
  beforeEach(() => {
    cy.loginByAPI('test@example.com', 'password123')
  })

  it('完整购物流程', () => {
    // 1. 搜索商品
    cy.visit('/home')
    cy.get('[data-testid="search"]').type('iPhone 15{enter}')
    cy.url().should('include', '/search')
    
    // 2. 选择商品
    cy.get('[data-testid="product-item"]')
      .first()
      .click()
    
    // 3. 添加到购物车
    cy.get('[data-testid="add-to-cart"]').click()
    cy.contains('已添加到购物车').should('be.visible')
    cy.get('[data-testid="cart-count"]').should('contain', '1')
    
    // 4. 进入购物车
    cy.get('[data-testid="cart-icon"]').click()
    cy.url().should('include', '/cart')
    cy.get('[data-testid="cart-item"]').should('exist')
    
    // 5. 修改数量
    cy.get('[data-testid="quantity"]').clear().type('2')
    cy.get('[data-testid="update"]').click()
    
    // 6. 结算
    cy.get('[data-testid="checkout"]').click()
    cy.url().should('include', '/checkout')
    
    // 7. 填写地址
    cy.get('[data-testid="address-name"]').type('张三')
    cy.get('[data-testid="address-phone"]').type('13800138000')
    cy.get('[data-testid="address-detail"]')
      .type('北京市朝阳区xxx')
    
    // 8. 选择支付方式
    cy.get('[data-testid="payment"]').select('支付宝')
    
    // 9. 提交订单
    cy.intercept('POST', '/api/orders').as('createOrder')
    cy.get('[data-testid="submit-order"]').click()
    cy.wait('@createOrder')
    
    // 10. 验证订单创建成功
    cy.url().should('match', /\/order\/\d+/)
    cy.contains('订单创建成功').should('be.visible')
    cy.get('[data-testid="order-number"]').should('exist')
  })
})
```

---

## 4. Playwright实战

### 4.1 快速开始

```bash
# 1. 安装
npm install @playwright/test --save-dev

# 2. 初始化
npx playwright install

# 3. 项目结构
tests/
├── login.spec.js
├── shopping.spec.js
└── fixtures/
    └── testData.json
playwright.config.js
```

### 4.2 核心示例

```javascript
// tests/login.spec.js
const { test, expect } = require('@playwright/test')

test.describe('用户登录', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://example.com/login')
  })

  test('成功登录', async ({ page }) => {
    // 输入信息
    await page.fill('[data-testid="username"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    
    // 点击登录
    await page.click('[data-testid="login-btn"]')
    
    // 等待导航
    await page.waitForURL('**/dashboard')
    
    // 验证
    await expect(page.locator('text=欢迎回来')).toBeVisible()
  })

  test('错误处理', async ({ page }) => {
    await page.fill('[data-testid="username"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'wrong')
    await page.click('[data-testid="login-btn"]')
    
    await expect(page.locator('text=密码错误')).toBeVisible()
  })
})
```

### 4.3 多浏览器测试

```javascript
// playwright.config.js
module.exports = {
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] }
    }
  ]
}

// 运行
npx playwright test                      # 所有浏览器
npx playwright test --project=chromium   # 指定浏览器
```

### 4.4 高级特性

```javascript
// 1. 网络拦截
test('Mock API响应', async ({ page }) => {
  await page.route('**/api/products', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify([
        { id: 1, name: 'Product 1' }
      ])
    })
  })
  
  await page.goto('/products')
  await expect(page.locator('.product')).toHaveCount(1)
})

// 2. 多标签页
test('多标签页操作', async ({ context }) => {
  const page1 = await context.newPage()
  await page1.goto('/page1')
  
  const page2 = await context.newPage()
  await page2.goto('/page2')
  
  // 在两个页面间切换
  await page1.bringToFront()
  await page1.click('.button')
})

// 3. 文件上传
test('上传文件', async ({ page }) => {
  await page.goto('/upload')
  
  await page.setInputFiles(
    'input[type="file"]',
    'path/to/file.jpg'
  )
  
  await page.click('button[type="submit"]')
})

// 4. 截图对比
test('视觉回归测试', async ({ page }) => {
  await page.goto('/home')
  await expect(page).toHaveScreenshot('homepage.png')
})
```

---

## 5. 最佳实践

### 5.1 选择器策略

```javascript
// ✅ 推荐：data-testid（专门用于测试）
cy.get('[data-testid="submit-btn"]')

// ✅ 可以：ARIA标签
cy.get('[aria-label="关闭"]')

// ⚠️ 谨慎：ID选择器
cy.get('#user-form')

// ❌ 避免：CSS类（容易变化）
cy.get('.btn-primary')

// ❌ 避免：文本内容（国际化会变）
cy.contains('提交')

// HTML中添加测试ID
<button data-testid="submit-btn" class="btn btn-primary">
  提交
</button>
```

### 5.2 测试数据管理

```javascript
// 方法1：Fixture文件
// cypress/fixtures/users.json
{
  "testUser": {
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }
}

// 使用
cy.fixture('users').then((users) => {
  cy.login(users.testUser.email, users.testUser.password)
})

// 方法2：环境变量
// cypress.config.js
module.exports = {
  env: {
    testUser: 'test@example.com',
    testPassword: 'password123'
  }
}

// 使用
cy.login(Cypress.env('testUser'), Cypress.env('testPassword'))

// 方法3：API准备数据
before(() => {
  cy.request('POST', '/api/test/seed', {
    user: { email: 'test@example.com' },
    products: [{ id: 1, name: 'Product 1' }]
  })
})
```

### 5.3 Page Object模式

```javascript
// pages/LoginPage.js
class LoginPage {
  visit() {
    cy.visit('/login')
  }

  fillUsername(username) {
    cy.get('[data-testid="username"]').type(username)
    return this
  }

  fillPassword(password) {
    cy.get('[data-testid="password"]').type(password)
    return this
  }

  submit() {
    cy.get('[data-testid="submit"]').click()
    return this
  }

  login(username, password) {
    this.fillUsername(username)
        .fillPassword(password)
        .submit()
  }

  expectErrorMessage(message) {
    cy.contains(message).should('be.visible')
  }
}

export default new LoginPage()

// 使用
import LoginPage from './pages/LoginPage'

it('用户登录', () => {
  LoginPage.visit()
  LoginPage.login('test@example.com', 'password123')
  
  cy.url().should('include', '/dashboard')
})
```

### 5.4 避免测试实现细节

```javascript
// ❌ 不好：测试实现
test('点击按钮调用handleClick', () => {
  const spy = jest.fn()
  render(<Button onClick={spy} />)
  fireEvent.click(button)
  expect(spy).toHaveBeenCalled()
})

// ✅ 好：测试结果
test('点击按钮显示消息', () => {
  cy.get('[data-testid="button"]').click()
  cy.contains('操作成功').should('be.visible')
})

// ❌ 不好：测试组件状态
test('state.count应该是1', () => {
  expect(wrapper.state('count')).toBe(1)
})

// ✅ 好：测试用户可见的内容
test('显示计数为1', () => {
  cy.contains('Count: 1').should('be.visible')
})
```

### 5.5 性能优化

```javascript
// 1. 通过API登录（快10倍）
// ❌ 慢：每次都通过UI登录
beforeEach(() => {
  cy.visit('/login')
  cy.get('[data-testid="username"]').type('test@example.com')
  cy.get('[data-testid="password"]').type('password123')
  cy.get('[data-testid="submit"]').click()
  cy.url().should('include', '/dashboard')
})

// ✅ 快：通过API登录
beforeEach(() => {
  cy.request('POST', '/api/login', {
    email: 'test@example.com',
    password: 'password123'
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token)
  })
  cy.visit('/dashboard')
})

// 2. 使用cy.session缓存登录状态
beforeEach(() => {
  cy.session('user-session', () => {
    cy.loginByAPI('test@example.com', 'password123')
  })
})

// 3. 并行执行
// cypress.config.js
module.exports = {
  e2e: {
    experimentalRunAllSpecs: true,  // 并行运行
  }
}

// package.json
{
  "scripts": {
    "test:e2e:parallel": "cypress run --parallel --record --key <key>"
  }
}
```

---

## 6. CI/CD集成

### 6.1 GitHub Actions

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        browser: [chrome, firefox, edge]
    
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Start server
        run: npm run start &
      
      - name: Wait for server
        run: npx wait-on http://localhost:3000
      
      - name: Run Cypress tests
        uses: cypress-io/github-action@v5
        with:
          browser: ${{ matrix.browser }}
          record: true
          parallel: true
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
      
      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: cypress-screenshots-${{ matrix.browser }}
          path: cypress/screenshots
      
      - name: Upload videos
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: cypress-videos-${{ matrix.browser }}
          path: cypress/videos
```

### 6.2 GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test

e2e-tests:
  stage: test
  image: cypress/browsers:node18.12.0-chrome106-ff106
  
  before_script:
    - npm ci
    - npm run build
    - npm run start &
    - npx wait-on http://localhost:3000
  
  script:
    - npm run test:e2e
  
  artifacts:
    when: always
    paths:
      - cypress/screenshots
      - cypress/videos
    expire_in: 1 week
  
  only:
    - main
    - develop
    - merge_requests
```

### 6.3 Docker集成

```dockerfile
# Dockerfile.e2e
FROM cypress/browsers:node18.12.0-chrome106-ff106

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# 构建应用
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动脚本
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
```

```bash
# docker-entrypoint.sh
#!/bin/bash
set -e

# 启动应用
npm run start &

# 等待应用启动
npx wait-on http://localhost:3000

# 运行测试
npm run test:e2e

# 停止应用
kill %1
```

```bash
# 运行
docker build -f Dockerfile.e2e -t app-e2e .
docker run app-e2e
```

---

## 7. 常见问题与解决方案

### 7.1 测试不稳定（Flaky Tests）

**问题：** 测试有时通过，有时失败

**原因：**
- 元素还未加载完成
- 网络请求延迟
- 动画未完成
- 时间相关逻辑

**解决方案：**

```javascript
// ❌ 问题代码
cy.get('.button').click()  // 元素可能还没渲染

// ✅ 解决1：Cypress自动等待
cy.get('.button').click()  // Cypress会等待元素可见和可点击

// ✅ 解决2：显式等待
cy.get('.loading').should('not.exist')
cy.get('.content').should('be.visible')

// ✅ 解决3：等待API
cy.intercept('GET', '/api/data').as('getData')
cy.visit('/page')
cy.wait('@getData')

// ✅ 解决4：重试机制
cy.get('.dynamic-element', { timeout: 10000 })
  .should('be.visible')

// cypress.config.js - 全局配置
module.exports = {
  e2e: {
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    retries: {
      runMode: 2,  // CI环境重试2次
      openMode: 0  // 本地开发不重试
    }
  }
}
```

### 7.2 跨域问题

```javascript
// 问题：无法访问跨域资源

// 解决1：禁用Web安全（仅测试环境）
// cypress.config.js
module.exports = {
  e2e: {
    chromeWebSecurity: false
  }
}

// 解决2：使用cy.origin处理跨域
cy.origin('https://external-site.com', () => {
  cy.visit('/')
  cy.get('#external-button').click()
})

// 解决3：代理配置
// cypress.config.js
module.exports = {
  e2e: {
    setupNodeEvents(on, config) {
      // 配置代理
      return config
    }
  }
}
```

### 7.3 元素无法点击

```javascript
// 问题：元素被遮挡或不可见

// ❌ 错误
cy.get('.button').click()  // 可能被其他元素遮挡

// ✅ 解决1：强制点击
cy.get('.button').click({ force: true })

// ✅ 解决2：滚动到视图
cy.get('.button').scrollIntoView().click()

// ✅ 解决3：等待遮挡元素消失
cy.get('.modal').should('not.exist')
cy.get('.button').click()

// ✅ 解决4：关闭遮挡元素
cy.get('.overlay-close').click()
cy.get('.button').click()
```

### 7.4 动态内容测试

```javascript
// 问题：内容动态加载，不确定何时加载完成

// ✅ 解决1：等待特定元素
cy.get('[data-testid="loading"]').should('not.exist')
cy.get('[data-testid="content"]').should('be.visible')

// ✅ 解决2：等待API请求
cy.intercept('GET', '/api/data').as('getData')
cy.wait('@getData')
cy.get('.data-list').children().should('have.length.gt', 0)

// ✅ 解决3：轮询检查
cy.get('.list-item').should('have.length.gte', 1)

// ✅ 解决4：自定义等待
Cypress.Commands.add('waitForData', () => {
  cy.get('[data-testid="list"]').then($list => {
    if ($list.children().length === 0) {
      cy.wait(1000)
      cy.waitForData()
    }
  })
})
```

### 7.5 测试数据清理

```javascript
// 问题：测试数据污染导致测试失败

// ✅ 解决：每次测试后清理
beforeEach(() => {
  // 清理浏览器存储
  cy.clearCookies()
  cy.clearLocalStorage()
  cy.clearAllSessionStorage()
})

afterEach(() => {
  // 清理测试数据（通过API）
  cy.request('POST', '/api/test/cleanup')
})

// 或使用数据库回滚
before(() => {
  cy.task('db:seed')  // 初始化数据
})

after(() => {
  cy.task('db:reset')  // 重置数据库
})

// cypress.config.js
module.exports = {
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        'db:seed': () => {
          // 执行数据库seed
          return null
        },
        'db:reset': () => {
          // 重置数据库
          return null
        }
      })
    }
  }
}
```

---

## 8. 附录

### 8.1 快速命令参考

```bash
# Cypress
npm install cypress --save-dev          # 安装
npx cypress open                        # 打开GUI
npx cypress run                         # 命令行运行
npx cypress run --browser chrome        # 指定浏览器
npx cypress run --spec "cypress/e2e/login.cy.js"  # 运行指定文件

# Playwright
npm install @playwright/test --save-dev # 安装
npx playwright install                  # 安装浏览器
npx playwright test                     # 运行所有测试
npx playwright test --headed            # 显示浏览器
npx playwright test --project=chromium  # 指定浏览器
npx playwright show-report              # 查看报告
```

### 8.2 推荐资源

**官方文档：**
- Cypress: https://docs.cypress.io
- Playwright: https://playwright.dev
- Testing Library: https://testing-library.com

**视频教程：**
- Cypress Real World App: https://github.com/cypress-io/cypress-realworld-app
- Playwright Examples: https://github.com/microsoft/playwright

**最佳实践：**
- Test Automation University: https://testautomationu.applitools.com
- Kent C. Dodds Testing Course: https://testingjavascript.com

---

## 9. 总结

### 9.1 核心要点

1. **E2E测试金字塔：** 70%单元 + 20%集成 + 10%E2E
2. **选择器策略：** 优先使用 `data-testid`
3. **性能优化：** 通过API快速准备数据
4. **稳定性：** 合理使用等待和重试
5. **CI/CD集成：** 自动化测试流程

### 9.2 最佳实践清单

- ✅ 使用 `data-testid` 选择器
- ✅ 测试用户行为而非实现细节
- ✅ 通过API登录提升速度
- ✅ 使用自定义命令复用代码
- ✅ 每次测试前清理数据
- ✅ 配置重试机制
- ✅ 集成到CI/CD流程
- ✅ 保存失败时的截图和视频
- ❌ 避免硬编码等待时间
- ❌ 避免测试所有边界情况

### 9.3 下一步行动

1. **立即开始：** 选择Cypress或Playwright，创建第一个测试
2. **核心流程：** 覆盖登录、支付等关键业务流程
3. **持续优化：** 定期检查测试稳定性和执行时间
4. **团队协作：** 制定测试规范和Code Review标准

---

**文档维护：** 本文档应根据项目实践持续更新
**反馈渠道：** [在此添加团队反馈渠道]
