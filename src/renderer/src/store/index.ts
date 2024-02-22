import { createPinia } from 'pinia'

const store = createPinia()

export function setupStore(app) {
  app.use(store)
  import.meta.env.DEV &&
    console.log(
      '%c[pinia] Initialization %c',
      'background:#ffd859; color:#000000; padding: 1px 4px; border-radius: 3px;',
      ''
    )
}

export { store }
