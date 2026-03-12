# Blog 项目文档

## 项目介绍

`Blog/` 是站点的博客子项目，文章内容仍然来自 `archive/` 目录中的 Markdown 文件，文章元数据仍由 `update_config.py` 扫描生成 `config.json`。不同的是，前端页面已经升级到 **Vite 多页应用（MPA）+ 原生 HTML/CSS/JS 模块化组织**，以便后续继续增加更动态的交互和视觉效果。

## 技术栈

- **页面入口**：`index.html`、`Blog/index.html`、`Blog/post.html`
- **共享前端资源**：`src/styles/`、`src/scripts/`
- **文章格式**：Markdown
- **配置文件**：JSON
- **配置脚本**：Python 3
- **Markdown 渲染**：`marked`
- **代码高亮**：`highlight.js`
- **公式渲染**：KaTeX
- **访客统计**：Busuanzi

## 目录结构

```text
myWeb/
├── Blog/
│   ├── archive/             # Markdown 文章与图片资源
│   ├── index.html           # 博客首页入口页
│   ├── post.html            # 文章详情入口页
│   ├── config.json          # 自动生成的博客配置
│   ├── update_config.py     # 扫描 archive 并生成 config.json
│   └── 使用说明.md          # 配置脚本说明
├── src/
│   ├── styles/              # 共享样式与主题
│   └── scripts/             # 共享脚本与页面逻辑
├── index.html               # 个人主页入口页
├── vite.config.js           # Vite 多页构建配置
└── dist/                    # 构建产物目录
```

## 数据流程

1. 在 `Blog/archive/` 中按分类创建文章目录。
2. 执行 `python3 Blog/update_config.py` 更新 `Blog/config.json`。
3. 前端页面读取 `config.json` 渲染首页、分类视图和文章入口。
4. `Blog/post.html` 根据文章 `id` 定位对应 Markdown 文件并完成渲染。
5. `npm run build` 时，Vite 会把页面资源构建到 `dist/`，并复制 `Blog/config.json` 与 `Blog/archive/`。

## `config.json` 结构

`Blog/config.json` schema 保持不变，仍由以下三部分组成：

- `site`：博客标题、副标题、作者等基础信息
- `posts`：文章列表
- `categoryTree`：分类树结构

示例：

```json
{
  "site": {
    "title": "如珩的博客",
    "subtitle": "技术笔记与分享",
    "author": "如珩"
  },
  "posts": [
    {
      "id": "课内_数学建模_数学建模_1",
      "title": "数学建模 - 第1课：差分方程、特征值方法与典型模型",
      "date": "2026-03-11",
      "path": "/Blog/archive/课内/数学建模/数学建模_1/",
      "categories": ["课内", "数学建模"]
    }
  ],
  "categoryTree": {
    "name": "root",
    "type": "category",
    "children": [],
    "posts": []
  }
}
```

## 页面职责

### `Blog/index.html`

- 读取 `config.json`
- 保留多级分类导航与面包屑
- 在当前分类下展示子分类卡片
- 汇总显示当前分支下的文章列表
- 基于 `categories` 派生 **Tag 分类** 与 **Tag 热力图**

### `Blog/post.html`

- 根据 `id` 定位文章对象
- 根据文章路径加载同名 Markdown 文件
- 使用 `marked` 渲染正文
- 使用 `highlight.js` 渲染代码高亮并提供复制按钮
- 使用 KaTeX 渲染公式
- 生成 TOC 并在滚动时高亮当前位置
- 支持图片点击放大

## Tag 设计说明

当前博客没有新增独立 `tags` 字段，而是采用：

- **Tag = categories**

这意味着：

- `Blog/config.json` schema 不变
- Tag 展示、统计、热力图都在前端 UI 层派生完成
- 点击 Tag 后会跳转到对应分类视图

## 文章目录规则

`update_config.py` 通过目录命名约定识别文章，规则保持不变：

- 文章必须放在独立文件夹中
- **文章文件夹名必须与其中的 Markdown 文件名一致**
- 分类文件夹本身不放置 Markdown 文件
- 支持多级分类

示例：

```text
Blog/archive/
└── 课内/
    └── 人机交互技术/
        └── 人机交互技术_1/
            ├── 人机交互技术_1.md
            └── assets/
```

## 使用方式

### 更新博客配置

```bash
cd /Users/nanoshiki/Desktop/myWeb
python3 Blog/update_config.py
```

### 本地开发

```bash
npm install
npm run dev
```

### 生产构建

```bash
npm run build
```

## 相关文档

- `readme.md`
- `wiki/部署指南.md`
- `Blog/使用说明.md`
