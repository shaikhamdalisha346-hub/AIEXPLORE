import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, Shield, Zap, TrendingUp, Layers, Compass } from 'lucide-react';
import RecommendationResult from './RecommendationResult';

export default function HeroHome({ 
  onOpenSafetyModal, 
  onToggleCompare, 
  isCompared,
  setActiveTab,
  setSelectedCategory,
  onViewToolDetail
}) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState(null);

  // 10 Curated Science Expo Demo Scenarios
  const exampleSearches = [
    { label: "Create a college PPT (Free)", text: "I want to create a professional college presentation for free." },
    { label: "Research with sources", text: "I want to research a topic and get reliable sources." },
    { label: "Make an Instagram reel", text: "I want to make an Instagram reel quickly." },
    { label: "Build website without coding", text: "I want to build a website without coding." },
    { label: "Study from 300-page PDF", text: "I want to study from a 300-page PDF." },
    { label: "Analyze Excel spreadsheet", text: "I want to analyze an Excel file and make charts from my data." },
    { label: "Generate realistic voice", text: "I want to convert text into a realistic AI voice." },
    { label: "Generate original music", text: "I want to generate an original music song." },
    { label: "Remove image background", text: "I want to remove the background from an image." },
    { label: "Automate repetitive tasks", text: "I want to automate repetitive tasks and workflows." }
  ];

  const handleSearch = async (searchQuery) => {
    const q = searchQuery !== undefined ? searchQuery : query;
    if (!q || !q.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q.trim() })
      });

      if (!res.ok) {
        throw new Error('Failed to get recommendations.');
      }

      const data = await res.json();
      setRecommendation(data);
    } catch (err) {
      console.error(err);
      setError('Unable to analyze requirement. Please ensure server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (text) => {
    setQuery(text);
    handleSearch(text);
  };

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* HERO SECTION */}
      <section style={{
        padding: '65px 0 35px',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Tagline Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 18px',
          borderRadius: '999px',
          background: 'rgba(13, 246, 158, 0.1)',
          border: '1px solid rgba(13, 246, 158, 0.25)',
          color: '#0df69e',
          fontSize: '0.85rem',
          fontWeight: '700',
          marginBottom: '24px',
          boxShadow: '0 0 20px rgba(13, 246, 158, 0.18)'
        }}>
          <Sparkles size={15} />
          <span>PURPOSE-FIRST AI RECOMMENDATION ENGINE</span>
        </div>

        {/* Hero Heading */}
        <h1 style={{
          fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
          fontWeight: '800',
          lineHeight: 1.15,
          maxWidth: '960px',
          margin: '0 auto 20px',
          letterSpacing: '-0.03em'
        }}>
          Find the Right AI Tool for <br />
          <span style={{
            background: 'linear-gradient(135deg, #0df69e 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            What You Need to Accomplish.
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: 'var(--text-muted)',
          maxWidth: '740px',
          margin: '0 auto 36px',
          lineHeight: 1.6
        }}>
          Tell us what you want to accomplish. We'll analyze your purpose, compare verified AI tools using structured data, consider reviews and trends, and recommend the best match with safety verification.
        </p>

        {/* MAIN REQUIREMENT SEARCH BOX */}
        <div style={{
          maxWidth: '820px',
          margin: '0 auto',
          position: 'relative'
        }}>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(14, 22, 35, 0.95)',
              border: '2px solid rgba(13, 246, 158, 0.45)',
              borderRadius: '20px',
              padding: '8px 10px 8px 22px',
              boxShadow: '0 10px 40px -10px rgba(13, 246, 158, 0.25)',
              transition: 'border-color 0.2s ease',
              gap: '12px'
            }}
          >
            <Search size={22} color="#0df69e" style={{ flexShrink: 0 }} />
            <input
              type="text"
              id="main-requirement-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to do? (e.g. I want to create a professional college presentation for free)"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '1.05rem',
                outline: 'none',
                minWidth: '0'
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                borderRadius: '14px',
                padding: '14px 28px',
                fontSize: '1rem',
                flexShrink: 0
              }}
            >
              {loading ? (
                <>Analyzing...</>
              ) : (
                <>
                  <span>Find My AI Tool</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Secondary Action: Explore AI Tools */}
          <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <button
              onClick={() => setActiveTab('find')}
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-dim)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-dim)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <Compass size={14} color="#0df69e" />
              <span>Or explore full catalog (160+ AI tools)</span>
            </button>

            <button
              onClick={() => setActiveTab('purposes')}
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-dim)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-dim)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <Layers size={14} color="#06b6d4" />
              <span>Browse by Purpose directory</span>
            </button>
          </div>

          {/* Quick Example Clickable Searches */}
          <div style={{
            marginTop: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '600' }}>
              Try demo query:
            </span>
            {exampleSearches.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleClick(ex.text)}
                style={{
                  fontSize: '0.8rem',
                  padding: '5px 12px',
                  borderRadius: '99px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-muted)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0df69e';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.background = 'rgba(13, 246, 158, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            maxWidth: '600px',
            margin: '20px auto 0',
            padding: '12px 18px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#f87171',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}
      </section>

      {/* RECOMMENDATION RESULT SECTION */}
      {recommendation && (
        <section className="container">
          <RecommendationResult 
            result={recommendation}
            onOpenSafetyModal={onOpenSafetyModal}
            onToggleCompare={onToggleCompare}
            isCompared={isCompared}
            onViewToolDetail={onViewToolDetail}
          />
        </section>
      )}

      {/* VALUE PROPOSITION & TRUST BANNER */}
      {!recommendation && (
        <section className="container" style={{ marginTop: '45px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            <div className="glass-panel" style={{ padding: '28px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(13, 246, 158, 0.12)',
                border: '1px solid rgba(13, 246, 158, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Zap size={22} color="#0df69e" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>
                7-Factor Dynamic Scoring
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Requirement (35%) + Feature (20%) + Budget (15%) + Platform (10%) + Quality (5%) + Trend (10%) + Other (5%). We never recommend the same tool for every task.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '28px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Shield size={22} color="#06b6d4" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>
                Pre-Flight Safety Verification
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Every tool domain is audited against verified official records, HTTPS encryption, and ML risk heuristics before directing users to external websites.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '28px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(139, 92, 246, 0.12)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <TrendingUp size={22} color="#8b5cf6" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>
                Review & Relevance Signals
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Transparent reviews, genuine pros & cons, ease-of-use ratings, and dynamic trend momentum calibrated using real updates.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
