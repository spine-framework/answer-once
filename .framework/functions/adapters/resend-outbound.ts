// Resend outbound adapter — maps a composed email in actionConfig to the
// Resend /emails API. `from` resolves actionConfig.from -> integration.config.from
// -> EMAIL_FROM env -> Resend's shared onboarding sender, so a fresh install
// delivers test mail before the customer verifies their own domain.

export function buildRequest(_record: any, ctx: any) {
  const apiKey = ctx?.apiKey?.value
  const a = ctx?.actionConfig || {}
  const to = Array.isArray(a.to) ? a.to : a.to ? [a.to] : []

  if (!to.length) {
    throw new Error('resend-outbound adapter requires actionConfig.to')
  }
  if (!a.subject) {
    throw new Error('resend-outbound adapter requires actionConfig.subject')
  }
  if (!apiKey) {
    throw new Error('resend-outbound adapter requires api_token credential')
  }

  const from =
    a.from ||
    ctx?.integration?.config?.from ||
    process.env.EMAIL_FROM ||
    'onboarding@resend.dev'

  const body: Record<string, any> = {
    from,
    to,
    subject: a.subject,
    ...(a.html ? { html: a.html } : { text: a.text || '' }),
  }
  if (a.reply_to) body.reply_to = a.reply_to

  return {
    url: ctx?.integration?.config?.api_url || 'https://api.resend.com/emails',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body,
  }
}
