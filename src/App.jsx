import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroHome from './components/HeroHome';
import FindTools from './components/FindTools';
import PurposesView from './components/PurposesView';
import CategoriesView from './components/CategoriesView';
import TrendingView from './components/TrendingView';
import CompareView from './components/CompareView';
import SafetyChecker from './components/SafetyChecker';
import AdminDashboard from './components/AdminDashboard';
import AboutView from './components/AboutView';
import SafetyModal from './components/SafetyModal';
import ToolDetailModal from './components/ToolDetailModal';
import { Sparkles, Shield, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [compareIds, setCompareIds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPurpose, setSelectedPurpose] = useState('All');
  const [selectedToolDetail, setSelectedToolDetail] = useState(null);

  const [safetyModal, setSafetyModal] = useState({
    isOpen: false,
    url: '',
    toolName: ''
  });

  const handleOpenSafetyModal = (url, toolName) => {
    if (!url) return;
    setSafetyModal({
      isOpen: true,
      url,
      toolName: toolName || 'External AI Tool'
    });
  };

  const handleCloseSafetyModal = () => {
    setSafetyModal({ isOpen: false, url: '', toolName: '' });
  };

  const handleOpenToolDetail = (tool) => {
    setSelectedToolDetail(tool);
  };

  const handleCloseToolDetail = () => {
    setSelectedToolDetail(null);
  };

  const handleToggleCompare = (toolId) => {
    setCompareIds(prev => {
      if (prev.includes(toolId)) {
        return prev.filter(id => id !== toolId);
      } else {
        if (prev.length >= 5) {
          alert('You can compare a maximum of 5 tools simultaneously.');
          return prev;
        }
        return [...prev, toolId];
      }
    });
  };

  const handleRemoveCompare = (toolId) => {
    setCompareIds(prev => prev.filter(id => id !== toolId));
  };

  const handleClearCompare = () => {
    setCompareIds([]);
  };

  const handleAddComparePreset = (presetIds) => {
    setCompareIds(presetIds.slice(0, 5));
  };

  const handleSelectCategory = (catName) => {
    setSelectedCategory(catName);
    setSelectedPurpose('All');
    setActiveTab('find');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPurpose = (purpName) => {
    setSelectedPurpose(purpName);
    setSelectedCategory('All');
    setActiveTab('find');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isCompared = (toolId) => compareIds.includes(toolId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        compareCount={compareIds.length} 
      />

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {activeTab === 'home' && (
          <HeroHome 
            onOpenSafetyModal={handleOpenSafetyModal}
            onToggleCompare={handleToggleCompare}
            isCompared={isCompared}
            setActiveTab={setActiveTab}
            setSelectedCategory={setSelectedCategory}
            onViewToolDetail={handleOpenToolDetail}
          />
        )}

        {activeTab === 'find' && (
          <FindTools 
            onOpenSafetyModal={handleOpenSafetyModal}
            onToggleCompare={handleToggleCompare}
            isCompared={isCompared}
            initialCategory={selectedCategory}
            initialPurpose={selectedPurpose}
            onViewToolDetail={handleOpenToolDetail}
          />
        )}

        {activeTab === 'purposes' && (
          <PurposesView 
            onSelectPurpose={handleSelectPurpose}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesView 
            onSelectCategory={handleSelectCategory}
          />
        )}

        {activeTab === 'trending' && (
          <TrendingView 
            onOpenSafetyModal={handleOpenSafetyModal}
            onToggleCompare={handleToggleCompare}
            isCompared={isCompared}
            onViewToolDetail={handleOpenToolDetail}
          />
        )}

        {activeTab === 'compare' && (
          <CompareView 
            compareIds={compareIds}
            onRemoveCompare={handleRemoveCompare}
            onClearCompare={handleClearCompare}
            onOpenSafetyModal={handleOpenSafetyModal}
            onAddComparePreset={handleAddComparePreset}
            onViewToolDetail={handleOpenToolDetail}
          />
        )}

        {activeTab === 'safety' && (
          <SafetyChecker />
        )}

        {activeTab === 'about' && (
          <AboutView />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard 
            onOpenSafetyModal={handleOpenSafetyModal}
            onViewToolDetail={handleOpenToolDetail}
          />
        )}
      </main>

      {/* Global Tool Detail Modal */}
      {selectedToolDetail && (
        <ToolDetailModal 
          tool={selectedToolDetail}
          onClose={handleCloseToolDetail}
          onOpenSafetyModal={handleOpenSafetyModal}
          onToggleCompare={handleToggleCompare}
          isCompared={isCompared}
        />
      )}

      {/* Global Interstitial Pre-Flight Safety Gate Modal */}
      <SafetyModal 
        isOpen={safetyModal.isOpen}
        onClose={handleCloseSafetyModal}
        targetUrl={safetyModal.url}
        toolName={safetyModal.toolName}
      />

      {/* Footer */}
      <footer style={{
        background: 'rgba(6, 9, 15, 0.96)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '50px 20px 30px',
        color: 'var(--text-muted)'
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '32px',
          marginBottom: '40px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Sparkles size={20} color="#0df69e" />
              <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>AI TOOL FINDER</span>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '16px' }}>
              An intelligent, purpose-first AI discovery platform that matches natural language user goals to verified AI tools across 160+ vetted candidates.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#10b981' }}>
              <Shield size={16} />
              <span>Pre-Flight URL Safety Verified</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: '700', textTransform: 'uppercase', marginBottom: '14px' }}>
              Quick Navigation
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
              <li><button onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ color: 'var(--text-muted)' }}>Find My AI Tool</button></li>
              <li><button onClick={() => { setActiveTab('purposes'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ color: 'var(--text-muted)' }}>Browse by Purpose</button></li>
              <li><button onClick={() => { setActiveTab('find'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ color: 'var(--text-muted)' }}>160+ Tools Catalog</button></li>
              <li><button onClick={() => { setActiveTab('categories'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ color: 'var(--text-muted)' }}>Operational Categories</button></li>
              <li><button onClick={() => { setActiveTab('compare'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ color: 'var(--text-muted)' }}>Side-by-Side Compare</button></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: '700', textTransform: 'uppercase', marginBottom: '14px' }}>
              Trust & Transparency
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
              <li><button onClick={() => { setActiveTab('safety'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ color: 'var(--text-muted)' }}>AI URL Safety Checker</button></li>
              <li><button onClick={() => { setActiveTab('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ color: 'var(--text-muted)' }}>7-Factor Scoring Formula</button></li>
              <li><button onClick={() => { setActiveTab('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ color: 'var(--text-muted)' }}>Review Integrity Guarantee</button></li>
              <li><button onClick={() => { setActiveTab('admin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ color: 'var(--text-muted)' }}>Admin Database Console</button></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: '700', textTransform: 'uppercase', marginBottom: '14px' }}>
              Science Expo Differentiator
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
              "AI Tool Finder does not simply list AI tools. It understands the user's purpose, compares relevant tools using structured data, incorporates review signals, and verifies safety before opening links."
            </p>
          </div>
        </div>

        <div className="container" style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.8rem',
          color: 'var(--text-dim)'
        }}>
          <div>
            &copy; 2026 AI Tool Finder &bull; Science Expo Prototype &bull; Real Database Driven
          </div>
          <div>
            Built with React &bull; Express &bull; Heuristic ML Safety Gate
          </div>
        </div>
      </footer>
    </div>
  );
}
