// Single source of truth for the pre-paint theme script. Kept in its own module
// so next.config.ts can hash it for the CSP header while layout.tsx inlines it.
export const themeScript = `
(function() {
  var t = localStorage.getItem('oss-signal-theme');
  var dark = t !== 'light';
  document.documentElement.classList.toggle('dark', dark);
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', dark ? '#1a1714' : '#fafafa');
})()
`;
