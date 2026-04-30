import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import sharp from 'sharp'

const projectRoot = process.cwd()
const picturesRoot = 'C:\\Users\\31238\\Pictures'
const optimizedPhotosDir = path.join(projectRoot, 'public', 'assets', 'optimized', 'photos')
const originalPhotosDir = path.join(projectRoot, 'public', 'assets', 'photos')
const dataFile = path.join(projectRoot, 'src', 'data.ts')
const supportedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tif', '.tiff'])

const categoryRules = [
  { test: (relative) => relative.includes('WLOP'), category: 'WLOP' },
  { test: (relative) => relative.includes('武汉游'), category: '武汉游' },
  { test: (relative) => relative.includes('华科青年园'), category: '华科青年园' },
  { test: (relative) => relative.includes('华科校园'), category: '华科校园' },
  { test: (relative) => relative.includes('艺术展'), category: '艺术展' },
]

const slugMap = [
  ['WLOP', 'wlop'],
  ['武汉游', 'wuhan-walk'],
  ['华科青年园', 'hust-youth-park'],
  ['华科校园', 'hust-campus'],
  ['艺术展', 'art-exhibit'],
  ['本机图片', 'local-pictures'],
]

const eastLakePattern = /(东湖|east[-_ ]?lake|eastlake)/i

const normalizeDate = (value) => {
  const match = value.match(/(20\d{2})[.-](\d{1,2})[.-](\d{1,2})/)
  if (!match) return null
  return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
}

const toPosix = (value) => value.split(path.sep).join('/')

const categoryFor = (relative) => categoryRules.find((rule) => rule.test(relative))?.category ?? '本机图片'

const slugPrefixFor = (category) => slugMap.find(([label]) => label === category)?.[1] ?? 'local-pictures'

const titleFor = (filePath) => path.basename(filePath, path.extname(filePath)).replace(/[_-]+/g, ' ').trim()

const dateFor = async (filePath, relative) => {
  const fromPath = normalizeDate(relative)
  if (fromPath) return fromPath
  const stat = await fs.stat(filePath)
  return stat.mtime.toISOString().slice(0, 10)
}

const locationFor = (relative) => {
  const directory = path.dirname(relative)
  return directory === '.' ? 'Pictures' : toPosix(directory)
}

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)))
    } else if (entry.isFile() && supportedExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath)
    }
  }

  return files
}

const cleanEastLakeAssets = async () => {
  for (const dir of [optimizedPhotosDir, originalPhotosDir]) {
    try {
      const entries = await fs.readdir(dir)
      await Promise.all(
        entries
          .filter((name) => eastLakePattern.test(name))
          .map((name) => fs.rm(path.join(dir, name), { force: true })),
      )
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
}

const writeImagePair = async (source, id) => {
  const fullOutput = path.join(optimizedPhotosDir, `${id}.webp`)
  const thumbOutput = path.join(optimizedPhotosDir, `${id}-thumb.webp`)

  await sharp(source, { animated: false })
    .rotate()
    .resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(fullOutput)

  await sharp(source, { animated: false })
    .rotate()
    .resize({ width: 560, height: 560, fit: 'cover', position: 'attention' })
    .webp({ quality: 72 })
    .toFile(thumbOutput)
}

const replacePhotosBlock = async (items) => {
  const source = await fs.readFile(dataFile, 'utf8')
  const start = source.indexOf('export const photos: PhotoItem[] = [')
  const end = source.indexOf('\nexport const games: GameItem[] = [', start)

  if (start === -1 || end === -1) {
    throw new Error('Could not locate photos block in src/data.ts')
  }

  const photoLines = items
    .map((item) => {
      const args = [item.id, item.title, item.category, item.date, item.location].map((value) => JSON.stringify(value)).join(', ')
      return `  photo(${args}),`
    })
    .join('\n')

  const nextBlock = `export const photos: PhotoItem[] = [\n${photoLines}\n]\n`
  await fs.writeFile(dataFile, `${source.slice(0, start)}${nextBlock}${source.slice(end + 1)}`, 'utf8')
}

await fs.mkdir(optimizedPhotosDir, { recursive: true })
await cleanEastLakeAssets()

const allFiles = await walk(picturesRoot)
const importFiles = allFiles
  .map((filePath) => ({ filePath, relative: path.relative(picturesRoot, filePath) }))
  .filter(({ relative }) => !eastLakePattern.test(relative))
  .filter(({ relative }) => !relative.includes('WLOP'))
  .sort((a, b) => a.relative.localeCompare(b.relative, 'zh-Hans-CN'))

const items = []

for (const { filePath, relative } of importFiles) {
  const category = categoryFor(relative)
  const hash = crypto.createHash('sha1').update(relative).digest('hex').slice(0, 8)
  const numericStem = path.basename(filePath, path.extname(filePath)).replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase()
  const id = `${slugPrefixFor(category)}-${numericStem || 'image'}-${hash}`

  await writeImagePair(filePath, id)
  items.push({
    id,
    title: titleFor(filePath),
    category,
    date: await dateFor(filePath, relative),
    location: locationFor(relative),
  })
}

await replacePhotosBlock(items)

console.log(
  JSON.stringify(
    {
      scanned: allFiles.length,
      imported: items.length,
      removedByRule: allFiles.length - importFiles.length,
      categories: [...new Set(items.map((item) => item.category))],
    },
    null,
    2,
  ),
)
