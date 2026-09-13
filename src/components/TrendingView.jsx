import React, { useState, useEffect } from 'react';
import { Flame, Rocket, Sparkles, RefreshCw, Star, HeartHandshake, GraduationCap, Info } from 'lucide-react';
import ToolCard from './ToolCard';

export default function TrendingView({ 
  onOpenSafetyModal, 
  onToggleCompare, 
  isCompared,
  onViewToolDetail
}) {
  const [collections, setCollections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trendingNow');

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch('/api/trending');
        const data = await res.json();
        setCollections(data);
      } catch (err) {
        console.error('Error fetching trending:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const tabs = [
    { id: 'trendingNow', label: 'Trending Now', icon: Flame, color: '#f59e0b' },
    { id: 'risingFast', label: 'Rising Fast', icon: Rocket, color: '#0df69e' },
    { id: 'recentlyAdded', label: 'Recently Added', icon: Sparkles, color: '#06b6d4' },
    { id: 'recentlyUpdated', label: 'Recently Updated', icon: RefreshCw, color: '#8b5cf6' },
    { id: 'mostPopular', label: 'Most Popular', icon: Star, color: '#eab308' },
    { id: 'bestFreeTools', label: 'Best Free Tools', icon: HeartHandshake, color: '#10b981' },
    { id: 'bestForStudents', label: 'Best for Students', icon: GraduationCap, color: '#38bdf8' }
  ];

  const currentList = collections ? (collections[activeTab] || []) : [];

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      {/* Heading */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '99px',
          background: 'rgba(245, 158, 11, 0.12)',
          color: '#f59e0b',
          fontSize: '0.8rem',
          fontWeight: '700',
          marginBottom: '12px'
        }}>
          <Flame size={14} />
          LIVE TRENDING ENGINE
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: '800', marginBottom: '8px' }}>
          Trending AI Discoveries
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Ranked dynamically using real growth momentum, user interest, and verified feature updates.
        </p>
      </div>

      {/* Dynamic Trend Formula Notice (Section 17) */}
      <div style={{
        padding: '16px 20px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <Info size={18} color="#0df69e" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          <strong style={{ color: '#ffffff' }}>Dynamic Calculation Formula: </strong>
          Recent Growth (30%) + User Interest (25%) + Feature Updates (20%) + Usage & Popularity (15%) + Recency (10%). We do not permanently hard-code any tool as trending.
        </div>
      </div>

      {/* Collections Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '32px'
      }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem',
                fontWeight: isActive ? '700' : '500',
                background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                border: isActive ? `1px solid ${tab.color}` : '1px solid var(--border-subtle)',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} color={tab.color} />
              <span>{tab.label}</span>
              {collections && collections[tab.id] && (
                <span style={{
                  fontSize: '0.72rem',
                  padding: '2px 6px',
                  borderRadius: '99px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-main)'
                }}>
                  {collections[tab.id].length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tool Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Computing live trend indices...
        </div>
      ) : currentList.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3>No tools found in this collection</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Check back as trends recalculate dynamically.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '24px'
        }}>
          {currentList.map(tool => (
            <ToolCard 
              key={tool.id}
              tool={tool}
              onOpenSafetyModal={onOpenSafetyModal}
              onToggleCompare={onToggleCompare}
              isCompared={isCompared}
              onViewToolDetail={onViewToolDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
}
