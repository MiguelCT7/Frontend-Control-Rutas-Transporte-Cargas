/**
 * App.js
 * Punto de entrada principal de la aplicación.
 * Gestiona autenticación y navegación entre módulos.
 */

// ── Autenticación ────────────────────────────────────────────────────────────

const Auth = (() => {

    async function login() {
        const usuario    = document.getElementById('login-usuario').value.trim();
        const contrasena = document.getElementById('login-contrasena').value.trim();
        const errorEl    = document.getElementById('login-error');

        errorEl.textContent = '';

        if (!usuario || !contrasena) {
            errorEl.textContent = 'Ingresa usuario y contraseña.';
            return;
        }

        const res = await ApiService.post(`${CONFIG.MS_AUTH}/api/auth/login`, {
            usuario,
            contrasena,
        });

        if (res.success) {
            SessionService.guardar(res.data.token, res.data);
            mostrarPrincipal(res.data);
        } else {
            errorEl.textContent = res.mensaje || 'Credenciales incorrectas.';
        }
    }

    async function logout() {
        if (!confirm('¿Cerrar sesión?')) return;

        await ApiService.post(`${CONFIG.MS_AUTH}/api/auth/logout`);
        SessionService.limpiar();
        mostrarLogin();
    }

    function mostrarPrincipal(usuario) {
        document.getElementById('pantalla-login').style.display     = 'none';
        document.getElementById('pantalla-principal').style.display = 'flex';

        const nombre = usuario.nombre || usuario.usuario || 'Usuario';
        document.getElementById('usuario-nombre').textContent = nombre;
        document.getElementById('usuario-avatar').textContent =
            nombre.substring(0, 2).toUpperCase();

        Navegacion.ir('dashboard');
    }

    function mostrarLogin() {
        document.getElementById('pantalla-principal').style.display = 'none';
        document.getElementById('pantalla-login').style.display     = 'flex';
        document.getElementById('login-usuario').value              = '';
        document.getElementById('login-contrasena').value           = '';
    }

    function verificarSesion() {
        if (SessionService.haySesion()) {
            const usuario = SessionService.obtenerUsuario();
            mostrarPrincipal(usuario);
        }
    }

    return { login, logout, verificarSesion };
})();

// ── Navegación ───────────────────────────────────────────────────────────────

const Navegacion = (() => {

    const titulos = {
        dashboard:    'Dashboard',
        usuarios:     'Usuarios',
        conductores:  'Conductores',
        vehiculos:    'Vehículos',
        rutas:        'Rutas y Programación',
        programacion: 'Rutas y Programación',
        viajes:       'Viajes y Seguimiento',
    };

    const modulos = {
        dashboard:    () => ModuloDashboard.renderizar(),
        usuarios:     () => ModuloUsuarios.renderizar(),
        conductores:  () => ModuloConductores.renderizar(),
        vehiculos:    () => ModuloVehiculos.renderizar(),
        rutas:        () => ModuloRutas.renderizar(),
        programacion: () => {
            ModuloRutas.renderizar().then(() => {
                ModuloRutas.cambiarTab('programaciones');
            });
        },
        viajes: () => ModuloViajes.renderizar(),
    };

    function ir(modulo) {
        document.getElementById('topbar-titulo').textContent =
            titulos[modulo] || modulo;

        document.querySelectorAll('.nav-item').forEach(el => {
            el.classList.remove('active');
        });

        event?.currentTarget?.classList.add('active');

        if (modulos[modulo]) {
            modulos[modulo]();
        }
    }

    return { ir };
})();

// ── Inicialización ───────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('login-contrasena')
        .addEventListener('keypress', (e) => {
            if (e.key === 'Enter') Auth.login();
        });

    Auth.verificarSesion();
});