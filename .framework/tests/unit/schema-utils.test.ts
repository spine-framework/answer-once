import { describe, it, expect } from 'vitest'
import { generateValidationSchema, sanitizeFieldData } from '../../functions/_shared/schema-utils.ts'

describe('generateValidationSchema', () => {
  it('returns empty fields for schema with no fields', () => {
    const result = generateValidationSchema({})
    expect(result.fields).toEqual({})
  })

  it('extracts data_type and required from each field', () => {
    const result = generateValidationSchema({
      fields: {
        name: { data_type: 'short_text', required: true },
        priority: { data_type: 'select', required: false, options: ['low', 'medium', 'high'] }
      }
    })

    expect(result.fields.name).toMatchObject({ data_type: 'short_text', required: true })
    expect(result.fields.priority).toMatchObject({
      data_type: 'select',
      required: false,
      options: ['low', 'medium', 'high']
    })
  })

  it('includes validation constraints when declared', () => {
    const result = generateValidationSchema({
      fields: {
        age: {
          data_type: 'integer',
          required: true,
          validation: { min: 0, max: 150 }
        }
      }
    })

    expect(result.fields.age.min).toBe(0)
    expect(result.fields.age.max).toBe(150)
  })

  it('includes reference_kind and reference_type for reference fields', () => {
    const result = generateValidationSchema({
      fields: {
        assignee: {
          data_type: 'reference',
          required: false,
          validation: {
            reference_kind: 'people',
            reference_type: 'person'
          }
        }
      }
    })

    expect(result.fields.assignee.reference_kind).toBe('people')
    expect(result.fields.assignee.reference_type).toBe('person')
  })

  it('does not include display_type or permission fields in validation schema', () => {
    const result = generateValidationSchema({
      fields: {
        status: {
          data_type: 'select',
          required: true,
          display_type: 'badge',
          permissions: { read: 'all', write: 'admin' },
          options: ['open', 'closed']
        }
      }
    })

    expect(result.fields.status.display_type).toBeUndefined()
    expect(result.fields.status.permissions).toBeUndefined()
    expect(result.fields.status.options).toEqual(['open', 'closed'])
  })

  it('handles multiple fields correctly', () => {
    const designSchema = {
      fields: {
        title: { data_type: 'short_text', required: true },
        body: { data_type: 'long_text', required: false },
        score: { data_type: 'decimal', required: false, validation: { min: 0, max: 10 } }
      }
    }

    const result = generateValidationSchema(designSchema)
    expect(Object.keys(result.fields)).toHaveLength(3)
    expect(result.fields.title.data_type).toBe('short_text')
    expect(result.fields.body.data_type).toBe('long_text')
    expect(result.fields.score.min).toBe(0)
  })

  it('system: true fields are preserved in validation schema (system flag is structural)', () => {
    const result = generateValidationSchema({
      fields: {
        id: { data_type: 'text', required: true, system: true },
        created_at: { data_type: 'datetime', required: false, system: true, readonly: true }
      }
    })
    expect(result.fields.id).toBeDefined()
    expect(result.fields.created_at).toBeDefined()
  })

  it('null validation object does not cause errors', () => {
    const result = generateValidationSchema({
      fields: {
        name: { data_type: 'text', required: true, validation: null }
      }
    })
    expect(result.fields.name.data_type).toBe('text')
    expect(result.fields.name.required).toBe(true)
  })

  it('handles all key data_types without throwing', () => {
    const dataTypes = [
      'text', 'textarea', 'email', 'url', 'phone',
      'number', 'integer', 'decimal',
      'boolean', 'datetime', 'date',
      'select', 'multiselect', 'reference',
      'json', 'color', 'rich_text'
    ]
    for (const data_type of dataTypes) {
      expect(() => generateValidationSchema({
        fields: { field1: { data_type, required: false } }
      })).not.toThrow()
    }
  })

  it('returns empty fields object when fields key is missing entirely', () => {
    const result = generateValidationSchema({ views: {}, record_permissions: {} })
    expect(result.fields).toEqual({})
  })
})

describe('sanitizeFieldData: json', () => {
  it('accepts natural-language JSON containing words like "functionality" and "description"', () => {
    const value = [
      'Provided an explanation of fields, views, record permissions, and functionality.',
      'Reviewed the transcript and description of the incident.',
    ]
    expect(sanitizeFieldData(value, 'json')).toEqual(value)
  })

  it('accepts JSON containing "evaluate", "retrieval", and "subscription" substrings', () => {
    const value = { note: 'Evaluate the retrieval path before updating the subscription.' }
    expect(sanitizeFieldData(value, 'json')).toEqual(value)
  })

  it('accepts keys named "script" and "function" — only dangerous values are rejected', () => {
    const value = { script: 'the onboarding video script', function: 'checkout flow' }
    expect(sanitizeFieldData(value, 'json')).toEqual(value)
  })

  it('rejects string values containing a script tag', () => {
    expect(() =>
      sanitizeFieldData({ steps: ['safe', '<script>alert(1)</script>'] }, 'json')
    ).toThrow('dangerous content')
  })

  it('rejects string values containing javascript: URLs', () => {
    expect(() =>
      sanitizeFieldData({ link: 'javascript:alert(1)' }, 'json')
    ).toThrow('dangerous content')
  })

  it('rejects string values containing eval() or Function() calls', () => {
    expect(() => sanitizeFieldData({ x: 'eval(payload)' }, 'json')).toThrow('dangerous content')
    expect(() => sanitizeFieldData({ x: 'new Function("return 1")' }, 'json')).toThrow(
      'dangerous content'
    )
  })

  it('rejects string values containing inline event handlers', () => {
    expect(() =>
      sanitizeFieldData({ html: 'div onclick=steal()' }, 'json')
    ).toThrow('dangerous content')
  })

  it('rejects __proto__ keys at any depth', () => {
    // JSON.parse materializes __proto__ as an own property — the prototype-
    // pollution vector — unlike an object literal, where it sets the prototype.
    const parsed = JSON.parse('{"nested": {"__proto__": {"admin": true}}}')
    expect(() => sanitizeFieldData(parsed, 'json')).toThrow('dangerous content')
    expect(() =>
      sanitizeFieldData('{"__proto__": {"admin": true}}', 'json')
    ).toThrow('dangerous content')
  })

  it('parses JSON strings and validates the parsed value', () => {
    expect(sanitizeFieldData('{"a": 1}', 'json')).toEqual({ a: 1 })
    expect(() => sanitizeFieldData('{"x": "<script>"}', 'json')).toThrow('dangerous content')
    expect(() => sanitizeFieldData('not json', 'json')).toThrow('Invalid JSON format')
  })
})
