import {
  createRootRoute,
  Outlet,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { ConvexClientProvider } from '../convex'
import { useState, useEffect } from 'react'
import { KeyboardShortcutPopup } from '../components'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Chat Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  component: () => (
    <RootDocument>
      <Outlet />
      <TanStackRouterDevtools />
    </RootDocument>
  ),
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const [isShortcutPopupOpen, setIsShortcutPopupOpen] = useState(false)

  // Global keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsShortcutPopupOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <ConvexClientProvider>
          {children}
          <KeyboardShortcutPopup
            isOpen={isShortcutPopupOpen}
            onClose={() => setIsShortcutPopupOpen(false)}
          />
        </ConvexClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
