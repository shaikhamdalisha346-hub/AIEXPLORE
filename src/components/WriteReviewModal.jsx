import React, { useState } from 'react';
import { X, Star, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function WriteReviewModal({ 
  tool, 
  isOpen, 
  onClose, 
  onReviewSubmitted,
  isDemo = false 
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [useCase, setUseCase] = useState('College');
  const [usageFrequency, setUsageFrequency] = useState('Occasionally');
  const [planType, setPlanType] = useState('Free');
  const [displayName, setDisplayName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hasConfirmedUsage, setHasConfirmedUsage] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !tool) return null;

  const useCaseOptions = [
    'College',
    'Work',
    'Coding',
    'Research',
    'Presentation',
    'Video',
    'Image generation',
    'Writing',
    'Personal use',
    'Other'
  ];

  const frequencyOptions = [
    'First time',
    'Occasionally',
    'Weekly',
    'Frequently',
    'Daily'
  ];

  const planOptions = [
    'Free',
    'Paid',
    'Trial',
    'Unknown'
  ];

  const ratingLabels = {
    1: '1 - Poor experience',
    2: '2 - Fair, significant limitations',
    3: '3 - Good, met basic expectations',
    4: '4 - Very good, highly capable',
    5: '5 - Excellent, exceeded expectations'
  };

  const getUserId = () => {
    let uid = localStorage.getItem('ai_finder_uid');
    if (!uid) {
      uid = 'usr_' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('ai_finder_uid', uid);
    }
    return uid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!rating) {
      setError('Please select a star rating between 1 and 5.');
      return;
    }
    if (!reviewTitle.trim() || reviewTitle.trim().length < 3) {
      setError('Please provide a review title (at least 3 characters).');
      return;
    }
    if (!reviewText.trim() || reviewText.trim().length < 10) {
      setError('Please describe your genuine experience (at least 10 characters).');
      return;
    }
    if (!hasConfirmedUsage) {
      setError('Please confirm that you have personally used this AI tool.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/tools/${tool.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          reviewTitle: reviewTitle.trim(),
          reviewText: reviewText.trim(),
          useCase,
          usageFrequency,
          planType,
          displayName: displayName.trim() || 'Anonymous User',
          isAnonymous,
          userId: getUserId(),
          demo: Boolean(isDemo)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSubmitted(true);
      if (onReviewSubmitted) {
        onReviewSubmitted(data.review, data.stats);
      }

      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1600);
    } catch (err) {
      setError(err.message || 'An error occurred while submitting your review.');
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
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1200,
      padding: '20px'
    }}>
      <div 
        className="glass-panel animate-fade-in" 
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '32px',
          position: 'relative',
          background: 'var(--bg-surface)',
          border: '1px solid rgba(13, 246, 158, 0.35)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '99px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <X size={16} />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(13, 246, 158, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: '#0df69e'
            }}>
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>
              Thank You for Your Review!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Your real user experience has been published and will help students and researchers find the right AI tool.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
              <span className="badge badge-green" style={{ marginBottom: '8px', fontSize: '0.75rem' }}>
                COMMUNITY REVIEW
              </span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '4px 0 6px' }}>
                Review {tool.name}
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Share your actual hands-on experience. Your feedback directly shapes community ratings.
              </p>
            </div>

            {/* Mandatory Genuine Experience Notice (Section 4) */}
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              marginBottom: '22px',
              fontSize: '0.84rem',
              color: '#93c5fd',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Authentic Review Policy:</strong> Please share your genuine experience using this AI tool. Do not post information that you have not personally experienced.
              </div>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '0.85rem',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* 1. Star Rating */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-dim)', marginBottom: '8px' }}>
                HOW WOULD YOU RATE {tool.name.toUpperCase()}? *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: (hoverRating || rating) >= star ? '#fbbf24' : 'rgba(255, 255, 255, 0.2)',
                      transition: 'transform 0.15s ease, color 0.15s ease',
                      transform: (hoverRating || rating) >= star ? 'scale(1.15)' : 'scale(1)'
                    }}
                  >
                    <Star size={30} fill={(hoverRating || rating) >= star ? '#fbbf24' : 'transparent'} />
                  </button>
                ))}
                <span style={{ marginLeft: '12px', fontSize: '0.88rem', color: '#fbbf24', fontWeight: '600' }}>
                  {ratingLabels[hoverRating || rating]}
                </span>
              </div>
            </div>

            {/* 2. Review Title */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-dim)', marginBottom: '6px' }}>
                REVIEW TITLE *
              </label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="e.g. Very useful for college presentations"
                maxLength={100}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.92rem'
                }}
              />
            </div>

            {/* 3. Detailed Experience */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-dim)', marginBottom: '6px' }}>
                YOUR ACTUAL EXPERIENCE *
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Tell other users about your actual experience with this AI tool. What worked well? What could be improved? Did it meet your needs?"
                rows={4}
                maxLength={2000}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  lineHeight: 1.5,
                  resize: 'vertical'
                }}
              />
            </div>

            {/* 4. Use Case & Frequency Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-dim)', marginBottom: '6px' }}>
                  WHAT DID YOU USE IT FOR?
                </label>
                <select
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: '#0d131f',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.88rem'
                  }}
                >
                  {useCaseOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-dim)', marginBottom: '6px' }}>
                  USAGE FREQUENCY
                </label>
                <select
                  value={usageFrequency}
                  onChange={(e) => setUsageFrequency(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: '#0d131f',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.88rem'
                  }}
                >
                  {frequencyOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 5. Plan Used */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-dim)', marginBottom: '6px' }}>
                PLAN USED
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {planOptions.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlanType(p)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      border: planType === p ? '1px solid #0df69e' : '1px solid var(--border-subtle)',
                      background: planType === p ? 'rgba(13, 246, 158, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      color: planType === p ? '#0df69e' : 'var(--text-muted)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Display Name & Anonymous Toggle (Section 6: No Sensitive Info) */}
            <div style={{
              padding: '14px 16px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isAnonymous ? 0 : '10px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
                  Reviewer Identity
                </span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    style={{ accentColor: '#0df69e' }}
                  />
                  <span>Post as Anonymous User</span>
                </label>
              </div>

              {!isAnonymous && (
                <div>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Display Name (e.g. Rahul S. or Computer Science Student)"
                    maxLength={50}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.88rem'
                    }}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Never displays email addresses or personal contact information.
                  </div>
                </div>
              )}
            </div>

            {/* 7. Confirmation Checkbox */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                <input
                  type="checkbox"
                  checked={hasConfirmedUsage}
                  onChange={(e) => setHasConfirmedUsage(e.target.checked)}
                  style={{ marginTop: '3px', accentColor: '#0df69e' }}
                />
                <span>
                  I confirm that I have personally used <strong>{tool.name}</strong> and this review reflects my own genuine experience.
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  padding: '10px 24px',
                  fontSize: '0.92rem',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
