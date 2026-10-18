export const sendNui = (event: string, data: Record<string, unknown> = {}): Promise<Response> =>
  fetch(`https://st_menu/${event}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
