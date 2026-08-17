# 👁️ Agente de Visión para Accesibilidad

## ¿Qué es?

Un sistema que **"ve" la pantalla del comedor en tiempo real**, analiza la visibilidad del contenido y **aplica ajustes automáticamente** para garantizar máxima accesibilidad.

## Componentes

### 1. `comedor.html` (Pantalla TV)
- **Captura screenshots** cada vez que el agente lo solicita
- **Envía métricas** de accesibilidad (contraste, tamaños, overflow)
- **Recibe ajustes** del panel y los aplica instantáneamente
- Usa `html2canvas` para capturar la pantalla completa

### 2. `agente-vision.html` (Panel de Control)
- **Vista en vivo** de lo que muestra la TV
- **Métricas en tiempo real**: contraste WCAG, tamaño texto, iconos, overflow
- **Controles manuales**: sliders para ajustar tamaños individualmente
- **Agente IA automático**: ajusta solo según reglas de accesibilidad
- **Auto-captura continua**: analiza cada 5 segundos si está activado
- **Recomendaciones inteligentes**: te dice qué mejorar y por qué

## Cómo usarlo

### Paso 1: Abrir la pantalla del comedor
```
1. Abre comedor.html en la TV o navegador principal
2. Asegúrate de que Firebase esté configurado correctamente
3. Verifica que se vea el menú del día
```

### Paso 2: Abrir el panel del agente
```
1. Abre agente-vision.html en tu ordenador/móvil
2. Espera a que aparezca "✅ Conectado al comedor"
3. Las métricas empezarán a actualizarse automáticamente
```

### Paso 3: Usar el agente

#### Modo Manual
- Usa los **sliders** para ajustar tamaños
- Los cambios se aplican **instantáneamente** en la TV
- Observa las **métricas** para ver el impacto

#### Modo Automático (Recomendado)
1. Activa el toggle **"🤖 Agente IA Automático"**
2. El agente analizará las métricas y:
   - ✅ Si contraste < 4.5:1 → Aumentará tamaños
   - ✅ Si hay overflow → Reducirá iconos
   - ✅ Si texto < 28px → Lo aumentará gradualmente
3. Verás las **recomendaciones** en tiempo real

#### Auto-Captura Continua
- Activa **"🔄 Auto-Captura Continua"**
- Capturará la pantalla cada 5 segundos
- Útil para monitorizar cambios dinámicos

## Métricas que vigila el agente

| Métrica | Óptimo | Mínimo | Acción si no cumple |
|---------|--------|--------|---------------------|
| Contraste WCAG | ≥7:1 | ≥4.5:1 | Aumenta tamaños |
| Texto principal | ≥32px | ≥28px | Incrementa vw |
| Iconos | ≥64px | ≥48px | Ajusta según overflow |
| Overflow | No | No | Reduce elementos |

## Flujo de funcionamiento

```
┌─────────────────┐     Firebase      ┌──────────────────┐
│   comedor.html  │ ◄──────────────►  │ agente-vision.html│
│   (Pantalla TV) │                   │  (Panel Control) │
└─────────────────┘                   └──────────────────┘
        │                                     │
        │ 1. Envía métricas                   │
        │    (contraste, tamaños)             │
        ├────────────────────────────────────►│
        │                                     │
        │ 2. Recibe comando captura           │
        ◄─────────────────────────────────────┤
        │                                     │
        │ 3. Captura screenshot               │
        │    con html2canvas                  │
        │                                     │
        │ 4. Envía imagen + métricas          │
        ├────────────────────────────────────►│
        │                                     │
        │                                     │ 5. Analiza IA
        │                                     │    (reglas WCAG)
        │                                     │
        │ 6. Recibe ajustes                   │
        ◄─────────────────────────────────────┤ 7. Aplica cambios
        │                                     │    con sliders/auto
        │ 8. Aplica cambios CSS               │
        │    y recalcula layout               │
        │                                     │
        │ 9. Confirma aplicación              │
        ├────────────────────────────────────►│
        │                                     │
```

## Requisitos técnicos

- **Firebase Realtime Database** configurado
- **Conexión a internet** para cargar html2canvas (CDN)
- **Mismo proyecto Firebase** en ambos archivos
- Navegador moderno con soporte para:
  - ES6+ JavaScript
  - CSS Custom Properties
  - html2canvas

## Solución de problemas

### "No hay conexión con la pestaña del comedor"
- Verifica que `firebase-config.js` tenga credenciales válidas
- Asegúrate de que `comedor.html` esté abierto y cargado
- Revisa la consola del navegador (F12) para errores

### "html2canvas no cargado"
- El panel funcionará sin imágenes, solo con métricas
- Para habilitar screenshots, verifica conexión a CDN de Cloudflare

### Los ajustes no se aplican
- Comprueba que el toggle "Agente IA Automático" esté activo
- Verifica que las métricas se estén actualizando
- Revisa el log de actividad para ver errores

## Reglas de accesibilidad aplicadas

El agente sigue las **WCAG 2.1 Level AA/AAA**:

1. **Contraste mínimo 4.5:1** (AA) / **7:1** (AAA)
2. **Texto mínimo 28px** para pantallas grandes (70"+)
3. **Iconos mínimos 48px** para reconocimiento rápido
4. **Sin overflow** de contenido crítico

## Personalización avanzada

Puedes modificar las reglas en `agente-vision.html`:

```javascript
function applyAutoAdjustments(metrics) {
  // Cambia estos valores según tus necesidades
  if (metrics.textSize < 28) { ... }  // Mínimo texto
  if (metrics.iconSize < 48) { ... }  // Mínimo iconos
  if (metrics.contrastRatio < 4.5) { ... }  // Mínimo contraste
}
```

## Archivos relacionados

- `comedor.html` - Pantalla principal del comedor
- `agente-vision.html` - Panel de control del agente (ESTE)
- `agente-accesibilidad-panel.html` - Panel alternativo (legacy)
- `firebase-config.js` - Configuración de Firebase

---

**Creado para Food Service DPT** - Mejora continua de accesibilidad
