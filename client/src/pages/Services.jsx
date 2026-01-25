import { SERVICES } from '../utils/constants'
import Button from '../components/Button'

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
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our <span className="text-orange-500">Services</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to achieve your fitness goals and transform your life
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-white" id="services">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl hover:border-orange-500 transition-all"
              >
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-black">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <a href="#" className="text-orange-500 font-semibold hover:text-orange-600 transition">
                  Learn more →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Service <span className="text-orange-500">Categories</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {SERVICE_CATEGORIES.map((cat) => (
              <div key={cat.id} className="bg-white rounded-lg p-8 border border-gray-200">
                <h3 className="text-2xl font-bold mb-6 text-orange-500">{cat.category}</h3>
                <ul className="space-y-3">
                  {cat.services.map((service, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-700">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      
    </div>
  )
}