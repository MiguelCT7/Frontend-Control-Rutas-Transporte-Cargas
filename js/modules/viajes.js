/**
 * Módulo Viajes y Seguimiento
 * Gestiona el control operativo y el historial de viajes.
 */
const ModuloViajes = (() => {

    const URL_BASE = () => `${CONFIG.MS_VIAJES}/api/viajes`;

    let accionActual = '';

    async function renderizar() {
        const contenido = document.getElementById('contenido-principal');
        contenido.innerHTML = `
            <div class="modulo-header">
                <div>
                    <h2 class="modulo-titulo">Viajes y Seguimiento</h2>
                    <p class="modulo-subtitulo">Control operativo en tiempo real</p>
                </div>
            </div>

            <div class="filtros-barra">
                <input class="input-busqueda" type="number" id="filtro-prog-id"
                    placeholder="ID de programación..." oninput="ModuloViajes.filtrar()">
                <select class="select-filtro" id="filtro-viaje-estado"
                    onchange="ModuloViajes.filtrar()">
                    <option value="">Todos los estados</option>
                    <option value="en_transito">En tránsito</option>
                    <option value="retrasado">Retrasado</option>
                    <option value="finalizado">Finalizado</option>
                    <option value="cancelado">Cancelado</option>
                </select>
            </div>

            <div class="acciones-viaje">
                <button class="btn btn--primario"
                    onclick="ModuloViajes.abrirModalAccion('iniciar')">▶ Iniciar Viaje</button>
                <button class="btn btn--advertencia"
                    onclick="ModuloViajes.abrirModalAccion('estado')">↺ Actualizar Estado</button>
                <button class="btn btn--info"
                    onclick="ModuloViajes.abrirModalAccion('novedad')">+ Registrar Novedad</button>
                <button class="btn btn--exito"
                    onclick="ModuloViajes.abrirModalAccion('finalizar')">■ Finalizar Viaje</button>
                <button class="btn btn--secundario"
                    onclick="ModuloViajes.abrirHistorial()">📋 Ver Historial</button>
            </div>

            <div id="tabla-viajes" class="tabla-contenedor">
                <div class="cargando">Cargando...</div>
            </div>

            <!-- Modal acción -->
            <div id="modal-viaje-accion" class="modal" style="display:none">
                <div class="modal__caja modal__caja--sm">
                    <div class="modal__cabecera">
                        <h3 id="modal-accion-titulo">Acción sobre Viaje</h3>
                        <button class="modal__cerrar"
                            onclick="ModuloViajes.cerrarModal()">×</button>
                    </div>
                    <div class="form-grid">
                        <div class="form-grupo form-grupo--completo">
                            <label>ID de Programación *</label>
                            <input type="number" id="accion-prog-id" class="form-input" required>
                        </div>
                        <div class="form-grupo form-grupo--completo"
                            id="grupo-estado-viaje" style="display:none">
                            <label>Nuevo Estado *</label>
                            <select id="accion-estado" class="form-input">
                                <option value="en_transito">En tránsito</option>
                                <option value="retrasado">Retrasado</option>
                                <option value="finalizado">Finalizado</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </div>
                        <div class="form-grupo form-grupo--completo">
                            <label>Novedad / Observación</label>
                            <textarea id="accion-novedad" class="form-input" rows="3"
                                placeholder="Describe la situación..."></textarea>
                        </div>
                        <div class="form-acciones">
                            <button type="button" class="btn btn--secundario"
                                onclick="ModuloViajes.cerrarModal()">Cancelar</button>
                            <button type="button" class="btn btn--primario"
                                onclick="ModuloViajes.ejecutarAccion()">Confirmar</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal historial -->
            <div id="modal-historial" class="modal" style="display:none">
                <div class="modal__caja modal__caja--lg">
                    <div class="modal__cabecera">
                        <h3>Historial del Viaje</h3>
                        <button class="modal__cerrar"
                            onclick="document.getElementById('modal-historial').style.display='none'">×</button>
                    </div>
                    <div class="form-grid">
                        <div class="form-grupo form-grupo--completo">
                            <label>ID de Programación</label>
                            <div style="display:flex;gap:8px">
                                <input type="number" id="hist-prog-id" class="form-input"
                                    placeholder="Ej: 1">
                                <button class="btn btn--primario"
                                    onclick="ModuloViajes.cargarHistorial()">Buscar</button>
                            </div>
                        </div>
                        <div id="contenido-historial" class="form-grupo--completo"></div>
                    </div>
                </div>
            </div>
        `;

        await cargarTabla();
    }

    async function cargarTabla(filtros = {}) {
        const contenedor = document.getElementById('tabla-viajes');
        if (!contenedor) return;
        contenedor.innerHTML = '<div class="cargando">Cargando...</div>';

        const params = new URLSearchParams(filtros).toString();
        const res = await ApiService.get(`${URL_BASE()}${params ? '?' + params : ''}`);

        if (!res.success || !res.data.length) {
            contenedor.innerHTML = res.success
                ? '<div class="vacio-msg">No hay registros de seguimiento.</div>'
                : `<div class="error-msg">${res.mensaje}</div>`;
            return;
        }

        const clases = {
            en_transito: 'badge--info',
            retrasado:   'badge--advertencia',
            finalizado:  'badge--exito',
            cancelado:   'badge--peligro',
            programado:  'badge--neutro',
        };

        contenedor.innerHTML = `
            <table class="tabla">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Programación</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Estado</th>
                        <th>Novedad</th>
                    </tr>
                </thead>
                <tbody>
                    ${res.data.map(s => `
                        <tr>
                            <td>${s.id}</td>
                            <td>#${s.programacion_viaje_id}</td>
                            <td>${s.fecha}</td>
                            <td>${s.hora}</td>
                            <td><span class="badge ${clases[s.estado] || ''}">
                                ${s.estado.replace('_', ' ')}</span></td>
                            <td>${s.novedad || '—'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    function filtrar() {
        const progId = document.getElementById('filtro-prog-id')?.value || '';
        const estado = document.getElementById('filtro-viaje-estado')?.value || '';
        const f = {};
        if (progId) f.programacion_id = progId;
        if (estado) f.estado = estado;
        cargarTabla(f);
    }

    const titulos = {
        iniciar:   'Iniciar Viaje',
        estado:    'Actualizar Estado',
        novedad:   'Registrar Novedad',
        finalizar: 'Finalizar Viaje',
    };

    function abrirModalAccion(accion) {
        accionActual = accion;
        document.getElementById('modal-viaje-accion').style.display = 'flex';
        document.getElementById('modal-accion-titulo').textContent = titulos[accion] || 'Acción';
        document.getElementById('grupo-estado-viaje').style.display =
            accion === 'estado' ? 'block' : 'none';
        document.getElementById('accion-prog-id').value = '';
        document.getElementById('accion-novedad').value = '';
    }

    function cerrarModal() {
        document.getElementById('modal-viaje-accion').style.display = 'none';
    }

    async function ejecutarAccion() {
        const progId  = parseInt(document.getElementById('accion-prog-id').value);
        const novedad = document.getElementById('accion-novedad').value.trim();
        const estado  = document.getElementById('accion-estado')?.value;

        if (!progId) {
            NotificacionService.error('Ingresa el ID de programación.');
            return;
        }

        let url, payload;

        switch (accionActual) {
            case 'iniciar':
                url     = `${URL_BASE()}/iniciar`;
                payload = { programacion_viaje_id: progId, novedad };
                break;
            case 'estado':
                url     = `${URL_BASE()}/estado`;
                payload = { programacion_viaje_id: progId, estado, novedad };
                break;
            case 'novedad':
                if (!novedad) {
                    NotificacionService.error('Describe la novedad.');
                    return;
                }
                url     = `${URL_BASE()}/novedad`;
                payload = { programacion_viaje_id: progId, novedad };
                break;
            case 'finalizar':
                url     = `${URL_BASE()}/finalizar`;
                payload = { programacion_viaje_id: progId, novedad };
                break;
        }

        const res = await ApiService.post(url, payload);

        if (res.success) {
            NotificacionService.exito(res.mensaje);
            cerrarModal();
            cargarTabla();
        } else {
            NotificacionService.error(res.mensaje || 'Error al ejecutar la acción.');
        }
    }

    function abrirHistorial() {
        document.getElementById('modal-historial').style.display = 'flex';
        document.getElementById('contenido-historial').innerHTML = '';
        document.getElementById('hist-prog-id').value = '';
    }

    async function cargarHistorial() {
        const progId = document.getElementById('hist-prog-id').value;
        if (!progId) {
            NotificacionService.error('Ingresa el ID de programación.');
            return;
        }

        const contenedor = document.getElementById('contenido-historial');
        contenedor.innerHTML = '<div class="cargando">Cargando historial...</div>';

        const res = await ApiService.get(`${URL_BASE()}/historial/${progId}`);

        if (!res.success || !res.data.length) {
            contenedor.innerHTML = '<div class="vacio-msg">No hay historial para esta programación.</div>';
            return;
        }

        const clases = {
            en_transito: 'badge--info',
            retrasado:   'badge--advertencia',
            finalizado:  'badge--exito',
            cancelado:   'badge--peligro',
            programado:  'badge--neutro',
        };

        contenedor.innerHTML = `
            <div class="timeline">
                ${res.data.map(s => `
                    <div class="timeline__item">
                        <div class="timeline__punto"></div>
                        <div class="timeline__contenido">
                            <div class="timeline__meta">
                                <span class="badge ${clases[s.estado] || ''}">
                                    ${s.estado.replace('_', ' ')}
                                </span>
                                <span class="timeline__fecha">${s.fecha} — ${s.hora}</span>
                            </div>
                            ${s.novedad
                                ? `<p class="timeline__novedad">${s.novedad}</p>`
                                : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    return {
        renderizar, filtrar,
        abrirModalAccion, cerrarModal, ejecutarAccion,
        abrirHistorial, cargarHistorial,
    };
})();