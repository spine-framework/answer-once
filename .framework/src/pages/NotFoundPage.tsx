// CIL[BEGIN stable_id="~/.framework/src/pages/NotFoundPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/NotFoundPage.tsx"]
/**
 * @module   NotFoundPage
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module renders a Not Found page for the application, providing users with a friendly message when they navigate to an undefined route. It serves as a fallback UI component, enhancing user experience by guiding them back to the home page. INVARIANT: The Not Found page should always be accessible for any invalid routes.
 *
 * @seeAlso react-router-dom (provides routing capabilities).
 * @seeAlso lucide-react (used for icons).
 *
 * @cil-generated
 */













import React from 'react'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react';
// CIL[END stable_id="~/.framework/src/pages/NotFoundPage.tsx:module_header:module_header"]



















// CIL[BEGIN stable_id="~/.framework/src/pages/NotFoundPage.tsx:NotFoundPage:component" type="component" identity="NotFoundPage" parent="~/.framework/src/pages/NotFoundPage.tsx"]
/**
 * The NotFoundPage component displays a 404 error message when a page is not found, providing a user-friendly interface to guide users back to the home page.
 *
 * @macro       React functional component responsible for rendering a 404 error page.
 * @micro       Utilizes JSX to structure the layout and styling of the error message and navigation link.
 * @outputSpec  JSX.Element
 * @sideEffects none
 * @stability   internal
 * @calls       Link
 * @cil-generated
 */
export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-slate-900">404</h1>
          <h2 className="mt-4 text-3xl font-bold text-slate-900">Page not found</h2>
          <p className="mt-2 text-sm text-slate-600">
            Sorry, we couldn't find the page you're looking for.
          </p>
          
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Home className="w-4 h-4 mr-2" />
              Go home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
// CIL[END stable_id="~/.framework/src/pages/NotFoundPage.tsx:NotFoundPage:component"]







