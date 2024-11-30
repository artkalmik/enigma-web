/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from '@vue/runtime-core'
  const component: DefineComponent
  export default component
}

export {} 