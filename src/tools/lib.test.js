import { test, expect } from 'vitest'
import * as L from './lib.js'
test('percent', () => { expect(L.percentOf(20, 150)).toBe(30); expect(L.whatPercent(30, 150)).toBe(20) })
test('rule of three', () => { expect(L.ruleOfThree(2, 10, 5)).toBe(25); expect(L.ruleOfThree(2, 10, 5, true)).toBe(4) })
test('compound', () => expect(L.compound(1000, 10, 1, 2)).toBeCloseTo(1210))
test('units', () => { expect(L.convert('length', 1, 'km', 'm')).toBe(1000); expect(L.convert('temperature', 100, 'C', 'F')).toBe(212); expect(L.convert('data', 1, 'KiB', 'B')).toBe(1024) })
test('text', () => { expect(L.titleCase('hello WORLD')).toBe('Hello World'); expect(L.countText('Hi there. Ok!').words).toBe(3) })
test('base64 utf8', () => expect(L.b64dec(L.b64enc('olá ✓'))).toBe('olá ✓'))
test('password', () => { const p = L.password(24, ['abc', '123']); expect(p).toHaveLength(24); expect(p).toMatch(/^[abc123]+$/) })
test('sha256', async () => expect(await L.hash('SHA-256', 'abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'))
test('json', () => { expect(L.jsonFormat('{"a":1}', true)).toBe('{"a":1}'); expect(() => L.jsonFormat('{')).toThrow() })
test('parseRanges', () => {
  expect(L.parseRanges('1-3,5', 6)).toEqual([0, 1, 2, 4])
  expect(L.parseRanges('3,1,3', 3)).toEqual([2, 0])
  expect(L.parseRanges('all', 3)).toEqual([0, 1, 2])
  expect(() => L.parseRanges('9', 3)).toThrow(); expect(() => L.parseRanges('a', 3)).toThrow()
})
