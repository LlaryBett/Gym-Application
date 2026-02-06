import { useParams, Link } from 'react-router-dom'
import { PROGRAMS } from '../utils/constants'
import { FaCalendarAlt, FaClock, FaUsers, FaCheckCircle, FaArrowLeft } from 'react-icons/fa'

const ProgramDetail = () => {
  const { id } = useParams()
  const program = PROGRAMS.find(p => p.id === parseInt(id))

  if (!program) {
    return <div className="pt-20 text-center py-16">Program not found</div>
  }

  return (
    <div className="pt-14 md:pt-20">
      {/* Hero Section */}
      <section className="relative h-64 md:h-96">
        <img
          src={program.image}
          alt={program.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center">
          <div className="container mx-auto px-4 md:px-16">
            <Link to="/programs" className="text-white flex items-center gap-2 mb-4 hover:text-orange-500 transition">
              <FaArrowLeft /> Back to Programs
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold text-white">{program.title}</h1>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-8 md:py-16 bg-white">
        <div className="container mx-auto px-4 md:px-16">
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="md:col-span-2">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Program Overview</h2>
              <p className="text-gray-700 mb-6">{program.description}</p>

              <h3 className="text-xl font-bold mb-4 text-orange-500">What You'll Get</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-orange-500 mt-1 flex-shrink-0" />
                  <span>Personalized workout plans tailored to your goals</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-orange-500 mt-1 flex-shrink-0" />
                  <span>Expert coaching and form correction</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-orange-500 mt-1 flex-shrink-0" />
                  <span>Nutrition guidance and meal planning</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-orange-500 mt-1 flex-shrink-0" />
                  <span>Progress tracking and accountability</span>
                </li>
              </ul>
            </div>

            {/* Sidebar */}
            <div>
              <div className="bg-gray-100 rounded-xl p-6 sticky top-24">
                <div className="mb-6">
                  <div className="text-3xl font-bold text-orange-500 mb-2">{program.price}</div>
                  <div className="text-sm text-gray-600">per month</div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <FaUsers className="text-orange-500" />
                    <span className="text-sm">{program.capacity}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaClock className="text-orange-500" />
                    <span className="text-sm">12 weeks duration</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaCalendarAlt className="text-orange-500" />
                    <span className="text-sm">Starts next Monday</span>
                  </div>
                </div>

                <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition mb-3">
                  Enroll Now
                </button>
                <button className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                  Contact Us
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}

export default ProgramDetail
