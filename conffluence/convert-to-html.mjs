import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const LINK_PLACEHOLDER = '\x00LINK\x00';

function protectLinks(text) {
  const links = [];
  const result = text.replace(/\[([^\]]+?)\|([^\]]+?)\]/g, (_m, t, u) => {
    const idx = links.length;
    links.push({ text: t, url: u });
    return `${LINK_PLACEHOLDER}${idx}${LINK_PLACEHOLDER}`;
  });
  return { text: result, links };
}

function restoreLinks(text, links) {
  return text.replace(new RegExp(LINK_PLACEHOLDER + '(\\d+)' + LINK_PLACEHOLDER, 'g'), (_m, idx) => {
    const l = links[parseInt(idx)];
    return `<a href="${escapeHtml(l.url)}">${escapeHtml(l.text)}</a>`;
  });
}

function ensureAbsoluteHref(url) {
  if (url.startsWith('./') || url.startsWith('../') || url.startsWith('http')) return url;
  if (url.startsWith('#')) return url;
  return url;
}

function applyInline(text) {
  let result = text;

  // {{code}} → <code>
  result = result.replace(/\{\{(.+?)\}\}/g, (_m, c) => `<code>${escapeHtml(c)}</code>`);

  // *bold* (but not * at start of line followed by space = list item)
  result = result.replace(/(?<!\*)\*(?!\s)(.+?)\*(?!\*)/g, '<strong>$1</strong>');

  // [text|url] → <a>
  result = result.replace(/\[([^\]]+?)\|([^\]]+?)\]/g, (_m, t, u) => {
    const href = u.startsWith('./') ? u : u;
    return `<a href="${escapeHtml(href)}">${escapeHtml(t)}</a>`;
  });

  return result;
}

function isCodeFence(line) {
  return /^\{code\}$/.test(line.trim()) || /^\{code:\w+\}$/.test(line.trim());
}

function isTableRow(line) {
  return /^\s*\|/.test(line) && /\|\s*$/.test(line);
}

function isTableHeader(line) {
  return /^\|\|/.test(line.trim());
}

function isListItem(line) {
  return /^[-*] /.test(line.trimStart());
}

function isHeading(line) {
  return /^h[1-4]\.\s/.test(line);
}

function parseHeading(line) {
  const m = line.match(/^h([1-4])\.\s+(.+)/);
  if (!m) return null;
  const level = m[1];
  const text = applyInline(m[2].trim());
  return `<h${level}>${text}</h${level}>`;
}

function parseTable(headers, rows) {
  let html = '<table>\n';

  if (headers.length > 0) {
    html += '  <thead>\n    <tr>\n';
    for (const cell of headers) {
      html += `      <th>${cell}</th>\n`;
    }
    html += '    </tr>\n  </thead>\n';
  }

  if (rows.length > 0) {
    html += '  <tbody>\n';
    for (const row of rows) {
      html += '    <tr>\n';
      for (const cell of row) {
        html += `      <td>${cell}</td>\n`;
      }
      html += '    </tr>\n';
    }
    html += '  </tbody>\n';
  }

  html += '</table>';
  return html;
}

function parseTableRow(line) {
  const { text, links } = protectLinks(line);
  let cells;
  if (isTableHeader(text)) {
    const inner = text.trim().slice(2, -2);
    cells = inner.split('||').map(c => applyInline(c.trim()));
  } else {
    const inner = text.trim().slice(1, -1);
    cells = inner.split('|').map(c => applyInline(c.trim()));
  }
  return cells.map(c => restoreLinks(c, links));
}

function convertToHtml(text) {
  const lines = text.split('\n');
  const output = [];
  const len = lines.length;

  let inCodeBlock = false;
  let codeBuffer = [];
  let inQuote = false;
  let quoteBuffer = [];
  let tableHeaders = null;
  let tableRows = [];
  let inTable = false;
  let listBuffer = [];
  let listType = null;
  let inList = false;
  let paraBuffer = [];

  function flushPara() {
    if (paraBuffer.length === 0) return;
    const p = paraBuffer.map(l => applyInline(l)).join('<br>\n');
    output.push(`<p>${p}</p>`);
    paraBuffer = [];
  }

  function flushTable() {
    if (!inTable && tableHeaders === null && tableRows.length === 0) return;
    output.push(parseTable(tableHeaders || [], tableRows));
    tableHeaders = null;
    tableRows = [];
    inTable = false;
  }

  function flushList() {
    if (!inList || listBuffer.length === 0) return;
    const tag = listType === 'ol' ? 'ol' : 'ul';
    const items = listBuffer.map(item => {
      const content = item.replace(/^[-*] /, '').replace(/^# /, '');
      return `  <li>${applyInline(content)}</li>`;
    }).join('\n');
    output.push(`<${tag}>\n${items}\n</${tag}>`);
    listBuffer = [];
    listType = null;
    inList = false;
  }

  function startList(line) {
    const type = line.trimStart().startsWith('#') ? 'ol' : 'ul';
    if (inList && type !== listType) flushList();
    listType = type;
    inList = true;
    listBuffer.push(line);
  }

  for (let i = 0; i < len; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // --- Code blocks ---
    if (isCodeFence(line)) {
      if (inCodeBlock) {
        const lang = codeBuffer.lang || '';
        const content = codeBuffer.join('\n');
        if (lang) {
          output.push(`<pre><code class="language-${escapeHtml(lang)}">${escapeHtml(content)}</code></pre>`);
        } else {
          output.push(`<pre><code>${escapeHtml(content)}</code></pre>`);
        }
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        const m = trimmed.match(/^\{code:(\w+)\}$/);
        codeBuffer = [];
        codeBuffer.lang = m ? m[1] : '';
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // --- Blockquotes ---
    if (/^\{quote\}$/.test(trimmed)) {
      if (inQuote) {
        const content = quoteBuffer.join('<br>\n');
        output.push(`<blockquote><p>${applyInline(content)}</p></blockquote>`);
        quoteBuffer = [];
        inQuote = false;
      } else {
        inQuote = true;
      }
      continue;
    }

    if (inQuote) {
      quoteBuffer.push(line);
      continue;
    }

    // --- Empty line ---
    if (trimmed === '') {
      flushPara();
      flushTable();
      flushList();
      continue;
    }

    // --- Headings ---
    if (isHeading(line)) {
      flushPara();
      flushTable();
      flushList();
      output.push(parseHeading(line));
      continue;
    }

    // --- Horizontal rule ---
    if (/^----$/.test(trimmed)) {
      flushPara();
      flushTable();
      flushList();
      output.push('<hr>');
      continue;
    }

    // --- Tables ---
    if (isTableRow(line)) {
      flushPara();
      flushList();
      const cells = parseTableRow(line);
      if (isTableHeader(line)) {
        if (inTable) flushTable();
        tableHeaders = cells;
        inTable = true;
      } else {
        tableRows.push(cells);
        inTable = true;
      }
      continue;
    } else {
      if (inTable) flushTable();
    }

    // --- Lists ---
    if (isListItem(line)) {
      flushPara();
      flushTable();
      startList(line);
      continue;
    } else {
      if (inList) flushList();
    }

    // --- Regular paragraph text ---
    paraBuffer.push(line);
  }

  // Flush remaining buffers
  flushPara();
  flushTable();
  flushList();

  if (inCodeBlock) {
    const content = codeBuffer.join('\n');
    output.push(`<pre><code>${escapeHtml(content)}</code></pre>`);
  }

  if (inQuote) {
    const content = quoteBuffer.join('<br>\n');
    output.push(`<blockquote><p>${applyInline(content)}</p></blockquote>`);
  }

  return output.join('\n\n');
}

function wrapHtmlDocument(title, content) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body>
${content}
</body>
</html>`;
}

function getAllMdFiles(dir) {
  const entries = readdirSync(dir);
  const files = [];
  for (const entry of entries) {
    if (entry === 'convert-to-confluence.mjs' || entry === 'convert-to-html.mjs') continue;
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
  const htmlBody = convertToHtml(content);
  const title = basename(file, '.md');
  const html = wrapHtmlDocument(title, htmlBody);
  const outPath = file.replace(/\.md$/, '.html');
  writeFileSync(outPath, html, 'utf-8');
  console.log(`  ✅ ${outPath.replace(ROOT, '')}`);
}

console.log('\nDone!');
