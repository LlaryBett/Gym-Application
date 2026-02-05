import { useState } from 'react'
import { PROGRAMS } from '../utils/constants'
import { FaCalendarAlt, FaSearch } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import CTA from '../components/CTA'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const SCHEDULE = {
  Mon: [
    { time: '06:00 - 07:00', name: 'Morning Strength' },
    { time: '09:00 - 10:00', name: 'HIIT' },
    { time: '18:00 - 19:00', name: 'Yoga Flow' },
  ],
  Tue: [
    { time: '07:00 - 08:00', name: 'Group Training' },
    { time: '12:00 - 13:00', name: 'Core Blast' },
    { time: '18:30 - 19:30', name: 'Stretch & Mobility' },
  ],
  Wed: [
    { time: '06:30 - 07:30', name: 'Strength & Conditioning' },
    { time: '17:00 - 18:00', name: 'HIIT' },
  ],
  Thu: [
    { time: '07:00 - 08:00', name: 'Bootcamp' },
    { time: '18:00 - 19:00', name: 'Upper Body' },
  ],
  Fri: [
    { time: '06:00 - 07:00', name: 'Full Body Burn' },
    { time: '17:30 - 18:30', name: 'Cardio' },
  ],
  Sat: [
    { time: '09:00 - 10:00', name: 'Bootcamp' },
    { time: '11:00 - 12:00', name: 'Core Training' },
  ],
  Sun: [
    { time: '10:00 - 11:00', name: 'Yoga & Recovery' },
  ],
}

const ProgramsEvents = () => {
  const [activeDay, setActiveDay] = useState('Mon')
  const [programIndex, setProgramIndex] = useState(0)
  const programsPerPage = 4

  const totalPrograms = PROGRAMS.length
  const maxIndex = Math.max(0, totalPrograms - programsPerPage)
  const visiblePrograms = PROGRAMS.slice(programIndex, programIndex + programsPerPage)

  const handlePrev = () => {
    setProgramIndex((prev) => Math.max(0, prev - programsPerPage))
  }

  const handleNext = () => {
    setProgramIndex((prev) => Math.min(maxIndex, prev + programsPerPage))
  }

  return (
    <div>
      {/* ================= HERO / HEADER ================= */}
      

      {/* ================= PROGRAMS GRID ================= */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-16">
          {/* Inner Card Container */}
          <div className="bg-gray-200 rounded-lg shadow-lg p-8 lg:p-12">

            {/* Header Row */}
            <div className="flex flex-col lg:flex-row items-center justify-between mb-12 gap-6">
              <div className="flex-shrink-0">
                <h1 className="text-4xl font-bold text-orange-500">Programs</h1>
              </div>

              <div className="flex-1 lg:ml-4">
                <p className="text-xl md:text-2xl font-semibold text-black">
                  Explore all our programs
                </p>
              </div>

              <div className="flex-shrink-0 w-full lg:w-auto text-right">
                <div className="flex justify-end items-center gap-2 flex-wrap lg:flex-nowrap">

                  {/* Search Input */}
                  <div className="relative w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search programs..."
                      className="px-4 py-2 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
                    />
                    <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>

                  {/* View All */}
                  <Link
                    to="/programs"
                    className="bg-black text-white px-4 py-2 rounded-full font-semibold hover:bg-gray-800 transition-colors duration-200"
                  >
                    View All
                  </Link>
                </div>
              </div>
            </div>

            {/* Programs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visiblePrograms.map(program => (
                <div
                  key={program.id}
                  className="relative rounded-2xl overflow-hidden shadow-lg group bg-white"
                >
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-white text-xl font-bold text-center px-2">
                      {program.title}
                    </h3>
                  </div>

                  {/* Always visible title */}
                  <div className="absolute bottom-0 left-0 w-full bg-black/30 text-white text-center py-2 text-sm flex items-center justify-center gap-2">
                    <FaCalendarAlt />
                    <span>{program.title}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Row */}
            <div className="mt-8 flex justify-between items-center">
              <div className="flex gap-4">
                <button
                  className="bg-white text-black px-4 py-2 rounded-full font-semibold shadow hover:bg-gray-100 transition"
                  onClick={handlePrev}
                  disabled={programIndex === 0}
                  aria-label="Previous"
                >
                  &lt;
                </button>
                <button
                  className="bg-white text-black px-4 py-2 rounded-full font-semibold shadow hover:bg-gray-100 transition"
                  onClick={handleNext}
                  disabled={programIndex >= maxIndex}
                  aria-label="Next"
                >
                  &gt;
                </button>
              </div>

              <p className="max-w-md text-right text-gray-700 text-lg">
                Our programs include personal coaching, group workouts, wellness events, and recovery sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CLASS SCHEDULE ================= */}
<section className="py-16 bg-gray-50" id="class-schedule">
  <div className="max-w-6xl mx-auto px-4">
    <h2 className="text-3xl font-bold text-center mb-10">
      Class <span className="text-orange-500">Schedule</span>
    </h2>

    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* Left — Video */}
      <div className="lg:w-1/2 flex justify-center items-center">
        <div className="w-full h-64 lg:h-[400px] bg-gray-300 rounded-xl overflow-hidden flex justify-center items-center">
          <video
            src="/videos/class-preview.mp4"
            controls
            className="w-full h-full object-cover"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* Right — Timetable */}
      <div className="lg:w-1/2 flex flex-col">
        {/* Day Toggle */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-full border shadow-sm">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition
                ${activeDay === day
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Timetable */}
        <div className="bg-white rounded-xl border shadow-sm divide-y flex flex-col">
          {SCHEDULE[activeDay]?.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-6 py-4"
            >
              <span className="text-gray-500 font-medium">{item.time}</span>
              <span className="font-semibold text-gray-800">{item.name}</span>
              <button className="bg-black text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition">
                Book
              </button>
            </div>
          ))}

          {SCHEDULE[activeDay]?.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No classes scheduled
            </div>
          )}
        </div>
      </div>

    </div>
  </div>
</section>


      <CTA />
    </div>
  )
}

export default ProgramsEvents
