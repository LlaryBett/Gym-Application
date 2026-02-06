import Button from './Button'

export default function CTA() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  return (
    <section
      id="cta"
      className="py-12 md:py-20 bg-gradient-to-r from-black via-gray-900 to-black relative overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-orange-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 md:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          
          {/* ================= LEFT — TEXT CTA ================= */}
          <div className="space-y-4 md:space-y-8">
            {/* Badge */}
            <span className="inline-block bg-orange-500/20 text-orange-400 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold">
              LIMITED TIME OFFER
            </span>

            {/* Heading */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-black-900">
              Ready to Transform Your{' '}
              <span className="text-orange-500">Body & Mind</span>?
            </h2>

            {/* Description */}
            <p className="text-base md:text-lg lg:text-xl text-black-700 max-w-xl leading-relaxed">
              Join thousands of members who've already achieved their fitness goals.
              Train smarter with expert coaches, premium equipment, and a motivating community.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-row flex-wrap gap-3 md:gap-4">
              <Button
                variant="accent"
                size="lg"
                onClick={() => scrollToSection('membership')}
                className="flex-1 sm:flex-initial"
              >
                Get 50% Off
              </Button>

              <button
                onClick={() => scrollToSection('services')}
                className="flex-1 sm:flex-initial px-4 sm:px-6 md:px-8 py-3 md:py-4 border-2 border-orange-500 text-orange-500 rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition text-sm md:text-base"
              >
                Learn More
              </button>
            </div>

            {/* Trust Text */}
            <p className="text-black-600 text-xs md:text-sm">
              No credit card required • Cancel anytime
            </p>
          </div>

          {/* ================= RIGHT — MASONRY OVERLAP ================= */}
          <div className="relative h-[280px] sm:h-[320px] md:h-[380px] w-full hidden lg:flex items-center justify-center">

            {/* IMAGE 1 — BACK */}
            <div className="absolute -top-8 sm:-top-16 left-1/2 -translate-x-1/2 w-36 h-48 sm:w-48 sm:h-64 rounded-2xl overflow-hidden shadow-lg z-10">
              <img
                src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80"
                alt="Full gym view"
                className="w-full h-full object-cover"
              />
            </div>

            {/* IMAGE 2 — CUTTING BOTTOM-RIGHT OF IMAGE 1 */}
            <div className="absolute top-16 sm:top-20 left-[52%] w-36 h-48 sm:w-48 sm:h-64 rounded-2xl overflow-hidden shadow-2xl z-20">
              <img
                src="https://images.unsplash.com/photo-1536922246289-88c42f957773?w=800&q=80"
                alt="Workout session"
                className="w-full h-full object-cover"
              />
            </div>

            {/* IMAGE 3 — CUTTING BOTTOM-LEFT OF IMAGE 2 ONLY */}
            <div className="absolute top-44 sm:top-56 left-[18%] w-44 h-36 sm:w-56 sm:h-48 rounded-2xl overflow-hidden shadow-2xl z-30">
              <img
                src="https://media.istockphoto.com/id/1140884096/photo/african-american-fitness-instructor-helping-senior-woman.jpg?s=612x612&w=0&k=20&c=PE-nJ7_DrmE341ocqczshDI16xw3CQ42GJNT3sCot4Q="
                alt="Fitness lifestyle"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
