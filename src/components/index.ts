import type { App } from 'vue'
import ArtDictCheckboxGroup from '@/components/core/forms/art-dict-checkbox-group/index.vue'
import ArtDictRadioGroup from '@/components/core/forms/art-dict-radio-group/index.vue'
import ArtDictSelect from '@/components/core/forms/art-dict-select/index.vue'

/**
 * 注册业务级全局组件
 */
export const setupGlobComponents = (app: App<Element>) => {
  app.component('ArtDictCheckboxGroup', ArtDictCheckboxGroup)
  app.component('ArtDictRadioGroup', ArtDictRadioGroup)
  app.component('ArtDictSelect', ArtDictSelect)
}
