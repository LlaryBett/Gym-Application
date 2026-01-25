import React from 'react'

const TestimonialCard = () => {
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
  testimonial: "Lost 50 pounds in 6 months with the help of their expert trainers. Highly recommend — the structure, accountability, and support made all the difference.",
  featured: true,
  size: "large",
  date: "2026-01-15",          // example date of transformation/testimonial
  group: "Weight Loss Program", // group or class they belong to
  coach: "Sarah Johnson"        // assigned coach/trainer
}
,
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

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-16">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start justify-between mb-12 gap-6">
          
          {/* Left — Main Header */}
          <div className="lg:w-1/3 text-left">
            <h2 className="text-4xl font-bold text-orange-500">Testimonials</h2>
          </div>

          {/* Center — Subheader */}
          <div className="lg:w-1/3 text-center">
            <p className="text-xl md:text-2xl font-semibold text-black-900">
              What our Clients are saying  <br/><span className="text-orange-500">about  us </span>
            </p>
          </div>

          {/* Right — Brief Description */}
          <div className="lg:w-1/3 text-right">
            <p className="text-black-700">
              Our members have transformed their lives through dedication and our world-class training programs. Their success is our greatest achievement.
            </p>
          </div>
        </div>

        {/* Masonry Grid — Flex Version */}
<div className="flex flex-wrap gap-x-1 gap-y-3">

  {/* Testimonial 1 */}
  <div className="flex flex-col items-center w-64">
    <div className="bg-orange-500 rounded-xl shadow-lg min-h-36 w-full p-4 flex flex-col">
      <div className="flex items-start gap-4">
        <img
          src={TESTIMONIALS[0].image}
          alt={TESTIMONIALS[0].name}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
        <div>
          <h4 className="font-bold text-black-900 text-sm">{TESTIMONIALS[0].name}</h4>
          <p className="text-black-800 text-xs">{TESTIMONIALS[0].role}</p>
          <p className="text-black-900 text-sm italic mt-2 leading-relaxed">
            "{TESTIMONIALS[0].testimonial}"
          </p>
        </div>
      </div>
    </div>
  </div>

  {/* Testimonial 2 — Narrowed Width */}
  <div className="flex flex-col items-center w-44">
    <div className="w-full h-80 rounded-xl overflow-hidden shadow-lg">
      <img
        src={TESTIMONIALS[1].image}
        alt={TESTIMONIALS[1].name}
        className="w-full h-full object-cover"
      />
    </div>
  </div>

 {/* Testimonial 3 — Spotlight / Text Only */}
<div className="flex-1 flex flex-col items-center min-w-[200px]">
  <div className="bg-orange-500/10 rounded-xl shadow-lg h-80 w-full p-6 flex flex-col">
    
    {/* Name */}
    <h4 className="font-bold text-black-900 text-lg mb-4">
      {TESTIMONIALS[2].name}
    </h4>

    {/* Meta grid */}
    <div className="grid grid-cols-3 gap-4 text-black-700 text-xs">
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
    <div className="mt-16">
      <p className="text-black-900 italic text-sm leading-relaxed mb-4">
        "{TESTIMONIALS[2].testimonial}"
      </p>

      
    </div>

  </div>
</div>



  {/* Testimonial 1 — Image Only */}
<div className="flex flex-col items-center w-64">
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