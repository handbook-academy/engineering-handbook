#!/usr/bin/env node
/**
 * Prints content statistics: per-part word counts, diagrams, status breakdown.
 * Usage: node scripts/content-stats.mjs
 */

import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

// Recursively list Markdown files under `dir`. Avoids fs/promises.glob,
// which only exists in Node 22+ (package.json declares node >=20).
async function walkMarkdown(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name).replace(/\\/g, '/');
    if (entry.isDirectory()) out.push(...(await walkMarkdown(full)));
    else if (entry.isFile() && entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

const PART_TITLES = {
  0: 'Prerequisites',
  1: 'Core Fundamentals',
  2: 'Building Blocks',
  3: 'Distributed Systems Theory',
  4: 'Data Systems',
  5: 'Architecture Patterns',
  6: 'Reliability and Operations',
  7: 'Security at Scale',
  8: 'Case Studies',
  9: 'AI & ML System Design',
  10: 'Emerging Patterns',
  11: 'Interview Framework',
};

const SEPARATOR = '-----|-----------------------------|-------|----------|---------|----------|--------';

const stats = {};
for (const n of Object.keys(PART_TITLES)) {
  stats[n] = { files: 0, words: 0, outlines: 0, complete: 0, mermaid: 0 };
}

async function main() {
  const files = [];
  // HLD-only reporter — the part-number table reflects the HLD curriculum.
  // DSA stats live in the DSA-specific reporting flow.
  files.push(...(await walkMarkdown('content/hld')));

  let totalWords = 0;
  let totalMermaid = 0;
  let chapterFiles = 0;
  let tradeoffFiles = 0;
  let tradeoffWords = 0;

  for (const file of files) {
    const contents = await readFile(file, 'utf8');
    const partMatch = contents.match(/^part:\s*(\d+)/m);
    const words = contents.split(/\s+/).filter(Boolean).length;
    const mermaidCount = (contents.match(/```mermaid/g) || []).length;

    if (!partMatch) {
      // Trade-off page or other non-chapter markdown under content/.
      tradeoffFiles++;
      tradeoffWords += words;
      continue;
    }

    const part = partMatch[1];
    const isOutline = /^status:\s*outline/m.test(contents);

    stats[part].files++;
    stats[part].words += words;
    stats[part].mermaid += mermaidCount;
    if (isOutline) stats[part].outlines++;
    else stats[part].complete++;

    chapterFiles++;
    totalWords += words;
    totalMermaid += mermaidCount;
  }

  console.log('\n=== The HLD Handbook - Content Stats ===\n');
  console.log('Part | Name                        | Files | Complete | Outline | Words    | Mermaid');
  console.log(SEPARATOR);
  for (const [num, name] of Object.entries(PART_TITLES)) {
    const s = stats[num];
    console.log(
      ` ${String(num).padStart(2)} | ${name.padEnd(27)} | ${String(s.files).padStart(5)} | ${String(s.complete).padStart(8)} | ${String(s.outlines).padStart(7)} | ${String(s.words).padStart(8)} | ${String(s.mermaid).padStart(6)}`
    );
  }
  console.log(SEPARATOR);
  console.log(`     | Chapters total              | ${String(chapterFiles).padStart(5)} |          |         | ${String(totalWords).padStart(8)} | ${String(totalMermaid).padStart(6)}`);
  if (tradeoffFiles > 0) {
    console.log(`     | Trade-offs (quick-ref)      | ${String(tradeoffFiles).padStart(5)} |          |         | ${String(tradeoffWords).padStart(8)} |      0`);
  }
  console.log(`\nEquivalent book length: ~${Math.round(totalWords / 300)} pages (300 words/page, chapters only).`);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
