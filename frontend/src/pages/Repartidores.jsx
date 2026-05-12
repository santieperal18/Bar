import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import repartidoresService from "../services/repartidores.service";

const VEHICULO_ICON = (v = '') => {
  const vl = v.toLowerCase();
  if (vl.includes('moto'))  return 'fa-motorcycle';
  if (vl.includes('auto') || vl.includes('carro')) return 'fa-car';
  if (vl.includes('bici'))  return 'fa-bicycle';
  return 'fa-truck';
};

const Repartidores = () => {
  const [repartidores, setRepartidores] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [soloActivos, setSoloActivos] = useState(true);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setCargando(true);
      const data = await repartidoresService.obtenerTodos();
      setRepartidores(Array.isArray(data) ? data : []);
    } catch { setRepartidores([]); }
    finally { setCargando(false); }
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este repartidor?")) return;
    try {
      await repartidoresService.eliminar(id);
      setRepartidores(prev => prev.filter(r => r.id !== id));
    } catch { alert("Error al eliminar el repartidor"); }
  };

  const lista = repartidores.filter(r => {
    const q = filtro.toLowerCase();
    const matchFiltro = !q ||
      r.nombre?.toLowerCase().includes(q) ||
      r.apellido?.toLowerCase().includes(q) ||
      r.telefono?.includes(q) ||
      r.vehiculo?.toLowerCase().includes(q);
    const matchActivo = !soloActivos || r.activo;
    return matchFiltro && matchActivo;
  });

  if (cargando) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 20px', gap: 16, color: 'var(--text-2)' }}>
        <div className="spinner-border text-primary"></div>
        <span>Cargando repartidores…</span>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Repartidores</div>
          <div className="page-subtitle">Equipo de delivery activo</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/repartidores/nuevo")}>
          <i className="fas fa-plus"></i> Nuevo Repartidor
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <div className="stat-card-label">Total</div>
            <div className="stat-card-value">{repartidores.length}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card stat-green">
            <div className="stat-card-label">Activos</div>
            <div className="stat-card-value">{repartidores.filter(r => r.activo).length}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card stat-blue">
            <div className="stat-card-label">Con moto</div>
            <div className="stat-card-value">{repartidores.filter(r => r.vehiculo?.toLowerCase().includes('moto')).length}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card stat-purple">
            <div className="stat-card-label">Con auto</div>
            <div className="stat-card-value">{repartidores.filter(r => r.vehiculo?.toLowerCase().includes('auto') || r.vehiculo?.toLowerCase().includes('carro')).length}</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filter-panel mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text"><i className="fas fa-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre, teléfono o vehículo…"
                value={filtro}
                onChange={e => setFiltro(e.target.value)}
              />
            </div>
          </div>
          <div className="col-auto">
            <div className="form-check mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                id="soloActivos"
                checked={soloActivos}
                onChange={e => setSoloActivos(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="soloActivos">Solo activos</label>
            </div>
          </div>
          <div className="col-auto ms-auto">
            <button className="btn btn-outline-secondary" onClick={() => { setFiltro(""); setSoloActivos(true); }}>
              <i className="fas fa-undo"></i> Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* ── DESKTOP: Tabla ── */}
      <div className="show-desktop">
        <div className="table-wrap">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th style={{ width: 50 }}>#</th>
                <th>Nombre</th>
                <th className="d-none d-md-table-cell">Teléfono</th>
                <th className="d-none d-md-table-cell">Vehículo</th>
                <th className="text-center" style={{ width: 100 }}>Estado</th>
                <th className="text-center" style={{ width: 90 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 ? (
                <tr><td colSpan="6">
                  <div className="empty-state">
                    <i className="fas fa-motorcycle"></i>
                    <h6>Sin repartidores</h6>
                    <p>No se encontraron resultados.</p>
                  </div>
                </td></tr>
              ) : lista.map(r => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--text-2)', fontSize: 13, fontWeight: 600 }}>#{r.id}</td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{r.nombre} {r.apellido}</span>
                  </td>
                  <td className="d-none d-md-table-cell">
                    <a href={`tel:${r.telefono}`} style={{ color: 'var(--text-1)', textDecoration: 'none' }}>
                      {r.telefono || <span style={{ color: 'var(--text-3)' }}>—</span>}
                    </a>
                  </td>
                  <td className="d-none d-md-table-cell">
                    {r.vehiculo ? (
                      <span style={{ color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 7 }}>
                        <i className={`fas ${VEHICULO_ICON(r.vehiculo)}`} style={{ color: 'var(--accent)', width: 16 }}></i>
                        {r.vehiculo}
                      </span>
                    ) : <span style={{ color: 'var(--text-3)' }}>—</span>}
                  </td>
                  <td className="text-center">
                    <span className={`status-badge ${r.activo ? 'sb-active' : 'sb-inactive'}`}>
                      {r.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-1">
                      <button className="btn btn-icon-sm text-primary" onClick={() => navigate(`/repartidores/editar/${r.id}`)} title="Editar">
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="btn btn-icon-sm text-danger" onClick={() => eliminar(r.id)} title="Eliminar">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MOBILE: Cards ── */}
      <div className="show-mobile">
        {lista.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-motorcycle"></i>
            <h6>Sin repartidores</h6>
            <p>No se encontraron resultados.</p>
          </div>
        ) : (
          <div className="m-list">
            {lista.map(r => (
              <div key={r.id} className="m-card">
                {/* Fila 1: icono vehiculo + nombre + estado */}
                <div className="m-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`fas ${VEHICULO_ICON(r.vehiculo || '')}`} style={{ color: 'var(--accent)', fontSize: 14 }}></i>
                    </div>
                    <span className="m-name">{r.nombre} {r.apellido}</span>
                  </div>
                  <span className={`status-badge ${r.activo ? 'sb-active' : 'sb-inactive'}`}>
                    {r.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {/* Fila 2: teléfono + acciones */}
                <div className="m-row" style={{ alignItems: 'center' }}>
                  <span className="m-sub">
                    {r.telefono
                      ? <a href={`tel:${r.telefono}`} style={{ color: 'var(--text-2)', textDecoration: 'none' }}>
                          <i className="fas fa-phone me-1" style={{ fontSize: 11 }}></i>{r.telefono}
                        </a>
                      : <span style={{ color: 'var(--text-3)' }}>Sin teléfono</span>
                    }
                  </span>
                  <div className="m-actions">
                    <button className="btn btn-icon-sm text-primary" onClick={() => navigate(`/repartidores/editar/${r.id}`)} title="Editar">
                      <i className="fas fa-pen"></i>
                    </button>
                    <button className="btn btn-icon-sm text-danger" onClick={() => eliminar(r.id)} title="Eliminar">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="fab-btn" onClick={() => navigate("/repartidores/nuevo")} aria-label="Nuevo repartidor">
        <i className="fas fa-plus"></i>
      </button>
    </>
  );
};

export default Repartidores;
