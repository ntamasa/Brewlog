// Generates public/icons.svg, a <symbol> sprite, from the prototype's icons.js.
// Run with: npm run icons
import { readFileSync, writeFileSync } from 'node:fs';

const source = readFileSync(new URL('../../design/prototype/icons.js', import.meta.url), 'utf8');

const lines = source.split('\n');
const startLine = lines.findIndex((line) => line.includes('var symbols = {'));
const endLine = lines.findIndex((line, index) => index > startLine && /^\s*};\s*$/.test(line));
if (startLine < 0 || endLine < 0) {
  throw new Error('symbols object literal not found in design/prototype/icons.js');
}

const literal = lines
  .slice(startLine, endLine + 1)
  .join('\n')
  .replace(/^\s*var symbols = /, '')
  .replace(/;\s*$/, '');
const symbols = new Function(`return (${literal});`)();

const attributes =
  'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"';
const body = Object.entries(symbols)
  .map(([key, content]) => `<symbol id="${key}" ${attributes}>${content}</symbol>`)
  .join('');

writeFileSync(
  new URL('../public/icons.svg', import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg"><defs>${body}</defs></svg>\n`,
);
console.log(`wrote ${Object.keys(symbols).length} symbols to public/icons.svg`);
