import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, RotateCcw, Layers, Star } from 'lucide-react';
import ToolCard from './ToolCard';

export default function FindTools({ 
  onOpenSafetyModal, 
  onToggleCompare, 
  isCompared,
  initialCategory,
  initialPurpose,
  onViewToolDetail
}) {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory || 'All');
  const [purpose, setPurpose] = useState(initialPurpose || 'All');
  const [freeOnly, setFreeOnly] = useState(false);
  const [platform, setPlatform] = useState('All');
  const [targetUser, setTargetUser] = useState('All');
  const [minRating, setMinRating] = useState('All');
  const [sort, setSort] = useState('trending');

  const categories = [
    'All',
    'Presentation / PPT',
    'Education / Study',
    'Video',
    'Website & App Building',
    'Coding',
    'Data Analysis',
    'Image / Design',
    'Voice / Audio',
    'Writing',
    'Automation',
    '3D & Architecture',
    'Productivity',
    'All-Rounder AI'
  ];

  const purposes = [
    'All',
    'Create Presentations',
    'Research & Academic Citations',
    'Summarize PDFs & Long Documents',
    'Create Videos & Reels',
    'Video Editing & Subtitles',
    'Build Websites without Coding',
    'Build Apps using AI',
    'Code & Autonomous Engineering',
    'Analyze Data & Spreadsheets',
    'Generate Voice & Voiceover',
    'Voice Cloning',
    'Generate Music & Sound Effects',
    'Generate Images & Art',
    'Edit Images & Background Removal',
    'Create Logos & Branding',
    'Write Content & Copywriting',
    'SEO & Keyword Optimization',
    'Automate Repetitive Tasks & Workflows',
    'Transcribe Audio & Meeting Notes',
    'Study & Exam Prep',
    'Resume & Career Preparation',
    '3D Modeling & Generation',
    'AI Agents & Autonomous Assistants',
    'Multi-purpose reasoning'
  ];

  const platforms = ['All', 'Web', 'iOS', 'Android', 'Mac', 'Windows'];
  const targetUsers = ['All', 'Students', 'Developers', 'Content Creators', 'Professionals', 'Researchers'];

  const fetchTools = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category !== 'All') params.append('category', category);
      if (purpose !== 'All') params.append('purpose', purpose);
      if (freeOnly) params.append('freeOnly', 'true');
      if (platform !== 'All') params.append('platform', platform);
      if (targetUser !== 'All') params.append('targetUser', targetUser);
      if (minRating !== 'All') params.append('minRating', minRating);
      params.append('sort', sort);

      const res = await fetch(`/api/tools?${params.toString()}`);
      const data = await res.json();
      setTools(data.tools || []);
    } catch (err) {
      console.error('Error fetching tools:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
    if (initialPurpose) setPurpose(initialPurpose);
  }, [initialCategory, initialPurpose]);

  useEffect(() => {
    fetchTools();
  }, [category, purpose, freeOnly, platform, targetUser, minRating, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTools();
  };

  const handleReset = () => {
    setSearch('');
    setCategory('All');
    setPurpose('All');
    setFreeOnly(false);
    setPlatform('All');
    setTargetUser('All');
    setMinRating('All');
    setSort('trending');
  };

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: '800', marginBottom: '8px' }}>
          Explore AI Tools
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Search our catalog of 160+ authentic, verified AI tools with purpose detection and multi-facet filtering.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '36px' }}>
        {/* Search row */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{
            flex: 1,
            minWidth: '260px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-md)',
            padding: '0 16px'
          }}>
            <Search size={18} color="var(--text-dim)" style={{ marginRight: '10px' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tool name, purpose, features, keywords..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                padding: '12px 0',
                outline: 'none'
              }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>
            Search
          </button>

          <button 
            type="button" 
            className="btn-secondary" 
            onClick={handleReset}
            style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Reset Filters"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </form>

        {/* Multi-facet Filter controls row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '14px',
          alignItems: 'center'
        }}>
          {/* Category */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px', fontWeight: '600' }}>
              CATEGORY
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-card)',
                color: '#ffffff',
                outline: 'none'
              }}
            >
              {categories.map(c => <option key={c} value={c} style={{ background: '#0c121e' }}>{c}</option>)}
            </select>
          </div>

          {/* Purpose */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px', fontWeight: '600' }}>
              PURPOSE
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-card)',
                color: '#ffffff',
                outline: 'none'
              }}
            >
              {purposes.map(p => <option key={p} value={p} style={{ background: '#0c121e' }}>{p}</option>)}
            </select>
          </div>

          {/* Platform */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px', fontWeight: '600' }}>
              PLATFORM
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-card)',
                color: '#ffffff',
                outline: 'none'
              }}
            >
              {platforms.map(p => <option key={p} value={p} style={{ background: '#0c121e' }}>{p}</option>)}
            </select>
          </div>

          {/* Target Audience */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px', fontWeight: '600' }}>
              TARGET USER
            </label>
            <select
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-card)',
                color: '#ffffff',
                outline: 'none'
              }}
            >
              {targetUsers.map(u => <option key={u} value={u} style={{ background: '#0c121e' }}>{u}</option>)}
            </select>
          </div>

          {/* Min Rating */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px', fontWeight: '600' }}>
              MIN RATING
            </label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-card)',
                color: '#ffffff',
                outline: 'none'
              }}
            >
              <option value="All" style={{ background: '#0c121e' }}>All Ratings</option>
              <option value="4.5" style={{ background: '#0c121e' }}>⭐ 4.5+ Rating</option>
              <option value="4.7" style={{ background: '#0c121e' }}>⭐ 4.7+ Rating</option>
              <option value="4.8" style={{ background: '#0c121e' }}>⭐ 4.8+ Top Rated</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px', fontWeight: '600' }}>
              SORT BY
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-card)',
                color: '#ffffff',
                outline: 'none'
              }}
            >
              <option value="trending" style={{ background: '#0c121e' }}>Trending Growth</option>
              <option value="popular" style={{ background: '#0c121e' }}>Most Popular</option>
              <option value="rating" style={{ background: '#0c121e' }}>Highest Rated</option>
              <option value="newest" style={{ background: '#0c121e' }}>Recently Added</option>
              <option value="free" style={{ background: '#0c121e' }}>Free Plans First</option>
            </select>
          </div>

          {/* Free Plan Checkbox Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={freeOnly}
                onChange={(e) => setFreeOnly(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#0df69e' }}
              />
              <span>Free Plan Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
          Showing <strong>{tools.length}</strong> AI Tools
          {category !== 'All' && <span> in <strong>{category}</strong></span>}
          {purpose !== 'All' && <span> for <strong>{purpose}</strong></span>}
        </div>
      </div>

      {/* Tools Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Filtering tool database...
        </div>
      ) : tools.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3>No matching AI tools found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Try broadening your search query or resetting filters.
          </p>
          <button className="btn-secondary" onClick={handleReset} style={{ marginTop: '16px' }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '24px'
        }}>
          {tools.map(tool => (
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
