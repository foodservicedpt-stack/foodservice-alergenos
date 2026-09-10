# INTEGRACIÓN CONTROLADA — feat/layout-engine

**Fecha:** 2026-09-10
**Estado:** rama preparada, **sin merge, sin PR, sin deploy, sin tocar `main` ni Firebase.**

---

## A) Commit base

`23bd66cb86aa9a3469fe98d9687b819194d6db7f` — `refactor(comedor): badge 'sin gluten' al lado del nombre EN`
(main local == origin/main == 23bd66c).

## B) Rama

`feat/layout-engine`, creada **desde `main`**.

> **Desviación necesaria del paso 2:** el working tree del repositorio de producción **no estaba
> limpio** (21 entradas modificadas/sin trackear, incluidas `comedor.html` y
> `comidas_especiales.html`). Para no arriesgar trabajo sin commitear, la rama se creó en un
> **clon aislado** del `main` commiteado. El repositorio original, su working tree y `main`
> quedan **intactos**.

## C) Archivos modificados

| Archivo | Cambio |
|---|---|
| `comedor.html` | Solo el mecanismo de sizing/paginación y el estado "Comedor cerrado" |

## D) Archivos nuevos

| Archivo | Para qué |
|---|---|
| `layout-engine.js` | Motor determinista (medición real, escala binaria, paginación, validación) |
| `fixtures.js` | Fixture compartido `MENU12_CANONICAL` |
| `tests/run-layout-tests.mjs` | Suite de auditoría automatizada (bloquea Firebase) |
| `tests/README.md` | Cómo ejecutar los tests |
| `INTEGRATION_REPORT.md` | Este informe |

## E) Tests ANTES (baseline `main`)

La suite estricta no puede ejecutarse sobre `main` porque no existe `LayoutEngine`; se midió el
resultado real del sistema antiguo con el fixture canónico:

| Resolución | Sistema | escala | páginas | total/entrada | overflow V/H | clipping | fuera de fila | solape |
|---|---|---|---|---|---|---|---|---|
| 1920×1080 | **main (antes)** | — | 12 | 12/12 | false / false | **11** | **316** | 0 |
| 3840×2160 | **main (antes)** | — | 12 | 12/12 | false / false | **24** | **317** | 0 |

El sistema antiguo **no reporta overflow** (el `flex-shrink` lo enmascara) pero recorta 11–24
elementos y deja 316+ elementos fuera de su fila.

## F) Tests DESPUÉS (rama)

```
TOTAL: PASS=8 WARN=1 FAIL=0
```

| TEST | RESULTADO | EVIDENCIA |
|---|---|---|
| Matriz de layout (A–H + MENU12, 4 resoluciones, 1–20) | PASS | 292 casos, 0 fallos |
| Cobertura de pantallas con layout-engine | WARN | con motor: comedor · sin motor: comidas |
| MENU12_CANONICAL carga limpia | PASS | 1280: 0.792 `content-limited` · 1920: 0.859 · 2560: 0.862 · 3840: 0.877 |
| Resize determinista | PASS | idéntico en las 4 resoluciones |
| Cambios de contenido sin recargar | PASS | 8 pasos, reproducible=true |
| Caso imposible | PASS | unfit=true, reason=unfit-min-scale, 1 motor, 22 ms |
| Comedor cerrado | PASS | 4 textos exactos, prohibidos=[], reloj vivo |
| Overflow decorativo del cierre | PASS | scroll === client |
| Desayuno | PASS | no usa layout-engine; sin overflow |

Comparación directa con el mismo fixture:

| Resolución | Sistema | escala | páginas | total/entrada | clipping | fuera de fila | solape |
|---|---|---|---|---|---|---|---|
| 1920×1080 | **rama (después)** | 0.859 | 4+1+1+4+1+1 | 12/12 | **0** | **0** | 0 |
| 3840×2160 | **rama (después)** | 0.877 | 4+2+4+2 | 12/12 | **0** | **0** | 0 |

## G) Diferencias visuales detectadas

- **Sizing/paginación:** `main` amontona los 12 platos en una pantalla (nombres solapados y
  truncados); la rama muestra 4 por página, con nombres y traducciones completos y paginación.
- **Estado "Comedor cerrado":** se eliminan "El comedor está cerrado", "The dining room is closed"
  y "HORA ACTUAL · CURRENT TIME". El halo decorativo pasa de pseudo-elemento a capa de fondo
  (mismo aspecto, sin overflow).
- **Sin cambios** en: títulos de cabecera, traducciones, iconos de alérgenos, etiquetas
  CONTIENE/TRAZAS, leyenda lateral, márgenes, espacios, colores, bordes ni tipografías base.
  **No se han añadido fotografías.**

## H) Riesgos de integración

1. **`comidas_especiales.html` NO se integra.** `main` usa un mecanismo de layout propio
   (`dishContentOverflows`, `fitNoAllergenBadges`, line-clamp deliberado, sin `initDishPagination`),
   y la preview validó una versión distinta (la del árbol de trabajo sin commitear). Integrarlo sería
   un cambio nuevo no validado → **fuera de alcance**.
2. El working tree de producción tiene trabajo sin commitear que **no** se ha incluido.
3. `unfit-min-scale` se detecta y registra (consola + atributo `data-layout-unfit`) pero **no tiene
   aviso visual** (decisión de producto aceptada).
4. `content-limited` puede bajar de 0.85 si el contenido lo exige (decisión de producto aceptada).
5. No hay CI: los tests se ejecutan a mano.

## I) Cambios que puedan afectar a datos existentes

**Ninguno.** No se modifican campos ni rutas de Firebase, ni reglas, ni credenciales, ni se realizan
operaciones sobre datos. El motor consume el formato actual `menu/comedor.platos` sin cambios
(`nombreEs`, `nombreEn`, `contiene`, `trazas`, `sinGluten`, `oculto`). No se necesita capa
adaptadora.
