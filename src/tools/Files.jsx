import { useState } from 'react'
import { parseRanges } from './lib.js'
const MB = 1048576
const sz = n => (n > MB ? (n / MB).toFixed(2) + ' MB' : (n / 1024).toFixed(1) + ' KB')
const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }
const base = n => n.replace(/\.[^.]+$/, '')
function save(blob, name) { const u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(u), 2000) }
const pdfBlob = async d => new Blob([await d.save()], { type: 'application/pdf' })
async function toBlob(f, type, q = .92, maxW = 0) {
  const bm = await createImageBitmap(f), s = maxW && bm.width > maxW ? maxW / bm.width : 1
  const c = document.createElement('canvas'); c.width = Math.round(bm.width * s); c.height = Math.round(bm.height * s)
  const x = c.getContext('2d'); if (type === 'image/jpeg') { x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height) }
  x.drawImage(bm, 0, 0, c.width, c.height); bm.close()
  return new Promise((ok, no) => c.toBlob(b => (b && b.type === type ? ok(b) : no(new Error('This browser cannot export that format.'))), type, q))
}
function useRun() {
  const [busy, setBusy] = useState(false), [msg, setMsg] = useState('')
  const run = async fn => { setBusy(true); setMsg(''); try { await fn(setMsg) } catch (e) { setMsg('Error: ' + (e.message || e)) } finally { setBusy(false) } }
  return { busy, msg, run, status: <p role="status" className={msg.startsWith('Error') ? 'err' : ''}>{busy && !msg ? 'Working…' : msg}</p> }
}
function Drop({ accept, multiple, onFiles, label }) {
  const [over, setOver] = useState(false)
  const take = fs => { fs = [...fs]; const big = fs.find(f => f.size > 50 * MB); if (big && !confirm(`${big.name} is ${sz(big.size)}. Processing may use a lot of memory. Continue?`)) return; if (fs.length) onFiles(fs) }
  return <label className={'drop' + (over ? ' over' : '')} onDragOver={e => { e.preventDefault(); setOver(true) }} onDragLeave={() => setOver(false)} onDrop={e => { e.preventDefault(); setOver(false); take(e.dataTransfer.files) }}>
    {label}<input className="sr" type="file" accept={accept} multiple={multiple} onChange={e => { take(e.target.files); e.target.value = '' }} /></label>
}
function List({ fs, setFs }) {
  const mv = (i, d) => { const a = [...fs];[a[i], a[i + d]] = [a[i + d], a[i]]; setFs(a) }
  return <ol>{fs.map((f, i) => <li key={i}>{f.name} <small>{sz(f.size)}</small> <button disabled={!i} onClick={() => mv(i, -1)} aria-label="Move up">↑</button><button disabled={i === fs.length - 1} onClick={() => mv(i, 1)} aria-label="Move down">↓</button><button onClick={() => setFs(fs.filter((_, j) => j !== i))} aria-label="Remove">✕</button></li>)}</ol>
}
const Sel = ({ label, value, set, opts }) => <label className="f">{label}<select value={value} onChange={e => set(e.target.value)}>{opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></label>
const Num = ({ label, value, set, ...p }) => <label className="f">{label}<input value={value} onChange={e => set(e.target.value)} {...p} /></label>

export function ImageConvert() {
  const [f, setF] = useState(null), [fmt, setFmt] = useState('image/webp'), [q, setQ] = useState(.9), [w, setW] = useState(''), [res, setRes] = useState(null)
  const { busy, run, status } = useRun()
  const go = () => run(async () => { setRes(await toBlob(f, fmt, q, +w || 0)) })
  return <><Drop accept="image/*" onFiles={([x]) => { setF(x); setRes(null) }} label={f ? `${f.name} (${sz(f.size)})` : 'Drop an image here or click to choose'} />
    <div className="row"><Sel label="Output" value={fmt} set={setFmt} opts={[['image/webp', 'WEBP'], ['image/jpeg', 'JPG'], ['image/png', 'PNG']]} />
      <Num label={`Quality ${Math.round(q * 100)}% (JPG/WEBP)`} type="range" min=".1" max="1" step=".05" value={q} set={v => setQ(+v)} />
      <Num label="Max width px (optional)" type="number" min="1" value={w} set={setW} /></div>
    <button disabled={!f || busy} onClick={go}>Convert</button>
    {res && <div className="out"><span>{sz(f.size)} → <b>{sz(res.size)}</b></span><button onClick={() => save(res, base(f.name) + '.' + EXT[fmt])}>Download</button></div>}{status}
    <small>Your original file is never modified. SVG/BMP/ICO input depends on browser support.</small></>
}
export function ImgToPdf() {
  const [fs, setFs] = useState([]); const { busy, run, status } = useRun()
  const go = () => run(async set => {
    const { PDFDocument } = await import('pdf-lib'), doc = await PDFDocument.create()
    for (const [i, f] of fs.entries()) {
      set(`Adding image ${i + 1}/${fs.length}…`); let png = f.type === 'image/png', jpg = f.type === 'image/jpeg', bytes
      if (!png && !jpg) { bytes = new Uint8Array(await (await toBlob(f, 'image/png')).arrayBuffer()); png = true } else bytes = new Uint8Array(await f.arrayBuffer())
      const im = png ? await doc.embedPng(bytes) : await doc.embedJpg(bytes)
      doc.addPage([im.width, im.height]).drawImage(im, { x: 0, y: 0, width: im.width, height: im.height })
    }
    save(await pdfBlob(doc), 'images.pdf'); set('Done: images.pdf')
  })
  return <><Drop multiple accept="image/*" onFiles={n => setFs([...fs, ...n])} label="Drop images here (one page per image, in the order below)" /><List fs={fs} setFs={setFs} />
    <button disabled={!fs.length || busy} onClick={go}>Create PDF</button>{status}</>
}
export function PdfMerge() {
  const [fs, setFs] = useState([]); const { busy, run, status } = useRun()
  const go = () => run(async set => {
    const { PDFDocument } = await import('pdf-lib'), out = await PDFDocument.create()
    for (const [i, f] of fs.entries()) { set(`Merging ${i + 1}/${fs.length}…`); const d = await PDFDocument.load(await f.arrayBuffer()); (await out.copyPages(d, d.getPageIndices())).forEach(p => out.addPage(p)) }
    save(await pdfBlob(out), 'merged.pdf'); set(`Done: ${out.getPageCount()} pages`)
  })
  return <><Drop multiple accept="application/pdf" onFiles={n => setFs([...fs, ...n])} label="Drop PDF files here" /><List fs={fs} setFs={setFs} />
    <button disabled={fs.length < 2 || busy} onClick={go}>Merge</button>{status}<small>Password-protected PDFs are not supported.</small></>
}
export function PdfPages() {
  const [f, setF] = useState(null), [n, setN] = useState(0), [mode, setMode] = useState('extract'), [r, setR] = useState('1'), [ang, setAng] = useState('90'); const { busy, run, status } = useRun()
  const pick = ([file]) => run(async () => { const { PDFDocument } = await import('pdf-lib'); const d = await PDFDocument.load(await file.arrayBuffer()); setF(file); setN(d.getPageCount()) })
  const go = () => run(async set => {
    const { PDFDocument, degrees } = await import('pdf-lib'), src = await PDFDocument.load(await f.arrayBuffer()), idx = parseRanges(r, n); let out = src
    if (mode === 'extract') { out = await PDFDocument.create(); (await out.copyPages(src, idx)).forEach(p => out.addPage(p)) }
    else if (mode === 'delete') { if (idx.length >= n) throw new Error('Cannot delete every page.');[...idx].sort((a, b) => b - a).forEach(i => src.removePage(i)) }
    else idx.forEach(i => { const p = src.getPage(i); p.setRotation(degrees((p.getRotation().angle + +ang) % 360)) })
    save(await pdfBlob(out), `${mode}-${f.name}`); set('Done.')
  })
  return <><Drop accept="application/pdf" onFiles={pick} label={f ? `${f.name} — ${n} pages` : 'Drop a PDF here'} />
    <div className="row"><Sel label="Action" value={mode} set={setMode} opts={[['extract', 'Extract / reorder'], ['delete', 'Delete pages'], ['rotate', 'Rotate pages']]} />
      <Num label={`Pages (e.g. 1-3,5 · 3,1,2 reorders · all)`} value={r} set={setR} />
      {mode === 'rotate' && <Sel label="Angle" value={ang} set={setAng} opts={[['90', '90° clockwise'], ['180', '180°'], ['270', '90° counter-clockwise']]} />}</div>
    <button disabled={!f || busy} onClick={go}>Apply</button>{status}</>
}
export function PdfToImages() {
  const [f, setF] = useState(null), [r, setR] = useState('1'), [scale, setScale] = useState('2'), [fmt, setFmt] = useState('image/png'); const { busy, run, status } = useRun()
  const go = () => run(async set => {
    const pdfjs = await import('pdfjs-dist'); pdfjs.GlobalWorkerOptions.workerSrc = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
    const doc = await pdfjs.getDocument({ data: new Uint8Array(await f.arrayBuffer()) }).promise, idx = parseRanges(r, doc.numPages), out = [], ext = EXT[fmt]
    for (const [k, i] of idx.entries()) {
      set(`Rendering page ${i + 1} (${k + 1}/${idx.length})…`); const pg = await doc.getPage(i + 1), vp = pg.getViewport({ scale: +scale })
      const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height
      await pg.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise; out.push([i + 1, await new Promise(ok => c.toBlob(ok, fmt, .92))])
    }
    if (out.length === 1) save(out[0][1], `${base(f.name)}-p${out[0][0]}.${ext}`)
    else { const { default: JSZip } = await import('jszip'), z = new JSZip(); out.forEach(([p, b]) => z.file(`page-${p}.${ext}`, b)); save(await z.generateAsync({ type: 'blob' }), `${base(f.name)}-pages.zip`) }
    set(`Done: ${out.length} image(s)`)
  })
  return <><Drop accept="application/pdf" onFiles={([x]) => setF(x)} label={f ? f.name : 'Drop a PDF here'} />
    <div className="row"><Num label="Pages (1-3,5 or all)" value={r} set={setR} /><Sel label="Resolution" value={scale} set={setScale} opts={[['1', '72 dpi'], ['2', '144 dpi'], ['3', '216 dpi'], ['4', '288 dpi']]} /><Sel label="Format" value={fmt} set={setFmt} opts={[['image/png', 'PNG'], ['image/jpeg', 'JPG']]} /></div>
    <button disabled={!f || busy} onClick={go}>Convert</button>{status}<small>Multiple pages are downloaded as a ZIP.</small></>
}
export function FileInfo() {
  const [i, setI] = useState(null); const { run, status } = useRun()
  const pick = ([f]) => run(async () => {
    const h = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await f.arrayBuffer())), b => b.toString(16).padStart(2, '0')).join(''); let dim = ''
    if (f.type.startsWith('image/')) try { const b = await createImageBitmap(f); dim = `${b.width}×${b.height}px`; b.close() } catch {}
    setI({ Name: f.name, Extension: f.name.includes('.') ? f.name.split('.').pop() : '(none)', 'Type (reported by browser)': f.type || 'unknown', Size: `${sz(f.size)} (${f.size.toLocaleString()} bytes)`, Modified: new Date(f.lastModified).toLocaleString(), ...(dim && { Dimensions: dim }), 'SHA-256': h })
  })
  return <><Drop onFiles={pick} label="Drop any file to inspect it (nothing is uploaded)" />{status}
    {i && <dl className="info">{Object.entries(i).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>}<small>The type comes from the file extension, not its contents.</small></>
}
