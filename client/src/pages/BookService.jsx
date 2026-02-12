import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/authHooks';
import { serviceService } from '../services/serviceService';
import trainersService from '../services/trainersService'; // ✅ FIXED - default import
import { bookingService } from '../services/bookingService';
import CTA from '../components/CTA';

export default function BookService() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [service, setService] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState(bookingService.getInitialFormData());

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login', { 
        state: { 
          from: `/book-service/${id}`,
          message: 'Please log in to book a service'
        } 
      });
      return;
    }

    fetchServiceData();
  }, [id, user, navigate]);

  // Check availability when trainer or date changes
  useEffect(() => {
    if (formData.trainerId && formData.date) {
      checkAvailability();
    }
  }, [formData.trainerId, formData.date]);

  const fetchServiceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get service details
      const serviceResponse = await serviceService.getServiceById(id);
      
      if (serviceResponse.success) {
        const formattedService = serviceService.formatServiceForDisplay(serviceResponse.data);
        setService(formattedService);
      }
      
      // Get available trainers - ✅ FIXED
      const trainersResponse = await trainersService.getAllTrainers({ 
        limit: 20,
        status: 'active'
      });
      
      if (trainersResponse.success) {
        const formattedTrainers = trainersResponse.data.trainers.map(trainer => 
          trainersService.formatTrainerForDisplay(trainer) // ✅ FIXED
        );
        setTrainers(formattedTrainers);
      }
      
    } catch (err) {
      console.error('Failed to fetch booking data:', err);
      setError(err.message || 'Failed to load booking information');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    try {
      const response = await bookingService.checkAvailability(
        formData.trainerId,
        formData.date
      );
      
      if (response.success) {
        const slots = bookingService.generateTimeSlots(response.data.bookedSlots || []);
        setAvailableTimeSlots(slots);
      }
    } catch (err) {
      console.error('Failed to check availability:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate form
  const validation = bookingService.validateBookingForm(formData);
  if (!validation.isValid) {
    setError(Object.values(validation.errors)[0]);
    return;
  }
  
  try {
    setSubmitting(true);
    setError(null);
    
    // ✅ FETCH missing data
    // Get member details from user object
    const memberName = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    const memberEmail = user?.email;
    
    // Get service details from state
    const serviceName = service?.title;
    
    // Get trainer details from selected trainer
    const selectedTrainer = trainers.find(t => t.id === parseInt(formData.trainerId));
    const trainerName = selectedTrainer?.name;
    
    // ✅ SEND CORRECT FIELD NAMES (snake_case)
    const bookingData = {
      member_id: user?.id,                    // ✅ snake_case
      trainer_id: parseInt(formData.trainerId), // ✅ snake_case
      service_id: parseInt(id),               // ✅ snake_case
      service_name: serviceName,              // ✅ REQUIRED
      trainer_name: trainerName,             // ✅ REQUIRED
      member_name: memberName,              // ✅ REQUIRED
      member_email: memberEmail,            // ✅ REQUIRED
      booking_date: formData.date,          // ✅ 'booking_date'
      booking_time: formData.time,          // ✅ 'booking_time'
      session_type: formData.sessionType,   // ✅ snake_case
      notes: formData.notes || '',
      special_requests: ''                  // ✅ optional
    };
    
    console.log('Sending booking data:', bookingData); // Debug
    
    const response = await bookingService.createBooking(bookingData);
    
    if (response.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard', { 
          state: { 
            message: 'Your session has been booked successfully!' 
          } 
        });
      }, 2000);
    }
    
  } catch (err) {
    console.error('Booking failed:', err);
    setError(err.message || 'Failed to book session. Please try again.');
  } finally {
    setSubmitting(false);
  }
};

  // Get tomorrow's date as min date for booking
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Loading state
  if (loading) {
    return (
      <div className="pt-4 md:pt-24 py-8 md:py-16">
        <div className="container mx-auto px-4 md:px-16">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading booking information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !service) {
    return (
      <div className="pt-4 md:pt-24 py-8 md:py-16">
        <div className="container mx-auto px-4 md:px-16">
          <div className="text-center py-12">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to load booking</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => navigate('/services')}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Browse Services
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="pt-4 md:pt-24 py-8 md:py-16">
        <div className="container mx-auto px-4 md:px-16">
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-black-900 mb-4">
              Booking Confirmed!
            </h1>
            <p className="text-gray-600 mb-8">
              Your session has been successfully booked. You will receive a confirmation email shortly.
            </p>
            <div className="animate-pulse">
              <p className="text-orange-500">Redirecting to dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 md:pt-24 py-8 md:py-16">
      <div className="container mx-auto px-4 md:px-16">
        
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8 md:mb-12">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-orange-500 transition mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <h1 className="text-3xl md:text-4xl font-bold text-black-900 mb-2">
            Book <span className="text-orange-500">{service?.title}</span>
          </h1>
          <p className="text-gray-600">
            Fill in the details below to schedule your training session
          </p>
        </div>

        {/* Booking Form */}
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            
            {/* Service Info Sidebar */}
            <div className="md:w-1/3 bg-gradient-to-br from-orange-500 to-orange-600 p-6 md:p-8">
              <div className="text-white">
                <h3 className="text-xl font-bold mb-4">Service Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-orange-100 text-sm mb-1">Service</p>
                    <p className="font-semibold">{service?.title}</p>
                  </div>
                  
                  <div>
                    <p className="text-orange-100 text-sm mb-1">Category</p>
                    <p className="font-semibold">{service?.category}</p>
                  </div>
                  
                  <div>
                    <p className="text-orange-100 text-sm mb-1">Description</p>
                    <p className="text-sm">{service?.description}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-orange-400">
                    <p className="text-orange-100 text-sm mb-1">Member</p>
                    <p className="font-semibold">{user?.name}</p>
                    <p className="text-sm">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="md:w-2/3 p-6 md:p-8">
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Trainer Selection */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Select Trainer <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="trainerId"
                    value={formData.trainerId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition bg-white"
                  >
                    <option value="">Choose a trainer</option>
                    {trainers.map(trainer => (
                      <option key={trainer.id} value={trainer.id}>
                        {trainer.name} - {trainer.specialty}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Select Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={minDate}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  />
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Select Time <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition bg-white"
                  >
                    <option value="">Choose a time</option>
                    {availableTimeSlots.length > 0 ? (
                      availableTimeSlots.map(slot => (
                        <option 
                          key={slot.time} 
                          value={slot.time}
                          disabled={!slot.available}
                          className={!slot.available ? 'text-gray-400' : ''}
                        >
                          {slot.time} {!slot.available && '(Booked)'}
                        </option>
                      ))
                    ) : (
                      timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))
                    )}
                  </select>
                </div>

                {/* Session Type */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Session Type
                  </label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="sessionType"
                        value="one-on-one"
                        checked={formData.sessionType === 'one-on-one'}
                        onChange={handleChange}
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-gray-700">One-on-One</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="sessionType"
                        value="group"
                        checked={formData.sessionType === 'group'}
                        onChange={handleChange}
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-gray-700">Group</span>
                    </label>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Any specific goals, injuries, or preferences?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition resize-none"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-orange-500 text-white px-6 py-4 rounded-full font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Confirm Booking'
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center mt-4">
                    By confirming, you agree to our cancellation policy. Cancellations must be made at least 24 hours in advance.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Component */}
      <CTA />
    </div>
  );
}

// Time slots constant
const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', 
  '12:00 PM', '01:00 PM', '02:00 PM', 
  '03:00 PM', '04:00 PM', '05:00 PM', 
  '06:00 PM', '07:00 PM'
];