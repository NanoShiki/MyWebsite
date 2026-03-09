# Blog 项目文档

## 项目介绍

`Blog/` 是当前站点的博客子项目，使用静态 HTML 页面展示由 Markdown 文章生成的内容。文章元数据由 `update_config.py` 从 `archive/` 目录扫描生成，再由前端页面读取 `config.json` 完成分类导航和文章展示。

## 技术栈

- **前端**：HTML、CSS、JavaScript（原生）
- **文章格式**：Markdown
- **配置文件**：JSON
- **工具脚本**：Python 3
- **第三方库**：`marked.js`、`highlight.js`、`KaTeX`

## 目录结构

```text
Blog/
├── index.html              # 博客首页（分类导航）
├── post.html               # 文章详情页
├── config.json             # 博客配置文件（自动生成）
├── update_config.py        # 自动更新配置的 Python 脚本
├── 使用说明.md             # 配置脚本使用说明
└── archive/                # 文章归档目录（支持多级分类）
    ├── 分类A/
    │   ├── 子分类A/
    │   │   └── 文章A/
    │   │       ├── 文章A.md
    │   │       └── assets/
    │   └── 文章B/
    │       ├── 文章B.md
    │       └── assets/
    └── 文章C/
        ├── 文章C.md
        └── assets/
```

## 数据流程

1. 在 `Blog/archive/` 中按分类创建文章目录。
2. 运行 `python3 Blog/update_config.py` 扫描文章。
3. 脚本生成最新的 `Blog/config.json`。
4. `Blog/index.html` 读取 `config.json` 展示分类与文章列表。
5. `Blog/post.html` 根据文章路径加载 Markdown 并完成渲染。

## 配置文件说明

`config.json` 由三部分组成：

- `site`：博客基础信息，如标题、副标题、作者。
- `posts`：按日期倒序排列的文章列表。
- `categoryTree`：分类树结构，用于首页层级导航与分类统计。

示例结构如下：

```json
{
  "site": {
    "title": "如珩的博客",
    "subtitle": "技术笔记与分享",
    "author": "如珩"
  },
  "posts": [
    {
      "id": "分类A_子分类A_文章A",
      "title": "文章A",
      "date": "2026-03-09",
      "path": "/Blog/archive/分类A/子分类A/文章A/",
      "categories": ["分类A", "子分类A"]
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

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `site.title` | string | 博客标题 |
| `site.subtitle` | string | 博客副标题 |
| `site.author` | string | 作者名称 |
| `posts[].id` | string | 文章唯一标识，通常由分类路径与文章目录名拼接而成 |
| `posts[].title` | string | 从 Markdown 一级标题读取的文章标题 |
| `posts[].date` | string | 文章日期，格式为 `YYYY-MM-DD` |
| `posts[].path` | string | 文章目录的站点路径 |
| `posts[].categories` | string[] | 文章所属分类路径 |
| `categoryTree` | object | 分类树结构，用于首页导航 |

## 页面说明

### `index.html`

- 读取 `config.json` 并展示博客标题、副标题。
- 使用面包屑导航展示当前分类路径。
- 在当前层级展示子分类卡片和文章列表。
- 文章项展示标题、日期和分类标签。

### `post.html`

- 根据文章路径定位对应 Markdown 文件。
- 使用 `marked.js` 渲染文章正文。
- 使用 `highlight.js` 完成代码高亮与复制按钮。
- 使用 `KaTeX` 渲染数学公式。
- 自动生成目录（TOC），并支持滚动高亮。
- 支持图片点击放大查看。

## 文章目录规则

`update_config.py` 通过目录命名约定识别文章，当前规则如下：

- 文章必须放在独立文件夹中。
- **文章文件夹名必须与其中的 Markdown 文件名一致。**
- 分类文件夹本身不放置 Markdown 文件。
- 支持任意深度的多级分类。

示例：

```text
Blog/archive/
└── 课内/
    └── 人机交互技术/
        └── 人机交互技术_1/
            ├── 人机交互技术_1.md
            └── assets/
```

如果文件夹名与 Markdown 文件名不一致，对应文章不会被收录到 `config.json`。

## 使用方式

新增或调整文章目录后，执行以下命令更新配置：

```bash
cd /Users/nanoshiki/Desktop/myWeb
python3 Blog/update_config.py
```

更新完成后，可以直接打开 `Blog/index.html` 或通过本地静态服务器查看效果。

## 相关文档

- `Blog/使用说明.md`：配置生成脚本使用说明
- `wiki/部署指南.md`：站点部署方法
- `readme.md`：项目整体说明
