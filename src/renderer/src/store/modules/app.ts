import { defineStore } from 'pinia'
import { store } from '@renderer/store'

interface AppState {
  configuration: object
}

export const useAppStore = defineStore({
  id: 'app',
  state: (): AppState => ({
    configuration: {}
  }),
  getters: {
    getConfiguration(): object {
      return this.configuration
    }
  },
  actions: {
    setConfiguration(data) {
      this.configuration = data
    }
  }
})

// Need to be used outside the setup
export function useAppStoreWithOut() {
  return useAppStore(store)
}
