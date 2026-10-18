import { mockNui } from './mock.ts'

const RESOURCE = 'st_finance'

export const sendNui = <T = unknown>(event: string, data: Record<string, unknown> = {}): Promise<T> => {
  if (import.meta.env.DEV) {
    return Promise.resolve(mockNui<T>(event, data))
  }
  return fetch(`https://${RESOURCE}/${event}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json() as Promise<T>)
}
