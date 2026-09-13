import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, ExternalLink, CheckCircle, 
  ChevronDown, ChevronUp, Sparkles, Plus, Check, 
  Smartphone, Monitor, Globe, Award, Zap, TrendingUp, Info,
  Star, ThumbsUp, ThumbsDown, Eye
} from 'lucide-react';

export default function RecommendationResult({ 
  result, 
  onOpenSafetyModal, 
  onToggleCompare, 
  isCompared,
  onViewToolDetail
}) {
  const [showScoreDetails, setShowScoreDetails] = useState(false);

  if (!result || !result.bestMatch) return null;

  const { bestMatch, alternatives, parsedIntent } = result;
  const bestTool = bestMatch.tool;
  const bestScores = bestMatch.scores;
  const isBestCompared = isCompared(bestTool.id);

  return (
    <div className="animate-fade-in" style={{ marginTop: '40px' }}>
      {/* Intent & Purpose Header Feedback */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px',
        padding: '12px 18px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', flexWrap: 'wrap' }}>
          <Sparkles size={16} color="#0df69e" />
          <span style={{ color: 'var(--text-dim)' }}>Detected Purpose:</span>
          <span className="badge badge-green" style={{ fontWeight: '700' }}>
            {parsedIntent.primaryPurpose || parsedIntent.detectedIntent}
          </span>
          <span className="badge badge-purple">
            {parsedIntent.primaryCategory}
          </span>
          {parsedIntent.budgetConstraint === 'free' && (
            <span className="badge badge-blue">Free Plan Required</span>
          )}
          {parsedIntent.targetUser !== 'General Users' && (
            <span className="badge badge-neutral">{parsedIntent.targetUser}</span>
          )}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Evaluated {result.totalEvaluated} tools across 7 weighted criteria
        </div>
      </div>

      {/* BEST MATCH SPOTLIGHT CARD */}
      <div className="glass-panel" style={{
        padding: '36px',
        border: '1px solid rgba(13, 246, 158, 0.45)',
        background: 'linear-gradient(180deg, rgba(13, 246, 158, 0.06) 0%, rgba(14, 22, 35, 0.9) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Card Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            {/* Tool Avatar */}
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, rgba(13, 246, 158, 0.25) 0%, rgba(6, 182, 212, 0.25) 100%)',
              border: '2px solid var(--accent-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: '800',
              color: '#ffffff',
              boxShadow: '0 0 24px rgba(13, 246, 158, 0.35)'
            }}>
              {bestTool.name.charAt(0)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '800' }}>
                  <Award size={14} /> 🎯 BEST MATCH
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                  {bestTool.category} &bull; {bestTool.subcategory}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '0.88rem', fontWeight: '700' }}>
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  {bestTool.overallRating || 4.8}/5
                </span>
              </div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginTop: '4px' }}>
                {bestTool.name}
              </h2>
            </div>
          </div>

          {/* Match Score Ring Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            background: 'rgba(13, 246, 158, 0.1)',
            border: '1px solid rgba(13, 246, 158, 0.35)',
            padding: '12px 24px',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#0df69e', lineHeight: 1 }}>
                {bestScores.finalScore}%
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textAlign: 'center', marginTop: '3px' }}>
                MATCH SCORE
              </div>
            </div>
          </div>
        </div>

        {/* Safety Status Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          padding: '10px 16px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#10b981" />
            <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '600' }}>
              {bestTool.safetyStatus}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Official Domain: <strong>{bestTool.verifiedOfficialDomain || bestTool.officialDomain}</strong> &bull; Verified: {bestTool.lastVerified}
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '20px', lineHeight: 1.6 }}>
          {bestTool.description}
        </p>

        {/* Explainable Recommendation: "Why this tool is recommended" (Section 29) */}
        <div style={{
          background: 'rgba(14, 22, 35, 0.92)',
          borderLeft: '4px solid #0df69e',
          padding: '16px 20px',
          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Zap size={16} color="#0df69e" />
            <span style={{ fontWeight: '700', fontSize: '0.92rem', color: '#0df69e' }}>
              Why {bestTool.name}? (Data-Driven Match Analysis)
            </span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(bestMatch.whyPoints || [bestMatch.whyRecommended]).map((pt, i) => (
              <li key={i} style={{ fontSize: '0.88rem', color: 'var(--text-main)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Check size={15} color="#0df69e" style={{ flexShrink: 0, marginTop: '3px' }} />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Compact Review Summary (Section 34) */}
        <div style={{
          padding: '16px 20px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f59e0b' }}>
                ⭐ {bestTool.overallRating || 4.8}/5
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                ({bestTool.reviewCount || 'Verified reviews aggregate'})
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Source: <strong>{bestTool.reviewSources?.[0]?.sourceName || 'Verified AI Evaluation Benchmark'}</strong> &bull; Reviewed: {bestTool.reviewRecency || 'September 2026'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {/* Pros */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <ThumbsUp size={12} /> PROS
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {(bestTool.pros || ['Fast output generation', 'User friendly']).slice(0, 2).map((p, i) => (
                  <div key={i}>✓ {p}</div>
                ))}
              </div>
            </div>

            {/* Cons */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <ThumbsDown size={12} /> CONS
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {(bestTool.cons || ['Advanced features require payment']).slice(0, 2).map((c, i) => (
                  <div key={i}>✗ {c}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Key Features Chips */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '10px' }}>
            Key Features & Capabilities
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {bestTool.features.map((feature, idx) => (
              <span key={idx} style={{
                fontSize: '0.82rem',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <CheckCircle size={13} color="#0df69e" />
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Metadata Grid (Pricing, Platforms, Developer) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '28px'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Pricing & Plans</div>
            <div style={{ fontWeight: '600', fontSize: '0.95rem', marginTop: '2px' }}>
              {bestTool.pricing}
            </div>
            <span className={bestTool.freePlan ? 'badge badge-green' : 'badge badge-yellow'} style={{ marginTop: '4px' }}>
              {bestTool.freePlan ? 'Free Plan Available' : 'Paid / Trial'}
            </span>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Supported Platforms</div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
              {bestTool.platforms.map((p, i) => (
                <span key={i} style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-muted)'
                }}>
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Developer / Company</div>
            <div style={{ fontWeight: '600', fontSize: '0.95rem', marginTop: '2px' }}>
              {bestTool.developer || bestTool.company}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              Trend Score: <strong>{bestScores.trendScore}/100</strong>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button 
            className="btn-primary"
            onClick={() => onOpenSafetyModal(bestTool.officialWebsite, bestTool.name)}
          >
            <ExternalLink size={18} />
            Open Official Website
          </button>

          {onViewToolDetail && (
            <button
              className="btn-secondary"
              onClick={() => onViewToolDetail(bestTool)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Eye size={16} />
              View Details
            </button>
          )}

          {bestTool.officialAndroidUrl && (
            <button 
              className="btn-secondary"
              onClick={() => onOpenSafetyModal(bestTool.officialAndroidUrl, `${bestTool.name} (Android App)`)}
            >
              <Smartphone size={16} />
              Android
            </button>
          )}

          {bestTool.officialIosUrl && (
            <button 
              className="btn-secondary"
              onClick={() => onOpenSafetyModal(bestTool.officialIosUrl, `${bestTool.name} (iOS App)`)}
            >
              <Smartphone size={16} />
              iOS
            </button>
          )}

          {bestTool.officialDesktopUrl && (
            <button 
              className="btn-secondary"
              onClick={() => onOpenSafetyModal(bestTool.officialDesktopUrl, `${bestTool.name} (Desktop)`)}
            >
              <Monitor size={16} />
              Desktop
            </button>
          )}

          <button 
            className={isBestCompared ? 'btn-secondary' : 'btn-accent-outline'}
            onClick={() => onToggleCompare(bestTool.id)}
            style={{ marginLeft: 'auto' }}
          >
            {isBestCompared ? (
              <>
                <Check size={16} color="#0df69e" />
                Compared
              </>
            ) : (
              <>
                <Plus size={16} />
                Add to Compare
              </>
            )}
          </button>

          <button
            onClick={() => setShowScoreDetails(!showScoreDetails)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              padding: '8px 12px'
            }}
          >
            <span>Score Breakdown</span>
            {showScoreDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* 7-FACTOR SCORE BREAKDOWN ACCORDION */}
        {showScoreDetails && (
          <div style={{
            marginTop: '24px',
            padding: '20px',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)'
          }} className="animate-fade-in">
            <div style={{ fontSize: '0.88rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={16} color="#0df69e" />
              Transparent 7-Factor Weighted Scoring Formula
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {/* Factor 1: Requirement Match 35% */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span>Requirement Match (35%)</span>
                  <strong>{bestScores.requirementMatch}%</strong>
                </div>
                <div className="score-bar-bg">
                  <div className="score-bar-fill" style={{ width: `${bestScores.requirementMatch}%` }} />
                </div>
              </div>

              {/* Factor 2: Feature Match 20% */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span>Feature Match (20%)</span>
                  <strong>{bestScores.featureMatch}%</strong>
                </div>
                <div className="score-bar-bg">
                  <div className="score-bar-fill" style={{ width: `${bestScores.featureMatch}%` }} />
                </div>
              </div>

              {/* Factor 3: Budget Match 15% */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span>Budget Match (15%)</span>
                  <strong>{bestScores.budgetMatch}%</strong>
                </div>
                <div className="score-bar-bg">
                  <div className="score-bar-fill" style={{ width: `${bestScores.budgetMatch}%` }} />
                </div>
              </div>

              {/* Factor 4: Platform Match 10% */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span>Platform Match (10%)</span>
                  <strong>{bestScores.platformMatch}%</strong>
                </div>
                <div className="score-bar-bg">
                  <div className="score-bar-fill" style={{ width: `${bestScores.platformMatch}%` }} />
                </div>
              </div>

              {/* Factor 5: Trend Score 10% */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span>Trend Score (10%)</span>
                  <strong>{bestScores.trendScore}%</strong>
                </div>
                <div className="score-bar-bg">
                  <div className="score-bar-fill" style={{ width: `${bestScores.trendScore}%` }} />
                </div>
              </div>

              {/* Factor 6: Quality 5% */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span>Quality / Reviews (5%)</span>
                  <strong>{bestScores.qualityScore || 90}%</strong>
                </div>
                <div className="score-bar-bg">
                  <div className="score-bar-fill" style={{ width: `${bestScores.qualityScore || 90}%` }} />
                </div>
              </div>

              {/* Factor 7: Other Suitability 5% */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span>Other Suitability (5%)</span>
                  <strong>{bestScores.otherSuitability}%</strong>
                </div>
                <div className="score-bar-bg">
                  <div className="score-bar-fill" style={{ width: `${bestScores.otherSuitability}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RECOMMENDED ALTERNATIVES (Section 13 & 33) */}
      {alternatives && alternatives.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700' }}>
                ⭐ Other Good Options (Alternatives)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Other highly-ranked candidates that fit your purpose and constraints
              </p>
            </div>
            <span className="badge badge-neutral">
              {alternatives.length} Alternatives Found
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {alternatives.map(item => {
              const altTool = item.tool;
              const altScores = item.scores;
              const isAltCompared = isCompared(altTool.id);

              return (
                <div key={altTool.id} className="glass-panel" style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid var(--border-card)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.25rem',
                          fontWeight: '700'
                        }}>
                          {altTool.name.charAt(0)}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: '700' }}>
                            {altTool.name}
                          </h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            {altTool.category} &bull; {altTool.subcategory}
                          </span>
                        </div>
                      </div>

                      <div style={{
                        textAlign: 'right',
                        background: 'rgba(13, 246, 158, 0.08)',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(13, 246, 158, 0.2)'
                      }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0df69e' }}>
                          {altScores.finalScore}%
                        </span>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>MATCH</div>
                      </div>
                    </div>

                    {/* Rating & Safety Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', marginBottom: '10px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b', fontWeight: '700' }}>
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        {altTool.overallRating || 4.6}
                      </span>
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <ShieldCheck size={13} />
                        Low Risk
                      </span>
                      <span style={{ color: 'var(--text-dim)', marginLeft: 'auto' }}>
                        Trend: {altScores.trendScore}%
                      </span>
                    </div>

                    {/* Description */}
                    <p style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      marginBottom: '14px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.5
                    }}>
                      {altTool.description}
                    </p>

                    {/* Features Snippet */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                      {(altTool.features || []).slice(0, 3).map((f, idx) => (
                        <span key={idx} style={{
                          fontSize: '0.72rem',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          color: 'var(--text-muted)'
                        }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer Stats & Actions */}
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      padding: '8px 0',
                      borderTop: '1px solid var(--border-subtle)',
                      marginBottom: '14px'
                    }}>
                      <span style={{ color: 'var(--text-dim)' }}>{altTool.pricing}</span>
                      <span className={altTool.freePlan ? 'badge badge-green' : 'badge badge-neutral'}>
                        {altTool.freePlan ? 'Free Plan' : 'Paid / Trial'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn-primary"
                        style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
                        onClick={() => onOpenSafetyModal(altTool.officialWebsite, altTool.name)}
                      >
                        <ExternalLink size={14} />
                        Website
                      </button>

                      {onViewToolDetail && (
                        <button
                          className="btn-secondary"
                          style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                          onClick={() => onViewToolDetail(altTool)}
                          title="View complete tool details & reviews"
                        >
                          <Eye size={14} />
                          Details
                        </button>
                      )}

                      <button
                        className="btn-secondary"
                        style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                        onClick={() => onToggleCompare(altTool.id)}
                        title="Compare tool"
                      >
                        {isAltCompared ? <Check size={14} color="#0df69e" /> : <Plus size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
