/**
 * NotificacionService
 * Muestra notificaciones tipo toast en la interfaz de usuario.
 */
class NotificacionService {

    static exito(mensaje) {
        this._mostrar(mensaje, 'exito', '✓');
    }

    static error(mensaje) {
        this._mostrar(mensaje, 'error', '✕');
    }

    static info(mensaje) {
        this._mostrar(mensaje, 'info', 'i');
    }

    static _mostrar(mensaje, tipo, icono) {
        let contenedor = document.getElementById('toast-contenedor');
        if (!contenedor) {
            contenedor = document.createElement('div');
            contenedor.id = 'toast-contenedor';
            document.body.appendChild(contenedor);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast--${tipo}`;
        toast.innerHTML = `
            <span class="toast__icono">${icono}</span>
            <span class="toast__texto">${mensaje}</span>
        `;

        contenedor.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('toast--visible'));

        setTimeout(() => {
            toast.classList.remove('toast--visible');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        }, 3500);
    }
}