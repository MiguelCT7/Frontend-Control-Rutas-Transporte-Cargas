/**
 * Módulo Dashboard
 * Muestra el resumen general del sistema.
 */
const ModuloDashboard = (() => {

    async function renderizar() {
        const contenido = document.getElementById('contenido-principal');
        contenido.innerHTML = `
            <div class="dashboard-stats">
                <div class="stat-card">
                    <div class="stat-card__label">Conductores</div>
                    <div class="stat-card__valor" id="stat-conductores">...</div>
                    <span class="stat-card__badge badge--exito">Activos</span>
                </div>
                <div class="stat-card">
                    <div class="stat-card__label">Vehículos</div>
                    <div class="stat-card__valor" id="stat-vehiculos">...</div>
                    <span class="stat-card__badge badge--info">Registrados</span>
                </div>
                <div class="stat-card">
                    <div class="stat-card__label">Rutas</div>
                    <div class="stat-card__valor" id="stat-rutas">...</div>
                    <span class="stat-card__badge badge--neutro">Disponibles</span>
                </div>
                <div class="stat-card">
                    <div class="stat-card__label">Viajes activos</div>
                    <div class="stat-card__valor" id="stat-viajes">...</div>
                    <span class="stat-card__badge badge--advertencia">En curso</span>
                </div>
            </div>

            <div class="dashboard-cards">
                <div class="dashboard-card">
                    <div class="dashboard-card__titulo">Conductores disponibles</div>
                    <div id="lista-conductores">
                        <div class="cargando">Cargando...</div>
                    </div>
                </div>
                <div class="dashboard-card">
                    <div class="dashboard-card__titulo">Vehículos disponibles</div>
                    <div id="lista-vehiculos">
                        <div class="cargando">Cargando...</div>
                    </div>
                </div>
            </div>
        `;

        await cargarEstadisticas();
    }

    async function cargarEstadisticas() {
        // Conductores
        const resConductores = await ApiService.get(
            `${CONFIG.MS_CONDUCTORES}/api/conductores`
        );

        if (resConductores.success) {
            const total       = resConductores.data.length;
            const disponibles = resConductores.data.filter(c => c.estado === 'disponible');

            document.getElementById('stat-conductores').textContent = total;

            document.getElementById('lista-conductores').innerHTML = disponibles.length
                ? disponibles.slice(0, 4).map(c => `
                    <div class="dashboard-fila">
                        <div>
                            <div class="dashboard-fila__nombre">${c.nombres} ${c.apellidos}</div>
                            <div class="dashboard-fila__sub">Doc: ${c.documento}</div>
                        </div>
                        <span class="badge badge--exito">Disponible</span>
                    </div>
                `).join('')
                : '<div class="vacio-msg">No hay conductores disponibles.</div>';
        }

        // Vehículos
        const resVehiculos = await ApiService.get(
            `${CONFIG.MS_VEHICULOS}/api/vehiculos`
        );

        if (resVehiculos.success) {
            const total       = resVehiculos.data.length;
            const disponibles = resVehiculos.data.filter(v => v.estado === 'disponible');

            document.getElementById('stat-vehiculos').textContent = total;

            document.getElementById('lista-vehiculos').innerHTML = disponibles.length
                ? disponibles.slice(0, 4).map(v => `
                    <div class="dashboard-fila">
                        <div>
                            <div class="dashboard-fila__nombre">${v.placa} · ${v.marca} ${v.modelo}</div>
                            <div class="dashboard-fila__sub">Cap: ${Number(v.capacidad_carga).toLocaleString()} kg</div>
                        </div>
                        <span class="badge badge--exito">Disponible</span>
                    </div>
                `).join('')
                : '<div class="vacio-msg">No hay vehículos disponibles.</div>';
        }

        // Rutas
        const resRutas = await ApiService.get(
            `${CONFIG.MS_RUTAS}/api/rutas`
        );

        if (resRutas.success) {
            document.getElementById('stat-rutas').textContent = resRutas.data.length;
        }

        // Viajes en tránsito
        const resViajes = await ApiService.get(
            `${CONFIG.MS_VIAJES}/api/viajes?estado=en_transito`
        );

        if (resViajes.success) {
            document.getElementById('stat-viajes').textContent = resViajes.data.length;
        }
    }

    return { renderizar };
})();