import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, ExternalLink, X, Lock, AlertTriangle } from 'lucide-react';

export default function SafetyModal({ isOpen, onClose, targetUrl, toolName }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !targetUrl) {
      setReport(null);
      return;
    }

    const runSafetyCheck = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/safety/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetUrl })
        });
        const data = await res.json();
        setReport(data);
      } catch (err) {
        console.error('Safety gate check error:', err);
      } finally {
        setLoading(false);
      }
    };

    runSafetyCheck();
  }, [isOpen, targetUrl]);

  if (!isOpen) return null;

  const handleProceed = () => {
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      onClose();
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '32px', position: 'relative' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            color: 'var(--text-dim)',
            padding: '4px',
            borderRadius: '6px'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(13, 246, 158, 0.15)',
            border: '1px solid rgba(13, 246, 158, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={24} color="#0df69e" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>
              Safety Verification Gate
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Pre-flight security scan before navigating outside AI Explore
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Verifying domain authenticity & SSL encryption...
          </div>
        ) : report ? (
          <div>
            {/* Target Destination Box */}
            <div style={{
              padding: '14px 18px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>
                Destination: {toolName || 'External Tool'}
              </div>
              <div style={{ fontSize: '0.95rem', color: '#ffffff', wordBreak: 'break-all', fontWeight: '600' }}>
                {report.normalizedUrl}
              </div>
            </div>

            {/* Safety Assessment Summary */}
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              background: 
                report.decision === 'BLOCK' ? 'rgba(239, 68, 68, 0.1)' :
                report.decision === 'WARN' ? 'rgba(245, 158, 11, 0.1)' :
                'rgba(16, 185, 129, 0.1)',
              border: 
                report.decision === 'BLOCK' ? '1px solid rgba(239, 68, 68, 0.3)' :
                report.decision === 'WARN' ? '1px solid rgba(245, 158, 11, 0.3)' :
                '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                {report.decision === 'BLOCK' ? <ShieldX size={18} color="#ef4444" /> :
                 report.decision === 'WARN' ? <AlertTriangle size={18} color="#f59e0b" /> :
                 <ShieldCheck size={18} color="#10b981" />}
                <span style={{ fontWeight: '700', fontSize: '0.92rem', color: 
                  report.decision === 'BLOCK' ? '#ef4444' :
                  report.decision === 'WARN' ? '#f59e0b' : '#10b981' 
                }}>
                  {report.statusText}
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Official Domain Verified: <strong>{report.features.isVerifiedOfficial ? 'Yes (Whitelisted)' : 'Third-Party'}</strong> &bull; HTTPS: <strong>{report.features.isHttps ? 'Encrypted' : 'Insecure'}</strong>
              </div>
            </div>

            {/* ML Probability Badges */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '24px',
              fontSize: '0.8rem',
              color: 'var(--text-dim)'
            }}>
              <div>Low-risk Probability: <strong style={{ color: '#10b981' }}>{report.probabilities.lowRisk}%</strong></div>
              <div>Risk Score: <strong>{report.riskScore}/100</strong></div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={onClose} style={{ padding: '10px 18px' }}>
                Cancel
              </button>

              {report.decision !== 'BLOCK' ? (
                <button className="btn-primary" onClick={handleProceed} style={{ padding: '10px 22px' }}>
                  <ExternalLink size={16} />
                  Proceed to Website
                </button>
              ) : (
                <button className="btn-primary" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                  Blocked for Safety
                </button>
              )}
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '16px', textAlign: 'center' }}>
              {report.disclaimer}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
