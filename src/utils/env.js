export function getAppEnvConfig() {
  const { VITE_APP_TITLE, VITE_GLOB_API_URL, VITE_PROXY_URL, VITE_PORT } = import.meta.env
  return {
    title: VITE_APP_TITLE || 'Nova Mall',
    apiUrl: VITE_GLOB_API_URL || '/api',
    proxyUrl: VITE_PROXY_URL || '',
    port: Number(VITE_PORT) || 5173,
  }
}
