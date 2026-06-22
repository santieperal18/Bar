import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import clientesService from "../services/clientes.service";

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { cargarClientes(); }, []);

  const cargarClientes = async () => {
    try {
      setCargando(true);
      const data = await clientesService.obtenerTodos();
      setClientes(Array.isArray(data) ? data : []);
    } catch { setClientes([]); }
    finally { setCargando(false); }
  };

  const buscar = async () => {
    try {
      if (filtro.trim()) {
        const data = await clientesService.buscarPorNombre(filtro);
        setClientes(Array.isArray(data) ? data : []);
      } else {
        cargarClientes();
      }
    } catch { setClientes([]); }
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este cliente?")) return;
    try {
      await clientesService.eliminar(id);
      setClientes(prev => prev.filter(c => c.id !== id));
    } catch { alert("Error al eliminar el cliente"); }
  };

  const formatFecha = (f) => {
    if (!f) return '—';
    try {
      const d = new Date(f);
      return isNaN(d) ? '—' : d.toLocaleDateString('es-ES');
    } catch { return '—'; }
  };

  const lista = Array.isArray(clientes) ? clientes : [];

  if (cargando) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 20px', gap: 16, color: 'var(--text-2)' }}>
        <div className="spinner-border text-primary"></div>
        <span>Cargando clientes…</span>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Clientes</div>
          <div className="page-subtitle">Base de datos de clientes registrados</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/clientes/nuevo")}>
          <i className="fas fa-plus"></i> Nuevo Cliente
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <div className="stat-card-label">Total</div>
            <div className="stat-card-value">{lista.length}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card stat-green">
            <div className="stat-card-label">Activos</div>
            <div className="stat-card-value">{lista.filter(c => c.activo).length}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card stat-blue">
            <div className="stat-card-label">Con email</div>
            <div className="stat-card-value">{lista.filter(c => c.email).length}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card stat-purple">
            <div className="stat-card-label">Con dirección</div>
            <div className="stat-card-value">{lista.filter(c => c.direccion).length}</div>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="filter-panel mb-3">
        <div className="row g-2 align-items-end">
          <div className="col-12 col-md-6">
            <div className="input-group">
              <span className="input-group-text"><i className="fas fa-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre o apellido…"
                aria-label="Buscar clientes por nombre o apellido"
                value={filtro}
                onChange={e => setFiltro(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && buscar()}
              />
            </div>
          </div>
          <div className="col-12 col-md-3 d-flex gap-2">
            <button className="btn btn-primary flex-grow-1" onClick={buscar}>Buscar</button>
            <button className="btn btn-outline-secondary" onClick={() => { setFiltro(""); cargarClientes(); }}>
              <i className="fas fa-undo"></i>
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
                <th className="d-none d-lg-table-cell">Email</th>
                <th className="d-none d-lg-table-cell">Dirección</th>
                <th className="d-none d-md-table-cell" style={{ width: 110 }}>Registro</th>
                <th className="text-center" style={{ width: 90 }}>Estado</th>
                <th className="text-center" style={{ width: 100 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 ? (
                <tr><td colSpan="8">
                  <div className="empty-state">
                    <i className="fas fa-users"></i>
                    <h6>Sin clientes</h6>
                    <p>No se encontraron resultados.</p>
                  </div>
                </td></tr>
              ) : lista.map(c => (
                <tr key={c.id}>
                  <td style={{ color: 'var(--text-2)', fontSize: 13, fontWeight: 600 }}>#{c.id}</td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{c.nombre} {c.apellido}</span>
                  </td>
                  <td className="d-none d-md-table-cell" style={{ color: 'var(--text-2)' }}>
                    {c.telefono || <span style={{ color: 'var(--text-3)' }}>—</span>}
                  </td>
                  <td className="d-none d-lg-table-cell" style={{ color: 'var(--text-2)', fontSize: 13 }}>
                    {c.email ? (
                      <a href={`mailto:${c.email}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{c.email}</a>
                    ) : <span style={{ color: 'var(--text-3)' }}>—</span>}
                  </td>
                  <td className="d-none d-lg-table-cell" style={{ color: 'var(--text-2)', fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.direccion || <span style={{ color: 'var(--text-3)' }}>—</span>}
                  </td>
                  <td className="d-none d-md-table-cell" style={{ color: 'var(--text-2)', fontSize: 13 }}>
                    {formatFecha(c.fechaRegistro)}
                  </td>
                  <td className="text-center">
                    <span className={`status-badge ${c.activo ? 'sb-active' : 'sb-inactive'}`}>
                      {c.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-1">
                      <button className="btn btn-icon-sm text-primary" onClick={() => navigate(`/clientes/editar/${c.id}`)} title="Editar">
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="btn btn-icon-sm text-info" onClick={() => navigate(`/reportes/cliente/${c.id}`)} title="Ver reportes">
                        <i className="fas fa-chart-bar"></i>
                      </button>
                      <button className="btn btn-icon-sm text-danger" onClick={() => eliminar(c.id)} title="Eliminar">
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
            <i className="fas fa-users"></i>
            <h6>Sin clientes</h6>
            <p>No se encontraron resultados.</p>
          </div>
        ) : (
          <div className="m-list">
            {lista.map(c => {
              const inicial = (c.nombre?.[0] || '?').toUpperCase();
              return (
                <div key={c.id} className="m-card">
                  {/* Fila 1: avatar + nombre + estado */}
                  <div className="m-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="m-avatar">{inicial}</div>
                      <span className="m-name">{c.nombre} {c.apellido}</span>
                    </div>
                    <span className={`status-badge ${c.activo ? 'sb-active' : 'sb-inactive'}`}>
                      {c.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  {/* Fila 2: teléfono + acciones */}
                  <div className="m-row" style={{ alignItems: 'center' }}>
                    <span className="m-sub">
                      {c.telefono
                        ? <a href={`tel:${c.telefono}`} style={{ color: 'var(--text-2)', textDecoration: 'none' }}>
                            <i className="fas fa-phone me-1" style={{ fontSize: 11 }}></i>{c.telefono}
                          </a>
                        : <span style={{ color: 'var(--text-3)' }}>Sin teléfono</span>
                      }
                    </span>
                    <div className="m-actions">
                      <button className="btn btn-icon-sm text-primary" onClick={() => navigate(`/clientes/editar/${c.id}`)} title="Editar">
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="btn btn-icon-sm text-info" onClick={() => navigate(`/reportes/cliente/${c.id}`)} title="Reportes">
                        <i className="fas fa-chart-bar"></i>
                      </button>
                      <button className="btn btn-icon-sm text-danger" onClick={() => eliminar(c.id)} title="Eliminar">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button className="fab-btn" onClick={() => navigate("/clientes/nuevo")} aria-label="Nuevo cliente">
        <i className="fas fa-plus"></i>
      </button>
    </>
  );
};

export default Clientes;
