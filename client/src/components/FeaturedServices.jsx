import React from 'react'
import { FaSearch } from 'react-icons/fa'
import { SERVICES } from '../utils/constants'
import { Link } from 'react-router-dom' // Added import

export const FeaturedServices = () => {
  const featuredServices = SERVICES.filter(service => service.featured)

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-16">
        {/* Inner container / card */}
        <div className="bg-gray-200 rounded-lg shadow-lg p-8 lg:p-12">

          {/* Header Row */}
          <div className="flex flex-col lg:flex-row items-center justify-between mb-12 gap-6">
            
            {/* Left — Main Header */}
            <div className="flex-shrink-0">
              <h1 className="text-4xl font-bold text-orange-500">Services</h1>
            </div>

            {/* Center — Subheader */}
            <div className="flex-1 lg:ml-4">
              <p className="text-xl md:text-2xl font-semibold text-black">
                Explore our featured services
              </p>
            </div>

            {/* Right — Search Bar with View All button */}
            <div className="flex-shrink-0 w-full lg:w-auto text-right">
              <div className="flex justify-end items-center gap-2 flex-wrap lg:flex-nowrap">

                {/* Search input */}
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search services..."
                    className="px-4 py-2 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
                  />
                  <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* View All button (fixed) */}
                <Link
                  to="/services"
                  className="bg-black-900 text-white px-4 py-2 rounded-full font-semibold hover:bg-black-500 transition-colors duration-200"
                >
                  View All
                </Link>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map(service => (
              <div
                key={service.id}
                className="relative rounded-2xl overflow-hidden shadow-lg group bg-white"
              >
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-white text-xl font-bold text-center px-2">
                    {service.title}
                  </h3>
                </div>

                {/* Always visible title */}
                <div className="absolute bottom-0 left-0 w-full bg-black/30 text-white text-center py-2 text-sm">
                  {service.title}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Row */}
          <div className="mt-8 flex justify-between items-center">
            
            {/* Navigation buttons */}
            <div className="flex gap-4">
              <button className="bg-white text-black px-4 py-2 rounded-full font-semibold shadow hover:bg-gray-100 transition">
                &lt;
              </button>
              <button className="bg-white text-black px-4 py-2 rounded-full font-semibold shadow hover:bg-gray-100 transition">
                &gt;
              </button>
            </div>

            {/* Description */}
            <p className="max-w-md text-right text-gray-700 text-lg">
              Our services are designed to provide you with comprehensive fitness solutions,
              including personal training, group classes, nutrition guidance, and recovery options.
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
