import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Benefits() {
  const navigate = useNavigate();
  const BENEFITS = [
    {
      id: 1,
      title: 'State-of-the-Art Equipment',
      description: 'Access the latest fitness technology and equipment from top brands to maximize your workout results.',
      icon: 'lightning',
      image: 'https://images.squarespace-cdn.com/content/v1/62b7b8d489319c4a2ff636e8/4da82832-efe9-4edb-a927-5e1b93e5d9d0/NOAHJVMES_AT--71.jpg',
      features: [
        'Newest cardio machines',
        'Premium strength training equipment',
        'Functional fitness zone',
        'Recovery area with massage guns and foam rollers'
      ]
    },
    {
      id: 2,
      title: 'Expert Trainers',
      description: 'Work with certified professionals who create personalized programs tailored to your fitness goals.',
      icon: 'users',
      images: [
        'https://media.istockphoto.com/id/1140884096/photo/african-american-fitness-instructor-helping-senior-woman.jpg?s=612x612&w=0&k=20&c=PE-nJ7_DrmE341ocqczshDI16xw3CQ42GJNT3sCot4Q=',
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
        'https://images.squarespace-cdn.com/content/v1/659ed09318cd077ef91b5f21/9b25bb97-2a13-4436-9568-714e36484c20/WhatsApp+Image+2024-11-04+at+12.13.46+PM.jpeg'
      ],
      features: [
        {
          title: 'Certified Professionals',
          description: 'All trainers hold NASM, ACE, or ISSA certifications'
        },
        {
          title: 'Personalized Programs',
          description: 'Custom workout plans based on your specific goals'
        }
      ]
    },
    {
  id: 3,
  title: 'Flexible Hours',
  description: 'Train on your schedule with 24/7 access to our facilities.',
  icon: 'clock',
  images: [ // Only 2 images now
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80'
  ],
  features: [
    {
      title: '24/7 Facility Access',
      description: 'Open every day, all day for your convenience'
    },
    {
      title: 'Early Bird Sessions',
      description: '5AM opening for morning workout enthusiasts'
    },
    {
      title: 'Late Night Training',
      description: 'Open until midnight for night owls'
    }
  ]
},
    {
      id: 4,
      title: 'Diverse Classes',
      description: 'From yoga to HIIT, choose from over 50+ weekly group classes designed for all fitness levels.',
      icon: 'check',
      image: 'https://youfit.com/wp-content/uploads/2024/06/YouFit-06-20-22-282-Edit.jpg',
      stats: [
        {
          number: '50+',
          label: 'Weekly Classes'
        },
        {
          number: '15',
          label: 'Class Types'
        },
        {
          number: '100%',
          label: 'Satisfaction Rate'
        }
      ]
    },
    
    
  ]

  const renderIcon = (iconType) => {
    const iconMap = {
      lightning: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
      users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
      clock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
      check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
      thumbsup: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />,
      chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    }
    return iconMap[iconType]
  }

  return (
    <section className="py-8 md:py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 md:px-16">
        
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
            Why Choose <span className="text-orange-500">PowerGym</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Experience the ultimate fitness journey with our world-class facilities and expert support
          </p>
        </div>

        <div className="space-y-8 md:space-y-12">
          {BENEFITS.map((benefit, index) => {
            const isEven = index % 2 === 0;
            
            return (
              <div 
                key={benefit.id} 
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-start gap-6 md:gap-8 lg:gap-12`}
              >
                <div className="flex-1 space-y-4 md:space-y-6">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {renderIcon(benefit.icon)}
                      </svg>
                    </div>
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                      {benefit.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                    {benefit.description}
                  </p>
                  
                  {/* Show features for benefits 1, 2, 3 */}
                  {benefit.features && (
                    <div className={benefit.id === 1 ? "grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4" : benefit.id === 3 ? "flex flex-wrap gap-2 md:gap-3" : "grid grid-cols-1 gap-3"}>
                      {benefit.features.map((feature, idx) => (
                        <div key={idx}>
                          <div 
                            className={benefit.id === 1 ? "flex items-start gap-3 bg-orange-50 p-3 rounded-lg" : benefit.id === 3 ? "flex items-center gap-2" : "flex items-start gap-3"}
                          >
                            {benefit.id === 3 && (
                              <div
  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
    ${
      idx === 0
        ? 'bg-orange-500 text-white'
        : 'border-2 border-black-900 text-black-900'
    }`}
>
  {idx + 1}
</div>

                            )}
                            {benefit.id === 1 && (
                              <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                                <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                            {benefit.id === 2 && (
                              <div className="w-6 h-6 mt-0.5 flex-shrink-0">
                                <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-gray-900">
                                {typeof feature === 'string' ? feature : feature.title}
                              </div>
                              {typeof feature === 'object' && feature.description && (
                                <div className="text-sm text-gray-600 mt-1">
                                  {feature.description}
                                </div>
                              )}
                            </div>
                          </div>
                          {benefit.id === 2 && idx < benefit.features.length - 1 && (
                            <div className="border-b border-gray-200 my-3"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Show stats for benefit 4 */}
                  {benefit.stats && (
                    <div className="flex flex-wrap items-center justify-start gap-3 md:gap-4 text-center">
                      {benefit.stats.map((stat, idx) => (
                        <div key={idx} className="flex items-center gap-3 md:gap-4">
                          <div>
                            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-black-900">
                              {stat.number}
                            </div>
                            <div className="text-xs md:text-sm text-black-700 font-medium">
                              {stat.label}
                            </div>
                          </div>
                          {idx < benefit.stats.length - 1 && (
                            <div className="text-xl md:text-2xl text-gray-300">|</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button
                    onClick={() => navigate('/about', { state: { benefitId: benefit.id } })}
                    className="inline-flex items-center text-orange-500 font-semibold hover:text-orange-600 transition-colors group text-sm md:text-base"
                  >
                    Learn More
                    <svg className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>

                {/* Image Section */}
                <div className="flex-1 w-full">
                  {/* Single image for benefits 1, 4, 5, 6 */}
                  {benefit.image && !benefit.images && (
                    <div className="relative rounded-xl overflow-hidden shadow-lg h-[240px] md:h-[320px] w-full">
                      <img
                        src={benefit.image}
                        alt={benefit.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Masonry layout for benefit 2 (2 stacked left, 1 tall right) */}
                  {benefit.id === 2 && benefit.images && (
                    <div className="grid grid-cols-2 gap-2 md:gap-3 h-[240px] md:h-[320px]">
                      <div className="flex flex-col gap-2 md:gap-3">
                        <div className="relative rounded-xl overflow-hidden shadow-lg h-[117px] md:h-[154px] w-full">
                          <img
                            src={benefit.images[0]}
                            alt={`${benefit.title} 1`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="relative rounded-xl overflow-hidden shadow-lg h-[117px] md:h-[154px] w-full">
                          <img
                            src={benefit.images[1]}
                            alt={`${benefit.title} 2`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="relative rounded-xl overflow-hidden shadow-lg h-full w-full">
                        <img
                          src={benefit.images[2]}
                          alt={`${benefit.title} 3`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                 {benefit.id === 3 && benefit.images && (
                    <div className="relative h-[240px] md:h-[320px] w-full flex items-center">
                      {/* Small image — behind, peeking top-right */}
                      <div className="absolute right-4 md:right-8 -top-4 md:-top-8 w-32 h-32 md:w-44 md:h-44 rounded-xl overflow-hidden shadow-lg z-10">
                        <img
                          src={benefit.images[0]}
                          alt={`${benefit.title} back`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Large image — front, cutting through */}
                      <div className="relative w-64 h-48 md:w-96 md:h-64 rounded-xl overflow-hidden shadow-xl z-20">
                        <img
                          src={benefit.images[1]}
                          alt={`${benefit.title} front`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                                                                                                                                                                                                                                                                                                        
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  )
}