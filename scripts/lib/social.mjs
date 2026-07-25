/**
 * Single Source of Truth für ConjuExpert Social-Profile + Footer-Icon-Reihe.
 *
 * Verwendet von build-blog-chrome.mjs, generate-verb-pages.mjs,
 * build-konjugation-hubs.mjs und build-konjugation-index.mjs.
 * Die statischen Seiten (Landing, index.html, Rechtstexte) tragen dieselbe
 * Markup wörtlich — bei Link-Änderungen dort mitziehen.
 *
 * Icons sind Inline-SVG (kein externer Request, CSP-sicher) und erben die
 * Textfarbe (currentColor). Styling ist inline, damit die Reihe ohne
 * Stylesheet-Änderung in jeden Footer passt.
 */

export const SOCIAL = [
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/conjuexpert.app/',
    path: 'M12 2c-2.72 0-3.06.01-4.12.06-1.07.05-1.8.22-2.43.47-.66.25-1.22.6-1.77 1.15-.55.55-.9 1.1-1.15 1.77-.25.63-.42 1.36-.47 2.43C2.01 8.94 2 9.28 2 12s.01 3.06.06 4.12c.05 1.07.22 1.8.47 2.43.25.66.6 1.22 1.15 1.77.55.55 1.1.9 1.77 1.15.63.25 1.36.42 2.43.47C8.94 21.99 9.28 22 12 22s3.06-.01 4.12-.06c1.07-.05 1.8-.22 2.43-.47.66-.25 1.22-.6 1.77-1.15.55-.55.9-1.1 1.15-1.77.25-.63.42-1.36.47-2.43.05-1.06.06-1.4.06-4.12s-.01-3.06-.06-4.12c-.05-1.07-.22-1.8-.47-2.43-.25-.66-.6-1.22-1.15-1.77-.55-.55-1.1-.9-1.77-1.15-.63-.25-1.36-.42-2.43-.47C15.06 2.01 14.72 2 12 2zm0 1.8c2.67 0 2.99.01 4.04.06.97.05 1.5.21 1.85.35.47.18.8.4 1.15.75.35.35.57.68.75 1.15.14.35.3.88.35 1.85.05 1.05.06 1.37.06 4.04s-.01 2.99-.06 4.04c-.05.97-.21 1.5-.35 1.85-.18.47-.4.8-.75 1.15-.35.35-.68.57-1.15.75-.35.14-.88.3-1.85.35-1.05.05-1.37.06-4.04.06s-2.99-.01-4.04-.06c-.97-.05-1.5-.21-1.85-.35-.47-.18-.8-.4-1.15-.75-.35-.35-.57-.68-.75-1.15-.14-.35-.3-.88-.35-1.85-.05-1.05-.06-1.37-.06-4.04s.01-2.99.06-4.04c.05-.97.21-1.5.35-1.85.18-.47.4-.8.75-1.15.35-.35.68-.57 1.15-.75.35-.14.88-.3 1.85-.35C9.01 3.81 9.33 3.8 12 3.8zm0 3.06A5.14 5.14 0 1 0 12 17.14 5.14 5.14 0 0 0 12 6.86zm0 8.47A3.33 3.33 0 1 1 12 8.67a3.33 3.33 0 0 1 0 6.66zm5.34-8.67a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z',
  },
  {
    name: 'TikTok',
    url: 'https://www.tiktok.com/@jane.von.conjuexpe',
    path: 'M16.6 5.82a4.28 4.28 0 0 1-1.05-2.82h-3.11v12.31a2.54 2.54 0 0 1-2.53 2.48 2.54 2.54 0 0 1-.6-5.01 2.54 2.54 0 0 1 .6.08V9.7a5.66 5.66 0 0 0-.6-.03 5.65 5.65 0 1 0 5.65 5.65V9.01a7.3 7.3 0 0 0 4.28 1.37V7.27a4.28 4.28 0 0 1-2.64-1.45z',
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@ConjuExpertApp',
    path: 'M23.5 6.5a3.02 3.02 0 0 0-2.12-2.14C19.5 3.85 12 3.85 12 3.85s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.5 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.5 3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.5zM9.6 15.6V8.4l6.24 3.6z',
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=61592183729019',
    path: 'M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z',
  },
];

/**
 * Liefert die Footer-Social-Reihe als HTML-String.
 * @param {{cls?:string,size?:number,gap?:number,mt?:number}} [opts]
 */
export function socialRow(opts = {}) {
  const { cls = 'social-row', size = 22, gap = 18, mt = 14 } = opts;
  const links = SOCIAL.map((s) =>
    `<a href="${s.url}" target="_blank" rel="me noopener" aria-label="ConjuExpert auf ${s.name}" title="${s.name}" style="display:inline-flex;color:inherit;opacity:.72">`
    + `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${s.path}"/></svg></a>`
  ).join('');
  return `<div class="${cls}" style="margin-top:${mt}px;display:flex;gap:${gap}px;justify-content:center;align-items:center;flex-wrap:wrap">${links}</div>`;
}
