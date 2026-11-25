import { lazy } from 'react'
const T = name => lazy(() => import('./tools/Tools.jsx').then(m => ({ default: m[name] })))
const TF = name => lazy(() => import('./tools/Files.jsx').then(m => ({ default: m[name] })))
export const CATEGORIES = ['Calculators', 'Converters', 'Generators', 'Images', 'Files', 'Text', 'Developer']
// To add a tool: write a component in src/tools, add one entry here.
export const TOOLS = [
  { id: 'percentage', name: 'Percentage', desc: 'X% of Y and A is what % of B', cat: 'Calculators', icon: '％', keywords: 'percent discount tax', C: T('Percent') },
  { id: 'rule-of-three', name: 'Rule of Three', desc: 'Direct and inverse proportion', cat: 'Calculators', icon: '∝', keywords: 'proportion regra de tres', C: T('Rule3') },
  { id: 'compound-interest', name: 'Compound Interest', desc: 'Final amount with formula', cat: 'Calculators', icon: '📈', keywords: 'finance investment savings', C: T('Compound') },
  { id: 'units', name: 'Unit Converter', desc: 'Length, mass, data, temperature', cat: 'Converters', icon: '⇄', keywords: 'length weight kb mb celsius', C: T('Converter') },
  { id: 'password', name: 'Password Generator', desc: 'Secure random passwords', cat: 'Generators', icon: '🔑', keywords: 'security random pin', C: T('Password') },
  { id: 'uuid', name: 'UUID Generator', desc: 'Random v4 UUIDs', cat: 'Generators', icon: '#', keywords: 'id guid', C: T('Uuid') },
  { id: 'hash', name: 'Hash Generator', desc: 'SHA-1/256/384/512', cat: 'Generators', icon: '🧬', keywords: 'sha checksum crypto', C: T('Hash') },
  { id: 'base64', name: 'Base64', desc: 'Encode and decode text (UTF-8)', cat: 'Developer', icon: '64', keywords: 'encode decode', C: T('Base64') },
  { id: 'json', name: 'JSON Formatter', desc: 'Format, validate, minify', cat: 'Developer', icon: '{}', keywords: 'validator minifier', C: T('Json') },
  { id: 'case', name: 'Text Case & Lines', desc: 'Case, dedupe, sort lines', cat: 'Text', icon: 'Aa', keywords: 'uppercase lowercase title', C: T('Case') },
  { id: 'counter', name: 'Word Counter', desc: 'Characters, words, reading time', cat: 'Text', icon: '✎', keywords: 'characters sentences', C: T('Counter') },
  { id: 'image-convert', name: 'Image Converter', desc: 'JPG/PNG/WEBP, resize and compress', cat: 'Images', icon: '🖼', keywords: 'jpg png webp resize compress optimize', C: TF('ImageConvert') },
  { id: 'images-to-pdf', name: 'Images to PDF', desc: 'Combine images into one PDF', cat: 'Images', icon: '📄', keywords: 'jpg png pdf photos', C: TF('ImgToPdf') },
  { id: 'pdf-merge', name: 'Merge PDFs', desc: 'Join PDF files in any order', cat: 'Files', icon: '🔗', keywords: 'combine pdf', C: TF('PdfMerge') },
  { id: 'pdf-pages', name: 'PDF Pages', desc: 'Extract, reorder, delete, rotate', cat: 'Files', icon: '✂', keywords: 'split pdf pages', C: TF('PdfPages') },
  { id: 'pdf-to-images', name: 'PDF to Images', desc: 'Pages to PNG/JPG with page range', cat: 'Files', icon: '🖨', keywords: 'pdf png jpg render', C: TF('PdfToImages') },
  { id: 'file-info', name: 'File Inspector', desc: 'Size, type, dimensions, SHA-256', cat: 'Files', icon: 'ℹ', keywords: 'metadata hash mime extension', C: TF('FileInfo') },
]
