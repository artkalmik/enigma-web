/// <reference types="vite/client" />

declare module '*.vue' {
  import type { ComponentOptions } from '@vue/runtime-core'
  const component: ComponentOptions
  export default component
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $style: { [key: string]: string }
  }
} 