import Button from '../components/Button'
import Services from './Services'
import CTA from '../components/CTA'
import Benefits from '../components/Benefits'
import Recovery from '../components/Recovery'
import TestimonialCard from '../components/TestimonialCard'
import { FeaturedServices } from '../components/FeaturedServices'
export default function Home() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  const PARTNERS = [
  { 
    id: 1, 
    name: 'Nike', 
    logo: 'https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png', 
    color: 'from-red-600 to-red-400' 
  },
  { 
    id: 2, 
    name: 'Adidas', 
    logo: 'https://logos-world.net/wp-content/uploads/2020/04/Adidas-Logo.png', 
    color: 'from-black to-gray-800' 
  },
  { 
    id: 3, 
    name: 'Puma', 
    logo: 'https://logos-world.net/wp-content/uploads/2020/04/Puma-Logo.png', 
    color: 'from-blue-500 to-blue-300' 
  },
  { 
    id: 4, 
    name: 'Reebok', 
    logo: 'https://logos-world.net/wp-content/uploads/2020/04/Reebok-Logo.png', 
    color: 'from-gray-900 to-gray-700' 
  },
  { 
    id: 5, 
    name: 'Under Armour', 
    logo: 'https://logos-world.net/wp-content/uploads/2020/04/Under-Armour-Logo.png', 
    color: 'from-orange-500 to-yellow-500' 
  },
  { 
    id: 6, 
    name: 'New Balance', 
    logo: 'https://logos-world.net/wp-content/uploads/2020/09/New-Balance-Logo.png', 
    color: 'from-teal-500 to-cyan-400' 
  },
];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-8 md:py-12 overflow-hidden bg-gradient-to-b from-white to-gray-50">
        <div className="absolute inset-0 bg-gradient-orange opacity-10"></div>

        <div className="container mx-auto px-16 relative">
          {/* GRID */}
          <div className="grid lg:grid-cols-2 items-center gap-6">
            
            {/* LEFT — Text Content */}
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
                {/* Top line */}
                <span className="block">Be Ready</span>

                {/* Middle pill — horizontal, protruding */}
                <span className="block my-2">
                  <span className="inline-block bg-orange-500 text-white rounded-full font-semibold px-8 py-3 -ml-6 -mr-6 min-w-[180px] text-center">
                    For your
                  </span>
                </span>

                {/* Bottom line */}
                <span className="block text-black-900">Fitness</span>
              </h1>

              <p className="text-lg md:text-xl text-black-600 mb-6">
                Join the #1 fitness community with state-of-the-art equipment,
                expert <br />trainers, and a supportive environment to reach your goals.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="accent" 
                  size="md"
                  onClick={() => scrollToSection('membership')}
                >
                  Start Free Trial
                </Button>

                <button 
                  className="flex items-center justify-center gap-2 px-6 py-3 text-black-700 hover:text-orange-500 font-semibold transition-colors"
                  onClick={() => scrollToSection('services')}
                >
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                  Watch Video
                </button>
              </div>
            </div>

            {/* RIGHT — Decorative Circles */}
            <div className="relative hidden lg:block pointer-events-none">
              <div className="relative w-full h-[420px]">
                {/* Circle 1 */}
                <div
                  className="
                    absolute top-1/2 right-36
                    w-72 h-72
                    rounded-full
                    border-[14px]
                    border-orange-500/80
                    -translate-y-1/2
                    shadow-orange
                    z-10
                  "
                />

                {/* Circle 2 — large filled, clipped by viewport */}
                <div
                  className="
                    absolute top-1/2
                    -right-40
                    w-[420px] h-[420px]
                    bg-orange-100
                    rounded-full
                    opacity-90
                    -translate-y-1/2
                    z-0
                  "
                />

                {/* Image — Center, pushed slightly up */}
                <div className="absolute top-[40%] right-0 -translate-y-1/2 z-20 pointer-events-auto">
                  <img
                    src="/images/trainers/2148398787-removebg-preview.png"
                    alt="Trainer with battle rope"
                    className="w-[350px] h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

     

{/* Benefits Component */}

<Benefits />

<FeaturedServices />
<section className="py-12 bg-gradient-to-b from-white to-gray-300">
  <div className="container mx-auto px-4">
    
    {/* Divider — inside container so it matches px */}
    <div className="border-t border-gray-700 mb-8"></div>

    {/* Heading */}
    <div className="text-center mb-4">
      <h3 className="text-2xl font-bold">
        Our <span className="text-orange-500">Partners</span>
      </h3>
    </div>

    {/* Partners Grid */}
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 place-items-center">
      {PARTNERS.map((partner) => (
        <div key={partner.id} className="flex flex-col items-center text-center">
          
          {/* Logo */}
          <img
            src={partner.logo}
            alt={partner.name}
            className="h-12 w-auto object-contain"
          />

          {/* Name */}
          <p className="mt-2 text-sm font-medium text-black-700">
            {partner.name}
          </p>

        </div>
      ))}
    </div>

  </div>
</section>


<TestimonialCard />

      

      {/* CTA Component (from CTA.js) */}
      <CTA />
    </div>
  )
}