import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Button from '../components/Button'
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaExclamationTriangle, FaUser, FaIdCard, FaBirthdayCake, FaHeart, FaDumbbell, FaFire, FaQuoteLeft, FaArrowRight, FaArrowLeft, FaPhone, FaCheck, FaGift } from 'react-icons/fa'
import { useNavigate, Link, useLocation } from 'react-router-dom' // ✅ Added useLocation
import { useAuth } from '../hooks/authHooks'
import authService from '../services/authService'

const floatStyle = `
  @keyframes floatGuy {
    0%   { transform: translateY(0px); }
    50%  { transform: translateY(-18px); }
    100% { transform: translateY(0px); }
  }
`

const carouselItems = [
  {
    id: 1,
    type: 'stat',
    title: "Start Your Journey",
    description: "Thousands of members have already transformed their lives with us.",
    stats: "5,000+ Active Members",
    icon: FaDumbbell,
    bgColor: "from-orange-500 to-orange-600"
  },
  {
    id: 2,
    type: 'testimonial',
    quote: "Joining PowerGym was the best decision I ever made for my health and confidence.",
    author: "Marcus T.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    rating: 5,
    bgColor: "from-orange-600 to-orange-500"
  },
  {
    id: 3,
    type: 'stat',
    title: "Expert Guidance",
    description: "Our certified trainers craft personalized plans just for you.",
    stats: "20+ Certified Trainers",
    icon: FaFire,
    bgColor: "from-orange-500 to-orange-600"
  }
]

const STEPS = [
  { id: 1, label: 'Personal Info' },
  { id: 2, label: 'Emergency Contact' },
  { id: 3, label: 'Finish Up' }
]

const MemberRegistration = () => {
  const navigate = useNavigate()
  const location = useLocation() // ✅ Added for trial param
  const { isAuthenticated } = useAuth()

  // ✅ Check if trial was selected from URL
  const isTrial = new URLSearchParams(location.search).get('plan') === 'trial'

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    cellPhone: '',
    inquiry: '',
    gender: '',
    dateOfBirth: '',
    emergencyContact: {
      name: '',
      phone: '',
      email: '',
      relationship: ''
    },
    hearAboutUs: '',
    plan_type: isTrial ? 'trial' : 'regular' // ✅ Add plan_type
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    if (isAuthenticated) {
      // Optional: Redirect logged-in users to dashboard
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('emergency')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const registrationData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        cell_phone: formData.cellPhone,
        gender: formData.gender,
        date_of_birth: formData.dateOfBirth,
        emergency_contact_name: formData.emergencyContact.name,
        emergency_contact_phone: formData.emergencyContact.phone,
        emergency_contact_email: formData.emergencyContact.email,
        emergency_contact_relationship: formData.emergencyContact.relationship,
        inquiry: formData.inquiry,
        hear_about_us: formData.hearAboutUs,
        plan_type: formData.plan_type // ✅ Send trial flag to backend
      }

      console.log('Sending registration data:', registrationData)

      const response = await authService.register(registrationData)

      console.log('Registration successful:', response)

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        cellPhone: '',
        inquiry: '',
        gender: '',
        dateOfBirth: '',
        emergencyContact: { name: '', phone: '', email: '', relationship: '' },
        hearAboutUs: '',
        plan_type: 'regular'
      })

      if (response.message) {
        toast.success(response.message)
      }

      navigate('/thank-you', { state: { data: response.data } })

    } catch (err) {
      console.error('Registration error:', err)
      if (err.message) {
        setError(err.message)
        toast.error(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const hearAboutOptions = [
    'Please select an option',
    'Google Search',
    'Social Media',
    'Friend/Family',
    'Advertisement',
    'Walk-in',
    'Other'
  ]

  const renderStars = (rating) => (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < rating ? "text-yellow-400" : "text-white/30"}>★</span>
      ))}
    </div>
  )

  const inputClass = "w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
  const labelClass = "block text-gray-700 font-semibold mb-1 text-xs"

  return (
    <div className="min-h-screen bg-white flex items-start justify-center p-4 py-8 relative overflow-hidden">
      <style>{floatStyle}</style>

      {/* Background diagonal pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #f97316 0px, #f97316 2px, transparent 2px, transparent 20px)' }}
        />
      </div>

      {/* Floating gradient orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-orange-300 opacity-10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-400 opacity-10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="relative z-10 max-w-5xl w-full mx-auto bg-white rounded-3xl shadow-2xl border border-gray-200 p-2">

        <div className="flex flex-col lg:flex-row gap-0">

          {/* ─── LEFT: Form ─── */}
          <div className="lg:w-1/2 p-8 bg-white/80 backdrop-blur-sm rounded-l-3xl flex flex-col">

            {/* Header with Trial Badge */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {isTrial ? 'Start Free Trial' : 'Create Account'}
                </h1>
                {isTrial && (
                  <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-full">
                    7 DAYS FREE
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm">
                {isTrial 
                  ? 'Try PowerGym free for 7 days. No payment required!' 
                  : 'Join PowerGym and start your transformation'}
              </p>
              <div className="w-16 h-1 bg-orange-500 mt-3 rounded-full" />
            </div>

            {/* ✅ Trial Banner */}
            {isTrial && (
              <div className="mb-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-3 text-white">
                <div className="flex items-center gap-2">
                  <FaGift className="text-xl" />
                  <div>
                    <p className="font-bold text-sm">You're starting a 7-day free trial!</p>
                    <p className="text-orange-100 text-xs">Cancel anytime. No payment required.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step Indicators */}
            <div className="flex items-center gap-2 mb-6">
              {STEPS.map((step, i) => (
                <React.Fragment key={step.id}>
                  <div
                    className="flex items-center gap-1.5 cursor-pointer"
                    onClick={() => setCurrentStep(step.id)}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      currentStep === step.id
                        ? 'bg-orange-500 text-white'
                        : currentStep > step.id
                        ? 'bg-orange-200 text-orange-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {currentStep > step.id ? <FaCheck size={14} /> : step.id}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${
                      currentStep === step.id ? 'text-orange-500' : 'text-gray-400'
                    }`}>{step.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${
                      currentStep > step.id ? 'bg-orange-300' : 'bg-gray-100'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <FaExclamationTriangle className="text-red-500 text-sm flex-shrink-0" />
                <p className="text-red-600 text-xs">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">

              {/* ── STEP 1: Personal Information ── */}
              <div className={`space-y-4 ${currentStep === 1 ? 'block' : 'hidden'}`}>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>First Name *</label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                        required disabled={loading} className={inputClass} placeholder="First name" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Last Name *</label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                        required disabled={loading} className={inputClass} placeholder="Last name" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Email *</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                      required disabled={loading} className={inputClass} placeholder="your@email.com" />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Cell Phone *</label>
                  <div className="relative">
                    <FaPhoneAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input type="tel" name="cellPhone" value={formData.cellPhone} onChange={handleChange}
                      required disabled={loading} className={inputClass} placeholder="+254 712 345 678" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Date of Birth</label>
                    <div className="relative">
                      <FaBirthdayCake className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                      <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange}
                        disabled={loading} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Gender</label>
                    <div className="flex gap-3 mt-2.5">
                      {['male', 'female'].map(g => (
                        <label key={g} className="flex items-center gap-1.5 cursor-pointer">
                          <div className={`w-4 h-4 rounded-full border-2 transition flex items-center justify-center ${
                            formData.gender === g ? 'border-orange-500' : 'border-gray-300'
                          }`}>
                            {formData.gender === g && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                          </div>
                          <input type="radio" name="gender" value={g} checked={formData.gender === g}
                            onChange={handleChange} disabled={loading} className="sr-only" />
                          <span className="text-xs text-gray-600 capitalize">{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Fitness Goals / Inquiry</label>
                  <textarea name="inquiry" value={formData.inquiry} onChange={handleChange} rows="3"
                    disabled={loading}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition disabled:bg-gray-100 text-sm resize-none"
                    placeholder="Tell us about your fitness goals or any special requests..." />
                </div>

                <button type="button" onClick={() => setCurrentStep(2)}
                  className="w-full py-2.5 text-sm font-semibold rounded-full bg-orange-500 hover:bg-orange-600 text-white transition flex items-center justify-center gap-2">
                  Continue <FaArrowRight size={14} />
                </button>

                <p className="text-center text-gray-600 text-xs">
                  Already have an account?{' '}
                  <Link to="/login" className="text-orange-500 font-semibold hover:text-orange-600 transition">Sign In</Link>
                </p>
              </div>

              {/* ── STEP 2: Emergency Contact ── */}
              <div className={`space-y-4 ${currentStep === 2 ? 'block' : 'hidden'}`}>

                <div className="flex items-center gap-2 mb-2">
                  <FaHeart className="text-orange-500 text-sm" />
                  <p className="text-xs text-gray-500">In case of emergencies during your workouts</p>
                </div>

                <div>
                  <label className={labelClass}>Contact Name</label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input type="text" name="emergency.name" value={formData.emergencyContact.name} onChange={handleChange}
                      disabled={loading} className={inputClass} placeholder="Full name" />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Contact Phone</label>
                  <div className="relative">
                    <FaPhoneAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input type="tel" name="emergency.phone" value={formData.emergencyContact.phone} onChange={handleChange}
                      disabled={loading} className={inputClass} placeholder="+254 712 345 678" />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Contact Email</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input type="email" name="emergency.email" value={formData.emergencyContact.email} onChange={handleChange}
                      disabled={loading} className={inputClass} placeholder="contact@email.com" />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Relationship</label>
                  <div className="relative">
                    <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input type="text" name="emergency.relationship" value={formData.emergencyContact.relationship} onChange={handleChange}
                      disabled={loading} className={inputClass} placeholder="e.g. Spouse, Parent, Friend" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setCurrentStep(1)}
                    className="flex-1 py-2.5 text-sm font-semibold rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition flex items-center justify-center gap-2">
                    <FaArrowLeft size={14} /> Back
                  </button>
                  <button type="button" onClick={() => setCurrentStep(3)}
                    className="flex-1 py-2.5 text-sm font-semibold rounded-full bg-orange-500 hover:bg-orange-600 text-white transition flex items-center justify-center gap-2">
                    Continue <FaArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* ── STEP 3: Additional Info & Submit ── */}
              <div className={`space-y-4 ${currentStep === 3 ? 'block' : 'hidden'}`}>

                <div>
                  <label className={labelClass}>How did you hear about us? *</label>
                  <select name="hearAboutUs" value={formData.hearAboutUs} onChange={handleChange}
                    required disabled={loading}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-sm disabled:bg-gray-100 disabled:cursor-not-allowed">
                    {hearAboutOptions.map((option, index) => (
                      <option key={index} value={option === 'Please select an option' ? '' : option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Summary preview */}
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-orange-700 mb-2 uppercase tracking-wide">Your Details</p>
                  {formData.firstName && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Name</span>
                      <span className="font-medium text-gray-700">{formData.firstName} {formData.lastName}</span>
                    </div>
                  )}
                  {formData.email && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Email</span>
                      <span className="font-medium text-gray-700">{formData.email}</span>
                    </div>
                  )}
                  {formData.cellPhone && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Phone</span>
                      <span className="font-medium text-gray-700">{formData.cellPhone}</span>
                    </div>
                  )}
                  {formData.emergencyContact.name && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Emergency</span>
                      <span className="font-medium text-gray-700">{formData.emergencyContact.name}</span>
                    </div>
                  )}
                  {isTrial && (
                    <div className="mt-2 pt-2 border-t border-orange-200">
                      <p className="text-xs text-orange-600 font-semibold flex items-center gap-1"><FaGift size={12} /> 7-Day Free Trial</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setCurrentStep(2)}
                    className="flex-1 py-2.5 text-sm font-semibold rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition flex items-center justify-center gap-2">
                    <FaArrowLeft size={14} /> Back
                  </button>
                  <Button type="submit" variant="accent"
                    className="flex-1 py-2.5 text-sm font-semibold rounded-full"
                    disabled={loading}>
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </span>
                    ) : isTrial ? 'Start Free Trial' : 'Complete Registration'}
                  </Button>
                </div>

                <p className="text-center text-gray-400 text-xs">
                  By registering, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>

            </form>
          </div>

          {/* ─── RIGHT: Carousel ─── */}
          <div className="lg:w-1/2 p-4">
            <div className="relative h-full min-h-[520px]
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
                  {/* BG Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.bgColor}`}>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-36 h-36 bg-white opacity-10 rounded-full -ml-12 -mb-12" />
                  </div>

                  {/* Floating gym guy on first slide */}
                  {index === 0 && (
                    <img
                      src="https://res.cloudinary.com/dm6mcyuvu/image/upload/v1771612861/istockphoto-480908828-612x612-removebg-preview_yrxqxp.png"
                      alt="Gym athlete"
                      className="absolute bottom-0 right-0 translate-x-[-20%] h-[80%] w-auto object-contain object-bottom"
                      style={{
                        animation: 'floatGuy 4s ease-in-out infinite',
                        filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.3))'
                      }}
                    />
                  )}

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-white text-center">
                    {item.type === 'stat' ? (
                      <>
                        <item.icon className="text-5xl mb-4 text-white" />
                        <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                        <p className="text-sm mb-4 text-white/90 max-w-xs">{item.description}</p>
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                          <span className="text-sm font-semibold">{item.stats}</span>
                        </div>

                        {/* What happens next */}
                        <div className="w-full max-w-xs space-y-2.5">
                          <p className="text-xs text-white/60 uppercase tracking-wide font-semibold mb-3">
                            {isTrial ? 'Your Trial Includes' : 'What Happens Next'}
                          </p>
                          {isTrial ? [
                            "Full gym access for 7 days",
                            "All group classes included",
                            "No payment required",
                            "Upgrade anytime"
                          ].map((text, i) => (
                            <div key={i} className="flex items-start gap-2.5 text-left">
                              <div className="w-5 h-5 flex-shrink-0 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                                {i + 1}
                              </div>
                              <p className="text-xs text-white/80 leading-relaxed">{text}</p>
                            </div>
                          )) : [
                            "We'll review your application within 24 hours",
                            "Our team contacts you to schedule an orientation",
                            "Complete payment & get your membership card"
                          ].map((text, i) => (
                            <div key={i} className="flex items-start gap-2.5 text-left">
                              <div className="w-5 h-5 flex-shrink-0 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                                {i + 1}
                              </div>
                              <p className="text-xs text-white/80 leading-relaxed">{text}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <FaQuoteLeft className="text-3xl text-white/30 mb-4" />
                        <p className="text-lg italic mb-4 max-w-xs">{item.quote}</p>
                        <div className="mb-3">{renderStars(item.rating)}</div>
                        <div className="flex items-center gap-3 mt-1">
                          <img src={item.avatar} alt={item.author}
                            className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover" />
                          <div className="text-left">
                            <p className="text-base font-bold leading-tight">{item.author}</p>
                            <p className="text-xs text-white/70">Verified Member</p>
                          </div>
                        </div>

                        {/* Contact info */}
                        <div className="mt-8 w-full max-w-xs space-y-2">
                          <p className="text-xs text-white/60 uppercase tracking-wide font-semibold mb-3">Need Help?</p>
                          {[
                            { Icon: FaPhone, text: '(555) 123-4567' },
                            { Icon: FaEnvelope, text: 'support@powergym.com' },
                            { Icon: FaMapMarkerAlt, text: '123 Fitness St, Health City' }
                          ].map((contact, i) => (
                            <div key={i} className="flex items-center gap-2 text-white/80 text-xs">
                              <contact.Icon size={14} />
                              <span>{contact.text}</span>
                            </div>
                          ))}
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
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
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
            <FaArrowLeft size={12} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default MemberRegistration