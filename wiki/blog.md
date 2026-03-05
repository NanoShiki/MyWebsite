# Blog 项目文档

## 项目介绍

Blog 是一个个人技术博客，采用静态 HTML + Markdown 文章的形式，配置化管理博客信息和文章列表。

## 技术栈

- **前端**: HTML, CSS, JavaScript (原生)
- **文章格式**: Markdown
- **配置文件**: JSON
- **工具脚本**: Python

## 目录结构

```
blog/
├── index.html              # 博客首页（文章列表）
├── post.html               # 文章详情页
├── config.json             # 博客配置文件
├── update_config.py        # 自动更新配置的 Python 脚本
├── 使用说明.md             # 脚本使用说明
└── archive/                # 文章归档目录
    ├── 文章标题1/
    │   ├── 文章标题1.md   # Markdown 文章内容
    │   └── assets/         # 文章资源（图片等）
    │       └── image1.png
    └── 文章标题2/
        ├── 文章标题2.md
        └── assets/
            └── image2.png
```

## 配置文件 (config.json)

### 结构说明

```json
{
  "site": {
    "title": "如珩的博客",
    "subtitle": "技术笔记与分享",
    "author": "如珩"
  },
  "posts": [
    {
      "id": "文章ID",
      "title": "文章标题",
      "date": "2026-02-28",
      "path": "/blog/archive/文章标题/"
    }
  ]
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `site.title` | string | 博客标题 |
| `site.subtitle` | string | 博客副标题 |
| `site.author` | string | 作者名称 |
| `posts[].id` | string | 文章唯一标识符 |
| `posts[].title` | string | 文章标题 |
| `posts[].date` | string | 文章发布日期 (YYYY-MM-DD) |
| `posts[].path` | string | 文章归档路径 |

## 页面说明

### 首页 (index.html)

- 显示博客标题和副标题
- 动态加载并渲染文章列表
- 文章卡片展示标题和日期
- 点击卡片跳转到文章详情页
- 响应式设计，支持移动端

### 文章详情页 (post.html)

- 根据 URL 参数 `id` 加载对应文章
- 显示文章标题、日期、作者
- 渲染 Markdown 内容
- 支持文章资源（图片等）

## 工具脚本 (update_config.py)

### 功能

自动扫描 `archive` 目录下的文章文件夹，更新 `config.json` 文件。

### 特点

- 自动发现文章
- 文章按修改时间倒序排列（最新的在前）
- 自动提取文章标题
- 使用文件夹修改时间作为文章日期

### 使用方法

#### Mac 系统

```bash
cd blog
python3 update_config.py
```

#### Windows 系统

```cmd
cd blog
python update_config.py
```

### 文章目录结构要求

每个文章必须是一个独立的文件夹：

```
archive/
└── 文章标题/
    ├── 文章标题.md   # 文件夹名与 .md 文件名必须一致
    └── assets/         # 可选，存放图片等资源
        └── image.png
```

### 输出示例

```
成功更新 config.json，共发现 2 篇文章
```

## 当前文章

| 标题 | 日期 |
|------|------|
| Lyra(二) GameFeatureAction浅析 | 2026-02-28 |
| Lyra(一) 地图切换 & Experience加载 & Loading界面 | 2026-02-28 |

## 使用流程

1. **创建新文章**
   - 在 `archive/` 下创建新文件夹，文件夹名为文章标题
   - 在文件夹内创建同名的 `.md` 文件
   - 可选：创建 `assets/` 文件夹存放图片

2. **更新配置**
   ```bash
   python update_config.py
   ```

3. **预览博客**
   - 使用本地服务器打开 `index.html`
   - 或部署到静态网站托管服务

## 样式特点

- 渐变色头部（紫色系）
- 卡片式文章列表
- 悬停动画效果
- 响应式布局
- 简洁现代的设计风格

## 相关文档

- [项目总览](./项目总览.md)
- [update_config.py 使用说明](../blog/使用说明.md)
