/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_SERVICE_ACCOUNT: string
  readonly VITE_GOOGLE_DRIVE_FOLDER_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
