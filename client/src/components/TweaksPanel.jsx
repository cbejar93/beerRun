const THEMES = [
  { k: 'amber', l: 'Amber', preview: ['#F5ECD7', '#B8701C', '#1F1410'] },
  { k: 'stout', l: 'Stout', preview: ['#1F1410', '#E89944', '#C8F03C'] },
  { k: 'foam', l: 'Foam', preview: ['#FFFDF5', '#FF4E2A', '#1F1410'] },
];

export default function TweaksPanel({ open, theme, setTheme }) {
  if (!open) return null;
  return (
    <div className="tweaks">
      <h4>Tweaks</h4>
      <div className="label mono" style={{ fontSize: 10, opacity: 0.6, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Color theme
      </div>
      <div className="theme-opts">
        {THEMES.map(t => (
          <button
            key={t.k}
            className={`theme-swatch ${theme === t.k ? 'active' : ''}`}
            onClick={() => setTheme(t.k)}
          >
            <div className="preview">
              {t.preview.map((c, i) => <span key={i} style={{ background: c }} />)}
            </div>
            {t.l}
          </button>
        ))}
      </div>
    </div>
  );
}
