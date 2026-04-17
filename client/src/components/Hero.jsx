import Countdown from './Countdown';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-grid">
        <div>
          <div className="tagline">
            <span className="chip">OAK</span>
            <span>Lake Merritt · 3.4 mi loop · 3 beers · 1 finish line</span>
          </div>
          <h1>
            The 3rd<br />
            <span className="amber">Annual</span><br />
            Beer Run
          </h1>
          <p className="hero-sub">
            Three miles around Lake Merritt. One beer per mile. Zero dignity
            at the finish line. Bring your stretchiest sweatpants and a
            contingency plan for your 2pm.
          </p>
          <div className="hero-meta">
            <div>
              <span className="label">When</span>
              <span className="val">Sat, May 23 · 11:00 AM</span>
            </div>
            <div>
              <span className="label">Where</span>
              <span className="val">Lakeside Bandstand, Oakland</span>
            </div>
            <div>
              <span className="label">Dress code</span>
              <span className="val">Suspiciously on-theme</span>
            </div>
            <div>
              <span className="label">Cover</span>
              <span className="val">$15 + BYO Beer</span>
            </div>
          </div>
        </div>
        <div className="hero-right">
          <div className="stamp">
            <div className="stamp-inner">
              <div>
                <div className="stamp-label">EST. 2024 · VOL. III</div>
                <div className="big-num">
                  3.4<span style={{ fontSize: '0.5em', opacity: 0.7 }}>mi</span>
                </div>
                <div className="stamp-title">Lake Merritt Loop</div>
              </div>
              <div className="bottle-seal">Chug.<br />Run.<br />Repeat.</div>
            </div>
          </div>
          <Countdown />
        </div>
      </div>
    </section>
  );
}
