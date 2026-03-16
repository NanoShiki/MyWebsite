# src 图片槽位放图指南（自动生成）

> 生成时间：2026-03-16 21:33
> 请勿手改本文件；请运行 `npm run docs:image-pools` 重新生成。

## 总规则

- 素材根目录：`src/assets/image-pools/`
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
| `blogPanelHeroBackground` | `blog.panel-hero.background` | `blog/panel-hero/background` | Blog Index | 1 | 正常 |
| `blogPanelHeroCornerOrnament` | `blog.panel-hero.corner-ornament` | `blog/panel-hero/corner-ornament` | Blog Index | 1 | 正常 |
| `blogPanelHeroDividerSeal` | `blog.panel-hero.divider-seal` | `blog/panel-hero/divider-seal` | Blog Index | 1 | 正常 |
| `blogPanelHeroGlassNoise` | `blog.panel-hero.glass-noise` | `blog/panel-hero/glass-noise` | Blog Index | 1 | 正常 |
| `blogPanelHeroPaperTexture` | `blog.panel-hero.paper-texture` | `blog/panel-hero/paper-texture` | Blog Index | 1 | 正常 |
| `blogPanelHeroQuill` | `blog.panel-hero.quill` | `blog/panel-hero/quill` | Blog Index | 1 | 正常 |
| `blogPanelHeroRuinsOverlay` | `blog.panel-hero.ruins-overlay` | `blog/panel-hero/ruins-overlay` | Blog Index | 1 | 正常 |
| `blogPanelHeroWindEmblem` | `blog.panel-hero.wind-emblem` | `blog/panel-hero/wind-emblem` | Blog Index | 1 | 正常 |
| `blogPanelHeroWoodGrain` | `blog.panel-hero.wood-grain` | `blog/panel-hero/wood-grain` | Blog Index | 1 | 正常 |
| `blogPanelJournalBackground` | `blog.panel-journal.background` | `blog/panel-journal/background` | Blog Index | 1 | 正常 |
| `blogPanelJournalCornerOrnament` | `blog.panel-journal.corner-ornament` | `blog/panel-journal/corner-ornament` | Blog Index | 1 | 正常 |
| `blogPanelJournalDividerSeal` | `blog.panel-journal.divider-seal` | `blog/panel-journal/divider-seal` | Blog Index | 1 | 正常 |
| `blogPanelJournalGlassNoise` | `blog.panel-journal.glass-noise` | `blog/panel-journal/glass-noise` | Blog Index | 1 | 正常 |
| `blogPanelJournalPaperTexture` | `blog.panel-journal.paper-texture` | `blog/panel-journal/paper-texture` | Blog Index | 1 | 正常 |
| `blogPanelJournalRuinsOverlay` | `blog.panel-journal.ruins-overlay` | `blog/panel-journal/ruins-overlay` | Blog Index | 1 | 正常 |
| `blogPanelJournalWindEmblem` | `blog.panel-journal.wind-emblem` | `blog/panel-journal/wind-emblem` | Blog Index | 1 | 正常 |
| `blogPanelJournalWoodGrain` | `blog.panel-journal.wood-grain` | `blog/panel-journal/wood-grain` | Blog Index | 1 | 正常 |
| `blogPanelMapBackground` | `blog.panel-map.background` | `blog/panel-map/background` | Blog Index | 1 | 正常 |
| `blogPanelMapCornerOrnament` | `blog.panel-map.corner-ornament` | `blog/panel-map/corner-ornament` | Blog Index | 1 | 正常 |
| `blogPanelMapDividerSeal` | `blog.panel-map.divider-seal` | `blog/panel-map/divider-seal` | Blog Index | 1 | 正常 |
| `blogPanelMapGlassNoise` | `blog.panel-map.glass-noise` | `blog/panel-map/glass-noise` | Blog Index | 1 | 正常 |
| `blogPanelMapPaperTexture` | `blog.panel-map.paper-texture` | `blog/panel-map/paper-texture` | Blog Index | 1 | 正常 |
| `blogPanelMapRuinsOverlay` | `blog.panel-map.ruins-overlay` | `blog/panel-map/ruins-overlay` | Blog Index | 1 | 正常 |
| `blogPanelMapWindEmblem` | `blog.panel-map.wind-emblem` | `blog/panel-map/wind-emblem` | Blog Index | 1 | 正常 |
| `blogPanelMapWoodGrain` | `blog.panel-map.wood-grain` | `blog/panel-map/wood-grain` | Blog Index | 1 | 正常 |
| `blogSidebarProfileAvatar` | `blog.sidebar.profile-avatar` | `blog/sidebar/profile-avatar` | Blog Index | 2 | 正常 |
| `homePageBackground` | `home.page.background` | `home/page/background` | Home | 1 | 正常 |
| `homePageCampDay` | `home.page.camp-day` | `home/page/camp-day` | Home | 1 | 正常 |
| `homePageCampNight` | `home.page.camp-night` | `home/page/camp-night` | Home | 1 | 正常 |
| `homePageTrail` | `home.page.trail` | `home/page/trail` | Home | 1 | 正常 |
| `postPageBackground` | `post.page.background` | `post/page/background` | Blog Post | 1 | 正常 |
| `postPageGlassNoise` | `post.page.glass-noise` | `post/page/glass-noise` | Blog Post | 1 | 正常 |
| `postPageRuinsOverlay` | `post.page.ruins-overlay` | `post/page/ruins-overlay` | Blog Post | 1 | 正常 |
| `postPageWindEmblem` | `post.page.wind-emblem` | `post/page/wind-emblem` | Blog Post | 1 | 正常 |

## 按页面分组清单

### Home

| slotConst | 目录 | 当前图片数 |
| --- | --- | ---: |
| `homePageBackground` | `home/page/background` | 1 |
| `homePageCampDay` | `home/page/camp-day` | 1 |
| `homePageCampNight` | `home/page/camp-night` | 1 |
| `homePageTrail` | `home/page/trail` | 1 |

### Blog Hero

| slotConst | 目录 | 当前图片数 |
| --- | --- | ---: |
| `blogPanelHeroBackground` | `blog/panel-hero/background` | 1 |
| `blogPanelHeroCornerOrnament` | `blog/panel-hero/corner-ornament` | 1 |
| `blogPanelHeroDividerSeal` | `blog/panel-hero/divider-seal` | 1 |
| `blogPanelHeroGlassNoise` | `blog/panel-hero/glass-noise` | 1 |
| `blogPanelHeroPaperTexture` | `blog/panel-hero/paper-texture` | 1 |
| `blogPanelHeroQuill` | `blog/panel-hero/quill` | 1 |
| `blogPanelHeroRuinsOverlay` | `blog/panel-hero/ruins-overlay` | 1 |
| `blogPanelHeroWindEmblem` | `blog/panel-hero/wind-emblem` | 1 |
| `blogPanelHeroWoodGrain` | `blog/panel-hero/wood-grain` | 1 |

### Blog Map

| slotConst | 目录 | 当前图片数 |
| --- | --- | ---: |
| `blogPanelMapBackground` | `blog/panel-map/background` | 1 |
| `blogPanelMapCornerOrnament` | `blog/panel-map/corner-ornament` | 1 |
| `blogPanelMapDividerSeal` | `blog/panel-map/divider-seal` | 1 |
| `blogPanelMapGlassNoise` | `blog/panel-map/glass-noise` | 1 |
| `blogPanelMapPaperTexture` | `blog/panel-map/paper-texture` | 1 |
| `blogPanelMapRuinsOverlay` | `blog/panel-map/ruins-overlay` | 1 |
| `blogPanelMapWindEmblem` | `blog/panel-map/wind-emblem` | 1 |
| `blogPanelMapWoodGrain` | `blog/panel-map/wood-grain` | 1 |

### Blog Journal

| slotConst | 目录 | 当前图片数 |
| --- | --- | ---: |
| `blogPanelJournalBackground` | `blog/panel-journal/background` | 1 |
| `blogPanelJournalCornerOrnament` | `blog/panel-journal/corner-ornament` | 1 |
| `blogPanelJournalDividerSeal` | `blog/panel-journal/divider-seal` | 1 |
| `blogPanelJournalGlassNoise` | `blog/panel-journal/glass-noise` | 1 |
| `blogPanelJournalPaperTexture` | `blog/panel-journal/paper-texture` | 1 |
| `blogPanelJournalRuinsOverlay` | `blog/panel-journal/ruins-overlay` | 1 |
| `blogPanelJournalWindEmblem` | `blog/panel-journal/wind-emblem` | 1 |
| `blogPanelJournalWoodGrain` | `blog/panel-journal/wood-grain` | 1 |

### Blog Sidebar

| slotConst | 目录 | 当前图片数 |
| --- | --- | ---: |
| `blogSidebarProfileAvatar` | `blog/sidebar/profile-avatar` | 2 |

### Post

| slotConst | 目录 | 当前图片数 |
| --- | --- | ---: |
| `postPageBackground` | `post/page/background` | 1 |
| `postPageGlassNoise` | `post/page/glass-noise` | 1 |
| `postPageRuinsOverlay` | `post/page/ruins-overlay` | 1 |
| `postPageWindEmblem` | `post/page/wind-emblem` | 1 |

## 空目录告警

- 当前无空目录，全部槽位均有图片。
