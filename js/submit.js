const Submit = (() => {

  async function send() {
    const decl = document.getElementById('declaracion');
    if (!decl.checked) {
      document.getElementById('err-declaracion').classList.add('show');
      return;
    }

    const submitBtn = document.getElementById('submitBtn');
    _setLoading(submitBtn, true);

    // ── Construir payload ──────────────────────────────────
    const g = id => { const el = document.getElementById(id); return el ? el.value : ''; };
    const r = name => { const el = document.querySelector(`input[name="${name}"]:checked`); return el ? el.value : ''; };
    const cbs = name => [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(c => c.value);
    const ref = 'AUD-' + Date.now().toString(36).toUpperCase();

    State.formData = {
      timestamp: new Date().toISOString(),
      referencia: ref,
      seccion1: {
        nombreCompleto: g('nombreCompleto'),
        documento: g('documento'),
        correo: g('correo'),
        cargo: g('cargo'),
        area: g('area'),
        lider: g('lider'),
        asignadoProyectos: r('asignadoProyectos'),
      },
      seccion2_appsCorporativos: cbs('appCorp'),
      seccion2_detalles: Apps.gatherDetails('appCorp', false),
      seccion3_appsClientes: cbs('appClient'),
      seccion3_detalles: Apps.gatherDetails('appClient', true),
      seccion4_seguridad: {
        mismaContrasena: r('mismaContrasena'),
        compartidoCredenciales: r('compartidoCredenciales'),
        accesosSobrantes: r('accesosSobrantes'),
        cualesAccesos: g('cualesAccesos'),
        appsPersonales: r('appsPersonales'),
      },
      declaracionAceptada: true,
    };

    // ── Enviar via iframe ──────────────────────────────────
    try {
      await _postViaIframe(CONFIG.APPS_SCRIPT_URL, State.formData);
      UI.showSuccess(ref);
    } catch (err) {
      _setLoading(submitBtn, false);
      alert(`❌ Error al enviar. Verifica tu conexión e intenta nuevamente.\n\n${err.message}`);
    }
  }

  // ── Core: form + iframe ────────────────────────────────
  function _postViaIframe(url, data) {
    return new Promise((resolve, reject) => {
      const uid = '_sf_' + Date.now();
      const iframe = _createIframe(uid);
      const form = _createForm(url, uid, data);

      document.body.append(iframe, form);

      // Escucha la respuesta del Apps Script via postMessage
      const onMessage = (e) => {
        const msg = typeof e.data === 'string' ? e.data : '';
        if (!msg.startsWith('FORM_OK') && !msg.startsWith('FORM_ERROR')) return;
        cleanup();
        msg.startsWith('FORM_OK')
          ? resolve()
          : reject(new Error(msg.replace('FORM_ERROR:', '')));
      };

      const timeout = setTimeout(() => {
        cleanup();
        resolve();
      }, 15000);

      function cleanup() {
        clearTimeout(timeout);
        window.removeEventListener('message', onMessage);
        try { form.remove(); } catch (_) { }
        try { iframe.remove(); } catch (_) { }
      }

      window.addEventListener('message', onMessage);
      form.submit();
    });
  }

  function _createIframe(name) {
    const el = document.createElement('iframe');
    el.name = name;
    el.style.cssText = 'display:none;width:0;height:0;border:none;position:absolute;left:-9999px;';
    return el;
  }

  function _createForm(url, target, data) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;
    form.target = target;
    form.style.display = 'none';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'payload';
    input.value = JSON.stringify(data);
    form.appendChild(input);
    return form;
  }

  // ── Helpers ────────────────────────────────────────────
  function _setLoading(btn, loading) {
    btn.disabled = loading;
    btn.innerHTML = loading
      ? `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
              viewBox="0 0 24 24" style="animation:spin 1s linear infinite">
           <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
         </svg> Enviando...`
      : `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
           <polyline points="20 6 9 17 4 12"/>
         </svg> Enviar formulario`;
  }

  function download() {
    const blob = new Blob([JSON.stringify(State.formData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sondeo-auditoria-seguridad.json';
    a.click();
  }

  return { send, download };
})();
