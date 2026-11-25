import sprite from '../../../public/icons.svg' with { loader: 'text' };

const ICON_KEYS = [
  'logo',
  'bean',
  'bean-fill',
  'espresso',
  'pour-over',
  'french-press',
  'aeropress',
  'moka-pot',
  'cold-brew',
  'cup',
  'search',
  'sliders',
  'plus',
  'more',
  'close',
  'arrow-right',
  'edit',
  'trash',
  'lock',
  'alert',
  'check',
  'refresh',
  'calendar',
];

const ALLOWED_ELEMENTS = ['svg', 'defs', 'symbol', 'path', 'circle', 'ellipse', 'rect'];
const ALLOWED_ATTRIBUTES = [
  'd',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'x',
  'y',
  'width',
  'height',
  'transform',
  'style',
];
const ALLOWED_SYMBOL_ATTRIBUTES = [
  'id',
  'viewBox',
  'fill',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
];

function isAllowedAttribute(element: Element, name: string): boolean {
  if (ALLOWED_ATTRIBUTES.includes(name)) return true;
  if (element.localName === 'svg' && name === 'xmlns') return true;
  return element.localName === 'symbol' && ALLOWED_SYMBOL_ATTRIBUTES.includes(name);
}

function disallowedParts(svgText: string): string[] {
  const root = new DOMParser().parseFromString(svgText, 'image/svg+xml').documentElement;
  const problems: string[] = [];

  const visit = (element: Element): void => {
    const name = element.localName;
    if (!ALLOWED_ELEMENTS.includes(name)) {
      problems.push(`element ${name}`);
    } else {
      for (const attribute of Array.from(element.attributes)) {
        if (!isAllowedAttribute(element, attribute.name)) {
          problems.push(`attribute ${attribute.name} on ${name}`);
        }
      }
    }
    for (const child of Array.from(element.children)) visit(child);
  };

  visit(root);
  return problems;
}

describe('generated icon sprite', () => {
  it('has a symbol for every icon the app uses', () => {
    for (const key of ICON_KEYS) {
      expect(sprite).toContain(`<symbol id="${key}"`);
    }
  });

  it('contains only allowed elements and attributes', () => {
    expect(disallowedParts(sprite)).toEqual([]);
  });

  it('reports disallowed elements and attributes', () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" onload="x"><defs><symbol id="a" viewBox="0 0 24 24" fill="none">' +
      '<image href="a.png"/><path d="M0 0" onclick="x"/></symbol></defs></svg>';

    expect(disallowedParts(svg)).toEqual([
      'attribute onload on svg',
      'element image',
      'attribute onclick on path',
    ]);
  });
});
