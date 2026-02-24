import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTimesCircle, FaRedo, FaHeadset } from 'react-icons/fa';

const PaymentFailed = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 80);
  }, []);

  const reasons = [
    'Insufficient funds in account',
    'Card declined by your bank',
    'Network timeout during processing',
    'Invalid or expired card details',
  ];

  return (
    <div className="pf-container">
      <div className={`pf-wrapper ${animate ? 'pf-animate' : ''}`}>
        <div className="pf-card">
          <div className="pf-accent-bar" />

          <div className="pf-content">
            {/* ─── LEFT PANEL ──────────────────────────────────────────────── */}
            <div className="pf-left-panel">
              {/* X icon — error semantic color */}
              <div className="pf-a0">
                <div className="pf-icon-wrapper">
                  <div className="pf-icon-inner">
                    <svg className="pf-circle" viewBox="0 0 56 56" fill="none">
                      <circle cx="28" cy="28" r="26" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                    <FaTimesCircle className="pf-x-icon" />
                  </div>
                </div>
              </div>

              {/* Heading */}
              <h1 className="pf-a1 pf-heading">
                <span className="pf-heading-shimmer">Payment</span>{' '}
                <span style={{ color: '#000000' }}>Failed</span>
              </h1>

              <p className="pf-a2 pf-subheading">
                We couldn't process your payment. Please try again or contact support.
              </p>

              {/* Warning note */}
              <div className="pf-a3 pf-warning">
                <span style={{ fontSize: 14, marginTop: 1 }}>⚠️</span>
                <span className="pf-warning-text">
                  No charges were made to your account. Your payment information is safe.
                </span>
              </div>

              {/* Status dot */}
              <div className="pf-status-dot">
                <div className="pf-status-dot-circle" />
                <span className="pf-status-text">
                  Transaction failed · <strong className="pf-status-brand">PowerGym</strong>
                </span>
              </div>
            </div>

            {/* ─── RIGHT PANEL ─────────────────────────────────────────────── */}
            <div className="pf-right-panel">
              {/* Reasons list */}
              <div className="pf-a2">
                <div className="pf-reasons">
                  <div className="pf-reasons-label" />
                  <h3 className="pf-reasons-title">
                    Possible Reasons
                  </h3>
                </div>
                <div className="pf-reasons-list">
                  {reasons.map((reason, i) => (
                    <div key={i} className="pf-reason-row">
                      <span className="pf-reason-dash">—</span>
                      <span className="pf-reason-text">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pf-a4 pf-actions">
                <Link to="/membership" className="pf-btn-primary">
                  <FaRedo style={{ fontSize: 13 }} /> Try Again
                </Link>

                <div className="pf-divider-row">
                  <div className="pf-divider" />
                  <span className="pf-divider-text">or</span>
                  <div className="pf-divider" />
                </div>

                <Link to="/contact" className="pf-btn-ghost">
                  <FaHeadset style={{ fontSize: 14 }} /> Contact Support
                </Link>
              </div>
            </div>{/* end right panel */}
          </div>{/* end flex row */}
        </div>{/* end card */}

        <p className="pf-footer">
          Need help? Our support team is available 24/7.
        </p>
      </div>
    </div>
  );
};

export default PaymentFailed;