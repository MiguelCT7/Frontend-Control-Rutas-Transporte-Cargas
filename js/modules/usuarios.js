/**
 * Módulo Usuarios
 * Gestiona la creación, administración de usuarios y cambio de contraseña.
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
                <div style="display:flex;gap:10px">
                    <button class="btn btn--secundario"
                        onclick="ModuloUsuarios.abrirCambioContrasena()">
                        🔒 Cambiar Contraseña
                    </button>
                    <button class="btn btn--primario"
                        onclick="ModuloUsuarios.abrirFormulario()">
                        + Nuevo Usuario
                    </button>
                </div>
            </div>

            <div id="tabla-usuarios" class="tabla-contenedor">
                <div class="cargando">Cargando usuarios...</div>
            </div>

            <!-- Modal nuevo usuario -->
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

            <!-- Modal cambio de contraseña -->
            <div id="modal-contrasena" class="modal" style="display:none">
                <div class="modal__caja modal__caja--sm">
                    <div class="modal__cabecera">
                        <h3>Cambiar Contraseña</h3>
                        <button class="modal__cerrar"
                            onclick="ModuloUsuarios.cerrarModalContrasena()">×</button>
                    </div>
                    <form id="form-contrasena" class="form-grid">
                        <div class="form-grupo form-grupo--completo">
                            <label>Contraseña actual *</label>
                            <input type="password" id="cp-actual" class="form-input"
                                placeholder="Ingresa tu contraseña actual" required>
                        </div>
                        <div class="form-grupo form-grupo--completo">
                            <label>Nueva contraseña *</label>
                            <input type="password" id="cp-nueva" class="form-input"
                                placeholder="Mínimo 4 caracteres" required>
                        </div>
                        <div class="form-grupo form-grupo--completo">
                            <label>Confirmar nueva contraseña *</label>
                            <input type="password" id="cp-confirmar" class="form-input"
                                placeholder="Repite la nueva contraseña" required>
                        </div>
                        <div class="form-acciones">
                            <button type="button" class="btn btn--secundario"
                                onclick="ModuloUsuarios.cerrarModalContrasena()">Cancelar</button>
                            <button type="button" class="btn btn--primario"
                                onclick="ModuloUsuarios.guardarContrasena()">Actualizar</button>
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
                                <span class="badge ${u.estado === 'activo'
                                    ? 'badge--exito' : 'badge--peligro'}">
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

    function abrirCambioContrasena() {
        document.getElementById('modal-contrasena').style.display = 'flex';
        document.getElementById('form-contrasena').reset();
    }

    function cerrarModalContrasena() {
        document.getElementById('modal-contrasena').style.display = 'none';
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

    async function guardarContrasena() {
        const actual    = document.getElementById('cp-actual').value.trim();
        const nueva     = document.getElementById('cp-nueva').value.trim();
        const confirmar = document.getElementById('cp-confirmar').value.trim();

        if (!actual || !nueva || !confirmar) {
            NotificacionService.error('Completa todos los campos.');
            return;
        }

        if (nueva !== confirmar) {
            NotificacionService.error('La nueva contraseña y la confirmación no coinciden.');
            return;
        }

        if (nueva.length < 4) {
            NotificacionService.error('La nueva contraseña debe tener al menos 4 caracteres.');
            return;
        }

        const res = await ApiService.post(
            `${CONFIG.MS_AUTH}/api/auth/cambiar-contrasena`,
            { contrasena_actual: actual, contrasena_nueva: nueva }
        );

        if (res.success) {
            NotificacionService.exito(res.mensaje);
            cerrarModalContrasena();
        } else {
            NotificacionService.error(res.mensaje || 'Error al cambiar la contraseña.');
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

    return {
        renderizar, abrirFormulario, cerrarModal,
        abrirCambioContrasena, cerrarModalContrasena,
        guardar, guardarContrasena, cambiarEstado, eliminar,
    };
})();