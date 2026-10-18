const RESOURCE = 'st_minigames'

export const sendNui = (event: string, data: Record<string, unknown> = {}): Promise<Response> =>
  fetch(`https://${RESOURCE}/${event}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch(() => new Response('{}'))
