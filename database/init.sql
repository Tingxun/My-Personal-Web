CREATE DATABASE IF NOT EXISTS myweb
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE myweb;

CREATE TABLE IF NOT EXISTS guestbook_entries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL DEFAULT 'Anonymous',
  message VARCHAR(500) NOT NULL,
  tone ENUM('idea', 'like', 'bug') NOT NULL DEFAULT 'idea',
  status ENUM('pending', 'approved', 'hidden') NOT NULL DEFAULT 'approved',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_guestbook_status_created_at (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS photos (
  id VARCHAR(80) NOT NULL,
  title VARCHAR(160) NOT NULL,
  category VARCHAR(80) NOT NULL,
  src VARCHAR(255) NOT NULL,
  thumb VARCHAR(255) NOT NULL,
  display_date VARCHAR(40) NOT NULL,
  location VARCHAR(160) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_photos_category (category),
  INDEX idx_photos_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS games (
  id VARCHAR(80) NOT NULL,
  name VARCHAR(160) NOT NULL,
  cover VARCHAR(255) NOT NULL,
  screenshots JSON NOT NULL,
  last_played_or_updated VARCHAR(40) NOT NULL,
  tags JSON NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_games_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(80) NOT NULL,
  name VARCHAR(180) NOT NULL,
  type VARCHAR(80) NOT NULL,
  tech_stack JSON NOT NULL,
  summary TEXT NOT NULL,
  path VARCHAR(500) NOT NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_projects_featured_sort_order (featured, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS music_tracks (
  id VARCHAR(80) NOT NULL,
  title VARCHAR(160) NOT NULL,
  artist VARCHAR(160) NOT NULL,
  cover VARCHAR(255) NOT NULL,
  audio_url VARCHAR(255) NOT NULL,
  source ENUM('local', 'netease', 'qq') NOT NULL DEFAULT 'local',
  external_url VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_music_tracks_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS skills (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  label VARCHAR(80) NOT NULL,
  value TINYINT UNSIGNED NOT NULL,
  detail VARCHAR(160) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_skills_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO guestbook_entries (id, name, message, tone, status, created_at) VALUES
  (1, 'Visitor', 'The geometry motion gives the archive a real sense of presence.', 'like', 'approved', NOW()),
  (2, 'Builder', 'A project detail layer would make the lab even stronger.', 'idea', 'approved', NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  message = VALUES(message),
  tone = VALUES(tone),
  status = VALUES(status);

INSERT INTO photos (id, title, category, src, thumb, display_date, location, sort_order) VALUES
  ('wlop-01', 'WLOP 视觉收藏 01', 'WLOP', '/assets/optimized/photos/wlop-01.webp', '/assets/optimized/photos/wlop-01-thumb.webp', '2025', 'Pictures / WLOP 2024', 1),
  ('wlop-02', 'WLOP 视觉收藏 02', 'WLOP', '/assets/optimized/photos/wlop-02.webp', '/assets/optimized/photos/wlop-02-thumb.webp', '2025', 'Pictures / WLOP 2024', 2),
  ('wlop-03', 'WLOP 视觉收藏 03', 'WLOP', '/assets/optimized/photos/wlop-03.webp', '/assets/optimized/photos/wlop-03-thumb.webp', '2025', 'Pictures / WLOP 2024', 3),
  ('east-lake-01', '东湖水线', '武汉东湖', '/assets/optimized/photos/east-lake-01.webp', '/assets/optimized/photos/east-lake-01-thumb.webp', '2024-06-29', '武汉东湖', 4),
  ('east-lake-02', '东湖风景切片', '武汉东湖', '/assets/optimized/photos/east-lake-02.webp', '/assets/optimized/photos/east-lake-02-thumb.webp', '2024-06-29', '武汉东湖', 5),
  ('east-lake-03', '东湖光影', '武汉东湖', '/assets/optimized/photos/east-lake-03.webp', '/assets/optimized/photos/east-lake-03-thumb.webp', '2024-06-29', '武汉东湖', 6),
  ('hust-campus-01', '华科校园 01', '华科校园', '/assets/optimized/photos/hust-campus-01.webp', '/assets/optimized/photos/hust-campus-01-thumb.webp', '2025-01-15', 'HUST', 7),
  ('hust-campus-02', '华科校园 02', '华科校园', '/assets/optimized/photos/hust-campus-02.webp', '/assets/optimized/photos/hust-campus-02-thumb.webp', '2025-01-15', 'HUST', 8),
  ('hust-campus-03', '华科校园 03', '华科校园', '/assets/optimized/photos/hust-campus-03.webp', '/assets/optimized/photos/hust-campus-03-thumb.webp', '2025-01-15', 'HUST', 9),
  ('art-exhibit-01', '法国艺术展 01', '艺术展', '/assets/optimized/photos/art-exhibit-01.webp', '/assets/optimized/photos/art-exhibit-01-thumb.webp', '2025-07-31', '湖北省博物馆', 10),
  ('art-exhibit-02', '法国艺术展 02', '艺术展', '/assets/optimized/photos/art-exhibit-02.webp', '/assets/optimized/photos/art-exhibit-02-thumb.webp', '2025-07-31', '湖北省博物馆', 11),
  ('art-exhibit-03', '法国艺术展 03', '艺术展', '/assets/optimized/photos/art-exhibit-03.webp', '/assets/optimized/photos/art-exhibit-03-thumb.webp', '2025-07-31', '湖北省博物馆', 12),
  ('wuhan-walk-01', '武汉漫游 01', '武汉游', '/assets/optimized/photos/wuhan-walk-01.webp', '/assets/optimized/photos/wuhan-walk-01-thumb.webp', '2024-05-03', '武汉', 13),
  ('wuhan-walk-02', '武汉漫游 02', '武汉游', '/assets/optimized/photos/wuhan-walk-02.webp', '/assets/optimized/photos/wuhan-walk-02-thumb.webp', '2024-05-03', '武汉', 14),
  ('wuhan-walk-03', '武汉漫游 03', '武汉游', '/assets/optimized/photos/wuhan-walk-03.webp', '/assets/optimized/photos/wuhan-walk-03-thumb.webp', '2024-05-03', '武汉', 15),
  ('wl-local-dome', 'Dome 视觉收藏', '本机图片', '/assets/optimized/photos/wl-local-dome.webp', '/assets/optimized/photos/wl-local-dome-thumb.webp', '2024', 'Pictures / WLOP', 16),
  ('wl-local-fissure', 'Fissure 视觉收藏', '本机图片', '/assets/optimized/photos/wl-local-fissure.webp', '/assets/optimized/photos/wl-local-fissure-thumb.webp', '2024', 'Pictures / WLOP', 17),
  ('hust-local-walk', '华科校园新切片', '本机图片', '/assets/optimized/photos/hust-local-walk.webp', '/assets/optimized/photos/hust-local-walk-thumb.webp', '2025-01-15', 'Pictures / Camera Roll', 18),
  ('museum-local-light', '省博展厅光影', '本机图片', '/assets/optimized/photos/museum-local-light.webp', '/assets/optimized/photos/museum-local-light-thumb.webp', '2025-07-31', 'Pictures / Camera Roll', 19),
  ('eastlake-local-wide', '东湖宽景', '本机图片', '/assets/optimized/photos/eastlake-local-wide.webp', '/assets/optimized/photos/eastlake-local-wide-thumb.webp', '2024-06-29', 'Pictures / Camera Roll', 20),
  ('wuhan-local-street', '武汉街头漫游', '本机图片', '/assets/optimized/photos/wuhan-local-street.webp', '/assets/optimized/photos/wuhan-local-street-thumb.webp', '2024-05-03', 'Pictures / Camera Roll', 21),
  ('steam-stellar-201030', 'Stellar Blade 截图 01', 'Steam 截图', '/assets/optimized/photos/steam-stellar-201030.webp', '/assets/optimized/photos/steam-stellar-201030-thumb.webp', '2025-08-28', 'D:\\SteamLibrary\\steamapps\\common', 22),
  ('steam-stellar-101623', 'Stellar Blade 截图 02', 'Steam 截图', '/assets/optimized/photos/steam-stellar-101623.webp', '/assets/optimized/photos/steam-stellar-101623-thumb.webp', '2025-07-04', 'D:\\SteamLibrary\\steamapps\\common', 23),
  ('steam-stellar-114059', 'Stellar Blade 截图 03', 'Steam 截图', '/assets/optimized/photos/steam-stellar-114059.webp', '/assets/optimized/photos/steam-stellar-114059-thumb.webp', '2025-07-10', 'D:\\SteamLibrary\\steamapps\\common', 24),
  ('steam-noexistence-lilith', 'Lilith 视觉素材', 'Steam 截图', '/assets/optimized/photos/steam-noexistence-lilith.webp', '/assets/optimized/photos/steam-noexistence-lilith-thumb.webp', '2026', 'D:\\SteamLibrary\\steamapps\\common', 25)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  category = VALUES(category),
  src = VALUES(src),
  thumb = VALUES(thumb),
  display_date = VALUES(display_date),
  location = VALUES(location),
  sort_order = VALUES(sort_order);

INSERT INTO games (id, name, cover, screenshots, last_played_or_updated, tags, sort_order) VALUES
  ('stellarblade', 'Stellar Blade', '/assets/optimized/games/stellarblade/stellarblade-06.webp',
    JSON_ARRAY('/assets/optimized/games/stellarblade/stellarblade-01.webp', '/assets/optimized/games/stellarblade/stellarblade-02.webp', '/assets/optimized/games/stellarblade/stellarblade-03.webp', '/assets/optimized/games/stellarblade/stellarblade-04.webp', '/assets/optimized/games/stellarblade/stellarblade-05.webp', '/assets/optimized/games/stellarblade/stellarblade-06.webp'),
    '2026-03-29', JSON_ARRAY('动作', '截图丰富', '科幻'), 1),
  ('tabs', 'Totally Accurate Battle Simulator', '/assets/optimized/games/tabs/tabs-01.webp',
    JSON_ARRAY('/assets/optimized/games/tabs/tabs-01.webp', '/assets/optimized/games/tabs/tabs-02.webp', '/assets/optimized/games/tabs/tabs-03.webp', '/assets/optimized/games/tabs/tabs-04.webp', '/assets/optimized/games/tabs/tabs-05.webp'),
    '2026-01-22', JSON_ARRAY('沙盒', '物理', '轻松'), 2),
  ('library', 'Steam Library', '/assets/optimized/games/stellarblade/stellarblade-02.webp',
    JSON_ARRAY('/assets/optimized/games/stellarblade/stellarblade-02.webp', '/assets/optimized/games/tabs/tabs-02.webp'),
    '2026-04-17', JSON_ARRAY('Black Myth Wukong', 'Warframe', 'Left 4 Dead 2', 'Metro Exodus'), 3)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  cover = VALUES(cover),
  screenshots = VALUES(screenshots),
  last_played_or_updated = VALUES(last_played_or_updated),
  tags = VALUES(tags),
  sort_order = VALUES(sort_order);

INSERT INTO projects (id, name, type, tech_stack, summary, path, featured, sort_order) VALUES
  ('senyv-hust', '森语 HUST 前后端项目', '完整前后端', JSON_ARRAY('Vue', 'Java', 'Spring', '工程化'), '包含前端 Senyv-Hust 与后端 hust-green-server，是目前最适合放进作品集的综合项目。', 'D:\\spare file\\项目\\森语HUST前后端项目', 1, 1),
  ('power-forecast', 'Power Forecast', '数据应用', JSON_ARRAY('Java', 'Vue', 'Forecasting', 'Visualization'), '围绕电力预测展开的应用项目，适合展示业务建模、前端交互和后端组织能力。', 'D:\\spare file\\Coding\\Java\\Power-Forecast', 1, 2),
  ('electricity-price', '多源异构数据电价预测', '机器学习', JSON_ARRAY('Python', 'Machine Learning', 'Data Pipeline'), '机器学习目录下的重点研究型项目，用于展示数据处理、模型实验和论文复现能力。', 'D:\\spare file\\项目\\机器学习\\多源异构数据电价预测项目', 1, 3),
  ('earth-cinematic', 'Earth Cinematic', 'Web 视觉实验', JSON_ARRAY('React', 'Vite', 'Cesium', 'TypeScript'), '已有 Vite 项目基础，体现 3D 地球、空间叙事和前端视觉实现经验。', 'D:\\spare file\\Coding\\Web\\HTML\\earth-cinematic', 1, 4),
  ('greedy-snake', 'Greedy Snake', 'Python 游戏', JSON_ARRAY('Python', 'Game Loop', 'UI'), '经典小游戏实现，适合放在编程起点和趣味项目区域。', 'D:\\spare file\\Coding\\Python\\Greedy_Snake', 0, 5),
  ('java-minesweeper', 'Java Minesweeper', '课程练习', JSON_ARRAY('Java', 'OOP', 'Game Logic'), 'Java 作业目录中的扫雷项目，体现面向对象建模和交互逻辑。', 'D:\\spare file\\Coding\\Java\\HomeWork\\Minesweeper', 0, 6)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  type = VALUES(type),
  tech_stack = VALUES(tech_stack),
  summary = VALUES(summary),
  path = VALUES(path),
  featured = VALUES(featured),
  sort_order = VALUES(sort_order);

INSERT INTO music_tracks (id, title, artist, cover, audio_url, source, external_url, sort_order) VALUES
  ('shape-of-you', 'Shape of You', 'Ed Sheeran', '/assets/optimized/photos/wlop-02-thumb.webp', '/assets/music/shape-of-you.mp3', 'local', NULL, 1),
  ('the-great-despair', 'THE GREAT DESPAIR', 'Local Music', '/assets/optimized/photos/wlop-01-thumb.webp', '/assets/music/THE%20GREAT%20DESPAIR.mp3', 'local', NULL, 2)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  artist = VALUES(artist),
  cover = VALUES(cover),
  audio_url = VALUES(audio_url),
  source = VALUES(source),
  external_url = VALUES(external_url),
  sort_order = VALUES(sort_order);

INSERT INTO skills (label, value, detail, sort_order) VALUES
  ('Web Frontend', 86, 'React / Vue / Vite / Canvas', 1),
  ('Python & Data', 82, 'Crawler / ML / Data analysis', 2),
  ('Java Backend', 78, 'Spring / OOP / Engineering', 3),
  ('C/C++ Basis', 70, 'Data structures / Algorithms', 4),
  ('Creative Coding', 74, 'Motion / Geometry / Visual systems', 5);
