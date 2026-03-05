const Validation = (() => {
  // ── Helpers ──────────────────────────────────────────────
  function _requireText(id) {
    const el = document.getElementById(id);
    const err = document.getElementById('err-' + id);
    const ok = el && el.value.trim() !== '';
    el?.classList.toggle('invalid', !ok);
    err?.classList.toggle('show', !ok);
    return ok;
  }

  function _requireSelect(id) {
    const el = document.getElementById(id);
    const err = document.getElementById('err-' + id);
    const ok = el && el.value !== '';
    if (el) el.style.borderColor = ok ? '' : 'rgba(255,71,87,0.5)';
    err?.classList.toggle('show', !ok);
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

  function _requireRadio(name) {
    const sel = document.querySelector(`input[name="${name}"]:checked`);
    const err = document.getElementById('err-' + name);
    err?.classList.toggle('show', !sel);
    return !!sel;
  }

  function _requireCheckbox(name) {
    const sel = document.querySelectorAll(`input[name="${name}"]:checked`);
    const err = document.getElementById('err-' + name);
    const ok = sel.length > 0;
    err?.classList.toggle('show', !ok);
    return ok;
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
    }

    if (n === 2) results.push(_requireCheckbox('appCorp'));

    if (n === 3) results.push(_requireCheckbox('appClient'));

    if (n === 4) {
      results.push(
        _requireRadio('mismaContrasena'),
        _requireRadio('compartidoCredenciales'),
        _requireRadio('accesosSobrantes'),
        _requireRadio('appsPersonales'),
      );
      const sobrante = document.querySelector('input[name="accesosSobrantes"]:checked');
      if (sobrante?.value === 'Si') results.push(_requireText('cualesAccesos'));
    }

    return results.every(Boolean);
  }

  return { validateSection };
})();
