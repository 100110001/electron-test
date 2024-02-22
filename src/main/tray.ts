import { Tray, Menu, BrowserWindow } from 'electron'
import favicon from '../../resources/favicon.ico?asset'

export default function createTray(win: BrowserWindow) {
  const tray = new Tray(favicon)

  const isMac = process.platform === 'darwin'

  const contextMenu = Menu.buildFromTemplate([
    { label: 'electron', enabled: false },
    { label: '退出', role: isMac ? 'close' : 'quit' }
  ])
  // 工具提示和标题
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    win.show()
  })
}
