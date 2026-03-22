# src 图片槽位放图指南（自动生成）

> 生成时间：2026-03-22 22:23
> 请勿手改本文件；请运行 `npm run docs:image-pools` 重新生成。

## 总规则

- 素材根目录：`src/assets/`
- 槽位来源：`src/scripts/shared/image-pool.js`（`IMAGE_SLOTS` + `SLOT_DIRECTORIES`）
- 支持格式：`jpg`、`jpeg`、`png`、`webp`
- 随机策略：按天稳定随机（同一天同位置固定，跨天自动变化）
- 维护原则：一个显示位置对应一个目录；仅需向目录加图，不改业务代码

## 快速维护步骤

1. 找到目标位置对应的“目录”列。
2. 把新图片放入该目录（建议每个目录至少 2 张）。
3. 运行 `npm run docs:image-pools` 更新文档。
4. 运行 `npm run build` 或 `npm run dev` 验证页面效果。

## 槽位总表

| slotConst | slotKey | 目录 | 使用页面 | 当前图片数 | 备注 |
| --- | --- | --- | --- | ---: | --- |
| `blogHeroBackground` | `blog.hero.background` | `blog-hero-bg` | Blog Index | 1 | 正常 |
| `blogHeroQuill` | `blog.hero.quill` | `blog-hero-quill` | Blog Index | 1 | 正常 |
| `blogJournalBackground` | `blog.journal.background` | `blog-journal-bg` | Blog Index | 1 | 正常 |
| `blogMapBackground` | `blog.map.background` | `blog-map-bg` | Blog Index | 1 | 正常 |
| `homeCampBackground` | `home.camp.background` | `home-camp-bg` | Home | 2 | 正常 |
| `homeHeroBackground` | `home.hero.background` | `home-hero-bg` | Home | 1 | 正常 |
| `homeTrailBackground` | `home.trail.background` | `home-trail-bg` | Home | 1 | 正常 |
| `postPageBackground` | `post.page.background` | `post-page-bg` | Blog Post | 1 | 正常 |

## 按页面分组清单

### Home

| slotConst | 目录 | 当前图片数 |
| --- | --- | ---: |
| `homeCampBackground` | `home-camp-bg` | 2 |
| `homeHeroBackground` | `home-hero-bg` | 1 |
| `homeTrailBackground` | `home-trail-bg` | 1 |

### Blog Hero

| slotConst | 目录 | 当前图片数 |
| --- | --- | ---: |
| `blogHeroBackground` | `blog-hero-bg` | 1 |
| `blogHeroQuill` | `blog-hero-quill` | 1 |

### Blog Map

| slotConst | 目录 | 当前图片数 |
| --- | --- | ---: |
| `blogMapBackground` | `blog-map-bg` | 1 |

### Blog Journal

| slotConst | 目录 | 当前图片数 |
| --- | --- | ---: |
| `blogJournalBackground` | `blog-journal-bg` | 1 |

### Post

| slotConst | 目录 | 当前图片数 |
| --- | --- | ---: |
| `postPageBackground` | `post-page-bg` | 1 |

## 空目录告警

- 当前无空目录，全部槽位均有图片。
