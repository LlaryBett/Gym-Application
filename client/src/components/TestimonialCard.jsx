import React, { useState, useEffect } from 'react'

const TestimonialCard = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const TESTIMONIALS = [
    {
      id: 1,
      name: "John Smith",
      role: "Regular Member",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      testimonial: "This gym changed my life! The trainers are incredibly supportive and knowledgeable.",
      featured: false,
      size: "regular"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      role: "Fitness Enthusiast",
      image: "https://img.freepik.com/premium-photo/gym-membership-personal-trainer-black-man-holding-sign-up-clipboard-heath-wellness-subscription-healthy-lifestyle-portrait-happy-male-coach-holding-paperwork-join-fitness-club_590464-96992.jpg?semt=ais_hybrid&w=740&q=80",
      testimonial: "Best decision I made. The facilities are top-notch and the community is amazing.",
      featured: false,
      size: "regular"
    },
    {
      id: 3,
      name: "Michael Chen",
      role: "Transformed Member",
      image: "https://images.unsplash.com/photo-1507539776725-18a9d532aae7?w=400&q=80",
      testimonial: "Lost 50 pounds in 6 months with the help of their expert trainers. Highly recommend — the structure, accountability, and support made all the difference.",
      featured: true,
      size: "large",
      date: "2026-01-15",          // example date of transformation/testimonial
      group: "Weight Loss Program", // group or class they belong to
      coach: "Sarah Johnson"        // assigned coach/trainer
    },
    {
      id: 4,
      name: "Lisa Anderson",
      role: "Corporate Client",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
      testimonial: "Perfect work-life balance with their flexible membership options.",
      featured: false,
      size: "regular"
    },
    {
      id: 5,
      name: "David Martinez",
      role: "Strength Coach",
      image: "https://images.unsplash.com/photo-1507539776725-18a9d532aae7?w=400&q=80",
      testimonial: "The equipment quality and trainer expertise is unmatched in the city.",
      featured: false,
      size: "regular"
    },
    {
      id: 6,
      name: "Emma Wilson",
      role: "Marathon Runner",
      image: "https://images.unsplash.com/photo-1514888286974-6c03bf1a7c64?w=400&q=80",
      testimonial: "Their conditioning programs helped me complete my first marathon!",
      featured: true,
      size: "medium-large"
    },
  ]

  // Auto-play for mobile: change testimonial every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % 4) // 4 cards total
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + 4) % 4)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % 4)
  }

  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="container mx-auto px-4 md:px-16">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start justify-between mb-8 md:mb-12 gap-4 md:gap-6">
          
          {/* Left — Main Header with Mobile Navigation */}
          <div className="lg:w-1/3 text-left w-full flex items-center justify-between">
            <h2 className="text-3xl md:text-4xl font-bold text-orange-500">Testimonials</h2>
            
            {/* Navigation Buttons - Mobile only, next to heading */}
            <div className="flex sm:hidden gap-3">
              <button onClick={handlePrev} className="bg-white text-black px-3 py-2 rounded-full font-semibold shadow hover:bg-gray-100 transition text-sm">
                &lt;
              </button>
              <button onClick={handleNext} className="bg-white text-black px-3 py-2 rounded-full font-semibold shadow hover:bg-gray-100 transition text-sm">
                &gt;
              </button>
            </div>
          </div>

          {/* Center — Subheader */}
          <div className="lg:w-1/3 text-left lg:text-center w-full">
            <p className="text-lg md:text-xl lg:text-2xl font-semibold text-black-900">
              What our Clients are saying <br/><span className="text-orange-500">about us</span>
            </p>
          </div>

          {/* Right — Brief Description */}
          <div className="lg:w-1/3 text-left lg:text-right w-full">
            <p className="text-black-700 text-sm md:text-base">
              Our members have transformed their lives through dedication and our world-class training programs. Their success is our greatest achievement.
            </p>
          </div>
        </div>

        {/* Mobile Carousel - Only visible on mobile */}
        <div className="sm:hidden">
          <div className="overflow-hidden">
            {/* Card 1 - Orange testimonial card */}
            {currentIndex === 0 && (
              <div className="flex flex-col items-center w-full">
                <div className="bg-orange-500 rounded-xl shadow-lg min-h-36 w-full p-4 flex flex-col">
                  <div className="flex items-start gap-3">
                    <img
                      src={TESTIMONIALS[0].image}
                      alt={TESTIMONIALS[0].name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-black-900 text-sm">{TESTIMONIALS[0].name}</h4>
                      <p className="text-black-800 text-xs">{TESTIMONIALS[0].role}</p>
                      <p className="text-black-900 text-xs italic mt-2 leading-relaxed">
                        "{TESTIMONIALS[0].testimonial}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Card 2 - Image only */}
            {currentIndex === 1 && (
              <div className="flex flex-col items-center w-full">
                <div className="w-full h-64 rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={TESTIMONIALS[1].image}
                    alt={TESTIMONIALS[1].name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Card 3 - Spotlight / Text Only */}
            {currentIndex === 2 && (
              <div className="flex flex-col items-center w-full">
                <div className="bg-orange-500/10 rounded-xl shadow-lg h-auto w-full p-4 flex flex-col">
                  <h4 className="font-bold text-black-900 text-base mb-3">
                    {TESTIMONIALS[2].name}
                  </h4>

                  <div className="grid grid-cols-3 gap-2 md:gap-4 text-black-700 text-xs mb-4 sm:mb-0">
                    <div>
                      <p className="font-semibold text-black-900">Date</p>
                      <p>{TESTIMONIALS[2].date}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-black-900">Group</p>
                      <p>{TESTIMONIALS[2].group}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-black-900">Coach</p>
                      <p>{TESTIMONIALS[2].coach}</p>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-16">
                    <p className="text-black-900 italic text-xs md:text-sm leading-relaxed mb-4">
                      "{TESTIMONIALS[2].testimonial}"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Card 4 - Image Only (same as card 1 image) */}
            {currentIndex === 3 && (
              <div className="flex flex-col items-center w-full">
                <div className="rounded-xl shadow-lg w-full h-36 overflow-hidden">
                  <img
                    src={TESTIMONIALS[0].image}
                    alt={TESTIMONIALS[0].name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2, 3].map((index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'w-6 bg-orange-500' : 'w-1.5 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Masonry Grid — Hidden on mobile, unchanged for desktop */}
        <div className="hidden sm:flex flex-col sm:flex-row sm:flex-wrap gap-3 md:gap-4">
          {/* Testimonial 1 */}
          <div className="flex flex-col items-center w-full sm:w-64">
            <div className="bg-orange-500 rounded-xl shadow-lg min-h-36 w-full p-4 flex flex-col">
              <div className="flex items-start gap-3 md:gap-4">
                <img
                  src={TESTIMONIALS[0].image}
                  alt={TESTIMONIALS[0].name}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
                />
                <div>
                  <h4 className="font-bold text-black-900 text-sm md:text-base">{TESTIMONIALS[0].name}</h4>
                  <p className="text-black-800 text-xs">{TESTIMONIALS[0].role}</p>
                  <p className="text-black-900 text-xs md:text-sm italic mt-2 leading-relaxed">
                    "{TESTIMONIALS[0].testimonial}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial 2 — Narrowed Width */}
          <div className="flex flex-col items-center w-full sm:w-44">
            <div className="w-full h-64 sm:h-80 rounded-xl overflow-hidden shadow-lg">
              <img
                src={TESTIMONIALS[1].image}
                alt={TESTIMONIALS[1].name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Testimonial 3 — Spotlight / Text Only */}
          <div className="flex-1 flex flex-col items-center min-w-full sm:min-w-[200px]">
            <div className="bg-orange-500/10 rounded-xl shadow-lg h-auto sm:h-80 w-full p-4 md:p-6 flex flex-col">
              
              {/* Name */}
              <h4 className="font-bold text-black-900 text-base md:text-lg mb-3 md:mb-4">
                {TESTIMONIALS[2].name}
              </h4>

              {/* Meta grid */}
              <div className="grid grid-cols-3 gap-2 md:gap-4 text-black-700 text-xs mb-4 sm:mb-0">
                <div>
                  <p className="font-semibold text-black-900">Date</p>
                  <p>{TESTIMONIALS[2].date}</p>
                </div>
                <div>
                  <p className="font-semibold text-black-900">Group</p>
                  <p>{TESTIMONIALS[2].group}</p>
                </div>
                <div>
                  <p className="font-semibold text-black-900">Coach</p>
                  <p>{TESTIMONIALS[2].coach}</p>
                </div>
              </div>

              {/* PUSH EVERYTHING BELOW TO THE BOTTOM */}
              <div className="mt-4 sm:mt-16">
                <p className="text-black-900 italic text-xs md:text-sm leading-relaxed mb-4">
                  "{TESTIMONIALS[2].testimonial}"
                </p>
              </div>

            </div>
          </div>

          {/* Testimonial 1 — Image Only */}
          <div className="flex flex-col items-center w-full sm:w-64">
            <div className="rounded-xl shadow-lg w-full h-36 overflow-hidden">
              <img
                src={TESTIMONIALS[0].image}
                alt={TESTIMONIALS[0].name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

export default TestimonialCard