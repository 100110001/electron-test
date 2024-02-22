import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('electronAPI', {
      openFile: () => ipcRenderer.invoke('dialog:openFile'),
      saveFile: (...args) => ipcRenderer.invoke('dialog:saveFile', ...args),

      setConfiguration: (value) => ipcRenderer.invoke('set-configuration', value),
      getConfiguration: (callback) =>
        ipcRenderer.on('get-configuration', (_event, value) => callback(value)),

      getFileData: (data, callback) => {
        const channel = new MessageChannel()
        const port1 = channel.port1
        const port2 = channel.port2 as any

        port2.postMessage(data)
        port2.onmessage = (event) => {
          callback(event.data)
        }
        port2.onclose = () => {
          // console.log('stream ended')
        }

        ipcRenderer.postMessage('give-me-a-stream', null, [port1])
      },

      service: (...args) => ipcRenderer.send('detach:service', ...args)
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
