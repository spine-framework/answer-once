import { createHandler } from './_shared/middleware'
import { kbIngest, kbPublish, kbRevoke, kbReindex, kbSearch } from './_shared/kb'

export const handler = createHandler(async (ctx, body) => {
  const action = ctx.query?.action || 'search'

  switch (action) {
    case 'ingest':
      return await kbIngest(ctx, body)
    case 'revoke':
      return await kbRevoke(ctx, body)
    case 'reindex':
      return await kbReindex(ctx, body)
    case 'search':
      return await kbSearch(ctx, body)
    case 'publish':
      return await kbPublish(ctx, body)
    default:
      throw new Error(`unknown kb action: ${action}`)
  }
})
