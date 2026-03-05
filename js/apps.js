const Apps = (() => {
  function bindCheckboxGroup(name, containerId, isClient) {
    document.querySelectorAll(`input[name="${name}"]`).forEach(cb => {
      cb.addEventListener('change', () => _buildCards(name, containerId, isClient));
    });
  }
  // ── Cards por aplicativo ─────────────────────────────────
  function _buildCards(name, containerId, isClient) {
    const prefix = isClient ? 'client' : 'corp';
    const container = document.getElementById(containerId);
    const checked = [...document.querySelectorAll(`input[name="${name}"]:checked`)]
      .map(c => c.value);
    const hasCustom = Object.keys(State.rowCounts).some(k => k.startsWith(`${prefix}_custom`));

    if (!checked.length && !hasCustom) {
      container.innerHTML = '';
      _renderAddBtn(container, prefix, isClient);
      return;
    }

    container.innerHTML = `<div class="app-detail-title">DETALLE POR APLICATIVO</div>`;
    checked.forEach(app => container.insertAdjacentHTML('beforeend', _cardHTML(prefix, app, isClient)));
    // Re-renderizar custom cards preservadas
    Object.keys(State.rowCounts)
      .filter(k => k.startsWith(`${prefix}_custom`))
      .forEach(key => {
        const safe = key.replace(`${prefix}_`, '');
        if (!document.getElementById(`appcard_${key}`))
          container.insertAdjacentHTML('beforeend', _cardHTML(prefix, safe, isClient, true));
      });

    _renderAddBtn(container, prefix, isClient);
  }

  function _cardHTML(prefix, app, isClient, isCustom = false) {
    const safe = app.replace(/\s+/g, '_');
    const key = `${prefix}_${safe}`;
    if (!State.rowCounts[key]) State.rowCounts[key] = 1;

    let rowsHtml = '';
    for (let i = 0; i < State.rowCounts[key]; i++)
      rowsHtml += _rowHTML(prefix, safe, i, isClient);

    const nameDisplay = isCustom
      ? `<input type="text" id="customname_${key}" placeholder="Nombre del aplicativo"
           style="background:transparent;border:none;border-bottom:1px solid rgba(45,232,176,0.4);
                  color:var(--cyan);font-size:13px;font-weight:600;font-family:'IBM Plex Sans',sans-serif;
                  outline:none;width:180px;padding:2px 4px;">`
      : app;

    const deleteBtn = isCustom
      ? `<button type="button" onclick="Apps.removeCustomApp('${prefix}','${safe}')"
           style="background:rgba(255,71,87,0.1);border:1px solid rgba(255,71,87,0.25);color:#ff4757;
                  border-radius:6px;padding:3px 10px;font-size:11px;cursor:pointer;
                  font-family:'IBM Plex Sans',sans-serif;">✕ Quitar app</button>` : '';

    const addClientBtn = isClient ? `
      <button type="button" onclick="Apps.addClientRow('${prefix}','${safe}',true)"
        style="margin-top:8px;width:100%;background:rgba(45,232,176,0.07);
               border:1px dashed rgba(45,232,176,0.3);color:var(--cyan);border-radius:7px;
               padding:8px;font-size:12px;cursor:pointer;font-family:'IBM Plex Sans',sans-serif;"
        onmouseover="this.style.background='rgba(45,232,176,0.14)'"
        onmouseout="this.style.background='rgba(45,232,176,0.07)'">
        + Agregar otro cliente
      </button>` : '';

    return `
      <div class="app-detail-card" id="appcard_${key}" style="margin-bottom:16px;">
        <div class="app-detail-card-title" style="display:flex;justify-content:space-between;align-items:center;">
          <span>${nameDisplay}</span>${deleteBtn}
        </div>
        <div id="rows_${key}">${rowsHtml}</div>
        ${addClientBtn}
      </div>`;
  }
  // ── Filas por cliente dentro de cada app ────────────────
  function _rowHTML(prefix, safe, rowIdx, isClient) {
    const uid = `${prefix}_${safe}_r${rowIdx}`;
    const rowLabel = isClient ? `CLIENTE ${rowIdx + 1}` : 'ACCESO';
    const deleteBtn = rowIdx > 0
      ? `<button type="button" onclick="Apps.removeClientRow('${prefix}','${safe}',${rowIdx})"
           style="background:rgba(255,71,87,0.12);border:1px solid rgba(255,71,87,0.3);color:#ff4757;
                  border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;
                  font-family:'IBM Plex Sans',sans-serif;float:right;">✕ Eliminar</button>` : '';

    const liderField = isClient ? `
      <div class="mini-field">
        <div class="mini-label">LÍDER RESPONSABLE *</div>
        <select id="${uid}_lider" style="${UI.selectStyle(true)}">
          ${UI.buildLideresOptions()}
        </select>
      </div>` : '';

    const clientFields = isClient ? `
      <div class="mini-field">
        <div class="mini-label">NOMBRE DEL CLIENTE *</div>
        <input type="text" id="${uid}_nombre" placeholder="Nombre del cliente" style="${UI.inputStyle()}">
      </div>
      <div class="mini-field">
        <div class="mini-label">PROYECTO *</div>
        <input type="text" id="${uid}_proyecto" placeholder="Proyecto" style="${UI.inputStyle()}">
      </div>
      <div class="mini-field">
        <div class="mini-label">ROL / TIPO DE ACCESO</div>
        <input type="text" id="${uid}_rol" placeholder="Ej. Admin, Read-only" style="${UI.inputStyle()}">
      </div>
      ${liderField}
      <div class="mini-field">
        <div class="mini-label">TIPO DE CUENTA</div>
        <div class="mini-option-group">
          <label class="mini-option"><input type="radio" name="${uid}_cuenta" value="Individual"> Individual</label>
          <label class="mini-option"><input type="radio" name="${uid}_cuenta" value="Compartida"> Compartida</label>
        </div>
      </div>` : `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        <span style="font-size:10px;font-family:'IBM Plex Mono',monospace;background:rgba(45,232,176,0.1);
                     border:1px solid rgba(45,232,176,0.2);color:var(--cyan);border-radius:4px;padding:2px 8px;">
          Cliente: Experimentality
        </span>
      </div>
      <div class="mini-field">
        <div class="mini-label">PROYECTO ASOCIADO</div>
        <input type="text" id="${uid}_proyecto" placeholder="Nombre del proyecto" style="${UI.inputStyle()}">
      </div>
      <div class="mini-field">
        <div class="mini-label">ROL / TIPO DE ACCESO</div>
        <input type="text" id="${uid}_rol" placeholder="Ej. Admin, Developer" style="${UI.inputStyle()}">
      </div>`;

    return `
      <div class="client-row" id="row_${uid}"
           style="background:rgba(255,255,255,0.02);border:1px solid rgba(45,232,176,0.1);
                  border-radius:8px;padding:12px;margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <span style="font-size:10px;font-family:'IBM Plex Mono',monospace;color:var(--cyan);
                       letter-spacing:0.06em;">${rowLabel}</span>
          ${deleteBtn}
        </div>
        ${clientFields}
        <div class="mini-field">
          <div class="mini-label">¿MFA / 2FA HABILITADO?</div>
          <div class="mini-option-group">
            <label class="mini-option"><input type="radio" name="${uid}_mfa" value="Si"> Sí</label>
            <label class="mini-option"><input type="radio" name="${uid}_mfa" value="No"> No</label>
            <label class="mini-option"><input type="radio" name="${uid}_mfa" value="No sabe"> No sé</label>
          </div>
        </div>
      </div>`;
  }
  // ── Manipulación de filas ────────────────────────────────
  function addClientRow(prefix, safe, isClient) {
    const key = `${prefix}_${safe}`;
    const count = State.rowCounts[key] || 1;
    State.rowCounts[key] = count + 1;
    const container = document.getElementById(`rows_${key}`);
    if (!container) return;
    container.insertAdjacentHTML('beforeend', _rowHTML(prefix, safe, count, isClient));
    _relabelRows(key);
  }

  function removeClientRow(prefix, safe, rowIdx) {
    const el = document.getElementById(`row_${prefix}_${safe}_r${rowIdx}`);
    if (el) el.remove();
    _relabelRows(`${prefix}_${safe}`);
  }

  function _relabelRows(key) {
    const container = document.getElementById(`rows_${key}`);
    if (!container) return;
    container.querySelectorAll('.client-row').forEach((row, idx) => {
      const label = row.querySelector('span');
      if (label) label.textContent = `CLIENTE ${idx + 1}`;
      const btn = row.querySelector('button[onclick*="removeClientRow"]');
      if (btn) btn.style.display = idx === 0 ? 'none' : 'inline-block';
    });
  }
  // ── Botón "Agregar otro aplicativo" ─────────────────────
  function _renderAddBtn(container, prefix, isClient) {
    const existing = document.getElementById(`addOtroBtn_${prefix}`);
    if (existing) existing.remove();

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = `addOtroBtn_${prefix}`;
    btn.innerHTML = `
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      Agregar otro aplicativo`;
    btn.style.cssText = `
      margin-top:12px;width:100%;background:rgba(45,232,176,0.07);
      border:1px dashed rgba(45,232,176,0.3);color:var(--cyan);border-radius:7px;
      padding:10px;font-size:13px;cursor:pointer;font-family:'IBM Plex Sans',sans-serif;
      display:flex;align-items:center;justify-content:center;gap:8px;transition:background 0.15s;`;
    btn.onmouseover = () => btn.style.background = 'rgba(45,232,176,0.14)';
    btn.onmouseout = () => btn.style.background = 'rgba(45,232,176,0.07)';
    btn.onclick = () => addCustomApp(prefix, isClient);
    container.appendChild(btn);
  }

  function addCustomApp(prefix, isClient) {
    State.customAppCounter++;
    const safe = `custom_app_${State.customAppCounter}`;
    const key = `${prefix}_${safe}`;
    State.rowCounts[key] = 1;
    const container = document.getElementById(prefix === 'corp' ? 'corpAppDetails' : 'clientAppDetails');
    const addBtn = document.getElementById(`addOtroBtn_${prefix}`);
    addBtn.insertAdjacentHTML('beforebegin', _cardHTML(prefix, safe, isClient, true));
  }

  function removeCustomApp(prefix, safe) {
    const card = document.getElementById(`appcard_${prefix}_${safe}`);
    if (card) card.remove();
    delete State.rowCounts[`${prefix}_${safe}`];
  }
  // ── Recolectar datos para envío ──────────────────────────
  function gatherDetails(name, isClient) {
    const prefix = isClient ? 'client' : 'corp';

    const checked = [...document.querySelectorAll(`input[name="${name}"]:checked`)]
      .map(c => c.value);

    const customApps = Object.keys(State.rowCounts)
      .filter(k => k.startsWith(`${prefix}_custom_app_`))
      .map(key => {
        const safe = key.replace(`${prefix}_`, '');
        const nameEl = document.getElementById(`customname_${key}`);
        return { safe, displayName: nameEl ? (nameEl.value.trim() || 'Sin nombre') : 'Sin nombre' };
      });

    const results = [];

    const collectRows = (safe, appName) => {
      const key = `${prefix}_${safe}`;
      const count = State.rowCounts[key] || 1;
      for (let i = 0; i < count; i++) {
        const uid = `${prefix}_${safe}_r${i}`;
        const rowEl = document.getElementById(`row_${uid}`);
        if (!rowEl) continue;
        const gv = suffix => { const el = document.getElementById(`${uid}_${suffix}`); return el ? el.value.trim() : ''; };
        const rv = suffix => { const el = rowEl.querySelector(`input[name="${uid}_${suffix}"]:checked`); return el ? el.value : ''; };

        results.push(isClient
          ? {
            nombre: appName, nombreCliente: gv('nombre'), proyecto: gv('proyecto'),
            rol: gv('rol'), liderResponsable: gv('lider'), tipoCuenta: rv('cuenta'), mfa: rv('mfa')
          }
          : {
            nombre: appName, clienteAsociado: 'Experimentality',
            proyectoAsociado: gv('proyecto'), rol: gv('rol'), mfa: rv('mfa')
          }
        );
      }
    };

    checked.forEach(app => collectRows(app.replace(/\s+/g, '_'), app));
    customApps.forEach(({ safe, displayName }) => collectRows(safe, displayName));
    return results;
  }

  return {
    bindCheckboxGroup,
    addClientRow,
    removeClientRow,
    addCustomApp,
    removeCustomApp,
    gatherDetails,
  };
})();
