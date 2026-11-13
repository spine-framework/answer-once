
import { fetchFunction } from './db.js'


export async function kbSearch(_ctx: any, body: Record<string, any>): Promise<any> {
  return fetchFunction('kb', 'search', {}, body)
}


export async function kbIngest(_ctx: any, body: Record<string, any>): Promise<any> {
  return fetchFunction('kb', 'ingest', {}, body)
}


export async function kbReindex(_ctx: any, body: Record<string, any>): Promise<any> {
  return fetchFunction('kb', 'reindex', {}, body)
}


export async function kbRevoke(_ctx: any, body: Record<string, any>): Promise<any> {
  return fetchFunction('kb', 'revoke', {}, body)
}


export async function kbPublish(_ctx: any, body: Record<string, any>): Promise<any> {
  return fetchFunction('kb', 'publish', {}, body)
}
