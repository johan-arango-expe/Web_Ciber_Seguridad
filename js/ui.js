// ============================================================
// ui.js — Interfaz: navegación, progreso, resumen, líderes
// ============================================================
// Nota: se usa concatenación de strings en lugar de template
// literals para evitar problemas de escape en atributos HTML.
// ============================================================

const UI = (() => {

  // ── Líderes ─────────────────────────────────────────────

  function buildLideresOptions(selectedValue) {
    selectedValue = selectedValue || '';
    const placeholder =
      '<option value="" disabled ' + (!selectedValue ? 'selected' : '') + '>' +
      'Selecciona un líder...</option>';
    const opts = LIDERES.map(l =>
      '<option value="' + l + '" ' + (l === selectedValue ? 'selected' : '') + '>' + l + '</option>'
    ).join('');
    return placeholder + opts;
  }

  function poblarSelectLider(selectId, selectedValue) {
    const el = document.getElementById(selectId);
    if (el && el.tagName === 'SELECT') el.innerHTML = buildLideresOptions(selectedValue || '');
  }

  function repoblarLideresEnCards() {
    document.querySelectorAll('select[id$="_lider"]').forEach(sel => {
      const current = sel.value;
      sel.innerHTML = buildLideresOptions(current);
    });
  }

  // ── Estilos inline ───────────────────────────────────────
  // Concatenación pura: sin template literals para evitar
  // escapes rotos al inyectar en innerHTML / atributos HTML.

  const SELECT_BG  = '#0d1b2e';
  const ARROW_SVG  =
    'background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'' +
    ' width=\'12\' height=\'12\' fill=\'none\' stroke=\'%232de8b0\' stroke-width=\'2\'' +
    ' viewBox=\'0 0 24 24\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E");' +
    'background-repeat:no-repeat;background-position:right 12px center;';

  function inputStyle() {
    return (
      'width:100%;background:rgba(255,255,255,0.04);border:1px solid var(--border);' +
      'border-radius:6px;padding:8px 10px;font-size:12px;color:var(--white);' +
      "outline:none;font-family:'IBM Plex Sans',sans-serif;"
    );
  }

  function selectStyle(mini) {
    const base = mini
      ? ('width:100%;background:' + SELECT_BG + ';border:1px solid var(--border);' +
         'border-radius:6px;padding:8px 32px 8px 10px;font-size:12px;color:#ffffff;' +
         "outline:none;cursor:pointer;font-family:'IBM Plex Sans',sans-serif;")
      : ('width:100%;background:' + SELECT_BG + ';border:1px solid var(--border);' +
         'border-radius:8px;padding:12px 14px;font-size:14px;color:#ffffff;' +
         "outline:none;cursor:pointer;font-family:'IBM Plex Sans',sans-serif;");
    return base + 'appearance:none;-webkit-appearance:none;' + ARROW_SVG;
  }

  // ── Progreso y navegación ────────────────────────────────

  function renderDots() {
    for (let s = 1; s <= CONFIG.TOTAL_SECTIONS; s++) {
      const el = document.getElementById('dots' + s);
      if (!el) continue;
      el.innerHTML = '';
      for (let i = 1; i <= CONFIG.TOTAL_SECTIONS; i++) {
        const d = document.createElement('div');
        d.className = 'step-dot' + (i === s ? ' active' : i < s ? ' done' : '');
        el.appendChild(d);
      }
    }
  }

  function updateProgress(section) {
    const pct = Math.round(((section - 1) / CONFIG.TOTAL_SECTIONS) * 100);
    document.getElementById('progressFill').style.width  = pct + '%';
    document.getElementById('progressPct').textContent   = pct + '%';
    document.getElementById('progressLabel').textContent =
      'SECCIÓN ' + section + ' DE ' + CONFIG.TOTAL_SECTIONS;
  }

  function showSection(n) {
    document.querySelectorAll('.section-card').forEach(c => c.classList.remove('active'));
    const el = document.getElementById('section' + n);
    if (el) { el.classList.add('active'); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    State.currentSection = n;
    updateProgress(n);
    if (n === CONFIG.TOTAL_SECTIONS) buildSummary();
  }

  // goNext — el botón "Continuar" llama esta función.
  // Validation.validateSection(n) valida todos los campos
  // de la sección actual antes de avanzar.
  function goNext(n) {
    if (!Validation.validateSection(n)) return;
    if (n < CONFIG.TOTAL_SECTIONS) showSection(n + 1);
  }

  function goPrev(n) {
    if (n > 1) showSection(n - 1);
  }

  // ── Resumen ──────────────────────────────────────────────

  function buildSummary() {
    const box = document.getElementById('summaryBox');
    const g   = id   => { const el = document.getElementById(id); return el ? (el.value || '—') : '—'; };
    const r   = name => { const el = document.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : '—'; };
    const cbs = name => Array.from(document.querySelectorAll('input[name="' + name + '"]:checked'))
                            .map(c => c.value).join(', ') || '—';

    box.innerHTML =
      '<b style="color:var(--cyan)">EMPLEADO</b><br>' +
      'Nombre: ' + g('nombreCompleto') + ' &nbsp;·&nbsp; Doc: ' + g('documento') + '<br>' +
      'Correo: ' + g('correo') + ' &nbsp;·&nbsp; Cargo: ' + g('cargo') + '<br>' +
      'Área: ' + g('area') + ' &nbsp;·&nbsp; Líder: ' + g('lider') + '<br>' +
      'Asignado a proyectos: ' + r('asignadoProyectos') + '<br><br>' +
      '<b style="color:var(--cyan)">APPS CORPORATIVOS</b><br>' +
      cbs('appCorp') + '<br><br>' +
      '<b style="color:var(--cyan)">APPS CLIENTES</b><br>' +
      cbs('appClient') + '<br><br>' +
      '<b style="color:var(--cyan)">SEGURIDAD</b><br>' +
      'Misma contraseña: ' + r('mismaContrasena') + ' &nbsp;·&nbsp; ' +
      'Compartió credenciales: ' + r('compartidoCredenciales') + '<br>' +
      'Accesos sobrantes: ' + r('accesosSobrantes') + ' &nbsp;·&nbsp; ' +
      'Apps en disp. personal: ' + r('appsPersonales');
  }

  function showSuccess(ref) {
    document.getElementById('refCode').textContent = 'REF: ' + ref;
    document.querySelectorAll('.section-card').forEach(c => { c.style.display = 'none'; });
    document.querySelector('.progress-bar-wrap').style.display = 'none';
    document.getElementById('successScreen').classList.add('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleSobrantes(show) {
    document.getElementById('sobrantes-field').style.display = show ? 'block' : 'none';
  }

  function checkDeclaration() {
    document.getElementById('submitBtn').disabled =
      !document.getElementById('declaracion').checked;
  }

  return {
    buildLideresOptions,
    poblarSelectLider,
    repoblarLideresEnCards,
    inputStyle,
    selectStyle,
    renderDots,
    updateProgress,
    showSection,
    goNext,
    goPrev,
    buildSummary,
    showSuccess,
    toggleSobrantes,
    checkDeclaration,
  };
})();
