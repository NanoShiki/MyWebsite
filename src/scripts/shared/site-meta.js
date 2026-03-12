export const SITE_START_DATE = '2026-02-28T00:00:00+08:00';

export const PROFILE_LINKS = [
  {
    key: 'github',
    label: 'GitHub',
    href: 'https://github.com/NanoShiki',
    description: '代码仓库、项目实验与开发记录。'
  },
  {
    key: 'bilibili',
    label: 'Bilibili',
    href: 'https://space.bilibili.com/253377872',
    description: '视频动态、内容补充与轻量更新。'
  },
  {
    key: 'zhihu',
    label: 'Zhihu',
    href: 'https://www.zhihu.com/people/nanoshiki',
    description: '长一点的想法、回答与主题整理。'
  }
];

export const HOME_DESTINATIONS = [
  {
    key: 'blog',
    label: '博客',
    href: '/Blog/',
    description: '课程笔记、技术文章、项目记录都从这里进入。'
  },
  ...PROFILE_LINKS
];

export const SITE_COPY = {
  siteTitle: '如珩的个人网站',
  siteSubtitle: '把笔记、项目与灵感装进行囊，下一站从这里出发。',
  homeHeroTitleTop: '如珩の',
  homeHeroTitleBottom: '冒险者札记',
  homeKicker: 'Guild Gate / Adventure Log',
  homeHint: '向下滚动，选择你想前往的据点。',
  footerText: '记录技术、课程与创作轨迹，也为后续更有趣的动态效果预留扩展空间。'
};
