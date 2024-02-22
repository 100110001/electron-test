# electron-app

使用 Vue 和 TypeScript 的 Electron 应用程序

## 推荐的 IDE 设置

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

## 项目设置

### Install

```bash
$ pnpm install
```

### Development

```bash
$ pnpm dev
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```



## Main Process 模块

### BrowserWindow

- `title`string(可选) - 默认窗口标题 默认为`"Electron"`。 如果由`loadURL()`加载的HTML文件中含有标签`<title>`，此属性将被忽略。
- `resizable` boolean (可选) - 窗口大小是否可调整。 默认值为 `true`。

- `show` boolean (可选) - 窗口是否在创建时显示。 默认值为 `true`。

- `frame` boolean (可选) - 设置为 `false` 时可以创建一个[无边框窗口](https://www.electronjs.org/zh/docs/latest/tutorial/window-customization#create-frameless-windows) 默认值为 `true`。
- `hasShadow` boolean (可选) - 窗口是否有阴影. 默认值为 `true`。
- `transparent` boolean (可选) - 使窗口 [透明](https://www.electronjs.org/zh/docs/latest/tutorial/window-customization#create-transparent-windows)。 默认值为 `false`. 在Windows上，仅在无边框窗口下起作用。

- `autoHideMenuBar` boolean (可选) - 自动隐藏菜单栏，除非按了`Alt`键。 默认值为 `false`
- `titleBarStyle` string (可选) _macOS_ _Windows_ - 窗口标题栏样式。 默认值为 `default`. 可能的值有
  - `default` - 分别返回 macOS 或者 Windows 的标准标题栏
  - `hidden` - 在一个隐藏的标题栏和一个全尺寸大小的内容窗口中取得结果。 在 macOS 内, 窗口将一直拥有位于左上的标准窗口控制器 (“traffic lights”)。 在 Windows上，当与 `titleBarOverlay: true` 合并时，它将激活窗口控件叠加(详情请参阅 `titleBarOverlay`)，否则将不会显示窗口控件。
  - `hiddenInset` _macOS_ - 仅 macOS，隐藏标题栏，使用窗口边缘稍微小的红绿灯按钮替代。
  - `customButtonsOnHover` _macOS_ - 仅 macOS，隐藏的标题栏的全尺寸的内容窗口， 红绿灯按钮在鼠标悬停在窗口左上方时显示。 **注意:** 此选项目前是实验性的
- `titleBarOverlay` Object | Boolean (optional) - When using a frameless window in conjunction with `win.setWindowButtonVisibility(true)` on macOS or using a `titleBarStyle` so that the standard window controls ("traffic lights" on macOS) are visible, this property enables the Window Controls Overlay [JavaScript APIs](https://github.com/WICG/window-controls-overlay/blob/main/explainer.md#javascript-apis) and [CSS Environment Variables](https://github.com/WICG/window-controls-overlay/blob/main/explainer.md#css-environment-variables). 指定 `true` 将导致覆盖默认系统颜色。 默认值为 `false`
  - `color` String (可选) _Windows_ - 启用窗口控制时覆盖面的 CSS 颜色 默认是系统颜色。
  - `symbolColor` String (可选) _Windows_ - 启用时窗口控制中符号的 CSS 颜色 默认是系统颜色。
  - `height` Integer (可选) _macOS_ _Windows_ - 标题栏和 Window Controls Overlay，以像素为单位。 默认值为系统高度。

## [Channel Messaging API](https://developer.mozilla.org/zh-CN/docs/Web/API/Channel_Messaging_API)

**Channel Messaging API** 允许两个不同的脚本运行在同一个文档的不同浏览器上下文（比如两个 iframe，或者文档主体和一个 iframe，使用 [`SharedWorker`](https://developer.mozilla.org/zh-CN/docs/Web/API/SharedWorker) 的两个文档，或者两个 worker）来直接通讯，在每端使用一个端口（port）通过双向频道（channel）向彼此传递消息。

> **备注：** 此特性在 [Web Worker](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API) 中可用

使用 [`MessageChannel()`](https://developer.mozilla.org/zh-CN/docs/Web/API/MessageChannel/MessageChannel) 构造函数来创建通讯信道。一旦创建，信道的两个端口即可通过 [`MessageChannel.port1`](https://developer.mozilla.org/zh-CN/docs/Web/API/MessageChannel/port1) 和 [`MessageChannel.port2`](https://developer.mozilla.org/zh-CN/docs/Web/API/MessageChannel/port2) 属性进行访问（都会返回 [`MessagePort`](https://developer.mozilla.org/zh-CN/docs/Web/API/MessagePort) 对象）。创建信道的应用程序使用 `port1`，在另一端的程序使用 `port2`——你向 `port2` 发送信息，然后携带 2 个参数（需要传递的消息，要传递所有权的对象，在这里是 port 自身）调用 [`window.postMessage`](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage) 方法将端口信息传递到另一个浏览器上下文。当这些可传递的对象被传递后，他们就从之前所属的上下文中消失了。比如一个 port，一旦被发送，在原本的上下文中就再也不可用了。注意当前仅有 [`ArrayBuffer`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) 和 [`MessagePort`](https://developer.mozilla.org/zh-CN/docs/Web/API/MessagePort) 对象可以被发送。

另一个浏览器上下文可以使用 [`MessagePort.onmessage`](https://developer.mozilla.org/zh-CN/docs/Web/API/MessagePort/message_event) 监听信息，并使用事件的 `data` 属性获取消息内容。你可以通过 [`MessagePort.postMessage` (en-US)](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/postMessage) 向原来的文档发送应答消息。

当你想要停止通过信道发送消息时，你可以调用来关闭 [`MessagePort.close` (en-US)](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/close) 端口。

- [`MessageChannel`](https://developer.mozilla.org/zh-CN/docs/Web/API/MessageChannel) 创建一个新的发送消息的信道。
- [`MessagePort`](https://developer.mozilla.org/zh-CN/docs/Web/API/MessagePort) 控制消息信道的端口，允许从一个端口发送消息，并监听另一端消息的到来。

  - [`MessagePort.postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/postMessage) 从端口发送一条消息，并且可选是否将对象的所有权交给其他浏览器上下文。
  - [`MessagePort.start`](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/start) 开始发送该端口中的消息队列 (只有使用 [`EventTarget.addEventListener`](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener) 的时候才需要调用；当使用 [`MessagePort.onmessage`](https://developer.mozilla.org/zh-CN/docs/Web/API/MessagePort/message_event) 时，是默认开始的。)
  - [`MessagePort.close`](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/close) 断开端口连接，它将不再是激活状态。
  - [`MessagePort.onmessage`](https://developer.mozilla.org/zh-CN/docs/Web/API/MessagePort/message_event) 是一个 [`EventListener`](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener), 当类型为 `message` 的 [`MessageEvent`](https://developer.mozilla.org/zh-CN/docs/Web/API/MessageEvent) 在该端口触发时，它将会被调用 ── 也就是说，该端口收到了一条消息。
  - [`onmessageerror` (en-US)](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/messageerror_event) 是一个 [`EventListener`](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener), 当类型为 `MessageError` 的 [`MessageEvent`](https://developer.mozilla.org/zh-CN/docs/Web/API/MessageEvent) 被触发时，它将会被调用 ── 这意味着，端口收到了一条无法被反序列化的消息。

- [channel messaging 基本演示](https://github.com/mdn/dom-examples/tree/main/channel-messaging-basic)

- [多个消息演示](https://github.com/mdn/dom-examples/tree/main/channel-messaging-multimessage)

- [Using channel messaging](https://developer.mozilla.org/zh-CN/docs/Web/API/Channel_Messaging_API/Using_channel_messaging)





## 菜单和托盘

### 应用内菜单

[官方文档]: https://www.electronjs.org/zh/docs/latest/api/menu



```javascript
const { app, Menu } = require('electron')

const isMac = process.platform === 'darwin'

const template = [
  // { role: 'appMenu' }
  ...(isMac
    ? [{
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      }]
    : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac
        ? [
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' },
            { type: 'separator' },
            {
              label: 'Speech',
              submenu: [
                { role: 'startSpeaking' },
                { role: 'stopSpeaking' }
              ]
            }
          ]
        : [
            { role: 'delete' },
            { type: 'separator' },
            { role: 'selectAll' }
          ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac
        ? [
            { type: 'separator' },
            { role: 'front' },
            { type: 'separator' },
            { role: 'window' }
          ]
        : [
            { role: 'close' }
          ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://electronjs.org')
        }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
```



### 上下文菜单



[官方文档]: https://www.electronjs.org/zh/docs/latest/api/menu#%E6%B8%B2%E6%9F%93%E8%BF%9B%E7%A8%8B


要创建由渲染器启动的菜单，请通过 IPC 发送所需的信息到主过程，并让主过程代替渲染器显示菜单

```javascript
*// renderer*
window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  ipcRenderer.send('show-context-menu')
})

ipcRenderer.on('context-menu-command', (e, command) => {
  console.log(e, command)
})

*// main*
ipcMain.on('show-context-menu', (event) => {
  const template = [
    {
      label: 'Menu Item 1',
      click: () => { event.sender.send('context-menu-command', 'menu-item-1') }
    },
    { type: 'separator' },
    { label: 'Menu Item 2', type: 'checkbox', checked: true }
  ]
  const menu = Menu.buildFromTemplate(template)
  menu.popup({ window: BrowserWindow.fromWebContents(event.sender) })
})
```





### 托盘



[官方文档]: https://www.electronjs.org/zh/docs/latest/tutorial/tray

```javascript
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
```





## 无边框窗口

[官方文档]: https://www.electronjs.org/zh/docs/latest/tutorial/window-customization#%E5%88%9B%E5%BB%BA%E6%97%A0%E8%BE%B9%E6%A1%86%E7%AA%97%E5%8F%A3

要创建无边框窗口，需在 `BrowserWindow` 的构造中将 `frame` 参数设置为 `false`：

```js
// main
const { BrowserWindow } = require('electron')
const win = new BrowserWindow({ frame: false })
```



### 应用自定义标题栏样式

```js
const { BrowserWindow } = require('electron')
const win = new BrowserWindow({
  titleBarStyle: 'hidden',
  titleBarOverlay: {
    color: '#2a2a2b', // 背景色
    symbolColor: '#fff', // 按钮图标颜色
    height: 24
  }
})
win.show()
```

**无边框窗口仅能实现通用的样式，而且样式也比较奇怪：控制区域图标大小、间距无法修改，也没法内置其他的操作图标进去**

默认情况下, 无边框窗口是不可拖拽的。 应用程序需要在 CSS 中指定 `-webkit-app-region: drag` 来告诉 Electron 哪些区域是可拖拽的（如操作系统的标准标题栏），在可拖拽区域内部使用 `-webkit-app-region: no-drag` 则可以将其中部分区域排除。 请注意, 当前只支持矩形形状。

注意: `-webkit-app-region: drag `在开发人员工具打开时会出现问题。 查看更多信息 (包括变通方法), 请参见此 [GitHub 问题 ](https://github.com/electron/electron/issues/3647)。

要使整个窗口可拖拽, 您可以添加 `-webkit-app-region: drag` 作为 `body` 的样式:

```html
<body style="-webkit-app-region: drag"></body>
```

请注意，如果您使整个窗口都可拖拽，则必须将其中的按钮标记为不可拖拽，否则用户将无法点击它们：

```css
button {
  -webkit-app-region: no-drag;
}
```

如果只将自定义标题栏设置为可拖拽，还需要使标题栏中的所有按钮都不可拖拽。

### 自定义窗口标题栏

```js
// main
    new BrowserWindow({
      autoHideMenuBar: true,
      frame: true, // 无边框窗口
      titleBarStyle: 'hidden',// 无标题
      show: false,
    });

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
```

```html
// renderer
<a-layout-header class="layout-header">
  <div class="dragarea"></div>
  <div class="action_button" @click="action('minimize')"><icon-minus /></div>
  <div class="action_button" @click="action('maximize')"><icon-expand /></div>
  <div class="action_button action_button_close" @click="action('close')">
    <icon-close />
  </div>
</a-layout-header>

// js
const action = (type) => ipcRenderer.send('detach:service', ...args)
```

​	

### 提示：禁用文本选择

创建可拖拽区域时，拖拽行为可能与文本选择相冲突。 例如，当您拖动标题栏时，您可能不小心选中其中的文本。 为了避免这种情况，您需要在可拖拽区域中禁用文本选择，像这样：

```css
.titlebar {
  -webkit-user-select: none;
  -webkit-app-region: drag;
}
```





## 多线程

[官方文档]: https://www.electronjs.org/zh/docs/latest/tutorial/multithreading
[Electron-vite 导入 Worker Threads]: https://cn.electron-vite.org/guide/assets#%E5%AF%BC%E5%85%A5-worker-threads



需把`webPreferences`中的`nodeIntegrationInWorker`选项设置为`true`

```js
win = new BrowserWindow({
  webPreferences: {
    nodeIntegrationInWorker: true
  }
})
```

`nodeIntegrationInWorker` 可以独立于`nodeIntegration`使用，但`sandbox`必须不能设置为`true`

```js
// main
import createWorker from './worker?nodeWorker'
const myWorker = createWorker({ workerData: 'worker' })

myWorker.postMessage(data)
myWorker.on('message', (message) => {
  port.postMessage(message)
  port.close()
})
```

```js
// worker.js
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
  const result = [] as unknown[]
  files.forEach(function (file) {
    const data = fs.readFileSync(file)
    result.push('data:image/png;base64,' + data.toString('base64'))
  })
  port.postMessage(result)
})

```

