
export function buildRequest(_record: any, ctx: any) {
  const baseUrl = ctx?.integration?.config?.base_url || 'https://api.openai.com/v1'
  const endpoint = ctx?.actionConfig?.endpoint
  const apiKey = ctx?.apiKey?.value

  if (!endpoint) {
    throw new Error('OpenAI adapter requires action_config.endpoint')
  }
  if (!apiKey) {
    throw new Error('OpenAI adapter requires api_token credential')
  }

  return {
    url: `${baseUrl.replace(/\/$/, '')}${endpoint}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: ctx?.actionConfig?.body || {}
  }
}

