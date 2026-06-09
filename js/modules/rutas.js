/**
 * Módulo Rutas
 * Gestiona rutas de transporte y programación de viajes.
 */
const ModuloRutas = (() => {

    const URL_RUTAS          = () => `${CONFIG.MS_RUTAS}/api/rutas`;
    const URL_PROGRAMACIONES = () => `${CONFIG.MS_RUTAS}/api/programaciones`;

    async function renderizar() {
        const contenido = document.getElementById('contenido-principal');
        contenido.innerHTML = `
            <div class="modulo-header">
                <div>
                    <h2 class="modulo-titulo">Rutas y Programación</h2>
                    <p class="modulo-subtitulo">Gestión de rutas y viajes programados</p>
                </div>
            </div>

            <div class="tabs">
                <button class="tab tab--activo" id="tab-rutas"
                    onclick="ModuloRutas.cambiarTab('rutas')">Rutas</button>
                <button class="tab" id="tab-prog"
                    onclick="ModuloRutas.cambiarTab('programaciones')">Programaciones</button>
            </div>

            <!-- Panel Rutas -->
            <div id="panel-rutas">
                <div class="panel-acciones">
                    <input class="input-busqueda" type="text" id="filtro-ciudad"
                        placeholder="Buscar ciudad..." oninput="ModuloRutas.filtrarRutas()">
                    <button class="btn btn--primario" onclick="ModuloRutas.abrirModalRuta()">
                        + Nueva Ruta
                    </button>
                </div>
                <div id="tabla-rutas" class="tabla-contenedor">
                    <div class="cargando">Cargando...</div>
                </div>
            </div>

            <!-- Panel Programaciones -->
            <div id="panel-programaciones" style="display:none">
                <div class="panel-acciones">
                    <select class="select-filtro" id="filtro-prog-estado"
                        onchange="ModuloRutas.filtrarProgramaciones()">
                        <option value="">Todos los estados</option>
                        <option value="programado">Programado</option>
                        <option value="en_transito">En tránsito</option>
                        <option value="retrasado">Retrasado</option>
                        <option value="finalizado">Finalizado</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                    <button class="btn btn--primario" onclick="ModuloRutas.abrirModalProgramacion()">
                        + Programar Viaje
                    </button>
                </div>
                <div id="tabla-programaciones" class="tabla-contenedor">
                    <div class="cargando">Cargando...</div>
                </div>
            </div>

            <!-- Modal Ruta -->
            <div id="modal-ruta" class="modal" style="display:none">
                <div class="modal__caja">
                    <div class="modal__cabecera">
                        <h3 id="modal-ruta-titulo">Nueva Ruta</h3>
                        <button class="modal__cerrar" onclick="ModuloRutas.cerrarModalRuta()">×</button>
                    </div>
                    <form class="form-grid">
                        <input type="hidden" id="ruta-id">
                        <div class="form-grupo">
                            <label>Ciudad Origen *</label>
                            <input type="text" id="r-origen" class="form-input" required>
                        </div>
                        <div class="form-grupo">
                            <label>Ciudad Destino *</label>
                            <input type="text" id="r-destino" class="form-input" required>
                        </div>
                        <div class="form-grupo">
                            <label>Distancia (km) *</label>
                            <input type="number" id="r-distancia" class="form-input" min="1" step="0.1">
                        </div>
                        <div class="form-grupo">
                            <label>Tiempo Estimado *</label>
                            <input type="text" id="r-tiempo" class="form-input" placeholder="Ej: 8 horas">
                        </div>
                        <div class="form-grupo form-grupo--completo">
                            <label>Observaciones</label>
                            <textarea id="r-obs" class="form-input" rows="2"></textarea>
                        </div>
                        <div class="form-acciones">
                            <button type="button" class="btn btn--secundario"
                                onclick="ModuloRutas.cerrarModalRuta()">Cancelar</button>
                            <button type="button" class="btn btn--primario"
                                onclick="ModuloRutas.guardarRuta()">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Modal Programación -->
            <div id="modal-programacion" class="modal" style="display:none">
                <div class="modal__caja">
                    <div class="modal__cabecera">
                        <h3>Programar Viaje</h3>
                        <button class="modal__cerrar"
                            onclick="ModuloRutas.cerrarModalProgramacion()">×</button>
                    </div>
                    <form class="form-grid">
                        <input type="hidden" id="prog-id">
                        <div class="form-grupo">
                            <label>Conductor ID *</label>
                            <input type="number" id="p-conductor" class="form-input" required>
                        </div>
                        <div class="form-grupo">
                            <label>Vehículo ID *</label>
                            <input type="number" id="p-vehiculo" class="form-input" required>
                        </div>
                        <div class="form-grupo form-grupo--completo">
                            <label>Ruta *</label>
                            <select id="p-ruta" class="form-input" required>
                                <option value="">Seleccionar ruta...</option>
                            </select>
                        </div>
                        <div class="form-grupo">
                            <label>Fecha de Salida *</label>
                            <input type="date" id="p-fecha-salida" class="form-input" required>
                        </div>
                        <div class="form-grupo">
                            <label>Hora de Salida *</label>
                            <input type="time" id="p-hora-salida" class="form-input" required>
                        </div>
                        <div class="form-grupo form-grupo--completo">
                            <label>Fecha Estimada de Llegada *</label>
                            <input type="date" id="p-fecha-llegada" class="form-input" required>
                        </div>
                        <div class="form-grupo form-grupo--completo">
                            <label>Observaciones</label>
                            <textarea id="p-obs" class="form-input" rows="2"></textarea>
                        </div>
                        <div class="form-acciones">
                            <button type="button" class="btn btn--secundario"
                                onclick="ModuloRutas.cerrarModalProgramacion()">Cancelar</button>
                            <button type="button" class="btn btn--primario"
                                onclick="ModuloRutas.guardarProgramacion()">Programar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        await cargarTablaRutas();
    }

    function cambiarTab(tab) {
        document.getElementById('panel-rutas').style.display =
            tab === 'rutas' ? 'block' : 'none';
        document.getElementById('panel-programaciones').style.display =
            tab === 'programaciones' ? 'block' : 'none';
        document.getElementById('tab-rutas').classList.toggle('tab--activo', tab === 'rutas');
        document.getElementById('tab-prog').classList.toggle('tab--activo', tab === 'programaciones');

        if (tab === 'programaciones') cargarTablaProgramaciones();
    }

    // ── Rutas ────────────────────────────────────────────────────────────────

    async function cargarTablaRutas(filtros = {}) {
        const contenedor = document.getElementById('tabla-rutas');
        if (!contenedor) return;
        contenedor.innerHTML = '<div class="cargando">Cargando...</div>';

        const params = new URLSearchParams(filtros).toString();
        const res = await ApiService.get(`${URL_RUTAS()}${params ? '?' + params : ''}`);

        if (!res.success || !res.data.length) {
            contenedor.innerHTML = res.success
                ? '<div class="vacio-msg">No hay rutas registradas.</div>'
                : `<div class="error-msg">${res.mensaje}</div>`;
            return;
        }

        contenedor.innerHTML = `
            <table class="tabla">
                <thead>
                    <tr>
                        <th>Origen</th>
                        <th>Destino</th>
                        <th>Distancia</th>
                        <th>Tiempo Est.</th>
                        <th>Observaciones</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${res.data.map(r => `
                        <tr>
                            <td>${r.ciudad_origen}</td>
                            <td>${r.ciudad_destino}</td>
                            <td>${r.distancia} km</td>
                            <td>${r.tiempo_estimado}</td>
                            <td>${r.observaciones || '—'}</td>
                            <td class="acciones">
                                <button class="btn-tabla btn-tabla--editar"
                                    onclick='ModuloRutas.abrirModalRuta(${JSON.stringify(r)})'>Editar</button>
                                <button class="btn-tabla btn-tabla--eliminar"
                                    onclick="ModuloRutas.eliminarRuta(${r.id})">Eliminar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    function filtrarRutas() {
        const ciudad = document.getElementById('filtro-ciudad')?.value || '';
        cargarTablaRutas(ciudad ? { ciudad } : {});
    }

    function abrirModalRuta(ruta = null) {
        document.getElementById('modal-ruta').style.display = 'flex';
        document.getElementById('modal-ruta-titulo').textContent =
            ruta ? 'Editar Ruta' : 'Nueva Ruta';

        if (ruta) {
            document.getElementById('ruta-id').value     = ruta.id;
            document.getElementById('r-origen').value    = ruta.ciudad_origen;
            document.getElementById('r-destino').value   = ruta.ciudad_destino;
            document.getElementById('r-distancia').value = ruta.distancia;
            document.getElementById('r-tiempo').value    = ruta.tiempo_estimado;
            document.getElementById('r-obs').value       = ruta.observaciones || '';
        } else {
            ['ruta-id','r-origen','r-destino','r-distancia','r-tiempo','r-obs']
                .forEach(id => document.getElementById(id).value = '');
        }
    }

    function cerrarModalRuta() {
        document.getElementById('modal-ruta').style.display = 'none';
    }

    async function guardarRuta() {
        const id = document.getElementById('ruta-id').value;
        const payload = {
            ciudad_origen:   document.getElementById('r-origen').value.trim(),
            ciudad_destino:  document.getElementById('r-destino').value.trim(),
            distancia:       parseFloat(document.getElementById('r-distancia').value),
            tiempo_estimado: document.getElementById('r-tiempo').value.trim(),
            observaciones:   document.getElementById('r-obs').value.trim() || null,
        };

        if (!payload.ciudad_origen || !payload.ciudad_destino || !payload.tiempo_estimado) {
            NotificacionService.error('Completa los campos obligatorios.');
            return;
        }

        const res = id
            ? await ApiService.put(`${URL_RUTAS()}/${id}`, payload)
            : await ApiService.post(URL_RUTAS(), payload);

        if (res.success) {
            NotificacionService.exito(res.mensaje);
            cerrarModalRuta();
            cargarTablaRutas();
        } else {
            NotificacionService.error(res.mensaje || 'Error al guardar la ruta.');
        }
    }

    async function eliminarRuta(id) {
        if (!confirm('¿Eliminar esta ruta?')) return;
        const res = await ApiService.delete(`${URL_RUTAS()}/${id}`);
        if (res.success) {
            NotificacionService.exito(res.mensaje);
            cargarTablaRutas();
        } else {
            NotificacionService.error(res.mensaje);
        }
    }

    // ── Programaciones ───────────────────────────────────────────────────────

    async function cargarTablaProgramaciones(filtros = {}) {
        const contenedor = document.getElementById('tabla-programaciones');
        if (!contenedor) return;
        contenedor.innerHTML = '<div class="cargando">Cargando...</div>';

        const params = new URLSearchParams(filtros).toString();
        const res = await ApiService.get(`${URL_PROGRAMACIONES()}${params ? '?' + params : ''}`);

        if (!res.success || !res.data.length) {
            contenedor.innerHTML = res.success
                ? '<div class="vacio-msg">No hay programaciones registradas.</div>'
                : `<div class="error-msg">${res.mensaje}</div>`;
            return;
        }

        const clases = {
            programado:  'badge--neutro',
            en_transito: 'badge--info',
            retrasado:   'badge--advertencia',
            finalizado:  'badge--exito',
            cancelado:   'badge--peligro',
        };

        contenedor.innerHTML = `
            <table class="tabla">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Conductor</th>
                        <th>Vehículo</th>
                        <th>Ruta</th>
                        <th>Salida</th>
                        <th>Llegada Est.</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${res.data.map(p => `
                        <tr>
                            <td>#${p.id}</td>
                            <td>Conductor #${p.conductor_id}</td>
                            <td>Vehículo #${p.vehiculo_id}</td>
                            <td>${p.ruta ? p.ruta.ciudad_origen + ' → ' + p.ruta.ciudad_destino : '—'}</td>
                            <td>${p.fecha_salida} ${p.hora_salida}</td>
                            <td>${p.fecha_estimada_llegada}</td>
                            <td><span class="badge ${clases[p.estado] || ''}">
                                ${p.estado.replace('_', ' ')}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    function filtrarProgramaciones() {
        const estado = document.getElementById('filtro-prog-estado')?.value || '';
        cargarTablaProgramaciones(estado ? { estado } : {});
    }

    async function abrirModalProgramacion() {
        const resRutas = await ApiService.get(URL_RUTAS());
        const selectRuta = document.getElementById('p-ruta');
        selectRuta.innerHTML = '<option value="">Seleccionar ruta...</option>';

        if (resRutas.success) {
            resRutas.data.forEach(r => {
                selectRuta.innerHTML += `
                    <option value="${r.id}">
                        ${r.ciudad_origen} → ${r.ciudad_destino} (${r.distancia}km)
                    </option>`;
            });
        }

        document.getElementById('modal-programacion').style.display = 'flex';
        document.getElementById('prog-id').value = '';
    }

    function cerrarModalProgramacion() {
        document.getElementById('modal-programacion').style.display = 'none';
    }

    async function guardarProgramacion() {
        const payload = {
            conductor_id:           parseInt(document.getElementById('p-conductor').value),
            vehiculo_id:            parseInt(document.getElementById('p-vehiculo').value),
            ruta_id:                parseInt(document.getElementById('p-ruta').value),
            fecha_salida:           document.getElementById('p-fecha-salida').value,
            hora_salida:            document.getElementById('p-hora-salida').value + ':00',
            fecha_estimada_llegada: document.getElementById('p-fecha-llegada').value,
            observaciones:          document.getElementById('p-obs').value.trim() || null,
        };

        if (!payload.conductor_id || !payload.vehiculo_id || !payload.ruta_id || !payload.fecha_salida) {
            NotificacionService.error('Completa todos los campos obligatorios.');
            return;
        }

        const res = await ApiService.post(URL_PROGRAMACIONES(), payload);

        if (res.success) {
            NotificacionService.exito(res.mensaje);
            cerrarModalProgramacion();
            cargarTablaProgramaciones();
        } else {
            NotificacionService.error(res.mensaje || 'Error al programar el viaje.');
        }
    }

    return {
        renderizar, cambiarTab,
        filtrarRutas, abrirModalRuta, cerrarModalRuta, guardarRuta, eliminarRuta,
        filtrarProgramaciones, abrirModalProgramacion, cerrarModalProgramacion, guardarProgramacion,
    };
})();