import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ReportReviewModal({
  review,
  isOpen,
  onClose,
  onReportSubmitted,
  isDemo = false
}) {
  const [reason, setReason] = useState('Spam');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !review) return null;

  const reasons = [
    'Spam',
    'Fake experience',
    'Offensive content',
    'Advertising',
    'Personal information',
    'Irrelevant',
    'Other'
  ];

  const getUserId = () => {
    let uid = localStorage.getItem('ai_finder_uid');
    if (!uid) {
      uid = 'usr_' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('ai_finder_uid', uid);
    }
    return uid;
  };

  const handleReport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/reviews/${review.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason,
          details: details.trim(),
          userId: getUserId(),
          demo: Boolean(isDemo)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit report');
      }

      setSubmitted(true);
      if (onReportSubmitted) {
        onReportSubmitted(review.id);
      }

      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'An error occurred while reporting review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(3, 6, 12, 0.88)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1300,
      padding: '20px'
    }}>
      <div 
        className="glass-panel animate-fade-in" 
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '28px',
          position: 'relative',
          background: 'var(--bg-surface)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={16} />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#10b981'
            }}>
              <CheckCircle2 size={30} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '6px' }}>
              Report Submitted
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Thank you for keeping our community trustworthy. Our moderators have received this report.
            </p>
          </div>
        ) : (
          <form onSubmit={handleReport}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', marginBottom: '8px' }}>
              <AlertTriangle size={18} />
              <span style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase' }}>
                Report Community Review
              </span>
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '14px' }}>
              Why are you reporting this review?
            </h3>

            {error && (
              <div style={{
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '0.82rem',
                marginBottom: '14px'
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {reasons.map((r) => (
                <label 
                  key={r} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: reason === r ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    border: reason === r ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    style={{ accentColor: '#ef4444' }}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-dim)', marginBottom: '6px' }}>
                ADDITIONAL DETAILS (OPTIONAL)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide context for our moderation team..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  resize: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  background: '#ef4444',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
