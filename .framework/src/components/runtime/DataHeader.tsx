/**
 * @module   DataHeader
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module defines the DataHeader component, which is responsible for rendering the header section of the data display interface in the application. It leverages React for UI rendering and integrates with React Router for navigation. INVARIANT: The component must always receive valid data props to render correctly.
 *
 * @seeAlso button.tsx (provides UI button functionality).
 * @seeAlso react-router-dom (enables navigation within the app).
 * @seeAlso lucide-react (provides iconography used in the component).
 *
 * @cil-generated
 */












import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import * as Icons from 'lucide-react'




















/**
 * DataHeaderProps defines the properties required for rendering a data header component, providing essential metadata such as title, icon, description, and a link for a new button.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
interface DataHeaderProps {
  title: string
  icon: string
  description: string
  newButtonHref: string
}



















/**
 * DataHeader is a React component that displays a header with a title, icon, and description, along with a button to create a new item. It facilitates navigation to a specified URL when the button is clicked.
 *
 * @macro       Header component for displaying metadata and navigation options.
 * @micro       Dynamically selects an icon component based on the provided icon name.
 * @inputSpec
 *   title: string (required) — the title to display in the header.
 *   icon: string (required) — the name of the icon to display.
 *   description: string (optional) — a brief description displayed under the title.
 *   newButtonHref: string (required) — the URL to navigate to when the button is clicked.
 * @outputSpec  JSX.Element — renders a header with title, icon, description, and a button.
 * @sideEffects navigates to a new URL when the button is clicked.
 * @stability   internal
 * @calls       useNavigate
 * @cil-generated
 */
export function DataHeader({ title, icon, description, newButtonHref }: DataHeaderProps) {
  const navigate = useNavigate()
  // Dynamically get the icon component
  const IconComponent = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[icon] || Icons.Box

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <IconComponent className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground capitalize">
            {title}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <Button
        onClick={() => navigate(newButtonHref)}

        className="flex items-center gap-2"
      >
        <Icons.Plus className="h-4 w-4" />
        New {title.slice(0, -1)}
      </Button>
    </div>
  )
}






