import React from 'react';
import { Sparkles, ShieldCheck, Cpu, Layers, GitCompare, CheckCircle2, Award, Zap, Lock } from 'lucide-react';

export default function AboutView() {
  return (
    <div className="container" style={{ padding: '40px 20px 80px', maxWidth: '940px' }}>
      {/* Heading */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 14px',
          borderRadius: '99px',
          background: 'rgba(13, 246, 158, 0.1)',
          color: '#0df69e',
          fontSize: '0.82rem',
          fontWeight: '700',
          marginBottom: '12px',
          border: '1px solid rgba(13, 246, 158, 0.25)'
        }}>
          <Sparkles size={14} />
          SCIENCE EXPO INNOVATION & ARCHITECTURE
        </div>
        <h1 style={{ fontSize: '2.8rem', fontWeight: '800', marginBottom: '12px' }}>
          About AI Tool Finder
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', lineHeight: 1.6 }}>
          Explore the AI world. Discover the tool that fits your purpose.
        </p>
      </div>

      {/* SCIENCE EXPO KEY DIFFERENTIATOR BANNER (Section 49) */}
      <div className="glass-panel" style={{
        padding: '32px',
        marginBottom: '36px',
        borderLeft: '5px solid #0df69e',
        background: 'linear-gradient(135deg, rgba(13, 246, 158, 0.08) 0%, rgba(14, 22, 35, 0.95) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Award size={20} color="#0df69e" />
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0df69e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Our Science Expo Project Innovation
          </span>
        </div>
        <blockquote style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          lineHeight: 1.6,
          color: '#ffffff',
          fontStyle: 'italic',
          margin: 0
        }}>
          "AI Tool Finder does not simply list AI tools. It understands the user's purpose, compares relevant tools using structured data, incorporates review and current-relevance signals, and performs a separate safety verification before directing users to external websites."
        </blockquote>
      </div>

      {/* Core Philosophy */}
      <div className="glass-panel" style={{ padding: '36px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '16px', color: '#0df69e' }}>
          1. The Purpose-First Principle (No Default Winner)
        </h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
          Traditional AI directories often function as static catalogs that default to the same massive model (like ChatGPT) for every general search query. At <strong>AI Tool Finder</strong>, we believe every user requirement has its own optimal, purpose-built instrument.
        </p>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
          If a student asks for a college presentation, they need an engine like <strong>Gamma</strong> or <strong>Canva</strong>. If a researcher asks for citation-backed facts, they need <strong>Perplexity</strong> or <strong>NotebookLM</strong>. If a creator asks for an Instagram reel, they need <strong>CapCut</strong>. Our recommendation pipeline is built to understand the purpose behind the request and dynamically adapt candidates.
        </p>
      </div>

      {/* 7-Factor Weighted Scoring Formula */}
      <div className="glass-panel" style={{ padding: '36px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '16px', color: '#0df69e' }}>
          2. Transparent 7-Factor Scoring Algorithm
        </h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
          Candidate tools in the database are evaluated through a transparent mathematical scoring function:
        </p>

        <div style={{
          padding: '16px 20px',
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          color: '#0df69e',
          marginBottom: '24px',
          overflowX: 'auto'
        }}>
          finalScore = (reqMatch * 0.35) + (featureMatch * 0.20) + (budgetMatch * 0.15) + (platformMatch * 0.10) + (qualityScore * 0.05) + (trendScore * 0.10) + (otherSuitability * 0.05)
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0df69e' }}>35%</div>
            <div style={{ fontWeight: '700', fontSize: '0.9rem', marginTop: '4px' }}>Requirement Match</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Semantic purpose alignment, category matching, and keyword domain overlap.
            </div>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0df69e' }}>20%</div>
            <div style={{ fontWeight: '700', fontSize: '0.9rem', marginTop: '4px' }}>Feature Match</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Overlap between requested capabilities and native tool features.
            </div>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0df69e' }}>15%</div>
            <div style={{ fontWeight: '700', fontSize: '0.9rem', marginTop: '4px' }}>Budget Match</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Free plan availability, student discounts, and budget constraints.
            </div>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0df69e' }}>10%</div>
            <div style={{ fontWeight: '700', fontSize: '0.9rem', marginTop: '4px' }}>Platform Match</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Native Web, iOS, Android, Mac, and Windows support.
            </div>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0df69e' }}>10%</div>
            <div style={{ fontWeight: '700', fontSize: '0.9rem', marginTop: '4px' }}>Trend Score</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Dynamic growth momentum, feature updates velocity, and user interest.
            </div>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0df69e' }}>5%</div>
            <div style={{ fontWeight: '700', fontSize: '0.9rem', marginTop: '4px' }}>Quality & Reviews</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Overall user ratings, reliability, ease-of-use, and verified benchmark reviews.
            </div>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0df69e' }}>5%</div>
            <div style={{ fontWeight: '700', fontSize: '0.9rem', marginTop: '4px' }}>Other Suitability</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Target user demographic alignment (Students, Creators, Researchers).
            </div>
          </div>
        </div>
      </div>

      {/* Review Integrity Policy */}
      <div className="glass-panel" style={{ padding: '36px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '16px', color: '#0df69e' }}>
          3. Review System Integrity Policy
        </h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
          We strictly prohibit artificial fabrication of reviews, fake identities, or exaggerated review counts.
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: 'var(--text-main)' }}>
            <CheckCircle2 size={16} color="#0df69e" />
            <span>Every tool displays transparent pros, cons, ease of use, and verified sources.</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: 'var(--text-main)' }}>
            <CheckCircle2 size={16} color="#0df69e" />
            <span>If verified review information is unavailable, we explicitly store and display: <em>"Review information unavailable"</em> rather than inventing numbers.</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: 'var(--text-main)' }}>
            <CheckCircle2 size={16} color="#0df69e" />
            <span>Reviews influence reliability scores but never overpower actual purpose match.</span>
          </li>
        </ul>
      </div>

      {/* Pre-Flight Security Gate */}
      <div className="glass-panel" style={{ padding: '36px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '16px', color: '#0df69e' }}>
          4. Security Gate & Safety Verification
        </h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
          Safety is never treated as a scoring bonus — it is a mandatory separate security gate. Before users are directed to any external website, the link undergoes:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: '700', color: '#10b981', marginBottom: '6px' }}>🟢 Low Risk</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Verified official developer domain, valid HTTPS certificate, clean threat intelligence. Opens directly.
            </div>
          </div>

          <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: '700', color: '#f59e0b', marginBottom: '6px' }}>🟡 Suspicious</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Unverified domain, unusual URL length, or lexical anomaly. Displays caution warning before user confirmation.
            </div>
          </div>

          <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: '700', color: '#ef4444', marginBottom: '6px' }}>🔴 High Risk</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Known phishing domain, IP address host, or deceptive typosquatting. Automatically blocked.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
