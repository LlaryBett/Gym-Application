import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaArrowRight, FaSpinner, FaCreditCard } from 'react-icons/fa';
import { membershipAPI, cardAPI } from '../services/api';
import MembershipCardModal from '../components/Card';
import toast from 'react-hot-toast';

// ── Palette tokens ─────────────────────────────────────────────────────────
// orange-50:#fff7ed  orange-100:#ffedd5  orange-200:#fed7aa  orange-300:#fdba74
// orange-400:#fb923c orange-500:#f97316  orange-600:#ea580c  orange-700:#c2410c
// black-50:#fafafa   black-100:#f5f5f5   black-200:#e5e5e5   black-300:#d4d4d4
// black-400:#a3a3a3  black-500:#737373   black-600:#525252   black-700:#404040
// black-800:#262626  black-900:#000000
// yellow-400:#facc15
// success:#22c55e  warning:#f59e0b  error:#ef4444
// ─────────────────────────────────────────────────────────────────────────────


// ── Main PaymentSuccess Page ───────────────────────────────────────────────
const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState(null);
  const [card, setCard] = useState(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [animate, setAnimate] = useState(false);
  const reference = searchParams.get('reference');
  const hasShownToast = useRef(false);

  useEffect(() => { verifyAndFetchMembership(); }, []);
  useEffect(() => { if (!loading) setTimeout(() => setAnimate(true), 100); }, [loading]);

  const verifyAndFetchMembership = async () => {
    try {
      await new Promise(r => setTimeout(r, 2000));
      const [membershipRes, cardRes] = await Promise.allSettled([
        membershipAPI.getMyMembership(),
        cardAPI.getMyCard(),
      ]);
      if (membershipRes.status === 'fulfilled' && membershipRes.value.success) {
        setMembership(membershipRes.value.data);
      }
      if (cardRes.status === 'fulfilled' && cardRes.value.success) {
        setCard(cardRes.value.data);
      }
      if (!hasShownToast.current) {
        toast.success('Membership activated successfully!');
        hasShownToast.current = true;
      }
    } catch (error) {
      console.error('Failed to fetch membership:', error);
      if (!hasShownToast.current) {
        toast.error('Payment successful but membership update delayed');
        hasShownToast.current = true;
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
        <style>{`
          @keyframes pulse-ring {
            0%   { transform: scale(0.95); opacity: 1; }
            70%  { transform: scale(1.15); opacity: 0; }
            100% { transform: scale(0.95); opacity: 0; }
          }
          @keyframes bounce-dot {
            0%, 100% { transform: translateY(0);   opacity: 0.4; }
            50%       { transform: translateY(-6px); opacity: 1;   }
          }
          .ps-pulse  { animation: pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite; }
          .ps-dot-0  { animation: bounce-dot 1.2s ease-in-out 0s   infinite; }
          .ps-dot-1  { animation: bounce-dot 1.2s ease-in-out 0.2s infinite; }
          .ps-dot-2  { animation: bounce-dot 1.2s ease-in-out 0.4s infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <div className="ps-pulse" style={{ position: 'absolute', width: 64, height: 64, borderRadius: '50%', background: '#fed7aa' }} />
            <div style={{ position: 'relative', width: 56, height: 56, borderRadius: '50%', background: '#fff7ed', border: '2px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaSpinner style={{ color: '#f97316', fontSize: 20, animation: 'spin 1s linear infinite' }} />
            </div>
          </div>
          <p style={{ color: '#737373', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Verifying your payment
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
            {['ps-dot-0','ps-dot-1','ps-dot-2'].map(cls => (
              <div key={cls} className={cls} style={{ width: 6, height: 6, borderRadius: '50%', background: '#fdba74' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes drawCircle {
          from { stroke-dashoffset: 200; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes checkPop {
          0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
          60%  { transform: scale(1.2) rotate(3deg);  opacity: 1; }
          100% { transform: scale(1)   rotate(0deg);  opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes confettiFall {
          0%   { transform: translateY(-8px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(56px) rotate(360deg); opacity: 0; }
        }
        @keyframes cardBadgePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0.4); }
          50%       { box-shadow: 0 0 0 8px rgba(249,115,22,0); }
        }

        .ps-a0 { animation: fadeUp .45s ease          forwards; opacity: 0; }
        .ps-a1 { animation: fadeUp .45s ease .10s     forwards; opacity: 0; }
        .ps-a2 { animation: fadeUp .45s ease .20s     forwards; opacity: 0; }
        .ps-a3 { animation: fadeUp .45s ease .32s     forwards; opacity: 0; }
        .ps-a4 { animation: fadeUp .45s ease .46s     forwards; opacity: 0; }
        .ps-a5 { animation: fadeUp .45s ease .58s     forwards; opacity: 0; }

        .ps-circle circle {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: drawCircle .7s ease .1s forwards;
        }
        .ps-check { animation: checkPop .5s cubic-bezier(0.34,1.56,0.64,1) .6s both; }

        .ps-shimmer {
          background: linear-gradient(90deg, #f97316 0%, #fdba74 40%, #f97316 60%, #f97316 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 2.5s linear .8s infinite;
        }

        .ps-confetti {
          position: absolute;
          width: 6px; height: 6px;
          border-radius: 50%;
          animation: confettiFall 1.2s ease forwards;
        }

        .ps-detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #ffedd5;
        }
        .ps-detail-row:last-child { border-bottom: none; }

        .ps-btn {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%;
          background: #f97316;
          color: #ffffff;
          border: none;
          padding: 14px 24px;
          border-radius: 9999px;
          font-size: 15px; font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: background .2s, transform .15s, box-shadow .2s;
          box-shadow: 0 4px 14px rgba(249,115,22,0.28);
        }
        .ps-btn:hover {
          background: #ea580c;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(249,115,22,0.38);
        }

        .ps-card-trigger {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%;
          background: linear-gradient(135deg, #1e3a8a, #1d4ed8, #4338ca);
          color: #fff;
          border: none;
          padding: 14px 24px;
          border-radius: 9999px;
          font-size: 15px; font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: opacity .2s, transform .15s;
          box-shadow: 0 4px 20px rgba(30,58,138,0.35);
          animation: cardBadgePulse 2.5s ease-in-out 1s infinite;
        }
        .ps-card-trigger:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .ps-divider { height: 1px; background: #e5e5e5; flex: 1; }
      `}</style>

      {showCardModal && (
        <MembershipCardModal card={card} onClose={() => setShowCardModal(false)} />
      )}

      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #ffffff, #f5f5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
        <div style={{ width: '100%', maxWidth: 860, opacity: animate ? 1 : 0, transition: 'opacity .3s' }}>

          {/* ── Card ── */}
          <div style={{ background: '#ffffff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.10)', border: '1px solid #e5e5e5' }}>

            {/* Top accent bar */}
            <div style={{ height: 6, background: 'linear-gradient(to right, #fb923c, #f97316, #ea580c)' }} />

            {/* Flex row */}
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>

              {/* ─── LEFT PANEL ─────────────────────────────────────── */}
              <div style={{
                flex: '0 0 40%', minWidth: 260,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '40px 32px',
                background: '#fff7ed',
                borderRight: '1px solid #ffedd5',
                position: 'relative',
              }}>

                {/* Confetti */}
                {animate && [
                  { top: '16%', left: '16%', color: '#f97316', delay: '.70s' },
                  { top: '10%', left: '70%', color: '#facc15', delay: '.85s' },
                  { top:  '7%', left: '46%', color: '#fdba74', delay: '.75s' },
                  { top: '20%', left: '30%', color: '#fb923c', delay: '.95s' },
                  { top: '14%', left: '58%', color: '#facc15', delay: '.65s' },
                ].map((c, i) => (
                  <div key={i} className="ps-confetti" style={{ top: c.top, left: c.left, background: c.color, animationDelay: c.delay }} />
                ))}

                {/* Check icon */}
                <div className="ps-a0" style={{ position: 'relative' }}>
                  <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#ffedd5', border: '4px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'relative', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg className="ps-circle" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 56 56" fill="none">
                        <circle cx="28" cy="28" r="26" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                      <FaCheckCircle className="ps-check" style={{ color: '#22c55e', fontSize: 28, position: 'relative', zIndex: 1 }} />
                    </div>
                  </div>
                </div>

                <h1 className="ps-a1" style={{ marginTop: 20, fontSize: 'clamp(1.4rem,2.5vw,1.9rem)', fontWeight: 800, textAlign: 'center', letterSpacing: '-0.02em', lineHeight: 1.2, fontFamily: "'Montserrat', sans-serif" }}>
                  <span className="ps-shimmer">Payment</span>{' '}
                  <span style={{ color: '#000000' }}>Successful!</span>
                </h1>

                <p className="ps-a2" style={{ color: '#737373', fontSize: 13, marginTop: 10, textAlign: 'center', lineHeight: 1.65 }}>
                  Your membership has been activated and is ready to use.
                </p>

                {reference && (
                  <div className="ps-a3" style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: 8, padding: '8px 12px', width: '100%', gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Ref</span>
                    <span style={{ fontSize: 11, color: '#525252', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reference}</span>
                  </div>
                )}

                <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ fontSize: 11, color: '#a3a3a3' }}>
                    Secured · <strong style={{ color: '#525252' }}>PowerGym</strong>
                  </span>
                </div>
              </div>

              {/* ─── RIGHT PANEL ─────────────────────────────────────── */}
              <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px 32px' }}>

                {/* Membership details */}
                {membership ? (
                  <div className="ps-a2">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                      <div style={{ width: 4, height: 22, background: '#f97316', borderRadius: 4 }} />
                      <h3 style={{ fontSize: 11, fontWeight: 700, color: '#262626', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
                        Membership Details
                      </h3>
                    </div>
                    <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: 12, padding: '4px 20px' }}>
                      <div className="ps-detail-row">
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Plan</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#000000' }}>{membership.plan_name}</span>
                      </div>
                      <div className="ps-detail-row">
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Member #</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#f97316', fontFamily: 'monospace' }}>{membership.membership_number}</span>
                      </div>
                      <div className="ps-detail-row">
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Valid Until</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#000000' }}>
                          {new Date(membership.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="ps-a2" style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: '#737373' }}>Membership details will appear shortly.</p>
                  </div>
                )}

                {/* View Card Button */}
                {card && (
                  <button className="ps-btn" onClick={() => setShowCardModal(true)} style={{ marginTop: 20, background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8, #4338ca)', boxShadow: '0 4px 20px rgba(30,58,138,0.35)', animation: 'cardBadgePulse 2.5s ease-in-out 1s infinite' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <FaCreditCard style={{ fontSize: 16 }} />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>View Membership Card</div>
                        <div style={{ fontSize: 10, opacity: 0.75, fontWeight: 400 }}>{card.card_number} · {card.card_type}</div>
                      </div>
                    </div>
                    <FaArrowRight style={{ fontSize: 13 }} />
                  </button>
                )}

                {/* Actions */}
                <div className="ps-a4" style={{ marginTop: card ? 16 : 32 }}>
                  <Link to="/dashboard" className="ps-btn">
                    Go to Dashboard <FaArrowRight style={{ fontSize: 13 }} />
                  </Link>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0' }}>
                    <div className="ps-divider" />
                    <span style={{ fontSize: 11, color: '#a3a3a3' }}>or</span>
                    <div className="ps-divider" />
                  </div>

                  <Link to="/membership"
                    style={{ display: 'block', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#f97316', textDecoration: 'none', padding: '4px 0' }}
                    onMouseEnter={e => e.target.style.color = '#ea580c'}
                    onMouseLeave={e => e.target.style.color = '#f97316'}
                  >
                    View All Plans →
                  </Link>
                </div>

              </div>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: '#a3a3a3', marginTop: 16 }}>
            A confirmation email has been sent to your registered address.
          </p>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;