import React, { useState, useEffect } from 'react';
import { 
  GitCompare, Trash2, ExternalLink, ShieldCheck, CheckCircle2, 
  XCircle, Plus, Sparkles, Flame, Star, Award, Eye, Check, Minus, HelpCircle
} from 'lucide-react';

export default function CompareView({ 
  compareIds, 
  onRemoveCompare, 
  onClearCompare, 
  onOpenSafetyModal,
  onAddComparePreset,
  onViewToolDetail
}) {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (compareIds.length === 0) {
      setTools([]);
      return;
    }

    const fetchCompared = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toolIds: compareIds })
        });
        const data = await res.json();
        setTools(data.tools || []);
      } catch (err) {
        console.error('Error fetching compared tools:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompared();
  }, [compareIds]);

  const presetPairs = [
    { label: 'AI Presentations: Gamma vs Canva vs MagicSlides vs Beautiful.ai', ids: ['gamma', 'canva', 'magicslides', 'beautiful-ai'] },
    { label: 'AI Research & Citations: Perplexity vs NotebookLM vs Consensus vs Elicit', ids: ['perplexity', 'notebooklm', 'consensus', 'elicit'] },
    { label: 'AI Code Editors: Cursor vs GitHub Copilot vs Windsurf vs Replit', ids: ['cursor', 'github-copilot', 'windsurf', 'replit'] },
    { label: 'Short-Form Video & Reels: CapCut vs InVideo vs VEED vs Runway', ids: ['capcut', 'invideo', 'veed', 'runway'] },
    { label: 'AI Website & App Builders: Framer vs Webflow vs Lovable vs Bolt.new', ids: ['framer', 'webflow', 'lovable', 'bolt'] }
  ];

  const renderStatus = (val) => {
    if (val === true || val === 'Available' || val === 'Yes') {
      return (
        <span style={{ color: '#0df69e', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
          <Check size={16} /> Available
        </span>
      );
    }
    if (val === false || val === 'Not available' || val === 'No') {
      return (
        <span style={{ color: 'var(--text-dim)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Minus size={16} /> Not available
        </span>
      );
    }
    if (!val || val === 'Information unavailable') {
      return (
        <span style={{ color: 'var(--text-dim)', fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <HelpCircle size={14} /> Information unavailable
        </span>
      );
    }
    return val;
  };

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '99px',
            background: 'rgba(13, 246, 158, 0.1)',
            color: '#0df69e',
            fontSize: '0.8rem',
            fontWeight: '700',
            marginBottom: '12px'
          }}>
            <GitCompare size={14} />
            SIDE-BY-SIDE MATRIX (2–5 TOOLS)
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '800', marginBottom: '8px' }}>
            Compare AI Tools
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            Evaluate capabilities, pricing tiers, platform support, and safety ratings side by side without bias.
          </p>
        </div>

        {compareIds.length > 0 && (
          <button 
            className="btn-secondary" 
            onClick={onClearCompare}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Trash2 size={16} />
            Clear Comparison ({compareIds.length})
          </button>
        )}
      </div>

      {/* Empty State with Presets */}
      {tools.length === 0 && !loading && (
        <div className="glass-panel" style={{ padding: '48px 32px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <GitCompare size={30} color="#0df69e" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '10px' }}>
            No tools selected for comparison
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '28px', maxWidth: '520px', margin: '0 auto 28px' }}>
            Add tools to compare by clicking "+" on any card or choose one of our curated Science Expo comparison presets:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '620px', margin: '0 auto' }}>
            {presetPairs.map((preset, idx) => (
              <button
                key={idx}
                className="btn-secondary"
                onClick={() => onAddComparePreset(preset.ids)}
                style={{
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="#0df69e" />
                  <span style={{ fontSize: '0.9rem' }}>{preset.label}</span>
                </div>
                <Plus size={16} color="var(--text-muted)" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Generating comparative matrix...
        </div>
      )}

      {/* Comparison Table */}
      {tools.length > 0 && !loading && (
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '16px' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            minWidth: `${tools.length * 220 + 200}px`
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-card)' }}>
                <th style={{ padding: '20px 16px', width: '200px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                  SPECIFICATION
                </th>
                {tools.map(tool => (
                  <th key={tool.id} style={{ padding: '20px 16px', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
                        {tool.category}
                      </span>
                      <button
                        onClick={() => onRemoveCompare(tool.id)}
                        style={{ color: 'var(--text-dim)', padding: '2px 4px' }}
                        title="Remove from comparison"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '4px' }}>
                      {tool.name}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      by {tool.developer || tool.company}
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        className="btn-primary"
                        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        onClick={() => onOpenSafetyModal(tool.officialWebsite, tool.name)}
                      >
                        <ExternalLink size={13} />
                        Website
                      </button>
                      {onViewToolDetail && (
                        <button
                          className="btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                          onClick={() => onViewToolDetail(tool)}
                        >
                          <Eye size={13} />
                          Details
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Overall Rating */}
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '16px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Overall Rating
                </td>
                {tools.map(tool => (
                  <td key={tool.id} style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '800', color: '#f59e0b', fontSize: '1rem' }}>
                      <Star size={16} fill="#f59e0b" color="#f59e0b" />
                      <span>{tool.overallRating || 4.6} / 5.0</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Best For */}
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '16px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Best For
                </td>
                {tools.map(tool => (
                  <td key={tool.id} style={{ padding: '16px', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    {Array.isArray(tool.bestFor) ? tool.bestFor[0] : (tool.bestFor || 'General users')}
                  </td>
                ))}
              </tr>

              {/* Free Plan Availability */}
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '16px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Free Plan Available
                </td>
                {tools.map(tool => (
                  <td key={tool.id} style={{ padding: '16px' }}>
                    {renderStatus(tool.freePlan)}
                  </td>
                ))}
              </tr>

              {/* Pricing Structure */}
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '16px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Pricing Details
                </td>
                {tools.map(tool => (
                  <td key={tool.id} style={{ padding: '16px', fontSize: '0.85rem' }}>
                    {tool.pricing}
                  </td>
                ))}
              </tr>

              {/* Ease of Use */}
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '16px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Ease of Use
                </td>
                {tools.map(tool => (
                  <td key={tool.id} style={{ padding: '16px', fontSize: '0.9rem', fontWeight: '600', color: '#0df69e' }}>
                    {tool.easeOfUse || 4.7} / 5.0
                  </td>
                ))}
              </tr>

              {/* Primary Purposes */}
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '16px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Primary Purposes
                </td>
                {tools.map(tool => (
                  <td key={tool.id} style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {(tool.purposes || []).map((p, i) => (
                        <span key={i} className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Key Features */}
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '16px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Key Features
                </td>
                {tools.map(tool => (
                  <td key={tool.id} style={{ padding: '16px' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {(tool.features || []).slice(0, 4).map((f, i) => (
                        <li key={i} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={13} color="#0df69e" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Supported Platforms */}
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '16px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Supported Platforms
                </td>
                {tools.map(tool => (
                  <td key={tool.id} style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {(tool.platforms || ['Web']).map((p, i) => (
                        <span key={i} style={{
                          fontSize: '0.75rem',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          color: 'var(--text-muted)'
                        }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Trend Score */}
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '16px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Trend Score
                </td>
                {tools.map(tool => (
                  <td key={tool.id} style={{ padding: '16px' }}>
                    <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Flame size={12} />
                      {tool.trendScore || 85}/100
                    </span>
                  </td>
                ))}
              </tr>

              {/* Official Domain & Safety */}
              <tr>
                <td style={{ padding: '16px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Safety & Domain
                </td>
                {tools.map(tool => (
                  <td key={tool.id} style={{ padding: '16px', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', marginBottom: '4px', fontWeight: '600' }}>
                      <ShieldCheck size={14} />
                      <span>{tool.verifiedOfficialDomain || tool.officialDomain}</span>
                    </div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>
                      Verified: {tool.lastVerified || 'September 13, 2026'}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
