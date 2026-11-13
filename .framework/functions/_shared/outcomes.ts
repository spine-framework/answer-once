
import { CoreContext } from './middleware'
import { emitAudit } from './audit'



export async function emitOutcome(
  ctx: CoreContext,
  intent: string,
  result: 'success' | 'failure' | 'partial',
  metadata: Record<string, any> = {}
): Promise<void> {
  await emitAudit(ctx, intent, {
    type: 'outcome',
    account_id: ctx.accountId ?? undefined
  }, {
    result,
    ...metadata
  })
}
