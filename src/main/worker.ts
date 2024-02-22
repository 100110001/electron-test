import { parentPort } from 'worker_threads'
import fs from 'fs'

const port = parentPort
if (!port) throw new Error('IllegalState')

/**
 * readAndConvertImageToBase64
 * 读取图片将其转化为base64
 * @param {Array} files 图片路径
 */
port.on('message', (files) => {
  const result = [] as any[]
  files.forEach(function (file) {
    const data = fs.readFileSync(file)
    result.push('data:image/png;base64,' + data.toString('base64'))
  })
  port.postMessage(result)
})
