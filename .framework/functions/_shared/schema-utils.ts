






































import { FieldDefinition } from '../../src/types/types'


export interface ValidationSchema {
  fields: Record<string, {
    data_type: string
    required?: boolean
    [key: string]: any
  }>
}


export function generateValidationSchema(designSchema: any): ValidationSchema {
  const validationSchema: ValidationSchema = {
    fields: {}
  }

  if (!designSchema.fields) {
    return validationSchema
  }

  for (const [fieldName, fieldDef] of Object.entries(designSchema.fields)) {
    const field = fieldDef as FieldDefinition
    
    const validationField: any = {
      data_type: field.data_type,
      required: field.required
    }

    if (field.validation) {
      Object.assign(validationField, field.validation)
    }

    if (field.options) {
      validationField.options = field.options
    }

    if (field.data_type === 'reference' && field.validation) {
      if (field.validation.reference_kind) validationField.reference_kind = field.validation.reference_kind
      if (field.validation.reference_type) validationField.reference_type = field.validation.reference_type
    }

    validationSchema.fields[fieldName] = validationField
  }

  return validationSchema
}


export function sanitizeFieldData(
  data: any, 
  data_type: string, 
  validation?: any
): any {
  if (data === null || data === undefined) {
    return data
  }

  switch (data_type) {
    case 'text':
      return sanitizeText(data, validation)
    case 'textarea':
      return sanitizeTextarea(data, validation)
    case 'rich_text':
      return sanitizeRichText(data, validation)
    case 'email':
      return sanitizeEmail(data, validation)
    case 'phone':
      return sanitizePhone(data, validation)
    case 'url':
      return sanitizeUrl(data, validation)
    case 'number':
      return sanitizeNumber(data, validation)
    case 'currency':
      return sanitizeCurrency(data, validation)
    case 'range':
      return sanitizeRange(data, validation)
    case 'date':
      return sanitizeDate(data, validation)
    case 'datetime':
      return sanitizeDatetime(data, validation)
    case 'boolean':
      return sanitizeBoolean(data, validation)
    case 'checkbox':
      return sanitizeCheckbox(data, validation)
    case 'select':
      return sanitizeSelect(data, validation)
    case 'multiselect':
      return sanitizeMultiselect(data, validation)
    case 'radio':
      return sanitizeRadio(data, validation)
    case 'color':
      return sanitizeColor(data, validation)
    case 'file':
      return sanitizeFile(data, validation)
    case 'image':
      return sanitizeImage(data, validation)
    case 'json':
      return sanitizeJson(data, validation)
    case 'reference':
      return sanitizeReference(data, validation)
    case 'address':
      return sanitizeAddress(data, validation)
    default:
      return data
  }
}


export function formatFieldData(
  data: any, 
  data_type: string, 
  context?: any
): any {
  if (data === null || data === undefined) {
    return data
  }

  switch (data_type) {
    case 'json':
      return formatJson(data)
    case 'date':
      return formatDate(data)
    case 'datetime':
      return formatDatetime(data)
    case 'currency':
      return formatCurrency(data, context)
    case 'phone':
      return formatPhone(data)
    case 'url':
      return formatUrl(data)
    case 'reference':
      return formatReference(data, context)
    case 'address':
      return formatAddress(data)
    case 'multiselect':
      return formatMultiselect(data)
    case 'boolean':
      return formatBoolean(data, context)
    default:
      return data
  }
}


export function transformRecordData(
  data: Record<string, any>,
  validationSchema: ValidationSchema,
  operation: 'sanitize' | 'format',
  context?: any
): Record<string, any> {
  const transformed: Record<string, any> = {}

  for (const [fieldName, fieldValue] of Object.entries(data)) {
    const fieldValidation = validationSchema.fields[fieldName]
    
    if (!fieldValidation) {
      transformed[fieldName] = fieldValue
      continue
    }

    if (operation === 'sanitize') {
      transformed[fieldName] = sanitizeFieldData(
        fieldValue, 
        fieldValidation.data_type, 
        fieldValidation
      )
    } else if (operation === 'format') {
      transformed[fieldName] = formatFieldData(
        fieldValue, 
        fieldValidation.data_type, 
        context
      )
    }
  }

  return transformed
}


function sanitizeText(data: any, validation?: any): string {
  let text = String(data).trim()
  
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  
  if (validation?.minLength && text.length < validation.minLength) {
    throw new Error(`Text must be at least ${validation.minLength} characters`)
  }
  if (validation?.maxLength && text.length > validation.maxLength) {
    text = text.substring(0, validation.maxLength)
  }
  
  if (validation?.pattern) {
    const regex = new RegExp(validation.pattern)
    if (!regex.test(text)) {
      throw new Error(`Text does not match required pattern`)
    }
  }
  
  return text
}


function sanitizeTextarea(data: any, validation?: any): string {
  let text = String(data).trim()
  
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  
  if (validation?.minLength && text.length < validation.minLength) {
    throw new Error(`Text must be at least ${validation.minLength} characters`)
  }
  if (validation?.maxLength && text.length > validation.maxLength) {
    text = text.substring(0, validation.maxLength)
  }
  
  return text
}


function sanitizeRichText(data: any, validation?: any): string {
  let html = String(data).trim()
  
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g
  
  html = html.replace(tagRegex, (match, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      return match
    }
    return ''
  })
  
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  html = html.replace(/on\w+\s*=/gi, '')
  
  if (validation?.minLength && html.length < validation.minLength) {
    throw new Error(`Content must be at least ${validation.minLength} characters`)
  }
  if (validation?.maxLength && html.length > validation.maxLength) {
    html = html.substring(0, validation.maxLength)
  }
  
  return html
}


function sanitizeEmail(data: any, validation?: any): string {
  let email = String(data).toLowerCase().trim()
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format')
  }
  
  return email
}


function sanitizePhone(data: any, validation?: any): string {
  let phone = String(data).trim()
  
  phone = phone.replace(/[^\d+]/g, '')
  
  if (validation?.pattern) {
    const regex = new RegExp(validation.pattern)
    if (!regex.test(phone)) {
      throw new Error('Phone number does not match required format')
    }
  }
  
  return phone
}


function sanitizeUrl(data: any, validation?: any): string {
  let url = String(data).trim()
  
  try {
    const urlObj = new URL(url)
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Only HTTP and HTTPS URLs are allowed')
    }
    return urlObj.toString()
  } catch {
    throw new Error('Invalid URL format')
  }
}


function sanitizeNumber(data: any, validation?: any): number {
  let num = Number(data)
  
  if (isNaN(num)) {
    throw new Error('Invalid number')
  }
  
  if (validation?.min !== undefined && num < validation.min) {
    throw new Error(`Number must be at least ${validation.min}`)
  }
  if (validation?.max !== undefined && num > validation.max) {
    throw new Error(`Number must be at most ${validation.max}`)
  }
  
  if (validation?.step) {
    const remainder = num % validation.step
    if (remainder !== 0) {
      num = num - remainder
    }
  }
  
  return num
}


function sanitizeCurrency(data: any, validation?: any): number {
  let num = Number(data)
  
  if (isNaN(num)) {
    throw new Error('Invalid currency amount')
  }
  
  num = Math.round(num * 100) / 100
  
  if (validation?.min !== undefined && num < validation.min) {
    throw new Error(`Amount must be at least ${validation.min}`)
  }
  if (validation?.max !== undefined && num > validation.max) {
    throw new Error(`Amount must be at most ${validation.max}`)
  }
  
  return num
}


function sanitizeRange(data: any, validation?: any): number {
  return sanitizeNumber(data, validation)
}


function sanitizeDate(data: any, validation?: any): string {
  let dateStr = String(data).trim()
  
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format')
  }
  
  const isoDate = date.toISOString().split('T')[0]
  
  if (validation?.min) {
    const minDate = new Date(validation.min)
    if (date < minDate) {
      throw new Error(`Date must be on or after ${validation.min}`)
    }
  }
  if (validation?.max) {
    const maxDate = new Date(validation.max)
    if (date > maxDate) {
      throw new Error(`Date must be on or before ${validation.max}`)
    }
  }
  
  return isoDate
}


function sanitizeDatetime(data: any, validation?: any): string {
  let dateStr = String(data).trim()
  
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    throw new Error('Invalid datetime format')
  }
  
  const isoDatetime = date.toISOString()
  
  if (validation?.min) {
    const minDate = new Date(validation.min)
    if (date < minDate) {
      throw new Error(`Datetime must be on or after ${validation.min}`)
    }
  }
  if (validation?.max) {
    const maxDate = new Date(validation.max)
    if (date > maxDate) {
      throw new Error(`Datetime must be on or before ${validation.max}`)
    }
  }
  
  return isoDatetime
}


function sanitizeBoolean(data: any, validation?: any): boolean {
  if (typeof data === 'boolean') {
    return data
  }
  
  const str = String(data).toLowerCase()
  if (['true', '1', 'yes', 'on'].includes(str)) {
    return true
  } else if (['false', '0', 'no', 'off'].includes(str)) {
    return false
  }
  
  throw new Error('Invalid boolean value')
}


function sanitizeCheckbox(data: any, validation?: any): boolean {
  return sanitizeBoolean(data, validation)
}


function sanitizeSelect(data: any, validation?: any): string {
  let value = String(data).trim()

  if (validation?.options) {
    const allowedValues = (Array.isArray(validation.options) ? validation.options : [])
      .map((o: any) => (o && typeof o === 'object' ? o.value : o))
    if (!allowedValues.includes(value)) {
      throw new Error('Invalid option selected')
    }
  }

  return value
}


function sanitizeMultiselect(data: any, validation?: any): string[] {
  let values: string[]
  
  if (Array.isArray(data)) {
    values = data.map(item => String(item).trim())
  } else if (typeof data === 'string') {
    values = data.split(',').map(item => item.trim())
  } else {
    throw new Error('Multiselect must be an array or comma-separated string')
  }
  
  values = [...new Set(values)]
  
  if (validation?.options) {
    const allowedValues = (Array.isArray(validation.options) ? validation.options : [])
      .map((o: any) => (o && typeof o === 'object' ? o.value : o))
    for (const value of values) {
      if (!allowedValues.includes(value)) {
        throw new Error(`Invalid option: ${value}`)
      }
    }
  }
  
  if (validation?.max && values.length > validation.max) {
    values = values.slice(0, validation.max)
  }
  
  return values
}


function sanitizeRadio(data: any, validation?: any): string {
  return sanitizeSelect(data, validation)
}


function sanitizeColor(data: any, validation?: any): string {
  let color = String(data).trim()
  
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  if (!hexRegex.test(color)) {
    throw new Error('Invalid color format. Use #RRGGBB or #RGB format')
  }
  
  if (color.length === 4) {
    color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3]
  }
  
  return color.toUpperCase()
}


function sanitizeFile(data: any, validation?: any): any {
  if (typeof data !== 'object' || !data.name) {
    throw new Error('Invalid file data')
  }
  
  if (validation?.maxSize && data.size > validation.maxSize) {
    throw new Error(`File size exceeds maximum of ${validation.maxSize} bytes`)
  }
  
  if (validation?.allowedTypes && !validation.allowedTypes.includes(data.type)) {
    throw new Error(`File type ${data.type} is not allowed`)
  }
  
  data.name = data.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  
  return data
}


function sanitizeImage(data: any, validation?: any): any {
  const file = sanitizeFile(data, validation)
  
  if (validation?.maxWidth || validation?.maxHeight) {
  }
  
  return file
}


function sanitizeJson(data: any, validation?: any): any {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch {
      throw new Error('Invalid JSON format')
    }
  }

  if (jsonContainsDangerousContent(data)) {
    throw new Error('JSON contains potentially dangerous content')
  }

  return data
}

// JSON field values are inert data — the real hazards are executable
// payloads smuggled inside string values (script tags, javascript: URLs,
// eval/Function calls, inline event handlers) and __proto__ keys, which
// prototype-pollute objects the payload is later merged into. Substring
// matching on the serialized JSON is NOT safe here: it rejects ordinary
// words like "functionality", "description", "evaluate", and "transcript".
const DANGEROUS_JSON_VALUE_PATTERN =
  /<\s*\/?\s*script|javascript\s*:|\beval\s*\(|\bfunction\s*\(|new\s+Function\s*\(|\bon\w+\s*=/i

function jsonContainsDangerousContent(value: any): boolean {
  if (typeof value === 'string') return DANGEROUS_JSON_VALUE_PATTERN.test(value)
  if (Array.isArray(value)) return value.some(jsonContainsDangerousContent)
  if (value && typeof value === 'object') {
    return Object.entries(value).some(
      ([key, v]) => key === '__proto__' || jsonContainsDangerousContent(v)
    )
  }
  return false
}


function sanitizeReference(data: any, validation?: any): string {
  let ref = String(data).trim()
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(ref)) {
    throw new Error('Invalid reference format')
  }
  
  return ref
}


function sanitizeAddress(data: any, validation?: any): any {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Address must be an object')
  }
  
  const sanitized: any = {}
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value)
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}


function formatJson(data: any): string {
  return JSON.stringify(data, null, 2)
}


function formatDate(data: string): string {
  const date = new Date(data)
  if (isNaN(date.getTime())) {
    return data
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}


function formatDatetime(data: string): string {
  const date = new Date(data)
  if (isNaN(date.getTime())) {
    return data
  }
  
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}


function formatCurrency(data: number, context?: any): string {
  const currency = context?.currency_code || 'USD'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(data)
}


function formatPhone(data: string): string {
  const phone = data.replace(/\D/g, '')
  if (phone.length === 10) {
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`
  } else if (phone.length === 11 && phone[0] === '1') {
    return `+${phone[0]} (${phone.slice(1, 4)}) ${phone.slice(4, 7)}-${phone.slice(7)}`
  }
  
  return data
}


function formatUrl(data: string): string {
  return data
}


function formatReference(data: string, context?: any): string {
  return data
}


function formatAddress(data: any): string {
  if (typeof data !== 'object' || data === null) {
    return String(data)
  }
  
  const parts = [
    data.street,
    data.city,
    data.state,
    data.postal_code,
    data.country
  ].filter(Boolean)
  
  return parts.join(', ')
}


function formatMultiselect(data: string[]): string {
  if (!Array.isArray(data)) {
    return String(data)
  }
  
  return data.join(', ')
}


function formatBoolean(data: boolean, context?: any): string {
  if (context?.field === 'is_active') {
    return data ? 'Active' : 'Inactive'
  }
  
  return data ? 'Yes' : 'No'
}
