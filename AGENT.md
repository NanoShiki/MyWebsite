# AI 助手指导文档 (AGENT.md)

本文档用于指导 AI 助手更好地理解和协助 myWeb 项目的开发。

---

## 📋 项目概览

**myWeb** 是一个个人项目集合仓库，包含：

| 组件 | 说明 |
|------|------|
| 🏠 **个人主页** | 位于根目录 `index.html`，展示博客入口 |
| 📝 **Blog** | 位于 `Blog/` 目录，个人技术博客系统 |
| 📚 **Wiki** | 位于 `wiki/` 目录，技术文档和教学资料 |

---

## 🛠️ 技术栈

### 整体
- **版本控制**: Git
- **操作系统**: macOS

### Blog
- **静态页面**: HTML + CSS + JavaScript (原生)
- **Markdown 解析**: marked.js
- **代码高亮**: highlight.js
- **配置文件**: JSON
- **文章格式**: Markdown

### Wiki
- **文档格式**: Markdown
- **教学文档**: 位于 `wiki/teach/`

---

## 📁 目录结构详解

```
myWeb/
├── 📄 index.html              # 🏠 个人主页入口
├── 📄 readme.md               # 📖 项目说明
├── 📄 AGENT.md                # 🤖 本文件（AI 助手指导）
├── 📝 Blog/                   # 📝 博客系统
│   ├── 📄 index.html          # 🏠 博客首页
│   ├── 📄 post.html           # 📖 文章详情页
│   ├── 📄 config.json         # ⚙️ 博客配置
│   ├── 📄 update_config.py    # 🛠️ 配置更新脚本
│   ├── 📄 使用说明.md         # 📖 脚本使用说明
│   └── 📚 archive/            # 📚 文章归档目录
│       ├── 📁 UE/               # UE 分类
│       └── 📁 课内/             # 课内分类
├── 📖 wiki/                   # 📖 技术文档
│   ├── 📄 readme.md           # 📖 Wiki 首页
│   ├── 📄 blog.md             # 📝 Blog 项目文档
│   ├── 📄 部署指南.md          # 🚀 部署指南
│   └── 🎓 teach/               # 🎓 教学文档
│       ├── 📄 01-Python基础.md
│       ├── 📄 02-Flask框架.md
│       ├── 📄 03-JavaScript基础.md
│       ├── 📄 04-React框架.md
│       ├── 📄 05-前端基础.md
│       ├── 📄 06-Git子模块.md
│       ├── 📄 07-项目实战.md
│       ├── 📄 08-服务器基础.md
│       ├── 📄 09-Python部署工具.md
│       ├── 📄 10-Web与安全.md
│       └── 📄 README.md
└── 🚫 .gitignore              # 🚫 Git 忽略文件
```

---

## 🎯 开发规范

### 文件路径
- **Blog 路径**: 统一使用 `/Blog/`（大写 B）
- **Wiki 路径**: 统一使用 `/wiki/`（小写 w）

### 代码风格
- **HTML**: 语义化标签，良好的缩进
- **CSS**: 使用 CSS 变量（如有需要）
- **JavaScript**: 使用现代 ES6+ 语法

### Git 提交
- 有意义的提交信息
- 每次提交前确保无语法错误

---

## 🚀 常用操作

### 启动本地服务器
```bash
cd /Users/nanoshiki/Desktop/myWeb
python3 -m http.server 8000
```

### 更新 Blog 配置
```bash
cd /Users/nanoshiki/Desktop/myWeb/Blog
python3 update_config.py
```

### 本地访问
- 主页: http://localhost:8000
- 博客: http://localhost:8000/Blog/

---

## 📝 注意事项

1. **路径大小写敏感**: Linux/macOS 服务器区分大小写，请统一使用 `/Blog/`
2. **静态部署**: 本项目为纯静态网站，无需后端服务
3. **图片路径**: 文章中图片使用相对路径 `assets/`
4. **Markdown 格式**: 遵循标准 Markdown 语法

---

## 📞 帮助与支持

如有问题，请参考：
- [部署指南](./wiki/部署指南.md)
- [Blog 项目文档](./wiki/blog.md)
- [教学文档](./wiki/teach/)
