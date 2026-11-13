

import { useCurrentApp } from '../contexts/AppContext'

export function useAppPath(): (path: string) => string {
  const app = useCurrentApp()

  const prefix =
    !app.route_prefix || app.route_prefix === '/'
      ? ''
      : app.route_prefix.replace(/\/$/, '')

  return (path: string): string => {
    if (path === '/') return prefix || '/'
    const normalized = path.startsWith('/') ? path : `/${path}`
    return `${prefix}${normalized}`
  }
}