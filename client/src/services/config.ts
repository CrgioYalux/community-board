export const ENV = {
  SECRET_KEY: import.meta.env.VITE_SECRET_KEY ?? "supersecret",
  COOKIE_STORAGE_KEY: import.meta.env.VITE_COOKIE_STORAGE_KEY ?? "cookie",
  LOCAL_STORAGE_KEY: import.meta.env.VITE_LOCAL_STORAGE_KEY ?? "local_storage",
  API_BASE_PATH:
    import.meta.env.VITE_API_BASE_PATH ?? "http://localhost:4000/api",
} as const;
