// Generates public/icons.svg, a <symbol> sprite, from the prototype's icons.js.
// Run with: npm run icons
// icons.js is read as data against an allow-list and never evaluated.
import { readFileSync, writeFileSync } from 'node:fs';

const source = readFileSync(new URL('../../design/prototype/icons.js', import.meta.url), 'utf8');

const lines = source.split(/\r?\n/);
const startLine = lines.findIndex((line) => line.includes('var symbols = {'));
const endLine = lines.findIndex((line, index) => index > startLine && /^\s*};\s*$/.test(line));
if (startLine < 0 || endLine < 0) {
  throw new Error('symbols object literal not found in design/prototype/icons.js');
}

const ENTRY = /^\s*(?:'([a-z0-9-]+)'|([a-z0-9-]+)):\s*'([^'\\]*)',?\s*$/;
const TAG = /\s*<([A-Za-z][\w-]*)((?:\s+[\w:-]+="[^"]*")*)\s*\/>/y;
const ATTR = /\s+([\w:-]+)="([^"]*)"/g;
const TAGS = new Set(['path', 'circle', 'ellipse', 'rect']);
const ATTRIBUTES = new Set([
  'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'width', 'height', 'transform', 'style',
]);
const STYLES = new Set(['fill:currentColor', 'stroke:var(--color-surface)']);

const symbols = [];
for (let index = startLine + 1; index < endLine; index++) {
  const line = lines[index];
  if (line.trim() === '' || line.trimStart().startsWith('//')) continue;

  const entry = ENTRY.exec(line);
  if (!entry) throw new Error(`icons.js line ${index + 1}: not a symbol entry`);
  const key = entry[1] ?? entry[2];
  const value = entry[3];

  let pos = 0;
  while (pos < value.length) {
    TAG.lastIndex = pos;
    const tag = TAG.exec(value);
    if (!tag) {
      const rest = value.slice(pos).trim();
      if (rest === '') break;
      throw new Error(`icon ${key}: tag ${rest} not allowed`);
    }
    const [, tagName, attributes] = tag;
    if (!TAGS.has(tagName)) throw new Error(`icon ${key}: tag ${tagName} not allowed`);

    for (const [, name, attrValue] of attributes.matchAll(ATTR)) {
      if (!ATTRIBUTES.has(name)) throw new Error(`icon ${key}: attribute ${name} not allowed`);
      if (/[<>&]/.test(attrValue)) {
        throw new Error(`icon ${key}: attribute ${name}="${attrValue}" not allowed`);
      }
      if (name === 'style' && !STYLES.has(attrValue)) {
        throw new Error(`icon ${key}: style ${attrValue} not allowed`);
      }
    }
    pos = TAG.lastIndex;
  }

  symbols.push([key, value]);
}

const attributes =
  'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"';
const body = symbols
  .map(([key, content]) => `<symbol id="${key}" ${attributes}>${content}</symbol>`)
  .join('');

writeFileSync(
  new URL('../public/icons.svg', import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg"><defs>${body}</defs></svg>\n`,
);
console.log(`wrote ${symbols.length} symbols to public/icons.svg`);
