const Auth = (() => {

  function init() {
    // El botón llama a signIn() directamente
  }

  function signIn() {
    const btn = document.getElementById('googleSignInBtn');
    btn.style.opacity = '0.7';
    btn.style.pointerEvents = 'none';
    btn.textContent = 'Conectando con Google...';

    if (typeof google === 'undefined') {
      _showError('No se pudo cargar Google Sign-In. Verifica tu conexión.');
      _resetBtn();
      return;
    }

    const client = google.accounts.oauth2.initTokenClient({
      client_id: CONFIG.GOOGLE_CLIENT_ID,
      scope: 'email profile',
      callback: (tokenResponse) => {
        if (tokenResponse.error) {
          _showError('Error al autenticar: ' + tokenResponse.error);
          _resetBtn();
          return;
        }
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: 'Bearer ' + tokenResponse.access_token },
        })
          .then(r => r.json())
          .then(profile => _handleProfile(profile))
          .catch(() => { _showError('No se pudo obtener el perfil. Intenta de nuevo.'); _resetBtn(); });
      },
    });

    client.requestAccessToken({ prompt: 'select_account' });
  }

  function signOut() {
    State.googleUser = null;

    document.getElementById('userBadge').style.display = 'none';
    document.getElementById('loginScreen').style.opacity = '1';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('loginError').style.display = 'none';
    _resetBtn();

    const correoInput = document.getElementById('correo');
    if (correoInput) {
      correoInput.value = '';
      correoInput.readOnly = false;
      correoInput.style.opacity = '1';
      correoInput.style.cursor = 'text';
    }
  }
  // ── Privadas ────────────────────────────────────────────
  function _handleProfile(profile) {
    const email = (profile.email || '').toLowerCase();
    const domain = email.split('@')[1] || '';

    if (domain !== CONFIG.ALLOWED_DOMAIN) {
      _showError(
        `❌ Acceso denegado.\n\nSolo cuentas @${CONFIG.ALLOWED_DOMAIN} pueden acceder.\nCorreo detectado: ${email}`
      );
      _resetBtn();
      return;
    }

    State.googleUser = profile;
    // Pre-llenar correo y bloquearlo
    const correoInput = document.getElementById('correo');
    if (correoInput) {
      correoInput.value = email;
      correoInput.readOnly = true;
      correoInput.style.opacity = '0.7';
      correoInput.style.cursor = 'not-allowed';
    }
    // Mostrar badge de usuario
    const badge = document.getElementById('userBadge');
    const avatar = document.getElementById('userAvatar');
    const name = document.getElementById('userName');
    if (badge) badge.style.display = 'flex';
    if (avatar && profile.picture) avatar.src = profile.picture;
    if (name) name.textContent = `${profile.name} · ${email}`;
    // Ocultar pantalla de login
    const loginScreen = document.getElementById('loginScreen');
    loginScreen.style.transition = 'opacity 0.4s ease';
    loginScreen.style.opacity = '0';
    setTimeout(() => { loginScreen.style.display = 'none'; }, 400);
  }

  function _showError(msg) {
    const el = document.getElementById('loginError');
    el.textContent = msg;
    el.style.display = 'block';
    el.style.whiteSpace = 'pre-line';
  }

  function _resetBtn() {
    const btn = document.getElementById('googleSignInBtn');
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
    btn.innerHTML = `
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" height="20" alt="Google">
      Iniciar sesión con Google`;
  }

  return { init, signIn, signOut };
})();
