/**
 * Módulo Vehículos
 * Gestiona el CRUD completo de la flota de vehículos.
 */
const ModuloVehiculos = (() => {

    const URL_BASE = () => `${CONFIG.MS_VEHICULOS}/api/vehiculos`;

    async function renderizar() {
        const contenido = document.getElementById('contenido-principal');
        contenido.innerHTML = `
            <div class="modulo-header">
                <div>
                    <h2 class="modulo-titulo">Vehículos</h2>
                    <p class="modulo-subtitulo">Administración de la flota de transporte</p>
                </div>
                <button class="btn btn--primario" onclick="ModuloVehiculos.abrirFormulario()">
                    + Nuevo Vehículo
                </button>
            </div>

            <div class="filtros-barra">
                <input class="input-busqueda" type="text" id="filtro-placa"
                    placeholder="Buscar por placa..." oninput="ModuloVehiculos.filtrar()">
                <select class="select-filtro" id="filtro-estado-v" onchange="ModuloVehiculos.filtrar()">
                    <option value="">Todos los estados</option>
                    <option value="disponible">Disponible</option>
                    <option value="en_ruta">En ruta</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="inactivo">Inactivo</option>
                </select>
            </div>

            <div id="tabla-vehiculos" class="tabla-contenedor">
                <div class="cargando">Cargando vehículos...</div>
            </div>

            <div id="modal-vehiculo" class="modal" style="display:none">
                <div class="modal__caja">
                    <div class="modal__cabecera">
                        <h3 id="modal-v-titulo">Nuevo Vehículo</h3>
                        <button class="modal__cerrar" onclick="ModuloVehiculos.cerrarModal()">×</button>
                    </div>
                    <form id="form-vehiculo" class="form-grid">
                        <input type="hidden" id="vehiculo-id">
                        <div class="form-grupo">
                            <label>Placa *</label>
                            <input type="text" id="v-placa" class="form-input" required>
                        </div>
                        <div class="form-grupo">
                            <label>Tipo de Vehículo *</label>
                            <input type="text" id="v-tipo" class="form-input" placeholder="Ej: Camión, Furgón">
                        </div>
                        <div class="form-grupo">
                            <label>Capacidad de Carga (kg) *</label>
                            <input type="number" id="v-capacidad" class="form-input" min="1" step="0.01">
                        </div>
                        <div class="form-grupo">
                            <label>Modelo *</label>
                            <input type="text" id="v-modelo" class="form-input">
                        </div>
                        <div class="form-grupo">
                            <label>Marca *</label>
                            <input type="text" id="v-marca" class="form-input">
                        </div>
                        <div class="form-grupo">
                            <label>Estado</label>
                            <select id="v-estado" class="form-input">
                                <option value="disponible">Disponible</option>
                                <option value="en_ruta">En ruta</option>
                                <option value="mantenimiento">Mantenimiento</option>
                                <option value="inactivo">Inactivo</option>
                            </select>
                        </div>
                        <div class="form-acciones">
                            <button type="button" class="btn btn--secundario"
                                onclick="ModuloVehiculos.cerrarModal()">Cancelar</button>
                            <button type="button" class="btn btn--primario"
                                onclick="ModuloVehiculos.guardar()">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        await cargarTabla();
    }

    async function cargarTabla(filtros = {}) {
        const contenedor = document.getElementById('tabla-vehiculos');
        if (!contenedor) return;
        contenedor.innerHTML = '<div class="cargando">Cargando...</div>';

        const params = new URLSearchParams(filtros).toString();
        const res = await ApiService.get(`${URL_BASE()}${params ? '?' + params : ''}`);

        if (!res.success) {
            contenedor.innerHTML = `<div class="error-msg">${res.mensaje}</div>`;
            return;
        }

        if (!res.data.length) {
            contenedor.innerHTML = '<div class="vacio-msg">No se encontraron vehículos.</div>';
            return;
        }

        const clases = {
            disponible:   'badge--exito',
            en_ruta:      'badge--info',
            mantenimiento:'badge--advertencia',
            inactivo:     'badge--peligro',
        };

        contenedor.innerHTML = `
            <table class="tabla">
                <thead>
                    <tr>
                        <th>Placa</th>
                        <th>Tipo</th>
                        <th>Marca / Modelo</th>
                        <th>Capacidad (kg)</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${res.data.map(v => `
                        <tr>
                            <td><strong>${v.placa}</strong></td>
                            <td>${v.tipo_vehiculo}</td>
                            <td>${v.marca} ${v.modelo}</td>
                            <td>${Number(v.capacidad_carga).toLocaleString()}</td>
                            <td><span class="badge ${clases[v.estado] || ''}">${v.estado.replace('_', ' ')}</span></td>
                            <td class="acciones">
                                <button class="btn-tabla btn-tabla--editar"
                                    onclick='ModuloVehiculos.abrirFormulario(${JSON.stringify(v)})'>Editar</button>
                                <button class="btn-tabla btn-tabla--eliminar"
                                    onclick="ModuloVehiculos.eliminar(${v.id})">Eliminar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    function filtrar() {
        const placa  = document.getElementById('filtro-placa')?.value || '';
        const estado = document.getElementById('filtro-estado-v')?.value || '';
        const f = {};
        if (placa)  f.placa  = placa;
        if (estado) f.estado = estado;
        cargarTabla(f);
    }

    function abrirFormulario(vehiculo = null) {
        document.getElementById('modal-vehiculo').style.display = 'flex';
        document.getElementById('modal-v-titulo').textContent = vehiculo ? 'Editar Vehículo' : 'Nuevo Vehículo';

        if (vehiculo) {
            document.getElementById('vehiculo-id').value  = vehiculo.id;
            document.getElementById('v-placa').value      = vehiculo.placa;
            document.getElementById('v-tipo').value       = vehiculo.tipo_vehiculo;
            document.getElementById('v-capacidad').value  = vehiculo.capacidad_carga;
            document.getElementById('v-modelo').value     = vehiculo.modelo;
            document.getElementById('v-marca').value      = vehiculo.marca;
            document.getElementById('v-estado').value     = vehiculo.estado;
        } else {
            document.getElementById('form-vehiculo').reset();
            document.getElementById('vehiculo-id').value = '';
        }
    }

    function cerrarModal() {
        document.getElementById('modal-vehiculo').style.display = 'none';
    }

    async function guardar() {
        const id = document.getElementById('vehiculo-id').value;

        const payload = {
            placa:           document.getElementById('v-placa').value.trim().toUpperCase(),
            tipo_vehiculo:   document.getElementById('v-tipo').value.trim(),
            capacidad_carga: parseFloat(document.getElementById('v-capacidad').value),
            modelo:          document.getElementById('v-modelo').value.trim(),
            marca:           document.getElementById('v-marca').value.trim(),
            estado:          document.getElementById('v-estado').value,
        };

        if (!payload.placa || !payload.tipo_vehiculo || !payload.capacidad_carga) {
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
        if (!confirm('¿Eliminar este vehículo?')) return;
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