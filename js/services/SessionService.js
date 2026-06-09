/**
 * SessionService
 * Gestiona el almacenamiento y recuperación de la sesión del usuario.
 */
class SessionService {

    static KEY_TOKEN   = 'lt_token';
    static KEY_USUARIO = 'lt_usuario';

    static guardar(token, usuario) {
        sessionStorage.setItem(this.KEY_TOKEN,   token);
        sessionStorage.setItem(this.KEY_USUARIO, JSON.stringify(usuario));
    }

    static obtenerToken() {
        return sessionStorage.getItem(this.KEY_TOKEN);
    }

    static obtenerUsuario() {
        const raw = sessionStorage.getItem(this.KEY_USUARIO);
        return raw ? JSON.parse(raw) : null;
    }

    static haySesion() {
        return !!this.obtenerToken();
    }

    static limpiar() {
        sessionStorage.removeItem(this.KEY_TOKEN);
        sessionStorage.removeItem(this.KEY_USUARIO);
    }
}