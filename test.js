const archiver = require('archiver')
const fs = require('fs')
const { join, basename, resolve } = require('node:path')

// 读取版本号
const manifestJSon = fs.readFileSync('./package.json', 'utf-8')
const mainTextObj = JSON.parse(manifestJSon)
// 版本号
const version = mainTextObj.version

const output = fs.createWriteStream(`./dist/app-${version}.zip`)
const archive = archiver('zip', {
  zlib: {
    level: 9 // 设置压缩等级
  }
})

archive.pipe(output)
archive.directory('./out') // 这里false参数和上面的ignoreBase为true效果一样
archive.directory('./resources')
archive.file('./package.json')
archive.finalize() // 完成压缩

archive.on('end', () => {
  // 压缩结束时触发
  console.log('压缩完成')
})

// // 插件打包 zip
// console.log('进行 zip ----')
// const { zip } = require('compressing')
// const { resolve } = require('path')
// const fs = require('fs')
// // 清空 zip 目录
// const zipDirs = fs.readdirSync('./zip')

// if (zipDirs && zipDirs.length > 0) {
//   console.log(zipDirs)
//   for (let index = 0; index < zipDirs.length; index++) {
//     const dir = zipDirs[index]
//     const dirPath = resolve(__dirname, 'dist/' + dir)
//     console.log('del ===', dirPath)
//     fs.unlinkSync(dirPath)
//   }
// }

// // 读取版本号
// const manifestJSon = fs.readFileSync('./package.json', 'utf-8')
// const mainTextObj = JSON.parse(manifestJSon)

// // 版本号
// const version = mainTextObj.version

// // 配置 zip 文件名
// const zipPath = `./dist/release-${new Date().getTime()}-${version}.zip`

// zip.compressDir(resolve('out/'), zipPath).then(compressDone).catch(handleError)

// // success ~
// function compressDone() {
//   console.log('zip success~~')
//   console.log('zip 包路径 == ', __dirname + zipPath)
// }

// function handleError(err) {
//   console.log(err)
// }
