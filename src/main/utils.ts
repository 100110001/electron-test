import { dialog } from 'electron'
import XLSX from 'xlsx'

export async function handleFileSave(_event, header, body) {
  // console.log('handleFileSave', event, header, body)
  // https://juejin.cn/post/7065126114238136356#heading-7
  const format = 'xlsx'

  dialog
    .showSaveDialog({
      title: '保持文件',
      defaultPath: '帮战数据.xlsx',
      filters: [{ name: 'All Files', extensions: [format] }]
    })
    .then((res: any) => {
      // 表头数据：官方文档中的描述：converts an array of arrays of JS data to a worksheet.
      const headerWs = XLSX.utils.aoa_to_sheet(header)
      // console.log(JSON.stringify(body) );

      // 定义 worksheet 的格式
      const ws = XLSX.utils.sheet_add_json(headerWs, body, {
        skipHeader: true,
        origin: 'A2'
      })

      /* 新建空workbook，然后加入worksheet */
      const wb = XLSX.utils.book_new()

      // 往 workbook 中加入worksheet，可以自定义下载之后的sheetname
      XLSX.utils.book_append_sheet(wb, ws, 'sheetName')

      XLSX.writeFile(wb, res.filePath, {
        bookType: format, // Type of Workbook, default "xlsx"
        bookSST: true // Generate Shared String Table **, default false
      })
    })
}

export async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['multiSelections'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
      { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] },
      { name: 'Custom File Type', extensions: ['as'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  if (!canceled) {
    return filePaths
  }
  return
}
