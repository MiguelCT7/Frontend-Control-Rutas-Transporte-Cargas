/**
 * Módulo Usuarios
 * Gestiona la creación y administración de usuarios del sistema.
 */
const ModuloUsuarios = (() => {

    const URL_BASE = () => `${CONFIG.MS_AUTH}/api/usuarios`;

    async function renderizar() {
        const contenido = document.getElementById('contenido-principal');
        contenido.innerHTML = `
            <div class="modulo-header">
                <div>
                    <h2 class="modulo-titulo">Usuarios</h2>
                    <p class="modulo-subtitulo">Gestión de usuarios del sistema</p>
                </div>
                <button class="btn btn--primario" onclick="ModuloUsuarios.abrirFormulario()">
                    + Nuevo Usuario
                </button>
            </div>

            <div id="tabla-usuarios" class="tabla-contenedor">
                <div class="cargando">Cargando usuarios...</div>
            </div>

            <div id="modal-usuario" class="modal" style="display:none">
                <div class="modal__caja modal__caja--sm">
                    <div class="modal__cabecera">
                        <h3>Nuevo Usuario</h3>
                        <button class="modal__cerrar"
                            onclick="ModuloUsuarios.cerrarModal()">×</button>
                    </div>
                    <form id="form-usuario" class="form-grid">
                        <div class="form-grupo form-grupo--completo">
                            <label>Nombre completo *</label>
                            <input type="text" id="u-nombre" class="form-input"
                                placeholder="Ej: Carlos Ramírez" required>
                        </div>
                        <div class="form-grupo form-grupo--completo">
                            <label>Correo electrónico *</label>
                            <input type="email" id="u-correo" class="form-input"
                                placeholder="Ej: carlos@logitrans.com" required>
                        </div>
                        <div class="form-grupo">
                            <label>Usuario *</label>
                            <input type="text" id="u-usuario" class="form-input"
                                placeholder="Ej: carlos123" required>
                        </div>
                        <div class="form-grupo">
                            <label>Contraseña *</label>
                            <input type="password" id="u-contrasena" class="form-input"
                                placeholder="Mínimo 4 caracteres" required>
                        </div>
                        <div class="form-grupo form-grupo--completo">
                            <label>Rol</label>
                            <select id="u-rol" class="form-input">
                                <option value="operador">Operador</option>
                                <option value="administrador">Administrador</option>
                            </select>
                        </div>
                        <div class="form-acciones">
                            <button type="button" class="btn btn--secundario"
                                onclick="ModuloUsuarios.cerrarModal()">Cancelar</button>
                            <button type="button" class="btn btn--primario"
                                onclick="ModuloUsuarios.guardar()">Crear Usuario</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        await cargarTabla();
    }

    async function cargarTabla() {
        const contenedor = document.getElementById('tabla-usuarios');
        if (!contenedor) return;
        contenedor.innerHTML = '<div class="cargando">Cargando...</div>';

        const res = await ApiService.get(URL_BASE());

        if (!res.success) {
            contenedor.innerHTML = `<div class="error-msg">${res.mensaje}</div>`;
            return;
        }

        if (!res.data.length) {
            contenedor.innerHTML = '<div class="vacio-msg">No hay usuarios registrados.</div>';
            return;
        }

        contenedor.innerHTML = `
            <table class="tabla">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Usuario</th>
                        <th>Correo</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${res.data.map(u => `
                        <tr>
                            <td>${u.nombre}</td>
                            <td><strong>${u.usuario}</strong></td>
                            <td>${u.correo}</td>
                            <td><span class="badge badge--neutro">${u.rol}</span></td>
                            <td>
                                <span class="badge ${u.estado === 'activo' ? 'badge--exito' : 'badge--peligro'}">
                                    ${u.estado}
                                </span>
                            </td>
                            <td class="acciones">
                                <button class="btn-tabla btn-tabla--editar"
                                    onclick="ModuloUsuarios.cambiarEstado(${u.id})">
                                    ${u.estado === 'activo' ? 'Desactivar' : 'Activar'}
                                </button>
                                <button class="btn-tabla btn-tabla--eliminar"
                                    onclick="ModuloUsuarios.eliminar(${u.id})">
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    function abrirFormulario() {
        document.getElementById('modal-usuario').style.display = 'flex';
        document.getElementById('form-usuario').reset();
    }

    function cerrarModal() {
        document.getElementById('modal-usuario').style.display = 'none';
    }

    async function guardar() {
        const payload = {
            nombre:     document.getElementById('u-nombre').value.trim(),
            correo:     document.getElementById('u-correo').value.trim(),
            usuario:    document.getElementById('u-usuario').value.trim(),
            contrasena: document.getElementById('u-contrasena').value.trim(),
            rol:        document.getElementById('u-rol').value,
        };

        if (!payload.nombre || !payload.correo || !payload.usuario || !payload.contrasena) {
            NotificacionService.error('Completa todos los campos obligatorios.');
            return;
        }

        const res = await ApiService.post(URL_BASE(), payload);

        if (res.success) {
            NotificacionService.exito(res.mensaje);
            cerrarModal();
            cargarTabla();
        } else {
            NotificacionService.error(res.mensaje || 'Error al crear el usuario.');
        }
    }

    async function cambiarEstado(id) {
        const res = await ApiService.patch(`${URL_BASE()}/${id}/estado`);

        if (res.success) {
            NotificacionService.exito(res.mensaje);
            cargarTabla();
        } else {
            NotificacionService.error(res.mensaje);
        }
    }

    async function eliminar(id) {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

        const res = await ApiService.delete(`${URL_BASE()}/${id}`);

        if (res.success) {
            NotificacionService.exito(res.mensaje);
            cargarTabla();
        } else {
            NotificacionService.error(res.mensaje);
        }
    }

    return { renderizar, abrirFormulario, cerrarModal, guardar, cambiarEstado, eliminar };
})();