/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_ETHEREUM_NETWORK: string
  readonly VITE_IPFS_GATEWAY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 