import React, { useState } from 'react';
import { FaRegClock, FaTimes, FaShieldAlt } from 'react-icons/fa';
import { GiBodyBalance, GiStrongMan } from 'react-icons/gi';
import QRCode from 'react-qr-code';

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
    return null;
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

export default MembershipCardModal;
