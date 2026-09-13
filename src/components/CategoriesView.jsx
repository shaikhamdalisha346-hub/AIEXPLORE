import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Presentation, Video, Palette, Code, 
  GraduationCap, PenTool, Mic, Globe, BarChart3, 
  Zap, Box, Bot, Compass, ArrowRight, Layers 
} from 'lucide-react';

const ICON_MAP = {
  Sparkles,
  Presentation,
  Video,
  Palette,
  Code,
  GraduationCap,
  PenTool,
  Mic,
  Globe,
  BarChart: BarChart3,
  Zap,
  Box,
  Bot,
  Compass
};

export default function CategoriesView({ onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      {/* Heading */}
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
          CATEGORIES DIRECTORY
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: '800', marginBottom: '12px' }}>
          Explore AI by Operational Domain
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
          Discover specialized AI tools curated and verified across 14 operational domains in our 160+ tool repository.
        </p>
      </div>

      {/* Grid of Categories */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading categories directory...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '24px'
        }}>
          {categories.map((cat, idx) => {
            const Icon = ICON_MAP[cat.icon] || Sparkles;

            return (
              <div
                key={idx}
                className="glass-panel"
                onClick={() => onSelectCategory(cat.name)}
                style={{
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
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
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, rgba(13, 246, 158, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
                      border: '1px solid rgba(13, 246, 158, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={26} color="#0df69e" />
                    </div>

                    <span className="badge badge-green" style={{ fontWeight: '700' }}>
                      {cat.toolCount} Tools
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px' }}>
                    {cat.name}
                  </h3>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
                    {cat.description}
                  </p>
                </div>

                <div>
                  {/* Top Tools Preview */}
                  {cat.topTools && cat.topTools.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '6px' }}>
                        Top Rated in Domain
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {cat.topTools.map((t) => (
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
                    <span>View Category Tools</span>
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
