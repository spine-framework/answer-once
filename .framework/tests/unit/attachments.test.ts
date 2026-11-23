import { describe, it, expect } from 'vitest'
import { sniffImageMime, stripGps, IMAGE_MIMES } from '../../functions/_shared/image-meta'
import {
  resolveFilePolicy, assertUploadAllowed, sanitizeFilename, DEFAULT_IMAGE_POLICY,
} from '../../functions/_shared/attachments'

declare const require: any
const piexif = require('piexifjs')

// Minimal valid 1x1 JPEG — enough for piexif marker surgery.
const JPEG_B64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACv/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AK//Z'

function jpegWithGps(): Uint8Array {
  const jpg = Buffer.from(JPEG_B64, 'base64').toString('binary')
  const exif = {
    '0th': { 315: 'TestCam' },
    'Exif': {},
    'GPS': { 0: [2, 3, 0, 0], 1: 'N', 2: [[37, 1], [46, 1], [30, 1]] },
    'Interop': {},
    '1st': {},
  }
  const withGps = piexif.insert(piexif.dump(exif), jpg)
  return new Uint8Array([...withGps].map((c: string) => c.charCodeAt(0) & 0xff))
}

function png(chunks: [string, number[]][]): Uint8Array {
  const out: number[] = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  for (const [type, data] of chunks) {
    const len = data.length
    out.push((len >>> 24) & 0xff, (len >>> 16) & 0xff, (len >>> 8) & 0xff, len & 0xff)
    for (const c of type) out.push(c.charCodeAt(0))
    out.push(...data)
    out.push(0, 0, 0, 0) // fake crc — we only test chunk-level surgery
  }
  return new Uint8Array(out)
}

function webp(chunks: [string, number[]][]): Uint8Array {
  const body: number[] = [0x57, 0x45, 0x42, 0x50] // WEBP
  for (const [type, data] of chunks) {
    for (const c of type) body.push(c.charCodeAt(0))
    const len = data.length
    body.push(len & 0xff, (len >> 8) & 0xff, (len >> 16) & 0xff, (len >>> 24) & 0xff)
    body.push(...data)
    if (len % 2) body.push(0)
  }
  const out = new Uint8Array(8 + body.length)
  out.set([0x52, 0x49, 0x46, 0x46]) // RIFF
  out[4] = body.length & 0xff
  out[5] = (body.length >> 8) & 0xff
  out[6] = (body.length >> 16) & 0xff
  out[7] = (body.length >>> 24) & 0xff
  out.set(body, 8)
  return out
}

describe('sniffImageMime', () => {
  it('detects jpeg, png, webp, gif from magic bytes', () => {
    expect(sniffImageMime(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0]))).toBe('image/jpeg')
    expect(sniffImageMime(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]))).toBe('image/png')
    expect(sniffImageMime(webp([['VP8 ', [1, 2, 3]]]))).toBe('image/webp')
    expect(sniffImageMime(new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]))).toBe('image/gif')
    expect(sniffImageMime(new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]))).toBe('image/gif')
  })

  it('rejects gif-like prefixes that are not GIF87a/89a', () => {
    // 'GIF8' alone is not a gif signature — the version bytes matter.
    expect(sniffImageMime(new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x30, 0x30]))).toBeNull()
    expect(sniffImageMime(new TextEncoder().encode('GIF89b' as any))).toBeNull()
  })

  it('rejects non-image bytes and spoofed content', () => {
    expect(sniffImageMime(new Uint8Array([0x50, 0x4b, 0x03, 0x04]))).toBeNull() // zip
    expect(sniffImageMime(new TextEncoder().encode('<svg xmlns="x"/>' as any))).toBeNull()
    expect(sniffImageMime(new Uint8Array([]))).toBeNull()
    expect(sniffImageMime(new Uint8Array([0xff, 0xd8]))).toBeNull() // truncated
  })
})

describe('stripGps', () => {
  it('removes GPS from jpeg while preserving other EXIF', () => {
    const src = jpegWithGps()
    const before = piexif.load([...src].map(b => String.fromCharCode(b)).join(''))
    expect(Object.keys(before.GPS).length).toBeGreaterThan(0)

    const out = stripGps('image/jpeg', src)
    const after = piexif.load([...out].map(b => String.fromCharCode(b)).join(''))
    expect(Object.keys(after.GPS)).toHaveLength(0)
    expect(after['0th'][315]).toBe('TestCam')
  })

  it('drops the eXIf chunk from png and keeps other chunks', () => {
    const src = png([['IHDR', [0, 0, 0, 1, 0, 0, 0, 1]], ['eXIf', [1, 2, 3]], ['IEND', []]])
    const out = stripGps('image/png', src)
    const s = [...out].map(b => String.fromCharCode(b)).join('')
    expect(s.includes('eXIf')).toBe(false)
    expect(s.includes('IHDR')).toBe(true)
    expect(s.includes('IEND')).toBe(true)
  })

  it('drops EXIF and XMP chunks from webp and fixes the RIFF size', () => {
    const src = webp([
      ['VP8X', [0x0c, 0, 0, 0, 0, 0, 0, 0, 0, 0]], // flags byte E|X set
      ['EXIF', [1, 2, 3, 4]],
      ['XMP ', [5, 6, 7]],
      ['VP8 ', [9, 9]],
    ])
    const out = stripGps('image/webp', src)
    const s = [...out].map(b => String.fromCharCode(b)).join('')
    expect(s.includes('EXIF')).toBe(false)
    expect(s.includes('XMP ')).toBe(false)
    expect(s.includes('VP8X')).toBe(true)
    // RIFF size = total - 8
    expect(out[4] | (out[5] << 8) | (out[6] << 16) | (out[7] << 24)).toBe(out.length - 8)
    // VP8X flags byte had E(0x08)+X(0x04) cleared
    const vp8xIdx = s.indexOf('VP8X')
    expect(out[vp8xIdx + 8] & 0x0c).toBe(0)
  })

  it('passes gif through unchanged', () => {
    const gif = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 1, 2])
    expect(stripGps('image/gif', gif)).toBe(gif)
  })
})

describe('resolveFilePolicy', () => {
  it('returns image defaults when file_policy is absent', () => {
    const p = resolveFilePolicy({})
    expect(p).toEqual(DEFAULT_IMAGE_POLICY)
    expect(p.strip_gps).toBe(true)
  })

  it('merges declared policy and clamps to image mimes', () => {
    const p = resolveFilePolicy({
      file_policy: {
        allowed_mime: ['image/png', 'text/html', 'image/svg+xml'],
        max_bytes: 5 * 1024 * 1024,
        visibility: ['private'],
        strip_gps: false,
      },
    })
    expect(p.allowed_mime).toEqual(['image/png'])
    expect(p.max_bytes).toBe(5 * 1024 * 1024)
    expect(p.visibility).toEqual(['private'])
    expect(p.strip_gps).toBe(false)
  })

  it('rejects a policy with no image mimes at all', () => {
    expect(() => resolveFilePolicy({ file_policy: { allowed_mime: ['application/pdf'] } }))
      .toThrow(/no supported image types/)
  })

  it('caps max_bytes at the bucket ceiling', () => {
    const p = resolveFilePolicy({ file_policy: { max_bytes: 500 * 1024 * 1024 } })
    expect(p.max_bytes).toBe(50 * 1024 * 1024)
  })
})

describe('assertUploadAllowed', () => {
  const policy = resolveFilePolicy({})

  it('accepts a declared jpeg under the limit', () => {
    expect(() => assertUploadAllowed(policy, { mime_type: 'image/jpeg', file_size: 1024 })).not.toThrow()
  })

  it('rejects undeclared or disallowed mime types', () => {
    expect(() => assertUploadAllowed(policy, { mime_type: 'application/pdf' })).toThrow(/not allowed/)
    expect(() => assertUploadAllowed(policy, { mime_type: 'image/svg+xml' })).toThrow(/not allowed/)
  })

  it('rejects oversize and non-positive sizes', () => {
    expect(() => assertUploadAllowed(policy, { mime_type: 'image/png', file_size: 20 * 1024 * 1024 })).toThrow(/exceeds/)
    expect(() => assertUploadAllowed(policy, { mime_type: 'image/png', file_size: 0 })).toThrow(/positive/)
  })

  it('rejects visibility outside the policy', () => {
    const p = resolveFilePolicy({ file_policy: { visibility: ['private'] } })
    expect(() => assertUploadAllowed(p, { mime_type: 'image/png', visibility: 'public' })).toThrow(/visibility/)
    expect(() => assertUploadAllowed(p, { mime_type: 'image/png', visibility: 'private' })).not.toThrow()
  })
})

describe('sanitizeFilename', () => {
  it('strips path components and unsafe characters', () => {
    expect(sanitizeFilename('../../etc/passwd')).toBe('passwd')
    expect(sanitizeFilename('..\\..\\win\\evil.png')).toBe('evil.png')
    expect(sanitizeFilename('my photo<>:|?.jpg')).toBe('my photo.jpg')
    expect(sanitizeFilename('')).toBe('image')
    expect(sanitizeFilename(undefined)).toBe('image')
  })

  it('caps filename length', () => {
    expect(sanitizeFilename('a'.repeat(500) + '.jpg').length).toBeLessThanOrEqual(120)
  })
})

describe('IMAGE_MIMES', () => {
  it('never includes svg — it is active content, not an image', () => {
    expect(IMAGE_MIMES.has('image/svg+xml')).toBe(false)
  })
})
