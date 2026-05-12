import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import pedidosService from "../services/pedidos.service";
import clientesService from "../services/clientes.service";
import ModalDetallesPedido from "../components/ModalDetallesPedido";

const obtenerFechaLocal = () => new Date().toISOString().split('T')[0];
const obtenerFechaManana = () => {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const ESTADO_CONFIG = {
  pendiente:   { label: 'Pendiente',   cls: 'sb-pending',    icon: 'fa-clock'         },
  preparando:  { label: 'Preparando',  cls: 'sb-preparing',  icon: 'fa-fire'          },
  en_camino:   { label: 'En camino',   cls: 'sb-delivering', icon: 'fa-motorcycle'    },
  entregado:   { label: 'Entregado',   cls: 'sb-delivered',  icon: 'fa-check-circle'  },
  cancelado:   { label: 'Cancelado',   cls: 'sb-cancelled',  icon: 'fa-times-circle'  },
};

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  const [filtros, setFiltros] = useState({
    cliente: "", estado: "", tipoEntrega: "",
    fechaDesde: obtenerFechaLocal(), fechaHasta: obtenerFechaManana()
  });

  const navigate = useNavigate();

  useEffect(() => {
    cargarClientes();
    buscar();
  }, []);

  const cargarClientes = async () => {
    try {
      const data = await clientesService.obtenerTodos();
      setClientes(Array.isArray(data) ? data : []);
    } catch { setClientes([]); }
  };

  const buscar = async () => {
    setCargando(true);
    const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== ""));
    try {
      const data = await pedidosService.buscarFiltrado(params);
      setPedidos(Array.isArray(data) ? data : []);
    } catch { setPedidos([]); }
    finally { setCargando(false); }
  };

  const resetFiltros = () => {
    setFiltros({ cliente: "", estado: "", tipoEntrega: "", fechaDesde: obtenerFechaLocal(), fechaHasta: obtenerFechaManana() });
  };

  const marcarEntregado = async (id) => {
    if (!window.confirm("¿Marcar el pedido como entregado?")) return;
    try {
      await pedidosService.actualizarEstado(id, 'entregado');
      setPedidos(peds => peds.map(p => p.id === id ? { ...p, estado: 'entregado' } : p));
    } catch { alert("Error al actualizar estado"); }
  };

  const eliminarPedido = async (id) => {
    if (!window.confirm("Esta acción es irreversible. ¿Eliminar pedido?")) return;
    try {
      await pedidosService.eliminar(id);
      setPedidos(peds => peds.filter(p => p.id !== id));
    } catch { alert("Error al eliminar"); }
  };

  const stats = [
    { label: 'Total hoy',    value: pedidos.length,                                            cls: '' },
    { label: 'Pendientes',   value: pedidos.filter(p => p.estado === 'pendiente').length,       cls: 'stat-accent' },
    { label: 'Preparando',   value: pedidos.filter(p => p.estado === 'preparando').length,      cls: 'stat-blue'   },
    { label: 'En camino',    value: pedidos.filter(p => p.estado === 'en_camino').length,       cls: 'stat-purple' },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Pedidos</div>
          <div className="page-subtitle">Monitor de comandas en tiempo real</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/pedidos/nuevo")}>
          <i className="fas fa-plus"></i> Nueva Orden
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {stats.map((s, i) => (
          <div key={i} className="col-6 col-lg-3">
            <div className={`stat-card ${s.cls}`}>
              <div className="stat-card-label">{s.label}</div>
              <div className="stat-card-value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="filter-panel mb-3">
        <div className="row g-2 align-items-end">
          <div className="col-12 col-md-3">
            <label className="form-label">Cliente</label>
            <select className="form-select" value={filtros.cliente} onChange={e => setFiltros({ ...filtros, cliente: e.target.value })}>
              <option value="">Todos los clientes</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
            </select>
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label">Estado</label>
            <select className="form-select" value={filtros.estado} onChange={e => setFiltros({ ...filtros, estado: e.target.value })}>
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="preparando">Preparando</option>
              <option value="en_camino">En Camino</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label">Tipo</label>
            <select className="form-select" value={filtros.tipoEntrega} onChange={e => setFiltros({ ...filtros, tipoEntrega: e.target.value })}>
              <option value="">Todos</option>
              <option value="local">Local</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label">Desde</label>
            <input type="date" className="form-control" value={filtros.fechaDesde} onChange={e => setFiltros({ ...filtros, fechaDesde: e.target.value })} />
          </div>
          <div className="col-6 col-md-1">
            <label className="form-label">Hasta</label>
            <input type="date" className="form-control" value={filtros.fechaHasta} onChange={e => setFiltros({ ...filtros, fechaHasta: e.target.value })} />
          </div>
          <div className="col-12 col-md-2 d-flex gap-2">
            <button className="btn btn-primary flex-grow-1" onClick={buscar} disabled={cargando}>
              {cargando ? <span className="spinner-border spinner-border-sm"></span> : <i className="fas fa-search"></i>}
              Buscar
            </button>
            <button className="btn btn-outline-secondary" onClick={resetFiltros} title="Limpiar filtros">
              <i className="fas fa-undo"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-wrap">
        {cargando && (
          <div className="loading-overlay">
            <div className="spinner-border text-primary"></div>
          </div>
        )}
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th style={{ width: 60 }}>Orden</th>
              <th className="d-none d-md-table-cell" style={{ width: 80 }}>Hora</th>
              <th>Cliente</th>
              <th className="d-none d-lg-table-cell">Productos</th>
              <th className="d-none d-md-table-cell text-center" style={{ width: 80 }}>Tipo</th>
              <th className="text-center" style={{ width: 120 }}>Estado</th>
              <th className="text-end" style={{ width: 90 }}>Total</th>
              <th className="text-center" style={{ width: 100 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.length === 0 ? (
              <tr>
                <td colSpan="8">
                  <div className="empty-state">
                    <i className="fas fa-receipt"></i>
                    <h6>Sin resultados</h6>
                    <p>Ajustá los filtros o creá una nueva orden.</p>
                  </div>
                </td>
              </tr>
            ) : pedidos.map(p => {
              const ec = ESTADO_CONFIG[p.estado] || { label: p.estado, cls: 'sb-default', icon: 'fa-circle' };
              return (
                <tr key={p.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--text-2)', fontSize: 13 }}>#{p.id}</span>
                  </td>
                  <td className="d-none d-md-table-cell" style={{ color: 'var(--text-2)', fontSize: 13 }}>
                    {new Date(p.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>
                      {p.cliente ? `${p.cliente.nombre} ${p.cliente.apellido}` : 'Consumidor Final'}
                    </span>
                    {p.repartidor && (
                      <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                        <i className="fas fa-motorcycle me-1"></i>{p.repartidor.nombre}
                      </div>
                    )}
                  </td>
                  <td className="d-none d-lg-table-cell" style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-2)', fontSize: 13 }}>
                    {p.productos?.map(pr => `${pr.PedidoProducto?.cantidad || pr.cantidad}x ${pr.nombre}`).join(', ')}
                  </td>
                  <td className="d-none d-md-table-cell text-center">
                    {p.tipoEntrega === 'delivery'
                      ? <i className="fas fa-motorcycle" style={{ color: 'var(--blue)' }} title="Delivery"></i>
                      : <i className="fas fa-store" style={{ color: 'var(--text-3)' }} title="Local"></i>
                    }
                  </td>
                  <td className="text-center">
                    <span className={`status-badge ${ec.cls}`}>
                      <i className={`fas ${ec.icon}`}></i>
                      {ec.label}
                    </span>
                  </td>
                  <td className="text-end" style={{ fontWeight: 700 }}>
                    ${parseFloat(p.total || 0).toFixed(2)}
                  </td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-1">
                      {p.estado !== 'entregado' && p.estado !== 'cancelado' && (
                        <button className="btn btn-icon-sm text-success" onClick={() => marcarEntregado(p.id)} title="Marcar entregado">
                          <i className="fas fa-check"></i>
                        </button>
                      )}
                      <button className="btn btn-icon-sm" onClick={() => { setPedidoSeleccionado(p); setModalIsOpen(true); }} title="Ver detalles">
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="btn btn-icon-sm text-primary d-none d-sm-inline-flex" onClick={() => navigate(`/pedidos/editar/${p.id}`)} title="Editar">
                        <i className="fas fa-pen"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button className="fab-btn" onClick={() => navigate("/pedidos/nuevo")} aria-label="Nueva orden">
        <i className="fas fa-plus"></i>
      </button>

      {pedidoSeleccionado && (
        <ModalDetallesPedido
          pedido={pedidoSeleccionado}
          abierto={modalIsOpen}
          onCerrar={() => setModalIsOpen(false)}
        />
      )}
    </>
  );
};

export default Pedidos;
