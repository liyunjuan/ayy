# 前端工程化体系资深面试指南

## 目录
1. [模块化](#1-模块化)
2. [构建工具](#2-构建工具)
3. [包管理](#3-包管理)
4. [代码规范](#4-代码规范)
5. [Git 工作流](#5-git-工作流)
6. [CI/CD](#6-cicd)
7. [Monorepo](#7-monorepo)
8. [微前端](#8-微前端)
9. [性能监控](#9-性能监控)
10. [脚手架](#10-脚手架)
11. [实战案例](#11-实战案例)
12. [经典面试题](#12-经典面试题)

---

## 1. 模块化

### 1.1 模块化演进

```javascript
// 1. 全局变量（无模块化）
// math.js
var add = function(a, b) {
  return a + b;
};

// main.js
console.log(add(1, 2));

// 问题：命名冲突、依赖关系不明确

// 2. 命名空间
var MyApp = {
  utils: {
    add: function(a, b) {
      return a + b;
    }
  }
};

// 3. IIFE（立即执行函数）
var MyApp = (function() {
  var privateVar = 'private';
  
  return {
    publicMethod: function() {
      return privateVar;
    }
  };
})();

// 4. CommonJS（Node.js）
// math.js
module.exports = {
  add: function(a, b) {
    return a + b;
  }
};

// main.js
const math = require('./math');
console.log(math.add(1, 2));

// 特点：
// • 同步加载
// • 运行时加载
// • 值拷贝
// • 服务端

// 5. AMD（浏览器）
// RequireJS
define(['jquery'], function($) {
  return {
    init: function() {
      console.log($);
    }
  };
});

// 特点：
// • 异步加载
// • 依赖前置
// • 浏览器端

// 6. UMD（通用模块）
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS
    module.exports = factory(require('jquery'));
  } else {
    // 全局变量
    root.MyModule = factory(root.jQuery);
  }
}(this, function($) {
  return {
    init: function() {
      console.log($);
    }
  };
}));

// 7. ES Module（标准）
// math.js
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

// main.js
import { add, subtract } from './math.js';
console.log(add(1, 2));

// 特点：
// • 静态分析（Tree Shaking）
// • 编译时加载
// • 值引用
// • 浏览器 + Node.js
```

### 1.2 CommonJS vs ES Module

```javascript
// CommonJS

// 1. 导出
// 方式1：module.exports
module.exports = {
  add: function(a, b) {
    return a + b;
  }
};

// 方式2：exports
exports.add = function(a, b) {
  return a + b;
};

// 注意：不能直接赋值 exports
exports = { add: ... }; // ❌ 错误

// 2. 导入
const math = require('./math');
const { add } = require('./math');

// 3. 特性
// • 值拷贝（修改不影响原模块）
const { count } = require('./counter');
console.log(count); // 0
increment();
console.log(count); // 仍然是 0

// • 运行时加载
if (condition) {
  const module = require('./module'); // ✅ 可以
}

// • 同步加载
const data = require('./data.json');

// ES Module

// 1. 导出
// 命名导出
export const name = 'John';
export function add(a, b) {
  return a + b;
}

// 默认导出
export default function() {
  console.log('default');
}

// 2. 导入
import { name, add } from './math.js';
import math from './math.js';
import * as math from './math.js';

// 3. 特性
// • 值引用（修改会影响原模块）
import { count, increment } from './counter.js';
console.log(count); // 0
increment();
console.log(count); // 1 ✅

// • 编译时加载（静态分析）
if (condition) {
  import module from './module'; // ❌ 错误
}

// 动态导入
if (condition) {
  const module = await import('./module'); // ✅ 可以
}

// • 异步加载（浏览器）
<script type="module" src="./main.js"></script>

// 对比总结：

// CommonJS:
// ✅ Node.js 原生支持
// ✅ 同步加载（服务端）
// ❌ 无法 Tree Shaking
// ❌ 运行时加载

// ES Module:
// ✅ 标准规范
// ✅ 静态分析（Tree Shaking）
// ✅ 异步加载（浏览器）
// ✅ 浏览器 + Node.js
// ❌ Node.js 需要配置（.mjs 或 package.json type: "module"）
```

### 1.3 Tree Shaking

```javascript
// Tree Shaking：移除未使用的代码

// 1. 原理
// • 基于 ES Module 静态分析
// • Webpack、Rollup 等工具实现

// 2. 前提条件
// • 使用 ES Module
// • production 模式
// • 没有副作用（side effects）

// math.js
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) { // 未使用，会被移除
  return a - b;
}

// main.js
import { add } from './math.js';
console.log(add(1, 2));

// 打包后：只包含 add，subtract 被移除

// 3. package.json 配置
{
  "sideEffects": false  // 所有模块无副作用，可以安全移除
}

// 或指定有副作用的文件
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}

// 4. 副作用示例
// 有副作用（会被保留）
import './polyfill.js'; // 执行全局代码
import './global.css'; // 样式文件

// 无副作用（可以移除）
import { add } from './math.js'; // 纯函数

// 5. Webpack 配置
module.exports = {
  mode: 'production', // 启用 Tree Shaking
  optimization: {
    usedExports: true, // 标记未使用的导出
    minimize: true     // 移除未使用的代码
  }
};

// 6. 实战技巧
// • 使用 ES Module 导入库
import { Button } from 'antd'; // ✅ 支持 Tree Shaking

// • 避免 import *
import * as utils from './utils'; // ❌ 无法 Tree Shaking
import { add, subtract } from './utils'; // ✅ 可以 Tree Shaking

// • 使用 babel-plugin-import
// .babelrc
{
  "plugins": [
    ["import", {
      "libraryName": "antd",
      "style": true
    }]
  ]
}

// 转换前
import { Button } from 'antd';

// 转换后
import Button from 'antd/lib/button';
import 'antd/lib/button/style';
```

---

## 2. 构建工具

### 2.1 Webpack

```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  // 入口
  entry: {
    main: './src/index.js',
    vendor: ['react', 'react-dom']
  },
  
  // 输出
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js',
    clean: true
  },
  
  // 模式
  mode: 'production',
  
  // 模块规则
  module: {
    rules: [
      // JavaScript
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      
      // CSS
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      },
      
      // SCSS
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      },
      
      // 图片
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024 // 8KB 以下内联
          }
        },
        generator: {
          filename: 'images/[name].[hash:8][ext]'
        }
      },
      
      // 字体
      {
        test: /\.(woff2?|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash:8][ext]'
        }
      }
    ]
  },
  
  // 插件
  plugins: [
    // HTML
    new HtmlWebpackPlugin({
      template: './public/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true
      }
    }),
    
    // CSS 提取
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css',
      chunkFilename: '[name].[contenthash:8].chunk.css'
    })
  ],
  
  // 优化
  optimization: {
    // 代码拆分
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          priority: 10
        },
        common: {
          minChunks: 2,
          name: 'common',
          priority: 5,
          reuseExistingChunk: true
        }
      }
    },
    
    // Runtime 提取
    runtimeChunk: 'single',
    
    // 压缩
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        }
      }),
      new CssMinimizerPlugin()
    ]
  },
  
  // 开发服务器
  devServer: {
    static: './dist',
    hot: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      }
    }
  },
  
  // Source Map
  devtool: 'source-map', // production
  // devtool: 'eval-source-map', // development
  
  // 解析
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components')
    }
  }
};

// Webpack 5 新特性：

// 1. 持久化缓存
cache: {
  type: 'filesystem',
  buildDependencies: {
    config: [__filename]
  }
}

// 2. 模块联邦（Module Federation）
new ModuleFederationPlugin({
  name: 'app1',
  remotes: {
    app2: 'app2@http://localhost:3001/remoteEntry.js'
  },
  exposes: {
    './Button': './src/Button'
  },
  shared: ['react', 'react-dom']
})

// 3. Asset Modules（替代 file-loader、url-loader）
{
  test: /\.png$/,
  type: 'asset/resource'  // 输出文件
  // type: 'asset/inline'  // 内联 Base64
  // type: 'asset/source'  // 源码
  // type: 'asset'         // 自动选择
}
```

### 2.2 Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  // 插件
  plugins: [react()],
  
  // 路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components')
    }
  },
  
  // 开发服务器
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  
  // 构建
  build: {
    // 输出目录
    outDir: 'dist',
    
    // 静态资源目录
    assetsDir: 'assets',
    
    // 小于此阈值的文件将内联为 base64
    assetsInlineLimit: 4096,
    
    // Rollup 选项
    rollupOptions: {
      output: {
        // 分包
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash', 'axios']
        }
      }
    },
    
    // 压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    // Source Map
    sourcemap: false
  },
  
  // CSS
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    },
    modules: {
      localsConvention: 'camelCase'
    }
  },
  
  // 环境变量
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
});

// Vite 特点：

// 1. 开发时：ESM + 按需编译
// • 无需打包，直接运行
// • 启动速度快
// • HMR 更新快

// 2. 生产时：Rollup 打包
// • Tree Shaking
// • 代码拆分
// • 优化体积

// 3. 优势
// ✅ 极快的开发服务器启动
// ✅ 极快的 HMR
// ✅ 零配置
// ✅ 支持 TypeScript、JSX、CSS 预处理器

// 4. 使用场景
// • 新项目（推荐）
// • Vue 3 项目
// • React 项目
// • 快速原型

// 5. Webpack vs Vite

// Webpack:
// ✅ 生态成熟
// ✅ 配置灵活
// ✅ 支持更多场景
// ❌ 启动慢
// ❌ HMR 慢

// Vite:
// ✅ 启动快
// ✅ HMR 快
// ✅ 零配置
// ❌ 生态较新
// ❌ 不支持 IE11
```

### 2.3 Rollup

```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  
  output: [
    // UMD
    {
      file: 'dist/bundle.umd.js',
      format: 'umd',
      name: 'MyLibrary',
      globals: {
        react: 'React'
      }
    },
    
    // ES Module
    {
      file: 'dist/bundle.esm.js',
      format: 'es'
    },
    
    // CommonJS
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs'
    }
  ],
  
  plugins: [
    resolve(),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    }),
    terser()
  ],
  
  external: ['react', 'react-dom']
};

// Rollup 特点：
// • 专注于库打包
// • 更好的 Tree Shaking
// • 输出更干净的代码
// • 支持多种格式

// 使用场景：
// • 打包库
// • 工具函数
// • UI 组件库
```

---

## 3. 包管理

### 3.1 npm

```bash
# 初始化项目
npm init
npm init -y

# 安装依赖
npm install <package>
npm install <package>@<version>
npm install <package> --save-dev
npm install <package> --global

# 简写
npm i <package>
npm i <package> -D
npm i <package> -g

# 卸载
npm uninstall <package>

# 更新
npm update <package>
npm outdated  # 查看过时的包

# 审计安全漏洞
npm audit
npm audit fix

# 发布
npm login
npm publish

# scripts
npm run <script>
npm run build
npm run test

# package.json
{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^4.0.0"
  }
}

# 版本号规则
"^1.2.3"  # >=1.2.3 <2.0.0（推荐）
"~1.2.3"  # >=1.2.3 <1.3.0
"1.2.3"   # 精确版本
"*"       # 任意版本（不推荐）
"latest"  # 最新版本

# package-lock.json
# • 锁定依赖版本
# • 确保团队一致
# • 提交到 Git
```

### 3.2 yarn

```bash
# 安装 yarn
npm install -g yarn

# 初始化
yarn init
yarn init -y

# 安装依赖
yarn add <package>
yarn add <package>@<version>
yarn add <package> --dev
yarn global add <package>

# 卸载
yarn remove <package>

# 更新
yarn upgrade <package>

# 审计
yarn audit

# scripts
yarn <script>
yarn build
yarn test

# yarn.lock
# 锁定依赖版本

# Yarn 2（Berry）
# • Plug'n'Play (PnP)：无 node_modules
# • Zero-Installs：离线安装
# • Workspaces：Monorepo 支持
```

### 3.3 pnpm

```bash
# 安装 pnpm
npm install -g pnpm

# 初始化
pnpm init

# 安装依赖
pnpm add <package>
pnpm add <package> -D
pnpm add <package> -g

# 卸载
pnpm remove <package>

# 更新
pnpm update <package>

# scripts
pnpm <script>
pnpm build

# pnpm 特点：
# 1. 节省磁盘空间
# • 硬链接共享依赖
# • 同一个包只存一份

# 2. 安装速度快
# • 并行下载
# • 增量安装

# 3. 严格的依赖管理
# • 不能访问未声明的依赖

# 4. Monorepo 支持
# pnpm-workspace.yaml
packages:
  - 'packages/*'

# npm vs yarn vs pnpm

# 速度（安装 100 个包）：
# pnpm: 10s
# yarn: 15s
# npm: 25s

# 磁盘占用：
# pnpm: 100MB（硬链接）
# yarn: 300MB
# npm: 500MB

# 推荐：
# • 新项目：pnpm
# • 大型项目/Monorepo：pnpm
# • 团队已有工具：保持一致
```

---

## 4. 代码规范

### 4.1 ESLint

```javascript
// .eslintrc.js
module.exports = {
  // 环境
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  
  // 扩展配置
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  
  // 解析器
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  
  // 插件
  plugins: [
    'react',
    '@typescript-eslint'
  ],
  
  // 规则
  rules: {
    // 禁止 console
    'no-console': 'warn',
    
    // 禁止 debugger
    'no-debugger': 'error',
    
    // 未使用的变量
    'no-unused-vars': ['error', {
      argsIgnorePattern: '^_'
    }],
    
    // React Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // TypeScript
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off'
  },
  
  // 忽略
  ignorePatterns: [
    'dist',
    'node_modules',
    '*.config.js'
  ]
};

// package.json
{
  "scripts": {
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint src --ext .js,.jsx,.ts,.tsx --fix"
  }
}

// .eslintignore
dist
node_modules
*.config.js
```

### 4.2 Prettier

```javascript
// .prettierrc.js
module.exports = {
  // 每行最大长度
  printWidth: 100,
  
  // 缩进
  tabWidth: 2,
  useTabs: false,
  
  // 分号
  semi: true,
  
  // 引号
  singleQuote: true,
  
  // JSX 引号
  jsxSingleQuote: false,
  
  // 尾随逗号
  trailingComma: 'es5',
  
  // 括号空格
  bracketSpacing: true,
  
  // JSX 括号
  jsxBracketSameLine: false,
  
  // 箭头函数参数
  arrowParens: 'always',
  
  // 换行符
  endOfLine: 'lf'
};

// package.json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,scss,md}\"",
    "format:check": "prettier --check \"src/**/*.{js,jsx,ts,tsx,json,css,scss,md}\""
  }
}

// .prettierignore
dist
node_modules
*.config.js

// VSCode 配置
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### 4.3 Stylelint

```javascript
// .stylelintrc.js
module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-prettier'
  ],
  
  plugins: [
    'stylelint-scss'
  ],
  
  rules: {
    // 颜色十六进制
    'color-hex-length': 'short',
    
    // 选择器类名
    'selector-class-pattern': '^[a-z][a-zA-Z0-9]+$',
    
    // 禁止 !important
    'declaration-no-important': true,
    
    // 单位
    'unit-allowed-list': ['px', 'rem', '%', 'vh', 'vw', 's', 'ms']
  }
};

// package.json
{
  "scripts": {
    "stylelint": "stylelint \"src/**/*.{css,scss}\"",
    "stylelint:fix": "stylelint \"src/**/*.{css,scss}\" --fix"
  }
}
```

### 4.4 Husky + lint-staged

```bash
# 安装
npm install -D husky lint-staged

# 初始化 husky
npx husky-init && npm install

# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged

# package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss}": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}

# Git Hooks
# pre-commit: 提交前检查
# commit-msg: 提交信息检查
# pre-push: 推送前检查
```

### 4.5 commitlint

```bash
# 安装
npm install -D @commitlint/cli @commitlint/config-conventional

# commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复
        'docs',     // 文档
        'style',    // 格式
        'refactor', // 重构
        'perf',     // 性能
        'test',     // 测试
        'chore',    // 构建
        'revert'    // 回退
      ]
    ],
    'subject-case': [0]
  }
};

# .husky/commit-msg
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx --no -- commitlint --edit "$1"

# 提交示例
git commit -m "feat: 添加用户登录功能"
git commit -m "fix: 修复登录按钮样式"
git commit -m "docs: 更新 README"
```

---

## 5. Git 工作流

### 5.1 Git Flow

```bash
# Git Flow 分支模型

# 主分支
main (master)    # 生产环境
develop          # 开发环境

# 辅助分支
feature/*        # 新功能
release/*        # 发布准备
hotfix/*         # 紧急修复

# 工作流程

# 1. 开发新功能
git checkout develop
git checkout -b feature/user-login

# 开发...
git add .
git commit -m "feat: 添加用户登录"

# 完成后合并到 develop
git checkout develop
git merge --no-ff feature/user-login
git branch -d feature/user-login
git push origin develop

# 2. 准备发布
git checkout develop
git checkout -b release/v1.0.0

# 修复 bug、更新版本号...
git commit -m "chore: bump version to 1.0.0"

# 合并到 main 和 develop
git checkout main
git merge --no-ff release/v1.0.0
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main --tags

git checkout develop
git merge --no-ff release/v1.0.0
git branch -d release/v1.0.0

# 3. 紧急修复
git checkout main
git checkout -b hotfix/critical-bug

# 修复...
git commit -m "fix: 修复严重bug"

# 合并到 main 和 develop
git checkout main
git merge --no-ff hotfix/critical-bug
git tag -a v1.0.1 -m "Hotfix v1.0.1"

git checkout develop
git merge --no-ff hotfix/critical-bug
git branch -d hotfix/critical-bug
```

### 5.2 GitHub Flow

```bash
# GitHub Flow（简化版）

# 只有一个主分支
main

# 工作流程

# 1. 创建分支
git checkout -b feature/user-login

# 2. 提交代码
git add .
git commit -m "feat: 添加用户登录"
git push origin feature/user-login

# 3. 创建 Pull Request
# 在 GitHub 上创建 PR

# 4. 代码审查
# 团队成员审查代码

# 5. 合并到 main
# PR 通过后合并

# 6. 部署
# main 分支自动部署到生产环境

# 优点：
# • 简单易懂
# • 适合持续部署
# • 快速迭代

# 缺点：
# • 不适合多版本维护
# • 需要强大的 CI/CD
```

### 5.3 Trunk Based Development

```bash
# Trunk Based Development（主干开发）

# 只有一个主分支
main

# 特点：
# • 所有开发直接在 main 分支
# • 或创建短期分支（< 1天）
# • 高频提交
# • 强依赖 CI/CD
# • 使用 Feature Flag 控制功能

# 工作流程

# 1. 小功能直接提交
git checkout main
git pull
# 开发...
git add .
git commit -m "feat: 小功能"
git push origin main

# 2. 大功能使用 Feature Flag
// 代码中
if (featureFlags.newFeature) {
  // 新功能代码
} else {
  // 旧功能代码
}

# 3. 短期分支
git checkout -b feature/quick-fix
# 开发...
git push origin feature/quick-fix
# 立即合并，删除分支

# 优点：
# • 最小化合并冲突
# • 快速集成
# • 代码持续可用

# 缺点：
# • 需要强大的测试
# • 需要 Feature Flag 系统
# • 团队成员要求高
```

---

## 6. CI/CD

### 6.1 GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

# 触发条件
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

# 任务
jobs:
  # 测试
  test:
    runs-on: ubuntu-latest
    
    steps:
      # 检出代码
      - uses: actions/checkout@v3
      
      # 设置 Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      # 安装依赖
      - name: Install dependencies
        run: npm ci
      
      # 代码检查
      - name: Lint
        run: npm run lint
      
      # 运行测试
      - name: Test
        run: npm test
      
      # 上传覆盖率
      - name: Upload coverage
        uses: codecov/codecov-action@v3
  
  # 构建
  build:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      # 上传构建产物
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist
  
  # 部署
  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      # 下载构建产物
      - name: Download artifact
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist
      
      # 部署到服务器
      - name: Deploy
        uses: easingthemes/ssh-deploy@v2
        with:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          SOURCE: "dist/"
          TARGET: "/var/www/html"
```

### 6.2 GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - lint
  - test
  - build
  - deploy

# 缓存
cache:
  paths:
    - node_modules/

# 代码检查
lint:
  stage: lint
  image: node:18
  script:
    - npm ci
    - npm run lint

# 测试
test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm test
  coverage: '/Statements\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

# 构建
build:
  stage: build
  image: node:18
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week

# 部署到测试环境
deploy:staging:
  stage: deploy
  image: alpine:latest
  script:
    - apk add --no-cache rsync openssh
    - rsync -avz dist/ user@staging-server:/var/www/html
  only:
    - develop

# 部署到生产环境
deploy:production:
  stage: deploy
  image: alpine:latest
  script:
    - apk add --no-cache rsync openssh
    - rsync -avz dist/ user@prod-server:/var/www/html
  only:
    - main
  when: manual  # 手动触发
```

### 6.3 Jenkins

```groovy
// Jenkinsfile
pipeline {
  agent any
  
  stages {
    // 安装依赖
    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }
    
    // 代码检查
    stage('Lint') {
      steps {
        sh 'npm run lint'
      }
    }
    
    // 测试
    stage('Test') {
      steps {
        sh 'npm test'
      }
    }
    
    // 构建
    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }
    
    // 部署
    stage('Deploy') {
      when {
        branch 'main'
      }
      steps {
        sh '''
          rsync -avz dist/ user@server:/var/www/html
        '''
      }
    }
  }
  
  // 通知
  post {
    success {
      echo 'Pipeline succeeded!'
    }
    failure {
      echo 'Pipeline failed!'
    }
  }
}
```

---

## 7. Monorepo

### 7.1 概念

```bash
# Monorepo（单一仓库）
# 多个项目在同一个 Git 仓库中

project/
├── packages/
│   ├── app1/
│   │   ├── package.json
│   │   └── src/
│   ├── app2/
│   │   ├── package.json
│   │   └── src/
│   ├── shared/
│   │   ├── package.json
│   │   └── src/
│   └── ui/
│       ├── package.json
│       └── src/
├── package.json
└── pnpm-workspace.yaml

# 优点：
# • 代码共享方便
# • 统一依赖管理
# • 原子化提交
# • 统一构建流程

# 缺点：
# • 仓库体积大
# • 构建时间长
# • 权限管理复杂
```

### 7.2 pnpm Workspaces

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'

# package.json (根目录)
{
  "name": "monorepo",
  "private": true,
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^4.0.0"
  }
}

# packages/app1/package.json
{
  "name": "@monorepo/app1",
  "dependencies": {
    "@monorepo/shared": "workspace:*",
    "@monorepo/ui": "workspace:*"
  }
}

# 安装依赖
pnpm install

# 运行脚本
pnpm -r dev          # 所有包并行运行
pnpm -r build        # 所有包按依赖顺序构建
pnpm --filter app1 dev  # 只运行 app1

# 添加依赖
pnpm add react -w                        # 根目录
pnpm add axios --filter @monorepo/app1  # app1
```

### 7.3 Turborepo

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    // 构建
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    
    // 开发
    "dev": {
      "cache": false,
      "persistent": true
    },
    
    // 测试
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    
    // Lint
    "lint": {
      "outputs": []
    }
  }
}

// package.json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint"
  }
}

// Turborepo 特点：
// • 增量构建（只构建变化的包）
// • 远程缓存
// • 并行执行
// • 依赖图分析
```

### 7.4 Nx

```bash
# 安装
npx create-nx-workspace@latest

# 生成应用
nx g @nrwl/react:app app1

# 生成库
nx g @nrwl/react:lib shared

# 运行
nx serve app1
nx build app1
nx test app1

# 依赖图
nx graph

# 受影响的项目
nx affected:build
nx affected:test

# Nx 特点：
# • 强大的 CLI
# • 依赖图可视化
# • 增量构建
# • 云缓存
# • 插件生态
```

---

## 8. 微前端

### 8.1 概念

```javascript
// 微前端（Micro Frontend）
// 将前端应用拆分为多个独立的子应用

主应用（容器）
├── 子应用 A（React）
├── 子应用 B（Vue）
└── 子应用 C（Angular）

// 特点：
// • 独立开发
// • 独立部署
// • 技术栈无关
// • 增量升级

// 实现方案：
// 1. iframe（简单但限制多）
// 2. Web Components
// 3. Module Federation（Webpack 5）
// 4. qiankun（阿里）
// 5. single-spa
// 6. micro-app（京东）
```

### 8.2 qiankun

```javascript
// 主应用
// main.js
import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:8081',
    container: '#container',
    activeRule: '/app1',
    props: {
      msg: 'Hello from main app'
    }
  },
  {
    name: 'app2',
    entry: '//localhost:8082',
    container: '#container',
    activeRule: '/app2'
  }
]);

start();

// 子应用（React）
// index.js
function render(props) {
  const { container } = props;
  ReactDOM.render(<App />, container);
}

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  render({ container: document.getElementById('root') });
}

// 导出生命周期
export async function bootstrap() {
  console.log('app bootstraped');
}

export async function mount(props) {
  console.log('app mounted', props);
  render(props);
}

export async function unmount(props) {
  const { container } = props;
  ReactDOM.unmountComponentAtNode(container);
}

// webpack 配置
module.exports = {
  output: {
    library: `app1`,
    libraryTarget: 'umd',
    globalObject: 'window'
  }
};
```

### 8.3 Module Federation

```javascript
// Webpack 5 Module Federation

// 主应用
// webpack.config.js
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        app1: 'app1@http://localhost:3001/remoteEntry.js',
        app2: 'app2@http://localhost:3002/remoteEntry.js'
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    })
  ]
};

// 使用远程模块
import('app1/Button').then((Button) => {
  // 使用 app1 的 Button 组件
});

// 子应用
// webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/Button'
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    })
  ]
};
```

---

## 9. 性能监控

见《性能优化》文档第 9 章

---

## 10. 脚手架

### 10.1 创建脚手架

```javascript
#!/usr/bin/env node
// bin/cli.js

const { program } = require('commander');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

program
  .version('1.0.0')
  .command('create <project-name>')
  .description('创建新项目')
  .action(async (projectName) => {
    // 询问配置
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'framework',
        message: '选择框架',
        choices: ['React', 'Vue', 'Angular']
      },
      {
        type: 'list',
        name: 'language',
        message: '选择语言',
        choices: ['JavaScript', 'TypeScript']
      },
      {
        type: 'confirm',
        name: 'useRouter',
        message: '是否使用路由？',
        default: true
      }
    ]);
    
    // 创建项目
    const spinner = ora('正在创建项目...').start();
    
    const targetDir = path.join(process.cwd(), projectName);
    const templateDir = path.join(__dirname, '../templates', answers.framework.toLowerCase());
    
    try {
      // 复制模板
      await fs.copy(templateDir, targetDir);
      
      // 修改 package.json
      const pkgPath = path.join(targetDir, 'package.json');
      const pkg = await fs.readJSON(pkgPath);
      pkg.name = projectName;
      await fs.writeJSON(pkgPath, pkg, { spaces: 2 });
      
      spinner.succeed(chalk.green('项目创建成功！'));
      
      console.log();
      console.log(chalk.cyan(`  cd ${projectName}`));
      console.log(chalk.cyan('  npm install'));
      console.log(chalk.cyan('  npm run dev'));
      console.log();
    } catch (err) {
      spinner.fail(chalk.red('项目创建失败'));
      console.error(err);
    }
  });

program.parse(process.argv);

// package.json
{
  "name": "my-cli",
  "version": "1.0.0",
  "bin": {
    "my-cli": "./bin/cli.js"
  },
  "dependencies": {
    "commander": "^9.0.0",
    "inquirer": "^8.0.0",
    "fs-extra": "^10.0.0",
    "chalk": "^4.0.0",
    "ora": "^5.0.0"
  }
}

// 本地测试
npm link

// 使用
my-cli create my-app

// 发布
npm publish
```

---

## 11. 实战案例

### 11.1 从零搭建项目

```bash
# 1. 创建项目
mkdir my-project
cd my-project
npm init -y

# 2. 安装 Webpack
npm install -D webpack webpack-cli webpack-dev-server

# 3. 安装 Babel
npm install -D @babel/core @babel/preset-env @babel/preset-react babel-loader

# 4. 安装 React
npm install react react-dom

# 5. 安装插件
npm install -D html-webpack-plugin mini-css-extract-plugin css-loader

# 6. 配置 webpack.config.js
# 见 2.1 节

# 7. 配置 .babelrc
{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
}

# 8. 配置 ESLint + Prettier
npm install -D eslint prettier eslint-config-prettier
npm init @eslint/config

# 9. 配置 Husky
npm install -D husky lint-staged
npx husky-init && npm install

# 10. 创建目录结构
mkdir -p src/{components,pages,utils,styles}
touch src/index.js src/App.jsx

# 11. 配置 scripts
{
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production",
    "lint": "eslint src --ext .js,.jsx",
    "format": "prettier --write \"src/**/*.{js,jsx}\""
  }
}

# 12. 运行
npm run dev
```

### 11.2 优化构建速度

```javascript
// 1. 缓存
module.exports = {
  cache: {
    type: 'filesystem'
  }
};

// 2. 并行处理
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true
      })
    ]
  }
};

// 3. DLL（已过时，使用 cache 替代）

// 4. 减少 loader 处理范围
module.exports = {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  }
};

// 5. 使用更快的工具
// • esbuild-loader（替代 babel-loader）
// • swc-loader
// • Vite（开发环境）

// 优化前：60s
// 优化后：15s
```

---

## 12. 经典面试题

### Q1: Webpack 和 Vite 的区别？

见 2.1、2.2 节

### Q2: Tree Shaking 的原理？

见 1.3 节

### Q3: 如何优化 Webpack 构建速度？

见 11.2 节

### Q4: Monorepo 有什么优势？

见 7.1 节

### Q5: 微前端的实现方案？

见 8.1-8.3 节

### Q6: Git Flow 和 GitHub Flow 的区别？

见 5.1、5.2 节

### Q7: CI/CD 流程是什么？

```
持续集成/持续部署

CI（Continuous Integration）：
1. 代码提交
2. 自动构建
3. 自动测试
4. 代码检查

CD（Continuous Deployment）：
1. 自动部署到测试环境
2. 自动化测试
3. 自动部署到生产环境

工具：
• GitHub Actions
• GitLab CI
• Jenkins
• Travis CI
```

### Q8: 如何保证代码质量？

```
1. 代码规范
   • ESLint
   • Prettier
   • Stylelint

2. Git Hooks
   • Husky
   • lint-staged
   • commitlint

3. 代码审查
   • Pull Request
   • Code Review

4. 自动化测试
   • 单元测试
   • 集成测试
   • E2E 测试

5. 持续集成
   • CI/CD
   • 自动构建
   • 自动测试
```

### Q9: npm、yarn、pnpm 的区别？

见 3.1-3.3 节

### Q10: 如何搭建一个脚手架？

见 10.1 节

---

## 面试技巧

### 答题思路
1. **工具对比**：特点 → 优缺点 → 使用场景
2. **工程实践**：问题 → 方案 → 效果
3. **流程说明**：步骤 → 工具 → 最佳实践

### 常见陷阱
1. 过度工程化（不是越复杂越好）
2. 忽略团队协作（工具要统一）
3. 不考虑历史包袱（迁移成本）
4. 只关注工具（方法论更重要）

### 加分项
1. 有完整项目搭建经验
2. 熟悉多种构建工具
3. 了解 CI/CD 流程
4. 有 Monorepo 实践经验
5. 能优化构建性能

---

**工程化原则**：
1. **标准化**：统一规范
2. **自动化**：减少人工
3. **模块化**：降低耦合
4. **可维护**：易于扩展
5. **高效率**：提升效能
