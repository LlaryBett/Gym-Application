import { useLocation, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Button from '../components/Button'

const BENEFIT_TAB_MAP = {
  1: 2, // Equipment → Our Facility
  2: 1, // Expert Trainers → Our Team
  3: 0, // Flexible Hours → Our Story
  4: 3, // Diverse Classes → Our Classes
}

const TABS = ['Our Story', 'Our Team', 'Our Facility', 'Our Classes']

const TAB_ICONS = [
  // Story - info circle
  'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  // Team - users
  'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  // Facility - lightning
  'M13 10V3L4 14h7v7l9-11h-7z',
  // Classes - check circle
  'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
]

const TAB_CONTENT = [
  {
    badge: 'OUR STORY',
    heading: 'Built for Champions,\nOpen to Everyone.',
    body: [
      'PowerGym was founded in 2010 with a single belief: every person deserves access to elite-level fitness tools and coaching — not just professional athletes. What started as a 2,000 sq ft warehouse has grown into a 40,000 sq ft state-of-the-art complex serving over 8,000 active members.',
      'We obsess over two things: the quality of our equipment and the quality of our people. Every machine is inspected weekly. Every trainer is re-certified annually. And every member — from the first-timer to the seasoned lifter — is treated with the same respect and care.',
      'Our philosophy is simple: results come from consistency, not complexity. We make it easier for you to show up every single day.',
    ],
    stats: [
      { n: '8,000+', l: 'Active Members' },
      { n: '14', l: 'Years Strong' },
      { n: '40k sqft', l: 'Facility Size' },
    ],
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80',
    features: [
      'Est. 2010 in downtown',
      'Locally owned & operated',
      'Community-first philosophy',
      'Award-winning gym culture',
    ],
  },
  {
    badge: 'OUR TEAM',
    heading: 'Coaches Who\nActually Care.',
    body: [
      'Our team of 35 certified trainers brings a combined 200+ years of coaching experience across bodybuilding, Olympic lifting, functional fitness, yoga, and rehabilitation. Every trainer holds at minimum one nationally recognized certification — NASM, ACE, or ISSA.',
      "What sets our team apart is culture. At PowerGym, trainers know their clients by name, track progress, and celebrate every win — big or small. You'll never feel like a number here.",
      'We run an internal mentorship program pairing junior coaches with senior trainers, so every member gets the best of both energy and wisdom.',
    ],
    stats: [
      { n: '35', l: 'Certified Trainers' },
      { n: '200+', l: 'Years Combined XP' },
      { n: '4.9★', l: 'Avg Trainer Rating' },
    ],
    image:
      'https://media.istockphoto.com/id/1140884096/photo/african-american-fitness-instructor-helping-senior-woman.jpg?s=612x612&w=0&k=20&c=PE-nJ7_DrmE341ocqczshDI16xw3CQ42GJNT3sCot4Q=',
    features: [
      'NASM, ACE & ISSA certified',
      'Personalized training plans',
      'Progress tracking included',
      'Nutrition guidance available',
    ],
  },
  {
    badge: 'OUR FACILITY',
    heading: "Equipment That\nDoesn't Quit.",
    body: [
      'We partner exclusively with Technogym, Life Fitness, and Rogue to ensure you always train on the best. Our cardio floor features 80+ machines including treadmills, assault bikes, rowers, and ski ergs.',
      'The strength floor is divided into powerlifting platforms, an Olympic lifting area, a machine circuit zone, and a cable jungle. Our functional fitness zone spans 6,000 sq ft of open turf.',
      'Recovery is built into the experience: Normatec compression boots, infrared sauna pods, massage guns, and cold plunge tubs — all included with membership.',
    ],
    stats: [
      { n: '80+', l: 'Cardio Machines' },
      { n: '6k sqft', l: 'Functional Zone' },
      { n: '3', l: 'Top Equipment Brands' },
    ],
    image:
      'https://images.squarespace-cdn.com/content/v1/62b7b8d489319c4a2ff636e8/4da82832-efe9-4edb-a927-5e1b93e5d9d0/NOAHJVMES_AT--71.jpg',
    features: [
      'Newest cardio machines',
      'Premium strength equipment',
      'Functional fitness zone',
      'Recovery & wellness area',
    ],
  },
  {
    badge: 'OUR CLASSES',
    heading: '50+ Classes.\nZero Boredom.',
    body: [
      'From 5:30AM sunrise yoga to 10PM HIIT blasts, our schedule is built around your life. We offer 15 distinct class formats across strength, conditioning, flexibility, and mindfulness — capped at 15 participants for personal attention.',
      'All skill levels are welcome. Instructors offer modifications and progressions within the same class so a beginner and advanced athlete can train side by side — and both leave challenged.',
      'Signature classes: PowerBlast, SteelYoga, MetCon60, and Saturday morning Ultimate Bootcamp — 60 minutes of structured chaos with a waitlist every single week.',
    ],
    stats: [
      { n: '50+', l: 'Weekly Classes' },
      { n: '15', l: 'Class Formats' },
      { n: '15', l: 'Max Class Size' },
    ],
    image: 'https://youfit.com/wp-content/uploads/2024/06/YouFit-06-20-22-282-Edit.jpg',
    features: [
      'All fitness levels welcome',
      'New programming every 8 weeks',
      'Indoor & outdoor options',
      '100% satisfaction rate',
    ],
  },
]

const VALUES = ['Integrity', 'Intensity', 'Inclusivity', 'Innovation']

export default function AboutUs() {
  const location = useLocation()
  const benefitId = location.state?.benefitId
  const [activeTab, setActiveTab] = useState(
    benefitId ? (BENEFIT_TAB_MAP[benefitId] ?? 0) : 0
  )
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60)
    return () => clearTimeout(t)
  }, [activeTab])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const tab = TAB_CONTENT[activeTab]

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <style>{`
        .au-fade { opacity:0; transform:translateY(14px); transition:opacity .4s ease,transform .4s ease; }
        .au-fade.in { opacity:1; transform:translateY(0); }
        .au-fade.d1 { transition-delay:.04s; }
        .au-fade.d2 { transition-delay:.13s; }
        .au-fade.d3 { transition-delay:.22s; }

        .au-tab {
          position:relative; background:none; border:none;
          color:#9ca3af; font-size:12px; font-weight:600;
          letter-spacing:.12em; text-transform:uppercase;
          padding:18px 20px; cursor:pointer; transition:color .2s;
          white-space:nowrap; flex-shrink:0;
        }
        .au-tab:hover { color:#374151; }
        .au-tab.active { color:#111827; }
        .au-tab.active::after {
          content:''; position:absolute; bottom:0; left:20px; right:20px;
          height:2px; background:#f97316; border-radius:2px 2px 0 0;
        }

        .au-scroll { overflow-x:auto; scrollbar-width:none; }
        .au-scroll::-webkit-scrollbar { display:none; }

        .au-img-tr {
          position:absolute; top:-10px; right:-10px;
          width:36px; height:36px;
          border-top:3px solid #f97316; border-right:3px solid #f97316;
          border-radius:0 4px 0 0; z-index:2;
        }
        .au-img-bl {
          position:absolute; bottom:-10px; left:-10px;
          width:36px; height:36px;
          border-bottom:3px solid #fed7aa; border-left:3px solid #fed7aa;
          border-radius:0 0 0 4px; z-index:2;
        }

        .au-cta-btn {
          display:inline-flex; align-items:center; gap:8px;
          background:#f97316; color:#fff; border:none;
          padding:14px 36px; border-radius:8px;
          font-size:14px; font-weight:700; cursor:pointer;
          transition:background .2s,transform .15s;
        }
        .au-cta-btn:hover { background:#ea6c0a; transform:translateY(-1px); }
      `}</style>

      {/* ── HERO ── */}
      <div className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80"
          alt="PowerGym"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.3)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, transparent 30%, #f9fafb 100%)' }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-16 md:py-24">
          <span className="inline-block bg-orange-500 text-white text-xs font-bold tracking-widest px-3 py-1 rounded mb-4 uppercase">
            About Us
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
            Why Choose <span className="text-orange-500">PowerGym</span>
          </h1>
          <p className="text-sm md:text-base max-w-xl" style={{ color: 'rgba(255,255,255,0.72)' }}>
            Experience the ultimate fitness journey with our world-class facilities and expert support
          </p>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-16 md:top-20 z-30">
        <div className="container mx-auto px-4 md:px-16">
          <div className="au-scroll flex">
            {TABS.map((t, i) => (
              <button
                key={i}
                className={`au-tab ${activeTab === i ? 'active' : ''}`}
                onClick={() => setActiveTab(i)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT — mirrors Benefits section layout exactly ── */}
      <div className="container mx-auto px-4 md:px-16 py-10 md:py-16">
        <div className="flex flex-col lg:flex-row items-start gap-8 md:gap-12 lg:gap-16">

          {/* ── Text side ── */}
          <div className="flex-1 space-y-4 md:space-y-6">

            {/* Icon + heading row — exact Benefits style */}
            <div className={`au-fade d1 ${visible ? 'in' : ''}`}>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={TAB_ICONS[activeTab]} />
                  </svg>
                </div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                  {tab.heading.split('\n').map((line, i) => (
                    <span key={i}>{line}{i === 0 && <br />}</span>
                  ))}
                </h2>
              </div>
            </div>

            {/* Description — same style as Benefits p */}
            <div className={`au-fade d2 ${visible ? 'in' : ''}`}>
              {tab.body.map((para, i) => (
                <p key={i} className="text-gray-600 text-base md:text-lg leading-relaxed mb-3">
                  {para}
                </p>
              ))}
            </div>

            {/* Features — matches Benefits id=1 grid style */}
            <div className={`au-fade d2 ${visible ? 'in' : ''} grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4`}>
              {tab.features.map((f, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-orange-50 p-3 rounded-lg">
                  <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                    <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="font-semibold text-gray-900 text-sm">{f}</div>
                </div>
              ))}
            </div>

            {/* Stats — exact Benefits stats row style */}
            <div className={`au-fade d3 ${visible ? 'in' : ''}`}>
              <div className="flex flex-wrap items-center justify-start gap-3 md:gap-4 text-center">
                {tab.stats.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 md:gap-4">
                    <div>
                      <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                        {s.n}
                      </div>
                      <div className="text-xs md:text-sm text-gray-500 font-medium">
                        {s.l}
                      </div>
                    </div>
                    {i < tab.stats.length - 1 && (
                      <div className="text-xl md:text-2xl text-gray-300">|</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Image side — matches Benefits image panel ── */}
          <div className={`flex-1 w-full au-fade d2 ${visible ? 'in' : ''}`}>
            <div className="relative">
              <div className="au-img-tr" />
              <div className="au-img-bl" />
              <div className="relative rounded-xl overflow-hidden shadow-lg h-[240px] md:h-[380px] w-full">
                <img
                  src={tab.image}
                  alt={TABS[activeTab]}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.style.display = 'none')}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(249,115,22,0.1), transparent 55%)' }}
                />
                {/* Floating badge — like Benefits floating labels */}
                <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 rounded-lg shadow px-3 py-1.5 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{tab.badge}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── VALUES STRIP — orange-50 bg matching Benefits orange-50 features ── */}
      <div className="bg-orange-50 border-y border-orange-100 py-5">
        <div className="container mx-auto px-4 md:px-16">
          <div className="au-scroll flex items-center gap-8 md:gap-14">
            {VALUES.map((v, i) => (
              <div key={i} className="flex items-center gap-3 whitespace-nowrap">
                <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA — mirrors Benefits section footer feel ── */}
      <div className="py-14 md:py-20 text-center bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <span className="inline-block bg-orange-100 text-orange-600 text-xs font-bold tracking-widest px-3 py-1 rounded mb-5 uppercase">
            Get Started
          </span>
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Ready to start your journey?
          </h3>
          <p className="text-gray-600 text-base mb-8 max-w-md mx-auto">
            Join 8,000+ members who already made the move.
          </p>
          <Link to="/register?plan=trial">
            <Button 
              variant="accent" 
              size="sm"
              className="text-sm sm:text-base px-4 sm:px-6 inline-flex items-center gap-2"
            >
              Get Your Free Pass
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}