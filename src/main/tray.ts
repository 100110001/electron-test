import { Tray, Menu } from 'electron'
import favicon from '../../resources/favicon.ico?asset'

export default function createTray(win) {
  const tray = new Tray(favicon)
  const contextMenu = Menu.buildFromTemplate([
    { label: 'electron', enabled: false },
    { label: '退出', role: 'close' }
  ])
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    win.show()
  })
}
