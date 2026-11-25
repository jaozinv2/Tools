// Pure, testable logic (no DOM)
export const percentOf = (p, v) => (p / 100) * v
export const whatPercent = (a, b) => (a / b) * 100
export const ruleOfThree = (a, b, c, inverse = false) => (inverse ? (a * b) / c : (b * c) / a)
export const compound = (P, rate, n, years) => P * Math.pow(1 + rate / 100 / n, n * years)
export const UNITS = {
  length: { mm: .001, cm: .01, m: 1, km: 1000, in: .0254, ft: .3048, yd: .9144, mi: 1609.344 },
  mass: { mg: .001, g: 1, kg: 1000, t: 1e6, oz: 28.349523125, lb: 453.59237 },
  data: { bit: .125, B: 1, KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12, KiB: 1024, MiB: 1048576, GiB: 1073741824 },
  temperature: { C: 1, F: 1, K: 1 },
}
export function convert(cat, v, from, to) {
  if (cat === 'temperature') {
    const c = from === 'C' ? v : from === 'F' ? (v - 32) * 5 / 9 : v - 273.15
    return to === 'C' ? c : to === 'F' ? c * 9 / 5 + 32 : c + 273.15
  }
  return (v * UNITS[cat][from]) / UNITS[cat][to]
}
export const titleCase = s => s.toLowerCase().replace(/(^|\s)\S/g, m => m.toUpperCase())
export const countText = t => {
  const words = (t.trim().match(/\S+/g) || []).length
  return { chars: t.length, words, sentences: (t.match(/[^.!?]+[.!?]+/g) || []).length, minutes: Math.ceil(words / 200) }
}
const bytes = s => new TextEncoder().encode(s)
export const b64enc = s => btoa(Array.from(bytes(s), b => String.fromCharCode(b)).join(''))
export const b64dec = s => new TextDecoder().decode(Uint8Array.from(atob(s.trim()), c => c.charCodeAt(0)))
export function password(len, sets) {
  const pool = sets.join(''); if (!pool || len < 1) return ''
  const max = Math.floor(0x100000000 / pool.length) * pool.length, out = []
  while (out.length < len) { const [x] = crypto.getRandomValues(new Uint32Array(1)); if (x < max) out.push(pool[x % pool.length]) }
  return out.join('')
}
export async function hash(alg, text) {
  const d = await crypto.subtle.digest(alg, bytes(text))
  return Array.from(new Uint8Array(d), b => b.toString(16).padStart(2, '0')).join('')
}
export const jsonFormat = (s, min = false) => JSON.stringify(JSON.parse(s), null, min ? 0 : 2)
// "1-3,5" or "all" -> 0-based page indices (order kept, duplicates dropped)
export function parseRanges(str, max) {
  if (str.trim().toLowerCase() === 'all') return Array.from({ length: max }, (_, i) => i)
  const out = []
  for (const part of str.split(',').map(s => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)(?:-(\d+))?$/)
    if (!m) throw new Error(`Invalid range "${part}"`)
    const a = +m[1], b = m[2] ? +m[2] : a
    if (a < 1 || b > max || a > b) throw new Error(`"${part}" is outside 1–${max}`)
    for (let i = a; i <= b; i++) if (!out.includes(i - 1)) out.push(i - 1)
  }
  if (!out.length) throw new Error('Enter at least one page')
  return out
}
