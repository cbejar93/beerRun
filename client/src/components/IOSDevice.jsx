function IOSStatusBar({ dark = false, time = '9:41' }) {
  const c = dark ? '#fff' : '#000';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 24px 10px', boxSizing: 'border-box',
      position: 'relative', zIndex: 20, width: '100%',
    }}>
      <span style={{
        fontFamily: '-apple-system, "SF Pro", system-ui', fontWeight: 590,
        fontSize: 15, lineHeight: '22px', color: c,
      }}>{time}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="17" height="11" viewBox="0 0 17 11">
          <rect x="0" y="7" width="3" height="4" rx="0.6" fill={c}/>
          <rect x="4.5" y="4.5" width="3" height="6.5" rx="0.6" fill={c}/>
          <rect x="9" y="2" width="3" height="9" rx="0.6" fill={c}/>
          <rect x="13.5" y="0" width="3" height="11" rx="0.6" fill={c}/>
        </svg>
        <svg width="16" height="11" viewBox="0 0 16 11">
          <path d="M8 2.8C10.1 2.8 12 3.7 13.3 5.1L14.3 4.1C12.7 2.4 10.5 1.4 8 1.4C5.5 1.4 3.3 2.4 1.7 4.1L2.7 5.1C4 3.7 5.9 2.8 8 2.8Z" fill={c}/>
          <path d="M8 6.2C9.3 6.2 10.4 6.7 11.2 7.5L12.2 6.5C11.1 5.4 9.6 4.8 8 4.8C6.4 4.8 4.9 5.4 3.8 6.5L4.8 7.5C5.6 6.7 6.7 6.2 8 6.2Z" fill={c}/>
          <circle cx="8" cy="9.5" r="1.4" fill={c}/>
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke={c} strokeOpacity="0.35" fill="none"/>
          <rect x="2" y="2" width="18" height="8" rx="2" fill={c}/>
          <path d="M23 4V8C23.8 7.7 24.5 6.8 24.5 6C24.5 5.2 23.8 4.3 23 4Z" fill={c} fillOpacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}

export default function IOSDevice({ children, width = 390, height = 780, dark = false }) {
  return (
    <div style={{
      width, height, borderRadius: 48, overflow: 'hidden',
      position: 'relative', background: dark ? '#000' : '#F2F2F7',
      boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      flexShrink: 0,
    }}>
      {/* Dynamic Island */}
      <div style={{
        position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
        width: 120, height: 34, borderRadius: 20, background: '#000', zIndex: 50,
      }} />
      {/* Status bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <IOSStatusBar dark={dark} />
      </div>
      {/* Scrollable content */}
      <div style={{ height: '100%', paddingTop: 50, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
      </div>
      {/* Home indicator */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 60,
        height: 30, display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
        paddingBottom: 6, pointerEvents: 'none',
      }}>
        <div style={{
          width: 120, height: 5, borderRadius: 100,
          background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)',
        }} />
      </div>
    </div>
  );
}
