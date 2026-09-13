import React, { useState, useEffect } from 'react';
import { 
  Star, ThumbsUp, Flag, CheckCircle2, AlertCircle, 
  MessageSquare, Sparkles, Filter, ArrowUpDown, ShieldCheck, ExternalLink, HelpCircle 
} from 'lucide-react';
import WriteReviewModal from './WriteReviewModal';
import ReportReviewModal from './ReportReviewModal';

export default function CommunityReviews({ tool, onReviewUpdated }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('recent');
  const [filter, setFilter] = useState('all');
  const [isDemo, setIsDemo] = useState(false);

  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingReview, setReportingReview] = useState(null);

  const [likedReviews, setLikedReviews] = useState(new Set());

  const getUserId = () => {
    let uid = localStorage.getItem('ai_finder_uid');
    if (!uid) {
      uid = 'usr_' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('ai_finder_uid', uid);
    }
    return uid;
  };

  const fetchReviews = async () => {
    if (!tool) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tools/${tool.id}/reviews?sort=${sort}&filter=${filter}&demo=${isDemo}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setStats(data.stats || null);

      // Populate liked state from helpfulUserIds
      const uid = getUserId();
      const liked = new Set();
      (data.reviews || []).forEach(r => {
        if (Array.isArray(r.helpfulUserIds) && r.helpfulUserIds.includes(uid)) {
          liked.add(r.id);
        }
      });
      setLikedReviews(liked);
    } catch (err) {
      console.error('Error fetching community reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [tool?.id, sort, filter, isDemo]);

  const handleHelpful = async (reviewId) => {
    const uid = getUserId();
    const currentlyLiked = likedReviews.has(reviewId);

    // Optimistic UI update
    setLikedReviews(prev => {
      const next = new Set(prev);
      if (currentlyLiked) next.delete(reviewId);
      else next.add(reviewId);
      return next;
    });

    setReviews(prev => prev.map(r => {
      if (r.id === reviewId) {
        return {
          ...r,
          helpfulCount: currentlyLiked ? Math.max(0, (r.helpfulCount || 1) - 1) : (r.helpfulCount || 0) + 1
        };
      }
      return r;
    }));

    try {
      const res = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, demo: isDemo })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
    } catch (err) {
      console.error('Error updating helpful vote:', err);
      // Revert on failure
      fetchReviews();
    }
  };

  const handleOpenReport = (review) => {
    setReportingReview(review);
    setReportModalOpen(true);
  };

  const handleReviewSubmitted = (newReview, newStats) => {
    fetchReviews();
    if (onReviewUpdated) {
      onReviewUpdated(newStats);
    }
  };

  const formatRelativeTime = (isoString) => {
    if (!isoString) return 'recently';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const totalReviews = stats?.totalRatings || 0;
  const avgRating = stats?.averageRating;

  return (
    <div style={{ marginTop: '36px', borderTop: '1px solid var(--border-subtle)', paddingTop: '32px' }}>
      {/* Community Reviews Section Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>⭐</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
              Community Reviews
            </h2>
            <span className="badge badge-green" style={{ fontSize: '0.72rem', fontWeight: '700' }}>
              REAL USER FEEDBACK
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '4px', margin: 0 }}>
            Experiences submitted directly by actual users of {tool.name}. Never generated by AI.
          </p>
        </div>

        {/* Demo Mode Toggle (Expo Section 33) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setIsDemo(!isDemo)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.76rem',
              fontWeight: '600',
              cursor: 'pointer',
              border: isDemo ? '1px solid #f59e0b' : '1px solid var(--border-subtle)',
              background: isDemo ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              color: isDemo ? '#f59e0b' : 'var(--text-dim)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={13} />
            <span>{isDemo ? 'Exit Demo Mode' : 'Expo Demo Reviews'}</span>
          </button>

          <button
            className="btn-primary"
            onClick={() => setWriteModalOpen(true)}
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            ⭐ Write a Review
          </button>
        </div>
      </div>

      {/* Demo Mode Warning Banner (Section 33: Never mix demo with production) */}
      {isDemo && (
        <div style={{
          padding: '10px 16px',
          borderRadius: '8px',
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          color: '#f59e0b',
          fontSize: '0.82rem',
          fontWeight: '700',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <span>DEMO DATA — NOT REAL USER REVIEWS (Science Expo Demonstration Sandbox)</span>
        </div>
      )}

      {/* Community Rating Overview Card */}
      <div style={{
        padding: '24px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-subtle)',
        marginBottom: '28px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        alignItems: 'center'
      }}>
        {/* Big Star Display */}
        <div style={{ textAlign: 'center', borderRight: '1px solid var(--border-subtle)', paddingRight: '20px' }}>
          {totalReviews > 0 && avgRating !== null ? (
            <>
              <div style={{ fontSize: '3.2rem', fontWeight: '900', color: '#fbbf24', lineHeight: 1 }}>
                {avgRating}
                <span style={{ fontSize: '1.4rem', color: 'var(--text-dim)', fontWeight: '500' }}>/5</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', margin: '8px 0' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star 
                    key={s} 
                    size={20} 
                    fill={s <= Math.round(avgRating) ? '#fbbf24' : 'transparent'} 
                    color={s <= Math.round(avgRating) ? '#fbbf24' : 'rgba(255, 255, 255, 0.2)'} 
                  />
                ))}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Based on <strong>{totalReviews}</strong> {totalReviews === 1 ? 'user rating' : 'user ratings'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>
                {stats?.positivePercentage || 0}% positive community rating
              </div>
            </>
          ) : (
            <div style={{ padding: '10px 0' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-muted)' }}>
                Not rated yet
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                0 community reviews
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent-green)', marginTop: '6px' }}>
                Be the first to rate {tool.name}!
              </div>
            </div>
          )}
        </div>

        {/* Rating Distribution Bar Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats?.ratingDistribution?.[star] || 0;
            const pct = stats?.ratingPercentages?.[star] || 0;
            return (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '40px' }}>
                  <span>{star}</span>
                  <Star size={12} fill="#fbbf24" color="#fbbf24" />
                </div>
                <div style={{
                  flex: 1,
                  height: '8px',
                  borderRadius: '99px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: star >= 4 ? '#10b981' : star === 3 ? '#f59e0b' : '#ef4444',
                    borderRadius: '99px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <span style={{ width: '45px', textAlign: 'right', color: 'var(--text-dim)' }}>
                  {pct}% ({count})
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* "What Users Are Saying" AI Summary (Section 17: ONLY shown if >= 3 reviews exist!) */}
      {stats?.whatUsersAreSaying ? (
        <div style={{
          padding: '18px 22px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(13, 246, 158, 0.04)',
          border: '1px solid rgba(13, 246, 158, 0.25)',
          marginBottom: '26px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={16} color="#0df69e" />
            <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)' }}>
              What users are saying
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5, margin: '0 0 8px' }}>
            {stats.whatUsersAreSaying.summaryText}
          </p>
          <div style={{ fontSize: '0.76rem', color: 'var(--accent-green)', fontWeight: '600' }}>
            {stats.whatUsersAreSaying.attribution}
          </div>
        </div>
      ) : totalReviews > 0 && totalReviews < 3 ? (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.82rem',
          color: 'var(--text-dim)',
          marginBottom: '26px'
        }}>
          <em>Not enough community reviews to identify common themes yet ({totalReviews}/3 required).</em>
        </div>
      ) : null}

      {/* Filter & Sort Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px',
        padding: '10px 14px',
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Filter Chips */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginRight: '4px' }}>Filter:</span>
          {[
            { id: 'all', label: 'All' },
            { id: 'positive', label: 'Positive (4-5★)' },
            { id: 'critical', label: 'Critical (1-2★)' },
            { id: 'free', label: 'Free Plan' },
            { id: 'paid', label: 'Paid Plan' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                cursor: 'pointer',
                border: filter === f.id ? '1px solid #0df69e' : '1px solid var(--border-subtle)',
                background: filter === f.id ? 'rgba(13, 246, 158, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: filter === f.id ? '#0df69e' : 'var(--text-muted)'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Sort by:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              background: '#0d131f',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Review List or Empty State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Loading community reviews...
        </div>
      ) : reviews.length === 0 ? (
        /* Empty State (Section 2 & 32: Zero fake reviews) */
        <div style={{
          textAlign: 'center',
          padding: '48px 20px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.01)',
          border: '1px dashed var(--border-subtle)'
        }}>
          <MessageSquare size={36} color="var(--text-dim)" style={{ margin: '0 auto 12px', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '6px' }}>
            No community reviews yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 20px' }}>
            Be the first to share your experience with {tool.name}. Your genuine review helps students and creators discover the right tool.
          </p>
          <button
            className="btn-primary"
            onClick={() => setWriteModalOpen(true)}
            style={{ padding: '8px 20px', fontSize: '0.88rem' }}
          >
            ⭐ Write the First Review
          </button>
        </div>
      ) : (
        /* Render Genuine User Reviews */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.map((rev) => {
            const hasLiked = likedReviews.has(rev.id);
            return (
              <div 
                key={rev.id}
                style={{
                  padding: '18px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  transition: 'border-color 0.2s ease'
                }}
              >
                {/* Review Card Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                  <div>
                    {/* Stars */}
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={15}
                          fill={s <= rev.rating ? '#fbbf24' : 'transparent'}
                          color={s <= rev.rating ? '#fbbf24' : 'rgba(255, 255, 255, 0.2)'}
                        />
                      ))}
                    </div>
                    {/* Review Title */}
                    <h4 style={{ fontSize: '1.02rem', fontWeight: '700', margin: '2px 0 0', color: 'var(--text-main)' }}>
                      {rev.reviewTitle}
                    </h4>
                  </div>

                  {/* Relative Date */}
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', flexShrink: 0 }}>
                    {formatRelativeTime(rev.createdAt)}
                  </span>
                </div>

                {/* Review Text */}
                <p style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-main)',
                  lineHeight: 1.55,
                  margin: '8px 0 14px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {rev.reviewText}
                </p>

                {/* Metadata Badges & Author */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                  fontSize: '0.8rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  paddingTop: '12px'
                }}>
                  {/* Author & Verification Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                      &mdash; {rev.isAnonymous ? 'Anonymous User' : rev.displayName}
                    </span>

                    {/* Verification Badge (Section 8 & 9: Transparent badges) */}
                    {rev.verifiedUsage ? (
                      <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                        <CheckCircle2 size={11} style={{ marginRight: '3px' }} />
                        Verified Usage
                      </span>
                    ) : (
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text-dim)',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        Community Review &bull; Unverified
                      </span>
                    )}

                    {rev.useCase && (
                      <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                        {rev.useCase}
                      </span>
                    )}

                    {rev.planType && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        ({rev.planType} Plan)
                      </span>
                    )}
                  </div>

                  {/* Actions: Helpful & Report */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => handleHelpful(rev.id)}
                      style={{
                        background: hasLiked ? 'rgba(13, 246, 158, 0.15)' : 'none',
                        border: hasLiked ? '1px solid #0df69e' : '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        cursor: 'pointer',
                        color: hasLiked ? '#0df69e' : 'var(--text-muted)',
                        fontSize: '0.78rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <ThumbsUp size={13} fill={hasLiked ? '#0df69e' : 'transparent'} />
                      <span>Helpful {rev.helpfulCount > 0 ? `(${rev.helpfulCount})` : ''}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenReport(rev)}
                      title="Report this review"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-dim)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '0.76rem'
                      }}
                    >
                      <Flag size={12} />
                      <span>Report</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Write Review Modal */}
      <WriteReviewModal
        tool={tool}
        isOpen={writeModalOpen}
        onClose={() => setWriteModalOpen(false)}
        onReviewSubmitted={handleReviewSubmitted}
        isDemo={isDemo}
      />

      {/* Report Review Modal */}
      <ReportReviewModal
        review={reportingReview}
        isOpen={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setReportingReview(null);
        }}
        onReportSubmitted={() => {
          fetchReviews();
        }}
        isDemo={isDemo}
      />
    </div>
  );
}
