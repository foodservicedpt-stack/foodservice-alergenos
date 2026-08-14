# Agente de Accesibilidad para Pantallas de Comedor

## 🎯 ¿Qué es?

El **Agente de Accesibilidad** es un sistema inteligente que "ve" en tiempo real cómo se está mostrando la pantalla del comedor y ajusta automáticamente los tamaños de texto e iconos para garantizar la máxima visibilidad y accesibilidad.

## 📋 Características Principales

### 1. **Monitorización en Tiempo Real**
- El agente recibe métricas cada 3 segundos desde la pantalla del comedor
- Detecta resolución, tamaños actuales, overflow y número de platos
- Muestra una vista previa en vivo de la pantalla

### 2. **Ajuste Automático Inteligente**
- **Modo Autónomo**: El agente ajusta automáticamente los tamaños cuando detecta problemas
- **Prioriza la accesibilidad**: Asegura tamaños mínimos (28px texto, 32px iconos)
- **Evita overflow**: Reduce gradualmente si el contenido no cabe

### 3. **Control Manual con Feedback Inmediato**
- Sliders para ajustar tamaños manualmente
- Métricas visuales con indicadores de estado (✓ Óptimo, ⚠ Aceptable, ✗ Problema)
- Recomendaciones automáticas basadas en las métricas

### 4. **Optimización para tu Pantalla**
Para tu pantalla específica (**70 pulgadas, 1280x720**):
- El agente calcula automáticamente la escala óptima
- Aplica valores aumentados por defecto para maximizar la visibilidad
- Se adapta si cambias la resolución o el zoom del navegador

## 🚀 Cómo Usar

### Paso 1: Abrir el Agente
Desde el panel de gestión (`gestion.html`), haz clic en:
```
🤖 Agente Accesibilidad
```

O abre directamente:
```
agente-accesibilidad.html
```

### Paso 2: Ver la Vista Previa
El panel izquierdo muestra la pantalla del comedor en tiempo real dentro de un iframe.

### Paso 3: Monitorizar Métricas
El panel derecho muestra:
- **Resolución de pantalla**: 1280 × 720 (tu caso)
- **Escala**: Factor calculado respecto a la referencia
- **Tamaño Texto Principal**: En píxeles reales
- **Tamaño Iconos**: En píxeles reales
- **Contraste**: Ratio WCAG
- **Overflow**: Si hay contenido cortado

### Paso 4: Activar Modo Autónomo (Opcional)
Activa el toggle **"Ajuste automático continuo"** para que el agente:
- Evalúe las métricas cada 5 segundos
- Ajuste automáticamente si detecta problemas
- Priorice tamaños grandes o ajuste por overflow

### Paso 5: Optimización Rápida
Haz clic en **"✨ Optimizar Automáticamente"** para aplicar valores óptimos instantáneamente para tu pantalla de 70".

## 🔧 Valores Recomendados para 70" (1280x720)

| Elemento | Valor Óptimo | Mínimo Accesible |
|----------|-------------|------------------|
| Nombre Plato (ES) | 7.5vw (~96px) | 6vw (~77px) |
| Nombre Plato (EN) | 2.8vw (~36px) | 2.2vw (~28px) |
| Iconos Alérgenos | 6.5vw (~83px) | 5.5vw (~70px) |
| Mensaje Turno | 4vw (~51px) | 3.2vw (~41px) |

## 📊 Umbrales de Accesibilidad

El agente usa estos umbrales para evaluar la visibilidad:

- **Texto mínimo**: 28px (WCAG AAA para visión reducida)
- **Iconos mínimos**: 32px (tacto y visión)
- **Contraste mínimo**: 4.5:1 (WCAG AA)
- **Contraste objetivo**: 7:1 (WCAG AAA)
- **Overflow permitido**: 0 (nada debe cortarse)

## 🔌 Integración Técnica

### Flujo de Datos

```
┌─────────────────┐         Firebase          ┌──────────────────┐
│  comedor.html   │ ────────────────────────> │  agente.html     │
│                 │                           │                  │
│ - Reporta       │    accessibilityMetrics   │ - Escucha        │
│   métricas      │ <──────────────────────── │   cambios        │
│ - Cada 3s       │    tvSettings             │ - Aplica ajustes │
└─────────────────┘                           └──────────────────┘
```

### Métricas Reportadas

La pantalla del comedor envía a Firebase:

```javascript
{
  screenWidth: 1280,           // Ancho en px
  screenHeight: 720,           // Alto en px
  dishNameSizePx: 96,          // Tamaño actual texto
  iconSizePx: 83,              // Tamaño actual iconos
  contrastRatio: 16.0,         // Ratio contraste
  hasOverflow: false,          // ¿Hay contenido cortado?
  dishCount: 5,                // Número de platos
  lastUpdate: 1234567890       // Timestamp
}
```

### Ajustes Remotos

El agente escribe en Firebase:

```javascript
{
  dishNameSize: '7.5vw',
  dishEnSize: '2.8vw',
  iconSize: '6.5vw',
  turnoMsgEsSize: '4vw'
}
```

La pantalla del comedor escucha estos cambios y los aplica instantáneamente.

## 🎨 Interfaz del Agente

### Panel Izquierdo
- **Vista Previa**: iframe con la pantalla del comedor
- **Botón Actualizar**: Refresca el iframe manualmente

### Panel Derecho

#### 1. Información de Pantalla
- Resolución actual
- Escala calculada
- Número de platos

#### 2. Métricas de Visibilidad
- 4 tarjetas con valores y estados
- Colores: Verde (✓), Amarillo (⚠), Rojo (✗)

#### 3. Ajustes Manuales
- 4 sliders con valores en vw
- Display numérico actualizado en tiempo real

#### 4. Modo Autónomo
- Toggle: Ajuste automático continuo
- Toggle: Priorizar tamaño máximo
- Toggle: Alertas de problemas

#### 5. Recomendaciones
- Lista dinámica de sugerencias
- Clasificadas por prioridad (success/warning/danger)

## 🛠️ Configuración Avanzada

### Cambiar Umbrales

En `agente-accesibilidad.html`, modifica:

```javascript
const ACCESSIBILITY_THRESHOLDS = {
  minNameSize: 28,      // px mínimos
  minIconSize: 32,      // px mínimos
  minContrast: 4.5,     // WCAG AA
  targetContrast: 7,    // WCAG AAA
  maxOverflow: 0
};
```

### Ajustar Frecuencia de Reporte

En `comedor.html`, cambia el intervalo:

```javascript
metricsReportInterval = setInterval(() => {
  // ... reporte de métricas
}, 3000);  // Cambiar a otro valor en ms
```

### Personalizar Valores por Defecto

En `agente-accesibilidad.html`:

```javascript
const DEFAULT_SETTINGS = {
  dishNameSize: '7.5vw',  // Tu valor óptimo
  dishEnSize: '2.8vw',
  iconSize: '6.5vw',
  turnoMsgEsSize: '4vw'
};
```

## 💡 Consejos de Uso

1. **Primera configuración**: Usa "Optimizar Automáticamente" para valores base
2. **Ajuste fino**: Usa los sliders manuales para preferencias personales
3. **Mantenimiento**: Deja el modo autónomo activado para ajustes continuos
4. **Verificación**: Revisa las recomendaciones periódicamente
5. **Cambios de contenido**: El agente se adapta automáticamente al añadir/quitar platos

## 🔍 Debugging

### Ver Panel Debug en la Pantalla
Añade `?debug=1` a la URL de `comedor.html`:
```
comedor.html?debug=1
```

Mostrará un panel con:
- Resolución window
- Filas y columnas del grid
- Tamaños finales aplicados
- Iteraciones de reducción
- Estado de overflow

### Consola del Navegador
Ambas páginas loguean eventos importantes:
- Conexión Firebase
- Errores de reporte
- Cambios de settings

## 📱 Acceso Rápido

### URLs Directas
- **Gestión**: `file:///workspace/gestion.html`
- **Comedor**: `file:///workspace/comedor.html`
- **Agente**: `file:///workspace/agente-accesibilidad.html`

### Desde Gestión
Click en los botones de la topbar:
- 📺 Ver pantalla TV
- 🤖 Agente Accesibilidad (NUEVO)
- ✨ Ver pantalla comidas especiales

## ✅ Checklist de Accesibilidad

- [ ] Texto principal ≥ 28px
- [ ] Iconos ≥ 32px
- [ ] Contraste ≥ 4.5:1
- [ ] Sin overflow detectado
- [ ] Modo autónomo activado (recomendado)
- [ ] Recomendaciones revisadas

## 🆘 Solución de Problemas

### "Esperando datos de la pantalla..."
- Verifica que `comedor.html` esté abierto en otra pestaña/ventana
- Comprueba la conexión Firebase
- Revisa la consola del navegador en busca de errores

### "No hay conexión con Firebase"
- Verifica que `firebase-config.js` esté correctamente configurado
- Asegúrate de tener permisos de escritura en `tvSettings` y `accessibilityMetrics`

### Los ajustes no se aplican
- Espera 1-2 segundos (hay debounce en la escritura)
- Verifica que el listener en `comedor.html` esté activo
- Revisa que los nombres de las variables coincidan

## 📈 Futuras Mejoras

- [ ] Análisis de contraste real con captura de pantalla
- [ ] Detección de solapamientos entre elementos
- [ ] Ajuste basado en distancia de visualización
- [ ] Perfiles predefinidos (día/noche, presentación/impresión)
- [ ] Historial de métricas y tendencias

---

**Food Service DPT — Allergen Management System**  
*Accesibilidad primero, siempre.*
