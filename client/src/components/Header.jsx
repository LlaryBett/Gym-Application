import { useState } from 'react'
import { NAV_LINKS } from '../utils/constants'
import Button from './Button'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleNavClick = (path) => {
    // Extract section ID from path (e.g., "#home" or "home")
    const sectionId = path.startsWith('#') ? path.substring(1) : path.replace('/', '')
    const element = document.getElementById(sectionId)
    
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
    
    // Close mobile menu if open
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-white relative">
      <div className="absolute inset-0 bg-gradient-orange opacity-10" />

      <div className="container mx-auto px-4 py-4 relative">
        {/* Desktop Header */}
        <div className="grid grid-cols-3 items-center">
          {/* Logo — Left */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-orange-500 rounded-full" />
            <span className="text-2xl font-heading font-bold text-black-900">
              Power<span className="text-orange-500">Gym</span>
            </span>
          </div>

          {/* Navigation — Center */}
          <nav className="hidden md:flex justify-center space-x-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.path)}
                className="text-black-700 hover:text-orange-500 font-medium transition-colors bg-transparent border-none cursor-pointer"
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* CTAs — Right */}
          <div className="hidden md:flex items-center justify-end space-x-4">
            <Button variant="outline" onClick={() => handleNavClick('#services')}>View Classes</Button>
            <Button variant="accent" onClick={() => handleNavClick('#membership')}>Join Now</Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden justify-self-end">
            <button
              className="text-black-700"
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
              <button
                key={link.name}
                onClick={() => handleNavClick(link.path)}
                className="block py-2 text-black-700 hover:text-orange-500 font-medium bg-transparent border-none w-full text-left cursor-pointer"
              >
                {link.name}
              </button>
            ))}

            {/* Mobile CTAs */}
            <div className="pt-3 space-y-3">
              <Button variant="outline" fullWidth onClick={() => handleNavClick('#services')}>
                View Classes
              </Button>
              <Button variant="accent" fullWidth onClick={() => handleNavClick('#membership')}>
                Join Now
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}




