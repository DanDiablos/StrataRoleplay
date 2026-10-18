export const sendNui = (event: string, data: Record<string, unknown> = {}): Promise<Response | void> =>
  fetch(`https://st_chars/${event}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch(() => {})
