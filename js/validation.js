const Validation = (() => {

  // ── Helpers de campo individual ──────────────────────────

  function _requireText(id) {
    const el = document.getElementById(id);
    const ok = el && el.value.trim() !== '';
    if (el) {
      el.style.borderColor = ok ? '' : 'rgba(255,71,87,0.5)';
      el.style.boxShadow = ok ? '' : '0 0 0 1px rgba(255,71,87,0.3)';
    }
    return ok;
  }

  function _requireSelect(id) {
    const el = document.getElementById(id);
    const ok = el && el.value !== '';
    if (el) {
      el.style.borderColor = ok ? '' : 'rgba(255,71,87,0.5)';
      el.style.boxShadow = ok ? '' : '0 0 0 1px rgba(255,71,87,0.3)';
    }
    document.getElementById('err-' + id)?.classList.toggle('show', !ok);
    return ok;
  }

  function _requireEmail(id) {
    const el = document.getElementById(id);
    const err = document.getElementById('err-' + id);
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const ok = el && regex.test(el.value.trim());
    el?.classList.toggle('invalid', !ok);
    err?.classList.toggle('show', !ok);
    return ok;
  }

  function _requireRadio(name, scope = document) {
    return !!scope.querySelector(`input[name="${name}"]:checked`);
  }

  function _requireCheckbox(name) {
    const ok = document.querySelectorAll(`input[name="${name}"]:checked`).length > 0;
    document.getElementById('err-' + name)?.classList.toggle('show', !ok);
    return ok;
  }

  // ── Validación de una tarjeta de aplicativo ──────────────
  // Recorre todos los campos generados dinámicamente en _rowHTML
  // y marca en rojo los que estén vacíos.

  function _validateAppCards(containerId, isClient) {
    const container = document.getElementById(containerId);
    if (!container) return true;

    let valid = true;

    // Obtener todas las filas de cliente/acceso dentro del contenedor
    container.querySelectorAll('.client-row').forEach(row => {
      const uid = row.id.replace('row_', ''); // ej: "client_VTEX_r0"

      // ── Campos de texto obligatorios ──
      const textFields = isClient
        ? [`${uid}_nombre`, `${uid}_proyecto`, `${uid}_rol`]
        : [`${uid}_proyecto`, `${uid}_rol`];

      textFields.forEach(fieldId => {
        const el = document.getElementById(fieldId);
        if (!el) return;
        const ok = el.value.trim() !== '';
        el.style.borderColor = ok ? '' : 'rgba(255,71,87,0.5)';
        el.style.boxShadow = ok ? '' : '0 0 0 1px rgba(255,71,87,0.3)';
        // Restaurar al escribir
        el.oninput = () => {
          el.style.borderColor = '';
          el.style.boxShadow = '';
        };
        if (!ok) valid = false;
      });

      // ── Select de líder (solo apps de cliente) ──
      if (isClient) {
        const liderEl = document.getElementById(`${uid}_lider`);
        if (liderEl) {
          const ok = liderEl.value !== '';
          liderEl.style.borderColor = ok ? '' : 'rgba(255,71,87,0.5)';
          liderEl.style.boxShadow = ok ? '' : '0 0 0 1px rgba(255,71,87,0.3)';
          liderEl.onchange = () => {
            liderEl.style.borderColor = '';
            liderEl.style.boxShadow = '';
          };
          if (!ok) valid = false;
        }
      }

      // ── Radio MFA (obligatorio en ambos tipos) ──
      const mfaChecked = _requireRadio(`${uid}_mfa`, row);
      if (!mfaChecked) {
        _markRadioGroup(row, `${uid}_mfa`);
        valid = false;
      }

      // ── Radio tipo de cuenta (solo apps de cliente) ──
      if (isClient) {
        const cuentaChecked = _requireRadio(`${uid}_cuenta`, row);
        if (!cuentaChecked) {
          _markRadioGroup(row, `${uid}_cuenta`);
          valid = false;
        }
      }
    });

    // ── Nombre de app personalizada (campo editable en título) ──
    container.querySelectorAll('input[id^="customname_"]').forEach(el => {
      const ok = el.value.trim() !== '';
      el.style.borderBottomColor = ok ? 'rgba(45,232,176,0.4)' : 'rgba(255,71,87,0.6)';
      el.oninput = () => { el.style.borderBottomColor = 'rgba(45,232,176,0.4)'; };
      if (!ok) valid = false;
    });

    return valid;
  }

  // Marca las opciones de un grupo radio con borde rojo
  function _markRadioGroup(scope, name) {
    scope.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
      const opt = radio.closest('.mini-option');
      if (opt) {
        opt.style.borderColor = 'rgba(255,71,87,0.5)';
        // Restaurar al seleccionar
        radio.addEventListener('change', () => {
          scope.querySelectorAll(`input[name="${name}"]`).forEach(r => {
            const o = r.closest('.mini-option');
            if (o) o.style.borderColor = '';
          });
        }, { once: true });
      }
    });
  }

  // ── Mostrar mensaje de error debajo de la sección de apps ─
  function _showAppsError(containerId, show) {
    const errId = `err-apps-${containerId}`;
    let errEl = document.getElementById(errId);

    if (!errEl) {
      errEl = document.createElement('div');
      errEl.id = errId;
      errEl.style.cssText = `
        font-size:11px;color:#ff4757;margin-top:8px;
        font-family:'IBM Plex Mono',monospace;display:none;`;
      errEl.textContent = '⚠ Completa todos los campos obligatorios de los aplicativos';
      document.getElementById(containerId)?.after(errEl);
    }

    errEl.style.display = show ? 'block' : 'none';
  }

  // ── Validación por sección ───────────────────────────────

  function validateSection(n) {
    const results = [];

    if (n === 1) {
      results.push(
        _requireText('nombreCompleto'),
        _requireText('documento'),
        _requireEmail('correo'),
        _requireText('cargo'),
        _requireText('area'),
        _requireSelect('lider'),
        _requireRadio('asignadoProyectos'),
      );
      // Marcar radio asignadoProyectos si no está seleccionado
      if (!_requireRadio('asignadoProyectos')) {
        _markRadioGroup(document, 'asignadoProyectos');
        document.getElementById('err-asignadoProyectos')?.classList.add('show');
      }
    }

    if (n === 2) {
      const hasApps = _requireCheckbox('appCorp');
      results.push(hasApps);
      if (hasApps) {
        const cardsValid = _validateAppCards('corpAppDetails', false);
        _showAppsError('corpAppDetails', !cardsValid);
        results.push(cardsValid);
      }
    }

    if (n === 3) {
      const hasApps = _requireCheckbox('appClient');
      results.push(hasApps);
      if (hasApps) {
        const cardsValid = _validateAppCards('clientAppDetails', true);
        _showAppsError('clientAppDetails', !cardsValid);
        results.push(cardsValid);
      }
    }

    if (n === 4) {
      results.push(
        _requireRadio('mismaContrasena'),
        _requireRadio('compartidoCredenciales'),
        _requireRadio('accesosSobrantes'),
        _requireRadio('appsPersonales'),
      );
      ['mismaContrasena', 'compartidoCredenciales', 'accesosSobrantes', 'appsPersonales'].forEach(name => {
        if (!_requireRadio(name)) {
          _markRadioGroup(document, name);
          document.getElementById('err-' + name)?.classList.add('show');
        }
      });
      const sobrante = document.querySelector('input[name="accesosSobrantes"]:checked');
      if (sobrante?.value === 'Si') results.push(_requireText('cualesAccesos'));
    }

    return results.every(Boolean);
  }

  return { validateSection };
})();