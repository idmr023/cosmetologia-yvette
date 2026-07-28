import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));

function isCodeFence(line) {
  return /^```/.test(line) || /^\{code\}|\{code:/.test(line.trim());
}

function codeFenceLang(line) {
  const m = line.trim().match(/^```(\w*)/);
  if (m) return m[1];
  const m2 = line.trim().match(/^\{code:(\w+)\}/);
  if (m2) return m2[1];
  return '';
}

function isTableRow(line) {
  return /^\s*\|.+\|$/.test(line);
}

function isTableSeparator(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return false;
  const inner = trimmed.slice(1, -1);
  const cells = inner.split('|');
  return cells.length > 0 && cells.every(c => /^[\s:\-]*$/.test(c));
}

function applyInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '*$1*')
    .replace(/`([^`]+)`/g, '{{$1}}')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[$1|$2]');
}

function convertMdToConfluence(text) {
  const lines = text.split('\n');
  const output = [];
  const len = lines.length;

  let inCodeBlock = false;
  let inTable = false;
  let inQuote = false;
  const quoteBuffer = [];

  function flushQuote() {
    if (quoteBuffer.length > 0) {
      output.push('{quote}');
      output.push(...quoteBuffer);
      output.push('{quote}');
      quoteBuffer.length = 0;
    }
    inQuote = false;
  }

  for (let i = 0; i < len; i++) {
    let line = lines[i];
    const trimmed = line.trim();

    // --- Code blocks ---
    if (isCodeFence(line)) {
      flushQuote();
      inTable = false;
      if (inCodeBlock) {
        output.push('{code}');
        inCodeBlock = false;
      } else {
        const lang = codeFenceLang(line);
        output.push(lang ? `{code:${lang}}` : '{code}');
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      output.push(line);
      continue;
    }

    // --- Blockquotes ---
    if (line.startsWith('> ')) {
      inTable = false;
      quoteBuffer.push(applyInline(line.slice(2)));
      inQuote = true;
      continue;
    } else {
      if (inQuote) flushQuote();
    }

    // --- Tables ---
    if (isTableRow(line)) {
      flushQuote();
      const nextIsSep = i + 1 < len && isTableSeparator(lines[i + 1]);

      if (isTableSeparator(line)) {
        continue;
      }

      if (nextIsSep) {
        // Header row: use || delimiters
        const cells = line.split('|').filter(c => c.trim() !== '');
        output.push('|| ' + cells.map(c => applyInline(c.trim())).join(' || ') + ' ||');
        i++;
        inTable = true;
      } else {
        output.push(applyInline(line));
        inTable = true;
      }
      continue;
    } else {
      if (inTable) inTable = false;
    }

    // --- Regular line processing ---
    let processed = line;

    processed = processed.replace(/^#### (.+)/, 'h4. $1');
    processed = processed.replace(/^### (.+)/, 'h3. $1');
    processed = processed.replace(/^## (.+)/, 'h2. $1');
    processed = processed.replace(/^# (.+)/, 'h1. $1');

    processed = applyInline(processed);

    processed = processed.replace(/- \[ \] /g, '- ');
    processed = processed.replace(/- \[x\] /g, '- ');

    if (/^---+$/.test(processed.trim())) {
      processed = processed.replace(/^---+/g, '----');
    }

    output.push(processed);
  }

  if (inQuote) flushQuote();
  if (inCodeBlock) output.push('{code}');

  return output.join('\n');
}

function getAllMdFiles(dir) {
  const entries = readdirSync(dir);
  const files = [];
  for (const entry of entries) {
    if (entry === 'convert-to-confluence.mjs') continue;
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...getAllMdFiles(fullPath));
    } else if (extname(fullPath) === '.md') {
      files.push(fullPath);
    }
  }
  return files;
}

const files = getAllMdFiles(ROOT);
console.log(`Found ${files.length} .md files`);

for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  const converted = convertMdToConfluence(content);
  writeFileSync(file, converted, 'utf-8');
  console.log(`  ✅ ${file.replace(ROOT, '')}`);
}

console.log('\nDone!');
