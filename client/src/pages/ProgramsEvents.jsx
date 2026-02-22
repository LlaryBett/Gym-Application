import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaSearch, FaUser, FaClock, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import CTA from '../components/CTA';
import { programService } from '../services/programService';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ProgramsEvents = () => {
  const [activeDay, setActiveDay] = useState('Mon');
  const [programs, setPrograms] = useState([]);
  const [schedules, setSchedules] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [programIndex, setProgramIndex] = useState(0);
  
  const programsPerPage = 4;
  const totalPrograms = programs.length;
  const maxIndex = Math.max(0, totalPrograms - programsPerPage);
  const visiblePrograms = programs.slice(programIndex, programIndex + programsPerPage);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [programsRes, schedulesRes] = await Promise.all([
        programService.getAllPrograms({ page: 1, limit: 8 }),
        programService.getAllSchedules()
      ]);
      
      if (programsRes.success) {
        const formattedPrograms = programsRes.data.programs.map(p => 
          programService.formatProgramForDisplay(p)
        );
        setPrograms(formattedPrograms);
      }
      
      if (schedulesRes.success) {
        setSchedules(schedulesRes.data);
      }
      
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load programs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    setProgramIndex((prev) => Math.max(0, prev - programsPerPage));
  };

  const handleNext = () => {
    setProgramIndex((prev) => Math.min(maxIndex, prev + programsPerPage));
  };

  const getDaySchedule = (day) => {
    if (!schedules || !schedules[day]) return [];
    return schedules[day].map(s => ({
      time: `${s.start_time?.substring(0,5)} - ${s.end_time?.substring(0,5)}`,
      name: s.class_name,
      id: s.program_id,
      instructor: s.instructor,
      location: s.location,
      enrolled: s.enrolled,
      capacity: s.capacity,
      program_title: s.program_title,
      program_image: s.program_image,
      status: s.status
    }));
  };

  // Helper to get status badge color
  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      'full': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Full' },
      'default': { bg: 'bg-gray-100', text: 'text-gray-800', label: status }
    };
    
    const config = statusConfig[status] || statusConfig.default;
    return (
      <span className={`${config.bg} ${config.text} px-2 py-0.5 rounded-full text-xs font-medium`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="pt-14 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-16 py-16">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading programs...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-14 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-16 py-16">
          <div className="text-center py-12">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to load programs</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchData}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ================= PROGRAMS GRID ================= */}
      <section className="py-8 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          {/* Inner Card Container */}
          <div className="bg-gray-200 rounded-lg shadow-lg p-4 md:p-8 lg:p-12">

            {/* Header Row */}
            <div className="flex flex-col lg:flex-row items-center justify-between mb-8 md:mb-12 gap-4 md:gap-6">
              <div className="flex-shrink-0">
                <h1 className="text-3xl md:text-4xl font-bold text-orange-500">Programs</h1>
              </div>

              <div className="flex-1 lg:ml-4">
                <p className="text-lg md:text-xl lg:text-2xl font-semibold text-black text-center lg:text-left">
                  Explore all our programs
                </p>
              </div>

              <div className="flex-shrink-0 w-full lg:w-auto">
                <div className="flex flex-row justify-center lg:justify-end items-center gap-2">
                  <div className="relative flex-1 sm:flex-initial min-w-0">
                    <input
                      type="text"
                      placeholder="Search programs..."
                      className="px-4 py-2 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full text-sm md:text-base"
                    />
                    <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  <Link
                    to="/programs"
                    className="bg-black-900 text-white px-3 sm:px-4 py-2 rounded-full font-semibold hover:bg-black-500 transition-colors duration-200 text-center text-sm md:text-base whitespace-nowrap flex-shrink-0"
                  >
                    View All
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile: Horizontal Scroll */}
            <div className="lg:hidden overflow-x-auto scrollbar-hide pb-4">
              <div className="flex gap-4 min-w-max">
                {visiblePrograms.map(program => (
                  <div
                    key={program.id}
                    className="relative rounded-2xl overflow-hidden shadow-lg group bg-white w-64"
                  >
                    <img
                      src={program.image}
                      alt={program.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="text-white text-lg font-bold mb-2">
                        {program.title}
                      </h3>
                      <p className="text-gray-200 text-xs mb-4">{program.description}</p>
                      <Link
                        to={`/programs/${program.id}`}
                        className="bg-orange-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-orange-600 transition text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full bg-black/30 text-white text-center py-2 text-xs flex items-center justify-center gap-2">
                      <FaCalendarAlt />
                      <span>{program.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop: Grid Layout */}
            <div className="hidden lg:grid grid-cols-4 gap-6">
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
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-white text-xl font-bold mb-2">
                      {program.title}
                    </h3>
                    <p className="text-gray-200 text-sm mb-4">{program.description}</p>
                    <Link
                      to={`/programs/${program.id}`}
                      className="bg-orange-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-orange-600 transition text-base"
                    >
                      View Details
                    </Link>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full bg-black/30 text-white text-center py-2 text-sm flex items-center justify-center gap-2">
                    <FaCalendarAlt />
                    <span>{program.title}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Row */}
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex gap-3 md:gap-4">
                <button
                  className="bg-white text-black px-3 md:px-4 py-2 rounded-full font-semibold shadow hover:bg-gray-100 transition text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handlePrev}
                  disabled={programIndex === 0}
                  aria-label="Previous"
                >
                  &lt;
                </button>
                <button
                  className="bg-white text-black px-3 md:px-4 py-2 rounded-full font-semibold shadow hover:bg-gray-100 transition text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleNext}
                  disabled={programIndex >= maxIndex}
                  aria-label="Next"
                >
                  &gt;
                </button>
              </div>
              <p className="max-w-md text-center sm:text-right text-gray-700 text-sm md:text-lg">
                Our programs include personal coaching, group workouts, wellness events, and recovery sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CLASS SCHEDULE ================= */}
      <section className="py-8 md:py-16 bg-gray-50" id="class-schedule">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-10">
            Class <span className="text-orange-500">Schedule</span>
          </h2>

          <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
            
            {/* Left — Video */}
            <div className="lg:w-1/2 flex justify-center items-center">
              <div className="w-full h-48 sm:h-64 lg:h-[400px] bg-gray-300 rounded-xl overflow-hidden flex justify-center items-center">
                <video
                  src="/10381187-hd_1280_720_30fps.mp4"
                  autoPlay
                  loop
                  muted
                  className="w-full h-full object-cover"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            {/* Right — Timetable */}
            <div className="lg:w-1/2 flex flex-col">
              {/* Day Toggle - Fixed hover issue */}
              <div className="flex gap-1 md:gap-2 mb-4 md:mb-6 bg-white p-1 md:p-2 rounded-full border shadow-sm overflow-x-auto">
                {DAYS.map(day => (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`flex-1 py-2 rounded-full text-xs md:text-sm font-semibold transition-colors whitespace-nowrap ${
                      activeDay === day
                        ? 'bg-orange-500 text-white hover:bg-orange-600' // ✅ Fixed: Now uses orange and has hover state
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200' // ✅ Fixed: Has background even when not active
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Timetable with Instructor & Status - No booked spots */}
              <div className="bg-white rounded-xl border shadow-sm divide-y flex flex-col">
                {getDaySchedule(activeDay).length > 0 ? (
                  getDaySchedule(activeDay).map((item, idx) => (
                    <div key={idx} className="p-4 md:p-6 hover:bg-gray-50 transition">
                      {/* Top row - Time and Status */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <FaClock className="text-orange-500 text-xs" />
                          <span className="text-gray-500 font-medium text-xs md:text-sm">{item.time}</span>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>

                      {/* Class Name and Program */}
                      <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2">{item.name}</h3>
                      <p className="text-xs text-gray-500 mb-3">Part of: {item.program_title}</p>

                      {/* Instructor and Location */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-orange-500 text-xs" />
                          <span className="text-gray-700 text-xs md:text-sm">{item.instructor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-orange-500 text-xs" />
                          <span className="text-gray-700 text-xs md:text-sm">{item.location}</span>
                        </div>
                      </div>

                      {/* Bottom row - All members welcome message */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <FaUsers className="text-orange-500 text-xs" />
                          <span className="text-xs text-gray-600">
                            All members welcome • Just show up and join!
                          </span>
                        </div>
                        <Link
                          to={`/programs/${item.id}`}
                          className="bg-black text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-gray-800 transition"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 md:px-6 py-6 md:py-8 text-center text-gray-500 text-sm md:text-base">
                    No classes scheduled for {activeDay}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      <CTA />
    </div>
  );
};

export default ProgramsEvents;