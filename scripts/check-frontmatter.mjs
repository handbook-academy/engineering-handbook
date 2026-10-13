#!/usr/bin/env node
/**
 * Validates YAML frontmatter on every Markdown file under content/.
 * Usage: node scripts/check-frontmatter.mjs
 */

import { readFile, glob } from 'node:fs/promises';
import { exit } from 'node:process';

const REQUIRED_FIELDS = [
  'title',
  'description',
  'part',
  'module',
  'difficulty',
  'prerequisites',
  'date_created',
  'date_updated',
];

// Trade-off pages live outside the 12-part curriculum and use a simpler schema.
const TRADEOFF_REQUIRED_FIELDS = ['title', 'description', 'related'];

// DSA per-genre required fields. Chapter and editorial frontmatter shapes are
// captured by sample files at content/dsa/part-1-linear-data-structures/00-arrays.md
// (chapter), content/dsa/editorials/LC-001-two-sum.md (editorial), and
// content/dsa/patterns/P-01-recursion-vs-iteration.md (pattern decision page).
// `languages` is intentionally optional — Part 14 interview-framework chapters
// have no code samples (`languages: []` or no field at all). When present and
// non-empty, every entry must be one of python/java/cpp/go.
const DSA_CHAPTER_REQUIRED_FIELDS = [
  'title', 'description', 'slug', 'part', 'chapter',
  'difficulty', 'prerequisites', 'date_updated',
];
const DSA_EDITORIAL_REQUIRED_FIELDS = [
  'lc_id', 'title', 'slug', 'primary_chapter',
  'difficulty', 'date_updated', 'languages',
];
const DSA_PATTERN_REQUIRED_FIELDS = [
  'pattern_id', 'title', 'slug', 'type',
  'date_updated', 'difficulty',
];

// AI Engineering chapters mirror the DSA chapter shape (slug = filename,
// integer part + chapter, path-style prerequisites) plus date_created.
// Sample: content/ai-eng/part-0-start-here/00-what-an-ai-engineer-is.md
const AI_ENG_CHAPTER_REQUIRED_FIELDS = [
  'title', 'description', 'slug', 'part', 'chapter',
  'difficulty', 'prerequisites', 'date_created', 'date_updated',
];

const VALID_DIFFICULTY = ['beginner', 'intermediate', 'advanced'];
const VALID_DSA_EDITORIAL_DIFFICULTY = ['easy', 'medium', 'hard'];
const VALID_DSA_LANGUAGES = new Set(['python', 'java', 'cpp', 'go']);

// Canonical tag vocabulary. Keep in sync with STYLE_GUIDE.md "Canonical tags".
// `tags:` is for topic concepts. Tool names live in `technologies:` instead.
const VALID_TAGS = new Set([
  // Distributed systems
  'consistency', 'replication', 'partitioning', 'consensus', 'transactions',
  'idempotency', 'fanout',
  // Data storage
  'sql', 'nosql', 'cache', 'storage-engines', 'vector-search', 'time-series',
  'search', 'geospatial',
  // Messaging
  'queue', 'stream-processing', 'cdc',
  // Networking
  'http-api', 'real-time', 'cdn', 'dns', 'load-balancing',
  // Architecture
  'microservices', 'event-driven', 'serverless', 'api-gateway', 'multi-tenant',
  // Traffic
  'rate-limiting', 'identifier',
  // Reliability
  'observability', 'resilience', 'deployment', 'slo',
  // Security
  'authn-authz', 'encryption', 'zero-trust',
  // AI / ML
  'llm', 'rag', 'ml-systems', 'ai-safety', 'agents',
  // Media
  'video',
  // Cross-cutting
  'cost',
]);

// Part 8 case-study themes. Purely editorial grouping: never affects URLs, the
// numbered Part 8 curriculum position, or cross-references. Adding a new value
// here is the only step needed to introduce a new theme bucket.
const VALID_CASE_STUDY_THEMES = [
  'core-primitives',
  'consumer-products',
  'ai-systems',
  'financial-systems',
  'infrastructure-platforms',
];

// Lazy-load the technology allowlist; a missing/malformed file is non-fatal
// and simply disables technology validation.
let ALLOWED_TECHNOLOGIES = null;
try {
  const raw = await readFile(new URL('./technologies.json', import.meta.url), 'utf8');
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed.allowed)) {
    ALLOWED_TECHNOLOGIES = new Set(parsed.allowed);
  }
} catch {
  ALLOWED_TECHNOLOGIES = null;
}

let errorCount = 0;
let fileCount = 0;

// Registry keys look like "1.3-consistency-models" — part.idx-slug where idx
// is NOT zero-padded (matches the prerequisites: slug format in STYLE_GUIDE.md).
const MODULE_REGISTRY = new Set();

const stripQuotes = (s) => s.replace(/^["']|["']$/g, '');

function registerModule(file) {
  const m = file.match(/content\/hld\/part-(\d+)-[^/]+\/(\d+)-([^/]+)\.md$/);
  if (!m) return;
  const [, part, idx, slug] = m;
  MODULE_REGISTRY.add(`${part}.${parseInt(idx, 10)}-${slug}`);
}

function parseFrontmatter(contents, file) {
  const match = contents.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    console.error(`\u274c ${file}: no YAML frontmatter block found`);
    return null;
  }

  const obj = {};
  let currentArrayKey = null;

  for (const line of match[1].split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;

    if (line.match(/^\s+- /)) {
      if (!currentArrayKey) continue;
      obj[currentArrayKey].push(stripQuotes(line.replace(/^\s+- /, '').trim()));
      continue;
    }

    const m = line.match(/^([a-z_]+):\s*(.*)$/);
    if (!m) continue;
    const [, key, rawValue] = m;
    const trimmedRaw = rawValue.trim();

    const inlineArray = trimmedRaw.match(/^\[(.*)\]$/);
    if (inlineArray) {
      const inner = inlineArray[1].trim();
      obj[key] = inner === ''
        ? []
        : inner.split(',').map((s) => stripQuotes(s.trim())).filter((s) => s.length > 0);
      currentArrayKey = null;
    } else if (trimmedRaw === '') {
      obj[key] = [];
      currentArrayKey = key;
    } else {
      obj[key] = stripQuotes(trimmedRaw);
      currentArrayKey = null;
    }
  }

  return obj;
}

function isMissing(fm, field) {
  return !(field in fm) || fm[field] === undefined || fm[field] === '';
}

function classify(file) {
  // Normalize separators so we don't double-check Windows vs POSIX paths.
  // glob() yields repo-relative paths (no leading "/"), so anchor patterns to
  // "content/..." rather than "/content/...".
  const norm = file.replace(/\\/g, '/');
  if (norm.includes('content/hld/trade-offs/')) return 'hld-tradeoff';
  if (norm.includes('content/hld/')) return 'hld-chapter';
  if (norm.includes('content/dsa/editorials/')) return 'dsa-editorial';
  if (norm.includes('content/dsa/patterns/')) return 'dsa-pattern';
  if (norm.includes('content/dsa/widgets/')) return 'dsa-widget-doc';
  if (/content\/dsa\/part-\d+/.test(norm)) return 'dsa-chapter';
  if (/content\/ai-eng\/part-\d+/.test(norm)) return 'ai-eng-chapter';
  return 'unknown';
}

// Registry of AI Engineering chapters, keyed "part-N-slug/NN-chapter-slug",
// so prerequisites can be checked against real files.
const AI_ENG_REGISTRY = new Set();

function registerAiEngChapter(file) {
  const m = file.replace(/\\/g, '/').match(/content\/ai-eng\/(part-\d+-[^/]+)\/(\d+-[^/]+)\.md$/);
  if (m) AI_ENG_REGISTRY.add(`${m[1]}/${m[2]}`);
}

function validateAiEngChapter(fm, file) {
  const errors = [];
  const norm = file.replace(/\\/g, '/');

  for (const field of AI_ENG_CHAPTER_REQUIRED_FIELDS) {
    if (isMissing(fm, field) && !(field === 'prerequisites' && Array.isArray(fm[field]))) {
      errors.push(`missing required field: ${field}`);
    }
  }

  const loc = norm.match(/content\/ai-eng\/part-(\d+)-[^/]+\/(\d+)-[^/]+\.md$/);
  const partDir = norm.match(/content\/ai-eng\/(part-\d+-[^/]+)\//)?.[1];

  if (fm.part !== undefined) {
    const partNum = Number(fm.part);
    if (!Number.isInteger(partNum) || partNum < 0 || partNum > 11) {
      errors.push(`part must be integer 0-11, got ${fm.part}`);
    } else if (loc && partNum !== Number(loc[1])) {
      errors.push(`part ${fm.part} does not match directory part-${loc[1]}`);
    }
  }

  if (fm.chapter !== undefined) {
    const chapterNum = Number(fm.chapter);
    if (!Number.isInteger(chapterNum) || chapterNum < 0) {
      errors.push(`chapter must be a non-negative integer, got ${fm.chapter}`);
    } else if (loc && chapterNum !== Number(loc[2])) {
      errors.push(`chapter ${fm.chapter} does not match filename prefix ${loc[2]}`);
    }
  }

  if (fm.difficulty && !VALID_DIFFICULTY.includes(fm.difficulty)) {
    errors.push(`difficulty must be one of ${VALID_DIFFICULTY.join(', ')}, got ${fm.difficulty}`);
  }

  if (fm.slug) {
    const expected = norm.split('/').pop().replace(/\.md$/, '');
    if (fm.slug !== expected) {
      errors.push(`slug "${fm.slug}" must match filename basename "${expected}"`);
    }
  }

  for (const field of ['date_created', 'date_updated']) {
    if (fm[field] && !/^\d{4}-\d{2}-\d{2}$/.test(fm[field])) {
      errors.push(`${field} must be YYYY-MM-DD, got ${fm[field]}`);
    }
  }
  if (fm.date_created && fm.date_updated && fm.date_updated < fm.date_created) {
    errors.push(`date_updated ${fm.date_updated} is before date_created ${fm.date_created}`);
  }

  if (fm.tags !== undefined) {
    if (!Array.isArray(fm.tags)) {
      errors.push(`tags must be an array, got ${typeof fm.tags}`);
    } else {
      for (const tag of fm.tags) {
        if (!VALID_TAGS.has(tag)) {
          errors.push(`tags entry "${tag}" is not in the canonical list (see STYLE_GUIDE.md)`);
        }
      }
    }
  }

  // Prereqs: "part-N-slug/NN-chapter-slug" (cross-part) or "NN-chapter-slug"
  // (same part). Both must resolve to a real AI Engineering chapter.
  if (Array.isArray(fm.prerequisites)) {
    for (const p of fm.prerequisites) {
      const fullForm = /^part-\d+-[a-z0-9-]+\/\d+-[a-z0-9-]+$/.test(p);
      const samePart = /^\d+-[a-z0-9-]+$/.test(p);
      if (!fullForm && !samePart) {
        errors.push(`prerequisites entry "${p}" must be "part-N-slug/NN-chapter-slug" or "NN-chapter-slug"`);
        continue;
      }
      const key = fullForm ? p : `${partDir}/${p}`;
      if (!AI_ENG_REGISTRY.has(key)) {
        errors.push(`prerequisites entry "${p}" does not resolve to any AI Engineering chapter`);
      }
    }
  }

  return errors;
}

function validateDsaChapter(fm, file) {
  const errors = [];

  for (const field of DSA_CHAPTER_REQUIRED_FIELDS) {
    if (isMissing(fm, field)) errors.push(`missing required field: ${field}`);
  }

  if (fm.part !== undefined) {
    const partNum = Number(fm.part);
    if (!Number.isInteger(partNum) || partNum < 0 || partNum > 14) {
      errors.push(`part must be integer 0-14, got ${fm.part}`);
    }
  }

  if (fm.chapter !== undefined) {
    const chapterNum = Number(fm.chapter);
    if (!Number.isInteger(chapterNum) || chapterNum < 0) {
      errors.push(`chapter must be a non-negative integer, got ${fm.chapter}`);
    }
  }

  if (fm.difficulty && !VALID_DIFFICULTY.includes(fm.difficulty)) {
    errors.push(`difficulty must be one of ${VALID_DIFFICULTY.join(', ')}, got ${fm.difficulty}`);
  }

  // slug must equal the filename without `.md`.
  if (fm.slug) {
    const expected = file.replace(/\\/g, '/').split('/').pop().replace(/\.md$/, '');
    if (fm.slug !== expected) {
      errors.push(`slug "${fm.slug}" must match filename basename "${expected}"`);
    }
  }

  // languages is optional (interview-framework chapters omit it) but if
  // present, every entry must be one of python/java/cpp/go.
  if (fm.languages !== undefined) {
    if (!Array.isArray(fm.languages)) {
      errors.push(`languages must be an array, got ${typeof fm.languages}`);
    } else {
      for (const lang of fm.languages) {
        if (!VALID_DSA_LANGUAGES.has(lang)) {
          errors.push(`languages entry "${lang}" must be one of python, java, cpp, go`);
        }
      }
    }
  }

  // canonical_test is optional. When present, it's either an LC-NNN id
  // (most chapters) or a free-form test-fixture slug (a few hand-rolled
  // chapters whose canonical test isn't a LeetCode problem).
  // We only reject the empty-string accident; both forms are allowed.
  if (fm.canonical_test !== undefined && fm.canonical_test === '') {
    errors.push('canonical_test, if present, must be non-empty (LC-NNN or fixture slug)');
  }

  // Prereqs are either a full "part-N-slug/NN-chapter-slug" form (cross-part)
  // or a same-part bare "NN-chapter-slug" form. Both are accepted in the
  // existing corpus.
  if (Array.isArray(fm.prerequisites)) {
    for (const p of fm.prerequisites) {
      const fullForm = /^part-\d+-[a-z0-9-]+\/\d+-[a-z0-9-]+$/.test(p);
      const samePart = /^\d+-[a-z0-9-]+$/.test(p);
      if (!fullForm && !samePart) {
        errors.push(`prerequisites entry "${p}" must be "part-N-slug/NN-chapter-slug" or "NN-chapter-slug"`);
      }
    }
  }

  return errors;
}

function validateDsaEditorial(fm, file) {
  const errors = [];

  for (const field of DSA_EDITORIAL_REQUIRED_FIELDS) {
    if (isMissing(fm, field)) errors.push(`missing required field: ${field}`);
  }

  if (fm.slug) {
    const expected = file.replace(/\\/g, '/').split('/').pop().replace(/\.md$/, '');
    if (fm.slug !== expected) {
      errors.push(`slug "${fm.slug}" must match filename basename "${expected}"`);
    }
    if (!/^LC-\d+(-[a-z0-9-]+)?$/.test(fm.slug)) {
      errors.push(`slug "${fm.slug}" must match LC-NNN-slug pattern`);
    }
  }

  if (fm.lc_id !== undefined) {
    const lcNum = Number(fm.lc_id);
    if (!Number.isInteger(lcNum) || lcNum <= 0) {
      errors.push(`lc_id must be a positive integer, got ${fm.lc_id}`);
    }
  }

  if (fm.difficulty && !VALID_DSA_EDITORIAL_DIFFICULTY.includes(fm.difficulty)) {
    errors.push(
      `difficulty must be one of ${VALID_DSA_EDITORIAL_DIFFICULTY.join(', ')} (LeetCode shape), got ${fm.difficulty}`
    );
  }

  if (fm.languages !== undefined) {
    if (!Array.isArray(fm.languages) || fm.languages.length === 0) {
      errors.push('languages must be a non-empty array');
    } else {
      for (const lang of fm.languages) {
        if (!VALID_DSA_LANGUAGES.has(lang)) {
          errors.push(`languages entry "${lang}" must be one of python, java, cpp, go`);
        }
      }
    }
  }

  if (fm.primary_chapter && !/^part-\d+-[a-z0-9-]+\/\d+-[a-z0-9-]+$/.test(fm.primary_chapter)) {
    errors.push(`primary_chapter "${fm.primary_chapter}" must be "part-N-slug/NN-chapter-slug"`);
  }

  return errors;
}

function validateDsaPattern(fm, file) {
  const errors = [];

  for (const field of DSA_PATTERN_REQUIRED_FIELDS) {
    if (isMissing(fm, field)) errors.push(`missing required field: ${field}`);
  }

  if (fm.slug) {
    const expected = file.replace(/\\/g, '/').split('/').pop().replace(/\.md$/, '');
    if (fm.slug !== expected) {
      errors.push(`slug "${fm.slug}" must match filename basename "${expected}"`);
    }
  }

  if (fm.pattern_id && !/^P-\d+[a-z]?$/.test(fm.pattern_id)) {
    errors.push(`pattern_id "${fm.pattern_id}" must match P-NN or P-NNa form`);
  }

  if (fm.difficulty && !VALID_DIFFICULTY.includes(fm.difficulty)) {
    errors.push(`difficulty must be one of ${VALID_DIFFICULTY.join(', ')}, got ${fm.difficulty}`);
  }

  return errors;
}

function validate(fm, file) {
  const errors = [];
  const kind = classify(file);

  if (kind === 'dsa-chapter')   return validateDsaChapter(fm, file);
  if (kind === 'dsa-editorial') return validateDsaEditorial(fm, file);
  if (kind === 'dsa-pattern')   return validateDsaPattern(fm, file);
  if (kind === 'ai-eng-chapter') return validateAiEngChapter(fm, file);
  // Widget README is documentation; no frontmatter required, no checks.
  if (kind === 'dsa-widget-doc') return errors;

  const isTradeOff = kind === 'hld-tradeoff';

  if (isTradeOff) {
    for (const field of TRADEOFF_REQUIRED_FIELDS) {
      if (isMissing(fm, field)) errors.push(`missing required field: ${field}`);
    }
    if (fm.related !== undefined && !Array.isArray(fm.related)) {
      errors.push(`related must be an array, got ${typeof fm.related}`);
    }
    if (Array.isArray(fm.related)) {
      for (const r of fm.related) {
        if (!/^\d+:\d+-[a-z0-9-]+$/.test(r)) {
          errors.push(`related entry "${r}" is not in the form "part:zero-padded-slug"`);
        }
      }
    }
    return errors;
  }

  for (const field of REQUIRED_FIELDS) {
    if (isMissing(fm, field)) errors.push(`missing required field: ${field}`);
  }

  if (fm.part !== undefined) {
    const partNum = Number(fm.part);
    if (!Number.isInteger(partNum) || partNum < 0 || partNum > 11) {
      errors.push(`part must be integer 0-11, got ${fm.part}`);
    }
  }

  if (fm.difficulty && !VALID_DIFFICULTY.includes(fm.difficulty)) {
    errors.push(`difficulty must be one of ${VALID_DIFFICULTY.join(', ')}, got ${fm.difficulty}`);
  }

  // Part 8 chapters must declare a theme so navigation and the Part 8 index
  // can group them without further heuristics.
  const isPart8 = file.includes('/part-8-case-studies/') || file.includes('\\part-8-case-studies\\');
  if (isPart8) {
    if (isMissing(fm, 'theme')) {
      errors.push('missing required field: theme (Part 8 chapters must declare a theme)');
    } else if (!VALID_CASE_STUDY_THEMES.includes(fm.theme)) {
      errors.push(`theme must be one of ${VALID_CASE_STUDY_THEMES.join(', ')}, got ${fm.theme}`);
    }
  } else if (fm.theme !== undefined) {
    errors.push('theme is only valid for Part 8 case-study chapters');
  }

  if (fm.module !== undefined && typeof fm.module !== 'string') {
    errors.push(
      `module must be a quoted string (got ${typeof fm.module} ${fm.module}). ` +
      `Use module: "X.Y" with quotes — unquoted "2.10" parses as float 2.1.`
    );
  }

  if (fm.module && !/^\d+\.\d+$/.test(fm.module)) {
    errors.push(`module must match X.Y format, got ${fm.module}`);
  }

  if (fm.module && fm.part !== undefined) {
    const modulePart = fm.module.split('.')[0];
    if (String(fm.part) !== modulePart) {
      errors.push(`module "${fm.module}" does not match part ${fm.part}`);
    }
  }

  if (fm.technologies !== undefined) {
    if (!Array.isArray(fm.technologies)) {
      errors.push(`technologies must be an array, got ${typeof fm.technologies}`);
    } else if (ALLOWED_TECHNOLOGIES) {
      for (const tech of fm.technologies) {
        if (!ALLOWED_TECHNOLOGIES.has(tech)) {
          errors.push(`technologies entry "${tech}" is not in scripts/technologies.json allowlist`);
        }
      }
    }
  }

  if (fm.tags !== undefined) {
    if (!Array.isArray(fm.tags)) {
      errors.push(`tags must be an array, got ${typeof fm.tags}`);
    } else {
      for (const tag of fm.tags) {
        if (!VALID_TAGS.has(tag)) {
          errors.push(`tags entry "${tag}" is not in the canonical list (see STYLE_GUIDE.md)`);
        }
      }
    }
  }

  // Prerequisite format "X.Y-slug" must resolve against MODULE_REGISTRY;
  // see STYLE_GUIDE.md "Prerequisite slugs".
  if (Array.isArray(fm.prerequisites)) {
    for (const p of fm.prerequisites) {
      if (!/^\d+\.\d+-[a-z0-9-]+$/.test(p)) {
        errors.push(`prerequisites entry "${p}" is not in the form "X.Y-slug"`);
      } else if (!MODULE_REGISTRY.has(p)) {
        errors.push(`prerequisites entry "${p}" does not resolve to any chapter`);
      }
    }
  }

  return errors;
}

async function checkFile(file) {
  // Skip prose READMEs that have no frontmatter and aren't part of the curriculum.
  const norm = file.replace(/\\/g, '/');
  if (norm.endsWith('content/dsa/widgets/README.md') ||
      norm.endsWith('content/dsa/README.md') ||
      norm.endsWith('content/ai-eng/README.md')) {
    return;
  }

  fileCount++;
  const contents = await readFile(file, 'utf8');

  const frontmatterMatch = contents.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const unquotedModule = frontmatterMatch[1].match(/^module:\s+(\d+\.\d+)\s*$/m);
    if (unquotedModule) {
      errorCount++;
      console.error(`\u274c ${file}:`);
      console.error(
        `    module must be a quoted string: module: "${unquotedModule[1]}". ` +
        `Unquoted "${unquotedModule[1]}" parses as a float, breaking e.g. 2.10 -> 2.1.`
      );
      return;
    }
  }

  const fm = parseFrontmatter(contents, file);
  if (!fm) {
    errorCount++;
    return;
  }

  const errors = validate(fm, file);
  if (errors.length > 0) {
    errorCount++;
    console.error(`\u274c ${file}:`);
    for (const err of errors) console.error(`    ${err}`);
  }
}

async function main() {
  const files = [];
  // Every book shares this validator. classify() in validate() dispatches each
  // file to its book/genre-specific schema branch (HLD chapter, HLD trade-off,
  // DSA chapter, DSA editorial, DSA pattern decision page, AI Engineering chapter).
  for await (const f of glob('content/hld/**/*.md')) files.push(f);
  for await (const f of glob('content/dsa/**/*.md')) files.push(f);
  for await (const f of glob('content/ai-eng/**/*.md')) files.push(f);

  if (files.length === 0) {
    console.log('No content files found.');
    exit(0);
  }

  // Pass 1: build the module registries so prereq validation has ground truth.
  for (const f of files) {
    registerModule(f);
    registerAiEngChapter(f);
  }

  // Pass 2: validate each file.
  await Promise.all(files.map(checkFile));

  if (errorCount > 0) {
    console.error(`\n\u274c ${errorCount} of ${fileCount} file(s) have frontmatter issues.\n`);
    exit(1);
  }

  console.log(`\u2713 All ${fileCount} files have valid frontmatter.`);
  exit(0);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  exit(2);
});
