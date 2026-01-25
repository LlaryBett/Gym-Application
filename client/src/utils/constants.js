// Navigation
export const NAV_LINKS = [
  { name: 'Home', path: '#home' },
  { name: 'Trainers', path: '#trainers' },
  { name: 'Services', path: '#services' },
  { name: 'Membership', path: '#membership' },
  { name: 'Contact', path: '#contact' },
]

// Services
export const SERVICES = [
  {
    id: 1,
    title: 'Personal Training',
    description: 'One-on-one sessions with certified trainers',
    icon: '💪',
  },
  {
    id: 2,
    title: 'Group Classes',
    description: 'HIIT, Yoga, Zumba, Spin, and more',
    icon: '👥',
  },
  {
    id: 3,
    title: 'Weight Training',
    description: 'State-of-the-art equipment and free weights',
    icon: '🏋️',
  },
  {
    id: 4,
    title: 'Cardio Zone',
    description: 'Treadmills, bikes, and ellipticals',
    icon: '🏃',
  },
  {
    id: 5,
    title: 'Nutrition Planning',
    description: 'Custom meal plans and consultations',
    icon: '🥗',
  },
  {
    id: 6,
    title: 'Recovery',
    description: 'Sauna, massage, and stretching areas',
    icon: '🧘',
  },
]

// Membership Plans
export const MEMBERSHIP_PLANS = [
  {
    id: 1,
    name: 'Basic',
    price: 29,
    period: 'month',
    features: [
      'Gym Access',
      'Locker Room',
      'Free Water',
      'Basic Equipment',
      '1 Guest Pass/Month',
    ],
    popular: false,
  },
  {
    id: 2,
    name: 'Pro',
    price: 59,
    period: 'month',
    features: [
      'All Basic Features',
      'Unlimited Group Classes',
      'Personal Trainer 1x/week',
      'Nutrition Consultation',
      '4 Guest Passes/Month',
    ],
    popular: true,
  },
  {
    id: 3,
    name: 'Premium',
    price: 99,
    period: 'month',
    features: [
      'All Pro Features',
      '24/7 Access',
      'Unlimited Personal Training',
      'Custom Meal Plan',
      'Free Towel Service',
      'Unlimited Guest Passes',
    ],
    popular: false,
  },
]

// Testimonials
export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Member for 2 years',
    content: 'Lost 30lbs and gained so much confidence! The trainers are amazing.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Mike Chen',
    role: 'Bodybuilder',
    content: 'Best equipment in town. The community keeps me motivated.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Lisa Rodriguez',
    role: 'Yoga Instructor',
    content: 'Love the variety of classes. The energy here is incredible!',
    rating: 5,
  },
]