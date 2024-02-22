import { defineStore } from 'pinia'
import { store } from '@renderer/store'

export const useAppStore = defineStore({
  id: 'app',
  state: () => ({
    configuration: {}
  }),
  getters: {
    getConfiguration() {
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
