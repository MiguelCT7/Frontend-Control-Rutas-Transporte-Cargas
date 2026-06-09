/**
 * ApiService
 * Servicio centralizado para todas las peticiones HTTP a los microservicios.
 * Aplica el token de sesión automáticamente en cada solicitud.
 */
class ApiService {

    /**
     * Realiza una petición HTTP al microservicio indicado.
     */
    static async request(url, method = 'GET', body = null) {
        const token = SessionService.obtenerToken();

        const opciones = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        };

        if (body) {
            opciones.body = JSON.stringify(body);
        }

        try {
            const respuesta = await fetch(url, opciones);
            const datos = await respuesta.json();
            return { ok: respuesta.ok, status: respuesta.status, ...datos };
        } catch (error) {
            console.error(`[ApiService] Error en petición a ${url}:`, error);
            return { ok: false, success: false, mensaje: 'Error de conexión con el servidor.' };
        }
    }

    static get(url)         { return this.request(url, 'GET'); }
    static post(url, body)  { return this.request(url, 'POST', body); }
    static put(url, body)   { return this.request(url, 'PUT', body); }
    static patch(url, body) { return this.request(url, 'PATCH', body); }
    static delete(url)      { return this.request(url, 'DELETE'); }
}