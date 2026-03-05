// ── Inicialización ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  UI.renderDots();
  UI.updateProgress(1);
  UI.poblarSelectLider('lider');

  Apps.bindCheckboxGroup('appCorp', 'corpAppDetails', false);
  Apps.bindCheckboxGroup('appClient', 'clientAppDetails', true);
});
// ── Bridge: navegación ──────────────────────────────────────
function goNext(n) { UI.goNext(n); }
function goPrev(n) { UI.goPrev(n); }
// ── Bridge: UI ─────────────────────────────────────────────
function toggleSobrantes(show) { UI.toggleSobrantes(show); }
function checkDeclaration() { UI.checkDeclaration(); }
// ── Bridge: apps dinámicos ──────────────────────────────────
function addClientRow(prefix, safe, isClient) { Apps.addClientRow(prefix, safe, isClient); }
function removeClientRow(prefix, safe, rowIdx) { Apps.removeClientRow(prefix, safe, rowIdx); }
function addCustomApp(prefix, isClient) { Apps.addCustomApp(prefix, isClient); }
function removeCustomApp(prefix, safe) { Apps.removeCustomApp(prefix, safe); }
// ── Bridge: submit ──────────────────────────────────────────
function submitForm() { Submit.send(); }
function downloadResponses() { Submit.download(); }
// ── Bridge: auth ────────────────────────────────────────────
function initGoogleSignIn() { Auth.signIn(); }
function signOut() { Auth.signOut(); }
