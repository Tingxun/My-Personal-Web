export type MusicTrack = {
  id: string
  title: string
  artist: string
  cover: string
  audioUrl: string
  source: 'local' | 'netease' | 'qq'
  externalUrl?: string
}

export type PhotoItem = {
  id: string
  title: string
  category: string
  src: string
  thumb: string
  date: string
  location: string
}

export type GameItem = {
  id: string
  name: string
  cover: string
  screenshots: string[]
  lastPlayedOrUpdated: string
  tags: string[]
}

export type ProjectItem = {
  id: string
  name: string
  type: string
  techStack: string[]
  summary: string
  path: string
  featured: boolean
}

const photo = (id: string, title: string, category: string, date: string, location: string): PhotoItem => ({
  id,
  title,
  category,
  src: `/assets/optimized/photos/${id}.webp`,
  thumb: `/assets/optimized/photos/${id}-thumb.webp`,
  date,
  location,
})

export const photos: PhotoItem[] = [
  photo('wlop-01', 'WLOP 视觉收藏 01', 'WLOP', '2025', 'Pictures / WLOP 2024'),
  photo('wlop-02', 'WLOP 视觉收藏 02', 'WLOP', '2025', 'Pictures / WLOP 2024'),
  photo('wlop-03', 'WLOP 视觉收藏 03', 'WLOP', '2025', 'Pictures / WLOP 2024'),
  photo('east-lake-01', '东湖水线', '武汉东湖', '2024-06-29', '武汉东湖'),
  photo('east-lake-02', '东湖风景切片', '武汉东湖', '2024-06-29', '武汉东湖'),
  photo('east-lake-03', '东湖光影', '武汉东湖', '2024-06-29', '武汉东湖'),
  photo('hust-campus-01', '华科校园 01', '华科校园', '2025-01-15', 'HUST'),
  photo('hust-campus-02', '华科校园 02', '华科校园', '2025-01-15', 'HUST'),
  photo('hust-campus-03', '华科校园 03', '华科校园', '2025-01-15', 'HUST'),
  photo('art-exhibit-01', '法国艺术展 01', '艺术展', '2025-07-31', '湖北省博物馆'),
  photo('art-exhibit-02', '法国艺术展 02', '艺术展', '2025-07-31', '湖北省博物馆'),
  photo('art-exhibit-03', '法国艺术展 03', '艺术展', '2025-07-31', '湖北省博物馆'),
  photo('wuhan-walk-01', '武汉漫游 01', '武汉游', '2024-05-03', '武汉'),
  photo('wuhan-walk-02', '武汉漫游 02', '武汉游', '2024-05-03', '武汉'),
  photo('wuhan-walk-03', '武汉漫游 03', '武汉游', '2024-05-03', '武汉'),
  photo('wl-local-dome', 'Dome 视觉收藏', '本机图片', '2024', 'Pictures / WLOP'),
  photo('wl-local-fissure', 'Fissure 视觉收藏', '本机图片', '2024', 'Pictures / WLOP'),
  photo('hust-local-walk', '华科校园新切片', '本机图片', '2025-01-15', 'Pictures / Camera Roll'),
  photo('museum-local-light', '省博展厅光影', '本机图片', '2025-07-31', 'Pictures / Camera Roll'),
  photo('eastlake-local-wide', '东湖宽景', '本机图片', '2024-06-29', 'Pictures / Camera Roll'),
  photo('wuhan-local-street', '武汉街头漫游', '本机图片', '2024-05-03', 'Pictures / Camera Roll'),
  photo('steam-stellar-201030', 'Stellar Blade 截图 01', 'Steam 截图', '2025-08-28', 'D:\\SteamLibrary\\steamapps\\common'),
  photo('steam-stellar-101623', 'Stellar Blade 截图 02', 'Steam 截图', '2025-07-04', 'D:\\SteamLibrary\\steamapps\\common'),
  photo('steam-stellar-114059', 'Stellar Blade 截图 03', 'Steam 截图', '2025-07-10', 'D:\\SteamLibrary\\steamapps\\common'),
  photo('steam-noexistence-lilith', 'Lilith 视觉素材', 'Steam 截图', '2026', 'D:\\SteamLibrary\\steamapps\\common'),
]

export const games: GameItem[] = [
  {
    id: 'stellarblade',
    name: 'Stellar Blade',
    cover: '/assets/optimized/games/stellarblade/stellarblade-06.webp',
    screenshots: Array.from({ length: 6 }, (_, index) =>
      `/assets/optimized/games/stellarblade/stellarblade-${String(index + 1).padStart(2, '0')}.webp`,
    ),
    lastPlayedOrUpdated: '2026-03-29',
    tags: ['动作', '截图丰富', '科幻'],
  },
  {
    id: 'tabs',
    name: 'Totally Accurate Battle Simulator',
    cover: '/assets/optimized/games/tabs/tabs-01.webp',
    screenshots: Array.from({ length: 5 }, (_, index) =>
      `/assets/optimized/games/tabs/tabs-${String(index + 1).padStart(2, '0')}.webp`,
    ),
    lastPlayedOrUpdated: '2026-01-22',
    tags: ['沙盒', '物理', '轻松'],
  },
  {
    id: 'library',
    name: 'Steam Library',
    cover: '/assets/optimized/games/stellarblade/stellarblade-02.webp',
    screenshots: [
      '/assets/optimized/games/stellarblade/stellarblade-02.webp',
      '/assets/optimized/games/tabs/tabs-02.webp',
    ],
    lastPlayedOrUpdated: '2026-04-17',
    tags: ['Black Myth Wukong', 'Warframe', 'Left 4 Dead 2', 'Metro Exodus'],
  },
]

export const projects: ProjectItem[] = [
  {
    id: 'senyv-hust',
    name: '森语 HUST 前后端项目',
    type: '完整前后端',
    techStack: ['Vue', 'Java', 'Spring', '工程化'],
    summary: '包含前端 Senyv-Hust 与后端 hust-green-server，是目前最适合放进作品集的综合项目。',
    path: 'D:\\spare file\\项目\\森语HUST前后端项目',
    featured: true,
  },
  {
    id: 'power-forecast',
    name: 'Power Forecast',
    type: '数据应用',
    techStack: ['Java', 'Vue', 'Forecasting', 'Visualization'],
    summary: '围绕电力预测展开的应用项目，适合展示业务建模、前端交互和后端组织能力。',
    path: 'D:\\spare file\\Coding\\Java\\Power-Forecast',
    featured: true,
  },
  {
    id: 'electricity-price',
    name: '多源异构数据电价预测',
    type: '机器学习',
    techStack: ['Python', 'Machine Learning', 'Data Pipeline'],
    summary: '机器学习目录下的重点研究型项目，用于展示数据处理、模型实验和论文复现能力。',
    path: 'D:\\spare file\\项目\\机器学习\\多源异构数据电价预测项目',
    featured: true,
  },
  {
    id: 'earth-cinematic',
    name: 'Earth Cinematic',
    type: 'Web 视觉实验',
    techStack: ['React', 'Vite', 'Cesium', 'TypeScript'],
    summary: '已有 Vite 项目基础，体现 3D 地球、空间叙事和前端视觉实现经验。',
    path: 'D:\\spare file\\Coding\\Web\\HTML\\earth-cinematic',
    featured: true,
  },
  {
    id: 'greedy-snake',
    name: 'Greedy Snake',
    type: 'Python 游戏',
    techStack: ['Python', 'Game Loop', 'UI'],
    summary: '经典小游戏实现，适合放在编程起点和趣味项目区域。',
    path: 'D:\\spare file\\Coding\\Python\\Greedy_Snake',
    featured: false,
  },
  {
    id: 'java-minesweeper',
    name: 'Java Minesweeper',
    type: '课程练习',
    techStack: ['Java', 'OOP', 'Game Logic'],
    summary: 'Java 作业目录中的扫雷项目，体现面向对象建模和交互逻辑。',
    path: 'D:\\spare file\\Coding\\Java\\HomeWork\\Minesweeper',
    featured: false,
  },
]

export const localTracks: MusicTrack[] = [
  {
    id: 'shape-of-you',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    cover: '/assets/optimized/photos/wlop-02-thumb.webp',
    audioUrl: '/assets/music/shape-of-you.mp3',
    source: 'local',
  },
  {
    id: 'the-great-despair',
    title: 'THE GREAT DESPAIR',
    artist: 'Local Music',
    cover: '/assets/optimized/photos/wlop-01-thumb.webp',
    audioUrl: '/assets/music/THE%20GREAT%20DESPAIR.mp3',
    source: 'local',
  },
]

export const skills = [
  { label: 'Web Frontend', value: 86, detail: 'React / Vue / Vite / Canvas' },
  { label: 'Python & Data', value: 82, detail: 'Crawler / ML / Data analysis' },
  { label: 'Java Backend', value: 78, detail: 'Spring / OOP / Engineering' },
  { label: 'C/C++ Basis', value: 70, detail: 'Data structures / Algorithms' },
  { label: 'Creative Coding', value: 74, detail: 'Motion / Geometry / Visual systems' },
]
