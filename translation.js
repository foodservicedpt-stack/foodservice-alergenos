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
              text: `You are translating Spanish dish names from a restaurant menu to natural English. Rules:
1. Always choose the culinary/food meaning (e.g. "berlina" = doughnut, not sedan).
2. Use natural restaurant menu English. "con X" → "in X sauce" or "with X". "de X" → "X". "a la Y" → "Y-style".
3. Cuisine adjectives BEFORE dish name: "Pansit Filipino" → "Filipino Pansit", "Paella Valenciana" → "Valencian Paella", "Gazpacho Andaluz" → "Andalusian Gazpacho".
4. Generic names: "Ensalada" → "Garden Salad", "Fruta" → "Fresh Fruit", "Pan" → "Bread", "Helado" → "Ice Cream with [flavor]".
5. Keep concise (2-5 words). Return ONLY the translation: ${dish.nombreEs.trim()}`
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
