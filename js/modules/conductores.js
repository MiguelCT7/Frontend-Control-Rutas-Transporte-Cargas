/**
 * Módulo Conductores
 * Gestiona todas las operaciones del módulo de conductores.
 */
const ModuloConductores = (() => {

    const URL_BASE = () => `${CONFIG.MS_CONDUCTORES}/api/conductores`;

    async function renderizar() {
        const contenido = document.getElementById('contenido-principal');
        contenido.innerHTML = `
            <div class="modulo-header">
                <div>
                    <h2 class="modulo-titulo">Conductores</h2>
                    <p class="modulo-subtitulo">Gestión de la flota de conductores</p>
                </div>
                <button class="btn btn--primario" onclick="ModuloConductores.abrirFormulario()">
                    + Nuevo Conductor
                </button>
            </div>

            <div class="filtros-barra">
                <input class="input-busqueda" type="text" id="filtro-documento"
                    placeholder="Buscar por documento..." oninput="ModuloConductores.filtrar()">
                <select class="select-filtro" id="filtro-estado" onchange="ModuloConductores.filtrar()">
                    <option value="">Todos los estados</option>
                    <option value="disponible">Disponible</option>
                    <option value="en_ruta">En ruta</option>
                    <option value="inactivo">Inactivo</option>
                </select>
            </div>

            <div id="tabla-conductores" class="tabla-contenedor">
                <div class="cargando">Cargando conductores...</div>
            </div>

            <div id="modal-conductor" class="modal" style="display:none">
                <div class="modal__caja">
                    <div class="modal__cabecera">
                        <h3 id="modal-titulo">Nuevo Conductor</h3>
                        <button class="modal__cerrar" onclick="ModuloConductores.cerrarModal()">×</button>
                    </div>
                    <form id="form-conductor" class="form-grid">
                        <input type="hidden" id="conductor-id">
                        <div class="form-grupo">
                            <label>Nombres *</label>
                            <input type="text" id="c-nombres" class="form-input" required>
                        </div>
                        <div class="form-grupo">
                            <label>Apellidos *</label>
                            <input type="text" id="c-apellidos" class="form-input" required>
                        </div>
                        <div class="form-grupo">
                            <label>Documento *</label>
                            <input type="text" id="c-documento" class="form-input" required>
                        </div>
                        <div class="form-grupo">
                            <label>Teléfono *</label>
                            <input type="text" id="c-telefono" class="form-input" required>
                        </div>
                        <div class="form-grupo">
                            <label>Correo *</label>
                            <input type="email" id="c-correo" class="form-input" required>
                        </div>
                        <div class="form-grupo">
                            <label>Número de Licencia *</label>
                            <input type="text" id="c-licencia" class="form-input" required>
                        </div>
                        <div class="form-grupo">
                            <label>Categoría *</label>
                            <input type="text" id="c-categoria" class="form-input" placeholder="Ej: C2, C3">
                        </div>
                        <div class="form-grupo">
                            <label>Vencimiento Licencia *</label>
                            <input type="date" id="c-vencimiento" class="form-input" required>
                        </div>
                        <div class="form-grupo">
                            <label>Estado</label>
                            <select id="c-estado" class="form-input">
                                <option value="disponible">Disponible</option>
                                <option value="en_ruta">En ruta</option>
                                <option value="inactivo">Inactivo</option>
                            </select>
                        </div>
                        <div class="form-acciones">
                            <button type="button" class="btn btn--secundario"
                                onclick="ModuloConductores.cerrarModal()">Cancelar</button>
                            <button type="button" class="btn btn--primario"
                                onclick="ModuloConductores.guardar()">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        await cargarTabla();
    }

    async function cargarTabla(filtros = {}) {
        const contenedor = document.getElementById('tabla-conductores');
        if (!contenedor) return;
        contenedor.innerHTML = '<div class="cargando">Cargando...</div>';

        const params = new URLSearchParams(filtros).toString();
        const res = await ApiService.get(`${URL_BASE()}${params ? '?' + params : ''}`);

        if (!res.success) {
            contenedor.innerHTML = `<div class="error-msg">${res.mensaje}</div>`;
            return;
        }

        if (!res.data.length) {
            contenedor.innerHTML = '<div class="vacio-msg">No se encontraron conductores.</div>';
            return;
        }

        const clases = {
            disponible: 'badge--exito',
            en_ruta:    'badge--info',
            inactivo:   'badge--peligro',
        };

        contenedor.innerHTML = `
            <table class="tabla">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Documento</th>
                        <th>Licencia</th>
                        <th>Categoría</th>
                        <th>Vencimiento</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${res.data.map(c => `
                        <tr>
                            <td>${c.nombres} ${c.apellidos}</td>
                            <td>${c.documento}</td>
                            <td>${c.numero_licencia}</td>
                            <td><span class="badge badge--neutro">${c.categoria_licencia}</span></td>
                            <td>${c.fecha_vencimiento_licencia}</td>
                            <td><span class="badge ${clases[c.estado] || ''}">${c.estado.replace('_', ' ')}</span></td>
                            <td class="acciones">
                                <button class="btn-tabla btn-tabla--editar"
                                    onclick='ModuloConductores.abrirFormulario(${JSON.stringify(c)})'>Editar</button>
                                <button class="btn-tabla btn-tabla--eliminar"
                                    onclick="ModuloConductores.eliminar(${c.id})">Eliminar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    function filtrar() {
        const documento = document.getElementById('filtro-documento')?.value || '';
        const estado    = document.getElementById('filtro-estado')?.value || '';
        const filtros   = {};
        if (documento) filtros.documento = documento;
        if (estado)    filtros.estado    = estado;
        cargarTabla(filtros);
    }

    function abrirFormulario(conductor = null) {
        document.getElementById('modal-conductor').style.display = 'flex';
        document.getElementById('modal-titulo').textContent = conductor ? 'Editar Conductor' : 'Nuevo Conductor';

        if (conductor) {
            document.getElementById('conductor-id').value    = conductor.id;
            document.getElementById('c-nombres').value      = conductor.nombres;
            document.getElementById('c-apellidos').value    = conductor.apellidos;
            document.getElementById('c-documento').value    = conductor.documento;
            document.getElementById('c-telefono').value     = conductor.telefono;
            document.getElementById('c-correo').value       = conductor.correo;
            document.getElementById('c-licencia').value     = conductor.numero_licencia;
            document.getElementById('c-categoria').value    = conductor.categoria_licencia;
            document.getElementById('c-vencimiento').value  = conductor.fecha_vencimiento_licencia;
            document.getElementById('c-estado').value       = conductor.estado;
        } else {
            document.getElementById('form-conductor').reset();
            document.getElementById('conductor-id').value = '';
        }
    }

    function cerrarModal() {
        document.getElementById('modal-conductor').style.display = 'none';
    }

    async function guardar() {
        const id = document.getElementById('conductor-id').value;

        const payload = {
            nombres:                    document.getElementById('c-nombres').value.trim(),
            apellidos:                  document.getElementById('c-apellidos').value.trim(),
            documento:                  document.getElementById('c-documento').value.trim(),
            telefono:                   document.getElementById('c-telefono').value.trim(),
            correo:                     document.getElementById('c-correo').value.trim(),
            numero_licencia:            document.getElementById('c-licencia').value.trim(),
            categoria_licencia:         document.getElementById('c-categoria').value.trim(),
            fecha_vencimiento_licencia: document.getElementById('c-vencimiento').value,
            estado:                     document.getElementById('c-estado').value,
        };

        if (!payload.nombres || !payload.documento || !payload.numero_licencia) {
            NotificacionService.error('Completa los campos obligatorios.');
            return;
        }

        const res = id
            ? await ApiService.put(`${URL_BASE()}/${id}`, payload)
            : await ApiService.post(URL_BASE(), payload);

        if (res.success) {
            NotificacionService.exito(res.mensaje);
            cerrarModal();
            cargarTabla();
        } else {
            NotificacionService.error(res.mensaje || 'Error al guardar.');
        }
    }

    async function eliminar(id) {
        if (!confirm('¿Estás seguro de eliminar este conductor?')) return;

        const res = await ApiService.delete(`${URL_BASE()}/${id}`);

        if (res.success) {
            NotificacionService.exito(res.mensaje);
            cargarTabla();
        } else {
            NotificacionService.error(res.mensaje);
        }
    }

    return { renderizar, abrirFormulario, cerrarModal, guardar, eliminar, filtrar };
})();