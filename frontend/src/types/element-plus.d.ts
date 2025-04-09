/// <reference types="element-plus/global" />

declare module 'element-plus/global' {
  export {}
}

declare module 'element-plus' {
  export interface FormInstance {
    validate: (callback?: (valid: boolean) => void) => Promise<boolean>
    resetFields: () => void
    clearValidate: (props?: string | string[]) => void
  }

  export interface FormRuleItem {
    required?: boolean
    message?: string
    trigger?: string | string[]
    min?: number
    max?: number
    type?: string
    validator?: (rule: any, value: any, callback: any) => void
  }

  export interface FormRules {
    [key: string]: {
      required?: boolean
      message?: string
      trigger?: string | string[]
      validator?: (rule: any, value: any, callback: any) => void
    }[]
  }

  export interface ElFormContext {
    model: Record<string, any>
    rules: FormRules
    labelPosition?: string
    labelWidth?: string | number
    labelSuffix?: string
    inline?: boolean
    inlineMessage?: boolean
    statusIcon?: boolean
    showMessage?: boolean
    size?: string
    disabled?: boolean
    validateOnRuleChange?: boolean
    hideRequiredAsterisk?: boolean
  }
}

export {} 
