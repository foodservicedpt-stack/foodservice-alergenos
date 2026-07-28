# 🍽️ Food Service DPT — Sistema de Gestión de Alérgenos

Sistema profesional para gestionar y mostrar alérgenos en pantalla de comedor (TV 70") e imprimir la ficha de desayuno en A4.

---

## 📁 Estructura de archivos

```
foodservice-alergenos/
├── index.html          ← Página de inicio con accesos directos
├── gestion.html        ← Panel de gestión (contraseña: Foodservice1914)
├── comedor.html        ← Pantalla TV — abrir en la tele del comedor
├── desayuno.html       ← Ficha de desayuno para imprimir (A4 horizontal)
├── firebase-config.js  ← ⚠️  Debes rellenar este archivo con tus datos Firebase
└── img/
    ├── Encabezado.png              ← Tu logo
    ├── alergenos_gluten.svg
    ├── alergenos_crustaceos.svg
    ├── alergenos_huevos.svg
    ├── alergenos_pescado.svg
    ├── alergenos_cacahuetes.svg
    ├── alergenos_soja.svg
    ├── alergenos_lacteos.svg
    ├── alergenos_cascara.svg
    ├── alergenos_apio.svg
    ├── alergenos_mostaza.svg
    ├── alergenos_sesamo.svg
    ├── alergenos_sulfitos.svg
    ├── alergenos_moluscos.svg
    └── alergenos_altramuces.svg
```

---

## 🔥 Paso 1 — Configurar Firebase (5 minutos)

Firebase es el servicio gratuito de Google que sincroniza los datos en tiempo real entre el ordenador de gestión y la pantalla del comedor.

### 1.1 Crear proyecto

1. Ve a [https://console.firebase.google.com](https://console.firebase.google.com)
2. Haz clic en **"Crear un proyecto"**
3. Nombre: `foodservice-alergenos` (o el que quieras)
4. Desactiva Google Analytics (no es necesario) → **Crear proyecto**

### 1.2 Activar la base de datos en tiempo real

1. En el menú lateral: **Compilación → Realtime Database**
2. Clic en **"Crear una base de datos"**
3. Ubicación: **Europe (europe-west1)** (más rápido desde España)
4. Modo: **"Empezar en modo de prueba"** → Siguiente → Listo

### 1.3 Obtener las credenciales

1. En el menú lateral: ⚙️ **Configuración del proyecto**
2. Desplázate hasta **"Tus apps"** → clic en `</>` (Web)
3. Nombre de la app: `foodservice-web` → **Registrar app**
4. Copia el objeto `firebaseConfig` que aparece

### 1.4 Editar `firebase-config.js`

Abre el archivo `firebase-config.js` y reemplaza los valores:

```javascript
const firebaseConfig = {
  apiKey:            "AIzaSy...",             // ← tu clave
  authDomain:        "foodservice-alergenos.firebaseapp.com",
  databaseURL:       "https://foodservice-alergenos-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "foodservice-alergenos",
  storageBucket:     "foodservice-alergenos.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123"
};
```

### 1.5 Reglas de seguridad (recomendado)

En Firebase Console → Realtime Database → **Reglas**, pega esto para permitir lectura pública y escritura solo verificada:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

> Para mayor seguridad en el futuro, puedes activar autenticación Firebase y restringir escritura.

---

## 📂 Paso 2 — Subir las imágenes a la carpeta `img/`

Sube tus archivos a la carpeta `img/` con exactamente estos nombres:

| Archivo | Alérgeno |
|---------|----------|
| `Encabezado.png` | Logo del establecimiento |
| `alergenos_gluten.svg` | Gluten |
| `alergenos_crustaceos.svg` | Crustáceos |
| `alergenos_huevos.svg` | Huevos |
| `alergenos_pescado.svg` | Pescado |
| `alergenos_cacahuetes.svg` | Cacahuetes |
| `alergenos_soja.svg` | Soja |
| `alergenos_lacteos.svg` | Lácteos |
| `alergenos_cascara.svg` | Frutos de cáscara |
| `alergenos_apio.svg` | Apio |
| `alergenos_mostaza.svg` | Mostaza |
| `alergenos_sesamo.svg` | Sésamo |
| `alergenos_sulfitos.svg` | Sulfitos |
| `alergenos_moluscos.svg` | Moluscos |
| `alergenos_altramuces.svg` | Altramuces |

---

## 🌐 Paso 3 — Publicar en GitHub Pages

1. Crea un repositorio en [https://github.com](https://github.com) (nombre sugerido: `foodservice-alergenos`)
2. Sube todos los archivos (incluyendo la carpeta `img/`)
3. En el repositorio → **Settings → Pages**
4. Source: **"Deploy from a branch"** → Branch: `main` → Carpeta: `/ (root)` → **Save**
5. En 1-2 minutos tendrás tu URL: `https://TU_USUARIO.github.io/foodservice-alergenos/`

---

## 🖥️ Uso diario

### Pantalla de gestión (tu ordenador)
1. Abre `gestion.html` (o la URL de GitHub Pages)
2. Contraseña: **Foodservice1914**
3. Selecciona pestaña **Comedor** o **Desayuno**
4. Añade platos → escribe el nombre en español → la IA traduce automáticamente al inglés
5. Selecciona los alérgenos (círculo sólido = contiene, borde punteado = trazas)
6. Pulsa **"PUBLICAR EN PANTALLA TV"** → se actualiza instantáneamente

### Pantalla del comedor (TV 70")
1. Abre `comedor.html` en el navegador de la TV (o el PC conectado a la TV)
2. Pon el navegador en pantalla completa (F11)
3. Se actualiza automáticamente cada vez que publicas desde gestión

### Imprimir ficha de desayuno
1. Abre `desayuno.html`
2. Los datos se cargan automáticamente desde Firebase
3. Pulsa **"Imprimir / Guardar PDF"**
4. En el diálogo de impresión: Orientación **Horizontal**, Márgenes **Ninguno**

---

## 🔑 Contraseña

La contraseña del panel de gestión es: **Foodservice1914**

Para cambiarla, edita la línea en `gestion.html`:
```javascript
const PASSWORD = 'Foodservice1914';
```

---

## ✨ Funcionalidades

- ✅ **Traducción automática** (IA) de nombres de platos español → inglés
- ✅ **Actualización en tiempo real** — cambios visibles en TV al instante
- ✅ **Auto-sizing inteligente** — texto e iconos se ajustan según el número de platos (4 a 12+)
- ✅ **Bilingüe** — todos los textos en español e inglés
- ✅ **Impresión A4** optimizada para el cartel de desayuno
- ✅ **14 alérgenos** oficiales UE con iconos
- ✅ **Distingue "Contiene" de "Trazas"** visualmente
- ✅ Sin alérgenos → badge verde "Sin alérgenos declarados"

---

*Food Service DPT — Allergen Management System v2.0*
