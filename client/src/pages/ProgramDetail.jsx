import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  FaCalendarAlt, FaClock, FaUsers, FaCheckCircle, FaArrowLeft, FaTimes,
  FaHeart, FaRegHeart, FaShare, FaFacebook, FaTwitter, FaWhatsapp, FaEnvelope,
  FaLink, FaChevronLeft, FaChevronRight, FaPlay, FaMinus, FaPlus,
  FaCrown, FaFire, FaExclamationCircle
} from 'react-icons/fa';
import { programService } from '../services/programService';
import { useAuth } from '../hooks/authHooks';

const ProgramDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  
  // ===== STATE VARIABLES =====
  const [isSaved, setIsSaved] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [showFullCurriculum, setShowFullCurriculum] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [relatedPrograms, setRelatedPrograms] = useState([]);

  useEffect(() => {
    if (id) {
      fetchProgramDetails();
      fetchRelatedPrograms();
    }
  }, [id]);

  useEffect(() => {
    if (program) {
      checkIfSaved();
    }
  }, [program]);

  const fetchProgramDetails = async () => {
    try {
      setLoading(true);
      const response = await programService.getProgramById(id);
      
      if (response.success) {
        setProgram(response.data);
        setIsSaved(response.data.isSaved || false);
      } else {
        throw new Error(response.message || 'Failed to fetch program');
      }
    } catch (err) {
      console.error('Failed to fetch program details:', err);
      setError(err.message || 'Program not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPrograms = async () => {
    try {
      const response = await programService.getAllPrograms({ limit: 3 });
      if (response.success && response.data?.programs) {
        // Filter out current program
        const filtered = response.data.programs.filter(p => p.id !== parseInt(id));
        setRelatedPrograms(filtered.slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to fetch related programs:', err);
    }
  };

  const checkIfSaved = async () => {
    if (!user) return;
    try {
      // This would come from the API - program.isSaved is already set in getProgramById
      setIsSaved(program?.isSaved || false);
    } catch (err) {
      console.error('Failed to check saved status:', err);
    }
  };

  const handleSaveProgram = async () => {
    if (!user) {
      navigate('/login', { 
        state: { 
          from: `/programs/${id}`,
          message: 'Please log in to save programs'
        } 
      });
      return;
    }

    try {
      if (isSaved) {
        await programService.unsaveProgram(parseInt(id));
        setIsSaved(false);
        toast.success('Program removed from saved');
      } else {
        await programService.saveProgram(parseInt(id));
        setIsSaved(true);
        toast.success('Program saved successfully');
      }
    } catch (err) {
      console.error('Failed to save/unsave program:', err);
      toast.error('Failed to update saved status. Please try again.');
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { 
        state: { 
          from: `/programs/${id}`,
          message: 'Please log in to enroll in this program'
        } 
      });
      return;
    }

    if (!selectedStartDate) {
      toast.error('Please select a start date');
      return;
    }

    try {
      setEnrolling(true);
      const response = await programService.enrollInProgram(parseInt(id));
      
      if (response.success) {
        setEnrolled(true);
        setShowSuccessModal(true);
        // Refresh program details to update capacity
        fetchProgramDetails();
      }
    } catch (err) {
      console.error('Enrollment failed:', err);
      if (err.message === 'Already enrolled in this program') {
        setEnrolled(true);
        toast.error('You are already enrolled in this program');
      } else {
        toast.error('Failed to enroll. Please try again.');
      }
    } finally {
      setEnrolling(false);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out ${program?.title} at PowerGym!`;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      email: `mailto:?subject=${encodeURIComponent(program?.title)}&body=${encodeURIComponent(text + '\n\n' + url)}`,
      copy: () => {
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      }
    };
    
    if (platform === 'copy') {
      shareUrls.copy();
    } else {
      window.open(shareUrls[platform], '_blank');
    }
    setShowShareMenu(false);
  };

  const nextImage = () => {
    if (program?.gallery?.length) {
      setActiveImageIndex((prev) => (prev + 1) % program.gallery.length);
    }
  };

  const prevImage = () => {
    if (program?.gallery?.length) {
      setActiveImageIndex((prev) => (prev - 1 + program.gallery.length) % program.gallery.length);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Get gallery images from API
  const galleryImages = program?.gallery?.length 
    ? program.gallery.map(g => g.image_url) 
    : program?.image 
      ? [program.image] 
      : [];

  // Get curriculum from API
  const curriculum = program?.curriculum || [];

  // Get FAQs from API
  const faqItems = program?.faqs || [];

  // Get start dates from API
  const startDates = program?.start_dates || [];

  // Get upgrade options from API
  const upgradeOptions = program?.upgrade_options || [];

  // Calculate spots left from capacity string
  const getSpotsLeft = () => {
    if (!program?.capacity) return null;
    const match = program.capacity.match(/(\d+)\/(\d+)/);
    if (match) {
      const enrolled = parseInt(match[1]);
      const total = parseInt(match[2]);
      return total - enrolled;
    }
    return null;
  };

  const spotsLeft = getSpotsLeft();
  const isLowSpots = spotsLeft !== null && spotsLeft <= 5 && spotsLeft > 0;
  const isAlmostFull = spotsLeft !== null && spotsLeft <= 2 && spotsLeft > 0;

  // Format start date for display
  const formatStartDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="pt-14 md:pt-20">
        <div className="container mx-auto px-4 md:px-16 py-16">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading program details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="pt-14 md:pt-20">
        <div className="container mx-auto px-4 md:px-16 py-16">
          <div className="text-center py-12">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Program not found</h3>
            <p className="text-gray-600 mb-4">{error || 'The program you are looking for does not exist.'}</p>
            <Link 
              to="/programs-events"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              <FaArrowLeft /> Back to Programs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-14 md:pt-20">
      {/* ===== HEADER BAR ===== */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-16 py-4 flex justify-between items-center">
          <Link to="/programs-events" className="text-gray-700 flex items-center gap-2 hover:text-orange-500 transition">
            <FaArrowLeft /> Back to Programs
          </Link>
        </div>
      </section>

      {/* ===== GALLERY & DESCRIPTION SECTION ===== */}
      <section className="py-8 md:py-16 bg-white">
        <div className="container mx-auto px-4 md:px-16">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* ===== GALLERY LEFT SIDE ===== */}
            <div>
              {/* Main Image */}
              <div className="relative h-80 md:h-96 mb-4 rounded-xl overflow-hidden bg-black">
                <img
                  src={galleryImages[activeImageIndex] || program.image}
                  alt={program.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Gallery Navigation Arrows */}
                {galleryImages.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition z-10"
                    >
                      <FaChevronLeft size={18} />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition z-10"
                    >
                      <FaChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* Save & Share Buttons - Top Right */}
                <div className="absolute top-4 right-4 flex gap-2 z-20">
                  <button
                    onClick={handleSaveProgram}
                    className="bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition backdrop-blur-sm"
                    aria-label="Save program"
                  >
                    {isSaved ? <FaHeart className="text-red-500" size={20} /> : <FaRegHeart size={20} />}
                  </button>
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition backdrop-blur-sm relative"
                    aria-label="Share program"
                  >
                    <FaShare size={20} />
                    
                    {/* Share Menu */}
                    {showShareMenu && (
                      <div className="absolute right-0 mt-12 w-48 bg-white rounded-xl shadow-xl z-30 py-2">
                        <button onClick={() => handleShare('facebook')} className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3">
                          <FaFacebook className="text-blue-600" /> Facebook
                        </button>
                        <button onClick={() => handleShare('twitter')} className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3">
                          <FaTwitter className="text-blue-400" /> Twitter
                        </button>
                        <button onClick={() => handleShare('whatsapp')} className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3">
                          <FaWhatsapp className="text-green-500" /> WhatsApp
                        </button>
                        <button onClick={() => handleShare('email')} className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3">
                          <FaEnvelope className="text-gray-600" /> Email
                        </button>
                        <div className="border-t my-2"></div>
                        <button onClick={() => handleShare('copy')} className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3">
                          <FaLink className="text-gray-600" /> Copy Link
                        </button>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Thumbnail Grid */}
              {galleryImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`h-20 rounded-lg overflow-hidden border-2 transition ${
                        activeImageIndex === idx ? 'border-orange-500 scale-105' : 'border-gray-200'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ===== DESCRIPTION RIGHT SIDE ===== */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{program.title}</h1>
              
              {/* Urgency Badge */}
              {isLowSpots && (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full w-fit mb-6 ${
                  isAlmostFull ? 'bg-red-500' : 'bg-orange-500'
                } text-white font-semibold mb-6`}>
                  <FaFire />
                  {isAlmostFull ? '🔥 Almost full! ' : '⚡ Limited spots! '}
                  Only {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
                </div>
              )}
              
              <p className="text-gray-700 mb-6 leading-relaxed">{program.description}</p>

              {/* Program Stats */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <FaUsers className="text-orange-500 text-lg" />
                  <span className="text-gray-700">{program.capacity || '0/20 enrolled'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaClock className="text-orange-500 text-lg" />
                  <span className="text-gray-700">{program.duration || '12 weeks'}</span>
                </div>
              </div>

              {/* What You'll Get */}
              <h3 className="text-lg font-bold mb-3 text-orange-500">What You'll Get</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-orange-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Personalized workout plans tailored to your goals</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-orange-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Expert coaching and form correction</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-orange-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Nutrition guidance and meal planning</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-orange-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Progress tracking and accountability</span>
                </li>
              </ul>

              {/* Video Preview Button */}
              {program.video_url && (
                <button 
                  onClick={() => setShowVideoModal(true)}
                  className="w-full flex items-center justify-center gap-3 bg-orange-100 hover:bg-orange-200 text-orange-700 px-6 py-3 rounded-lg mb-4 transition font-semibold"
                >
                  <FaPlay size={14} />
                  Watch Program Preview
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== VIDEO PREVIEW MODAL ===== */}
      {showVideoModal && program.video_url && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button 
              onClick={() => setShowVideoModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-orange-400 transition"
            >
              <FaTimes size={24} />
            </button>
            <div className="aspect-video bg-black rounded-xl overflow-hidden">
              <video
                src={program.video_url}
                controls
                className="w-full h-full"
                autoPlay
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}

      {/* ===== CONTENT SECTION ===== */}
      <section className="py-8 md:py-16 bg-white">
        <div className="container mx-auto px-4 md:px-16">
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* ===== MAIN CONTENT (2/3) ===== */}
            <div className="md:col-span-2">
              {/* ===== CURRICULUM / SYLLABUS ===== */}
              {curriculum.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4 text-orange-500">Program Curriculum</h3>
                  <div className="bg-gray-50 rounded-xl p-6">
                    {(showFullCurriculum ? curriculum : curriculum.slice(0, 3)).map((week, idx) => (
                      <div key={week.id || idx} className="mb-4 last:mb-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                            {week.week_number}
                          </span>
                          <h4 className="font-bold">{week.week_title}</h4>
                        </div>
                        <ul className="ml-9 space-y-1">
                          {week.topics.map((topic, i) => (
                            <li key={i} className="text-gray-600 text-sm flex items-center gap-2">
                              <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {curriculum.length > 3 && (
                      <button 
                        onClick={() => setShowFullCurriculum(!showFullCurriculum)}
                        className="mt-4 text-orange-500 font-semibold hover:text-orange-600 transition flex items-center gap-2"
                      >
                        {showFullCurriculum ? (
                          <>Show Less <FaMinus size={12} /></>
                        ) : (
                          <>Show Full Curriculum ({curriculum.length} weeks) <FaPlus size={12} /></>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ===== FAQ ACCORDION ===== */}
              {faqItems.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4 text-orange-500">Frequently Asked Questions</h3>
                  <div className="space-y-3">
                    {faqItems.map((faq, idx) => (
                      <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleFaq(idx)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
                        >
                          <span className="font-semibold">{faq.question}</span>
                          {openFaqIndex === idx ? <FaMinus className="text-orange-500" /> : <FaPlus className="text-orange-500" />}
                        </button>
                        {openFaqIndex === idx && (
                          <div className="px-6 pb-4 text-gray-600">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ===== SIDEBAR (1/3) ===== */}
            <div>
              <div className="bg-gray-100 rounded-xl p-6 sticky top-24">
                {enrolled ? (
                  <div className="text-center mb-6">
                    <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg mb-4">
                      <FaCheckCircle className="inline mr-2" />
                      You are enrolled in this program
                    </div>
                    <Link 
                      to="/programs-events"
                      className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition inline-block text-center"
                    >
                      Browse More Programs
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Price */}
                    <div className="mb-6">
                      <div className="text-3xl font-bold text-orange-500 mb-2">{program.price}</div>
                      <div className="text-sm text-gray-600">per month</div>
                    </div>

                    {/* ===== SCHEDULE PICKER ===== */}
                    {startDates.length > 0 && (
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Select Start Date <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={selectedStartDate}
                          onChange={(e) => setSelectedStartDate(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition bg-white"
                        >
                          <option value="">Choose a start date</option>
                          {startDates.map((date) => (
                            <option key={date.id} value={date.start_date}>
                              {formatStartDate(date.start_date)} 
                              {date.spots_available <= 5 && date.spots_available > 0 && ` (${date.spots_available} spots left)`}
                              {date.spots_available === 0 && ` (Full)`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Enroll Button */}
                    <button 
                      onClick={handleEnroll}
                      disabled={enrolling || (startDates.length > 0 && !selectedStartDate)}
                      className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                    >
                      {enrolling ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                    <button className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                      Contact Us
                    </button>

                    {/* ===== UPGRADE OPTIONS ===== */}
                    {upgradeOptions.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-300">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <FaCrown className="text-orange-500" />
                          Upgrade Your Experience
                        </h4>
                        <div className="space-y-3">
                          {upgradeOptions.map((option) => (
                            <div key={option.id} className="bg-white rounded-lg p-4 border-2 border-orange-200 relative">
                              {option.badge_text && (
                                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                                  {option.badge_text}
                                </span>
                              )}
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-bold">{option.title}</span>
                                <span className="text-orange-500 font-bold">{option.price}</span>
                              </div>
                              <ul className="text-xs text-gray-600 space-y-1">
                                {option.features?.map((feature, i) => (
                                  <li key={i} className="flex items-center gap-1">
                                    <FaCheckCircle className="text-green-500 text-xs" /> {feature}
                                  </li>
                                ))}
                              </ul>
                              <Link 
                                to={`/programs/${option.id}`}
                                className="mt-3 text-sm text-orange-500 font-semibold hover:text-orange-600 transition block"
                              >
                                View Details →
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RELATED PROGRAMS ===== */}
      {relatedPrograms.length > 0 && (
        <section className="py-8 md:py-16 bg-gray-50">
          <div className="container mx-auto px-4 md:px-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              You May Also <span className="text-orange-500">Like</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPrograms.map((p) => (
                <Link 
                  key={p.id} 
                  to={`/programs/${p.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition"
                >
                  <img src={p.image} alt={p.title} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-bold mb-2">{p.title}</h3>
                    <p className="text-orange-500 font-semibold">{p.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== SUCCESS MODAL ===== */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full relative animate-fade-in">
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <FaTimes size={20} />
            </button>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <FaCheckCircle className="text-green-600 text-4xl" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Successfully Enrolled!
              </h3>
              
              <p className="text-gray-600 mb-6">
                You have successfully enrolled in <span className="font-semibold">{program.title}</span>.
                Check your email for confirmation and program details.
              </p>
              
              <div className="space-y-3">
                <Link
                  to="/programs-events"
                  className="block w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
                  onClick={() => setShowSuccessModal(false)}
                >
                  Browse More Programs
                </Link>
                
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="block w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  Continue Viewing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramDetail;