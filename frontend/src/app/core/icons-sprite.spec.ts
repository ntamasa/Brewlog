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

describe('generated icon sprite', () => {
  it('has a symbol for every icon the app uses', () => {
    for (const key of ICON_KEYS) {
      expect(sprite).toContain(`<symbol id="${key}"`);
    }
  });
});
