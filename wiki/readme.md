# myWeb 项目

## 项目介绍

myWeb 是一个个人项目集合仓库，包含了独立的博客子项目。

## 目录结构

```
myWeb/
├── .trae/              # Trae IDE 配置
├── Blog/               # 个人博客
│   ├── archive/        # 博客文章归档
│   └── index.html      # 博客首页
├── wiki/               # 技术文档
│   ├── readme.md       # 本文件
│   ├── blog.md         # Blog 项目文档
│   ├── 部署指南.md     # 部署指南
│   └── teach/          # 教学文档
└── .gitignore
```

## 技术栈

### 整体
- **版本控制**: Git
- **操作系统**: macOS

### Blog
- **静态页面**: HTML
- **配置文件**: JSON
- **文章格式**: Markdown

## 子项目说明

### Blog
个人技术博客，采用静态 HTML + Markdown 文章的形式。

- 支持文章归档
- 配置化管理博客信息和文章列表

## 项目规则

根据 `.trae/rules/myweb.md` 定义：

1. 请确保没有编译错误或者语法错误，再提示我完成了任务。
2. 我说"启动前后端"时，默认启动个人主页而非只启动子网页。
3. 每完成一轮对话，就更新一次项目 wiki。
4. MISC文件夹, .trae文件夹, 不是子网站。
5. 终末地伤害计算器所需数据在MISC/ZmdData中。

## 相关文档

- [部署指南](./部署指南.md)
- [Blog 项目文档](./blog.md)
