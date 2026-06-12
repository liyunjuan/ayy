# GitHub 仓库查看器 - 使用教程

## 📝 简介

这是一个命令行工具，帮助您快速浏览和搜索 GitHub 上的热门仓库。

**脚本位置**: `/Users/lww/ayy/github-repos-viewer.js`

---

## 🚀 快速开始

### 前置条件
- ✅ Node.js 已安装（您的系统已经有了）
- ✅ 能访问网络（调用 GitHub API）

### 基础用法

在终端中运行：

```bash
# 进入项目目录
cd /Users/lww/ayy

# 运行脚本（默认显示最热门仓库）
node github-repos-viewer.js
```

---

## 📚 四大功能

### 1️⃣ 查看最热门的仓库

**命令**：
```bash
node github-repos-viewer.js popular
```

**说明**：
- 显示 GitHub 上 star 数最多的 30 个仓库
- 适合发现高质量开源项目

**输出示例**：
```
🔥 GitHub 最热门的 30 个仓库：

1. freeCodeCamp/freeCodeCamp
   ⭐ 446,657 stars
   📝 学习编程的免费课程
   🔗 https://github.com/freeCodeCamp/freeCodeCamp
```

---

### 2️⃣ 查看趋势仓库

**命令**：
```bash
# 查看最近 7 天的趋势（默认）
node github-repos-viewer.js trending

# 查看最近 30 天的趋势
node github-repos-viewer.js trending 30

# 查看最近 1 天的趋势
node github-repos-viewer.js trending 1
```

**说明**：
- 显示最近创建且 star 增长快的仓库
- 适合发现最新的热门项目

**输出示例**：
```
📈 最近 7 天的趋势仓库：

1. XiaomiMiMo/MiMo-Code
   ⭐ 5,622 stars | 📅 创建于 2026/6/10
   📝 小米推出的 AI 编程工具
   🔗 https://github.com/XiaomiMiMo/MiMo-Code
```

---

### 3️⃣ 按主题浏览

**命令**：
```bash
# 查看 AI 相关仓库
node github-repos-viewer.js topic ai

# 查看 React 相关仓库
node github-repos-viewer.js topic react

# 查看机器学习相关仓库
node github-repos-viewer.js topic machine-learning

# 查看前端相关仓库
node github-repos-viewer.js topic frontend
```

**说明**：
- 按 GitHub 的主题标签（Topic）浏览
- 适合深入某个技术领域

**输出示例**：
```
🏷️  主题 "react" 的热门仓库（共 470,233 个）：

1. react/react (⭐ 245,783)
   The library for web and native user interfaces.
   https://github.com/react/react
```

---

### 4️⃣ 搜索关键词

**命令**：
```bash
# 搜索 "react hooks"
node github-repos-viewer.js search "react hooks"

# 搜索 "vue3" 并限制为 TypeScript 项目
node github-repos-viewer.js search "vue3" typescript

# 搜索 "machine learning" 并限制为 Python 项目
node github-repos-viewer.js search "machine learning" python
```

**说明**：
- 按关键词搜索仓库
- 可以指定编程语言过滤
- 返回按 star 数排序的结果

**输出示例**：
```
🔍 搜索结果："react hooks"（共 12,345 个）

1. react/react (⭐ 245,783)
   The library for web and native user interfaces.
   https://github.com/react/react
```

---

## 💡 实用示例

### 示例 1：准备前端面试

```bash
# 查看 JavaScript 算法项目
node github-repos-viewer.js topic javascript-algorithms

# 查看系统设计项目
node github-repos-viewer.js search "system design"

# 查看面试题项目
node github-repos-viewer.js search "interview questions"
```

### 示例 2：学习新技术

```bash
# 查看最新的 AI 项目
node github-repos-viewer.js trending 7
node github-repos-viewer.js topic ai

# 查看 React 生态
node github-repos-viewer.js topic react

# 查看 TypeScript 项目
node github-repos-viewer.js search typescript
```

### 示例 3：发现热门工具

```bash
# 查看开发工具
node github-repos-viewer.js topic developer-tools

# 查看 VS Code 扩展
node github-repos-viewer.js search "vscode extension"

# 查看 AI 编程助手
node github-repos-viewer.js search "ai coding assistant"
```

---

## 🎯 常用主题（Topic）推荐

### 前端开发
```bash
node github-repos-viewer.js topic react
node github-repos-viewer.js topic vue
node github-repos-viewer.js topic typescript
node github-repos-viewer.js topic frontend
node github-repos-viewer.js topic css
```

### AI/机器学习
```bash
node github-repos-viewer.js topic artificial-intelligence
node github-repos-viewer.js topic machine-learning
node github-repos-viewer.js topic deep-learning
node github-repos-viewer.js topic llm
node github-repos-viewer.js topic chatgpt
```

### 后端开发
```bash
node github-repos-viewer.js topic nodejs
node github-repos-viewer.js topic python
node github-repos-viewer.js topic go
node github-repos-viewer.js topic microservices
```

### 工具/效率
```bash
node github-repos-viewer.js topic productivity
node github-repos-viewer.js topic cli
node github-repos-viewer.js topic automation
node github-repos-viewer.js topic devops
```

### 面试准备
```bash
node github-repos-viewer.js topic interview
node github-repos-viewer.js topic algorithms
node github-repos-viewer.js topic data-structures
node github-repos-viewer.js topic system-design
```

---

## ⚙️ 高级用法

### 创建快捷命令（可选）

**方法 1：创建 alias（推荐）**

在 `~/.zshrc` 或 `~/.bashrc` 中添加：

```bash
# GitHub 仓库查看器快捷命令
alias gh-popular='node /Users/lww/ayy/github-repos-viewer.js popular'
alias gh-trending='node /Users/lww/ayy/github-repos-viewer.js trending'
alias gh-search='node /Users/lww/ayy/github-repos-viewer.js search'
alias gh-topic='node /Users/lww/ayy/github-repos-viewer.js topic'
```

然后重新加载配置：
```bash
source ~/.zshrc
```

使用：
```bash
gh-popular
gh-trending 7
gh-topic react
gh-search "react hooks"
```

**方法 2：全局安装（可选）**

```bash
# 创建软链接
sudo ln -s /Users/lww/ayy/github-repos-viewer.js /usr/local/bin/gh-repos

# 直接使用
gh-repos popular
gh-repos trending 7
```

---

## 🔧 API 限制说明

### 免费用户限制
- **未认证**：60 次请求/小时
- **认证后**：5000 次请求/小时

### 如果遇到限制

**选项 1：等待一小时后重试**

**选项 2：添加 GitHub Token（推荐）**

1. 访问 https://github.com/settings/tokens
2. 生成一个 Personal Access Token
3. 修改脚本，添加 Token：

```javascript
// 在脚本中找到这行：
// 'Authorization': 'token YOUR_GITHUB_TOKEN'

// 替换为：
'Authorization': 'token ghp_your_actual_token_here'
```

---

## 📊 输出说明

每个仓库的输出包含：
- ⭐ **Star 数量** - 仓库的受欢迎程度
- 📝 **描述** - 项目简介
- 🔗 **链接** - GitHub 地址
- 📅 **创建时间**（趋势模式）
- 💻 **编程语言**（某些模式）

---

## 🐛 常见问题

### Q1: 提示 "fetch is not defined"
**A**: Node.js 版本太低，需要 v18+ 版本。

**解决方法**：
```bash
# 检查版本
node -v

# 如果版本低于 v18，升级 Node.js
# 访问 https://nodejs.org 下载最新版
```

### Q2: 搜索结果为空
**A**: 关键词可能太特殊，或者加引号尝试：
```bash
node github-repos-viewer.js search '"exact phrase"'
```

### Q3: 速度很慢
**A**: 可能是网络问题，或者 GitHub API 响应慢。

**解决方法**：
- 等待几秒
- 检查网络连接
- 添加 GitHub Token 提升优先级

### Q4: 提示 API rate limit exceeded
**A**: 超过了 60 次/小时的限制。

**解决方法**：
- 等待一小时后重试
- 或者添加 GitHub Token（见上文）

---

## 🎁 实用技巧

### 技巧 1：导出到文件
```bash
# 保存结果到文件
node github-repos-viewer.js popular > 热门仓库.txt

# 追加到文件
node github-repos-viewer.js trending 30 >> 趋势仓库.txt
```

### 技巧 2：组合命令
```bash
# 查看多个主题
node github-repos-viewer.js topic react && \
node github-repos-viewer.js topic vue && \
node github-repos-viewer.js topic angular
```

### 技巧 3：快速筛选
```bash
# 只显示前 10 个
node github-repos-viewer.js popular | head -40

# 搜索特定关键词
node github-repos-viewer.js popular | grep -i "react"
```

---

## 📝 总结

**四大核心功能**：
1. `popular` - 最热门仓库
2. `trending [天数]` - 趋势仓库
3. `topic <主题>` - 按主题浏览
4. `search <关键词> [语言]` - 搜索仓库

**推荐使用场景**：
- ✅ 每天查看 trending 发现新项目
- ✅ 学习新技术时用 topic 浏览
- ✅ 面试准备时搜索相关资源
- ✅ 寻找开源项目参考

**下一步**：
- 尝试所有命令
- 创建快捷 alias
- 添加到日常工作流

---

## 🔗 相关资源

- GitHub 官方搜索：https://github.com/search
- GitHub Trending：https://github.com/trending
- GitHub Topics：https://github.com/topics
- GitHub API 文档：https://docs.github.com/rest

---

**最后更新**: 2026-06-12
