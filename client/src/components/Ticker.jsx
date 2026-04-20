import { memo } from 'react';

const ITEMS = [
  'CHUG RESPONSIBLY',
  'DNF = DID NOT FINISH YOUR BEER',
  'BYO BREW',
  'SUNSCREEN IS NOT OPTIONAL',
  'PACE YOURSELF',
  'LAKE MERRITT · OAKLAND CA',
  'NO PUKING AT THE PERGOLA',
  'WALKERS WELCOME',
];

const Ticker = memo(function Ticker() {
  const repeated = [...ITEMS, ...ITEMS];
  return (
    <div className="ticker">
      <div className="ticker-track">
        {repeated.map((t, i) => (
          <span key={i}>
            {t}
            <span className="dot" />
          </span>
        ))}
      </div>
    </div>
  );
});

export default Ticker;
