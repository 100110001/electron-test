import inquirer from 'inquirer'
import {
  readFileSync,
  existsSync,
  createWriteStream,
  readdirSync,
  statSync,
  unlinkSync,
  rmdirSync,
  copyFileSync
} from 'node:fs'
import { join, basename, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import archiver from 'archiver'
import { mkdirSync } from 'fs'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

;(async () => {
  const pkgJSON = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf-8'))

  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continue',
      message: `当前的 package.json 版本是 ${pkgJSON.version}，是否继续执行？`,
      default: false
    }
  ])

  if (!answers.continue) return

  //  判断下需要自动部署的文件是否存在，如果不存在，需要让它自己先执行下 compile:mac
  const appFolder = resolve(
    __dirname,
    '..',
    'dist',
    'mac-arm64',
    '软件名称',
    'Contents',
    'Resources',
    'app'
  )

  if (!existsSync(appFolder))
    throw new Error(`文件夹不存在，请先尝试执行 pnpm run beforeStartAutoUpdate, ${appFolder}`)

  const zipFolder = resolve(__dirname, '..', 'dist', 'autoUpdate')
  const outputFullSizeZipPath = resolve(zipFolder, 'fullSizeApp.zip')
  const outputZipPath = resolve(zipFolder, 'app.zip')

  //  判断 compile 的 package json 和 当前开发环境的是否一样
  const compilePkgJSON = JSON.parse(readFileSync(join(appFolder, 'package.json'), 'utf-8'))
  if (pkgJSON.version !== compilePkgJSON.version) {
    throw new Error(
      `编译后的 package.json 和当前不一致，请检查是否是新版本，当前${pkgJSON.version}, compiled ${compilePkgJSON.version}`
    )
  }

  if (existsSync(zipFolder)) {
    rmdir(zipFolder)
  }
  mkdirSync(zipFolder)

  await archive(outputFullSizeZipPath, [
    join(appFolder, 'node_modules'),
    join(appFolder, 'packages'),
    join(appFolder, 'package.json')
  ])
  await archive(outputZipPath, [join(appFolder, 'packages'), join(appFolder, 'package.json')])

  //  将 package.json 放到 outputZipPath 里面
  copyFileSync(join(appFolder, 'package.json'), join(zipFolder, 'package.json'))

  function archive(zipPath: string, files: string[]) {
    return new Promise<void>((res, rej) => {
      // 创建一个可写流来写入 zip 文件
      const output = createWriteStream(zipPath)
      const archive = archiver('zip', {
        zlib: { level: 9 }
      })

      // 当打包完成时触发 'close' 事件
      output.on('close', function () {
        console.log(archive.pointer() + ' total bytes')
        console.log('archiver has been finalized and the output file descriptor has closed.')
        res()
      })

      // 当出现错误时触发 'error' 事件
      archive.on('error', function (err: any) {
        rej(err)
      })

      // 完成打包并关闭输出流
      archive.pipe(output)

      // 将指定文件夹添加到 zip 文件中
      for (let filePath of files) {
        if (~filePath.indexOf('package.json')) {
          archive.file(filePath, { name: basename(filePath) })
        } else {
          archive.directory(filePath, basename(filePath))
        }
      }

      archive.finalize()
    })
  }
})()

function rmdir(dir: string) {
  var list = readdirSync(dir)
  for (let i = 0; i < list.length; i++) {
    let filename = join(dir, list[i])
    let stat = statSync(filename)

    if (filename == '.' || filename == '..') {
      // pass these files
    } else if (stat.isDirectory()) {
      // rmdir recursively
      rmdir(filename)
    } else {
      // rm fiilename
      unlinkSync(filename)
    }
  }
  rmdirSync(dir)
}
