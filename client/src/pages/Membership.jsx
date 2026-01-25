import React, { useState } from 'react'
import Button from '../components/Button'

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
      {/* Hero Section */}
      <section className="relative py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your <span className="text-orange-500">Fitness Plan</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select the perfect membership that fits your fitness goals and lifestyle.
            </p>
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
                {/* Plan Name */}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className={`text-sm mb-6 ${plan.highlighted ? 'text-orange-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    ${plan.price[billingCycle]}
                  </span>
                  <span className={plan.highlighted ? 'text-orange-100' : 'text-gray-600'}>
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>

                {/* CTA Button */}
                <Button
                  variant={plan.highlighted ? 'default' : 'accent'}
                  className="w-full mb-8"
                >
                  Get Started
                </Button>

                {/* Features */}
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

      {/* FAQ Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked <span className="text-orange-500">Questions</span>
          </h2>

          <div className="space-y-4">
            {/*
              { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your membership at any time with no penalties.' },
              { q: 'Do you offer a free trial?', a: 'Yes, we offer a 7-day free trial for all membership plans.' },
              { q: 'Can I upgrade or downgrade?', a: 'Absolutely! You can change your plan anytime, prorated to your billing cycle.' },
            */}
            { [
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
      </section>
    </div>
  )
}

export default Membership