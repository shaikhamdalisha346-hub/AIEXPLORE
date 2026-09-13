import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, ShieldX, Search, CheckCircle2, 
  XCircle, AlertTriangle, Lock, Globe, ExternalLink, Info 
} from 'lucide-react';

export default function SafetyChecker() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const sampleUrls = [
    { label: 'Verified Official (Gamma)', url: 'https://gamma.app' },
    { label: 'Verified Official (Perplexity)', url: 'https://perplexity.ai' },
    { label: 'Suspicious / Phishing Pattern', url: 'http://free-gamma-ppt-generator-download.xyz/login.php' },
    { label: 'Unencrypted IP Address', url: 'http://192.168.1.1/chatgpt-free-premium' }
  ];

  const handleInspect = async (targetUrl) => {
    const checkUrl = targetUrl || url;
    if (!checkUrl || !checkUrl.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/safety/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: checkUrl.trim() })
      });

      if (!res.ok) {
        throw new Error('Failed to run safety analysis.');
      }

      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error(err);
      setError('Unable to analyze URL safety. Please check server connectivity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      {/* Heading */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
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
          <ShieldCheck size={14} />
          MALICIOUS URL & DOMAIN PREDICTOR
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '12px' }}>
          AI Tool Safety Checker
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
          Inspect any AI tool link, website URL, or download link against phishing indicators, typosquatting, and heuristic security rules.
        </p>
      </div>

      {/* URL Input Form */}
      <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto 36px' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleInspect(); }} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            flex: 1,
            minWidth: '280px',
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-md)',
            padding: '0 16px'
          }}>
            <Globe size={18} color="var(--text-dim)" style={{ marginRight: '10px' }} />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste any URL here (e.g. https://gamma.app or example.com)"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                padding: '14px 0',
                outline: 'none',
                fontSize: '1rem'
              }}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '14px 28px' }}>
            {loading ? 'Analyzing...' : 'Inspect URL'}
          </button>
        </form>

        {/* Preset Sample URLs */}
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>
            Quick Samples:
          </span>
          {sampleUrls.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setUrl(sample.url);
                handleInspect(sample.url);
              }}
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)'
              }}
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{
          maxWidth: '800px',
          margin: '0 auto 24px',
          padding: '14px 20px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: '#f87171'
        }}>
          {error}
        </div>
      )}

      {/* SAFETY REPORT RESULTS */}
      {report && (
        <div className="glass-panel animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '36px' }}>
          {/* Header Summary */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '28px'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                Normalized Target URL:
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', wordBreak: 'break-all' }}>
                {report.normalizedUrl}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Host: <strong>{report.hostname}</strong>
              </div>
            </div>

            {/* Risk Badge */}
            <div style={{ textAlign: 'right' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
                fontWeight: '700',
                background: 
                  report.riskLevel === 'Low Risk' ? 'rgba(16, 185, 129, 0.15)' :
                  report.riskLevel === 'Suspicious' ? 'rgba(245, 158, 11, 0.15)' :
                  'rgba(239, 68, 68, 0.15)',
                border: 
                  report.riskLevel === 'Low Risk' ? '1px solid #10b981' :
                  report.riskLevel === 'Suspicious' ? '1px solid #f59e0b' :
                  '1px solid #ef4444',
                color:
                  report.riskLevel === 'Low Risk' ? '#10b981' :
                  report.riskLevel === 'Suspicious' ? '#f59e0b' :
                  '#ef4444'
              }}>
                {report.riskLevel === 'Low Risk' && <ShieldCheck size={18} />}
                {report.riskLevel === 'Suspicious' && <AlertTriangle size={18} />}
                {report.riskLevel === 'High Risk' && <ShieldX size={18} />}
                <span>{report.riskLevel}</span>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                Risk Score: <strong>{report.riskScore}/100</strong>
              </div>
            </div>
          </div>

          {/* Decision Status Callout */}
          <div style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '28px',
            background: 
              report.decision === 'OPEN' ? 'rgba(16, 185, 129, 0.08)' :
              report.decision === 'WARN' ? 'rgba(245, 158, 11, 0.08)' :
              'rgba(239, 68, 68, 0.08)',
            borderLeft: 
              report.decision === 'OPEN' ? '4px solid #10b981' :
              report.decision === 'WARN' ? '4px solid #f59e0b' :
              '4px solid #ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>
                {report.statusText}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Verified Domain: {report.features.isVerifiedOfficial ? `Yes (${report.features.matchedOfficialDomain})` : 'Not in official whitelist'}
              </div>
            </div>

            <span className={
              report.decision === 'OPEN' ? 'badge badge-green' :
              report.decision === 'WARN' ? 'badge badge-yellow' :
              'badge badge-red'
            } style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
              Action: {report.decision}
            </span>
          </div>

          {/* ML Class Probabilities (Softmax) */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Machine Learning Classification Probabilities
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>Low Risk</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>{report.probabilities.lowRisk}%</div>
                <div className="score-bar-bg" style={{ marginTop: '6px' }}>
                  <div style={{ height: '100%', width: `${report.probabilities.lowRisk}%`, background: '#10b981' }} />
                </div>
              </div>

              <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '600' }}>Suspicious</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>{report.probabilities.suspicious}%</div>
                <div className="score-bar-bg" style={{ marginTop: '6px' }}>
                  <div style={{ height: '100%', width: `${report.probabilities.suspicious}%`, background: '#f59e0b' }} />
                </div>
              </div>

              <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '600' }}>Malicious</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>{report.probabilities.malicious}%</div>
                <div className="score-bar-bg" style={{ marginTop: '6px' }}>
                  <div style={{ height: '100%', width: `${report.probabilities.malicious}%`, background: '#ef4444' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Lexical Feature Inspection Breakdown */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '14px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Lexical & Security Features Analysis
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)' }}>
                <span>HTTPS Protocol</span>
                {report.features.isHttps ? (
                  <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                    <CheckCircle2 size={14} /> Valid
                  </span>
                ) : (
                  <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                    <XCircle size={14} /> Insecure (HTTP)
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)' }}>
                <span>Official Whitelist</span>
                {report.features.isVerifiedOfficial ? (
                  <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                    <CheckCircle2 size={14} /> Verified
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-dim)' }}>Unverified</span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)' }}>
                <span>IP Address Format</span>
                {report.features.isIpAddress ? (
                  <span style={{ color: '#ef4444', fontWeight: '600' }}>Raw IP Detected!</span>
                ) : (
                  <span style={{ color: '#10b981' }}>Clean Domain</span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)' }}>
                <span>High-Risk TLD (.xyz, .zip...)</span>
                {report.features.hasHighRiskTld ? (
                  <span style={{ color: '#ef4444', fontWeight: '600' }}>Risky TLD</span>
                ) : (
                  <span style={{ color: '#10b981' }}>Standard TLD</span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)' }}>
                <span>URL Length & Dots</span>
                <span>{report.features.urlLength} chars &bull; {report.features.dotCount} dots</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)' }}>
                <span>Suspicious Keywords</span>
                {report.features.foundKeywords && report.features.foundKeywords.length > 0 ? (
                  <span style={{ color: '#ef4444', fontWeight: '600' }}>
                    {report.features.foundKeywords.join(', ')}
                  </span>
                ) : (
                  <span style={{ color: '#10b981' }}>None detected</span>
                )}
              </div>
            </div>
          </div>

          {/* Required Disclaimer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            color: 'var(--text-dim)',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <Info size={15} color="var(--text-dim)" />
            <span>{report.disclaimer}</span>
          </div>
        </div>
      )}
    </div>
  );
}
