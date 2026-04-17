const ITEMS = [
  'CHUG RESPONSIBLY',
  'DNF = DID NOT FINISH YOUR BEER',
  'BYO BREW (NO WHITE CLAWS)',
  'SUNSCREEN IS NOT OPTIONAL',
  'PACE YOURSELF',
  'LAKE MERRITT · OAKLAND CA',
  'NO PUKING AT THE PERGOLA',
  'WALKERS WELCOME',
];

export default function Ticker() {
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
}
