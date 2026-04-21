import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { mergeRsvps } from '../data/mergeRsvps';
import Runners from './Runners';

function formatElapsed(ms) {
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function FinishLine({ apiRsvps, authFetch }) {
  const [raceStart, setRaceStart] = useState(null);
  const [raceEnd, setRaceEnd] = useState(null);
  const [results, setResults] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [resetting, setResetting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const pauseOffsetRef = useRef(0); // total ms spent paused
  const pausedAtRef = useRef(null); // when current pause started

  const combined = useMemo(() => mergeRsvps(apiRsvps), [apiRsvps]);
  const goingNames = combined.filter(r => r.status === 'going').map(r => r.name);
  const finishedNames = new Set(results.map(r => r.name.toLowerCase()));
  const remaining = goingNames.filter(n => !finishedNames.has(n.toLowerCase()));

  useEffect(() => {
    fetch('/api/results')
      .then(r => r.json())
      .then(data => {
        if (data.startedAt) {
          const start = new Date(data.startedAt);
          setRaceStart(start);
          if (data.endedAt) {
            const end = new Date(data.endedAt);
            setRaceEnd(end);
            setElapsed(end.getTime() - start.getTime());
          }
        }
        setResults(data.results || []);
      })
      .catch(() => {});
  }, []);

  // Timer ticks only when race is running and not paused/ended
  useEffect(() => {
    if (!raceStart || raceEnd || isPaused) return;
    const id = setInterval(
      () => setElapsed(Date.now() - raceStart.getTime() - pauseOffsetRef.current),
      500,
    );
    return () => clearInterval(id);
  }, [raceStart, raceEnd, isPaused]);

  const togglePause = () => {
    if (!isPaused) {
      pausedAtRef.current = Date.now();
      setIsPaused(true);
    } else {
      if (pausedAtRef.current) {
        pauseOffsetRef.current += Date.now() - pausedAtRef.current;
        pausedAtRef.current = null;
      }
      setIsPaused(false);
    }
  };

  const startRace = async () => {
    const res = await authFetch('/api/results/start', { method: 'POST' });
    const data = await res.json();
    pauseOffsetRef.current = 0;
    pausedAtRef.current = null;
    setIsPaused(false);
    setRaceStart(new Date(data.startedAt));
    setRaceEnd(null);
    setResults([]);
    setElapsed(0);
  };

  const endRace = async () => {
    // Finalize any active pause so the snapshot is accurate
    if (isPaused && pausedAtRef.current) {
      pauseOffsetRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    const snapshot = Date.now() - raceStart.getTime() - pauseOffsetRef.current;
    setElapsed(snapshot);
    setIsPaused(true); // freeze timer immediately
    const res = await authFetch('/api/results/end', { method: 'POST' });
    const data = await res.json();
    setRaceEnd(new Date(data.endedAt));
  };

  const resetRace = async () => {
    if (!confirm('Wipe this year\'s race data? This cannot be undone.')) return;
    setResetting(true);
    await authFetch('/api/results/start', { method: 'DELETE' });
    pauseOffsetRef.current = 0;
    pausedAtRef.current = null;
    setIsPaused(false);
    setRaceStart(null);
    setRaceEnd(null);
    setResults([]);
    setElapsed(0);
    setResetting(false);
  };

  const recordFinish = async (name) => {
    const res = await authFetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const entry = await res.json();
      setResults(prev => [...prev, entry]);
    }
  };

  const undoFinish = async (id) => {
    await authFetch(`/api/results/${id}`, { method: 'DELETE' });
    setResults(prev => prev.filter(r => r._id !== id));
  };

  return (
    <section className="section" style={{ borderTop: '2px solid var(--rule)' }}>
      <div className="sec-head">
        <div>
          <div className="sec-num">H.02 / FINISH LINE</div>
          <h2 className="sec-title">Tap as they cross.</h2>
        </div>
        <p className="sec-desc">
          Start the timer when the gun goes off, then tap each runner's card as they finish.{' '}
          <Link to="/results" target="_blank" style={{ color: 'var(--punch)', textDecoration: 'none' }}>
            Public results page ↗
          </Link>
        </p>
      </div>

      {!raceStart ? (
        <button
          onClick={startRace}
          style={{
            width: '100%', padding: '32px 24px',
            background: 'var(--stout)', color: 'var(--paper)',
            border: '3px solid var(--rule)', borderRadius: 16,
            fontFamily: "'Anton', sans-serif", fontSize: 48,
            textTransform: 'uppercase', letterSpacing: '0.04em',
            cursor: 'pointer', transition: 'transform 0.1s',
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          START RACE
        </button>
      ) : (
        <>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 24, padding: '16px 24px',
            border: `2px solid ${raceEnd ? 'var(--muted)' : 'var(--rule)'}`,
            borderRadius: 14,
            background: raceEnd ? 'color-mix(in oklab, var(--muted), transparent 90%)' : 'var(--card)',
          }}>
            <div>
              <div className="mono" style={{ fontSize: 11, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                {raceEnd ? 'Final time' : 'Elapsed'}
              </div>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 52, lineHeight: 1, letterSpacing: '0.02em' }}>
                {formatElapsed(elapsed)}
              </div>
              {raceEnd && (
                <div className="mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginTop: 4 }}>
                  Race ended
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
              <div style={{ textAlign: 'right' }}>
                <div className="mono" style={{ fontSize: 11, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                  Finished
                </div>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 52, lineHeight: 1 }}>
                  {results.length}
                </div>
              </div>
              {!raceEnd && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={togglePause}
                    style={{
                      padding: '8px 18px',
                      background: isPaused ? 'var(--punch)' : 'none',
                      color: isPaused ? 'var(--punch-ink)' : 'var(--ink)',
                      border: `1.5px solid ${isPaused ? 'var(--punch)' : 'var(--rule)'}`,
                      borderRadius: 8,
                      fontFamily: "'Anton', sans-serif", fontSize: 15,
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                      cursor: 'pointer', transition: 'all 0.1s',
                    }}
                  >
                    {isPaused ? '▶ Resume' : '⏸ Pause'}
                  </button>
                  <button
                    onClick={endRace}
                    style={{
                      padding: '8px 18px',
                      background: 'var(--warn)', color: 'var(--paper)',
                      border: 'none', borderRadius: 8,
                      fontFamily: "'Anton', sans-serif", fontSize: 15,
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                      cursor: 'pointer', transition: 'opacity 0.1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    End Race
                  </button>
                </div>
              )}
            </div>
          </div>

          {remaining.length > 0 && (
            <>
              <div className="label" style={{ marginBottom: 12 }}>ON COURSE — {remaining.length} remaining</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 24 }}>
                {remaining.map(name => (
                  <button
                    key={name}
                    onClick={() => recordFinish(name)}
                    style={{
                      padding: '18px 14px', textAlign: 'center',
                      background: 'var(--card)', border: '2px solid var(--rule)',
                      borderRadius: 12, cursor: 'pointer',
                      fontFamily: "'Anton', sans-serif", fontSize: 17,
                      textTransform: 'uppercase', letterSpacing: '0.01em',
                      color: 'var(--ink)', lineHeight: 1.2,
                      transition: 'all 0.1s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--punch)'; e.currentTarget.style.borderColor = 'var(--punch)'; e.currentTarget.style.color = 'var(--punch-ink)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--card)'; e.currentTarget.style.borderColor = 'var(--rule)'; e.currentTarget.style.color = 'var(--ink)'; }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </>
          )}

          {results.length > 0 && (
            <>
              <div className="label" style={{ marginBottom: 12 }}>FINISHERS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
                {results.map((r, i) => {
                  const ms = raceStart ? new Date(r.finishedAt).getTime() - raceStart.getTime() : 0;
                  return (
                    <div key={r._id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px', borderRadius: 10,
                      background: i === 0 ? 'color-mix(in oklab, var(--amber), transparent 85%)' : 'var(--card)',
                      border: `1.5px solid ${i === 0 ? 'var(--amber)' : 'var(--rule)'}`,
                    }}>
                      <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 18, width: 32, flexShrink: 0 }}>#{i + 1}</span>
                      <span style={{ flex: 1, fontFamily: "'Anton', sans-serif", textTransform: 'uppercase', fontSize: 16 }}>{r.name}</span>
                      <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{formatElapsed(ms)}</span>
                      <button
                        onClick={() => undoFinish(r._id)}
                        title="Undo"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 16, opacity: 0.4, padding: '0 2px', flexShrink: 0 }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
                      >×</button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <button
            onClick={resetRace}
            disabled={resetting}
            style={{
              background: 'none', border: '1.5px solid var(--rule)', borderRadius: 8,
              padding: '8px 16px', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em',
              color: 'var(--muted)', opacity: resetting ? 0.4 : 0.6,
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
          >
            Reset race
          </button>
        </>
      )}
    </section>
  );
}

function AddRunner({ onAdd, authFetch }) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('going');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setResult(null);
    try {
      const res = await authFetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), status, beer: note.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ error: data.error || 'Failed to add' });
      } else {
        setResult({ ok: true, name: data.name });
        setName('');
        setNote('');
        onAdd?.();
      }
    } catch {
      setResult({ error: 'Request failed' });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1.5px solid var(--rule)', background: 'var(--paper)',
    color: 'var(--ink)', fontFamily: 'Inter, sans-serif', fontSize: 14,
    boxSizing: 'border-box', outline: 'none',
  };

  return (
    <div className="kpi" style={{ padding: 24 }}>
      <div className="label">ADD RUNNER</div>
      <form onSubmit={submit} style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          value={name} onChange={e => setName(e.target.value)}
          placeholder="Full name" style={inputStyle} required
        />
        <input
          value={note} onChange={e => setNote(e.target.value)}
          placeholder="Mile time / fun fact (optional)" style={inputStyle}
        />
        <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="going">Going</option>
          <option value="maybe">Maybe</option>
          <option value="out">Out</option>
        </select>
        <button type="submit" disabled={saving} style={{
          padding: '11px', background: 'var(--stout)', color: 'var(--paper)',
          border: 'none', borderRadius: 10, fontFamily: "'Anton', sans-serif",
          fontSize: 18, textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer',
          letterSpacing: '0.02em', opacity: saving ? 0.6 : 1,
        }}>
          {saving ? 'Adding…' : 'Add Runner →'}
        </button>
        {result && (
          <div style={{
            padding: '10px 14px', borderRadius: 8, fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.06em',
            background: result.error ? 'color-mix(in oklab, var(--warn), transparent 85%)' : 'color-mix(in oklab, var(--punch), transparent 80%)',
          }}>
            {result.error ? `⚠ ${result.error}` : `✓ ${result.name} added`}
          </div>
        )}
      </form>
    </div>
  );
}

export default function HostView({ apiRsvps = [], onImport, authFetch = fetch }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newDue, setNewDue] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    fetch('/api/tasks').then(r => r.json()).then(setTasks).catch(() => {});
  }, []);

  const toggleTask = async (task) => {
    const updated = { ...task, done: !task.done };
    setTasks(prev => prev.map(t => t._id === task._id ? updated : t));
    await authFetch(`/api/tasks/${task._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: updated.done }),
    });
  };

  const deleteTask = async (id) => {
    setTasks(prev => prev.filter(t => t._id !== id));
    await authFetch(`/api/tasks/${id}`, { method: 'DELETE' });
  };

  const deleteRunner = async (id) => {
    await authFetch(`/api/rsvp/${id}`, { method: 'DELETE' });
    onImport?.();
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setAddingTask(true);
    try {
      const res = await authFetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ t: newTask.trim(), due: newDue.trim() }),
      });
      const task = await res.json();
      if (res.ok) {
        setTasks(prev => [...prev, task]);
        setNewTask('');
        setNewDue('');
      }
    } finally {
      setAddingTask(false);
    }
  };

  const handleFile = async (file) => {
    if (!file || !file.name.endsWith('.csv')) {
      setImportResult({ error: 'Please upload a .csv file' });
      return;
    }
    setImporting(true);
    setImportResult(null);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await authFetch('/api/rsvp/import', { method: 'POST', body: form });
      const data = await res.json();
      setImportResult(data);
      if (data.imported > 0) onImport?.();
    } catch {
      setImportResult({ error: 'Upload failed' });
    } finally {
      setImporting(false);
    }
  };

  const combined = useMemo(() => mergeRsvps(apiRsvps), [apiRsvps]);
  const going = combined.filter(r => r.status === 'going').length;
  const maybe = combined.filter(r => r.status === 'maybe').length;

  return (
    <>
      <section className="section">
        <div className="sec-head">
          <div>
            <div className="sec-num">H.01 / CONTROL ROOM</div>
            <h2 className="sec-title">You're the captain.<br />Don't crash the boat.</h2>
          </div>
          <p className="sec-desc">
            36 days out. Still time to panic. Everything you need to run
            the run, minus the actual running.
          </p>
        </div>

        <div className="host-grid">
          {[
            { label: 'Confirmed runners', val: going, delta: '+3 this week' },
            { label: 'On the fence', val: maybe, delta: 'chase them monday' },
            { label: 'Beer pledged (cans)', val: 117, delta: 'target: 180' },
          ].map((k, i) => (
            <div key={i} className="kpi">
              <div className="label">{k.label}</div>
              <div className="val">{k.val}</div>
              <div className="delta" style={k.warn ? { color: 'var(--warn)' } : undefined}>{k.delta}</div>
            </div>
          ))}
        </div>

        <div className="host-panel-grid">
          <div className="kpi" style={{ padding: 24 }}>
            <div className="label">NEXT ACTIONS</div>
            <ul style={{ margin: '10px 0 0 0', padding: 0, listStyle: 'none' }}>
              {tasks.map((task) => (
                <li key={task._id} onClick={() => toggleTask(task)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0', borderBottom: '1px solid color-mix(in oklab, var(--rule), transparent 85%)',
                  fontSize: 14, cursor: 'pointer',
                  textDecoration: task.done ? 'line-through' : 'none',
                  opacity: task.done ? 0.5 : 1,
                }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: 4,
                    border: '2px solid var(--rule)',
                    background: task.done ? 'var(--punch)' : 'transparent',
                    flexShrink: 0,
                  }} />
                  <span style={{ flex: 1 }}>{task.t}</span>
                  <span className="mono" style={{ fontSize: 11, opacity: 0.6 }}>{task.due}</span>
                  <button
                    onClick={e => { e.stopPropagation(); deleteTask(task._id); }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--muted)', fontSize: 16, lineHeight: 1,
                      padding: '0 2px', opacity: 0.4, flexShrink: 0,
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
                  >×</button>
                </li>
              ))}
            </ul>
            <form onSubmit={addTask} className="task-add-form">
              <input
                value={newTask} onChange={e => setNewTask(e.target.value)}
                placeholder="New task…"
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: 13,
                  border: '1.5px solid var(--rule)', background: 'var(--paper)',
                  color: 'var(--ink)', fontFamily: 'Inter, sans-serif', outline: 'none',
                }}
              />
              <input
                value={newDue} onChange={e => setNewDue(e.target.value)}
                placeholder="Due date"
                style={{
                  width: 100, padding: '8px 10px', borderRadius: 8, fontSize: 13,
                  border: '1.5px solid var(--rule)', background: 'var(--paper)',
                  color: 'var(--ink)', fontFamily: 'Inter, sans-serif', outline: 'none',
                }}
              />
              <button type="submit" disabled={addingTask} style={{
                padding: '8px 14px', borderRadius: 8,
                background: 'var(--stout)', color: 'var(--paper)',
                border: 'none', fontFamily: "'Anton', sans-serif",
                fontSize: 14, textTransform: 'uppercase', cursor: 'pointer',
                letterSpacing: '0.02em', whiteSpace: 'nowrap',
              }}>
                + Add
              </button>
            </form>
          </div>
          <div className="kpi" style={{ padding: 24 }}>
            <div className="label">BROADCAST</div>
            <textarea
              placeholder="Message to all confirmed runners..."
              style={{
                width: '100%', minHeight: 100, marginTop: 10, padding: 12,
                border: '1.5px solid var(--rule)', borderRadius: 10,
                background: 'var(--paper)', color: 'var(--ink)',
                font: 'inherit', fontSize: 14, resize: 'none',
                fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
              }}
              defaultValue="heads up — pick up your bib from the bandstand at 10:30. maya is bringing extra stout for the pergola stop. don't be late."
            />
            <button style={{
              marginTop: 10, width: '100%', padding: '12px',
              background: 'var(--stout)', color: 'var(--paper)',
              border: 'none', borderRadius: 10,
              fontFamily: 'Anton, sans-serif', fontSize: 18,
              textTransform: 'uppercase', cursor: 'pointer', letterSpacing: '0.02em',
            }}>
              Send to {going} runners →
            </button>
          </div>
        </div>
        {/* Add runner + CSV import */}
        <div className="host-panel-grid host-panel-grid--half">
          <AddRunner onAdd={onImport} authFetch={authFetch} />
          <div className="kpi" style={{ padding: 24 }}>
            <div className="label">IMPORT FROM PARTIFUL</div>
            <p style={{ margin: '8px 0 16px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
              Export your guest list from Partiful (event page → Guest List → Export CSV) and drop it here.
              Duplicate names are skipped automatically.
            </p>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => document.getElementById('csv-input').click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--punch)' : 'var(--rule)'}`,
                borderRadius: 12, padding: '28px 20px', textAlign: 'center',
                cursor: 'pointer', transition: 'border-color 0.15s',
                background: dragOver ? 'color-mix(in oklab, var(--punch), transparent 90%)' : 'var(--paper)',
              }}
            >
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, textTransform: 'uppercase', marginBottom: 6 }}>
                {importing ? 'Importing…' : 'Drop CSV or click to browse'}
              </div>
              <div className="mono" style={{ fontSize: 10, opacity: 0.5, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Accepts Partiful guest-list CSV · max 2 MB
              </div>
              <input
                id="csv-input" type="file" accept=".csv"
                style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files[0])}
              />
            </div>
            {importResult && (
              <div style={{
                marginTop: 12, padding: '12px 16px', borderRadius: 10,
                background: importResult.error ? 'color-mix(in oklab, var(--warn), transparent 85%)' : 'color-mix(in oklab, var(--punch), transparent 80%)',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {importResult.error
                  ? `⚠ ${importResult.error}`
                  : `✓ ${importResult.imported} imported · ${importResult.skipped} skipped · ${importResult.total} total in file`}
              </div>
            )}
          </div>
        </div>{/* end grid */}
      </section>
      <Runners apiRsvps={apiRsvps} onDelete={deleteRunner} />
      <FinishLine apiRsvps={apiRsvps} authFetch={authFetch} />
    </>
  );
}
