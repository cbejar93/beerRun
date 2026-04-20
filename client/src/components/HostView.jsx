import { useState, useMemo, useEffect } from 'react';
import { mergeRsvps } from '../data/mergeRsvps';
import Runners from './Runners';

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

        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>
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
                </li>
              ))}
            </ul>
            <form onSubmit={addTask} style={{ display: 'flex', gap: 8, marginTop: 14 }}>
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
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
      <Runners apiRsvps={apiRsvps} />

    </>
  );
}
