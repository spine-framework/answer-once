// CIL[BEGIN stable_id="~/.framework/src/components/ui/Modal.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/Modal.tsx"]
// CIL[DOC-MACRO purpose="shadcn/ui Modal component module built on Radix UI Dialog"]
// CIL[DOC-RESPONSIBILITY responsibility="Imports dialog primitives and utils, then exports Modal and ModalFooter components"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/dialog.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Modal and ModalFooter components, plus their prop interfaces" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, the cn utility, and local Dialog primitives; declares the public component exports" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="frontend"]







import React from 'react'
import { cn } from '../../lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './dialog'
// CIL[DOC-VECTOR type="context" content="purpose='shadcn/ui Modal component module built on Radix UI Dialog'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/dialog.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/Modal.tsx:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/src/components/ui/Modal.tsx:ModalProps:interface" type="interface" identity="ModalProps" parent="~/.framework/src/components/ui/Modal.tsx"]
// CIL[DOC-MACRO purpose="Defines the prop contract for the Modal component"]
// CIL[DOC-RESPONSIBILITY responsibility="Declares the configuration surface for Modal consumers"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/Modal.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="ModalProps TypeScript interface" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Optional title and description, required open state, close callback, children, and a size union" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the prop contract for the Modal component'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/dialog.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/Modal.tsx:ModalProps:interface"]


// CIL[BEGIN stable_id="~/.framework/src/components/ui/Modal.tsx:Modal:component" type="component" identity="Modal" parent="~/.framework/src/components/ui/Modal.tsx"]
// CIL[DOC-MACRO purpose="Renders an accessible modal dialog with configurable size and optional header"]
// CIL[DOC-RESPONSIBILITY responsibility="Mounts a Dialog, applies size-based width classes, and renders optional title and description"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/Modal.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="isOpen: boolean, onClose: () => void, title?: string, description?: string, children: React.ReactNode, size?: 'sm'|'md'|'lg'|'xl'" outputs="JSX.Element" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Maps size prop to Tailwind max-width classes and conditionally renders a DialogHeader" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: ModalProps) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(sizeClasses[size])}>
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders an accessible modal dialog with configurable size and optional header'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/dialog.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/Modal.tsx:Modal:component"]


// CIL[BEGIN stable_id="~/.framework/src/components/ui/Modal.tsx:ModalFooterProps:interface" type="interface" identity="ModalFooterProps" parent="~/.framework/src/components/ui/Modal.tsx"]
// CIL[DOC-MACRO purpose="Defines the prop contract for the ModalFooter component"]
// CIL[DOC-RESPONSIBILITY responsibility="Declares the configuration surface for ModalFooter consumers"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/Modal.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="ModalFooterProps TypeScript interface" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Optional className and required children for the footer content" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface ModalFooterProps {
  children: React.ReactNode
  className?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the prop contract for the ModalFooter component'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/dialog.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/Modal.tsx:ModalFooterProps:interface"]


// CIL[BEGIN stable_id="~/.framework/src/components/ui/Modal.tsx:ModalFooter:component" type="component" identity="ModalFooter" parent="~/.framework/src/components/ui/Modal.tsx"]
// CIL[DOC-MACRO purpose="Renders a right-aligned, bordered footer for modal actions"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides a styled container for modal action buttons"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/Modal.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="children: React.ReactNode, className?: string" outputs="JSX.Element" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Composes a flex row with gap and top border, allowing an extra className" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cn('flex justify-end gap-3 border-t px-6 py-4 mt-6', className)}>
      {children}
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a right-aligned, bordered footer for modal actions'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/dialog.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/Modal.tsx:ModalFooter:component"]
