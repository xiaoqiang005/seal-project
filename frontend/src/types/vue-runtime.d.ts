import { DefineComponent } from 'vue'

declare module 'vue' {
  export interface ComponentCustomProperties {
    $message: typeof import('element-plus')['ElMessage']
    $confirm: typeof import('element-plus')['ElMessageBox']['confirm']
  }

  export interface ComponentCustomOptions {
    name?: string
    inheritAttrs?: boolean
  }

  export interface ComponentOptionsBase<
    Props = {},
    RawBindings = {},
    D = {},
    C extends ComputedOptions = {},
    M extends MethodOptions = {},
    Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
    Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
    E extends EmitsOptions = {},
    EE extends string = string,
    PP = Props,
    Props2 = Props
  > {
    name?: string
    inheritAttrs?: boolean
    props?: Props2
    emits?: E | EE[]
  }
} 