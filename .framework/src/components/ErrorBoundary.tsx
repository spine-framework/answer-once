// CIL[BEGIN stable_id="~/.framework/src/components/ErrorBoundary.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ErrorBoundary.tsx"]
/**
 * @module   ErrorBoundary
 * @audience internal
 * @layer    app-specific
 * @stability stable
 *
 * This module provides an Error Boundary component that captures JavaScript errors in its child component tree, logs those errors, and displays a fallback UI. It plays a crucial role in enhancing the user experience by preventing the entire application from crashing due to errors in specific components.
 * INVARIANT: The Error Boundary must wrap components that may throw errors to function correctly.
 *
 * @seeAlso ui/button (provides the button UI used in the fallback UI.)
 * @seeAlso ReactNode (used for rendering child components.)
 *
 * @cil-generated
 */

import { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from './ui/button'
// CIL[END stable_id="~/.framework/src/components/ErrorBoundary.tsx:module_header:module_header"]










// CIL[BEGIN stable_id="~/.framework/src/components/ErrorBoundary.tsx:ErrorBoundaryProps:interface" type="interface" identity="ErrorBoundaryProps" parent="~/.framework/src/components/ErrorBoundary.tsx"]
/**
 * ErrorBoundaryProps defines the properties for the ErrorBoundary component, which is used to handle errors in React component trees. It ensures that child components can be rendered safely even when an error occurs.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
interface ErrorBoundaryProps {
  children: ReactNode
}
// CIL[END stable_id="~/.framework/src/components/ErrorBoundary.tsx:ErrorBoundaryProps:interface"]











// CIL[BEGIN stable_id="~/.framework/src/components/ErrorBoundary.tsx:ErrorBoundaryState:interface" type="interface" identity="ErrorBoundaryState" parent="~/.framework/src/components/ErrorBoundary.tsx"]
/**
 * The ErrorBoundaryState interface defines the structure of the state used in an error boundary component to manage errors that occur during rendering. This facilitates organized error handling in React components.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
interface ErrorBoundaryState {
  error: Error | null
}
// CIL[END stable_id="~/.framework/src/components/ErrorBoundary.tsx:ErrorBoundaryState:interface"]












// CIL[BEGIN stable_id="~/.framework/src/components/ErrorBoundary.tsx:ErrorBoundary:class" type="class" identity="ErrorBoundary" parent="~/.framework/src/components/ErrorBoundary.tsx"]
/**
 * The ErrorBoundary class catches JavaScript errors in its child component tree, logs those errors, and displays a fallback UI to enhance user experience. This prevents the entire application from crashing due to UI errors.
 *
 * @macro       Error handling component that provides a fallback UI for its children upon encountering errors.
 * @micro       Utilizes React's error boundary lifecycle methods to manage error state and render fallback content.
 * @inputSpec
 *   props: ErrorBoundaryProps (required) — properties passed to the component.
 * @outputSpec  JSX.Element — renders either the children or an error fallback UI.
 * @sideEffects logs errors to the console
 * @stability   stable
 * @calls       console.error
 * @errorHandling none
 * @cil-generated
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) {
      return this.props.children
    }

    return (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <div className="text-center max-w-lg">
          <h1 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h1>
          <p className="text-sm text-muted-foreground mb-4">
            This page hit an unexpected error. The rest of the app is unaffected.
          </p>
          <pre className="bg-muted rounded-lg p-4 text-left text-xs text-destructive overflow-auto mb-4 max-h-40">
            {this.state.error.message}
          </pre>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => this.setState({ error: null })}>
              Try again
            </Button>
            <Button variant="outline" onClick={() => { window.location.href = '/spine-framework/admin/configs/types' }}>
              Back to admin home
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
// CIL[END stable_id="~/.framework/src/components/ErrorBoundary.tsx:ErrorBoundary:class"]


