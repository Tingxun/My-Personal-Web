import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import sharp from 'sharp'

const projectRoot = process.cwd()
const picturesRoot = 'C:\\Users\\31238\\Pictures\\WLOP'
const outputRoot = path.join(projectRoot, 'public', 'assets', 'optimized', 'wlop')
const oldPhotosDir = path.join(projectRoot, 'public', 'assets', 'optimized', 'photos')
const oldOriginalPhotosDir = path.join(projectRoot, 'public', 'assets', 'photos')
const dataFile = path.join(projectRoot, 'src', 'data.ts')
const supportedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tif', '.tiff'])
const years = ['2022', '2023', '2024']

const toPosix = (value) => value.split(path.sep).join('/')

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

const cleanOldWlopAssets = async () => {
  await fs.rm(outputRoot, { recursive: true, force: true })
  await fs.mkdir(outputRoot, { recursive: true })

  for (const dir of [oldPhotosDir, oldOriginalPhotosDir]) {
    try {
      const entries = await fs.readdir(dir)
      await Promise.all(
        entries
          .filter((name) => /^(wlop|wl-local)/i.test(name))
          .map((name) => fs.rm(path.join(dir, name), { force: true })),
      )
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
}

const yearFor = (filePath) => years.find((year) => filePath.includes(`WLOP ${year}`))

const titleFor = (filePath) => path.basename(filePath, path.extname(filePath)).replace(/[_-]+/g, ' ').trim()

const slugFor = (filePath, relative) => {
  const stem = path.basename(filePath, path.extname(filePath)).replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase()
  const hash = crypto.createHash('sha1').update(relative).digest('hex').slice(0, 8)
  return `${stem || 'image'}-${hash}`
}

const writeImagePair = async (source, year, id) => {
  const yearDir = path.join(outputRoot, year)
  await fs.mkdir(yearDir, { recursive: true })

  await sharp(source, { animated: false })
    .rotate()
    .resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 84 })
    .toFile(path.join(yearDir, `${id}.webp`))

  await sharp(source, { animated: false })
    .rotate()
    .resize({ width: 560, height: 560, fit: 'cover', position: 'attention' })
    .webp({ quality: 74 })
    .toFile(path.join(yearDir, `${id}-thumb.webp`))
}

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const insertPhotoAssetHelper = (source) => {
  if (source.includes('const photoAsset = (')) return source

  const marker = 'const photo = (id: string, title: string, category: string, date: string, location: string): PhotoItem => ({\n'
  const start = source.indexOf(marker)
  const end = source.indexOf('\n})\n', start)
  if (start === -1 || end === -1) throw new Error('Could not locate photo helper')

  const insertionPoint = end + '\n})\n'.length
  const helper = `
const photoAsset = (
  id: string,
  title: string,
  category: string,
  date: string,
  location: string,
  src: string,
  thumb: string,
): PhotoItem => ({
  id,
  title,
  category,
  src,
  thumb,
  date,
  location,
})
`

  return `${source.slice(0, insertionPoint)}${helper}${source.slice(insertionPoint)}`
}

const updateDataFile = async (wlopItems) => {
  let source = await fs.readFile(dataFile, 'utf8')
  source = insertPhotoAssetHelper(source)

  const start = source.indexOf('export const photos: PhotoItem[] = [')
  const end = source.indexOf('\nexport const games: GameItem[] = [', start)
  if (start === -1 || end === -1) throw new Error('Could not locate photos block')

  const block = source.slice(start, end)
  const keptLines = block
    .split('\n')
    .filter((line) => !/photo(?:Asset)?\("wlop-|photo(?:Asset)?\("wl-local-|photo(?:Asset)?\('wlop-|photo(?:Asset)?\('wl-local-/.test(line))

  const wlopLines = wlopItems
    .map((item) => {
      const args = [item.id, item.title, item.category, item.date, item.location, item.src, item.thumb]
        .map((value) => JSON.stringify(value))
        .join(', ')
      return `  photoAsset(${args}),`
    })
    .join('\n')

  const closeIndex = keptLines.findIndex((line) => line.trim() === ']')
  if (closeIndex === -1) throw new Error('Could not locate photos block close')
  keptLines.splice(closeIndex, 0, wlopLines)

  const nextBlock = keptLines.filter(Boolean).join('\n')
  source = `${source.slice(0, start)}${nextBlock}${source.slice(end)}`

  await fs.writeFile(dataFile, source, 'utf8')
}

await cleanOldWlopAssets()

const allFiles = await walk(picturesRoot)
const importFiles = allFiles
  .map((filePath) => ({ filePath, year: yearFor(filePath), relative: path.relative(picturesRoot, filePath) }))
  .filter((item) => item.year)
  .sort((a, b) => a.relative.localeCompare(b.relative, 'zh-Hans-CN'))

const items = []

for (const { filePath, year, relative } of importFiles) {
  const slug = slugFor(filePath, relative)
  const id = `wlop-${year}-${slug}`
  await writeImagePair(filePath, year, id)
  items.push({
    id,
    title: titleFor(filePath),
    category: `WLOP ${year}`,
    date: year,
    location: toPosix(path.dirname(path.join('WLOP', relative))),
    src: `/assets/optimized/wlop/${year}/${id}.webp`,
    thumb: `/assets/optimized/wlop/${year}/${id}-thumb.webp`,
  })
}

await updateDataFile(items)

console.log(
  JSON.stringify(
    {
      scanned: allFiles.length,
      imported: items.length,
      byYear: Object.fromEntries(years.map((year) => [year, items.filter((item) => item.category.endsWith(year)).length])),
    },
    null,
    2,
  ),
)
