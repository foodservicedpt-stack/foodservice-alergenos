// ══════════════════════════════════════════════
//  SHARED TRANSLATION MODULE
//  Used by comedor.html, gestion.html, desayuno.html
// ══════════════════════════════════════════════

window.correctTranslation = function (text) {
  if (!text) return text;
  let corrected = text;
  const lower = text.toLowerCase();
  for (const [wrong, right] of Object.entries(CORRECTOR_PLATOS)) {
    const pattern = new RegExp('\\b' + wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
    if (pattern.test(lower)) {
      corrected = corrected.replace(pattern, right);
    }
  }
  for (const [wrong, right] of Object.entries(CORRECTOR_INGLES)) {
    const pattern = new RegExp('\\b' + wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
    if (pattern.test(lower)) {
      corrected = corrected.replace(pattern, right);
    }
  }
  return corrected;
};

window.toTitleCaseSmart = function (str) {
  const small = new Set(['with', 'in', 'and', 'of', 'the', 'a', 'an', 'on', 'to', 'sauce', 'style', 'de', 'del', 'el', 'la', 'los', 'las', 'y']);
  const words = str.toLowerCase().split(/\s+/);
  return words.map((w, i) => {
    if (i > 0 && small.has(w)) return w;
    return w.replace(/^[\wà-ÿ]/, c => c.toUpperCase());
  }).join(' ');
};

window.autoTranslateDish = async function (dish) {
  if (!dish || !dish.nombreEs || !dish.nombreEs.trim()) return;
  const geminiKey = window.firebaseConfig?.geminiApiKey;
  if (geminiKey && geminiKey !== 'TU_GEMINI_API_KEY_AQUI') {
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert food translator for a restaurant menu shown to native English speakers.

Step 1 — Identify the dish: understand exactly what the Spanish dish is (its ingredients and how it is cooked/served), ignoring any non-food meaning of the words.

Step 2 — Translate like a native English menu: use the name an English-speaking chef or diner would actually use on a menu. Prefer the well-known English name when one exists, and put culinary adjectives before the noun ("Patatas Bravas" → "Crispy Potatoes with Spicy Tomato Sauce", not "Brave Potatoes").

Step 3 — If there is NO established English name, do not keep the Spanish word alone: give a short, appetizing descriptive translation that tells a native speaker what the dish is. Examples: "Gazpacho" → "Chilled Tomato & Vegetable Soup"; "Salmorejo" → "Thick Chilled Tomato Soup"; "Croquetas de Jamón" → "Ham Croquettes".

Rules:
- Keep it concise (2–6 words); a short description is only for dishes without a standard English name.
- Never invent a wrong dish. If unsure, describe it by its main ingredients plus cooking method.
- Return ONLY the English name/description, with no notes, quotes or explanations.

Dish: ${dish.nombreEs.trim()}`
            }]
          }]
        })
      });
      const data = await resp.json();
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const en = correctTranslation(data.candidates[0].content.parts[0].text.trim());
        dish.nombreEn = toTitleCaseSmart(en);
        return dish.nombreEn;
      }
    } catch(e) { console.warn('Gemini translation failed:', e); }
  }
  // Fallback: MyMemory API
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(dish.nombreEs.trim())}&langpair=es|en`;
    const json = await (await fetch(url)).json();
    if (json.responseStatus === 200) {
      const en = correctTranslation(toTitleCaseSmart(json.responseData.translatedText));
      dish.nombreEn = en;
      return en;
    }
  } catch(e) { console.warn(e); }
};
