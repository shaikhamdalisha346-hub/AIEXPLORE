import React, { useState, useEffect } from 'react';
import { 
  Sliders, Plus, Edit2, Trash2, ShieldCheck, CheckCircle2, 
  X, RefreshCw, AlertTriangle, Flame, TrendingUp, Sparkles, Database, Layers, Eye 
} from 'lucide-react';

export default function AdminDashboard({ onOpenSafetyModal, onViewToolDetail }) {
  const [stats, setStats] = useState(null);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [activeTab, setActiveTab] = useState('tools'); // 'tools' | 'moderation' | 'external'
  const [moderationReviews, setModerationReviews] = useState([]);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [moderationLoading, setModerationLoading] = useState(false);
  const [moderationStats, setModerationStats] = useState(null);

  // External Reviews Management State
  const [externalReviews, setExternalReviews] = useState([]);
  const [externalSources, setExternalSources] = useState([]);
  const [externalLoading, setExternalLoading] = useState(false);
  const [externalFilter, setExternalFilter] = useState('all');
  const [showAddExternalModal, setShowAddExternalModal] = useState(false);
  const [externalFormData, setExternalFormData] = useState({
    toolId: 'gamma',
    sourceId: 'g2',
    sourceName: 'G2',
    sourceUrl: '',
    rating: 4.5,
    reviewCount: '',
    reviewTitle: '',
    reviewExcerpt: '',
    dataMethod: 'manual',
    isVerifiedByAdmin: false
  });
  const [formData, setFormData] = useState({
    name: '',
    category: 'Presentation / PPT',
    subcategory: '',
    description: '',
    purposes: 'Create Presentations',
    features: '1-Click AI Deck Generation, Interactive Embeds, Export to PPTX',
    pricing: 'Free tier / Pro $12/mo',
    freePlan: true,
    platforms: 'Web',
    officialWebsite: 'https://',
    verifiedOfficialDomain: '',
    developer: '',
    targetUsers: 'Students, Professionals',
    bestFor: 'College presentations, rapid pitch decks',
    pros: 'Fast generation, intuitive UI',
    cons: 'Advanced animations require paid plan',
    overallRating: 4.8,
    qualityScore: 92,
    trendScore: 90,
    popularityScore: 88,
    recentlyAdded: true,
    recentlyUpdated: false
  });

  const categories = [
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
    'AI Agents',
    'All-Rounder AI'
  ];

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, toolsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/tools?sort=newest')
      ]);

      const statsData = await statsRes.json();
      const toolsData = await toolsRes.json();

      setStats(statsData);
      setTools(toolsData.tools || []);
      if (statsData.reviews) {
        setModerationStats(statsData.reviews);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchModerationReviews = async (status = reviewFilter) => {
    setModerationLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?status=${status}`);
      const data = await res.json();
      setModerationReviews(data.reviews || []);
      if (data.stats) {
        setModerationStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching moderation reviews:', err);
    } finally {
      setModerationLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (activeTab === 'moderation') {
      fetchModerationReviews(reviewFilter);
    }
  }, [activeTab, reviewFilter]);

  const handleApproveReview = async (reviewId) => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' })
      });
      if (!res.ok) throw new Error('Failed to approve review');
      fetchModerationReviews(reviewFilter);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveReview = async (reviewId) => {
    const reason = window.prompt('Please enter moderation reason for removing this review:', 'Violated community guidelines');
    if (reason === null) return;
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'removed', moderationReason: reason })
      });
      if (!res.ok) throw new Error('Failed to remove review');
      fetchModerationReviews(reviewFilter);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete review');
      fetchModerationReviews(reviewFilter);
    } catch (err) {
      alert(err.message);
    }
  };

  // External Reviews API Handlers (Section 14)
  const fetchExternalData = async () => {
    setExternalLoading(true);
    try {
      const [revRes, srcRes] = await Promise.all([
        fetch('/api/admin/external-reviews'),
        fetch('/api/admin/external-sources')
      ]);
      const revData = await revRes.json();
      const srcData = await srcRes.json();
      setExternalReviews(revData.reviews || []);
      setExternalSources(srcData || []);
    } catch (err) {
      console.error('Error fetching external reviews data:', err);
    } finally {
      setExternalLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'external') {
      fetchExternalData();
    }
  }, [activeTab]);

  const handleSaveExternalReview = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/external-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(externalFormData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save external review');
      setShowAddExternalModal(false);
      fetchExternalData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteExternalReview = async (id) => {
    if (!window.confirm('Delete this external review record?')) return;
    try {
      const res = await fetch(`/api/admin/external-reviews/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      fetchExternalData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleExternalVerification = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'needs_verification' : 'active';
      const res = await fetch(`/api/admin/external-reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, isVerifiedByAdmin: newStatus === 'active' })
      });
      if (!res.ok) throw new Error('Failed to update verification status');
      fetchExternalData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenAdd = () => {
    setEditingTool(null);
    setFormData({
      name: '',
      category: 'Presentation / PPT',
      subcategory: 'AI Slide Maker',
      description: '',
      purposes: 'Create Presentations',
      features: '1-Click Generation, Custom Templates, Export to PPTX',
      pricing: 'Free plan available / $10/mo',
      freePlan: true,
      platforms: 'Web',
      officialWebsite: 'https://',
      verifiedOfficialDomain: '',
      developer: 'Independent',
      targetUsers: 'Students, Professionals',
      bestFor: 'Quick presentations, students',
      pros: 'Fast output, clean templates',
      cons: 'Watermark on free tier',
      overallRating: 4.7,
      qualityScore: 90,
      trendScore: 88,
      popularityScore: 85,
      recentlyAdded: true,
      recentlyUpdated: false
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (tool) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name,
      category: tool.category,
      subcategory: tool.subcategory,
      description: tool.description,
      purposes: Array.isArray(tool.purposes) ? tool.purposes.join(', ') : (tool.purposes || ''),
      features: Array.isArray(tool.features) ? tool.features.join(', ') : tool.features,
      pricing: tool.pricing,
      freePlan: tool.freePlan,
      platforms: Array.isArray(tool.platforms) ? tool.platforms.join(', ') : tool.platforms,
      officialWebsite: tool.officialWebsite,
      verifiedOfficialDomain: tool.verifiedOfficialDomain || tool.officialDomain,
      developer: tool.developer || tool.company,
      targetUsers: Array.isArray(tool.targetUsers) ? tool.targetUsers.join(', ') : tool.targetUsers,
      bestFor: Array.isArray(tool.bestFor) ? tool.bestFor.join(', ') : (tool.bestFor || ''),
      pros: Array.isArray(tool.pros) ? tool.pros.join(', ') : (tool.pros || ''),
      cons: Array.isArray(tool.cons) ? tool.cons.join(', ') : (tool.cons || ''),
      overallRating: tool.overallRating || 4.6,
      qualityScore: tool.qualityScore || 90,
      trendScore: tool.trendScore || 85,
      popularityScore: tool.popularityScore || 85,
      recentlyAdded: Boolean(tool.recentlyAdded),
      recentlyUpdated: Boolean(tool.recentlyUpdated)
    });
    setShowAddModal(true);
  };

  const handleSaveTool = async (e) => {
    e.preventDefault();
    try {
      const url = editingTool ? `/api/admin/tools/${editingTool.id}` : '/api/admin/tools';
      const method = editingTool ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to save tool.');
        return;
      }

      setShowAddModal(false);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Error communicating with server.');
    }
  };

  const handleDeleteTool = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}" from the AI Tool Finder database?`)) return;

    try {
      const res = await fetch(`/api/admin/tools/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAdminData();
      } else {
        alert('Failed to delete tool.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickVerifyDomain = async (id, currentUrl) => {
    try {
      const domain = new URL(currentUrl.startsWith('http') ? currentUrl : 'https://' + currentUrl).hostname.replace(/^www\./, '');
      const res = await fetch('/api/admin/verify-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          verifiedDomain: domain,
          status: 'Low Risk — No known suspicious indicators detected.'
        })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTools = tools.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase()) ||
    (t.officialDomain && t.officialDomain.toLowerCase().includes(search.toLowerCase()))
  );

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
            background: 'rgba(255, 255, 255, 0.08)',
            color: 'var(--text-main)',
            fontSize: '0.8rem',
            fontWeight: '700',
            marginBottom: '12px'
          }}>
            <Sliders size={14} />
            DATABASE & CURATION CONTROL
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '800', marginBottom: '8px' }}>
            Admin Control Center
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            Manage tools database, audit domains, and moderate real community reviews.
          </p>
        </div>

        {activeTab === 'tools' && (
          <button className="btn-primary" onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} />
            Add New AI Tool
          </button>
        )}
      </div>

      {/* Admin Tab Switcher */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '32px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '12px'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('tools')}
          style={{
            padding: '10px 22px',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '0.92rem',
            cursor: 'pointer',
            border: activeTab === 'tools' ? '1px solid #0df69e' : '1px solid transparent',
            background: activeTab === 'tools' ? 'rgba(13, 246, 158, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            color: activeTab === 'tools' ? '#0df69e' : 'var(--text-muted)',
            transition: 'all 0.15s ease'
          }}
        >
          Tools Catalog ({tools.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('moderation')}
          style={{
            padding: '10px 22px',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '0.92rem',
            cursor: 'pointer',
            border: activeTab === 'moderation' ? '1px solid #0df69e' : '1px solid transparent',
            background: activeTab === 'moderation' ? 'rgba(13, 246, 158, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            color: activeTab === 'moderation' ? '#0df69e' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <span>Review Moderation</span>
          {moderationStats?.reported > 0 && (
            <span style={{
              padding: '2px 7px',
              borderRadius: '99px',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: '800'
            }}>
              {moderationStats.reported}
            </span>
          )}
        </button>

        {/* Section 14: External Review Sources Management */}
        <button
          type="button"
          onClick={() => setActiveTab('external')}
          style={{
            padding: '10px 22px',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '0.92rem',
            cursor: 'pointer',
            border: activeTab === 'external' ? '1px solid #0df69e' : '1px solid transparent',
            background: activeTab === 'external' ? 'rgba(13, 246, 158, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            color: activeTab === 'external' ? '#0df69e' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <span>External Review Sources</span>
          {externalReviews.length > 0 && (
            <span style={{
              padding: '2px 7px',
              borderRadius: '99px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'var(--text-main)',
              fontSize: '0.72rem',
              fontWeight: '700'
            }}>
              {externalReviews.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'tools' ? (
        <>
          {/* METRIC OVERVIEW CARDS */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
          marginBottom: '36px'
        }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>TOTAL TOOLS</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '4px', color: '#ffffff' }}>
              {stats.totalTools}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Catalog verified</div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>CATEGORIES</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '4px', color: '#0df69e' }}>
              {stats.totalCategories}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Operational domains</div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>PURPOSES</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '4px', color: '#06b6d4' }}>
              {stats.totalPurposes}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Goal taxonomies</div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>TRENDING (90+)</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '4px', color: '#f59e0b' }}>
              {stats.trendingTools}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>High momentum</div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>RECENTLY UPDATED</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '4px', color: '#8b5cf6' }}>
              {stats.recentlyUpdated}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Fresh metadata</div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>UNVERIFIED DOMAINS</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '4px', color: '#ef4444' }}>
              {stats.toolsRequiringVerification}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Requires audit</div>
          </div>
        </div>
      )}

      {/* Tools Table Filter */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog tools by name or domain..."
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-card)',
              color: '#ffffff',
              outline: 'none',
              fontSize: '0.9rem'
            }}
          />
        </div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredTools.length}</strong> of {tools.length} Tools
        </div>
      </div>

      {/* Tools Management Table */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: '10px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
              <th style={{ padding: '16px' }}>TOOL NAME</th>
              <th style={{ padding: '16px' }}>CATEGORY & PURPOSES</th>
              <th style={{ padding: '16px' }}>PRICING</th>
              <th style={{ padding: '16px' }}>OFFICIAL DOMAIN</th>
              <th style={{ padding: '16px' }}>RATING</th>
              <th style={{ padding: '16px' }}>TREND</th>
              <th style={{ padding: '16px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading database tools...
                </td>
              </tr>
            ) : filteredTools.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No tools found matching "{search}".
                </td>
              </tr>
            ) : (
              filteredTools.map(tool => (
                <tr key={tool.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '700', color: '#ffffff' }}>{tool.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>ID: {tool.id}</div>
                  </td>

                  <td style={{ padding: '16px' }}>
                    <div className="badge badge-green" style={{ fontSize: '0.72rem', display: 'inline-block' }}>
                      {tool.category}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                      {(tool.purposes || []).slice(0, 2).join(', ')}
                    </div>
                  </td>

                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.8rem' }}>{tool.pricing}</div>
                    <span className={tool.freePlan ? 'badge badge-green' : 'badge badge-neutral'} style={{ fontSize: '0.68rem', marginTop: '3px' }}>
                      {tool.freePlan ? 'Free Plan' : 'Paid'}
                    </span>
                  </td>

                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {tool.verifiedOfficialDomain ? (
                        <ShieldCheck size={14} color="#10b981" />
                      ) : (
                        <AlertTriangle size={14} color="#ef4444" />
                      )}
                      <span style={{ color: tool.verifiedOfficialDomain ? '#10b981' : '#f87171', fontSize: '0.82rem' }}>
                        {tool.verifiedOfficialDomain || tool.officialDomain || 'Unverified'}
                      </span>
                    </div>
                    {!tool.verifiedOfficialDomain && tool.officialWebsite && (
                      <button
                        onClick={() => handleQuickVerifyDomain(tool.id, tool.officialWebsite)}
                        style={{ fontSize: '0.7rem', color: '#0df69e', marginTop: '4px', textDecoration: 'underline' }}
                      >
                        Quick Verify
                      </button>
                    )}
                  </td>

                  <td style={{ padding: '16px', fontWeight: '700', color: '#f59e0b' }}>
                    ⭐ {tool.overallRating || 4.6}
                  </td>

                  <td style={{ padding: '16px' }}>
                    <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
                      <Flame size={11} style={{ marginRight: '2px' }} />
                      {tool.trendScore || 85}
                    </span>
                  </td>

                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {onViewToolDetail && (
                        <button
                          className="btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          onClick={() => onViewToolDetail(tool)}
                          title="Preview details modal"
                        >
                          <Eye size={13} />
                        </button>
                      )}
                      <button
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                        onClick={() => handleOpenEdit(tool)}
                        title="Edit tool data"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#ef4444' }}
                        onClick={() => handleDeleteTool(tool.id, tool.name)}
                        title="Delete tool"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </>
      ) : activeTab === 'moderation' ? (
      /* ========================================================================= */
      /* REVIEW MODERATION SECTION (Section 15: Admin Moderation)                  */
      /* ========================================================================= */
      <div>
        {/* Moderation Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          <div className="glass-panel" style={{ padding: '18px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>TOTAL REVIEWS</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '4px', color: '#ffffff' }}>
              {moderationStats?.total || 0}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Community submitted</div>
          </div>

          <div className="glass-panel" style={{ padding: '18px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>PUBLISHED</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '4px', color: '#10b981' }}>
              {moderationStats?.published || 0}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Visible on tool pages</div>
          </div>

          <div className="glass-panel" style={{ padding: '18px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>REPORTED / FLAGGED</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '4px', color: '#ef4444' }}>
              {moderationStats?.reported || 0}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Requires review</div>
          </div>

          <div className="glass-panel" style={{ padding: '18px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>REMOVED</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '4px', color: 'var(--text-muted)' }}>
              {moderationStats?.removed || 0}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Hidden from public</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Reviews' },
              { id: 'reported', label: `Reported (${moderationStats?.reported || 0})` },
              { id: 'published', label: 'Published' },
              { id: 'removed', label: 'Removed' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setReviewFilter(f.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: reviewFilter === f.id ? '1px solid #0df69e' : '1px solid var(--border-subtle)',
                  background: reviewFilter === f.id ? 'rgba(13, 246, 158, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: reviewFilter === f.id ? '#0df69e' : 'var(--text-muted)'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchModerationReviews(reviewFilter)}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Reviews Moderation Table */}
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                <th style={{ padding: '14px' }}>TOOL</th>
                <th style={{ padding: '14px' }}>REVIEWER</th>
                <th style={{ padding: '14px' }}>RATING</th>
                <th style={{ padding: '14px' }}>REVIEW CONTENT</th>
                <th style={{ padding: '14px' }}>STATUS & REPORTS</th>
                <th style={{ padding: '14px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {moderationLoading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading reviews...
                  </td>
                </tr>
              ) : moderationReviews.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No community reviews found under this filter.
                  </td>
                </tr>
              ) : (
                moderationReviews.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.86rem' }}>
                    <td style={{ padding: '14px', fontWeight: '700', color: '#0df69e' }}>
                      {r.toolId}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: '600' }}>{r.displayName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        {r.isAnonymous ? '(Anonymous)' : r.userId}
                      </div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ color: '#fbbf24', fontWeight: '700' }}>
                        ⭐ {r.rating}/5
                      </span>
                    </td>
                    <td style={{ padding: '14px', maxWidth: '320px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '2px' }}>
                        {r.reviewTitle}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {r.reviewText}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                        {r.useCase} &bull; {r.planType} Plan
                      </div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span className={
                        r.status === 'published' ? 'badge badge-green' : 
                        r.status === 'removed' ? 'badge badge-neutral' : 
                        'badge badge-yellow'
                      }>
                        {r.status}
                      </span>
                      {r.reportCount > 0 && (
                        <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '4px' }}>
                          ⚠️ {r.reportCount} report(s): {r.reports?.map(rep => rep.reason).join(', ')}
                        </div>
                      )}
                      {r.moderationReason && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                          Reason: {r.moderationReason}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        {r.status !== 'published' && (
                          <button
                            onClick={() => handleApproveReview(r.id)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              background: 'rgba(16, 185, 129, 0.15)',
                              border: '1px solid #10b981',
                              color: '#10b981',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}
                          >
                            Approve
                          </button>
                        )}

                        {r.status !== 'removed' && (
                          <button
                            onClick={() => handleRemoveReview(r.id)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid #ef4444',
                              color: '#ef4444',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}
                          >
                            Remove
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteReview(r.id)}
                          style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                          title="Permanently Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      ) : (
      /* ========================================================================= */
      /* EXTERNAL REVIEW SOURCES SECTION (Section 14: External Review Management)   */
      /* ========================================================================= */
      <div>
        {/* External Header Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 4px', color: 'var(--text-main)' }}>
              External Review Records
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', margin: 0 }}>
              External review records whose source/data has been verified by the administrator or obtained through an authorized/permitted data source.
            </p>
          </div>

          <button
            className="btn-primary"
            onClick={() => {
              setExternalFormData({
                toolId: tools[0]?.id || 'gamma',
                sourceId: 'g2',
                sourceName: 'G2',
                sourceUrl: '',
                rating: 4.5,
                reviewCount: '',
                reviewTitle: '',
                reviewExcerpt: '',
                dataMethod: 'manual',
                isVerifiedByAdmin: false
              });
              setShowAddExternalModal(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', fontSize: '0.88rem' }}
          >
            <Plus size={16} />
            <span>Add External Record</span>
          </button>
        </div>

        {/* External Table */}
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                <th style={{ padding: '14px' }}>TOOL ID</th>
                <th style={{ padding: '14px' }}>PLATFORM</th>
                <th style={{ padding: '14px' }}>RATING & COUNT</th>
                <th style={{ padding: '14px' }}>SOURCE URL</th>
                <th style={{ padding: '14px' }}>STATUS & METHOD</th>
                <th style={{ padding: '14px' }}>LAST VERIFIED</th>
                <th style={{ padding: '14px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {externalLoading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading external records...
                  </td>
                </tr>
              ) : externalReviews.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No external review records yet. Click "Add External Record" to attach verified G2/Capterra metadata.
                  </td>
                </tr>
              ) : (
                externalReviews.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.86rem' }}>
                    <td style={{ padding: '14px', fontWeight: '800', color: '#0df69e' }}>
                      {r.toolId}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: '700' }}>{r.sourceName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{r.sourceType}</div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ color: '#fbbf24', fontWeight: '800' }}>
                        ⭐ {r.rating}/{r.ratingScale || 5}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {r.reviewCount ? `${r.reviewCount.toLocaleString()} reviews` : 'Count unlisted'}
                      </div>
                    </td>
                    <td style={{ padding: '14px', maxWidth: '200px' }}>
                      <a 
                        href={r.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.sourceUrl}</span>
                        <ExternalLink size={10} style={{ flexShrink: 0 }} />
                      </a>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span className={r.status === 'active' ? 'badge badge-green' : 'badge badge-yellow'}>
                        {r.status}
                      </span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        {r.dataMethod}
                      </div>
                    </td>
                    <td style={{ padding: '14px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      {r.lastVerified || 'Not set'}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleToggleExternalVerification(r.id, r.status)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '5px',
                            background: r.status === 'active' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            border: r.status === 'active' ? '1px solid #f59e0b' : '1px solid #10b981',
                            color: r.status === 'active' ? '#f59e0b' : '#10b981',
                            cursor: 'pointer',
                            fontSize: '0.72rem',
                            fontWeight: '600'
                          }}
                        >
                          {r.status === 'active' ? 'Flag' : 'Verify'}
                        </button>
                        <button
                          onClick={() => handleDeleteExternalReview(r.id)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '5px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid #ef4444',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '0.72rem'
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* ADD EXTERNAL REVIEW RECORD MODAL (Section 14) */}
      {showAddExternalModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(3, 6, 12, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200,
          padding: '20px'
        }}>
          <div className="glass-panel animate-fade-in" style={{
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '30px',
            position: 'relative',
            background: 'var(--bg-surface)'
          }}>
            <button
              onClick={() => setShowAddExternalModal(false)}
              style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '16px' }}>
              Add External Review Record
            </h3>

            <form onSubmit={handleSaveExternalReview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Tool Selector across all 160 tools */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                  TARGET AI TOOL *
                </label>
                <select
                  value={externalFormData.toolId}
                  onChange={(e) => setExternalFormData({ ...externalFormData, toolId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: '#0c121e', border: '1px solid var(--border-card)', color: '#fff' }}
                >
                  {tools.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                  ))}
                </select>
              </div>

              {/* Source Platform */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    PLATFORM *
                  </label>
                  <select
                    value={externalFormData.sourceId}
                    onChange={(e) => {
                      const sel = externalSources.find(s => s.id === e.target.value);
                      setExternalFormData({
                        ...externalFormData,
                        sourceId: e.target.value,
                        sourceName: sel?.name || e.target.value
                      });
                    }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: '#0c121e', border: '1px solid var(--border-card)', color: '#fff' }}
                  >
                    {externalSources.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    RATING (0.0 - 5.0) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    required
                    value={externalFormData.rating}
                    onChange={(e) => setExternalFormData({ ...externalFormData, rating: parseFloat(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', color: '#fff' }}
                  />
                </div>
              </div>

              {/* Source URL & Review Count */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    SOURCE REVIEW URL (HTTPS ONLY) *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.g2.com/products/..."
                    value={externalFormData.sourceUrl}
                    onChange={(e) => setExternalFormData({ ...externalFormData, sourceUrl: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    REVIEW COUNT
                  </label>
                  <input
                    type="number"
                    value={externalFormData.reviewCount}
                    onChange={(e) => setExternalFormData({ ...externalFormData, reviewCount: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', color: '#fff' }}
                  />
                </div>
              </div>

              {/* Permitted Excerpt */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                  PERMITTED EXCERPT (OPTIONAL, SHORT PERMITTED QUOTE)
                </label>
                <textarea
                  rows={2}
                  value={externalFormData.reviewExcerpt}
                  onChange={(e) => setExternalFormData({ ...externalFormData, reviewExcerpt: e.target.value })}
                  placeholder="Short permitted quote or user summary..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', color: '#fff' }}
                />
              </div>

              {/* Data Method & Admin Verification */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    DATA ACQUISITION METHOD
                  </label>
                  <select
                    value={externalFormData.dataMethod}
                    onChange={(e) => setExternalFormData({ ...externalFormData, dataMethod: e.target.value })}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', background: '#0c121e', border: '1px solid var(--border-card)', color: '#fff', fontSize: '0.8rem' }}
                  >
                    <option value="manual">Manual Entry (Requires Admin Verification)</option>
                    <option value="permitted_public_data">Authorized / Permitted Source</option>
                  </select>
                </div>

                <div style={{ paddingTop: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={externalFormData.isVerifiedByAdmin}
                      onChange={(e) => setExternalFormData({ ...externalFormData, isVerifiedByAdmin: e.target.checked })}
                      style={{ accentColor: '#0df69e' }}
                    />
                    <span>Verified by Administrator</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddExternalModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT TOOL MODAL */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(3, 6, 12, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200,
          padding: '20px'
        }}>
          <div className="glass-panel animate-fade-in" style={{
            width: '100%',
            maxWidth: '740px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            position: 'relative',
            background: 'var(--bg-surface)'
          }}>
            <button
              onClick={() => setShowAddModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '20px' }}>
              {editingTool ? `Edit "${editingTool.name}"` : 'Add New AI Tool to Database'}
            </h2>

            <form onSubmit={handleSaveTool} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    TOOL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    DEVELOPER / COMPANY *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.developer}
                    onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    CATEGORY *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: '#0c121e', border: '1px solid var(--border-card)', color: '#fff' }}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    SUBCATEGORY
                  </label>
                  <input
                    type="text"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    placeholder="e.g. AI Presentation Maker"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                  DESCRIPTION *
                </label>
                <textarea
                  required
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                  PURPOSES (Comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.purposes}
                  onChange={(e) => setFormData({ ...formData, purposes: e.target.value })}
                  placeholder="e.g. Create Presentations, Summarize PDFs, College presentations"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                  KEY FEATURES (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="e.g. 1-Click AI Deck Generation, Export to PPTX, Interactive Embeds"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    OFFICIAL WEBSITE URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.officialWebsite}
                    onChange={(e) => setFormData({ ...formData, officialWebsite: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    VERIFIED OFFICIAL DOMAIN *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.verifiedOfficialDomain}
                    onChange={(e) => setFormData({ ...formData, verifiedOfficialDomain: e.target.value })}
                    placeholder="e.g. gamma.app"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    PRICING TEXT
                  </label>
                  <input
                    type="text"
                    value={formData.pricing}
                    onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                    placeholder="e.g. Free tier / Pro $12/mo"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '22px' }}>
                  <input
                    type="checkbox"
                    id="admin-free-plan"
                    checked={formData.freePlan}
                    onChange={(e) => setFormData({ ...formData, freePlan: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#0df69e' }}
                  />
                  <label htmlFor="admin-free-plan" style={{ fontSize: '0.85rem' }}>Free Plan Available</label>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    OVERALL RATING (1-5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.overallRating}
                    onChange={(e) => setFormData({ ...formData, overallRating: parseFloat(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    TREND SCORE (1-100)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.trendScore}
                    onChange={(e) => setFormData({ ...formData, trendScore: parseInt(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    QUALITY SCORE (1-100)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.qualityScore}
                    onChange={(e) => setFormData({ ...formData, qualityScore: parseInt(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTool ? 'Save Changes' : 'Add Tool to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
