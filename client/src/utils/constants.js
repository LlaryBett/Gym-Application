// Navigation
export const NAV_LINKS = [
  { name: 'Home', path: '#home' },
  { name: 'Trainers', path: '#trainers' },
  { name: 'Services', path: '#services' },
  { name: 'Membership', path: '#membership' },
  { name: 'Programs/Classes', path: '#programs-events' },
]

// Services
export const SERVICES = [
  {
    id: 1,
    title: 'Personal Training',
    image: '/images/trainers/pexels-julia-larson-6456166.jpg',
    description: 'One-on-one coaching tailored to your fitness goals.',
    featured: true,
  },
  {
    id: 2,
    title: 'Group Classes',
    image: '/images/trainers/pexels-malcolm-garret-3023588-5535931.jpg',
    description: 'High-energy group workouts led by expert trainers.',
    featured: true,
  },
  {
    id: 3,
    title: 'Nutrition Plans',
    image: '/images/trainers/pexels-gustavo-fring-5622219.jpg',
    description: 'Personalized meal plans to support your training.',
    featured: true,
  },
  {
    id: 4,
    title: 'Recovery & Spa',
    image: '/images/trainers/pexels-huum-sauna-heaters-718199222-31092914.jpg',
    description: 'Relax, recover, and recharge with our premium facilities.',
    featured: true,
  },
  {
    id: 5,
    title: 'Sports Performance',
    image: 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg',
    description: 'Athlete-focused training to enhance speed, agility, and power.',
    featured: false,
  },
  {
    id: 6,
    title: 'Yoga & Flexibility',
    image: 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg',
    description: 'Improve mobility and mindfulness through guided yoga sessions.',
    featured: false,
  },
  {
    id: 7,
    title: 'Strength & Conditioning',
    image: 'https://images.pexels.com/photos/791763/pexels-photo-791763.jpeg',
    description: 'Build muscle and increase endurance with specialized programs.',
    featured: false,
  },
  {
    id: 8,
    title: 'Virtual Training',
    image: 'https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg',
    description: 'Train from anywhere with live or on-demand online sessions.',
    featured: false,
  },
]

// Programs / Events
export const PROGRAMS = [
  {
    id: 1,
    title: 'Summer Bootcamp',
    image: 'https://images.pexels.com/photos/414029/pexels-photo-414029.jpeg',
    description: 'Intense 6-week program to get in shape fast!',
    category: 'Fitness',
    price: 'Included in Pro+',
    capacity: '8/12 enrolled',
    featured: true
  },
  {
    id: 2,
    title: 'Wellness Workshop',
    image: 'https://images.pexels.com/photos/3757951/pexels-photo-3757951.jpeg',
    description: 'Mindfulness, nutrition, and holistic health guidance.',
    category: 'Wellness',
    price: 'Included in Pro+',
    capacity: '15/20 enrolled',
    featured: true
  },
  {
    id: 3,
    title: 'Strength Challenge',
    image: 'https://images.pexels.com/photos/2261485/pexels-photo-2261485.jpeg',
    description: 'Push your limits with our 8-week strength program.',
    category: 'Fitness',
    price: '$49/month',
    capacity: '15/20 enrolled',
    featured: false
  },
  {
    id: 4,
    title: 'Yoga Retreat',
    image: 'https://images.pexels.com/photos/3823031/pexels-photo-3823031.jpeg',
    description: 'Weekend retreat focused on flexibility and mental health.',
    category: 'Wellness',
    price: 'Included in Pro+',
    capacity: '8/12 enrolled',
    featured: false
  },
  // Additional programs for testing scrolling
  {
    id: 5,
    title: 'Cardio Blast',
    image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg',
    description: 'High-intensity cardio sessions for all levels.',
    category: 'Fitness',
    price: 'Included in Pro+',
    capacity: '8/12 enrolled',
    featured: false
  },
  {
    id: 6,
    title: 'Pilates Fusion',
    image: 'https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg',
    description: 'Strengthen your core and improve flexibility.',
    category: 'Wellness',
    price: 'Included in Pro+',
    capacity: '8/12 enrolled',
    featured: false
  },
  {
    id: 7,
    title: 'Kids Fitness Camp',
    image: 'https://images.pexels.com/photos/3661350/pexels-photo-3661350.jpeg',
    description: 'Fun and active sessions for children ages 7-12.',
    category: 'Fitness',
    price: 'Included in Pro+',
    capacity: '8/12 enrolled',
    featured: false
  },
  {
    id: 8,
    title: 'Senior Wellness',
    image: 'https://images.pexels.com/photos/3861487/pexels-photo-3861487.jpeg',
    description: 'Gentle classes focused on mobility and health for seniors.',
    category: 'Wellness',
    price: 'Included in Pro+',
    capacity: '8/12 enrolled',
    featured: false
  },
  {
    id: 9,
    title: 'Dance Fit',
    image: 'https://images.pexels.com/photos/1701196/pexels-photo-1701196.jpeg',
    description: 'Burn calories and have fun with dance-based workouts.',
    category: 'Fitness',
    price: 'Included in Pro+',
    capacity: '8/12 enrolled',
    featured: false
  },
  {
    id: 10,
    title: 'Nutrition Seminar',
    image: 'https://images.pexels.com/photos/3184192/pexels-photo-3184192.jpeg',
    description: 'Learn about healthy eating and meal planning.',
    category: 'Wellness',
    price: 'Included in Pro+',
    capacity: '8/12 enrolled',
    featured: false
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
