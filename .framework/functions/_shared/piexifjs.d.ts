// piexifjs ships no types — minimal surface used by image-meta.ts.
declare module 'piexifjs' {
  export function load(data: string): any
  export function dump(exifObj: any): any
  export function insert(exifBytes: any, data: string): string
}
