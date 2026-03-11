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
- 优先使用项目内 skill：`/Users/nanoshiki/Desktop/myWeb/skills/classroom-transcript-notes/SKILL.md`
- 输入默认是课堂录音转写文本、逐字稿，或已粘贴到目标 `md` 中的原始文本
- 输出默认是可直接发布到博客的中文 Markdown 笔记
- 如果源文本为空或缺失，不要编造内容；应明确标记为待补材料

### 笔记整理要求
1. **默认风格**：知识点讲解 + 举例讲解的精炼复习笔记
2. **默认流程**：先提取专业术语和知识点，再逐点讲解，不按课堂顺序复述
3. **标题规则**：每个知识点必须先以名词性标题立住，再展开“是什么 / 干嘛的 / 这一讲怎么用 / 例子”
4. **内容完整**：尽量完整覆盖录音中的核心知识点
5. **知识讲解**：每个知识点尽量讲清“是什么”“干嘛的”“这一讲怎么用”“一个例子或应用”
6. **默认读者**：默认只预设高中数理基础与一点点计算机基础，不要默认读者已经学过高等数学、线性代数、离散数学、体系结构或机器学习先修
7. **定义质量**：`是什么`必须具体定义知识点本身；如果是公式、模型、方法、定理，要写出最小完整形式
8. **方程类要求**：若知识点属于方程、公式、递推关系，优先写一般形式或标准写法，并尽量补一个实例
9. **术语处理**：遇到门槛较高的数学、算法、图形学、体系结构术语，要在正文中就地拆解，不要跳过先修前提
10. **公式写法**：数学符号、递推式、状态更新式默认写成 Markdown/LaTeX 公式，不要用反引号代替公式渲染
11. **表达限制**：避免使用“本课”“老师”“课堂”“录音”“实录”等课堂记录口吻
12. **长度策略**：默认中等精炼，不强制 1500 字以上
13. **结构禁忌**：不要在还没定义知识点时，直接用“为什么”“怎么”当标题

### 完整提示词
请使用 `wiki/课堂笔记整理指南.md` 和项目内 skill 中提供的提示词与流程进行整理。

## Skills

### Available project-local skills
- `classroom-transcript-notes`: Convert classroom transcripts or raw lecture text into the project's concise `知识点讲解 + 举例讲解` Markdown notes, organized as noun-like knowledge-point headings followed by the fixed four-part explanation. (file: `/Users/nanoshiki/Desktop/myWeb/skills/classroom-transcript-notes/SKILL.md`)
