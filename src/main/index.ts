import { app, shell, BrowserWindow, ipcMain, nativeTheme, Menu } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'
import path from 'path'
import lodash from 'lodash'

import createTray from './tray'

// import installExtension, { VUEJS_DEVTOOLS, VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import configFilePath from '../../resources/config.json?commonjs-external&asset'
import createWorker from './worker?nodeWorker'
import icon from '../../resources/icon.png?asset'
import { handleFileSave, handleFileOpen } from './utils'

const myWorker = createWorker({ workerData: 'worker' })

let mainWindow
let defaultConfig

function createWindow() {
  const readResult = fs.readFileSync(configFilePath, 'utf8')
  defaultConfig = JSON.parse(readResult)

  // 创建浏览器窗口。
  mainWindow = new BrowserWindow({
    ...defaultConfig.browserWindow,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      devToolsExtensions: true, // 允许加载 Chrome 扩展
      nodeIntegration: true, // 启用 Node.js 集成
      nodeIntegrationInWorker: true
    }
  })

  nativeTheme.themeSource = defaultConfig.nativeTheme.themeSource

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 基于 electron-vite cli 的渲染器热模块替换（HMR）。
  // 在开发中加载远程URL，生产中加载本地HTML文件。
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
  mainWindow.webContents.openDevTools({ mode: 'right' })

  createTray(mainWindow)

  console.log('Hello from Electron 👋👋👋')
  ipcMain.handle('dialog:openFile', handleFileOpen)
  ipcMain.handle('dialog:saveFile', handleFileSave)
  ipcMain.handle('set-configuration', (_event, data) => {
    defaultConfig = lodash.merge(defaultConfig, data)

    nativeTheme.themeSource = defaultConfig.nativeTheme.themeSource

    defaultConfig = lodash.merge(defaultConfig, {
      nativeTheme: {
        themeSource: nativeTheme.themeSource,
        shouldUseDarkColors: nativeTheme.shouldUseDarkColors
      }
    })
    if (data) {
      fs.writeFile(configFilePath, JSON.stringify(defaultConfig), (e) => {
        console.log('fs.writeFile', e)
      })
    }

    mainWindow.webContents.send('get-configuration', defaultConfig)

    return defaultConfig
  })
  ipcMain.on('give-me-a-stream', (event) => {
    // 当我们在主进程中接收到 MessagePort 对象, 它就成为了 MessagePortMain.
    const port = event.ports[0]
    // MessagePortMain 使用了 Node.js 风格的事件 API, 而不是
    // web 风格的事件 API. 因此使用 .on('message', ...) 而不是 .onmessage = ...
    port.on('message', (event) => {
      const { data } = event
      myWorker.postMessage(data)
      myWorker.on('message', (message) => {
        port.postMessage(message)
        port.close()
      })
    })

    // MessagePortMain 阻塞消息直到 .start() 方法被调用
    port.start()
  })
  ipcMain.on('detach:service', async (_event, { type }) => {
    const operation = {
      minimize: () => {
        mainWindow.focus()
        mainWindow.minimize()
      },
      maximize: () => {
        mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
      },
      close: () => {
        mainWindow.close()
      }
    }
    operation[type]()
  })
  ipcMain.on('show-context-menu', (event) => {
    const template = [
      {
        label: 'Menu Item 1',
        click: () => {
          event.sender.send('context-menu-command', 'menu-item-1')
        }
      },
      { type: 'separator' },
      { label: 'Menu Item 2', type: 'checkbox', checked: true }
    ]
    const menu = Menu.buildFromTemplate(template)
    menu.popup({ window: BrowserWindow.fromWebContents(event.sender) })
  })
}

// 当Electron完成初始化并准备创建浏览器窗口时，将调用此方法。某些API只能在此事件发生后使用。
app
  .whenReady()
  .then(() => {
    // installExtension('nhdogjmejiglipccpnnnanhbledajbpd')
    //   .then((name) => console.log(`Added Extension:  ${name}`))
    //   .catch((err) => console.log('An error occurred: ', err))

    // 为Windows设置应用用户模型ID
    electronApp.setAppUserModelId('com.electron')

    // 在开发中通过按下F12默认打开或关闭开发者工具，而在生产环境中忽略CommandOrControl + R的快捷键。
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })
  })
  .then(() => {
    createWindow()
  })
  .then(() => {
    mainWindow.on('ready-to-show', () => {
      mainWindow.webContents.send('get-configuration', defaultConfig)
    })
  })
  .then(() => {
    app.on('activate', function () {
      // 在macOS上，当点击dock图标且没有其他窗口打开时，重新创建应用程序中的窗口是一种常见做法。
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    // 在窗口关闭时终止 Python 服务
    app.on('before-quit', () => {})
  })

// 在所有窗关闭时退出应用，除了macOS系统。在macOS上，应用和菜单栏通常会保持活跃状态，直到用户使用Cmd + Q 明确退出应用。
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 在这个文件中，你可以包括应用程序特定的主进程代码的其余部分。你也可以把它们放在单独的文件中，并在此处引用它们。
