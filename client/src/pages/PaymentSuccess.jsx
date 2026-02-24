import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaArrowRight, FaSpinner, FaCreditCard, FaTimes, FaCrown, FaDumbbell, FaShieldAlt, FaRegClock } from 'react-icons/fa';
import { GiBodyBalance, GiStrongMan } from 'react-icons/gi';
import QRCode from 'react-qr-code';
import { membershipAPI, cardAPI } from '../services/api';
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



// ── MembershipCard Modal ───────────────────────────────────────────────────
const MembershipCardModal = ({ card, onClose }) => {
  const [flipped, setFlipped] = useState(false);

  const formatCardNumber = (number) => {
    if (!number) return '•••• •••• •••• ••••';
    const cleaned = number.replace(/\s/g, '');
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (dateString) => {
    if (!dateString) return '••/••';
    const date = new Date(dateString);
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
  };

  const getGradient = () => {
    if (!card) return 'linear-gradient(135deg, #1f2937, #111827)';
    const design = card.card_design || '';
    const color = card.card_color || '';
    if (design.includes('pro') || color.includes('blue')) return 'linear-gradient(135deg, #1e3a8a, #1d4ed8, #4338ca)';
    if (design.includes('premium') || color.includes('purple')) return 'linear-gradient(135deg, #581c87, #7c3aed, #ea580c)';
    if (design.includes('standard') || color.includes('green')) return 'linear-gradient(135deg, #064e3b, #047857, #ea580c)';
    return 'linear-gradient(135deg, #1e3a8a, #1d4ed8, #4338ca)';
  };

  const getIcon = () => {
    const plan = (card?.plan_name || '').toLowerCase();
    if (plan.includes('premium')) return <GiStrongMan style={{ color: '#facc15', fontSize: 22 }} />;
    if (plan.includes('pro')) return <GiBodyBalance style={{ color: '#facc15', fontSize: 22 }} />;
    return <FaDumbbell style={{ color: '#facc15', fontSize: 22 }} />;
  };

  const qrValue = card?.full_card_number || card?.card_number || 'POWERGYM';

  return (
    <>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.88) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cardShine {
          0%   { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(220%) skewX(-15deg); }
        }

        .mc-modal-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
          padding: 16px;
          animation: backdropIn .2s ease forwards;
        }
        .mc-modal-box {
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.35);
          padding: 32px 28px 28px;
          width: 100%; max-width: 420px;
          animation: modalIn .3s cubic-bezier(0.34,1.2,0.64,1) forwards;
          position: relative;
        }

        /* ── 3D flip container ── */
        .mc-flip-scene {
          perspective: 1000px;
          width: 100%;
          cursor: pointer;
          user-select: none;
        }
        .mc-flip-inner {
          position: relative;
          width: 100%;
          transform-style: preserve-3d;
          transition: transform 0.65s cubic-bezier(0.4, 0.2, 0.2, 1);
        }
        .mc-flip-inner.is-flipped {
          transform: rotateY(180deg);
        }

        /* front & back share the same base card styles */
        .mc-face {
          border-radius: 18px;
          overflow: hidden;
          color: white;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .mc-face-front {
          padding: 14px 20px;
          position: relative;
        }
        .mc-face-back {
          position: absolute;
          inset: 0;
          transform: rotateY(180deg);
          display: flex;
          flex-direction: column;
        }

        .mc-shine {
          position: absolute; inset: 0; pointer-events: none;
          overflow: hidden; border-radius: 18px;
        }
        .mc-shine::after {
          content: '';
          position: absolute;
          top: -50%; left: -100%;
          width: 60%; height: 200%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          animation: cardShine 3.5s ease-in-out 0.5s infinite;
        }

        .mc-chip {
          width: 44px; height: 33px;
          background: linear-gradient(135deg, #fde68a, #f59e0b);
          border-radius: 6px;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }
        .mc-chip::after {
          content: '';
          position: absolute;
          inset: 4px;
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border-radius: 3px;
        }

        /* magnetic stripe */
        .mc-mag-stripe {
          width: 100%;
          height: 38px;
          background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 50%, #1a1a1a 100%);
          margin-bottom: 14px;
          flex-shrink: 0;
        }

        /* signature strip */
        .mc-sig-strip {
          background: repeating-linear-gradient(
            -45deg,
            #f5f0e8,
            #f5f0e8 4px,
            #e8e0d0 4px,
            #e8e0d0 8px
          );
          border-radius: 4px;
          display: flex;
          align-items: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .mc-sig-text {
          flex: 1;
          padding: 6px 10px;
          font-family: 'Brush Script MT', cursive;
          font-size: 16px;
          color: #1a1a6e;
          letter-spacing: 0.04em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .mc-cvv-box {
          background: white;
          color: #000;
          font-family: monospace;
          font-size: 14px;
          font-weight: 700;
          padding: 6px 12px;
          letter-spacing: 0.15em;
          border-left: 1px solid #d4d4d4;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .mc-close-btn {
          position: absolute; top: 16px; right: 16px;
          width: 32px; height: 32px; border-radius: 50%;
          background: #f5f5f5; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #737373; font-size: 14px;
          transition: background .15s, color .15s;
        }
        .mc-close-btn:hover { background: #e5e5e5; color: #000; }

        .mc-flip-hint {
          text-align: center;
          font-size: 11px; color: #a3a3a3;
          margin-top: 10px;
          display: flex; align-items: center; justify-content: center; gap: 5px;
        }
        .mc-action-btn {
          flex: 1;
          padding: 11px;
          border-radius: 9999px;
          font-size: 13px; font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all .15s;
        }
        .mc-qr-box {
          background: rgba(255,255,255,0.13);
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 7px;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
      `}</style>

      <div className="mc-modal-backdrop" onClick={onClose}>
        <div className="mc-modal-box" onClick={e => e.stopPropagation()}>
          <button className="mc-close-btn" onClick={onClose}><FaTimes /></button>

          {/* Title */}
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#000', margin: 0, letterSpacing: '-0.02em' }}>
              Your Membership Card
            </h2>
            <p style={{ fontSize: 12, color: '#a3a3a3', marginTop: 4 }}>
              Tap the card to see the {flipped ? 'front' : 'back'}
            </p>
          </div>

          {/* ── 3D Flip Scene ── */}
          <div className="mc-flip-scene" onClick={() => setFlipped(f => !f)}>
            <div className={`mc-flip-inner ${flipped ? 'is-flipped' : ''}`}>

              {/* ── FRONT FACE ── */}
              <div className="mc-face mc-face-front" style={{ background: getGradient() }}>
                <div className="mc-shine" />

                {/* Background grid pattern */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07 }} viewBox="0 0 400 230" preserveAspectRatio="none">
                  <path d="M0 0 L400 230 M400 0 L0 230" stroke="white" strokeWidth="0.8" />
                  <path d="M0 46 L400 276 M0 92 L400 322 M0 138 L400 368 M0 184 L400 414" stroke="white" strokeWidth="0.4" />
                  <circle cx="320" cy="40" r="80" stroke="white" strokeWidth="0.5" fill="none" />
                  <circle cx="320" cy="40" r="55" stroke="white" strokeWidth="0.5" fill="none" />
                </svg>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img
                      src="https://res.cloudinary.com/dm6mcyuvu/image/upload/v1771598823/Logo_r5gks2.png"
                      alt="PowerGym"
                      style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', objectFit: 'cover' }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    <div>
                      <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.04em', display: 'block', lineHeight: 1 }}>PowerGym</span>
                      <span style={{ fontSize: 10, opacity: 0.65, letterSpacing: '0.08em' }}>{card?.plan_name?.toUpperCase() || 'MEMBER'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {getIcon()}
                  </div>
                </div>

                {/* Chip + QR row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="mc-chip" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: 0.6 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.7)' }} />
                      </div>
                      <span style={{ fontSize: 9, letterSpacing: '0.1em' }}>CONTACTLESS</span>
                    </div>
                  </div>
                  <div className="mc-qr-box" title="Scan to verify card">
                    <QRCode value={qrValue} size={48} bgColor="transparent" fgColor="rgba(255,255,255,0.92)" level="M" style={{ display: 'block' }} />
                  </div>
                </div>

                {/* Card Number */}
                <div style={{ marginBottom: 8, position: 'relative' }}>
                  <p style={{ fontSize: 9, opacity: 0.6, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Card Number</p>
                  <p style={{ fontFamily: 'monospace', fontSize: 20, letterSpacing: '0.2em', fontWeight: 600 }}>
                    {card?.card_number || '•••• •••• •••• ••••'}
                  </p>
                </div>

                {/* Bottom row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative' }}>
                  <div>
                    <p style={{ fontSize: 9, opacity: 0.6, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Card Holder</p>
                    <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em' }}>{card?.card_holder_name || 'MEMBER NAME'}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 9, opacity: 0.6, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Valid Thru</p>
                    <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em' }}>{formatExpiry(card?.expiry_date)}</p>
                  </div>
                </div>
              </div>

              {/* ── BACK FACE ── */}
              <div className="mc-face mc-face-back" style={{ background: getGradient() }}>
                <div className="mc-shine" />

                {/* Background grid (mirrored) */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07 }} viewBox="0 0 400 230" preserveAspectRatio="none">
                  <path d="M0 0 L400 230 M400 0 L0 230" stroke="white" strokeWidth="0.8" />
                  <circle cx="80" cy="40" r="80" stroke="white" strokeWidth="0.5" fill="none" />
                  <circle cx="80" cy="40" r="55" stroke="white" strokeWidth="0.5" fill="none" />
                </svg>

                {/* Magnetic stripe — full width, top of back */}
                <div className="mc-mag-stripe" style={{ marginTop: 20 }} />

                {/* Content area */}
                <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1, position: 'relative' }}>

                  {/* Signature + CVV strip */}
                  <div>
                    <p style={{ fontSize: 9, opacity: 0.6, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>Authorized Signature</p>
                    <div className="mc-sig-strip">
                      <div className="mc-sig-text">{card?.card_holder_name || 'MEMBER NAME'}</div>
                      <div className="mc-cvv-box">
                        <span style={{ fontSize: 9, display: 'block', color: '#737373', fontFamily: 'sans-serif', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 1 }}>CVV</span>
                        {card?.cvv || '•••'}
                      </div>
                    </div>
                  </div>

                  {/* Full card number */}
                  <div>
                    <p style={{ fontSize: 9, opacity: 0.6, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Full Card Number</p>
                    <p style={{ fontFamily: 'monospace', fontSize: 14, letterSpacing: '0.15em', fontWeight: 600 }}>
                      {formatCardNumber(card?.full_card_number || card?.card_number)}
                    </p>

                  </div>

                  {/* Property notice */}
                  <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 8 }}>
                    <p style={{ fontSize: 9, opacity: 0.55, lineHeight: 1.5, letterSpacing: '0.02em' }}>
                      This card is the property of <strong style={{ opacity: 1 }}>PowerGym</strong>. If found, please return to any PowerGym branch. Unauthorized use is prohibited. For support: support@powergym.com
                    </p>
                  </div>
                </div>
              </div>

            </div>{/* end mc-flip-inner */}
          </div>{/* end mc-flip-scene */}

          <p className="mc-flip-hint">
            <FaRegClock style={{ fontSize: 10 }} />
            {card?.is_active ? <span style={{ color: '#22c55e', fontWeight: 700 }}>● Active</span> : <span style={{ color: '#ef4444' }}>● Inactive</span>}
            &nbsp;·&nbsp;
            {card?.card_brand === 'mastercard' ? 'Mastercard' : card?.card_brand || ''}
            &nbsp;·&nbsp;{card?.card_type || ''}
          </p>

          {/* Security note */}
          <div style={{ marginTop: 16, padding: '10px 14px', background: '#f5f5f5', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaShieldAlt style={{ color: '#22c55e', fontSize: 14, flexShrink: 0 }} />
            <p style={{ fontSize: 11, color: '#737373', margin: 0 }}>
              This virtual card is secured and can be used for gym access. Keep your card number safe.
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="mc-action-btn" style={{ background: '#f97316', color: '#fff', boxShadow: '0 4px 14px rgba(249,115,22,0.3)' }} onClick={onClose}>
              Done
            </button>
            <button className="mc-action-btn" style={{ background: '#f5f5f5', color: '#404040' }} onClick={() => window.print()}>
              Download
            </button>
          </div>
        </div>
      </div>
    </>
  );
};


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
          padding: 14px 18px;
          border-radius: 9999px;
          font-size: 14px; font-weight: 600;
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
                  <div className="ps-a5" style={{ marginTop: 20 }}>
                    <button className="ps-card-trigger" onClick={() => setShowCardModal(true)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FaCreditCard style={{ fontSize: 16 }} />
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>View Membership Card</div>
                          <div style={{ fontSize: 10, opacity: 0.75, fontWeight: 400 }}>{card.card_number} · {card.card_type}</div>
                        </div>
                      </div>
                      <FaArrowRight style={{ fontSize: 12, opacity: 0.8 }} />
                    </button>
                  </div>
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