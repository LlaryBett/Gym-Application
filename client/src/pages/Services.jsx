import React from 'react'
import { SERVICES } from '../utils/constants'

export default function Services() {
  const SERVICE_CATEGORIES = [
    {
      id: 1,
      category: 'Training',
      services: ['Personal Training', 'Group Classes', 'Online Coaching'],
    },
    {
      id: 2,
      category: 'Wellness',
      services: ['Nutrition Plans', 'Mental Health', 'Recovery Services'],
    },
    {
      id: 3,
      category: 'Facilities',
      services: ['State-of-the-art Equipment', 'Locker Rooms', 'Sauna & Steam'],
    },
  ]

  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Our <span className="text-orange-500">Services</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to achieve your fitness goals and transform your life
          </p>
        </div>
      </section>

      {/* ================= SERVICES GRID ================= */}
      <section className="py-16 bg-white" id="services">
        <div className="max-w-7xl mx-auto px-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((service) => (
              <div
                key={service.id}
                className="relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer flex flex-col"
              >
                {/* Image */}
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Hover Overlay including Start Training Button */}
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-white text-2xl font-bold mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-200 text-sm mb-4">{service.description}</p>

                  <button className="bg-black text-white px-6 py-3 rounded-full font-semibold bg-gray-800 transition">
                    Start Training
                  </button>
                </div>

                {/* Always-visible bottom title */}
                <div className="absolute bottom-0 left-0 w-full bg-black/40 text-white text-center py-3 font-semibold">
                  {service.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SERVICE CATEGORIES ================= */}
<section className="py-16 bg-white">
  <div className="max-w-7xl mx-auto px-16">
    {/* Inner container / card */}
    <div className="bg-gray-200 rounded-lg shadow-lg p-8 lg:p-12">

      {/* Header Row */}
      <div className="flex flex-col lg:flex-row items-center justify-between mb-12 gap-6">
        {/* Left — Main Header */}
        <div className="flex-shrink-0">
          <h2 className="text-3xl font-bold text-orange-500">Service Categories</h2>
        </div>

        {/* Center — Subheader */}
        <div className="flex-1 lg:ml-4">
          <p className="text-xl md:text-2xl font-semibold text-black">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICE_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="relative rounded-2xl overflow-hidden shadow-lg group bg-white"
          >
            {/* Top title */}
            <div className="bg-orange-500 text-white text-center py-3 font-bold text-lg">
              {cat.category}
            </div>

            {/* Services list */}
            <ul className="p-6 space-y-3 text-gray-700">
              {cat.services.map((service, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  {service}
                </li>
              ))}
            </ul>

            {/* Optional hover overlay (like featured cards) */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-white text-center px-4">Explore {cat.category}</p>
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
          Discover all categories of our services, from personal training to wellness and facility offerings.
        </p>
      </div>

    </div>
  </div>
</section>

    </div>
  )
}
