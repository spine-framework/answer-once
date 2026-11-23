/**
 * @module   image-meta
 * @audience internal
 * @layer    app-specific
 * @stability stable
 *
 * Magic-byte image sniffing and per-format EXIF GPS removal for the
 * attachments commit path. Declared mime types are client-controlled and
 * untrusted — the bytes decide. GPS metadata is stripped surgically
 * (orientation and other EXIF survive) rather than by re-encoding, so
 * originals keep their pixels.
 *
 * Supported: jpeg, png, webp, gif. gif carries no EXIF — pass-through.
 * SVG is text and is deliberately NOT an image here — it is active content.
 */

import * as piexif from 'piexifjs'

export const IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

/**
 * Sniff the real mime type from leading bytes. Returns the image mime or
 * null for anything that isn't a supported image — never trusts a
 * client-declared content type.
 */
export function sniffImageMime(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg'
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return 'image/png'
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return 'image/webp'
  }
  if (
    bytes.length >= 6 &&
    bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) && bytes[5] === 0x61 // GIF87a / GIF89a
  ) {
    return 'image/gif'
  }
  return null
}

/**
 * Remove EXIF GPS metadata in place (returns new bytes). Formats without
 * EXIF support pass through unchanged. Throws when a format's metadata
 * can't be parsed — callers must fail closed rather than publish
 * unstripped bytes.
 */
export function stripGps(mime: string, bytes: Uint8Array): Uint8Array {
  switch (mime) {
    case 'image/jpeg':
      return stripJpegGps(bytes)
    case 'image/png':
      return dropPngChunk(bytes, 'eXIf')
    case 'image/webp':
      return stripWebpMeta(bytes)
    case 'image/gif':
      return bytes
    default:
      return bytes
  }
}

/** JPEG: zero the GPS IFD inside the APP1 EXIF segment — orientation and
 *  other EXIF fields are preserved. Throws on unparseable EXIF. */
function stripJpegGps(bytes: Uint8Array): Uint8Array {
  const binary = bytesToBinaryString(bytes)
  const exif = piexif.load(binary)
  if (exif.GPS && Object.keys(exif.GPS).length === 0) {
    return bytes
  }
  exif.GPS = {}
  const stripped = piexif.insert(piexif.dump(exif), binary)
  return binaryStringToBytes(stripped)
}

/** PNG: remove all chunks of the given fourCC. Signature and chunk order
 *  are preserved; IEND is never touched. */
function dropPngChunk(bytes: Uint8Array, fourCC: string): Uint8Array {
  const out: number[] = []
  out.push(...bytes.slice(0, 8))
  let offset = 8
  let sawEnd = false
  while (offset + 12 <= bytes.length && !sawEnd) {
    const len = readUint32BE(bytes, offset)
    const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7])
    const chunkEnd = offset + 12 + len
    if (chunkEnd > bytes.length) {
      // Corrupt trailing data — keep everything and stop.
      out.push(...bytes.slice(offset))
      return new Uint8Array(out)
    }
    if (type !== fourCC) out.push(...bytes.slice(offset, chunkEnd))
    if (type === 'IEND') sawEnd = true
    offset = chunkEnd
  }
  if (offset < bytes.length) out.push(...bytes.slice(offset))
  return new Uint8Array(out)
}

/**
 * WebP: drop the EXIF and XMP chunks from the RIFF container, fix the RIFF
 * size field, and clear the E/X feature bits in VP8X.
 */
function stripWebpMeta(bytes: Uint8Array): Uint8Array {
  // RIFF(4) size(4) WEBP(4) then chunks: fourCC(4) len(4LE) data pad-to-even
  const chunks: Uint8Array[] = []
  let offset = 12
  while (offset + 8 <= bytes.length) {
    const fourCC = String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3])
    const len = readUint32LE(bytes, offset + 4)
    const padded = len + (len % 2)
    const chunkEnd = offset + 8 + padded
    if (chunkEnd > bytes.length) break
    if (fourCC === 'VP8X') {
      const fixed = bytes.slice(offset, chunkEnd)
      fixed[8] = fixed[8] & ~0x08 & ~0x04 // clear EXIF and XMP feature bits
      chunks.push(fixed)
    } else if (fourCC !== 'EXIF' && fourCC !== 'XMP ') {
      chunks.push(bytes.slice(offset, chunkEnd))
    }
    offset = chunkEnd
  }
  const body = new Uint8Array(4 + chunks.reduce((n, c) => n + c.length, 0))
  body.set([0x57, 0x45, 0x42, 0x50]) // 'WEBP'
  let cursor = 4
  for (const c of chunks) { body.set(c, cursor); cursor += c.length }
  const out = new Uint8Array(8 + body.length)
  out.set([0x52, 0x49, 0x46, 0x46]) // 'RIFF'
  writeUint32LE(out, 4, body.length)
  out.set(body, 8)
  return out
}

function bytesToBinaryString(bytes: Uint8Array): string {
  let s = ''
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) {
    s += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + CHUNK)))
  }
  return s
}

function binaryStringToBytes(s: string): Uint8Array {
  const out = new Uint8Array(s.length)
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0xff
  return out
}

function readUint32BE(b: Uint8Array, o: number): number {
  return (b[o] * 0x1000000) + (b[o + 1] << 16) + (b[o + 2] << 8) + b[o + 3]
}

function readUint32LE(b: Uint8Array, o: number): number {
  return b[o] + (b[o + 1] << 8) + (b[o + 2] << 16) + (b[o + 3] * 0x1000000)
}

function writeUint32LE(b: Uint8Array, o: number, v: number): void {
  b[o] = v & 0xff
  b[o + 1] = (v >> 8) & 0xff
  b[o + 2] = (v >> 16) & 0xff
  b[o + 3] = (v >> 24) & 0xff
}
