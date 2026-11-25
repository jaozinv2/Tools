import { Suspense, useState, useEffect, useRef, Component } from 'react'
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom'
import { TOOLS, CATEGORIES } from './registry.js'
const ls = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const useLS = (k, d) => { const [v, s] = useState(() => ls(k, d)); useEffect(() => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }, [k, v]); return [v, s] }
class Boundary extends Component { state = { e: null }; static getDerivedStateFromError(e) { return { e } }; render() { return this.state.e ? <p className="err">Something went wrong in this tool.</p> : this.props.children } }

function Card({ t, fav, toggle }) {
  return <div className="card"><Link to={`/t/${t.id}`}><span className="ic">{t.icon}</span><b>{t.name}</b><small>{t.desc}</small></Link>
    <button className="star" aria-label="Toggle favorite" onClick={() => toggle(t.id)}>{fav.includes(t.id) ? '★' : '☆'}</button></div>
}
function Grid({ list, fav, toggle }) { return list.length ? <div className="grid">{list.map(t => <Card key={t.id} t={t} fav={fav} toggle={toggle} />)}</div> : <p className="empty">Nothing here yet.</p> }
function Tool({ fav, toggle, mark }) {
  const { id } = useParams(); const t = TOOLS.find(x => x.id === id)
  useEffect(() => { t && mark(t.id) }, [id])
  if (!t) return <p>Tool not found.</p>
  return <section><h2>{t.icon} {t.name}</h2><p>{t.desc}</p><button onClick={() => toggle(t.id)}>{fav.includes(t.id) ? '★ Favorited' : '☆ Favorite'}</button>
    <Boundary><Suspense fallback={<p>Loading…</p>}><t.C /></Suspense></Boundary></section>
}
function Category({ fav, toggle }) { const { name } = useParams(); return <><h2>{name}</h2><Grid list={TOOLS.filter(t => t.cat === name)} fav={fav} toggle={toggle} /></> }

export default function App() {
  const [theme, setTheme] = useLS('jt-theme', 'system'); const [fav, setFav] = useLS('jt-fav', []); const [rec, setRec] = useLS('jt-recent', [])
  const [q, setQ] = useState(''); const [open, setOpen] = useState(false); const nav = useNavigate(); const sr = useRef()
  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
  useEffect(() => { const k = e => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); sr.current?.focus() } if (e.key === 'Escape') setQ('') }; addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [])
  const toggle = id => setFav(f => (f.includes(id) ? f.filter(x => x !== id) : [...f, id]))
  const mark = id => setRec(r => [id, ...r.filter(x => x !== id)].slice(0, 12))
  const byIds = ids => ids.map(i => TOOLS.find(t => t.id === i)).filter(Boolean)
  const res = q ? TOOLS.filter(t => `${t.name} ${t.desc} ${t.cat} ${t.keywords}`.toLowerCase().includes(q.toLowerCase())) : []
  return <div className="app">
    <aside className={open ? 'side open' : 'side'}><Link to="/" className="logo" onClick={() => setOpen(false)}>Jota<span>Tools</span></Link>
      <nav onClick={() => setOpen(false)}><Link to="/">Home</Link>{CATEGORIES.map(c => <Link key={c} to={`/c/${c}`}>{c}</Link>)}<Link to="/favorites">★ Favorites</Link><Link to="/recent">Recently used</Link></nav>
      <label className="f">Theme<select value={theme} onChange={e => setTheme(e.target.value)}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
      <button onClick={() => confirm('Clear favorites and history?') && (setFav([]), setRec([]))}>Clear saved data</button></aside>
    <main><header><button className="burger" aria-label="Menu" onClick={() => setOpen(!open)}>☰</button>
      <input ref={sr} type="search" aria-label="Search tools" placeholder="Search tools (Ctrl+K)" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && res[0] && (nav(`/t/${res[0].id}`), setQ(''))} /></header>
      {q ? <Grid list={res} fav={fav} toggle={toggle} /> : <Routes>
        <Route path="/" element={<><h1>Everything you need, in one place.</h1><p>Files and secrets never leave your browser.</p><h2>All tools</h2><Grid list={TOOLS} fav={fav} toggle={toggle} /></>} />
        <Route path="/t/:id" element={<Tool fav={fav} toggle={toggle} mark={mark} />} />
        <Route path="/c/:name" element={<Category fav={fav} toggle={toggle} />} />
        <Route path="/favorites" element={<><h2>Favorites</h2><Grid list={byIds(fav)} fav={fav} toggle={toggle} /></>} />
        <Route path="/recent" element={<><h2>Recently used</h2><Grid list={byIds(rec)} fav={fav} toggle={toggle} /></>} />
        <Route path="*" element={<p>Page not found.</p>} /></Routes>}</main></div>
}
