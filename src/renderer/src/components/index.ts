import SelectableBox from './SelectableBox/index.vue'
import WaterfallsFlow from './WaterfallsFlow/index.vue'
import IconFont from './IconFont.js'
import Versions from './Versions.vue'
import Weather from './Weather.vue'

export default {
  install(app) {
    app.component('SelectableBox', SelectableBox)
    app.component('WaterfallsFlow', WaterfallsFlow)
    app.component('IconFont', IconFont)
    app.component('Weather', Weather)
    app.component('Versions', Versions)
  }
}
