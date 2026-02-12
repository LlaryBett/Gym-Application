import React, { useState, useEffect } from 'react'
import Button from '../components/Button'
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/authHooks'
import membersService from '../services/membersService'

const MemberRegistration = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  
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
    hearAboutUs: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      // Optional: Redirect logged-in users to dashboard
    }
  }, [isAuthenticated, navigate])

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
    setSuccess('')

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
        hear_about_us: formData.hearAboutUs
      }

      console.log('Sending registration data:', registrationData)

      const response = await membersService.registerMember(registrationData)
      
      console.log('Registration successful:', response)

      // Reset form
      setFormData({
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
        hearAboutUs: ''
      })

      // Navigate immediately with response data
      navigate('/thank-you', { state: { data: response.data } })

    } catch (err) {
      console.error('Registration error:', err)
      setError(err.message || 'Failed to submit registration. Please try again.')
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-6 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-orange-500 mb-4">
            Member Registration
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our fitness community and start your journey towards a healthier lifestyle
          </p>
          {/* Login Link for existing members */}
          <p className="text-gray-600 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-500 font-semibold hover:text-orange-600 transition underline">
              Log In here
            </Link>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <FaExclamationTriangle className="text-red-500 text-xl" />
              <div>
                <p className="font-semibold text-red-800">Registration Failed</p>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-4 md:p-8">
            
            {/* Personal Information Section */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-orange-500 mb-6 pb-2 border-b border-gray-200">
                Personal Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">First Name *</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required disabled={loading} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition disabled:bg-gray-50 disabled:cursor-not-allowed" placeholder="First Name" />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Last Name *</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required disabled={loading} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition disabled:bg-gray-50 disabled:cursor-not-allowed" placeholder="Last Name" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={loading} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition disabled:bg-gray-50 disabled:cursor-not-allowed" placeholder="Email" />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Cell Phone *</label>
                  <input type="tel" name="cellPhone" value={formData.cellPhone} onChange={handleChange} required disabled={loading} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition disabled:bg-gray-50 disabled:cursor-not-allowed" placeholder="Cell Phone" />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-gray-700 font-semibold mb-2">Inquiry</label>
                <textarea name="inquiry" value={formData.inquiry} onChange={handleChange} rows="3" disabled={loading} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition disabled:bg-gray-50 disabled:cursor-not-allowed" placeholder="Tell us about your fitness goals or any special requests..." />
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Gender</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} disabled={loading} className="text-orange-500 focus:ring-orange-500 disabled:cursor-not-allowed" />
                      <span className="ml-2">Male</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} disabled={loading} className="text-orange-500 focus:ring-orange-500 disabled:cursor-not-allowed" />
                      <span className="ml-2">Female</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} disabled={loading} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition disabled:bg-gray-50 disabled:cursor-not-allowed" />
                </div>
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-orange-500 mb-6 pb-2 border-b border-gray-200">Emergency Contact</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Name</label>
                  <input type="text" name="emergency.name" value={formData.emergencyContact.name} onChange={handleChange} disabled={loading} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition disabled:bg-gray-50 disabled:cursor-not-allowed" placeholder="Name" />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Cell Phone</label>
                  <input type="tel" name="emergency.phone" value={formData.emergencyContact.phone} onChange={handleChange} disabled={loading} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition disabled:bg-gray-50 disabled:cursor-not-allowed" placeholder="Cell Phone" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email</label>
                  <input type="email" name="emergency.email" value={formData.emergencyContact.email} onChange={handleChange} disabled={loading} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition disabled:bg-gray-50 disabled:cursor-not-allowed" placeholder="Email" />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Relationship</label>
                  <input type="text" name="emergency.relationship" value={formData.emergencyContact.relationship} onChange={handleChange} disabled={loading} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition disabled:bg-gray-50 disabled:cursor-not-allowed" placeholder="Relationship" />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-orange-500 mb-6 pb-2 border-b border-gray-200">Additional Information</h2>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">How did you hear about us? *</label>
                <select name="hearAboutUs" value={formData.hearAboutUs} onChange={handleChange} required disabled={loading} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition bg-white disabled:bg-gray-50 disabled:cursor-not-allowed">
                  {hearAboutOptions.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <Button type="submit" variant="accent" className="px-12 py-4 text-lg font-semibold min-w-[200px]" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Complete Registration'
                )}
              </Button>
              <p className="text-gray-500 text-sm mt-4">By registering, you agree to our Terms of Service and Privacy Policy</p>
              
              {/* Login option below submit */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-600">
                  Already a member?{' '}
                  <Link to="/login" className="text-orange-500 font-semibold hover:text-orange-600 transition">
                    Sign in to your account
                  </Link>
                </p>
              </div>
            </div>
          </form>

          {/* Additional Info Section */}
          <div className="mt-8 md:mt-12 bg-white rounded-lg shadow-lg p-4 md:p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-orange-500 mb-4">What Happens Next?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-orange-500 text-white text-sm">1</div>
                    <span>We&apos;ll review your application within 24 hours</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-orange-500 text-white text-sm">2</div>
                    <span>Our team will contact you to schedule an orientation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-orange-500 text-white text-sm">3</div>
                    <span>Complete payment and get your membership card</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-orange-500 mb-4">Need Help?</h3>
                <p className="text-gray-600 mb-4">Our support team is ready to assist you with the registration process.</p>
                <div className="space-y-2">
                  <p className="font-semibold flex items-center gap-2"><FaPhoneAlt className="text-orange-500" /> (555) 123-4567</p>
                  <p className="font-semibold flex items-center gap-2"><FaEnvelope className="text-orange-500" /> support@powergym.com</p>
                  <p className="font-semibold flex items-center gap-2"><FaMapMarkerAlt className="text-orange-500" /> Visit us at 123 Fitness St, Health City</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemberRegistration