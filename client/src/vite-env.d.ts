/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_PATH?: string;
  readonly VITE_LOCAL_STORAGE_KEY?: string;
  readonly VITE_COOKIE_STORAGE_KEY?: string;
  readonly VITE_SECRET_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
