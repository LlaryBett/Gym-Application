import React from 'react'
import { FaSearch } from 'react-icons/fa'
import { SERVICES } from '../utils/constants'
import { Link } from 'react-router-dom' // Added import

export const FeaturedServices = () => {
  const featuredServices = SERVICES.filter(service => service.featured)

  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-16">
        {/* Inner container / card */}
        <div className="bg-gray-200 rounded-lg shadow-lg p-4 md:p-8 lg:p-12">

          {/* Header Row */}
          <div className="flex flex-col lg:flex-row items-center justify-between mb-8 md:mb-12 gap-4 md:gap-6">
            
            {/* Left — Main Header */}
            <div className="flex-shrink-0">
              <h1 className="text-3xl md:text-4xl font-bold text-orange-500">Services</h1>
            </div>

            {/* Center — Subheader */}
            <div className="flex-1 lg:ml-4">
              <p className="text-lg md:text-xl lg:text-2xl font-semibold text-black text-center lg:text-left">
                Explore our featured services
              </p>
            </div>

            {/* Right — Search Bar with View All button */}
            <div className="flex-shrink-0 w-full lg:w-auto">
              <div className="flex flex-row justify-center lg:justify-end items-center gap-2">

                {/* Search input */}
                <div className="relative flex-1 sm:flex-initial min-w-0">
                  <input
                    type="text"
                    placeholder="Search services..."
                    className="px-4 py-2 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full text-sm md:text-base"
                  />
                  <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* View All button */}
                <Link
                  to="/services"
                  className="bg-black-900 text-white px-3 sm:px-4 py-2 rounded-full font-semibold hover:bg-black-500 transition-colors duration-200 text-center text-sm md:text-base whitespace-nowrap flex-shrink-0"
                >
                  View All
                </Link>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredServices.map(service => (
              <div
                key={service.id}
                className="relative rounded-2xl overflow-hidden shadow-lg group bg-white"
              >
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-48 md:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-white text-lg md:text-xl font-bold text-center px-2">
                    {service.title}
                  </h3>
                </div>

                {/* Always visible title */}
                <div className="absolute bottom-0 left-0 w-full bg-black/30 text-white text-center py-2 text-xs md:text-sm">
                  {service.title}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Row */}
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            
            {/* Navigation buttons */}
            <div className="flex gap-3 md:gap-4">
              <button className="bg-white text-black px-3 md:px-4 py-2 rounded-full font-semibold shadow hover:bg-gray-100 transition text-sm md:text-base">
                &lt;
              </button>
              <button className="bg-white text-black px-3 md:px-4 py-2 rounded-full font-semibold shadow hover:bg-gray-100 transition text-sm md:text-base">
                &gt;
              </button>
            </div>

            {/* Description */}
            <p className="max-w-md text-center sm:text-right text-gray-700 text-sm md:text-lg">
              Our services are designed to provide you with comprehensive fitness solutions,
              including personal training, group classes, nutrition guidance, and recovery options.
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
