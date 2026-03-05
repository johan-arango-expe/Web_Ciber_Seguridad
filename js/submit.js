const Submit = (() => {
  async function send() {
    const decl = document.getElementById('declaracion');
    if (!decl.checked) {
      document.getElementById('err-declaracion').classList.add('show');
      return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
           viewBox="0 0 24 24" style="animation:spin 1s linear infinite">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg> Enviando...`;

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

    try {
      await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(State.formData),
      });
      UI.showSuccess(ref);
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12"/>
        </svg> Enviar formulario`;
      alert(`❌ Error al enviar. Verifica tu conexión e intenta nuevamente.\n\n${err.message}`);
    }
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
