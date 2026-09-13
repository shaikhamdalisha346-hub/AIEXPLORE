import React from 'react';
import { ExternalLink, Plus, Check, ShieldCheck, Flame, Star, Eye } from 'lucide-react';

export default function ToolCard({ 
  tool, 
  onOpenSafetyModal, 
  onToggleCompare, 
  isCompared,
  onViewToolDetail
}) {
  const compared = isCompared(tool.id);

  return (
    <div className="glass-panel" style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative'
    }}>
      <div>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              fontWeight: '800',
              color: '#ffffff'
            }}>
              {tool.name.charAt(0)}
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', lineHeight: 1.2 }}>
                {tool.name}
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '3px' }}>
                {tool.category}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.8rem', fontWeight: '700', color: '#f59e0b' }}>
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
              {tool.overallRating || 4.6}
            </span>
            <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 6px' }}>
              <Flame size={12} />
              {tool.trendScore || 85}
            </span>
          </div>
        </div>

        {/* Verified domain info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.75rem',
          color: '#10b981',
          marginBottom: '10px'
        }}>
          <ShieldCheck size={14} />
          <span>{tool.verifiedOfficialDomain || tool.officialDomain || 'Verified Domain'}</span>
        </div>

        {/* Best For label */}
        {tool.bestFor && (
          <div style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            marginBottom: '12px',
            lineHeight: 1.4
          }}>
            <strong style={{ color: '#0df69e' }}>Best for: </strong>
            <span>
              {Array.isArray(tool.bestFor) ? tool.bestFor[0] : tool.bestFor}
            </span>
          </div>
        )}

        {/* Description */}
        <p style={{
          fontSize: '0.88rem',
          color: 'var(--text-muted)',
          marginBottom: '16px',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.5
        }}>
          {tool.description}
        </p>

        {/* Features Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          {(tool.features || []).slice(0, 3).map((f, idx) => (
            <span key={idx} style={{
              fontSize: '0.72rem',
              padding: '3px 8px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)'
            }}>
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Section */}
      <div>
        {/* Pricing & Free plan */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          padding: '10px 0',
          borderTop: '1px solid var(--border-subtle)',
          marginBottom: '14px'
        }}>
          <span style={{ color: 'var(--text-dim)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {tool.pricing}
          </span>
          <span className={tool.freePlan ? 'badge badge-green' : 'badge badge-yellow'}>
            {tool.freePlan ? 'Free Plan' : 'Paid / Trial'}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className="btn-primary"
            style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
            onClick={() => onOpenSafetyModal(tool.officialWebsite, tool.name)}
          >
            <ExternalLink size={14} />
            Official Link
          </button>

          {onViewToolDetail && (
            <button
              className="btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              onClick={() => onViewToolDetail(tool)}
              title="View full details and reviews"
            >
              <Eye size={15} />
            </button>
          )}

          <button
            className={compared ? 'btn-secondary' : 'btn-accent-outline'}
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            onClick={() => onToggleCompare(tool.id)}
            title={compared ? 'Remove from compare' : 'Add to compare'}
          >
            {compared ? <Check size={15} color="#0df69e" /> : <Plus size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}
