import type { App } from 'vue'
import ArtDictTag from '@/components/core/display/art-dict-tag/index.vue'
import ArtDictCheckboxGroup from '@/components/core/forms/art-dict-checkbox-group/index.vue'
import ArtDictRadioGroup from '@/components/core/forms/art-dict-radio-group/index.vue'
import ArtDictSelect from '@/components/core/forms/art-dict-select/index.vue'

/**
 * 注册业务级全局组件
 */
export const setupGlobComponents = (app: App<Element>) => {
  app.component('ArtDictTag', ArtDictTag)
  app.component('ArtDictCheckboxGroup', ArtDictCheckboxGroup)
  app.component('ArtDictRadioGroup', ArtDictRadioGroup)
  app.component('ArtDictSelect', ArtDictSelect)
}
