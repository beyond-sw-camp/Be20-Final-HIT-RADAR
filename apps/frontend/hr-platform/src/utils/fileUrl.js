const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const fileBaseUrl = import.meta.env.VITE_FILE_BASE_URL || apiBaseUrl

export function resolveFileUrl(url) {
  if (!url) return url
  if (url.startsWith('http') || url.startsWith('data:')) return url
  if (!fileBaseUrl) return url
  const base = fileBaseUrl.endsWith('/') ? fileBaseUrl.slice(0, -1) : fileBaseUrl
  const clean = url.startsWith('/') ? url : `/${url}`
  return `${base}${clean}`
}
