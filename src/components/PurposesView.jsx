import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Presentation, Video, Palette, Code, GraduationCap, 
  PenTool, Mic, BarChart3, Globe, Zap, Bot, Box, FileText, 
  Layers, ArrowRight, Music, Search, CheckCircle2, ShieldCheck 
} from 'lucide-react';

const PURPOSE_ICONS = {
  'Create Presentations': Presentation,
  'Create Videos & Reels': Video,
  'Video Editing & Subtitles': Video,
  'Generate Images & Art': Palette,
  'Edit Images & Background Removal': Palette,
  'Write Content & Copywriting': PenTool,
  'Research & Academic Citations': Search,
  'Code & Autonomous Engineering': Code,
  'Build Websites without Coding': Globe,
  'Build Apps using AI': Globe,
  'Analyze Data & Spreadsheets': BarChart3,
  'Data Visualization & Charts': BarChart3,
  'Generate Voice & Voiceover': Mic,
  'Voice Cloning': Mic,
  'Generate Music & Sound Effects': Music,
  'Transcribe Audio & Meeting Notes': Mic,
  'Study & Exam Prep': GraduationCap,
  'Summarize PDFs & Long Documents': FileText,
  'Create Logos & Branding': Palette,
  'Marketing & Advertising Campaigns': Sparkles,
  'SEO & Keyword Optimization': Search,
  'Automate Repetitive Tasks & Workflows': Zap,
  'Productivity & Note Taking': Sparkles,
  'Resume & Career Preparation': GraduationCap,
  'Translation & Multilingual': Globe,
  '3D Modeling & Generation': Box,
  'AI Agents & Autonomous Assistants': Bot,
  'Multi-purpose reasoning': Sparkles
};

export default function PurposesView({ onSelectPurpose }) {
  const [purposes, setPurposes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    const fetchPurposes = async () => {
      try {
        const res = await fetch('/api/purposes');
        const data = await res.json();
        setPurposes(data || []);
      } catch (err) {
        console.error('Error fetching purposes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPurposes();
  }, []);

  const filteredPurposes = purposes.filter(p => 
    p.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '36px', textAlign: 'center' }}>
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
          <Layers size={14} />
          PURPOSE-FIRST DISCOVERY
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: '800', marginBottom: '12px' }}>
          Browse AI Tools by Purpose
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '680px', margin: '0 auto 28px', lineHeight: 1.6 }}>
          Do not worry about tool names. Select the goal you want to achieve, and we will surface the best verified tools designed specifically for that purpose.
        </p>

        {/* Filter Input */}
        <div style={{ maxWidth: '440px', margin: '0 auto', position: 'relative' }}>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter purposes (e.g. video, presentation, code, pdf)..."
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: '12px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-card)',
              color: '#ffffff',
              outline: 'none',
              fontSize: '0.95rem'
            }}
          />
        </div>
      </div>

      {/* Grid of Purpose Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading purpose taxonomy directory...
        </div>
      ) : filteredPurposes.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '600px', margin: '0 auto' }}>
          <h3>No matching purposes found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Try searching for another keyword like "video", "presentation", "research", or "code".
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {filteredPurposes.map((purp, idx) => {
            const Icon = PURPOSE_ICONS[purp.name] || Sparkles;

            return (
              <div
                key={idx}
                className="glass-panel"
                onClick={() => onSelectPurpose(purp.name)}
                style={{
                  padding: '26px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#0df69e';
                  e.currentTarget.style.boxShadow = '0 10px 30px -5px rgba(13, 246, 158, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-card)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, rgba(13, 246, 158, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
                      border: '1px solid rgba(13, 246, 158, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={24} color="#0df69e" />
                    </div>

                    <span className="badge badge-green" style={{ fontWeight: '700' }}>
                      {purp.toolCount} {purp.toolCount === 1 ? 'Tool' : 'Tools'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: '#ffffff' }}>
                    {purp.name}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.5 }}>
                    Discover top matching AI candidates configured for {purp.name.toLowerCase()}.
                  </p>
                </div>

                <div>
                  {/* Top Tools Preview */}
                  {purp.topTools && purp.topTools.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '6px' }}>
                        Top Recommended
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {purp.topTools.map(t => (
                          <span key={t.id} style={{
                            fontSize: '0.75rem',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-main)'
                          }}>
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Browse CTA */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#0df69e',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '12px'
                  }}>
                    <span>Explore Tools</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
