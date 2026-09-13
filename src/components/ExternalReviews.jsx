import React, { useState, useEffect } from 'react';
import { ExternalLink, Star, ShieldCheck, AlertCircle, Info, Sparkles, Newspaper } from 'lucide-react';

export default function ExternalReviews({ tool }) {
  const [data, setData] = useState({ sources: [], count: 0, hasExternalReviews: false });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tool?.id) return;
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/tools/${tool.id}/external-reviews`).then(r => r.ok ? r.json() : null),
      fetch(`/api/tools/${tool.id}/external-reviews/summary`).then(r => r.ok ? r.json() : null)
    ])
      .then(([reviewsData, summaryData]) => {
        if (!isMounted) return;
        if (reviewsData) setData(reviewsData);
        if (summaryData) setSummary(summaryData);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Error fetching external reviews:', err);
        setError('External review information is temporarily unavailable.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [tool?.id]);

  const sources = data?.sources || [];

  return (
    <div style={{ marginTop: '36px', borderTop: '1px solid var(--border-subtle)', paddingTop: '32px' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.3rem' }}>📰</span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
              External User Reviews & Ratings
            </h3>
            <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-dim)', border: '1px solid var(--border-subtle)' }}>
              Third-Party Verified
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '4px', margin: 0 }}>
            Reviews and ratings about this AI tool from independent third-party platforms.
          </p>
        </div>
      </div>

      {/* Trust Notice */}
      <div style={{
        padding: '10px 14px',
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-subtle)',
        fontSize: '0.8rem',
        color: 'var(--text-dim)',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Info size={15} style={{ flexShrink: 0 }} />
        <span>
          External ratings remain source-specific and are never artificially combined. We link directly to verified third-party review pages.
        </span>
      </div>

      {/* Loading State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Loading third-party review data...
        </div>
      ) : error ? (
        /* Error State (Graceful fallback) */
        <div style={{
          padding: '16px',
          borderRadius: '8px',
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#f87171',
          fontSize: '0.85rem'
        }}>
          {error}
        </div>
      ) : sources.length === 0 ? (
        /* Empty State (Section 23: No Fake Data) */
        <div style={{
          textAlign: 'center',
          padding: '36px 20px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.01)',
          border: '1px dashed var(--border-subtle)'
        }}>
          <Newspaper size={32} color="var(--text-dim)" style={{ margin: '0 auto 10px', opacity: 0.6 }} />
          <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '4px', color: 'var(--text-main)' }}>
            No external review data available yet.
          </h4>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.84rem', maxWidth: '460px', margin: '0 auto' }}>
            We only display review information from identifiable and permitted external sources. External coverage for {tool.name} will appear here once verified.
          </p>
        </div>
      ) : (
        <div>
          {/* External Review Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            marginBottom: summary?.commonThemes ? '24px' : '0'
          }}>
            {sources.map((src) => (
              <div
                key={src.id}
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <div>
                  {/* Source Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontWeight: '800', fontSize: '1.05rem', color: '#0df69e' }}>
                        {src.sourceName}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        {src.sourceType === 'mobile_app_store' ? 'Mobile App Store' : 
                         src.sourceType === 'business_software_reviews' ? 'Business Software Platform' :
                         src.sourceType === 'consumer_reviews' ? 'Consumer Review Platform' : 
                         'Product Community'}
                      </div>
                    </div>

                    {src.rating !== null ? (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#fbbf24', fontWeight: '800', fontSize: '1.1rem' }}>
                          <Star size={16} fill="#fbbf24" />
                          <span>{src.rating}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '500' }}>/{src.ratingScale || 5}</span>
                        </div>
                        {src.reviewCount !== null && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {src.reviewCount.toLocaleString()}+ ratings
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-muted)',
                        fontWeight: '600'
                      }}>
                        Verified Review Page
                      </span>
                    )}
                  </div>

                  {/* Note / Explanation when ratings are on direct platform */}
                  {src.note && !src.reviewExcerpt && (
                    <div style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-dim)',
                      lineHeight: 1.4,
                      marginBottom: '12px',
                      background: 'rgba(255, 255, 255, 0.015)',
                      padding: '8px 10px',
                      borderRadius: '6px'
                    }}>
                      {src.note}
                    </div>
                  )}

                  {/* Permitted Excerpt / Title (Only short permitted excerpts) */}
                  {src.reviewExcerpt && (
                    <div style={{
                      padding: '10px 12px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderLeft: '3px solid #0df69e',
                      fontSize: '0.84rem',
                      color: 'var(--text-main)',
                      lineHeight: 1.45,
                      marginBottom: '14px',
                      fontStyle: 'italic'
                    }}>
                      &ldquo;{src.reviewExcerpt}&rdquo;
                    </div>
                  )}

                  {src.reviewTitle && !src.reviewExcerpt && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '600', marginBottom: '12px' }}>
                      {src.reviewTitle}
                    </div>
                  )}
                </div>

                {/* Card Footer: Verified Date & Source Link */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.76rem',
                  color: 'var(--text-dim)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  paddingTop: '12px',
                  marginTop: '6px'
                }}>
                  <span>
                    {src.verificationMethod || (src.lastVerified ? `Verified: ${src.lastVerified}` : 'Verified source')}
                  </span>

                  {src.sourceUrl && (
                    <a
                      href={src.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#0df69e',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '0.78rem'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      <span>View on {src.sourceName}</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Summarized External Feedback (Section 11: Only when multiple verified excerpts exist) */}
          {summary?.commonThemes && (
            <div style={{
              padding: '18px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(59, 130, 246, 0.04)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              marginTop: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Sparkles size={16} color="#60a5fa" />
                <span style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  What external users commonly mention
                </span>
              </div>

              <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: 1.5, margin: '0 0 10px' }}>
                {summary.commonThemes.summaryText}
              </p>

              <div style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: '600' }}>
                {summary.commonThemes.attribution}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
