import React, { useState } from 'react'
import Button from '../components/Button'
import { Link } from 'react-router-dom'

const Membership = () => {
  const [billingCycle, setBillingCycle] = useState('monthly')

  const PLANS = [
    {
      id: 1,
      name: 'Basic',
      price: { monthly: 29, yearly: 290 },
      description: 'Perfect for getting started',
      features: [
        'Gym access during peak hours',
        'Basic equipment access',
        'Locker room access',
        'Community events',
      ],
      highlighted: false,
    },
    {
      id: 2,
      name: 'Pro',
      price: { monthly: 59, yearly: 590 },
      description: 'Most popular choice',
      features: [
        '24/7 gym access',
        'All equipment access',
        '2 personal training sessions/month',
        'Group fitness classes',
        'Nutrition consultation',
        'Priority support',
      ],
      highlighted: true,
    },
    {
      id: 3,
      name: 'Elite',
      price: { monthly: 99, yearly: 990 },
      description: 'Premium experience',
      features: [
        '24/7 gym access',
        'All equipment access',
        'Unlimited personal training',
        'All group classes included',
        'Monthly nutrition plans',
        'Recovery services',
        'VIP lounge access',
        'Priority concierge',
      ],
      highlighted: false,
    },
  ]

  return (
    <div>
      {/* Hero / Header Section */}
      <section className="relative py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-16">

          {/* Header Row */}
          <div className="flex flex-col lg:flex-row items-start justify-between mb-12 gap-6">
            <div className="lg:w-1/3 text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-orange-500">
                Choose Your <span className="text-orange-500">Fitness Plan</span>
              </h1>
            </div>

            <div className="lg:w-1/3 text-center">
              <p className="text-xl md:text-2xl font-semibold text-black-900">
                Select the perfect membership that fits your fitness goals <br/>
                and lifestyle
              </p>
            </div>

            <div className="lg:w-1/3 text-right">
              <p className="text-black-700">
                Our plans are designed to keep you motivated and progressing, whether you’re starting your fitness journey or aiming to reach peak performance.
              </p>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-200 rounded-full p-1 flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full font-semibold transition ${
                  billingCycle === 'monthly'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full font-semibold transition ${
                  billingCycle === 'yearly'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-lg p-8 transition ${
                  plan.highlighted
                    ? 'bg-orange-500 text-white shadow-lg scale-105'
                    : 'bg-white border-2 border-gray-200'
                }`}
              >
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className={`text-sm mb-6 ${plan.highlighted ? 'text-orange-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price[billingCycle]}</span>
                  <span className={plan.highlighted ? 'text-orange-100' : 'text-gray-600'}>
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>

                <Button variant="accent" className="w-full mb-8">
                  Get Started
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <svg
                        className={`w-5 h-5 ${plan.highlighted ? 'text-white' : 'text-orange-500'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Join + FAQ Section (Two Columns) */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-16">
          <div className="grid md:grid-cols-2 gap-12">

            {/* Left — How to Join */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-orange-500">How to Join PowerGym</h2>
              <ul className="space-y-4">
                {[
                  'Select your preferred membership plan.',
                  'Visit us or fill out the online form.',
                  'Make a secure payment at the front desk.',
                  'Begin your fitness journey immediately!',
                ].map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-500 text-white font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-gray-700 font-semibold">{step}</p>
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <button className="mt-6 bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition">
                  Join Now
                </button>
              </Link>
            </div>

            {/* Right — FAQ */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-orange-500">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {[
                  { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your membership at any time with no penalties.' },
                  { q: 'Do you offer a free trial?', a: 'Yes, we offer a 7-day free trial for all membership plans.' },
                  { q: 'Can I upgrade or downgrade?', a: 'Absolutely! You can change your plan anytime, prorated to your billing cycle.' },
                ].map((faq, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="font-semibold mb-2">{faq.q}</h4>
                    <p className="text-gray-600 text-sm">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}

export default Membership
