const CONFIG = Object.freeze({
  // Leídas desde env.js (no hardcodeadas aquí)
  GOOGLE_CLIENT_ID: ENV.GOOGLE_CLIENT_ID,
  APPS_SCRIPT_URL: ENV.APPS_SCRIPT_URL,
  ALLOWED_DOMAIN: ENV.ALLOWED_DOMAIN,
  // Constantes de la app (no sensibles, sí van en repo)
  TOTAL_SECTIONS: 5,
});

// ── Lista de líderes ──────────────────────────────────────
// Para agregar o quitar líderes, edita este array y haz push.
const LIDERES = Object.freeze([
  'Sebastian Cuervo Aransazo',
  'Karen Johana Reyes Rivera',
  'Johan Stivens Carmona Giraldo',
  'Maria Isabel Gomez Londoño',
]);

// ── Estado global de la aplicación ───────────────────────
// Mutable en runtime, nunca expuesto fuera de los módulos.
const State = {
  currentSection: 1,
  formData: {},
  googleUser: null,
  rowCounts: {},
  customAppCounter: 0,
};
