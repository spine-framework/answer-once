// Outbound requires a tenant-scoped integrations row for the calling account carrying config.scenarios.<scenario_key>.url + credentials.api_token (sent as x-make-apikey). If no tenant row exists for ctx.accountId, execute() falls back to the global 'make' integration whose scenarios={} ships empty — surfacing here as 'no scenarios.<key>' rather than a lookup failure. Check webhook_deliveries.integration_id to see which row was used.
// End-to-end trace for a failed outbound: webhook_deliveries row (status/last_error/integration_id/account_id) then logs events 'integration.outbound.started|succeeded|error|failed_http' keyed by delivery_id.
/**
 * @module   make-outbound
 * @responsibility Build the outbound request for the Make.com integration —
 * resolves the scenario webhook URL from integration config, attaches
 * Make's x-make-apikey auth header from the resolved credential, and wraps
 * the payload in a stable envelope Make scenarios can key on.
 *
 * URL resolution order: integration.config.scenarios[actionConfig.scenario_key].url
 * → integration.config.webhook_url → actionConfig.url (last resort, discouraged:
 * webhook URLs are bearer-capability URLs and belong in integration config).
 */

export function buildRequest(record: any, ctx: any) {
  const actionConfig = ctx?.actionConfig || {}
  const integrationConfig = ctx?.integration?.config || {}
  const scenarioKey = actionConfig.scenario_key
  const scenarios = integrationConfig.scenarios || {}
  const scenario = scenarioKey ? scenarios[scenarioKey] : null
  if (scenarioKey && !scenario) {
    throw new Error(`make-outbound: no scenarios.${scenarioKey} entry in integration config`)
  }
  const url = scenario?.url || integrationConfig.webhook_url || actionConfig.url
  if (!url) {
    throw new Error('make-outbound adapter requires integration.config.scenarios[scenario_key].url, config.webhook_url, or actionConfig.url')
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(actionConfig.headers || {})
  }
  const apiKey = ctx?.apiKey?.value
  if (apiKey) {
    headers['x-make-apikey'] = apiKey
  }

  const body = actionConfig.body ?? {
    event: actionConfig.event || 'directive_matched',
    occurred_at: new Date().toISOString(),
    account_id: ctx?.accountId || null,
    app_id: ctx?.appId || null,
    scenario: scenarioKey || null,
    record
  }

  return {
    url,
    method: actionConfig.method || 'POST',
    headers,
    body
  }
}
