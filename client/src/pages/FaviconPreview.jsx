import { Link } from 'react-router-dom';

const SIZES = [
  { file: '/favicon-16.png',  display: 16,  label: '16px' },
  { file: '/favicon-32.png',  display: 32,  label: '32px' },
  { file: '/favicon-48.png',  display: 48,  label: '48px' },
  { file: '/favicon-64.png',  display: 64,  label: '64px' },
  { file: '/favicon-180.png', display: 96,  label: '180px', sub: 'apple-touch, @96' },
  { file: '/favicon-512.png', display: 128, label: '512px', sub: '@128' },
];

export default function FaviconPreview() {
  return (
    <div style={{
      margin: 0, minHeight: '100vh',
      background: '#2a2420', color: '#F5ECD7',
      fontFamily: "'Inter', system-ui, sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <div style={{ maxWidth: 900, width: '100%' }}>
        <h1 style={{
          fontFamily: "'Anton', sans-serif", fontSize: 56,
          margin: '0 0 8px', textTransform: 'uppercase', lineHeight: 1,
        }}>
          Favicon
        </h1>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
          opacity: 0.55, textTransform: 'uppercase', letterSpacing: '0.08em',
          marginBottom: 40,
        }}>
          Bottle-cap "3" · stout + lime · all sizes
        </div>

        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
          opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em',
          marginBottom: 14,
        }}>
          Sizes
        </div>
        <div style={{
          display: 'flex', gap: 32, alignItems: 'flex-end', flexWrap: 'wrap',
          marginBottom: 48, padding: 32,
          background: '#1F1410', borderRadius: 16, border: '1.5px solid #3a2e26',
        }}>
          {SIZES.map(s => (
            <div key={s.file} style={{
              textAlign: 'center', fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, opacity: 0.7, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              <img src={s.file} width={s.display} height={s.display}
                style={{ display: 'block', margin: '0 auto 8px', imageRendering: 'pixelated' }}
                alt={s.label}
              />
              {s.label}
              {s.sub && <><br /><span style={{ opacity: 0.5 }}>{s.sub}</span></>}
            </div>
          ))}
        </div>

        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
          opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em',
          marginBottom: 14,
        }}>
          In a tab
        </div>
        <div style={{
          background: '#1F1410', border: '1.5px solid #3a2e26',
          borderRadius: 14, padding: '12px 12px 0',
        }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { label: '3rd Annual Beer Run · Lake Merritt', dim: false },
              { label: 'Mobile Preview', dim: true },
            ].map((tab, i) => (
              <div key={i} style={{
                background: tab.dim ? '#2a1f19' : '#3a2e26',
                opacity: tab.dim ? 0.7 : 1,
                borderRadius: '10px 10px 0 0',
                padding: '10px 14px 10px 12px',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontSize: 13, color: '#F5ECD7', maxWidth: 260,
              }}>
                <img src="/favicon-32.png" width="16" height="16"
                  style={{ flexShrink: 0 }} alt="" />
                <span style={{
                  flex: 1, whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {tab.label}
                </span>
                <span style={{ opacity: 0.5, fontSize: 14 }}>×</span>
              </div>
            ))}
          </div>
        </div>

        <Link to="/" style={{
          display: 'inline-block', marginTop: 32,
          fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
          color: '#C8F03C', textDecoration: 'none',
          border: '1.5px solid #C8F03C', padding: '8px 14px',
          borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          ← Back to homepage
        </Link>
      </div>
    </div>
  );
}
