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

### 笔记整理要求
1. **字数控制**：1000字以内
2. **内容完整**：涵盖所有核心知识点
3. **易于理解**：使用教学性语言，适当补充解释

### 完整提示词
请使用 wiki/课堂笔记整理指南.md 中提供的提示词进行整理。
