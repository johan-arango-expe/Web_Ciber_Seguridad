const TOTAL_SECTIONS = 5;
let currentSection = 1;
let formData = {};

// ---- Init dots for all sections ----
function renderDots() {
  for (let s = 1; s <= TOTAL_SECTIONS; s++) {
    const el = document.getElementById('dots' + s);
    if (!el) continue;
    el.innerHTML = '';
    for (let i = 1; i <= TOTAL_SECTIONS; i++) {
      const d = document.createElement('div');
      d.className = 'step-dot' + (i === s ? ' active' : (i < s ? ' done' : ''));
      el.appendChild(d);
    }
  }
}

function updateProgress(section) {
  const pct = Math.round(((section - 1) / TOTAL_SECTIONS) * 100);
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressPct').textContent = pct + '%';
  document.getElementById('progressLabel').textContent = 'SECCIÓN ' + section + ' DE ' + TOTAL_SECTIONS;
}

function showSection(n) {
  document.querySelectorAll('.section-card').forEach(c => c.classList.remove('active'));
  const el = document.getElementById('section' + n);
  if (el) { el.classList.add('active'); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  currentSection = n;
  updateProgress(n);
  if (n === 5) buildSummary();
}

// ---- Multi-client app detail system ----
// Storage: appClientRows[prefix_appSafe] = [ {rowIndex, fields...} ]

function bindCheckboxGroup(name, detailContainerId, isClient) {
  const checkboxes = document.querySelectorAll(`input[name="${name}"]`);
  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => buildAppDetailCards(name, detailContainerId, isClient));
  });
}

function inputStyle() {
  return 'width:100%;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12px;color:var(--white);outline:none;font-family:\'IBM Plex Sans\',sans-serif;';
}

function buildClientRow(prefix, safe, rowIdx, isClient) {
  const uid = `${prefix}_${safe}_r${rowIdx}`;
  const canDelete = rowIdx > 0;

  const deleteBtn = canDelete
    ? `<button type="button" onclick="removeClientRow('${prefix}','${safe}',${rowIdx},'${isClient}')"
         style="background:rgba(255,71,87,0.12);border:1px solid rgba(255,71,87,0.3);color:#ff4757;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;font-family:'IBM Plex Sans',sans-serif;float:right;">
         ✕ Eliminar
       </button>` : '';

  // For corp: single block (no multi-row), label is "ACCESO"
  // For client: multi-row with "CLIENTE N" label
  const rowLabel = isClient ? (rowIdx === 0 ? 'CLIENTE 1' : `CLIENTE ${rowIdx + 1}`) : 'ACCESO';

  if (isClient) {
    return `
      <div class="client-row" id="row_${uid}" style="background:rgba(255,255,255,0.02);border:1px solid rgba(45,232,176,0.1);border-radius:8px;padding:12px;margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <span style="font-size:10px;font-family:'IBM Plex Mono',monospace;color:var(--cyan);letter-spacing:0.06em;">${rowLabel}</span>
          ${deleteBtn}
        </div>
        <div class="mini-field">
          <div class="mini-label">NOMBRE DEL CLIENTE *</div>
          <input type="text" style="${inputStyle()}" placeholder="Nombre del cliente" id="${uid}_nombre" required>
        </div>
        <div class="mini-field">
          <div class="mini-label">PROYECTO *</div>
          <input type="text" style="${inputStyle()}" placeholder="Proyecto" id="${uid}_proyecto" required>
        </div>
        <div class="mini-field">
          <div class="mini-label">ROL / TIPO DE ACCESO</div>
          <input type="text" style="${inputStyle()}" placeholder="Ej. Admin, Read-only" id="${uid}_rol" required>
        </div>
        <div class="mini-field">
          <div class="mini-label">TIPO DE CUENTA</div>
          <div class="mini-option-group">
            <label class="mini-option"><input type="radio" name="${uid}_cuenta" value="Individual" required> Individual</label>
            <label class="mini-option"><input type="radio" name="${uid}_cuenta" value="Compartida" required> Compartida</label>
          </div>
        </div>
        <div class="mini-field">
          <div class="mini-label">¿MFA / 2FA HABILITADO?</div>
          <div class="mini-option-group">
            <label class="mini-option"><input type="radio" name="${uid}_mfa" value="Si" required> Sí</label>
            <label class="mini-option"><input type="radio" name="${uid}_mfa" value="No" required> No</label>
            <label class="mini-option"><input type="radio" name="${uid}_mfa" value="No sabe" required> No sé</label>
          </div>
        </div>
      </div>`;
  } else {
    // Corp: cliente siempre es Experimentality (fijo, no se muestra)
    return `
      <div class="client-row" id="row_${uid}" style="background:rgba(255,255,255,0.02);border:1px solid rgba(45,232,176,0.1);border-radius:8px;padding:12px;margin-bottom:10px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <span style="font-size:10px;font-family:'IBM Plex Mono',monospace;color:var(--cyan);letter-spacing:0.06em;">${rowLabel}</span>
          <span style="font-size:10px;font-family:'IBM Plex Mono',monospace;background:rgba(45,232,176,0.1);border:1px solid rgba(45,232,176,0.2);color:var(--cyan);border-radius:4px;padding:2px 8px;">
            Cliente: Experimentality
          </span>
        </div>
        <div class="mini-field">
          <div class="mini-label">PROYECTO ASOCIADO</div>
          <input type="text" style="${inputStyle()}" placeholder="Nombre del proyecto" id="${uid}_proyecto" required>
        </div>
        <div class="mini-field">
          <div class="mini-label">ROL / TIPO DE ACCESO</div>
          <input type="text" style="${inputStyle()}" placeholder="Ej. Admin, Developer" id="${uid}_rol" required>
        </div>
        <div class="mini-field">
          <div class="mini-label">¿MFA / 2FA HABILITADO?</div>
          <div class="mini-option-group">
            <label class="mini-option"><input type="radio" name="${uid}_mfa" value="Si" required> Sí</label>
            <label class="mini-option"><input type="radio" name="${uid}_mfa" value="No" required> No</label>
            <label class="mini-option"><input type="radio" name="${uid}_mfa" value="No sabe" required> No sé</label>
          </div>
        </div>
      </div>`;
  }
}

// Track row counts per app: { "corp_VTEX": 1, "client_AWS": 2, ... }
const rowCounts = {};

function addClientRow(prefix, safe, isClient) {
  const key = `${prefix}_${safe}`;
  const count = rowCounts[key] || 1;
  rowCounts[key] = count + 1;
  const rowsContainer = document.getElementById(`rows_${key}`);
  if (!rowsContainer) return;
  const div = document.createElement('div');
  div.innerHTML = buildClientRow(prefix, safe, count, isClient);
  rowsContainer.appendChild(div.firstElementChild);
  // Re-label all rows
  relabelRows(key);
}

function removeClientRow(prefix, safe, rowIdx, isClient) {
  const key = `${prefix}_${safe}`;
  const uid = `${prefix}_${safe}_r${rowIdx}`;
  const el = document.getElementById(`row_${uid}`);
  if (el) el.remove();
  relabelRows(key);
}

function relabelRows(key) {
  const container = document.getElementById(`rows_${key}`);
  if (!container) return;
  const rows = container.querySelectorAll('.client-row');
  rows.forEach((row, idx) => {
    const label = row.querySelector('span');
    if (label) label.textContent = idx === 0 ? 'CLIENTE 1' : `CLIENTE ${idx + 1}`;
    // Show/hide delete button
    const btn = row.querySelector('button');
    if (btn) btn.style.display = idx === 0 ? 'none' : 'inline-block';
  });
}

function buildAppDetailCards(name, containerId, isClient) {
  const prefix = isClient ? 'client' : 'corp';
  const container = document.getElementById(containerId);

  // Get checked values, but exclude "Otro" — those are handled as custom apps
  let checked = [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(c => c.value)
    .filter(v => v !== 'Otro');

  if (checked.length === 0 && Object.keys(rowCounts).filter(k => k.startsWith(prefix + '_custom')).length === 0) {
    container.innerHTML = '';
    renderAddOtroButton(container, prefix, isClient);
    return;
  }

  let html = `<div class="app-detail-title">DETALLE POR APLICATIVO</div>`;

  checked.forEach(app => {
    html += renderAppCard(prefix, app, isClient);
  });

  container.innerHTML = html;

  // Re-render custom cards (preserves added custom apps across checkbox changes)
  const customKeys = Object.keys(rowCounts).filter(k => k.startsWith(`${prefix}_custom`));
  customKeys.forEach(key => {
    const safe = key.replace(`${prefix}_`, '');
    const existingCard = document.getElementById(`appcard_${key}`);
    if (!existingCard) {
      container.insertAdjacentHTML('beforeend', renderAppCard(prefix, safe, isClient, true));
    }
  });

  renderAddOtroButton(container, prefix, isClient);
}

function renderAppCard(prefix, app, isClient, isCustom = false) {
  const safe = app.replace(/\s+/g, '_');
  const key = `${prefix}_${safe}`;
  if (!rowCounts[key]) rowCounts[key] = 1;
  const count = rowCounts[key];

  let rowsHtml = '';
  for (let i = 0; i < count; i++) {
    rowsHtml += buildClientRow(prefix, safe, i, isClient);
  }

  const deleteCardBtn = isCustom
    ? `<button type="button" onclick="removeCustomApp('${prefix}','${safe}','${isCustom ? 'appCorp' : 'appClient'}')"
         style="background:rgba(255,71,87,0.1);border:1px solid rgba(255,71,87,0.25);color:#ff4757;border-radius:6px;padding:3px 10px;font-size:11px;cursor:pointer;font-family:'IBM Plex Sans',sans-serif;">
         ✕ Quitar app
       </button>` : '';

  const displayName = isCustom
    ? `<input type="text" id="customname_${key}" placeholder="Nombre del aplicativo" required
         style="background:transparent;border:none;border-bottom:1px solid rgba(45,232,176,0.4);color:var(--cyan);font-size:13px;font-weight:600;font-family:'IBM Plex Sans',sans-serif;outline:none;width:180px;padding:2px 4px;">`
    : app;

  const addClientBtnHtml = isClient ? `
    <button type="button"
      onclick="addClientRow('${prefix}','${safe}',${isClient})"
      style="margin-top:8px;width:100%;background:rgba(45,232,176,0.07);border:1px dashed rgba(45,232,176,0.3);color:var(--cyan);border-radius:7px;padding:8px;font-size:12px;cursor:pointer;font-family:'IBM Plex Sans',sans-serif;transition:background 0.15s;"
      onmouseover="this.style.background='rgba(45,232,176,0.14)'"
      onmouseout="this.style.background='rgba(45,232,176,0.07)'">
      + Agregar otro cliente
    </button>` : '';

  return `
    <div class="app-detail-card" id="appcard_${key}" style="margin-bottom:16px;">
      <div class="app-detail-card-title" style="display:flex;justify-content:space-between;align-items:center;">
        <span>${displayName}</span>
        ${deleteCardBtn}
      </div>
      <div id="rows_${key}">${rowsHtml}</div>
      ${addClientBtnHtml}
    </div>`;
}

function renderAddOtroButton(container, prefix, isClient) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = `addOtroBtn_${prefix}`;
  btn.innerHTML = `
    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    Agregar otro aplicativo`;
  btn.style.cssText = 'margin-top:12px;width:100%;background:rgba(45,232,176,0.12);border:1px dashed rgba(45,232,176,0.3);color:var(--cyan);border-radius:7px;padding:10px;font-size:13px;cursor:pointer;font-family:\'IBM Plex Sans\',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;transition:background 0.15s;';
  btn.onmouseover = () => btn.style.background = 'rgba(45,232,176,0.12)';
  btn.onmouseout = () => btn.style.background = 'rgba(45,232,176,0.12)';
  btn.onclick = () => addCustomApp(prefix, isClient);
  // Remove existing before appending
  const existing = document.getElementById(`addOtroBtn_${prefix}`);
  if (existing) existing.remove();
  container.appendChild(btn);
}

let customAppCounter = 0;
function addCustomApp(prefix, isClient) {
  customAppCounter++;
  const safe = `custom_app_${customAppCounter}`;
  const key = `${prefix}_${safe}`;
  rowCounts[key] = 1;
  const container = document.getElementById(prefix === 'corp' ? 'corpAppDetails' : 'clientAppDetails');
  // Insert before the add button
  const addBtn = document.getElementById(`addOtroBtn_${prefix}`);
  const html = renderAppCard(prefix, safe, isClient, true);
  addBtn.insertAdjacentHTML('beforebegin', html);
}

function removeCustomApp(prefix, safe, checkboxName) {
  const key = `${prefix}_${safe}`;
  const card = document.getElementById(`appcard_${key}`);
  if (card) card.remove();
  delete rowCounts[key];
}

function toggleSobrantes(show) {
  document.getElementById('sobrantes-field').style.display = show ? 'block' : 'none';
}

function checkDeclaration() {
  const checked = document.getElementById('declaracion').checked;
  document.getElementById('submitBtn').disabled = !checked;
}

// ---- Validation ----
function validateSection(n) {
  let valid = true;

  const requireText = (id) => {
    const el = document.getElementById(id);
    const err = document.getElementById('err-' + id);
    if (!el || !el.value.trim()) {
      if (el) el.classList.add('invalid');
      if (err) err.classList.add('show');
      valid = false;
    } else {
      if (el) el.classList.remove('invalid');
      if (err) err.classList.remove('show');
    }
  };

  const requireEmail = (id) => {
    const el = document.getElementById(id);
    const err = document.getElementById('err-' + id);
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!el || !emailRe.test(el.value.trim())) {
      if (el) el.classList.add('invalid');
      if (err) err.classList.add('show');
      valid = false;
    } else {
      if (el) el.classList.remove('invalid');
      if (err) err.classList.remove('show');
    }
  };

  const requireRadio = (name) => {
    const sel = document.querySelector(`input[name="${name}"]:checked`);
    const err = document.getElementById('err-' + name);
    if (!sel) { if (err) err.classList.add('show'); valid = false; }
    else { if (err) err.classList.remove('show'); }
  };

  const requireCheckbox = (name) => {
    const sel = document.querySelectorAll(`input[name="${name}"]:checked`);
    const err = document.getElementById('err-' + name);
    if (sel.length === 0) { if (err) err.classList.add('show'); valid = false; }
    else { if (err) err.classList.remove('show'); }
  };

  if (n === 1) {
    requireText('nombreCompleto');
    requireText('documento');
    requireEmail('correo');
    requireText('cargo');
    requireText('area');
    requireText('lider');
    requireRadio('asignadoProyectos');
  }
  if (n === 2) {
    requireCheckbox('appCorp');
    // Also validate dynamic fields
    const corpDetails = document.getElementById('corpAppDetails');
    if (corpDetails) {
      corpDetails.querySelectorAll('input[type="text"]').forEach(inp => {
        if (!inp.value.trim()) { inp.classList.add('invalid'); valid = false; }
        else { inp.classList.remove('invalid'); }
      });
      // Check radios in groups
      const radios = corpDetails.querySelectorAll('input[type="radio"]');
      const names = [...new Set([...radios].map(r => r.name))];
      names.forEach(name => {
        const checked = corpDetails.querySelector(`input[name="${name}"]:checked`);
        const options = corpDetails.querySelectorAll(`input[name="${name}"]`).forEach(r => {
          const lbl = r.closest('.mini-option');
          if (!checked) { if (lbl) lbl.style.borderColor = 'rgba(255,71,87,0.5)'; valid = false; }
          else { if (lbl) lbl.style.borderColor = ''; }
        });
      });
    }
  }
  if (n === 3) {
    requireCheckbox('appClient');
    // Also validate dynamic fields
    const clientDetails = document.getElementById('clientAppDetails');
    if (clientDetails) {
      clientDetails.querySelectorAll('input[type="text"]').forEach(inp => {
        if (!inp.value.trim()) { inp.classList.add('invalid'); valid = false; }
        else { inp.classList.remove('invalid'); }
      });
      // Check radios in groups
      const radios = clientDetails.querySelectorAll('input[type="radio"]');
      const names = [...new Set([...radios].map(r => r.name))];
      names.forEach(name => {
        const checked = clientDetails.querySelector(`input[name="${name}"]:checked`);
        clientDetails.querySelectorAll(`input[name="${name}"]`).forEach(r => {
          const lbl = r.closest('.mini-option');
          if (!checked) { if (lbl) lbl.style.borderColor = 'rgba(255,71,87,0.5)'; valid = false; }
          else { if (lbl) lbl.style.borderColor = ''; }
        });
      });
    }
  }
  if (n === 4) {
    requireRadio('mismaContrasena');
    requireRadio('compartidoCredenciales');
    requireRadio('accesosSobrantes');
    requireRadio('appsPersonales');
    const accesosSobrantes = document.querySelector('input[name="accesosSobrantes"]:checked');
    if (accesosSobrantes && accesosSobrantes.value === 'Si') {
      requireText('cualesAccesos');
    }
  }

  return valid;
}

function goNext(n) {
  if (!validateSection(n)) { return; }
  if (n < TOTAL_SECTIONS) showSection(n + 1);
}

function goPrev(n) {
  if (n > 1) showSection(n - 1);
}

// ---- Summary ----
function buildSummary() {
  const box = document.getElementById('summaryBox');
  const g = (id) => { const el = document.getElementById(id); return el ? el.value || '—' : '—'; };
  const r = (name) => { const el = document.querySelector(`input[name="${name}"]:checked`); return el ? el.value : '—'; };
  const cbs = (name) => [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(c => c.value).join(', ') || '—';

  box.innerHTML = `
    <b style="color:var(--cyan)">EMPLEADO</b><br>
    Nombre: ${g('nombreCompleto')} · Doc: ${g('documento')}<br>
    Correo: ${g('correo')} · Cargo: ${g('cargo')}<br>
    Área: ${g('area')} · Líder: ${g('lider')}<br>
    En proyectos: ${r('asignadoProyectos')}<br><br>
    <b style="color:var(--cyan)">APPS CORPORATIVOS</b><br>
    ${cbs('appCorp')}<br><br>
    <b style="color:var(--cyan)">APPS CLIENTES</b><br>
    ${cbs('appClient')}<br><br>
    <b style="color:var(--cyan)">SEGURIDAD</b><br>
    Misma contraseña: ${r('mismaContrasena')} · Compartió credenciales: ${r('compartidoCredenciales')}<br>
    Accesos sobrantes: ${r('accesosSobrantes')} · Apps en dispositivo personal: ${r('appsPersonales')}
  `;
}

// ---- Submit ----
const APPS_SCRIPT_URL = 'https://script.google.com/a/macros/experimentality.co/s/AKfycbwz-TOXqvbel3p3hfali44nnOxfF1_kJic5vYwp_24y0RLCx_pKvsbTH3HyvRWT7Bor/exec';

function gatherAppDetails(name, isClient) {
  const prefix = isClient ? 'client' : 'corp';

  // Standard checked apps (excluding "Otro" checkbox)
  const checked = [...document.querySelectorAll(`input[name="${name}"]:checked`)]
    .map(c => c.value).filter(v => v !== 'Otro');

  // Custom apps added via "+ Agregar otro aplicativo"
  const customKeys = Object.keys(rowCounts).filter(k => k.startsWith(`${prefix}_custom_app_`));
  const customApps = customKeys.map(key => {
    const safe = key.replace(`${prefix}_`, '');
    const nameEl = document.getElementById(`customname_${key}`);
    return { safe, displayName: nameEl ? (nameEl.value.trim() || 'Sin nombre') : 'Sin nombre' };
  });

  const results = [];

  const collectRows = (safe, appDisplayName) => {
    const key = `${prefix}_${safe}`;
    const count = rowCounts[key] || 1;
    for (let i = 0; i < count; i++) {
      const uid = `${prefix}_${safe}_r${i}`;
      const rowEl = document.getElementById(`row_${uid}`);
      if (!rowEl) continue;
      const gv = (suffix) => { const el = document.getElementById(`${uid}_${suffix}`); return el ? el.value.trim() : ''; };
      const rv = (suffix) => { const el = rowEl.querySelector(`input[name="${uid}_${suffix}"]:checked`); return el ? el.value : ''; };
      if (isClient) {
        results.push({
          nombre: appDisplayName,
          nombreCliente: gv('nombre'),
          proyecto: gv('proyecto'),
          rol: gv('rol'),
          tipoCuenta: rv('cuenta'),
          mfa: rv('mfa')
        });
      } else {
        results.push({
          nombre: appDisplayName,
          clienteAsociado: 'Experimentality',
          proyectoAsociado: gv('proyecto'),
          rol: gv('rol'),
          mfa: rv('mfa')
        });
      }
    }
  };

  checked.forEach(app => collectRows(app.replace(/\s+/g, '_'), app));
  customApps.forEach(({ safe, displayName }) => collectRows(safe, displayName));

  return results;
}

async function submitForm() {
  const decl = document.getElementById('declaracion');
  if (!decl.checked) {
    document.getElementById('err-declaracion').classList.add('show');
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Enviando...`;

  const g = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
  const r = (name) => { const el = document.querySelector(`input[name="${name}"]:checked`); return el ? el.value : ''; };
  const cbs = (name) => [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(c => c.value);

  const ref = 'AUD-' + Date.now().toString(36).toUpperCase();

  formData = {
    timestamp: new Date().toISOString(),
    referencia: ref,
    seccion1: {
      nombreCompleto: g('nombreCompleto'),
      documento: g('documento'),
      correo: g('correo'),
      cargo: g('cargo'),
      area: g('area'),
      lider: g('lider'),
      asignadoProyectos: r('asignadoProyectos')
    },
    seccion2_appsCorporativos: cbs('appCorp'),
    seccion2_detalles: gatherAppDetails('appCorp', false),
    seccion3_appsClientes: cbs('appClient'),
    seccion3_detalles: gatherAppDetails('appClient', true),
    seccion4_seguridad: {
      mismaContrasena: r('mismaContrasena'),
      compartidoCredenciales: r('compartidoCredenciales'),
      accesosSobrantes: r('accesosSobrantes'),
      cualesAccesos: g('cualesAccesos'),
      appsPersonales: r('appsPersonales')
    },
    declaracionAceptada: true
  };

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    // no-cors doesn't return readable response, assume success if no exception
    showSuccess(ref);
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Enviar formulario`;
    alert('❌ Error al enviar. Verifica tu conexión e intenta nuevamente.\n\n' + err.message);
  }
}

function showSuccess(ref) {
  document.getElementById('refCode').textContent = 'REF: ' + ref;
  document.querySelectorAll('.section-card').forEach(c => c.style.display = 'none');
  document.querySelector('.progress-bar-wrap').style.display = 'none';
  document.getElementById('successScreen').classList.add('show');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function downloadResponses() {
  const json = JSON.stringify(formData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'sondeo-auditoria-seguridad.json';
  a.click();
}

// ---- Init ----
renderDots();
updateProgress(1);
bindCheckboxGroup('appCorp', 'corpAppDetails', false);
bindCheckboxGroup('appClient', 'clientAppDetails', true);

// ======================================================
// GOOGLE OAUTH
// ======================================================
const GOOGLE_CLIENT_ID = '632152445690-3rjq91957nq89q0cel79cof5b4hlm17a.apps.googleusercontent.com';
const ALLOWED_DOMAIN = 'experimentality.co';
let googleUser = null;

function initGoogleSignIn() {
  const btn = document.getElementById('googleSignInBtn');
  btn.style.opacity = '0.7';
  btn.style.pointerEvents = 'none';
  btn.textContent = 'Conectando con Google...';

  // Use the new Google Identity Services One Tap / popup flow
  if (typeof google === 'undefined') {
    showLoginError('No se pudo cargar Google Sign-In. Verifica tu conexión a internet.');
    resetSignInBtn(); return;
  }

  const client = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: 'email profile',
    callback: (tokenResponse) => {
      if (tokenResponse.error) {
        showLoginError('Error al autenticar: ' + tokenResponse.error);
        resetSignInBtn(); return;
      }
      // Fetch user info with the token
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: 'Bearer ' + tokenResponse.access_token }
      })
        .then(r => r.json())
        .then(profile => handleGoogleProfile(profile))
        .catch(() => { showLoginError('No se pudo obtener el perfil. Intenta de nuevo.'); resetSignInBtn(); });
    }
  });
  client.requestAccessToken({ prompt: 'select_account' });
}

function handleGoogleProfile(profile) {
  const email = (profile.email || '').toLowerCase();
  const domain = email.split('@')[1] || '';

  if (domain !== ALLOWED_DOMAIN) {
    showLoginError(
      `❌ Acceso denegado.\n\nSolo cuentas @${ALLOWED_DOMAIN} pueden acceder.\nCorreo detectado: ${email}`
    );
    resetSignInBtn(); return;
  }

  // ✅ Authorized — store user and pre-fill email field
  googleUser = profile;

  // Pre-fill correo field and make it read-only
  const correoInput = document.getElementById('correo');
  if (correoInput) {
    correoInput.value = email;
    correoInput.readOnly = true;
    correoInput.style.opacity = '0.7';
    correoInput.style.cursor = 'not-allowed';
  }

  // Show user badge
  const badge = document.getElementById('userBadge');
  const avatar = document.getElementById('userAvatar');
  const name = document.getElementById('userName');
  if (badge) { badge.style.display = 'flex'; }
  if (avatar && profile.picture) avatar.src = profile.picture;
  if (name) name.textContent = profile.name + ' · ' + email;

  // Hide login screen with fade
  const loginScreen = document.getElementById('loginScreen');
  loginScreen.style.transition = 'opacity 0.4s ease';
  loginScreen.style.opacity = '0';
  setTimeout(() => { loginScreen.style.display = 'none'; }, 400);
}

function showLoginError(msg) {
  const el = document.getElementById('loginError');
  el.textContent = msg;
  el.style.display = 'block';
  el.style.whiteSpace = 'pre-line';
}

function resetSignInBtn() {
  const btn = document.getElementById('googleSignInBtn');
  btn.style.opacity = '1';
  btn.style.pointerEvents = 'auto';
  btn.innerHTML = '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" height="20" alt="Google"> Iniciar sesión con Google';
}

function signOut() {
  googleUser = null;
  document.getElementById('userBadge').style.display = 'none';
  document.getElementById('loginScreen').style.opacity = '1';
  document.getElementById('loginScreen').style.display = 'flex';
  resetSignInBtn();
  document.getElementById('loginError').style.display = 'none';
  // Clear pre-filled email
  const correoInput = document.getElementById('correo');
  if (correoInput) { correoInput.value = ''; correoInput.readOnly = false; correoInput.style.opacity = '1'; correoInput.style.cursor = 'text'; }
}