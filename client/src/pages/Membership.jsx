import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
import { membershipService } from '../services/membershipService';
import { useAuth } from '../hooks/authHooks';

const Membership = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await membershipService.getAllPlans();
      
      if (response.success) {
        setPlans(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch plans');
      }
    } catch (err) {
      console.error('Failed to fetch plans:', err);
      setError('Failed to load membership plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = async (plan) => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = `/login?redirect=membership&plan=${plan.id}&cycle=${billingCycle}`;
      return;
    }

    try {
      const response = await membershipService.purchaseMembership({
        plan_id: plan.id,
        billing_cycle: billingCycle,
        auto_renew: true
      });

      if (response.success) {
        // Show success message or redirect to success page
        alert('Membership purchased successfully!');
        // You could also redirect to dashboard
        // window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('Purchase failed:', err);
      alert('Failed to purchase membership. Please try again.');
    }
  };

  // Calculate yearly savings for a plan
  const getYearlySavings = (plan) => {
    return membershipService.calculateYearlySavings(plan);
  };

  // Loading state
  if (loading) {
    return (
      <div className="pt-4 md:pt-20">
        <section className="relative py-8 md:py-12 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4 md:px-16">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading membership plans...</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="pt-4 md:pt-20">
        <section className="relative py-8 md:py-12 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4 md:px-16">
            <div className="text-center py-12">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to load plans</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={fetchPlans}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
              >
                Retry
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pt-4 md:pt-20">
      {/* Hero / Header Section */}
      <section className="relative py-8 md:py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 md:px-16">

          {/* Header Row */}
          <div className="flex flex-col lg:flex-row items-start justify-between mb-8 md:mb-12 gap-4 md:gap-6">
            <div className="lg:w-1/3 text-left w-full">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-orange-500">
                Choose Your <span className="text-orange-500">Fitness Plan</span>
              </h1>
            </div>

            <div className="lg:w-1/3 text-left lg:text-center w-full">
              <p className="text-lg md:text-xl lg:text-2xl font-semibold text-black-900">
                Select the perfect membership that fits your fitness goals and lifestyle
              </p>
            </div>

            <div className="lg:w-1/3 text-left lg:text-right w-full">
              <p className="text-black-700 text-sm md:text-base">
                Our plans are designed to keep you motivated and progressing, whether you're starting your fitness journey or aiming to reach peak performance.
              </p>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-8 md:mb-12">
            <div className="bg-gray-200 rounded-full p-1 flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 md:px-6 py-2 rounded-full font-semibold transition text-sm md:text-base ${
                  billingCycle === 'monthly'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-gray-300'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 md:px-6 py-2 rounded-full font-semibold transition text-sm md:text-base ${
                  billingCycle === 'yearly'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-gray-300'
                }`}
              >
                Yearly
                {plans.some(p => {
                  const savings = getYearlySavings(p);
                  return savings.percentage > 0;
                }) && (
                  <span className="ml-2 text-xs bg-white text-orange-500 px-2 py-0.5 rounded-full">
                    Save up to 20%
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const savings = getYearlySavings(plan);
              return (
                <div
                  key={plan.id}
                  className={`rounded-lg p-6 md:p-8 transition ${
                    plan.highlighted
                      ? 'bg-orange-500 text-white shadow-lg md:scale-105'
                      : 'bg-white border-2 border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <h3 className="text-xl md:text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className={`text-xs md:text-sm mb-4 md:mb-6 ${plan.highlighted ? 'text-orange-100' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>

                  <div className="mb-4 md:mb-6">
                    <span className="text-3xl md:text-4xl font-bold">
                      ${billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}
                    </span>
                    <span className={`text-sm md:text-base ${plan.highlighted ? 'text-orange-100' : 'text-gray-600'}`}>
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                    {billingCycle === 'yearly' && savings.percentage > 0 && (
                      <p className={`text-xs mt-1 ${plan.highlighted ? 'text-orange-100' : 'text-green-600'}`}>
                        {savings.display}
                      </p>
                    )}
                  </div>

                  <Button 
                    variant="accent" 
                    className="w-full mb-6 md:mb-8 text-sm md:text-base"
                    onClick={() => handleGetStarted(plan)}
                  >
                    Get Started
                  </Button>

                  <ul className="space-y-2 md:space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 md:gap-3">
                        <svg
                          className={`w-4 h-4 md:w-5 md:h-5 flex-shrink-0 ${plan.highlighted ? 'text-white' : 'text-orange-500'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs md:text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to Join + FAQ Section (Two Columns) */}
      <section className="py-8 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

            {/* Left — How to Join */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-orange-500">How to Join PowerGym</h2>
              <ul className="space-y-3 md:space-y-4">
                {([
                  'Select your preferred membership plan.',
                  'Visit us or fill out the online form.',
                  'Make a secure payment at the front desk.',
                  'Begin your fitness journey immediately!',
                ]).map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-orange-500 text-white font-bold text-sm md:text-base flex-shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-gray-700 font-semibold text-sm md:text-base">{step}</p>
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <button className="mt-4 md:mt-6 bg-orange-500 text-white px-6 md:px-8 py-2 md:py-3 rounded-full font-semibold hover:bg-orange-600 transition text-sm md:text-base">
                  Join Now
                </button>
              </Link>
            </div>

            {/* Right — FAQ */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-orange-500">Frequently Asked Questions</h2>
              <div className="space-y-3 md:space-y-4">
                {([
                  { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your membership at any time with no penalties.' },
                  { q: 'Do you offer a free trial?', a: 'Yes, we offer a 7-day free trial for all membership plans.' },
                  { q: 'Can I upgrade or downgrade?', a: 'Absolutely! You can change your plan anytime, prorated to your billing cycle.' },
                ]).map((faq, idx) => (
                  <div key={idx} className="bg-white p-4 md:p-6 rounded-lg border border-gray-200 hover:shadow-md transition">
                    <h4 className="font-semibold mb-2 text-sm md:text-base">{faq.q}</h4>
                    <p className="text-gray-600 text-xs md:text-sm">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Membership;