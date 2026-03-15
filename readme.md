# 🌟 myWeb 项目

## ⚠️ 项目声明

**本项目为纯 AI 项目，旨在通过增加 AI 使用率来学习 AI。**

---

myWeb 是一个个人主页 + 博客 + 文档集合仓库。当前站点已升级为 **Vite 多页应用（MPA）+ 原生 HTML/CSS/JS 模块化组织**，在保留静态站点轻量特性的同时，补上更适合长期演进的前端基础。

## ✨ 当前站点特性

### 首页
- 轻日式西幻 / 二次元友好的视觉主题
- 根目录背景图接入首页 Hero，并做成可扩展背景系统
- GitHub / Bilibili 个人链接入口
- 运行时长、访客数量、文章数量、标签数量等运营信息卡片
- 动态展示近期文章与高频标签入口

## 📂 目录结构

```text
myWeb/
├── Blog/                  # 博客入口与文章内容
│   ├── archive/           # Markdown 文章归档
│   ├── index.html         # 博客首页入口（Vite MPA page）
│   ├── post.html          # 文章详情入口（Vite MPA page）
│   ├── config.json        # 博客配置（由脚本生成）
│   ├── update_config.py   # 配置更新脚本
│   └── 使用说明.md         # 配置脚本说明
├── src/                   # 共享样式与前端脚本
│   ├── assets/            # 页面视觉素材池（按槽位目录随机）
│   ├── scripts/           # 页面逻辑与共享模块
│   └── styles/            # 共享主题样式
├── wiki/                  # 项目文档与说明
├── index.html             # 个人主页入口（Vite MPA page）
├── package.json           # 前端构建配置
├── vite.config.js         # Vite 多页构建配置
├── readme.md              # 本文件
└── dist/                  # 构建产物（npm run build 后生成）
```

## 🛠️ 技术栈

### 整体
- **版本控制**：Git
- **运行环境**：Node.js + Python 3
- **构建方式**：Vite MPA

### 前端
- **页面组织**：原生 HTML / CSS / JavaScript 模块化
- **博客数据**：`Blog/config.json`
- **Markdown 解析**：`marked`
- **代码高亮**：`highlight.js`
- **数学公式**：KaTeX
- **访客统计**：Busuanzi

### 内容工具
- **文章归档**：Markdown
- **配置更新脚本**：Python 3

## 🚀 开发与构建

### 安装依赖

```bash
cd /Users/nanoshiki/Desktop/myWeb
npm install
```

### 启动开发环境

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

构建完成后，静态部署目录为：

```text
dist/
```

### 更新博客配置

新增、重命名或调整 `Blog/archive/` 下的文章后，执行：

```bash
python3 Blog/update_config.py
```

## 🖼️ 图片素材池（去硬引用）

站点主要视觉图已改为“槽位目录 + 当天稳定随机”机制，代码不再写死具体文件名。  
后续换图只需要把新图片放进对应目录，不需要改 JS。

- 素材根目录：`src/assets/image-pools/`
- 支持格式：`jpg` / `jpeg` / `png` / `webp`
- 随机规则：同一天同页面固定同一张，跨天自动换图

主要槽位：

- 首页：`home/hero`、`home/camp-day`、`home/camp-night`、`home/trail`
- 博客列表：`blog/cover`、`blog/glass-noise`、`blog/wind-emblem`、`blog/parchment`、`blog/wood-grain`、`blog/ruins`、`blog/corner`、`blog/divider`、`blog/quill`、`blog/profile-avatar`
- 文章详情：`post/cover`、`post/glass-noise`、`post/wind-emblem`、`post/ruins`

建议：

- 同一槽位至少放 2 张图，随机效果更明显
- 文件名可自定义，按你的习惯命名即可

## 📝 Blog 功能

- ✅ 文章归档与多级分类
- ✅ 配置化管理
- ✅ 面包屑导航
- ✅ Tag 分类入口
- ✅ Tag 热力图
- ✅ 目录导航（TOC）
- ✅ 代码高亮与复制
- ✅ 图片放大查看
- ✅ 数学公式渲染（KaTeX）
- ✅ 响应式设计
- ✅ 首页运营信息展示

## 📖 相关文档

- [Blog 配置脚本说明](./Blog/使用说明.md)
- [教学文档（第 1 章）](./wiki/teach/01-Python基础.md)
- [教学文档（第 10 章）](./wiki/teach/10-Web与安全.md)

## 📌 项目整理说明

- 2026-03-15 已完成安全级项目整理，清理了历史构建残留目录 `dist/Blog/archive 3`。
- `wiki/` 历史文档已按当前仓库状态移除，README 仅保留当前可用文档入口，避免失效链接。
