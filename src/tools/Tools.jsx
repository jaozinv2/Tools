import { useState, useEffect } from 'react'
import * as L from './lib.js'
const num = v => (v === '' ? NaN : Number(v))
const fmt = n => (Number.isFinite(n) ? +n.toPrecision(12) : '—')
const copy = t => navigator.clipboard?.writeText(String(t))
function F({ label, ...p }) { return <label className="f">{label}<input {...p} /></label> }
function Out({ children, text }) { return <div className="out"><div>{children}</div>{text !== undefined && <button onClick={() => copy(text)}>Copy</button>}</div> }
const useV = init => { const [s, set] = useState(init); return [s, k => e => set(o => ({ ...o, [k]: e.target.value }))] }

export function Percent() {
  const [s, on] = useV({ p: '', v: '', a: '', b: '' })
  return <><h3>X% of Y</h3><div className="row"><F label="Percent" type="number" value={s.p} onChange={on('p')} /><F label="Value" type="number" value={s.v} onChange={on('v')} /></div>
    <Out text={fmt(L.percentOf(num(s.p), num(s.v)))}>Result: <b>{fmt(L.percentOf(num(s.p), num(s.v)))}</b> <small>= {s.p||'p'} ÷ 100 × {s.v||'v'}</small></Out>
    <h3>A is what % of B</h3><div className="row"><F label="A" type="number" value={s.a} onChange={on('a')} /><F label="B" type="number" value={s.b} onChange={on('b')} /></div>
    <Out>{fmt(L.whatPercent(num(s.a), num(s.b)))}%</Out></>
}
export function Rule3() {
  const [s, on] = useV({ a: '', b: '', c: '' }); const [inv, setInv] = useState(false)
  const x = L.ruleOfThree(num(s.a), num(s.b), num(s.c), inv)
  return <><label><input type="checkbox" checked={inv} onChange={e => setInv(e.target.checked)} /> Inverse proportion</label>
    <div className="row"><F label="A" type="number" value={s.a} onChange={on('a')} /><F label="is to B" type="number" value={s.b} onChange={on('b')} /><F label="as C is to X" type="number" value={s.c} onChange={on('c')} /></div>
    <Out text={fmt(x)}>Formula: {inv ? 'X = (A × B) ÷ C' : 'X = (B × C) ÷ A'}<br />X = <b>{fmt(x)}</b></Out></>
}
export function Compound() {
  const [s, on] = useV({ P: '1000', r: '10', n: '12', t: '2' })
  const A = L.compound(num(s.P), num(s.r), num(s.n), num(s.t))
  return <><div className="row"><F label="Principal" type="number" value={s.P} onChange={on('P')} /><F label="Annual rate %" type="number" value={s.r} onChange={on('r')} /><F label="Times/year" type="number" value={s.n} onChange={on('n')} /><F label="Years" type="number" value={s.t} onChange={on('t')} /></div>
    <Out text={fmt(A)}>A = P(1 + r/n)^(n·t)<br />Final amount: <b>{fmt(A)}</b> · Interest: {fmt(A - num(s.P))}</Out></>
}
export function Converter() {
  const [cat, setCat] = useState('length'); const [v, setV] = useState('1')
  const keys = Object.keys(L.UNITS[cat]); const [from, setFrom] = useState('km'); const [to, setTo] = useState('m')
  const f = keys.includes(from) ? from : keys[0], t = keys.includes(to) ? to : keys[1]
  const r = L.convert(cat, num(v), f, t)
  return <><label className="f">Category<select value={cat} onChange={e => setCat(e.target.value)}>{Object.keys(L.UNITS).map(k => <option key={k}>{k}</option>)}</select></label>
    <div className="row"><F label="Value" type="number" value={v} onChange={e => setV(e.target.value)} />
      <label className="f">From<select value={f} onChange={e => setFrom(e.target.value)}>{keys.map(k => <option key={k}>{k}</option>)}</select></label>
      <button onClick={() => { setFrom(t); setTo(f) }} aria-label="Swap units">⇄</button>
      <label className="f">To<select value={t} onChange={e => setTo(e.target.value)}>{keys.map(k => <option key={k}>{k}</option>)}</select></label></div>
    <Out text={fmt(r)}><b>{fmt(r)}</b> {t}</Out></>
}
export function Password() {
  const [len, setLen] = useState(20); const [o, setO] = useState({ a: 1, A: 1, 1: 1, '!': 1 }); const [pw, setPw] = useState('')
  const S = { a: 'abcdefghijklmnopqrstuvwxyz', A: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 1: '0123456789', '!': '!@#$%^&*()-_=+[]{}' }
  const gen = () => setPw(L.password(len, Object.keys(S).filter(k => o[k]).map(k => S[k])))
  useEffect(gen, [])
  return <><F label={`Length: ${len}`} type="range" min="4" max="64" value={len} onChange={e => setLen(+e.target.value)} />
    <div className="row">{Object.keys(S).map(k => <label key={k}><input type="checkbox" checked={!!o[k]} onChange={e => setO({ ...o, [k]: e.target.checked })} /> {S[k].slice(0, 3)}…</label>)}</div>
    <button onClick={gen}>Generate</button><Out text={pw}><code>{pw || 'Select at least one set'}</code></Out><small>Uses crypto.getRandomValues. Nothing leaves your browser.</small></>
}
export function Hash() {
  const [t, setT] = useState(''); const [alg, setAlg] = useState('SHA-256'); const [h, setH] = useState('')
  useEffect(() => { L.hash(alg, t).then(setH) }, [t, alg])
  return <><textarea placeholder="Text to hash" value={t} onChange={e => setT(e.target.value)} />
    <select value={alg} onChange={e => setAlg(e.target.value)}>{['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'].map(a => <option key={a}>{a}</option>)}</select><Out text={h}><code>{h}</code></Out></>
}
export function Base64() {
  const [t, setT] = useState(''); const [o, setO] = useState(''); const [err, setErr] = useState('')
  const run = fn => { try { setO(fn(t)); setErr('') } catch { setErr('Invalid input for this operation.') } }
  return <><textarea value={t} onChange={e => setT(e.target.value)} placeholder="Input" /><div className="row"><button onClick={() => run(L.b64enc)}>Encode</button><button onClick={() => run(L.b64dec)}>Decode</button></div>
    {err && <p className="err" role="alert">{err}</p>}<Out text={o}><pre>{o}</pre></Out></>
}
export function Case() {
  const [t, setT] = useState('')
  return <><textarea value={t} onChange={e => setT(e.target.value)} /><div className="row">
    <button onClick={() => setT(t.toUpperCase())}>UPPER</button><button onClick={() => setT(t.toLowerCase())}>lower</button><button onClick={() => setT(L.titleCase(t))}>Title Case</button>
    <button onClick={() => setT([...new Set(t.split('\n'))].join('\n'))}>Dedupe lines</button><button onClick={() => setT(t.split('\n').sort((a, b) => a.localeCompare(b)).join('\n'))}>Sort lines</button><button onClick={() => setT('')}>Clear</button></div></>
}
export function Counter() {
  const [t, setT] = useState(''); const c = L.countText(t)
  return <><textarea value={t} onChange={e => setT(e.target.value)} placeholder="Paste text…" /><Out>{c.chars} characters · {c.words} words · {c.sentences} sentences · ~{c.minutes} min read</Out></>
}
export function Json() {
  const [t, setT] = useState(''); const [o, setO] = useState(''); const [err, setErr] = useState('')
  const run = min => { try { setO(L.jsonFormat(t, min)); setErr('') } catch (e) { setErr(e.message) } }
  return <><textarea value={t} onChange={e => setT(e.target.value)} placeholder='{"a":1}' /><div className="row"><button onClick={() => run(false)}>Format</button><button onClick={() => run(true)}>Minify</button></div>
    {err && <p className="err" role="alert">{err}</p>}<Out text={o}><pre>{o}</pre></Out></>
}
export function Uuid() {
  const [u, setU] = useState(() => crypto.randomUUID())
  return <><button onClick={() => setU(crypto.randomUUID())}>New UUID v4</button><Out text={u}><code>{u}</code></Out></>
}
