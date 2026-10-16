// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="schema-utils shared module header and imports"]
// CIL[DOC-RESPONSIBILITY responsibility="declare module scope and dependency on the FieldDefinition type"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="imports FieldDefinition from the shared types module and serves as the file header" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]







































import { FieldDefinition } from '../../src/types/types'
// CIL[DOC-VECTOR type="context" content="purpose='schema-utils shared module header and imports'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:ValidationSchema:interface" type="interface" identity="ValidationSchema" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="validation schema type definition"]
// CIL[DOC-RESPONSIBILITY responsibility="declare the typed contract for generated validation schemas"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="ValidationSchema type definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="defines a fields record keyed by string with data_type, optional required, and extensible validation properties" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface ValidationSchema {
  fields: Record<string, {
    data_type: string
    required?: boolean
    [key: string]: any
  }>
}
// CIL[DOC-VECTOR type="context" content="purpose='validation schema type definition'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:ValidationSchema:interface"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:generateValidationSchema:function" type="function" identity="generateValidationSchema" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="generate a ValidationSchema from a design schema"]
// CIL[DOC-RESPONSIBILITY responsibility="build a validation schema capturing data types and constraints from a design schema"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="designSchema: any" outputs="ValidationSchema" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="iterates design schema fields, copies data_type and required, merges validation and options, and returns the validation schema" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='generate a ValidationSchema from a design schema'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:generateValidationSchema:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeFieldData:function" type="function" identity="sanitizeFieldData" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="dispatch a field value to the correct sanitizer"]
// CIL[DOC-RESPONSIBILITY responsibility="route a single field value to the type-specific sanitizer based on data_type"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any, data_type: string, validation?: any" outputs="any" errors="throws Error when the field data fails type-specific validation or constraints" side_effects="none"]
// CIL[DOC-MICRO logic_summary="uses a switch over data_type to call the appropriate sanitize function with the field value and validation rules" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='dispatch a field value to the correct sanitizer'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeFieldData:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:formatFieldData:function" type="function" identity="formatFieldData" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="dispatch a field value to the correct formatter"]
// CIL[DOC-RESPONSIBILITY responsibility="route a single field value to the type-specific formatter based on data_type"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any, data_type: string, context?: any" outputs="any" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="uses a switch over data_type to call the appropriate format function with the field value and optional context" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='dispatch a field value to the correct formatter'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:formatFieldData:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:transformRecordData:function" type="function" identity="transformRecordData" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="apply sanitize or format to every field of a record"]
// CIL[DOC-RESPONSIBILITY responsibility="transform a full record by dispatching each field through sanitizeFieldData or formatFieldData"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: Record<string, any>, validationSchema: ValidationSchema, operation: 'sanitize' | 'format', context?: any" outputs="Record<string, any>" errors="throws Error when any individual field fails validation during sanitize" side_effects="none"]
// CIL[DOC-MICRO logic_summary="iterates record entries, looks up each field in the validation schema, and applies the requested operation" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='apply sanitize or format to every field of a record'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:transformRecordData:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeText:function" type="function" identity="sanitizeText" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="sanitize and validate a text input"]
// CIL[DOC-RESPONSIBILITY responsibility="clean and validate text field data so downstream code can trust the value"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any, validation?: any" outputs="string" errors="throws Error when the input fails validation or constraint checks" side_effects="none"]
// CIL[DOC-MICRO logic_summary="trims the input, strips control characters, and enforces min, max, and pattern constraints; output encoding is left to renderers (React escapes text nodes, DOMPurify guards innerHTML paths)" notable_decisions="HTML entity escaping was removed — it stored &#x27;-style entities in the database, corrupting text for JSON consumers, embeddings, and plain-text renders while providing no real XSS defense since every render path already escapes/sanitizes on output"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='sanitize and validate a text input'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeText:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeTextarea:function" type="function" identity="sanitizeTextarea" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="sanitize and validate a textarea input"]
// CIL[DOC-RESPONSIBILITY responsibility="clean and validate textarea field data so downstream code can trust the value"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any, validation?: any" outputs="string" errors="throws Error when the input fails validation or constraint checks" side_effects="none"]
// CIL[DOC-MICRO logic_summary="trims the input, strips control characters, and enforces min and max length constraints; output encoding is left to renderers (React escapes text nodes, DOMPurify guards innerHTML paths)" notable_decisions="HTML entity escaping was removed — it stored &#x27;-style entities in the database, corrupting text for JSON consumers, embeddings, and plain-text renders while providing no real XSS defense since every render path already escapes/sanitizes on output"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='sanitize and validate a textarea input'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeTextarea:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeRichText:function" type="function" identity="sanitizeRichText" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="sanitize and validate a rich text input"]
// CIL[DOC-RESPONSIBILITY responsibility="clean and validate rich text field data so downstream code can trust the value"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any, validation?: any" outputs="string" errors="throws Error when the input fails validation or constraint checks" side_effects="none"]
// CIL[DOC-MICRO logic_summary="trims HTML, filters against an allowed tag whitelist, removes script and event handlers, and validates length constraints" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='sanitize and validate a rich text input'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeRichText:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeEmail:function" type="function" identity="sanitizeEmail" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="sanitize and validate a email input"]
// CIL[DOC-RESPONSIBILITY responsibility="clean and validate email field data so downstream code can trust the value"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any, validation?: any" outputs="string" errors="throws Error when the input fails validation or constraint checks" side_effects="none"]
// CIL[DOC-MICRO logic_summary="coerces the input to lowercase, trims it, and validates the email pattern" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function sanitizeEmail(data: any, validation?: any): string {
  let email = String(data).toLowerCase().trim()
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format')
  }
  
  return email
}
// CIL[DOC-VECTOR type="context" content="purpose='sanitize and validate a email input'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeEmail:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizePhone:function" type="function" identity="sanitizePhone" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="sanitize and validate a phone input"]
// CIL[DOC-RESPONSIBILITY responsibility="clean and validate phone field data so downstream code can trust the value"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any, validation?: any" outputs="string" errors="throws Error when the input fails validation or constraint checks" side_effects="none"]
// CIL[DOC-MICRO logic_summary="strips non-digits and validates the result against a pattern if provided" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='sanitize and validate a phone input'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizePhone:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeUrl:function" type="function" identity="sanitizeUrl" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="sanitize and validate a url input"]
// CIL[DOC-RESPONSIBILITY responsibility="clean and validate url field data so downstream code can trust the value"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any, validation?: any" outputs="string" errors="throws Error when the input fails validation or constraint checks" side_effects="none"]
// CIL[DOC-MICRO logic_summary="parses the input as a URL and restricts it to HTTP or HTTPS protocols" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='sanitize and validate a url input'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeUrl:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeNumber:function" type="function" identity="sanitizeNumber" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="sanitize and validate a number input"]
// CIL[DOC-RESPONSIBILITY responsibility="clean and validate number field data so downstream code can trust the value"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any, validation?: any" outputs="number" errors="throws Error when the input fails validation or constraint checks" side_effects="none"]
// CIL[DOC-MICRO logic_summary="coerces the input to a number and enforces min, max, and step constraints" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='sanitize and validate a number input'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeNumber:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeCurrency:function" type="function" identity="sanitizeCurrency" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="sanitize and validate a currency input"]
// CIL[DOC-RESPONSIBILITY responsibility="clean and validate currency field data so downstream code can trust the value"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any, validation?: any" outputs="number" errors="throws Error when the input fails validation or constraint checks" side_effects="none"]
// CIL[DOC-MICRO logic_summary="coerces the input to a number, rounds to two decimals, and enforces min and max" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='sanitize and validate a currency input'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeCurrency:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeRange:function" type="function" identity="sanitizeRange" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="sanitize and validate a range input"]
// CIL[DOC-RESPONSIBILITY responsibility="clean and validate range field data so downstream code can trust the value"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any, validation?: any" outputs="number" errors="throws Error when the input fails validation or constraint checks" side_effects="none"]
// CIL[DOC-MICRO logic_summary="coerces the input through the number sanitizer to enforce range and step constraints" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function sanitizeRange(data: any, validation?: any): number {
  return sanitizeNumber(data, validation)
}
// CIL[DOC-VECTOR type="context" content="purpose='sanitize and validate a range input'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeRange:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeDate:function" type="function" identity="sanitizeDate" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="sanitize and validate a date input"]
// CIL[DOC-RESPONSIBILITY responsibility="clean and validate date field data so downstream code can trust the value"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any, validation?: any" outputs="string" errors="throws Error when the input fails validation or constraint checks" side_effects="none"]
// CIL[DOC-MICRO logic_summary="parses the input as a date and enforces optional min and max dates" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='sanitize and validate a date input'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeDate:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeDatetime:function" type="function" identity="sanitizeDatetime" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="sanitize and validate a datetime input"]
// CIL[DOC-RESPONSIBILITY responsibility="clean and validate datetime field data so downstream code can trust the value"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any, validation?: any" outputs="string" errors="throws Error when the input fails validation or constraint checks" side_effects="none"]
// CIL[DOC-MICRO logic_summary="parses the input as a datetime and enforces optional min and max datetimes" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='sanitize and validate a datetime input'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeDatetime:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeBoolean:function" type="function" identity="sanitizeBoolean" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="sanitize and validate a boolean input"]
// CIL[DOC-RESPONSIBILITY responsibility="clean and validate boolean field data so downstream code can trust the value"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any, validation?: any" outputs="boolean" errors="throws Error when the input fails validation or constraint checks" side_effects="none"]
// CIL[DOC-MICRO logic_summary="coerces common string and boolean inputs to true or false" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='sanitize and validate a boolean input'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeBoolean:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeCheckbox:function" type="function" identity="sanitizeCheckbox" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="sanitize and validate a checkbox input"]
// CIL[DOC-RESPONSIBILITY responsibility="clean and validate checkbox field data so downstream code can trust the value"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any, validation?: any" outputs="boolean" errors="throws Error when the input fails validation or constraint checks" side_effects="none"]
// CIL[DOC-MICRO logic_summary="coerces the input to a boolean using the boolean sanitizer" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function sanitizeCheckbox(data: any, validation?: any): boolean {
  return sanitizeBoolean(data, validation)
}
// CIL[DOC-VECTOR type="context" content="purpose='sanitize and validate a checkbox input'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeCheckbox:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeSelect:function" type="function" identity="sanitizeSelect" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="sanitize and validate a select input"]
// CIL[DOC-RESPONSIBILITY responsibility="clean and validate select field data so downstream code can trust the value"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any, validation?: any" outputs="string" errors="throws Error when the input fails validation or constraint checks" side_effects="none"]
// CIL[DOC-MICRO logic_summary="trims the input and validates it against the configured allowed options" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='sanitize and validate a select input'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeSelect:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeMultiselect:function" type="function" identity="sanitizeMultiselect" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="sanitize and validate a multiselect input"]
// CIL[DOC-RESPONSIBILITY responsibility="clean and validate multiselect field data so downstream code can trust the value"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any, validation?: any" outputs="string[]" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="normalizes input to an array, deduplicates, validates against allowed options, and enforces max selection count" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='sanitize and validate a multiselect input'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeMultiselect:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeRadio:function" type="function" identity="sanitizeRadio" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="sanitize and validate a radio input"]
// CIL[DOC-RESPONSIBILITY responsibility="clean and validate radio field data so downstream code can trust the value"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any, validation?: any" outputs="string" errors="throws Error when the input fails validation or constraint checks" side_effects="none"]
// CIL[DOC-MICRO logic_summary="trims the input and validates it against the configured allowed options using the select sanitizer" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function sanitizeRadio(data: any, validation?: any): string {
  return sanitizeSelect(data, validation)
}
// CIL[DOC-VECTOR type="context" content="purpose='sanitize and validate a radio input'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeRadio:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeColor:function" type="function" identity="sanitizeColor" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="sanitize and validate a color input"]
// CIL[DOC-RESPONSIBILITY responsibility="clean and validate color field data so downstream code can trust the value"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any, validation?: any" outputs="string" errors="throws Error when the input fails validation or constraint checks" side_effects="none"]
// CIL[DOC-MICRO logic_summary="validates and normalizes a hex color to a six-digit uppercase string" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='sanitize and validate a color input'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeColor:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeFile:function" type="function" identity="sanitizeFile" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="sanitize and validate a file input"]
// CIL[DOC-RESPONSIBILITY responsibility="clean and validate file field data so downstream code can trust the value"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any, validation?: any" outputs="any" errors="throws Error when the input fails validation or constraint checks" side_effects="none"]
// CIL[DOC-MICRO logic_summary="validates file metadata, enforces size and type constraints, and sanitizes the file name" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='sanitize and validate a file input'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeFile:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeImage:function" type="function" identity="sanitizeImage" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="sanitize and validate a image input"]
// CIL[DOC-RESPONSIBILITY responsibility="clean and validate image field data so downstream code can trust the value"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any, validation?: any" outputs="any" errors="throws Error when the input fails validation or constraint checks" side_effects="none"]
// CIL[DOC-MICRO logic_summary="validates file data and applies optional dimension constraints (placeholder)" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function sanitizeImage(data: any, validation?: any): any {
  const file = sanitizeFile(data, validation)
  
  if (validation?.maxWidth || validation?.maxHeight) {
  }
  
  return file
}
// CIL[DOC-VECTOR type="context" content="purpose='sanitize and validate a image input'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeImage:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeJson:function" type="function" identity="sanitizeJson" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="sanitize and validate a json input"]
// CIL[DOC-RESPONSIBILITY responsibility="clean and validate json field data so downstream code can trust the value"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any, validation?: any" outputs="any" errors="throws Error when the input fails validation or constraint checks" side_effects="none"]
// CIL[DOC-MICRO logic_summary="parses string input to JSON, stringifies for safety checks, and rejects values containing forbidden tokens" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='sanitize and validate a json input'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeJson:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeReference:function" type="function" identity="sanitizeReference" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="sanitize and validate a reference input"]
// CIL[DOC-RESPONSIBILITY responsibility="clean and validate reference field data so downstream code can trust the value"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any, validation?: any" outputs="string" errors="throws Error when the input fails validation or constraint checks" side_effects="none"]
// CIL[DOC-MICRO logic_summary="validates that the input is a standard UUID string" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function sanitizeReference(data: any, validation?: any): string {
  let ref = String(data).trim()
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(ref)) {
    throw new Error('Invalid reference format')
  }
  
  return ref
}
// CIL[DOC-VECTOR type="context" content="purpose='sanitize and validate a reference input'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeReference:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeAddress:function" type="function" identity="sanitizeAddress" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="sanitize and validate a address input"]
// CIL[DOC-RESPONSIBILITY responsibility="clean and validate address field data so downstream code can trust the value"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any, validation?: any" outputs="any" errors="throws Error when the input fails validation or constraint checks" side_effects="none"]
// CIL[DOC-MICRO logic_summary="sanitizes string fields of an address object and returns the cleaned object" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='sanitize and validate a address input'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:sanitizeAddress:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:formatJson:function" type="function" identity="formatJson" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="format a json value for display"]
// CIL[DOC-RESPONSIBILITY responsibility="convert json data into a human-readable string for UI rendering"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="pretty-prints a JSON value with two-space indentation" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function formatJson(data: any): string {
  return JSON.stringify(data, null, 2)
}
// CIL[DOC-VECTOR type="context" content="purpose='format a json value for display'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:formatJson:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:formatDate:function" type="function" identity="formatDate" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="format a date value for display"]
// CIL[DOC-RESPONSIBILITY responsibility="convert date data into a human-readable string for UI rendering"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: string" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="converts an ISO date string to a human-readable localized date" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='format a date value for display'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:formatDate:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:formatDatetime:function" type="function" identity="formatDatetime" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="format a datetime value for display"]
// CIL[DOC-RESPONSIBILITY responsibility="convert datetime data into a human-readable string for UI rendering"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: string" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="converts an ISO datetime string to a human-readable localized datetime" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='format a datetime value for display'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:formatDatetime:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:formatCurrency:function" type="function" identity="formatCurrency" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="format a currency value for display"]
// CIL[DOC-RESPONSIBILITY responsibility="convert currency data into a human-readable string for UI rendering"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: number, context?: any" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="formats a number as an ICU currency string using the provided context currency or USD" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function formatCurrency(data: number, context?: any): string {
  const currency = context?.currency_code || 'USD'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(data)
}
// CIL[DOC-VECTOR type="context" content="purpose='format a currency value for display'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:formatCurrency:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:formatPhone:function" type="function" identity="formatPhone" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="format a phone value for display"]
// CIL[DOC-RESPONSIBILITY responsibility="convert phone data into a human-readable string for UI rendering"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: string" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="strips non-digits and formats 10 or 11-digit US numbers" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function formatPhone(data: string): string {
  const phone = data.replace(/\D/g, '')
  if (phone.length === 10) {
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`
  } else if (phone.length === 11 && phone[0] === '1') {
    return `+${phone[0]} (${phone.slice(1, 4)}) ${phone.slice(4, 7)}-${phone.slice(7)}`
  }
  
  return data
}
// CIL[DOC-VECTOR type="context" content="purpose='format a phone value for display'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:formatPhone:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:formatUrl:function" type="function" identity="formatUrl" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="format a url value for display"]
// CIL[DOC-RESPONSIBILITY responsibility="convert url data into a human-readable string for UI rendering"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: string" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="returns the URL string unchanged" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function formatUrl(data: string): string {
  return data
}
// CIL[DOC-VECTOR type="context" content="purpose='format a url value for display'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:formatUrl:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:formatReference:function" type="function" identity="formatReference" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="format a reference value for display"]
// CIL[DOC-RESPONSIBILITY responsibility="convert reference data into a human-readable string for UI rendering"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: string, context?: any" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="returns the reference string unchanged" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function formatReference(data: string, context?: any): string {
  return data
}
// CIL[DOC-VECTOR type="context" content="purpose='format a reference value for display'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:formatReference:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:formatAddress:function" type="function" identity="formatAddress" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="format a address value for display"]
// CIL[DOC-RESPONSIBILITY responsibility="convert address data into a human-readable string for UI rendering"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: any" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="joins present address parts into a comma-separated display string" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='format a address value for display'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:formatAddress:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:formatMultiselect:function" type="function" identity="formatMultiselect" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="format a multiselect value for display"]
// CIL[DOC-RESPONSIBILITY responsibility="convert multiselect data into a human-readable string for UI rendering"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: string[]" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="joins an array into a comma-separated display string" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function formatMultiselect(data: string[]): string {
  if (!Array.isArray(data)) {
    return String(data)
  }
  
  return data.join(', ')
}
// CIL[DOC-VECTOR type="context" content="purpose='format a multiselect value for display'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:formatMultiselect:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/schema-utils.ts:formatBoolean:function" type="function" identity="formatBoolean" parent="~/.framework/functions/_shared/schema-utils.ts"]
// CIL[DOC-MACRO purpose="format a boolean value for display"]
// CIL[DOC-RESPONSIBILITY responsibility="convert boolean data into a human-readable string for UI rendering"]
// CIL[DOC-CONTEXT module="schema-utils" layer="shared" related_files=".framework/functions/_shared/schema-utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="data: boolean, context?: any" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="returns Active/Inactive for the is_active field and Yes/No for other booleans" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function formatBoolean(data: boolean, context?: any): string {
  if (context?.field === 'is_active') {
    return data ? 'Active' : 'Inactive'
  }
  
  return data ? 'Yes' : 'No'
}
// CIL[DOC-VECTOR type="context" content="purpose='format a boolean value for display'; No verified external callers; imports: .framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/schema-utils.ts:formatBoolean:function"]
