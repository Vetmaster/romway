// Align an opened card below the headers that remain fixed while scrolling.
export function revealCard(element, {focus = false} = {}) {
  if (!element) return;
  if (focus) { element.tabIndex = -1; element.focus({preventScroll: true}); }
  requestAnimationFrame(() => {
    if (!element.isConnected || !element.getClientRects().length) return;
    let offset = 0;
    for (const header of document.querySelectorAll('.app-banner, .topbar')) {
      const style = getComputedStyle(header);
      if (!['sticky', 'fixed'].includes(style.position) || style.top === 'auto') continue;
      offset = Math.max(offset, parseFloat(style.top) + header.getBoundingClientRect().height);
    }
    window.scrollTo({top: Math.max(0, window.scrollY + element.getBoundingClientRect().top - offset - 12), behavior: 'instant'});
  });
}
