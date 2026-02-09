import { useState } from 'react'
import { NAV_LINKS } from '../utils/constants'
import Button from './Button'
import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const getActive = (path) => {
    // Remove hash if present and compare with current pathname
    const cleanPath = path.replace('#', '')
    return location.pathname === (cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white">
      <div className="absolute inset-0 bg-gradient-orange opacity-10" />

      <div className="container mx-auto px-4 md:px-16 py-2 md:py-4 relative">
        {/* Desktop Header */}
        <div className="flex md:grid md:grid-cols-3 items-center justify-between">
          {/* Logo — Left */}
          <Link
            className="flex items-center space-x-1 sm:space-x-2 cursor-pointer"
            to="/"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-full flex-shrink-0" />
            <span className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-black-900 whitespace-nowrap">
              Power<span className="text-orange-500">Gym</span>
            </span>
          </Link>

          {/* Navigation — Center */}
          <nav className="hidden md:flex justify-center space-x-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                to={link.path.replace('#', '/').replace(/^\/home$/, '/')}
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium transition-colors bg-transparent border-none cursor-pointer ${
                  getActive(link.path)
                    ? 'text-orange-500'
                    : 'text-black-700 hover:text-orange-500'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* CTAs — Right */}
          <div className="hidden md:flex items-center justify-end space-x-4">
            <Link to="/services" tabIndex={-1}>
              <Button
                variant="outline"
              >
                View Classes
              </Button>
            </Link>
            <Link to="/membership" tabIndex={-1}>
              <Button
                variant="accent"
              >
                Join Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              className="text-black-700 p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isMenuOpen
                      ? 'M6 18L18 6M6 6l12 12'
                      : 'M4 6h16M4 12h16M4 18h16'
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                to={link.path.replace('#', '/').replace(/^\/home$/, '/')}
                onClick={() => setIsMenuOpen(false)}
                className={`block py-2 font-medium bg-transparent border-none w-full text-left cursor-pointer ${
                  getActive(link.path)
                    ? 'text-orange-500'
                    : 'text-black-700 hover:text-orange-500'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile CTAs */}
            <div className="pt-3 flex gap-3">
              <Link to="/services" tabIndex={-1} onClick={() => setIsMenuOpen(false)} className="flex-1">
                <Button
                  variant="outline"
                  fullWidth
                >
                  View Classes
                </Button>
              </Link>
              <Link to="/membership" tabIndex={-1} onClick={() => setIsMenuOpen(false)} className="flex-1">
                <Button
                  variant="accent"
                  fullWidth
                >
                  Join Now
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
