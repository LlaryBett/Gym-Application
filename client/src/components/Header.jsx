import { useState } from 'react'
import { NAV_LINKS } from '../utils/constants'
import Button from './Button'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/authHooks'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()

  const getActive = (path) => {
    // Remove hash if present and compare with current pathname
    const cleanPath = path.replace('#', '')
    return location.pathname === (cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`)
  }

  // Get user initials from name
  const getUserInitials = () => {
    if (!user?.name) return 'U'
    const names = user.name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return names[0][0].toUpperCase()
  }

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
    setIsMenuOpen(false)
    navigate('/')
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
            
            {isAuthenticated ? (
              <div 
                className="relative"
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-10 h-10 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center hover:bg-orange-600 transition"
                >
                  {getUserInitials()}
                </button>
                
                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-gray-900 text-sm">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition text-sm"
                      onClick={() => setShowDropdown(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition text-sm"
                      onClick={() => setShowDropdown(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 transition text-sm"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/register" tabIndex={-1}>
                <Button
                  variant="accent"
                >
                  Join Now
                </Button>
              </Link>
            )}
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
              
              {isAuthenticated ? (
                <div className="flex-1 flex items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center">
                    {getUserInitials()}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-red-600 font-medium text-sm"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/register" tabIndex={-1} onClick={() => setIsMenuOpen(false)} className="flex-1">
                  <Button
                    variant="accent"
                    fullWidth
                  >
                    Join Now
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}