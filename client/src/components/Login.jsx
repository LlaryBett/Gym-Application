import React, { useState, useEffect, useRef } from 'react' // Add useRef
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { FaEnvelope, FaIdCard, FaQuoteLeft, FaStar } from 'react-icons/fa'
import { GiStrongMan, GiWeightLiftingUp } from 'react-icons/gi'
import Button from './Button'
import { useAuth } from '../hooks/authHooks'

const trainerImages = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=150&h=150&fit=crop&crop=face"
]

// Floating keyframe injected once
const floatStyle = `
  @keyframes floatGuy {
    0%   { transform: translateY(0px); }
    50%  { transform: translateY(-18px); }
    100% { transform: translateY(0px); }
  }
`

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const isSubmitting = useRef(false) // Add this to prevent double submission
  
  const [formData, setFormData] = useState({
    email: '',
    membershipNumber: '',
    rememberMe: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)

  // Combined Carousel data with features and testimonials
  const carouselItems = [
    {
      id: 1,
      type: 'feature',
      icon: <GiStrongMan className="text-5xl text-orange-500" />,
      title: "Transform Your Body",
      description: "Join thousands of members who have transformed their lives.",
      stats: "5000+ Active Members",
      bgColor: "from-orange-500 to-orange-600"
    },
    {
      id: 2,
      type: 'testimonial',
      quote: "The best decision I made for my health. PowerGym changed my life!",
      author: "Sarah J.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
      rating: 5,
      bgColor: "from-orange-600 to-orange-500"
    },
    {
      id: 3,
      type: 'feature',
      icon: <GiWeightLiftingUp className="text-5xl text-orange-500" />,
      title: "Expert Trainers",
      description: "Get personalized guidance from certified professional trainers.",
      stats: "20+ Certified Trainers",
      bgColor: "from-orange-500 to-orange-600"
    }
  ]

  // Auto-scrolling carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [carouselItems.length])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Prevent double submission
    if (isSubmitting.current || loading) return
    
    isSubmitting.current = true
    setLoading(true)
    setError('')

    try {
      const loginData = {
        email: formData.email,
        membership_number: formData.membershipNumber,
        remember_me: formData.rememberMe
      }
      
      const response = await login(loginData)
      
      if (response?.success) {
        toast.success('Login successful!')
        // Use the redirect path from the response, default to '/' if not provided
        const redirectPath = response?.data?.redirect || '/'
        navigate(redirectPath)
      } else {
        toast.error(response?.error || 'Login failed. Please check your credentials.')
      }
    } catch (err) {
      console.error('Login error:', err)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
      isSubmitting.current = false
    }
  }

  // Render stars for rating
  const renderStars = (rating) => {
    return (
      <div className="flex gap-1 text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"} />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      <style>{floatStyle}</style>
      <style>{`
        @keyframes floatGuy {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-14px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
      
      {/* Background Pattern - Diagonal Lines in Orange */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" 
             style={{
                 backgroundImage: 'repeating-linear-gradient(45deg, #f97316 0px, #f97316 2px, transparent 2px, transparent 20px)'
             }}>
        </div>
      </div>

      {/* Floating Gradient Orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-orange opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-orange opacity-10 rounded-full blur-3xl"></div>

      {/* Main Container */}
      <div className="relative z-10 max-w-5xl w-full mx-auto bg-white rounded-3xl shadow-2xl border border-gray-200 p-2">
        
        <div className="flex flex-col lg:flex-row gap-0">
          
          {/* LEFT SIDE - Login Form */}
          <div className="lg:w-1/2 p-8 bg-white/80 backdrop-blur-sm rounded-l-3xl">
            
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Welcome Back!
              </h1>
              <p className="text-gray-600 text-sm">
                Enter your credentials to login
              </p>
              <div className="w-16 h-1 bg-orange-500 mt-3 rounded-full"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Field */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1 text-xs">
                  Email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Membership Number Field */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1 text-xs">
                  Membership Number
                </label>
                <div className="relative">
                  <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    name="membershipNumber"
                    value={formData.membershipNumber}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                    placeholder="e.g. GYM202600007"
                  />
                </div>
              </div>

              {/* Forgot Password & Remember Me */}
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="text-orange-500 focus:ring-orange-500 rounded border-gray-300 w-3 h-3"
                  />
                  <span className="ml-1.5 text-xs text-gray-600">Remember me</span>
                </label>
                <Link to="/forgot-membership" className="text-xs text-orange-500 hover:text-orange-600 font-medium transition">
                  Forgot Membership Number?
                </Link>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                variant="accent"
                className="w-full py-2.5 text-sm font-semibold rounded-lg"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </Button>

              {/* Sign Up Link */}
              <p className="text-center text-gray-600 text-xs">
                Don't have an account?{' '}
                <Link to="/register" className="text-orange-500 font-semibold hover:text-orange-600 transition">
                  Sign Up
                </Link>
              </p>
            </form>
          </div>

          {/* RIGHT SIDE - Carousel */}
          <div className="lg:w-1/2 p-4">
            <div className="relative h-full min-h-[380px] 
                            rounded-tr-2xl 
                            rounded-br-2xl 
                            rounded-tl-2xl 
                            rounded-bl-[120px] 
                            overflow-hidden 
                            shadow-xl">

              {carouselItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.bgColor}`}>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-36 h-36 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                  </div>

                  {/* Floating Gym Guy — only on Transform Your Body */}
                  {item.title === "Transform Your Body" && (
                    <img
                      src="https://res.cloudinary.com/dm6mcyuvu/image/upload/v1771612861/istockphoto-480908828-612x612-removebg-preview_yrxqxp.png"
                      alt="Gym athlete"
                      className="absolute bottom-0 right-0 translate-x-[-20%] h-[95%] w-auto object-contain object-bottom drop-shadow-2xl"
                      style={{
                        animation: 'floatGuy 4s ease-in-out infinite',
                        filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.3))'
                      }}
                    />
                  )}

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-white text-center">
                    {item.type === 'feature' ? (
                      <>
                        {/* Icon OR Avatar Stack */}
                        <div className="mb-4">
                          {item.title === "Expert Trainers" ? (
                            <div className="flex items-center justify-center">
                              {trainerImages.map((src, i) => (
                                <img
                                  key={i}
                                  src={src}
                                  alt={`Trainer ${i + 1}`}
                                  className={`w-16 h-16 object-cover rounded-full border-2 border-white shadow-md transition-transform duration-300 hover:scale-110 hover:z-10 ${
                                    i !== 0 ? "-ml-5" : ""
                                  }`}
                                />
                              ))}
                              {/* +20 Bubble */}
                              <div className="w-16 h-16 -ml-5 flex items-center justify-center 
                                              bg-white text-orange-500 font-bold text-sm
                                              rounded-full border-2 border-white shadow-md
                                              transition-transform duration-300 hover:scale-110">
                                +20
                              </div>
                            </div>
                          ) : (
                            item.icon
                          )}
                        </div>

                        <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                        <p className="text-sm mb-4 text-white/90 max-w-xs">
                          {item.description}
                        </p>
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                          <span className="text-sm font-semibold">{item.stats}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <FaQuoteLeft className="text-3xl text-white/30 mb-4" />
                        <p className="text-lg italic mb-4 max-w-xs">
                          "{item.quote}"
                        </p>
                        <div className="mb-3">
                          {renderStars(item.rating)}
                        </div>
                        {/* Author with avatar */}
                        <div className="flex items-center gap-3 mt-1">
                          <img
                            src={item.avatar}
                            alt={item.author}
                            className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover"
                          />
                          <div className="text-left">
                            <p className="text-base font-bold leading-tight">{item.author}</p>
                            <p className="text-xs text-white/70">Verified Member</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* Carousel Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {carouselItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? 'w-6 bg-white'
                        : 'bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Back to Home */}
        <div className="text-center py-3 border-t border-gray-200">
          <Link to="/" className="text-gray-400 hover:text-orange-500 transition text-xs inline-flex items-center gap-1">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login