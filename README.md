# 🔐 Formulario de Auditoría de Seguridad — Experimentality

Formulario web multi-sección para auditar el acceso a aplicaciones corporativas y de clientes por parte de los empleados de Experimentality. Los datos se almacenan en Google Sheets vía Apps Script.

---

## 📁 Estructura del proyecto

```
/
├── index.html                    # Estructura HTML del formulario
├── .gitignore                    # Excluye env.js del repositorio
├── README.md
├── css/
│   └── index.css                 # Estilos (paleta Experimentality)
└── js/
    ├── env.js                    # 🔴 Credenciales reales (NO sube al repo)
    ├── env.example.js            # 🟢 Plantilla de credenciales (sí sube)
    ├── config.js                 # Lee ENV + constantes + lista de líderes
    ├── auth.js                   # Google OAuth (módulo Auth)
    ├── ui.js                     # Navegación, progreso, resumen (módulo UI)
    ├── apps.js                   # Tarjetas dinámicas de aplicativos (módulo Apps)
    ├── validation.js             # Validaciones por sección (módulo Validation)
    ├── submit.js                 # Envío al Sheet y descarga JSON (módulo Submit)
    └── main.js                   # Inicialización y bridge de eventos
```

---

## ⚙️ Configuración inicial

### 1. Clonar el repositorio

```bash
git clone https://github.com/johan-arango-expe/TU_REPO.git
cd TU_REPO
```

### 2. Crear el archivo de credenciales

```bash
cp js/env.example.js js/env.js
```

Editar `js/env.js` con los valores reales:

```js
const ENV = Object.freeze({
  GOOGLE_CLIENT_ID: 'TU_CLIENT_ID.apps.googleusercontent.com',
  APPS_SCRIPT_URL:  'https://script.google.com/a/macros/experimentality.co/s/TU_ID/exec',
  ALLOWED_DOMAIN:   'experimentality.co',
});
```

> ⚠️ `env.js` está en `.gitignore` — nunca se sube al repositorio.

### 3. Configurar Google Apps Script

1. Abrir el script en [script.google.com](https://script.google.com)
2. Pegar el contenido de `apps-script-auditoria-v2.gs`
3. Ejecutar `seedLideres()` una sola vez para crear la hoja con datos de ejemplo
4. Ir a **Implementar → Administrar implementaciones → ✏️ Editar**
5. Seleccionar **Nueva versión** → **Implementar**
6. Copiar la URL del script y pegarla en `js/env.js`

### 4. Configurar Google OAuth

En [Google Cloud Console](https://console.cloud.google.com):

- Ir a **APIs y servicios → Credenciales**
- En el Client ID OAuth, agregar a **Authorized JavaScript origins**:
  ```
  https://TU_USUARIO.github.io
  ```

---

## 📊 Estructura en Google Sheets

El script escribe en 4 hojas del Spreadsheet:

| Hoja | Descripción | ID único |
|---|---|---|
| **Empleados** | Datos personales del empleado | Cédula |
| **Aplicaciones** | Apps corporativas y de clientes con detalle | Cédula |
| **Cuestionario** | Respuestas de seguridad | Cédula |
| **Lideres** | Lista de líderes disponibles en el formulario | — |

### Hoja Lideres

Columnas: `Nombre Líder / Correo / Cargo / Área / Activo`

Para **desactivar** un líder sin borrarlo, cambiar la columna `Activo` de `Sí` a `No`.

---

## 👥 Actualizar lista de líderes

Los líderes están hardcodeados en `js/config.js`:

```js
const LIDERES = Object.freeze([
  'Sebastian Cuervo Aransazo',
  'Karen Johana Reyes Rivera',
  'Johan Stivens Carmona Giraldo',
  'Maria Isabel Gomez Londoño',
]);
```

Para agregar o quitar un líder: editar el array y hacer push a GitHub.

---

## 🔄 Flujo del formulario

```
Login Google OAuth (@experimentality.co)
        ↓
Sección 1 — Datos del empleado
        ↓ validación al hacer clic en "Continuar"
Sección 2 — Aplicativos corporativos
        ↓ validación de checkboxes + campos de cada tarjeta
Sección 3 — Aplicativos de clientes
        ↓ validación de checkboxes + campos + líder responsable
Sección 4 — Cuestionario de seguridad
        ↓ validación de radios
Sección 5 — Resumen y declaración
        ↓ envío via formulario oculto + iframe
Google Sheets (3 hojas)
```

### Mecanismo de envío

Se usa un `<form>` HTML oculto con `target` apuntando a un `<iframe>` invisible. Esto bypasea las restricciones CORS de las URLs corporativas de Apps Script (`/a/macros/dominio/`). El script responde con un `postMessage('FORM_OK')` que confirma el envío.

---

## 🛠 Módulos JavaScript

| Módulo | Responsabilidad |
|---|---|
| `config.js` | Constantes, líderes, estado global (`State`) |
| `auth.js` | Login/logout Google OAuth, validación de dominio |
| `ui.js` | Navegación entre secciones, barra de progreso, resumen |
| `apps.js` | Renderizado y gestión de tarjetas dinámicas de apps |
| `validation.js` | Validación campo a campo por sección |
| `submit.js` | Serialización del formulario, envío y descarga JSON |
| `main.js` | `DOMContentLoaded`, bridge de funciones globales |

---

## 🚀 Deploy en GitHub Pages

```bash
git add .
git commit -m "feat: actualización del formulario"
git push origin main
```

GitHub Pages publica automáticamente desde la rama `main`.

> 📌 Recuerda: `js/env.js` **no se sube al repo**. Debe existir localmente y en cualquier entorno donde se sirva el sitio.

---

## 🧪 Probar el Apps Script

Ejecutar la función `testScript()` directamente desde el editor de Apps Script. Si todo está correcto, aparecerán filas nuevas en las hojas **Empleados**, **Aplicaciones** y **Cuestionario**.

---

## 📋 Dependencias externas

| Librería | Uso |
|---|---|
| [Google Identity Services](https://accounts.google.com/gsi/client) | Autenticación OAuth |
| [IBM Plex Sans / Mono](https://fonts.google.com) | Tipografía |

No hay `npm`, `node_modules` ni proceso de build. El proyecto es HTML/CSS/JS puro.

---

## 📄 Licencia

Uso interno — Experimentality © 2025
