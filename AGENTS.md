# AGENTS.md - myWeb Project Guidelines

## Project Overview

Personal website/blog project with static HTML/CSS/JS pages and Python utility scripts.

- **Type**: Static website with blog functionality
- **Languages**: HTML, CSS, JavaScript, Python 3
- **Structure**: Personal homepage (`index.html`) + Blog (`Blog/`) + Wiki (`wiki/`)

## Build/Development Commands

This is a static site - no formal build system required.

### Python Configuration Update
```bash
# Update blog config.json after adding new posts
python Blog/update_config.py
```

### Local Development
```bash
# Serve locally (Python 3)
cd /Users/nanoshiki/Desktop/myWeb && python3 -m http.server 8000

# Or with Node.js (if available)
npx serve .
```

### No Formal Lint/Test Commands
- No package.json, Makefile, or test framework configured
- No CI/CD pipeline
- Manual testing by opening HTML files in browser

## Code Style Guidelines

### Python (Blog/update_config.py)

**Imports**: Standard library only (os, json, datetime)

**Naming**:
- Functions: `snake_case` (e.g., `scan_directory`, `build_tree`)
- Variables: `snake_case`
- Constants: Not used

**Formatting**:
- 4-space indentation
- No strict line length limit observed
- JSON output uses `ensure_ascii=False, indent=2`

**Error Handling**: Minimal - relies on built-in exceptions

**Key Functions**:
- `scan_directory()`: Recursively scans archive folder for posts
- `build_tree_from_posts()`: Builds category tree structure
- `main()`: Entry point, writes config.json

### HTML/CSS/JavaScript

**HTML**:
- Semantic HTML5 structure
- Chinese language content (`lang="zh-CN"`)
- External CDN dependencies (marked.js, highlight.js)

**CSS**:
- Inline styles in `<style>` blocks (no external CSS files)
- Mobile-responsive with `@media` queries
- BEM-like naming: `.article-content`, `.toc-wrapper`

**JavaScript**:
- Vanilla JS (no frameworks)
- ES6+ features: arrow functions, `const`/`let`, template literals
- Event delegation for dynamic elements

## Project Structure

```
myWeb/
├── index.html              # Personal homepage
├── readme.md               # Project documentation (Chinese)
├── Blog/
│   ├── index.html          # Blog homepage
│   ├── post.html           # Article detail page
│   ├── config.json         # Blog configuration (auto-generated)
│   ├── update_config.py    # Config generator script
│   └── archive/            # Blog posts (Markdown)
├── skills/                 # Project-local Codex skills
└── wiki/                   # Documentation
```

## Adding New Blog Posts

1. Create folder: `Blog/archive/<category>/<post_name>/`
2. Add Markdown file: `<post_name>.md`
3. Add images to `assets/` subfolder if needed
4. Run: `python Blog/update_config.py`
5. Verify config.json updated correctly

## Git Workflow

- No specific branch naming convention
- No pre-commit hooks configured
- Manual commits after content updates

## Notes for Agents

- This is a personal project - prioritize functionality over strict code quality
- Test changes by opening HTML files in browser
- Run `update_config.py` after any blog structure changes
- Chinese content is expected and normal
- No formal testing framework - manual verification required

## 课堂笔记整理

### 重要提示
在整理课堂录音文本为笔记之前，**必须先查看** `/Users/nanoshiki/Desktop/myWeb/wiki/课堂笔记整理指南.md` 文件。

### 默认工作方式
- 输入默认是课堂录音转写文本、逐字稿，或已粘贴到目标 `md` 中的原始文本
- 输出默认是可直接发布到博客的中文 Markdown 教学讲解文档
- 如果源文本为空或缺失，不要编造内容；应明确标记为待补材料

### 笔记整理要求
1. **默认风格**：教学讲解式文档，按课堂推进讲清概念、推导与应用
2. **默认流程**：先还原课堂主线，再把每段写成“讲什么 → 为什么 → 怎么推导 → 怎么用 → 例子/易错点”
3. **内容完整**：尽量完整覆盖录音中的核心知识点，不要只保留术语目录
4. **默认读者**：默认只预设高中数理基础与一点点计算机基础，不要默认读者已有高阶先修
5. **公式要求**：对公式、矩阵、递推关系优先给出最小完整写法，并保证可渲染
6. **术语处理**：遇到门槛术语要在正文就地解释，避免读者断层
7. **表达限制**：去除时间戳与明显口语噪声，避免课堂实录口吻
8. **长度策略**：以讲清楚为准，不强制固定字数

### 完整提示词
请使用 `wiki/课堂笔记整理指南.md` 中的提示词与流程进行整理。

## Skills

### Available project-local skills
- 当前仓库不再提供课堂笔记整理专用 skill；整理课堂录音请直接遵循本文件与 `wiki/课堂笔记整理指南.md`。
