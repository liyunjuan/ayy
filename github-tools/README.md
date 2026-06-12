# GitHub 工具集

> 实用的 GitHub 仓库浏览和管理工具

---

## 📁 文件列表

### 1. `github-repos-viewer.js`
**GitHub 仓库查看器** - 命令行工具

**功能**：
- ✅ 查看最热门的仓库
- ✅ 发现趋势项目
- ✅ 按主题浏览
- ✅ 关键词搜索

**快速使用**：
```bash
cd /Users/lww/ayy/github-tools

# 查看最热门仓库
node github-repos-viewer.js popular

# 查看最近趋势
node github-repos-viewer.js trending 7

# 按主题浏览
node github-repos-viewer.js topic react

# 搜索关键词
node github-repos-viewer.js search "ai coding"
```

### 2. `github-repos-viewer-使用教程.md`
**详细使用教程** - 完整文档

**内容包括**：
- 📖 快速开始指南
- 📚 四大核心功能详解
- 💡 实用示例
- 🎯 常用主题推荐
- ⚙️ 高级用法
- 🐛 常见问题解答

**阅读方式**：
```bash
# 在终端中阅读
cat github-repos-viewer-使用教程.md

# 或者用编辑器打开
code github-repos-viewer-使用教程.md
```

---

## 🚀 快速开始

### 第一次使用

```bash
# 1. 进入工具目录
cd /Users/lww/ayy/github-tools

# 2. 查看帮助
node github-repos-viewer.js

# 3. 尝试查看热门仓库
node github-repos-viewer.js popular

# 4. 阅读完整教程
cat github-repos-viewer-使用教程.md
```

### 创建快捷命令（推荐）

在 `~/.zshrc` 中添加：

```bash
# GitHub 工具快捷命令
alias gh-popular='node /Users/lww/ayy/github-tools/github-repos-viewer.js popular'
alias gh-trending='node /Users/lww/ayy/github-tools/github-repos-viewer.js trending'
alias gh-topic='node /Users/lww/ayy/github-tools/github-repos-viewer.js topic'
alias gh-search='node /Users/lww/ayy/github-tools/github-repos-viewer.js search'
```

然后重新加载：
```bash
source ~/.zshrc
```

之后就可以直接使用：
```bash
gh-popular
gh-trending 7
gh-topic ai
gh-search "react hooks"
```

---

## 💡 常用场景

### 场景 1：每天发现新项目
```bash
# 每天早上运行一次
node github-repos-viewer.js trending 1
```

### 场景 2：学习新技术
```bash
# 查看某个技术的热门项目
node github-repos-viewer.js topic react
node github-repos-viewer.js topic ai
```

### 场景 3：面试准备
```bash
# 查找面试资源
node github-repos-viewer.js search "interview questions"
node github-repos-viewer.js search "system design"
node github-repos-viewer.js topic algorithms
```

### 场景 4：寻找开源项目
```bash
# 查看最热门的开源项目
node github-repos-viewer.js popular

# 查看某个领域的项目
node github-repos-viewer.js topic open-source
```

---

## 📊 命令速查表

| 命令 | 说明 | 示例 |
|------|------|------|
| `popular` | 最热门仓库 | `node github-repos-viewer.js popular` |
| `trending [天数]` | 趋势仓库 | `node github-repos-viewer.js trending 30` |
| `topic <主题>` | 按主题浏览 | `node github-repos-viewer.js topic ai` |
| `search <关键词>` | 搜索仓库 | `node github-repos-viewer.js search "vue3"` |

---

## 🎯 推荐工作流

### 日常流程
```bash
# 1. 早上：查看昨天的趋势
node github-repos-viewer.js trending 1

# 2. 每周：查看本周趋势
node github-repos-viewer.js trending 7

# 3. 学习时：查看相关主题
node github-repos-viewer.js topic [你正在学习的技术]

# 4. 需要时：搜索具体内容
node github-repos-viewer.js search "[你要找的内容]"
```

---

## 🔗 相关链接

- **GitHub 官方搜索**: https://github.com/search
- **GitHub Trending**: https://github.com/trending
- **GitHub Topics**: https://github.com/topics
- **GitHub API 文档**: https://docs.github.com/rest

---

## 📝 更新日志

### v1.0.0 (2026-06-12)
- ✅ 初始版本发布
- ✅ 支持查看热门仓库
- ✅ 支持查看趋势仓库
- ✅ 支持按主题浏览
- ✅ 支持关键词搜索

---

## 🤝 问题反馈

如果遇到问题或有建议，欢迎：
- 查看完整教程：`github-repos-viewer-使用教程.md`
- 提出问题和建议

---

**创建时间**: 2026-06-12  
**工具位置**: `/Users/lww/ayy/github-tools/`
