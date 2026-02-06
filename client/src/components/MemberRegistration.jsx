import React, { useState } from 'react'
import Button from '../components/Button'
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'

const MemberRegistration = () => {
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

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Handle form submission here
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
        </div>

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
                  <label className="block text-gray-700 font-semibold mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    placeholder="First Name"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    placeholder="Email"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Cell Phone *
                  </label>
                  <input
                    type="tel"
                    name="cellPhone"
                    value={formData.cellPhone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    placeholder="Cell Phone"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Inquiry
                </label>
                <textarea
                  name="inquiry"
                  value={formData.inquiry}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  placeholder="Tell us about your fitness goals or any special requests..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Gender
                  </label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={formData.gender === 'male'}
                        onChange={handleChange}
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      <span className="ml-2">Male</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={formData.gender === 'female'}
                        onChange={handleChange}
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      <span className="ml-2">Female</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-orange-500 mb-6 pb-2 border-b border-gray-200">
                Emergency Contact
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="emergency.name"
                    value={formData.emergencyContact.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    placeholder="Name"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Cell Phone
                  </label>
                  <input
                    type="tel"
                    name="emergency.phone"
                    value={formData.emergencyContact.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    placeholder="Cell Phone"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="emergency.email"
                    value={formData.emergencyContact.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    placeholder="Email"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Relationship
                  </label>
                  <input
                    type="text"
                    name="emergency.relationship"
                    value={formData.emergencyContact.relationship}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    placeholder="Relationship"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-orange-500 mb-6 pb-2 border-b border-gray-200">
                Additional Information
              </h2>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  How did you hear about us? *
                </label>
                <select
                  name="hearAboutUs"
                  value={formData.hearAboutUs}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition bg-white"
                >
                  {hearAboutOptions.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <Button
                type="submit"
                variant="accent"
                className="px-12 py-4 text-lg font-semibold"
              >
                Complete Registration
              </Button>
              <p className="text-gray-500 text-sm mt-4">
                By registering, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </form>

          {/* Additional Info Section */}
          <div className="mt-8 md:mt-12 bg-white rounded-lg shadow-lg p-4 md:p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-orange-500 mb-4">
                  What Happens Next?
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-orange-500 text-white text-sm">
                      1
                    </div>
                    <span>We'll review your application within 24 hours</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-orange-500 text-white text-sm">
                      2
                    </div>
                    <span>Our team will contact you to schedule an orientation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-orange-500 text-white text-sm">
                      3
                    </div>
                    <span>Complete payment and get your membership card</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-orange-500 mb-4">
                  Need Help?
                </h3>
                <p className="text-gray-600 mb-4">
                  Our support team is ready to assist you with the registration process.
                </p>
                <div className="space-y-2">
                  <p className="font-semibold flex items-center gap-2">
                    <FaPhoneAlt className="text-orange-500" /> (555) 123-4567
                  </p>
                  <p className="font-semibold flex items-center gap-2">
                    <FaEnvelope className="text-orange-500" /> support@powergym.com
                  </p>
                  <p className="font-semibold flex items-center gap-2">
                    <FaMapMarkerAlt className="text-orange-500" /> Visit us at 123 Fitness St, Health City
                  </p>
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