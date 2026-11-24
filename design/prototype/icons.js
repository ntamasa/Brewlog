/* Brewlog fine-line icon sprite (24px grid, 1.25px stroke). Injected once per page; use <svg class="icon"><use href="#i-name"/></svg>. */
(function () {
  var s = function (d) { return d; };
  var symbols = {
    // Brand mark: bean inside a ring
    logo: '<circle cx="12" cy="12" r="10.25"/><ellipse cx="12" cy="12" rx="4.4" ry="6.6" transform="rotate(28 12 12)"/><path d="M13.6 6.6c-2.6 2.2-.6 4.6-3.2 10.8"/>',
    // Rating bean (outline) and filled bean
    bean: '<ellipse cx="12" cy="12" rx="6" ry="9" transform="rotate(30 12 12)"/><path d="M15 4.9c-4 3.2-1 6.9-6 14.2"/>',
    'bean-fill': '<ellipse cx="12" cy="12" rx="6" ry="9" transform="rotate(30 12 12)" style="fill:currentColor"/><path d="M15 4.9c-4 3.2-1 6.9-6 14.2" style="stroke:var(--color-surface)"/>',
    // Brew methods
    espresso: '<path d="M5.5 10h11v3.2a5.2 5.2 0 0 1-5.2 5.2h-.6a5.2 5.2 0 0 1-5.2-5.2z"/><path d="M16.5 11.2h1.3a2.1 2.1 0 0 1 0 4.2h-1.9"/><path d="M3.5 20.5h15"/><path d="M9 3.5c-.9 1.3.9 2.2 0 3.6M12.5 3.5c-.9 1.3.9 2.2 0 3.6"/>',
    'pour-over': '<path d="M4.5 4.5h15l-5.2 7h-4.6z"/><path d="M3.5 4.5h17"/><path d="M10 11.5v1.5h4v-1.5"/><path d="M7.8 13h8.4l1.3 5.6a1.6 1.6 0 0 1-1.6 1.9H8.1a1.6 1.6 0 0 1-1.6-1.9z"/><path d="M12 1.8v1.4"/>',
    'french-press': '<path d="M6.5 7h9.5v12.3a1.2 1.2 0 0 1-1.2 1.2H7.7a1.2 1.2 0 0 1-1.2-1.2z"/><path d="M16 9h1.8a.7.7 0 0 1 .7.7v6.6a.7.7 0 0 1-.7.7H16"/><path d="M11.25 2.5v4.5M9 2.5h4.5"/><path d="M5.8 7h11"/><path d="M6.5 12.5h9.5"/><path d="M6.5 20.5h9.5"/>',
    aeropress: '<path d="M8.5 2.5h7v3h-7z"/><path d="M9.5 5.5h5v10h-5z"/><path d="M5.5 15.5h13v1.8h-13z"/><path d="M7 17.3l1 3.2h8l1-3.2"/><path d="M9.5 9h5"/>',
    'moka-pot': '<path d="M8.2 4.5h7.6l1.6 6.5H6.6z"/><path d="M11 3h2"/><path d="M6.6 11h10.8"/><path d="M6.6 11L5 20.5h14L17.4 11"/><path d="M17 5.5h2.2l-1.1 5"/><path d="M8.5 15.5h7"/>',
    'cold-brew': '<path d="M6.5 7.5h11v11.3a1.7 1.7 0 0 1-1.7 1.7H8.2a1.7 1.7 0 0 1-1.7-1.7z"/><path d="M6 4h12v3.5H6z"/><rect x="8.8" y="10.5" width="3" height="3" rx=".4" transform="rotate(-10 10.3 12)"/><rect x="12.3" y="14.2" width="3" height="3" rx=".4" transform="rotate(12 13.8 15.7)"/><path d="M14.5 2v5.5"/>',
    cup: '<path d="M4.5 9h12v4.5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z"/><path d="M16.5 10h1.3a2.3 2.3 0 0 1 0 4.6h-1.6"/><path d="M8.5 3.5c-.9 1.3.9 2.2 0 3.6M12 3.5c-.9 1.3.9 2.2 0 3.6"/><path d="M3.5 21h15"/>',
    // UI
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.4-4.4"/>',
    sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    sort: '<path d="M7 4v16M4 7l3-3 3 3"/><path d="M17 20V4M14 17l3 3 3-3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    more: '<circle cx="12" cy="5.5" r=".9" style="fill:currentColor"/><circle cx="12" cy="12" r=".9" style="fill:currentColor"/><circle cx="12" cy="18.5" r=".9" style="fill:currentColor"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    'chevron-down': '<path d="M6 9l6 6 6-6"/>',
    'chevron-left': '<path d="M15 6l-6 6 6 6"/>',
    'chevron-right': '<path d="M9 6l6 6-6 6"/>',
    'arrow-right': '<path d="M4 12h16M14 6l6 6-6 6"/>',
    edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    trash: '<path d="M4 7h16M10 4h4M6 7l1 12.5a1.5 1.5 0 0 0 1.5 1.5h7a1.5 1.5 0 0 0 1.5-1.5L18 7"/><path d="M10 11v6M14 11v6"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="1.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5"/><circle cx="12" cy="16.3" r=".6" style="fill:currentColor"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    refresh: '<path d="M20 6v5h-5"/><path d="M19.3 11A7.5 7.5 0 1 0 17 16.8"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.6 2.6 14.4 0 17M12 3.5c-2.6 2.6-2.6 14.4 0 17"/>',
    notebook: '<rect x="5" y="3.5" width="14" height="17" rx="1.2"/><path d="M8.5 3.5v17M11.5 8h4.5M11.5 11.5h4.5"/>',
    filter: '<path d="M4 5h16l-6 7.5V19l-4 1.5v-8z"/>',
    drag: '<path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01"/>'
  };
  var ns = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
  var html = '';
  for (var k in symbols) html += '<symbol id="i-' + k + '" viewBox="0 0 24 24">' + s(symbols[k]) + '</symbol>';
  svg.innerHTML = html;
  (document.body || document.documentElement).insertBefore(svg, (document.body || document.documentElement).firstChild);
})();
