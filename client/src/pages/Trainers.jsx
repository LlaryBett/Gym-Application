import { useState, useEffect } from 'react';
import CTA from '../components/CTA';
import { FaInstagram, FaLinkedin, FaFacebookF, FaXTwitter, FaWhatsapp, FaChevronDown, FaChevronUp } from 'react-icons/fa6';
import trainersService from '../services/trainersService';
import { useAuth } from '../hooks/authHooks';

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const { user } = useAuth();

  const FAQS = [
    {
      id: 1,
      question: "How do I choose the right trainer for me?",
      answer: "Consider your fitness goals, preferred training style, and personality match. We recommend booking a free consultation to meet trainers and discuss your objectives."
    },
    {
      id: 2,
      question: "What are the session rates?",
      answer: "Individual sessions start at KSH 5,000/hour. Package deals available: 5 sessions for KSH 22,500, 10 sessions for KSH 45,000, or monthly unlimited for KSH 80,000. Prices vary by trainer specialization."
    },
    {
      id: 3,
      question: "Can I switch trainers if needed?",
      answer: "Absolutely! We want you to feel comfortable. Contact our member services team and we'll help you find a better match at no additional cost."
    },
    {
      id: 4,
      question: "Do trainers provide nutrition guidance?",
      answer: "Yes, most trainers offer basic nutrition advice. For comprehensive meal planning, we recommend booking with our certified nutritionists like Emily Davis."
    },
    {
      id: 5,
      question: "What's included in a personal training session?",
      answer: "Each session includes personalized workout planning, form correction, motivation, progress tracking, and access to all gym equipment and facilities."
    }
  ];

  useEffect(() => {
    fetchAllTrainers();
  }, []);

  const fetchAllTrainers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await trainersService.getAllTrainers({
        page: 1,
        limit: 50
      });
      
      if (response.success) {
        const formattedTrainers = response.data.trainers.map(trainer => 
          trainersService.formatTrainerForDisplay(trainer)
        );
        setTrainers(formattedTrainers);
      } else {
        throw new Error(response.message || 'Failed to fetch trainers');
      }
    } catch (err) {
      console.error('Failed to fetch trainers:', err);
      setError(err.message || 'Failed to load trainers. Please try again later.');
      setTrainers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/400x500/f97316/ffffff?text=Trainer'
  }

  const handleBookSession = (trainer) => {
    setSelectedTrainer(trainer);
    console.log('Booking session with:', trainer.name);
  }

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  // Loading state
  if (loading) {
    return (
      <div className="pt-4 md:pt-24 py-8 md:py-16">
        <div className="container mx-auto px-4 md:px-16">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading trainers...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="pt-4 md:pt-24 py-8 md:py-16">
        <div className="container mx-auto px-4 md:px-16">
          <div className="text-center py-12">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to load trainers</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchAllTrainers}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Use trainers from API or empty array if none
  const displayTrainers = trainers.length > 0 ? trainers : [];

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-16">
        {/* Top Row — 3 columns */}
        <div className="flex flex-col lg:flex-row items-start justify-between mb-8 md:mb-12 gap-4 md:gap-6">
          
          {/* Left — Main Header */}
          <div className="lg:w-1/3 text-left w-full">
            <h1 className="text-3xl md:text-4xl font-bold text-orange-500">Trainers</h1>
          </div>

          {/* Center — Subheader */}
          <div className="lg:w-1/3 text-left lg:text-center w-full">
            <p className="text-lg md:text-xl lg:text-2xl font-semibold text-black-900">
              Meet our world-class trainers <br/><span className="text-orange-500">and gym instructors</span>
            </p>
          </div>

          {/* Right — Brief Description */}
          <div className="lg:w-1/3 text-left lg:text-right w-full">
            <p className="text-black-700 text-sm md:text-base">
              Our certified trainers are dedicated to helping you achieve your fitness goals safely and effectively. With years of experience and personalized coaching, they'll guide you every step of the way.
            </p>
          </div>
        </div>

        {/* Mobile Pinterest-style Masonry Layout */}
        <div className="md:hidden columns-2 sm:columns-3 gap-4 space-y-4">
          {displayTrainers.map((trainer) => (
            <div 
              key={trainer.id} 
              className="break-inside-avoid mb-4 group cursor-pointer"
              onClick={() => handleBookSession(trainer)}
            >
              <div className="relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-orange transition-shadow">
                <img
                  src={trainer.image}
                  alt={`${trainer.name} - ${trainer.specialty} trainer`}
                  className="w-full h-auto object-cover"
                  onError={handleImageError}
                  loading="lazy"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-3">
                  <button 
                    className="bg-black text-white px-4 py-2 rounded-full font-semibold bg-gray-800 transition text-xs hover:bg-gray-700 mb-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBookSession(trainer)
                    }}
                  >
                    Book Session
                  </button>
                  <p className="text-white text-xs text-center mb-2">{trainer.bio}</p>
                  {/* Social Links */}
                  <div className="flex gap-2">
                    {trainer.socials?.instagram && (
                      <a href={trainer.socials.instagram} target="_blank" rel="noopener noreferrer" 
                         className="text-white hover:text-orange-400 transition" onClick={(e) => e.stopPropagation()}>
                        <FaInstagram size={16} />
                      </a>
                    )}
                    {trainer.socials?.x && (
                      <a href={trainer.socials.x} target="_blank" rel="noopener noreferrer" 
                         className="text-white hover:text-orange-400 transition" onClick={(e) => e.stopPropagation()}>
                        <FaXTwitter size={16} />
                      </a>
                    )}
                    {trainer.socials?.linkedin && (
                      <a href={trainer.socials.linkedin} target="_blank" rel="noopener noreferrer" 
                         className="text-white hover:text-orange-400 transition" onClick={(e) => e.stopPropagation()}>
                        <FaLinkedin size={16} />
                      </a>
                    )}
                    {trainer.socials?.facebook && (
                      <a href={trainer.socials.facebook} target="_blank" rel="noopener noreferrer" 
                         className="text-white hover:text-orange-400 transition" onClick={(e) => e.stopPropagation()}>
                        <FaFacebookF size={16} />
                      </a>
                    )}
                    {trainer.socials?.whatsapp && (
                      <a href={`https://wa.me/${trainer.socials.whatsapp.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" 
                         className="text-white hover:text-orange-400 transition" onClick={(e) => e.stopPropagation()}>
                        <FaWhatsapp size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-bold mt-2 text-black-900 text-center">{trainer.name}</h3>
              <p className="text-orange-500 font-semibold text-xs text-center">{trainer.specialty}</p>
            </div>
          ))}
        </div>

       {/* Desktop Staggered Masonry Grid - Hidden on mobile */}
       <div className="hidden md:grid grid-cols-6 gap-4 auto-rows-[minmax(250px,auto)]">
          {/* Trainer 1 - Pinned Photo Style */}
          <div className="flex flex-col items-center group cursor-pointer" onClick={() => handleBookSession(displayTrainers[0])}>
            <div className="relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-orange transition-shadow h-48 w-full">
              <img
                src={displayTrainers[0]?.image}
                alt={`${displayTrainers[0]?.name} - ${displayTrainers[0]?.specialty} trainer`}
                className="w-full h-full object-cover"
                onError={handleImageError}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button className="bg-black text-white px-4 py-2 rounded-full font-semibold bg-gray-800 transition text-sm hover:bg-gray-700">
                  Book Session
                </button>
              </div>
            </div>
            <h3 className="text-sm font-bold mt-3 text-black-900">{displayTrainers[0]?.name}</h3>
            <p className="text-orange-500 font-semibold text-xs">{displayTrainers[0]?.specialty}</p>
          </div>

          {/* Trainer 2 - Regular */}
          <div className="flex flex-col items-center group cursor-pointer" onClick={() => handleBookSession(displayTrainers[1])}>
            <div className="relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-orange transition-shadow h-48 w-full">
              <img 
                src={displayTrainers[1]?.image} 
                alt={`${displayTrainers[1]?.name} - ${displayTrainers[1]?.specialty} trainer`}
                className="w-full h-full object-cover" 
                onError={handleImageError}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button className="bg-black text-white px-4 py-2 rounded-full font-semibold bg-gray-800 transition text-sm hover:bg-gray-700">
                  Book Session
                </button>
              </div>
            </div>
            <h3 className="text-sm font-bold mt-3 text-black-900">{displayTrainers[1]?.name}</h3>
            <p className="text-orange-500 font-semibold text-xs">{displayTrainers[1]?.specialty}</p>
          </div>

          {/* Trainer 3 - Featured (Larger) */}
          <div className="relative flex items-start group cursor-pointer" onClick={() => handleBookSession(displayTrainers[2])}>
            <div className="relative bg-gradient-orange rounded-xl shadow-lg overflow-hidden hover:shadow-orange transition-shadow h-80 w-full">
              <img
                src={displayTrainers[2]?.image}
                alt={`${displayTrainers[2]?.name} - ${displayTrainers[2]?.specialty} trainer`}
                className="w-full h-full object-cover"
                onError={handleImageError}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button className="bg-black text-white px-6 py-3 rounded-full font-semibold bg-gray-800 transition text-sm hover:bg-gray-700">
                  Book Session
                </button>
              </div>
            </div>

            {/* Text — Right side, positioned above Trainers 4 & 5 */}
            <div className="absolute left-full ml-4 top-10 text-left">
              <h3 className="text-sm font-bold text-black-900 whitespace-nowrap">
                {displayTrainers[2]?.name}
              </h3>
              <p className="text-orange-500 font-semibold text-xs whitespace-nowrap">
                {displayTrainers[2]?.specialty}
              </p>
            </div>
          </div>

          {/* Trainer 4 - Regular (below Trainer 3’s text) */}
          <div className="flex flex-col items-center mt-32 group cursor-pointer" onClick={() => handleBookSession(displayTrainers[3])}>
            <div className="relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-orange transition-shadow h-48 w-full">
              <img 
                src={displayTrainers[3]?.image} 
                alt={`${displayTrainers[3]?.name} - ${displayTrainers[3]?.specialty} trainer`}
                className="w-full h-full object-cover" 
                onError={handleImageError}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button className="bg-black text-white px-4 py-2 rounded-full font-semibold bg-gray-800 transition text-sm hover:bg-gray-700">
                  Book Session
                </button>
              </div>
            </div>
            <h3 className="text-sm font-bold mt-3 text-black-900">{displayTrainers[3]?.name}</h3>
            <p className="text-orange-500 font-semibold text-xs">{displayTrainers[3]?.specialty}</p>
          </div>

          {/* Trainer 5 - Regular (aligned with Trainer 4) */}
          <div className="flex flex-col items-center mt-32 group cursor-pointer" onClick={() => handleBookSession(displayTrainers[4])}>
            <div className="relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-orange transition-shadow h-48 w-full">
              <img 
                src={displayTrainers[4]?.image} 
                alt={`${displayTrainers[4]?.name} - ${displayTrainers[4]?.specialty} trainer`}
                className="w-full h-full object-cover" 
                onError={handleImageError}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button className="bg-black text-white px-4 py-2 rounded-full font-semibold bg-gray-800 transition text-sm hover:bg-gray-700">
                  Book Session
                </button>
              </div>
            </div>
            <h3 className="text-sm font-bold mt-3 text-black-900">{displayTrainers[4]?.name}</h3>
            <p className="text-orange-500 font-semibold text-xs">{displayTrainers[4]?.specialty}</p>
          </div>

          {/* Trainer 6 - Secondary Featured (Larger) */}
          <div className="flex flex-col items-center group cursor-pointer" onClick={() => handleBookSession(displayTrainers[5])}>
            <div className="relative bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-lg overflow-hidden hover:shadow-orange transition-shadow h-56 w-full">
              <img 
                src={displayTrainers[5]?.image} 
                alt={`${displayTrainers[5]?.name} - ${displayTrainers[5]?.specialty} trainer`}
                className="w-full h-full object-cover border-4 border-white" 
                onError={handleImageError}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button className="bg-black text-white px-4 py-2 rounded-full font-semibold bg-gray-800 transition text-sm hover:bg-gray-700">
                  Book Session
                </button>
              </div>
            </div>
            <h3 className="text-sm font-bold mt-3 text-black-900">{displayTrainers[5]?.name}</h3>
            <p className="text-orange-500 font-semibold text-xs">{displayTrainers[5]?.specialty}</p>
          </div>

        </div>

        {/* Training Philosophy Section */}
        <section className="mt-16 md:mt-24 bg-gradient-to-br from-orange-50 to-white rounded-2xl p-6 md:p-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-black-900 mb-4">
              Our <span className="text-orange-500">Training Philosophy</span>
            </h2>
            <p className="text-center text-gray-600 mb-8 md:mb-12 text-sm md:text-base">
              The PowerGym approach to personal training and fitness excellence
            </p>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">1</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-black-900 mb-2">Personalized Approach</h3>
                <p className="text-gray-600 text-sm md:text-base">
                  Every client is unique. We create customized workout plans based on your goals, fitness level, and lifestyle.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">2</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-black-900 mb-2">Science-Based Methods</h3>
                <p className="text-gray-600 text-sm md:text-base">
                  Our trainers use evidence-based techniques and stay updated with the latest fitness research and methodologies.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">3</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-black-900 mb-2">Sustainable Results</h3>
                <p className="text-gray-600 text-sm md:text-base">
                  We focus on building lasting habits and lifestyle changes, not quick fixes or extreme measures.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-16 md:mt-24">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-black-900 mb-4">
              Frequently Asked <span className="text-orange-500">Questions</span>
            </h2>
            <p className="text-center text-gray-600 mb-8 md:mb-12 text-sm md:text-base">
              Everything you need to know about personal training at PowerGym
            </p>

            <div className="space-y-4">
              {FAQS.map((faq) => (
                <div key={faq.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <button
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <span className="font-semibold text-black-900 text-sm md:text-base">{faq.question}</span>
                    {openFaq === faq.id ? (
                      <FaChevronUp className="text-orange-500 flex-shrink-0 ml-4" />
                    ) : (
                      <FaChevronDown className="text-orange-500 flex-shrink-0 ml-4" />
                    )}
                  </button>
                  {openFaq === faq.id && (
                    <div className="px-6 pb-4 text-gray-600 text-sm md:text-base">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* CTA Component - Outside container to maintain full-width design */}
      <CTA />

      {/* Simple Booking Modal */}
      {selectedTrainer && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTrainer(null)}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-orange opacity-10 rounded-xl" />
            <div className="relative">
              <h2 className="text-2xl font-bold text-black-900 mb-2">{selectedTrainer.name}</h2>
              <p className="text-orange-500 font-semibold mb-4">{selectedTrainer.specialty}</p>
              <p className="text-gray-600 mb-4">{selectedTrainer.bio}</p>
              
              {/* Social Links in Modal */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-black-900 mb-2">Connect:</p>
                <div className="flex gap-3">
                  {selectedTrainer.socials?.instagram && (
                    <a href={selectedTrainer.socials.instagram} target="_blank" rel="noopener noreferrer" 
                       className="text-orange-500 hover:text-orange-600 transition">
                      <FaInstagram size={24} />
                    </a>
                  )}
                  {selectedTrainer.socials?.x && (
                    <a href={selectedTrainer.socials.x} target="_blank" rel="noopener noreferrer" 
                       className="text-orange-500 hover:text-orange-600 transition">
                      <FaXTwitter size={24} />
                    </a>
                  )}
                  {selectedTrainer.socials?.linkedin && (
                    <a href={selectedTrainer.socials.linkedin} target="_blank" rel="noopener noreferrer" 
                       className="text-orange-500 hover:text-orange-600 transition">
                      <FaLinkedin size={24} />
                    </a>
                  )}
                  {selectedTrainer.socials?.facebook && (
                    <a href={selectedTrainer.socials.facebook} target="_blank" rel="noopener noreferrer" 
                       className="text-orange-500 hover:text-orange-600 transition">
                      <FaFacebookF size={24} />
                    </a>
                  )}
                  {selectedTrainer.socials?.whatsapp && (
                    <a href={`https://wa.me/${selectedTrainer.socials.whatsapp.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" 
                       className="text-orange-500 hover:text-orange-600 transition">
                      <FaWhatsapp size={24} />
                    </a>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-semibold text-black-900 mb-2">Certifications:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTrainer.certifications?.map((cert, idx) => (
                    <span key={idx} className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-semibold">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  className="flex-1 bg-black text-white px-4 py-3 rounded-full font-semibold bg-gray-800 hover:bg-gray-700 transition"
                  onClick={() => window.location.href = `mailto:${selectedTrainer.email}?subject=Book Training Session`}
                >
                  Book Session
                </button>
                <button 
                  className="flex-1 border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
                  onClick={() => setSelectedTrainer(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}