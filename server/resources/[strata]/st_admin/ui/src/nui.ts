import { mockNui } from './mock.ts'

const RESOURCE = 'st_admin'

export const sendNui = <T = unknown>(event: string, data: Record<string, unknown> | number = {}): Promise<T> => {
  if (import.meta.env.DEV) {
    return Promise.resolve(mockNui<T>(event, data))
  }
  return fetch(`https://${RESOURCE}/${event}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((r) => r.json() as Promise<T>)
}

export const copyToClipboard = (text: string): void => {
  if (import.meta.env.DEV) {
    navigator.clipboard.writeText(text).catch(() => {})
    return
  }
  sendNui('CopyClipboard', { text })
}
