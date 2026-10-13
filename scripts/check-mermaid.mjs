#!/usr/bin/env node
// Validate every ```mermaid``` code block under content/ parses cleanly.
// Uses the official mermaid package (v11+) with a jsdom DOM shim so the
// parser can run in Node. Renders are skipped; we only call mermaid.parse()
// which is fast (~10s for 650+ diagrams) and catches real syntax errors.
//
// Exit 0 on clean, 1 on any parse failure.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { JSDOM } from 'jsdom';

// --- DOM shim so mermaid's parser can initialize in Node -------------------
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});
// Node 22 makes `navigator` a read-only getter on globalThis; only assign
// properties that are actually writable in this runtime.
const shim = {
  window: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  Element: dom.window.Element,
  Node: dom.window.Node,
  SVGElement: dom.window.SVGElement,
  getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
};
for (const [k, v] of Object.entries(shim)) {
  try { globalThis[k] = v; } catch { /* already-read-only getters — ignore */ }
}

const { default: mermaid } = await import('mermaid');
mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });

// --- Walk content/ for markdown --------------------------------------------
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walk(full));
    else if (full.endsWith('.md')) out.push(full);
  }
  return out;
}

// --- Extract mermaid fences with line numbers ------------------------------
function extractMermaidBlocks(text) {
  const lines = text.split('\n');
  const blocks = [];
  let inFence = false;
  let startLine = 0;
  let buf = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!inFence && /^```mermaid\s*$/.test(line)) {
      inFence = true;
      startLine = i + 1; // 1-indexed, line of ```mermaid
      buf = [];
      continue;
    }
    if (inFence && /^```\s*$/.test(line)) {
      inFence = false;
      blocks.push({ startLine, code: buf.join('\n') });
      buf = [];
      continue;
    }
    if (inFence) buf.push(line);
  }
  return blocks;
}

// --- Main ------------------------------------------------------------------
const rawArgs = process.argv.slice(2);
const verbose = rawArgs.includes('--verbose');
const roots = rawArgs.filter(a => !a.startsWith('--'));
if (roots.length === 0) {
  // Default targets cover every book; override via argv to scope a single book.
  roots.push('content/hld', 'content/dsa', 'content/ai-eng');
}

let totalDiagrams = 0;
let totalFiles = 0;
const failures = [];

for (const root of roots) {
  const files = statSync(root).isDirectory() ? walk(root) : [root];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const blocks = extractMermaidBlocks(text);
    if (blocks.length === 0) continue;
    totalFiles++;
    for (let bi = 0; bi < blocks.length; bi++) {
      const { startLine, code } = blocks[bi];
      totalDiagrams++;
      try {
        // mermaid.parse throws on syntax errors; returns { diagramType } on success.
        await mermaid.parse(code);
      } catch (err) {
        const msg = (err && err.message) ? err.message : String(err);
        // Collapse multi-line error messages to a single readable line.
        const firstLine = msg.split('\n').find(l => l.trim().length > 0) || msg;
        failures.push({
          file: relative(process.cwd(), file),
          startLine,
          diagramIndex: bi + 1,
          error: firstLine.trim(),
          fullError: msg,
        });
      }
    }
  }
}

// --- Report ----------------------------------------------------------------
if (failures.length === 0) {
  console.log(`\u2713 All ${totalDiagrams} mermaid diagram(s) in ${totalFiles} file(s) parsed cleanly.`);
  process.exit(0);
}

console.error(`\u2717 ${failures.length} of ${totalDiagrams} mermaid diagram(s) failed to parse:\n`);
for (const f of failures) {
  console.error(`  ${f.file}:${f.startLine}  (diagram #${f.diagramIndex})`);
  console.error(`    ${f.error}`);
  if (verbose && f.fullError !== f.error) {
    for (const line of f.fullError.split('\n').slice(0, 8)) {
      if (line.trim()) console.error(`      ${line}`);
    }
  }
  console.error('');
}
console.error(`Run with --verbose for full error details.`);
process.exit(1);
