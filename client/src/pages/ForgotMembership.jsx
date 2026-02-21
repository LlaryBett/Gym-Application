import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaEnvelope, FaArrowLeft, FaLock } from 'react-icons/fa'
import toast from 'react-hot-toast'
import Button from '../components/Button'
import authService from '../services/authService'  // ✅ Changed to use authService

const ForgotMembership = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await authService.forgotMembership(email)
      if (response.success) {
        setSubmitted(true)
        if (response.message) {
          toast.success(response.message)
        }
      } else {
        if (response.message) {
          toast.error(response.message)
        }
      }
    } catch (error) {
      if (error.message) {
        toast.error(error.message)
      }
      console.error('Forgot membership error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 md:py-24 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaEnvelope className="text-green-500 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-orange-500 mb-4">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              We've sent your membership number to <strong>{email}</strong>
            </p>
            <Link to="/login">
              <Button variant="accent" className="w-full">
                Return to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 md:py-24 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        
        {/* Back to Login */}
        <Link to="/login" className="inline-flex items-center text-gray-600 hover:text-orange-500 mb-6 transition">
          <FaArrowLeft className="mr-2" /> Back to Login
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-orange-500 mb-2">
              Forgot Membership Number?
            </h1>
            <p className="text-gray-600">
              Enter your email address and we'll send you your membership number.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="accent"
              className="w-full py-3 text-lg font-semibold"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Membership Number'
              )}
            </Button>
          </form>

          {/* Security Note */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <FaLock className="inline mr-2" /> For security reasons, we'll only send your membership number to the email address associated with your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotMembership