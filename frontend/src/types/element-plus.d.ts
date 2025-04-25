/// <reference types="element-plus/global" />

declare module 'element-plus' {
  export interface FormRules {
    [key: string]: FormItemRule | FormItemRule[]
  }

  export interface FormItemRule {
    required?: boolean
    message?: string
    trigger?: string | string[]
    min?: number
    max?: number
    type?: string
    validator?: (rule: any, value: any, callback: any) => void
  }

  export interface FormInstance {
    validate: () => Promise<boolean>
    resetFields: () => void
    clearValidate: (props?: string | string[]) => void
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
