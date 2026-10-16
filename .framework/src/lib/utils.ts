// CIL[BEGIN stable_id="~/.framework/src/lib/utils.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/lib/utils.ts"]
// CIL[DOC-MACRO purpose="Shared utility module for formatting, string manipulation, and common helpers used across the framework UI"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide reusable, framework-wide helper functions and import the required styling dependencies"]
// CIL[DOC-CONTEXT module="utils" layer="lib" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="imports tailwind styling utilities on load"]
// CIL[DOC-MICRO logic_summary="Imports clsx and tailwind-merge for the cn helper; exports formatting and utility functions" notable_decisions="cn uses twMerge(clsx(inputs))"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="framework components, pages, and hooks"]
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
// CIL[DOC-VECTOR type="context" content="purpose='Shared utility module for formatting, string manipulation, and common helpers used across the framework UI'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/utils.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/lib/utils.ts:cn:function" type="function" identity="cn" parent="~/.framework/src/lib/utils.ts"]
// CIL[DOC-MACRO purpose="Compose and merge Tailwind CSS classes"]
// CIL[DOC-RESPONSIBILITY responsibility="Combine multiple class values, resolving tailwind conflicts"]
// CIL[DOC-CONTEXT module="utils" layer="lib" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...inputs: ClassValue[]" outputs="string merged className" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Merges the rest parameter ...inputs using twMerge(clsx(inputs))" notable_decisions="Uses clsx for conditional class joining and tailwind-merge for de-duplication"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// CIL[DOC-VECTOR type="context" content="purpose='Compose and merge Tailwind CSS classes'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/utils.ts:cn:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/utils.ts:formatDate:function" type="function" identity="formatDate" parent="~/.framework/src/lib/utils.ts"]
// CIL[DOC-MACRO purpose="Format a date value as a readable date string"]
// CIL[DOC-RESPONSIBILITY responsibility="Convert an optional date string or Date to a formatted en-US date or a placeholder"]
// CIL[DOC-CONTEXT module="utils" layer="lib" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="date: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions" outputs="string (formatted date, 'N/A', or 'Invalid Date')" errors="Unparseable dates return 'Invalid Date'" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Parses strings to Date, validates the timestamp, and formats to en-US" notable_decisions="Returns 'N/A' for missing values and 'Invalid Date' for unparseable values"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function formatDate(date: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!date) return 'N/A'

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (!dateObj || isNaN(dateObj.getTime())) return 'Invalid Date'

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  })
}
// CIL[DOC-VECTOR type="context" content="purpose='Format a date value as a readable date string'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/utils.ts:formatDate:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/utils.ts:formatTime:function" type="function" identity="formatTime" parent="~/.framework/src/lib/utils.ts"]
// CIL[DOC-MACRO purpose="Format a date value as a readable time string"]
// CIL[DOC-RESPONSIBILITY responsibility="Convert an optional date string or Date to a formatted en-US time or a placeholder"]
// CIL[DOC-CONTEXT module="utils" layer="lib" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="date: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions" outputs="string (formatted time, 'N/A', or 'Invalid Date')" errors="Unparseable dates return 'Invalid Date'" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Parses strings to Date, validates the timestamp, and formats the time portion to en-US" notable_decisions="Returns 'N/A' for missing values and 'Invalid Date' for unparseable values"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function formatTime(date: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!date) return 'N/A'

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (!dateObj || isNaN(dateObj.getTime())) return 'Invalid Date'

  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  })
}
// CIL[DOC-VECTOR type="context" content="purpose='Format a date value as a readable time string'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/utils.ts:formatTime:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/utils.ts:formatDateTime:function" type="function" identity="formatDateTime" parent="~/.framework/src/lib/utils.ts"]
// CIL[DOC-MACRO purpose="Format a date value as a combined date and time string"]
// CIL[DOC-RESPONSIBILITY responsibility="Convert an optional date string or Date to a formatted en-US date-time or a placeholder"]
// CIL[DOC-CONTEXT module="utils" layer="lib" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="date: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions" outputs="string (formatted date-time, 'N/A', or 'Invalid Date')" errors="Unparseable dates return 'Invalid Date'" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Parses strings to Date, validates the timestamp, and formats both date and time to en-US" notable_decisions="Returns 'N/A' for missing values and 'Invalid Date' for unparseable values"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function formatDateTime(date: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!date) return 'N/A'

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (!dateObj || isNaN(dateObj.getTime())) return 'Invalid Date'

  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  })
}
// CIL[DOC-VECTOR type="context" content="purpose='Format a date value as a combined date and time string'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/utils.ts:formatDateTime:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/utils.ts:formatRelativeTime:function" type="function" identity="formatRelativeTime" parent="~/.framework/src/lib/utils.ts"]
// CIL[DOC-MACRO purpose="Return a human-friendly relative time description"]
// CIL[DOC-RESPONSIBILITY responsibility="Convert an optional date string or Date to a relative phrase like 'just now' or 'X days ago'"]
// CIL[DOC-CONTEXT module="utils" layer="lib" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="date: string | Date | null | undefined" outputs="string (relative time, 'N/A', or 'Invalid Date')" errors="Unparseable dates return 'Invalid Date'" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Computes the difference from now and selects a human-readable bucket" notable_decisions="Falls back to formatDate for anything older than one week"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function formatRelativeTime(date: string | Date | null | undefined) {
  if (!date) return 'N/A'

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) return 'Invalid Date'

  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) {
    return 'just now'
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  } else {
    return formatDate(dateObj)
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Return a human-friendly relative time description'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/utils.ts:formatRelativeTime:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/utils.ts:formatFileSize:function" type="function" identity="formatFileSize" parent="~/.framework/src/lib/utils.ts"]
// CIL[DOC-MACRO purpose="Convert a byte count to a human-readable file size"]
// CIL[DOC-RESPONSIBILITY responsibility="Compute the largest unit that fits the byte value and format it with fixed decimals"]
// CIL[DOC-CONTEXT module="utils" layer="lib" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="bytes: number, decimals: number = 2" outputs="string with value and unit" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Determines the appropriate binary unit and formats to fixed decimal places" notable_decisions="Uses 1024 base and returns '0 Bytes' for zero"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function formatFileSize(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
// CIL[DOC-VECTOR type="context" content="purpose='Convert a byte count to a human-readable file size'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/utils.ts:formatFileSize:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/utils.ts:formatCurrency:function" type="function" identity="formatCurrency" parent="~/.framework/src/lib/utils.ts"]
// CIL[DOC-MACRO purpose="Format a numeric amount as a localized currency string"]
// CIL[DOC-RESPONSIBILITY responsibility="Use Intl.NumberFormat to render a value with a currency code and locale"]
// CIL[DOC-CONTEXT module="utils" layer="lib" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="amount: number, currency: string = 'USD', locale: string = 'en-US'" outputs="formatted currency string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Constructs an Intl.NumberFormat with currency style and formats the amount" notable_decisions="Defaults to USD and en-US"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}
// CIL[DOC-VECTOR type="context" content="purpose='Format a numeric amount as a localized currency string'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/utils.ts:formatCurrency:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/utils.ts:formatNumber:function" type="function" identity="formatNumber" parent="~/.framework/src/lib/utils.ts"]
// CIL[DOC-MACRO purpose="Format a number using locale-aware formatting rules"]
// CIL[DOC-RESPONSIBILITY responsibility="Apply en-US number formatting with optional Intl.NumberFormat options"]
// CIL[DOC-CONTEXT module="utils" layer="lib" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="num: number, options?: Intl.NumberFormatOptions" outputs="formatted number string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Calls Intl.NumberFormat with the provided options" notable_decisions="Defaults to en-US"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function formatNumber(num: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat('en-US', options).format(num)
}
// CIL[DOC-VECTOR type="context" content="purpose='Format a number using locale-aware formatting rules'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/utils.ts:formatNumber:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/utils.ts:truncateText:function" type="function" identity="truncateText" parent="~/.framework/src/lib/utils.ts"]
// CIL[DOC-MACRO purpose="Shorten a string to a maximum length with an ellipsis"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the original string if it fits, otherwise truncate and append '...'"]
// CIL[DOC-CONTEXT module="utils" layer="lib" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="text: string, maxLength: number" outputs="possibly truncated string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Checks length and slices text when it exceeds maxLength" notable_decisions="Does not account for grapheme clusters"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
// CIL[DOC-VECTOR type="context" content="purpose='Shorten a string to a maximum length with an ellipsis'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/utils.ts:truncateText:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/utils.ts:generateSlug:function" type="function" identity="generateSlug" parent="~/.framework/src/lib/utils.ts"]
// CIL[DOC-MACRO purpose="Generate a URL-friendly slug from a string"]
// CIL[DOC-RESPONSIBILITY responsibility="Lowercase, remove special characters, and replace separators with hyphens"]
// CIL[DOC-CONTEXT module="utils" layer="lib" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="text: string" outputs="lowercase hyphenated slug with trimmed edges" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Applies toLowerCase, strips non-word chars, collapses separators, and trims leading or trailing hyphens" notable_decisions="Allows underscores and hyphens as word separators"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
// CIL[DOC-VECTOR type="context" content="purpose='Generate a URL-friendly slug from a string'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/utils.ts:generateSlug:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/utils.ts:capitalize:function" type="function" identity="capitalize" parent="~/.framework/src/lib/utils.ts"]
// CIL[DOC-MACRO purpose="Capitalize the first character of a string"]
// CIL[DOC-RESPONSIBILITY responsibility="Uppercase the first code unit and preserve the remainder"]
// CIL[DOC-CONTEXT module="utils" layer="lib" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="text: string" outputs="string with first character uppercased" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Uses charAt(0).toUpperCase and concatenates the rest of the string" notable_decisions="Only transforms the first character"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
// CIL[DOC-VECTOR type="context" content="purpose='Capitalize the first character of a string'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/utils.ts:capitalize:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/utils.ts:debounce:function" type="function" identity="debounce" parent="~/.framework/src/lib/utils.ts"]
// CIL[DOC-MACRO purpose="Create a debounced wrapper for a function"]
// CIL[DOC-RESPONSIBILITY responsibility="Delay invocation until a quiet period of the specified wait time"]
// CIL[DOC-CONTEXT module="utils" layer="lib" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="func: T, wait: number" outputs="debounced function with same argument types" errors="none" side_effects="schedules and clears setTimeout timers"]
// CIL[DOC-MICRO logic_summary="Clears the pending timeout on each call and schedules the wrapped call" notable_decisions="Returns a function with the original parameter types"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Create a debounced wrapper for a function'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/utils.ts:debounce:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/utils.ts:throttle:function" type="function" identity="throttle" parent="~/.framework/src/lib/utils.ts"]
// CIL[DOC-MACRO purpose="Create a throttled wrapper for a function"]
// CIL[DOC-RESPONSIBILITY responsibility="Limit execution to once per limit window"]
// CIL[DOC-CONTEXT module="utils" layer="lib" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="func: T, limit: number" outputs="throttled function with same argument types" errors="none" side_effects="schedules setTimeout to reset throttle state"]
// CIL[DOC-MICRO logic_summary="Skips calls when inThrottle and resets the flag after the limit" notable_decisions="Only the first call in each window runs"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Create a throttled wrapper for a function'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/utils.ts:throttle:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/utils.ts:isValidUrl:function" type="function" identity="isValidUrl" parent="~/.framework/src/lib/utils.ts"]
// CIL[DOC-MACRO purpose="Check whether a string is a valid URL"]
// CIL[DOC-RESPONSIBILITY responsibility="Attempt to construct a URL object and return the success or failure"]
// CIL[DOC-CONTEXT module="utils" layer="lib" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="url: string" outputs="boolean indicating URL validity" errors="returns false for invalid URLs" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Tries new URL(url) and catches failures" notable_decisions="Returns false instead of throwing"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function isValidUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Check whether a string is a valid URL'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/utils.ts:isValidUrl:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/utils.ts:getFileExtension:function" type="function" identity="getFileExtension" parent="~/.framework/src/lib/utils.ts"]
// CIL[DOC-MACRO purpose="Extract the file extension from a filename"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the substring after the last dot or an empty string"]
// CIL[DOC-CONTEXT module="utils" layer="lib" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="filename: string" outputs="string file extension without the dot" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Uses lastIndexOf and an unsigned right shift to handle edge cases" notable_decisions="Returns empty for filenames without a dot"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function getFileExtension(filename: string) {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}
// CIL[DOC-VECTOR type="context" content="purpose='Extract the file extension from a filename'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/utils.ts:getFileExtension:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/utils.ts:generateId:function" type="function" identity="generateId" parent="~/.framework/src/lib/utils.ts"]
// CIL[DOC-MACRO purpose="Generate a random alphanumeric id of a given length"]
// CIL[DOC-RESPONSIBILITY responsibility="Produce a pseudo-random string using alphanumeric characters"]
// CIL[DOC-CONTEXT module="utils" layer="lib" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="length: number = 8" outputs="random alphanumeric string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Builds a string by picking random characters from a fixed alphabet" notable_decisions="Uses Math.random for basic randomness"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
// CIL[DOC-VECTOR type="context" content="purpose='Generate a random alphanumeric id of a given length'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/utils.ts:generateId:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/utils.ts:deepClone:function" type="function" identity="deepClone" parent="~/.framework/src/lib/utils.ts"]
// CIL[DOC-MACRO purpose="Recursively clone a value of an unknown shape"]
// CIL[DOC-RESPONSIBILITY responsibility="Create a deep copy of primitives, Dates, arrays, and plain objects"]
// CIL[DOC-CONTEXT module="utils" layer="lib" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="obj: T" outputs="deep copy of the input with the same type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Recursively copies arrays and plain objects, preserving Date instances" notable_decisions="Falls through for non-object values and uses own enumerable keys"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}
// CIL[DOC-VECTOR type="context" content="purpose='Recursively clone a value of an unknown shape'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/lib/utils.ts:deepClone:function"]