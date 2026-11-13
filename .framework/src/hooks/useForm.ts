
import { useState, useCallback, useEffect } from 'react'
import { FieldDefinition, FormState, ValidationError } from '../types/types'


interface UseFormOptions {
  initialValues: Record<string, any>
  fields: FieldDefinition[]
  onSubmit?: (values: Record<string, any>) => void | Promise<void>
  validate?: (values: Record<string, any>) => Record<string, string>
  onChange?: (values: Record<string, any>) => void
}


interface UseFormReturn {
  data: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
  handleChange: (field: string, value: any) => void
  handleBlur: (field: string) => void
  handleSubmit: (e?: React.FormEvent) => void
  resetForm: () => void
  setFieldValue: (field: string, value: any) => void
  setFieldError: (field: string, error: string) => void
  clearErrors: () => void
}

export function useForm({
  initialValues,
  fields,
  onSubmit,
  validate,
  onChange
}: UseFormOptions): UseFormReturn {
  const [data, setData] = useState<Record<string, any>>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitCount, setSubmitCount] = useState(0)

  const validateField = useCallback((field: string, value: any): string | null => {
    const fieldDef = fields.find(f => f.name === field)
    if (!fieldDef) return null

    if (fieldDef.required && (!value || value === '')) {
      return `${fieldDef.label || field} is required`
    }

    if (!fieldDef.required && (!value || value === '')) {
      return null
    }

    switch (fieldDef.data_type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          return 'Please enter a valid email address'
        }
        break

      case 'url':
        try {
          new URL(value)
        } catch {
          return 'Please enter a valid URL'
        }
        break

      case 'number':
        const num = Number(value)
        if (isNaN(num)) {
          return 'Please enter a valid number'
        }
        if (fieldDef.min !== undefined && num < fieldDef.min) {
          return `Value must be at least ${fieldDef.min}`
        }
        if (fieldDef.max !== undefined && num > fieldDef.max) {
          return `Value must be at most ${fieldDef.max}`
        }
        break

      case 'text':
      case 'textarea':
        if (fieldDef.validation?.minLength && value.length < fieldDef.validation.minLength) {
          return `Must be at least ${fieldDef.validation.minLength} characters`
        }
        if (fieldDef.validation?.maxLength && value.length > fieldDef.validation.maxLength) {
          return `Must be at most ${fieldDef.validation.maxLength} characters`
        }
        if (fieldDef.validation?.pattern && !new RegExp(fieldDef.validation.pattern).test(value)) {
          return 'Invalid format'
        }
        break
    }

    return null
  }, [fields])

  const validateForm = useCallback((values: Record<string, any>): Record<string, string> => {
    const newErrors: Record<string, string> = {}

    fields.forEach(field => {
      if (!field.name) return
      const fieldErr = validateField(field.name, values[field.name])
      if (fieldErr) {
        newErrors[field.name] = fieldErr
      }
    })

    if (validate) {
      const customErrors = validate(values)
      Object.assign(newErrors, customErrors)
    }

    return newErrors
  }, [fields, validate, validateField])

  const handleChange = useCallback((field: string, value: any) => {
    const newData = { ...data, [field]: value }
    setData(newData)
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    setTouched(prev => ({ ...prev, [field]: true }))

    onChange?.(newData)
  }, [data, errors, onChange])

  const handleBlur = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    
    const error = validateField(field, data[field])
    setErrors(prev => ({
      ...prev,
      ...(error ? { [field]: error } : { [field]: '' })
    }))
  }, [data, validateField])

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    const allTouched = fields.reduce((acc, field) => {
      if (field.name) acc[field.name] = true
      return acc
    }, {} as Record<string, boolean>)
    setTouched(allTouched)

    const newErrors = validateForm(data)
    setErrors(newErrors)

    const isValid = Object.keys(newErrors).length === 0
    if (!isValid) {
      return
    }

    setIsSubmitting(true)
    setSubmitCount(prev => prev + 1)

    try {
      await onSubmit?.(data)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [data, fields, validateForm, onSubmit])

  const resetForm = useCallback(() => {
    setData(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
    setSubmitCount(0)
  }, [initialValues])

  const setFieldValue = useCallback((field: string, value: any) => {
    handleChange(field, value)
  }, [handleChange])

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: error
    }))
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const isValid = Object.keys(errors).length === 0
  const isDirty = Object.keys(touched).some(field => data[field] !== initialValues[field])

  return {
    data,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    clearErrors
  }
}
