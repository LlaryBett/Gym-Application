import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/authHooks'
import { serviceService } from '../services/serviceService'

export default function Services() {
  const { user } = useAuth() // ✅ Need this for booking
  const navigate = useNavigate()
  
  const [services, setServices] = useState([])
  const [serviceCategories, setServiceCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  // For scrolling the services grid
  const [serviceIndex, setServiceIndex] = useState(0)
  const servicesPerPage = 4
  const totalServices = services.length
  const maxServiceIndex = Math.max(0, totalServices - servicesPerPage)
  const visibleServices = services.slice(serviceIndex, serviceIndex + servicesPerPage)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [servicesResponse, categoriesResponse] = await Promise.all([
        serviceService.getAllServices({ page: 1, limit: 20 }),
        serviceService.getAllServiceCategories()
      ])
      
      if (servicesResponse.success) {
        const formattedServices = servicesResponse.data.services.map(service => ({
          id: service.id,
          title: service.title,
          image: service.image,
          description: service.description
        }))
        setServices(formattedServices)
      }
      
      if (categoriesResponse.success) {
        const formattedCategories = categoriesResponse.data.map(cat => ({
          id: cat.id,
          category: cat.category,
          services: cat.services
        }))
        setServiceCategories(formattedCategories)
      }
      
    } catch (err) {
      console.error('Failed to fetch services:', err)
      setError(err.message || 'Failed to load services. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleStartTraining = (service) => {
    if (user) {
      // User is logged in - proceed to booking
      navigate(`/book-service/${service.id}`, { 
        state: { 
          service,
          from: 'services'
        } 
      })
    } else {
      // User is not logged in - show login prompt
      setSelectedService(service)
      setShowLoginPrompt(true)
    }
  }

  const handlePrev = () => setServiceIndex((prev) => Math.max(0, prev - servicesPerPage))
  const handleNext = () => setServiceIndex((prev) => Math.min(maxServiceIndex, prev + servicesPerPage))

  // Loading state
  if (loading) {
    return (
      <div>
        <section className="py-8 md:py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 md:px-16 text-center">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading services...</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div>
        <section className="py-8 md:py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 md:px-16 text-center">
            <div className="text-center py-12">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to load services</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={fetchAllData}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
              >
                Retry
              </button>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="py-8 md:py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-16 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Our <span className="text-orange-500">Services</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to achieve your fitness goals and transform your life
          </p>
        </div>
      </section>

      {/* ================= SERVICES GRID ================= */}
      <section className="py-8 md:py-16 bg-white" id="services">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          
          {/* Mobile: Horizontal Scroll */}
          <div className="md:hidden overflow-x-auto scrollbar-hide pb-4">
            <div className="flex gap-4 min-w-max">
              {visibleServices.map((service) => (
                <div
                  key={service.id}
                  className="relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer flex flex-col w-64"
                >
                  {/* Image */}
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = '/images/placeholder-service.jpg'
                    }}
                  />

                  {/* Hover Overlay including Start Training Button */}
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-white text-xl font-bold mb-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-200 text-xs mb-4">{service.description}</p>

                    <button 
                      className="bg-black text-white px-4 py-2 rounded-full font-semibold bg-gray-800 transition text-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartTraining(service)
                      }}
                    >
                      Start Training
                    </button>
                  </div>

                  {/* Always-visible bottom title */}
                  <div className="absolute bottom-0 left-0 w-full bg-black/40 text-white text-center py-2 font-semibold text-sm">
                    {service.title}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {visibleServices.map((service) => (
              <div
                key={service.id}
                className="relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer flex flex-col"
              >
                {/* Image */}
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = '/images/placeholder-service.jpg'
                  }}
                />

                {/* Hover Overlay including Start Training Button */}
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-white text-2xl font-bold mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-200 text-sm mb-4">{service.description}</p>

                  <button 
                    className="bg-black text-white px-6 py-3 rounded-full font-semibold bg-gray-800 transition text-base hover:bg-gray-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStartTraining(service)
                    }}
                  >
                    Start Training
                  </button>
                </div>

                {/* Always-visible bottom title */}
                <div className="absolute bottom-0 left-0 w-full bg-black/40 text-white text-center py-3 font-semibold text-base">
                  {service.title}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Row for navigation */}
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-3 md:gap-4">
              <button
                className="bg-white text-black px-3 md:px-4 py-2 rounded-full font-semibold shadow hover:bg-gray-100 transition text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handlePrev}
                disabled={serviceIndex === 0}
                aria-label="Previous"
              >
                &lt;
              </button>
              <button
                className="bg-white text-black px-3 md:px-4 py-2 rounded-full font-semibold shadow hover:bg-gray-100 transition text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleNext}
                disabled={serviceIndex >= maxServiceIndex}
                aria-label="Next"
              >
                &gt;
              </button>
            </div>
            <p className="max-w-md text-center sm:text-right text-gray-700 text-sm md:text-lg">
              Everything you need to achieve your fitness goals and transform your life
            </p>
          </div>
        </div>
      </section>

      {/* ================= SERVICE CATEGORIES ================= */}
      <section className="py-8 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          {/* Inner container / card */}
          <div className="bg-gray-200 rounded-lg shadow-lg p-4 md:p-8 lg:p-12">

            {/* Header Row */}
            <div className="flex flex-col lg:flex-row items-center justify-between mb-8 md:mb-12 gap-4 md:gap-6">
              {/* Left — Main Header */}
              <div className="flex-shrink-0">
                <h2 className="text-2xl md:text-3xl font-bold text-orange-500">Service Categories</h2>
              </div>

              {/* Center — Subheader */}
              <div className="flex-1 lg:ml-4">
                <p className="text-lg md:text-xl lg:text-2xl font-semibold text-black text-center lg:text-left">
                  Browse all our service categories
                </p>
              </div>

              {/* Right — Optional search or button placeholder */}
              <div className="flex-shrink-0 w-full lg:w-auto text-right">
                <div className="flex justify-end items-center gap-2 flex-wrap lg:flex-nowrap">
                  {/* Could add search or action button here */}
                </div>
              </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {serviceCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="relative rounded-2xl overflow-hidden shadow-lg group bg-white"
                >
                  {/* Top title */}
                  <div className="bg-orange-500 text-white text-center py-2 md:py-3 font-bold text-base md:text-lg">
                    {cat.category}
                  </div>

                  {/* Services list */}
                  <ul className="p-4 md:p-6 space-y-2 md:space-y-3 text-gray-700 text-sm md:text-base">
                    {cat.services.map((service, idx) => (
                      <li key={idx} className="flex items-center gap-2 md:gap-3">
                        <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></span>
                        {service}
                      </li>
                    ))}
                  </ul>

                  {/* Optional hover overlay (like featured cards) */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-center px-4 text-sm md:text-base">Explore {cat.category}</p>
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
                Discover all categories of our services, from personal training to wellness and facility offerings.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= LOGIN PROMPT MODAL ================= */}
      {showLoginPrompt && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowLoginPrompt(false)}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-orange-500 text-5xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold text-black-900 mb-2">Login Required</h3>
              <p className="text-gray-600 mb-6">
                Please log in to book {selectedService?.title}
              </p>
              <div className="flex gap-3">
                <button 
                  className="flex-1 bg-orange-500 text-white px-4 py-3 rounded-full font-semibold hover:bg-orange-600 transition"
                  onClick={() => {
                    setShowLoginPrompt(false)
                    navigate('/login', { 
                      state: { 
                        from: '/services',
                        serviceId: selectedService?.id 
                      } 
                    })
                  }}
                >
                  Log In
                </button>
                <button 
                  className="flex-1 border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
                  onClick={() => setShowLoginPrompt(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}