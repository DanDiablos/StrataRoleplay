const RESOURCE = 'st_appearance'

export const sendNui = <T = unknown>(event: string, data: unknown = {}): Promise<T> => {
  if (import.meta.env.DEV) {
    console.log('[NUI]', event, data)
    return Promise.resolve(true as unknown as T)
  }
  return fetch(`https://${RESOURCE}/${event}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((r) => r.json() as Promise<T>)
}
