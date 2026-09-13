import React, { useState } from 'react';
import { 
  Sparkles, Compass, LayoutGrid, Flame, GitCompare, 
  ShieldAlert, Info, Menu, X, Sliders, Layers, Search 
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, compareCount }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'find', label: 'Explore Tools', icon: Search },
    { id: 'purposes', label: 'Purposes', icon: Layers },
    { id: 'categories', label: 'Categories', icon: LayoutGrid },
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'compare', label: 'Compare', icon: GitCompare, badge: compareCount > 0 ? compareCount : null },
    { id: 'safety', label: 'Safety Checker', icon: ShieldAlert },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(6, 9, 15, 0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '74px'
      }}>
        {/* Brand Logo & Name */}
        <div 
          onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer'
          }}
        >
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '13px',
            background: 'linear-gradient(135deg, rgba(13, 246, 158, 0.25) 0%, rgba(6, 182, 212, 0.25) 100%)',
            border: '1px solid rgba(13, 246, 158, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(13, 246, 158, 0.3)'
          }}>
            <Sparkles size={22} color="#0df69e" />
          </div>
          <div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: '800',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>AI TOOL FINDER</span>
              <span style={{
                fontSize: '0.65rem',
                padding: '2px 6px',
                borderRadius: '6px',
                background: 'rgba(13, 246, 158, 0.15)',
                color: '#0df69e',
                border: '1px solid rgba(13, 246, 158, 0.3)',
                fontWeight: '700'
              }}>EXPO</span>
            </div>
            <div style={{
              fontSize: '0.72rem',
              color: 'var(--text-dim)',
              letterSpacing: '0.02em'
            }}>
              Purpose Detection &bull; Review Analysis &bull; Safety Verified
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: '6px'
        }} className="desktop-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontSize: '0.86rem',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? '#0df69e' : 'var(--text-muted)',
                  background: isActive ? 'rgba(13, 246, 158, 0.1)' : 'transparent',
                  border: isActive ? '1px solid rgba(13, 246, 158, 0.25)' : '1px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} />
                <span>{item.label}</span>
                {item.badge && (
                  <span style={{
                    padding: '1px 6px',
                    borderRadius: '99px',
                    background: '#0df69e',
                    color: '#06090f',
                    fontSize: '0.68rem',
                    fontWeight: '700',
                    marginLeft: '2px'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Admin Dashboard Button */}
          <button
            onClick={() => setActiveTab('admin')}
            style={{
              marginLeft: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: activeTab === 'admin' ? '#ffffff' : 'var(--text-dim)',
              background: activeTab === 'admin' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.2s ease'
            }}
            title="Admin Management Console"
          >
            <Sliders size={14} />
            <span>Admin</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="mobile-toggle">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              padding: '8px',
              color: 'var(--text-main)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-card)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? '#0df69e' : 'var(--text-main)',
                  background: isActive ? 'rgba(13, 246, 158, 0.12)' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '99px',
                    background: '#0df69e',
                    color: '#06090f',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <button
            onClick={() => {
              setActiveTab('admin');
              setMobileMenuOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '10px',
              fontSize: '0.95rem',
              color: 'var(--text-muted)',
              borderTop: '1px solid var(--border-subtle)',
              marginTop: '6px'
            }}
          >
            <Sliders size={18} />
            <span>Admin Console</span>
          </button>
        </div>
      )}

      <style>{`
        @media (min-width: 980px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
