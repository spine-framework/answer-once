// Entry point for the CLI on Node < 22.
// Sets globalThis.WebSocket before any supabase-js module is imported,
// preventing the "Node.js 20 detected without native WebSocket" crash.
import { WebSocket } from 'ws'
if (typeof globalThis.WebSocket === 'undefined') {
  ;(globalThis as any).WebSocket = WebSocket
}

// Now import the real CLI — all supabase createClient() calls happen after this point
await import('../.framework/cli/index.ts')
