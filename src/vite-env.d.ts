/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Go API server base URL */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
