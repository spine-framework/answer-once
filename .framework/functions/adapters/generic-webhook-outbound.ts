


export function buildRequest(_record: any, ctx: any) {
  const url = ctx?.actionConfig?.url
  const method = ctx?.actionConfig?.method || 'POST'
  const body = ctx?.actionConfig?.body
  const apiKey = ctx?.apiKey?.value

  if (!url) {
    throw new Error('generic-webhook-outbound adapter requires actionConfig.url')
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(ctx?.actionConfig?.headers || {})
  }
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`
  }

  return {
    url,
    method,
    headers,
    body
  }
}
