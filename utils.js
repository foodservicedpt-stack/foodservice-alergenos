// ══════════════════════════════════════════════
//  SHARED UTILITIES
//  Used by comedor.html, gestion.html, desayuno.html
// ══════════════════════════════════════════════
window.todayStr = function () {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

window.escHtml = function (s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

window.normalizeAllergenList = function (val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(x => typeof x === 'string');
  if (typeof val === 'object') {
    if (Array.isArray(val.allergenId)) return val.allergenId.filter(x => typeof x === 'string');
    return Object.values(val).filter(x => typeof x === 'string');
  }
  return [];
};

window.normalizeDish = function (raw) {
  if (!raw || typeof raw !== 'object') return raw;
  return {
    ...raw,
    contiene: normalizeAllergenList(raw.contiene),
    trazas: normalizeAllergenList(raw.trazas),
    sinGluten: !!raw.sinGluten,
    oculto: !!raw.oculto,
  };
};

window.minToHHMM = function (total) {
  total = ((total % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

window.hexToRgbaLight = function (hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(x => x + x).join('');
  const r = parseInt(h.substr(0, 2), 16) / 255;
  const g = parseInt(h.substr(2, 2), 16) / 255;
  const b = parseInt(h.substr(4, 2), 16) / 255;
  return `rgba(${r * 255},${g * 255},${b * 255},0.4)`;
};

window.adjustBrightness = function (hex, percent) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(x => x + x).join('');
  let r = parseInt(h.substr(0, 2), 16);
  let g = parseInt(h.substr(2, 2), 16);
  let b = parseInt(h.substr(4, 2), 16);
  r = Math.min(255, Math.max(0, r + percent));
  g = Math.min(255, Math.max(0, g + percent));
  b = Math.min(255, Math.max(0, b + percent));
  return `rgb(${r},${g},${b})`;
};
