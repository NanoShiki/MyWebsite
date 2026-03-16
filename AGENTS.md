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

### Auto Preview Requirement

- After every completed task and final response, local preview is mandatory.
- Check existing preview services in order:
  - First `127.0.0.1:5173`
  - Then `127.0.0.1:5174` if 5173 is unavailable
  - Reuse an existing service if found; do not start duplicate servers.
- If no service is running, start Vite preview:
  - `npm run dev -- --host 127.0.0.1 --port 5173`
  - If 5173 is occupied, use port 5174.
- Open at least these pages:
  - `http://127.0.0.1:<port>/`
  - `http://127.0.0.1:<port>/Blog/`
- Every final response must include:
  - Current preview URL
  - Listener process PID
  - Stop command: `kill <PID>`
- If Node/Vite preview fails, fall back to:
  - `python3 -m http.server 8000`
  - Mention explicitly in the final response that fallback mode is being used.

## 课堂笔记整理

### 重要提示
课堂笔记整理以本文件与全局 skill `classroom-audio-to-notes` 为准。
不依赖额外的 wiki 指南文件作为前置条件。

### 默认工作方式
- 输入默认是课堂录音转写文本、逐字稿，或已粘贴到目标 `md` 中的原始文本
- 输出默认是可直接发布到博客的中文 Markdown 教学讲解文档
- 如果源文本为空或缺失，不要编造内容；应明确标记为待补材料

### 笔记整理要求
1. **默认风格**：教学讲解式文档，按课堂推进讲清概念、推导与应用。
2. **单元结构**：每个 `## 学习单元` 仅保留 3 个小节，且顺序固定为：
   - `### 核心概念`
   - `### 关键公式`
   - `### 例题`
3. **范围限制**：除上述 3 个小节外，默认删除其他单元小节（学习目标、练习、自检等）与文末扩展章节（术语表、课后综合练习、自学建议）。
4. **缺失处理**：若某单元缺少三者之一，补齐该小节并写 `待补充：`，禁止虚构结论。
5. **公式要求**：对公式、矩阵、递推关系优先给出最小完整写法，并保证可渲染。
6. **术语处理**：遇到门槛术语要在正文就地解释，避免读者断层。
7. **表达限制**：去除时间戳与明显口语噪声，避免课堂实录口吻。
8. **长度策略**：以讲清楚为准，不强制固定字数。
9. **核心概念门禁**：`### 核心概念` 必须写成连贯讲解段落（建议 2-4 段），重点是讲清概念与原理，而不是机械分点罗列。
10. **禁用机械模板**：`核心概念` 中禁止 `- 定义：/- 机制：/- 对比：/- 边界与易错：` 这类 checklist 前缀；允许自然展开讲解。
11. **禁用轱辘话**：`核心概念` 中禁止“这一讲从…介绍…”“本节放在这里是为了…”等流程话术；优先提供可直接用于理解与解题的知识内容。

## Skills

### Available project-local skills
- 当前仓库不再提供课堂笔记整理专用 project-local skill；课堂笔记整理请遵循本文件与全局 `classroom-audio-to-notes` skill。
