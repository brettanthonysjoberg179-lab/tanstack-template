import { createFileRoute, Link } from '@tanstack/react-router'

function BrettAppsDevApp() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center text-orange-500 hover:text-orange-400 mb-4"
            >
              ← Back to Chat
            </Link>
            <h1 className="text-4xl font-bold mb-4">Brett Apps Dev App</h1>
            <p className="text-gray-400 text-lg">
              Welcome to the Brett Apps Development Application
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <section>
              <h2 className="text-2xl font-semibold mb-3">About This Page</h2>
              <p className="text-gray-300">
                This is a new route created using TanStack Router. It demonstrates
                the file-based routing system and navigation capabilities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Features</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Built with TanStack Router</li>
                <li>Styled with Tailwind CSS</li>
                <li>Responsive design</li>
                <li>SPA navigation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Getting Started</h2>
              <p className="text-gray-300">
                This page serves as a template for building new features in your
                TanStack application. You can extend it with your own components,
                data fetching logic, and state management.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/brettappsdevapp')({
  component: BrettAppsDevApp,
})
