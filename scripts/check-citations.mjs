#!/usr/bin/env node
// Check that every [^N] citation has a matching definition and vice versa.
// A definition is a line STARTING with `[^N]:` (at column 0).
// A citation is `[^N]` appearing anywhere, including `[^N]:` mid-sentence.
// Exit 0 on success, 1 if any orphan/unused.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

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

// Default targets cover both books; override via argv to scope a single book.
const targets = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['content/hld', 'content/dsa', 'content/ai-eng'];

let problems = 0;
for (const t of targets) {
  const files = statSync(t).isDirectory() ? walk(t) : [t];
  for (const f of files) {
    const text = readFileSync(f, 'utf8');
    const defined = new Set();
    const used = new Set();

    // Definitions: lines starting with [^N]:
    for (const line of text.split('\n')) {
      const m = line.match(/^\[\^(\d+)\]:/);
      if (m) defined.add(m[1]);
    }

    // Citations: every [^N] anywhere in the text (including those followed by punctuation colon).
    // But subtract the definition lines. Simplest: find all [^N] and then
    // separately count only those NOT on a definition line.
    const lines = text.split('\n');
    for (const line of lines) {
      if (/^\[\^\d+\]:/.test(line)) continue; // definition line, skip
      for (const m of line.matchAll(/\[\^(\d+)\]/g)) {
        used.add(m[1]);
      }
    }

    const orphan = [...used].filter(n => !defined.has(n)).sort((a, b) => +a - +b);
    const unused = [...defined].filter(n => !used.has(n)).sort((a, b) => +a - +b);

    if (orphan.length || unused.length) {
      console.log(`${relative(process.cwd(), f)}`);
      if (orphan.length) console.log(`  orphan (used but undefined): ${orphan.join(', ')}`);
      if (unused.length) console.log(`  unused (defined but uncited): ${unused.join(', ')}`);
      problems++;
    }
  }
}

if (problems === 0) {
  console.log('✓ Citation integrity clean.');
  process.exit(0);
}
process.exit(1);
