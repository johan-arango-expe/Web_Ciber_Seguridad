// ============================================================
// validation.js — Validaciones por sección
// ============================================================
// Todas las validaciones se disparan desde goNext(n) en ui.js
// cuando el usuario hace clic en el botón "Continuar".
// Secciones 2 y 3 validan tanto el checkbox de apps como
// cada campo dentro de las tarjetas generadas dinámicamente.
// ============================================================

const Validation = (() => {

  // ── Helpers visuales ────────────────────────────────────

  function _markField(el, ok) {
    if (!el) return;
    el.style.borderColor = ok ? '' : 'rgba(255,71,87,0.6)';
    el.style.boxShadow   = ok ? '' : '0 0 0 1px rgba(255,71,87,0.3)';
  }

  function _clearField(el) {
    if (!el) return;
    el.style.borderColor = '';
    el.style.boxShadow   = '';
  }

  // Vincula auto-limpieza una sola vez por elemento
  function _bindClear(el, event) {
    if (!el || el._vcBound) return;
    el.addEventListener(event, () => _clearField(el));
    el._vcBound = true;
  }

  function _markRadioGroup(scope, name) {
    const radios = scope.querySelectorAll('input[name="' + name + '"]');
    radios.forEach(radio => {
      const opt = radio.closest('.mini-option') || radio.closest('.option-item');
      if (opt) opt.style.borderColor = 'rgba(255,71,87,0.5)';
    });
    // Auto-limpiar al seleccionar
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        radios.forEach(r => {
          const opt = r.closest('.mini-option') || r.closest('.option-item');
          if (opt) opt.style.borderColor = '';
        });
      }, { once: true });
    });
  }

  // ── Validadores de campo ─────────────────────────────────

  function _text(id) {
    const el = document.getElementById(id);
    const ok = !!(el && el.value.trim());
    _markField(el, ok);
    _bindClear(el, 'input');
    document.getElementById('err-' + id)?.classList.toggle('show', !ok);
    return ok;
  }

  function _select(id) {
    const el = document.getElementById(id);
    const ok = !!(el && el.value);
    _markField(el, ok);
    _bindClear(el, 'change');
    document.getElementById('err-' + id)?.classList.toggle('show', !ok);
    return ok;
  }

  function _email(id) {
    const el  = document.getElementById(id);
    const ok  = !!(el && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
    el?.classList.toggle('invalid', !ok);
    document.getElementById('err-' + id)?.classList.toggle('show', !ok);
    return ok;
  }

  function _radio(name, scope) {
    return !!(scope || document).querySelector('input[name="' + name + '"]:checked');
  }

  function _checkbox(name) {
    const ok = document.querySelectorAll('input[name="' + name + '"]:checked').length > 0;
    document.getElementById('err-' + name)?.classList.toggle('show', !ok);
    return ok;
  }

  // ── Validación de tarjetas de aplicativos ────────────────
  // Se ejecuta al hacer clic en Continuar en secciones 2 y 3.
  // Recorre cada .client-row y valida sus campos.

  function _validateCards(containerId, isClient) {
    const container = document.getElementById(containerId);
    if (!container) return true;

    const rows = container.querySelectorAll('.client-row');
    if (!rows.length) return true; // sin tarjetas = sin error

    let valid = true;

    rows.forEach(row => {
      const uid = row.id.replace('row_', '');

      // Texto: proyecto y rol (secciones 2 y 3)
      [uid + '_proyecto', uid + '_rol'].forEach(fid => {
        const el = document.getElementById(fid);
        if (!el) return;
        const ok = el.value.trim() !== '';
        _markField(el, ok);
        _bindClear(el, 'input');
        if (!ok) valid = false;
      });

      // Texto: nombre del cliente (solo sección 3)
      if (isClient) {
        const el = document.getElementById(uid + '_nombre');
        if (el) {
          const ok = el.value.trim() !== '';
          _markField(el, ok);
          _bindClear(el, 'input');
          if (!ok) valid = false;
        }
      }

      // Select: líder responsable (solo sección 3)
      if (isClient) {
        const el = document.getElementById(uid + '_lider');
        if (el) {
          const ok = el.value !== '';
          _markField(el, ok);
          _bindClear(el, 'change');
          if (!ok) valid = false;
        }
      }

      // Radio: MFA (secciones 2 y 3)
      if (!_radio(uid + '_mfa', row)) {
        _markRadioGroup(row, uid + '_mfa');
        valid = false;
      }

      // Radio: tipo de cuenta (solo sección 3)
      if (isClient && !_radio(uid + '_cuenta', row)) {
        _markRadioGroup(row, uid + '_cuenta');
        valid = false;
      }
    });

    // Nombre de app personalizada
    container.querySelectorAll('input[id^="customname_"]').forEach(el => {
      const ok = el.value.trim() !== '';
      el.style.borderBottomColor = ok ? 'rgba(45,232,176,0.4)' : 'rgba(255,71,87,0.6)';
      if (!el._vcBound) {
        el.addEventListener('input', () => { el.style.borderBottomColor = 'rgba(45,232,176,0.4)'; });
        el._vcBound = true;
      }
      if (!ok) valid = false;
    });

    // Mensaje de error global de la sección
    _setAppsError(containerId, !valid);
    return valid;
  }

  function _setAppsError(containerId, show) {
    const errId = 'err-apps-' + containerId;
    let el = document.getElementById(errId);
    if (!el) {
      el = document.createElement('p');
      el.id = errId;
      el.style.cssText =
        'display:none;color:#ff4757;font-size:12px;margin-top:10px;' +
        "font-family:'IBM Plex Mono',monospace;";
      el.textContent = '⚠ Completa todos los campos marcados en rojo antes de continuar.';
      document.getElementById(containerId)?.insertAdjacentElement('afterend', el);
    }
    el.style.display = show ? 'block' : 'none';
  }

  // ── Validación principal — llamada desde goNext(n) ───────

  function validateSection(n) {
    const ok = [];

    // Sección 1: datos del empleado
    if (n === 1) {
      ok.push(_text('nombreCompleto'));
      ok.push(_text('documento'));
      ok.push(_email('correo'));
      ok.push(_text('cargo'));
      ok.push(_text('area'));
      ok.push(_select('lider'));
      const radioOk = _radio('asignadoProyectos');
      ok.push(radioOk);
      if (!radioOk) {
        _markRadioGroup(document, 'asignadoProyectos');
        document.getElementById('err-asignadoProyectos')?.classList.add('show');
      }
    }

    // Sección 2: apps corporativos
    // ── Dispara al hacer clic en "Continuar" de sección 2 ──
    if (n === 2) {
      const hasApps = _checkbox('appCorp');
      ok.push(hasApps);
      if (hasApps) ok.push(_validateCards('corpAppDetails', false));
    }

    // Sección 3: apps de cliente
    // ── Dispara al hacer clic en "Continuar" de sección 3 ──
    if (n === 3) {
      const hasApps = _checkbox('appClient');
      ok.push(hasApps);
      if (hasApps) ok.push(_validateCards('clientAppDetails', true));
    }

    // Sección 4: cuestionario de seguridad
    if (n === 4) {
      ['mismaContrasena', 'compartidoCredenciales', 'accesosSobrantes', 'appsPersonales']
        .forEach(name => {
          const radioOk = _radio(name);
          ok.push(radioOk);
          if (!radioOk) {
            _markRadioGroup(document, name);
            document.getElementById('err-' + name)?.classList.add('show');
          }
        });
      const sobrante = document.querySelector('input[name="accesosSobrantes"]:checked');
      if (sobrante && sobrante.value === 'Si') ok.push(_text('cualesAccesos'));
    }

    return ok.every(Boolean);
  }

  return { validateSection };
})();
