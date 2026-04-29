import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import pedidosService from "../services/pedidos.service";
import clientesService from "../services/clientes.service";
import ModalDetallesPedido from "../components/ModalDetallesPedido";

const Pedidos = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null); 
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(false);
  
  const obtenerFechaLocal = () => {
    const ahora = new Date();
    return ahora.toISOString().split('T')[0];
  };

  const ObtenerFechaMañana = () => {
    const ahora = new Date();
    ahora.setDate(ahora.getDate() + 1);
    return ahora.toISOString().split('T')[0];
  };

  const [filtros, setFiltros] = useState({
    cliente: "",
    estado: "",
    tipoEntrega: "",
    fechaDesde: obtenerFechaLocal(),
    fechaHasta: ObtenerFechaMañana()
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
    } catch (error) {
      console.error("Error cargando clientes:", error);
      setClientes([]);
    }
  };

  const buscar = async () => {
    setCargando(true);
    const params = {};
    if (filtros.cliente) params.cliente = filtros.cliente;
    if (filtros.estado) params.estado = filtros.estado;
    if (filtros.tipoEntrega) params.tipoEntrega = filtros.tipoEntrega;
    if (filtros.fechaDesde) params.fechaDesde = filtros.fechaDesde;
    if (filtros.fechaHasta) params.fechaHasta = filtros.fechaHasta;
    
    try {
        const data = await pedidosService.buscarFiltrado(params);
        setPedidos(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error("Error buscando:", error);
        setPedidos([]);
    } finally {
        setCargando(false);
    }
  };

  const marcarEntregado = async (id) => {
    if(!window.confirm("¿Marcar entregado?")) return;
    try {
      await pedidosService.actualizarEstado(id, 'entregado');
      setPedidos(peds => Array.isArray(peds) ? peds.map(p => p.id === id ? {...p, estado: 'entregado'} : p) : []);
    } catch(e) { alert("Error al actualizar"); }
  };

  const eliminarPedido = async (id) => {
    if(!window.confirm("¿Seguro de ELIMINAR este pedido?")) return;
    try {
      await pedidosService.eliminar(id);
      setPedidos(peds => Array.isArray(peds) ? peds.filter(p => p.id !== id) : []);
    } catch (error) {
      alert("No se pudo eliminar.");
    }
  };

  // Mapeo consistente de clases CSS para los estados
  const getEstadoBadge = (estado) => {
    const clases = {
      'pendiente': 'status-pending',
      'preparando': 'status-preparing',
      'en_camino': 'status-delivering',
      'entregado': 'status-delivered',
      'cancelado': 'status-cancelled'
    };
    return `status-badge ${clases[estado] || 'bg-secondary'}`;
  };

  return (
    <div className="container-fluid py-4 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0 fw-bold text-resto-primary">Gestión de Pedidos</h2>
          <p className="text-muted small mb-0">Administrá las órdenes y sus estados</p>
        </div>
      </div>

      {/* Tarjeta de Filtros (Simplicidad y Agrupación) */}
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-body bg-light rounded">
          <div className="row g-3 align-items-end">
             <div className="col-md-3 col-sm-6">
               <label className="form-label small fw-bold text-muted">Cliente</label>
               <select className="form-select" value={filtros.cliente} onChange={e => setFiltros({...filtros, cliente: e.target.value})}>
                 <option value="">Todos los Clientes</option>
                 {Array.isArray(clientes) && clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
               </select>
             </div>
             <div className="col-md-2 col-sm-6">
               <label className="form-label small fw-bold text-muted">Estado</label>
               <select className="form-select" value={filtros.estado} onChange={e => setFiltros({...filtros, estado: e.target.value})}>
                 <option value="">Todos</option>
                 <option value="pendiente">Pendiente</option>
                 <option value="preparando">Preparando</option>
                 <option value="en_camino">En Camino</option>
                 <option value="entregado">Entregado</option>
               </select>
             </div>
             <div className="col-md-2 col-sm-6">
                <label className="form-label small fw-bold text-muted">Desde</label>
                <input type="date" className="form-control" value={filtros.fechaDesde} onChange={e => setFiltros({...filtros, fechaDesde: e.target.value})} />
             </div>
             <div className="col-md-2 col-sm-6">
                <label className="form-label small fw-bold text-muted">Hasta</label>
                <input type="date" className="form-control" value={filtros.fechaHasta} onChange={e => setFiltros({...filtros, fechaHasta: e.target.value})} />
             </div>
             <div className="col-md-3 col-sm-12 d-flex gap-2">
               <button className="btn btn-primary flex-grow-1" onClick={buscar} disabled={cargando}>
                 {cargando ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-search me-2"></i>Filtrar</>}
               </button>
               <button className="btn btn-outline-secondary" title="Limpiar filtros a Hoy" onClick={() => {
                  setFiltros({...filtros, cliente: "", estado: "", tipoEntrega: "", fechaDesde: obtenerFechaLocal(), fechaHasta: ObtenerFechaMañana()});
               }}>
                 <i className="fas fa-undo"></i>
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* Tabla de Pedidos */}
      <div className="card shadow-sm border-0 position-relative">
        {cargando && (
          <div className="loading-overlay rounded">
             <div className="spinner-border text-primary" role="status"></div>
          </div>
        )}
        <div className="table-responsive custom-scrollbar">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Hora</th>
                <th>Cliente</th>
                <th style={{minWidth: '250px'}}>Productos</th>
                <th className="text-center">Tipo</th>
                <th>Repartidor</th> 
                <th className="text-center">Estado</th>
                <th className="text-end">Total</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(!Array.isArray(pedidos) || pedidos.length === 0) ? (
                  <tr>
                    <td colSpan="9">
                      <div className="empty-state">
                        <i className="fas fa-clipboard-list empty-state-icon"></i>
                        <h5 className="mt-3 text-muted">No se encontraron pedidos</h5>
                        <p className="text-muted small">Ajustá los filtros de búsqueda o creá un pedido nuevo.</p>
                      </div>
                    </td>
                  </tr>
              ) : (
                  pedidos.map(p => (
                  <tr key={p.id} className="smooth-transition">
                      <td className="fw-bold text-muted">#{p.id}</td>
                      <td>{new Date(p.fecha).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                      <td>
                        <div className="fw-bold">{p.cliente ? `${p.cliente.nombre} ${p.cliente.apellido}` : 'Consumidor Final'}</div>
                      </td>
                      <td>
                        <ul className="list-unstyled mb-0 small">
                          {Array.isArray(p.productos) && p.productos.map(prod => (
                            <li key={prod.id} className="text-truncate" style={{maxWidth: '250px'}}>
                               <span className="badge bg-secondary me-1">{prod.PedidoProducto?.cantidad || prod.cantidad}x</span> 
                               {prod.nombre}
                            </li>
                          ))}
                        </ul>
                      </td>

                      <td className="text-center">
                        <span className="custom-tooltip" tabIndex="0">
                          {p.tipoEntrega === 'delivery' ? <i className="fas fa-motorcycle text-primary" style={{fontSize: '1.2rem'}}></i> : <i className="fas fa-store text-secondary" style={{fontSize: '1.2rem'}}></i>}
                          <span className="tooltip-text">{p.tipoEntrega === 'delivery' ? 'Delivery' : 'Retiro en Local'}</span>
                        </span>
                      </td>
                      
                      <td>{p.repartidor ? <span className="small fw-bold text-dark"><i className="fas fa-helmet-safety me-1 text-warning"></i>{p.repartidor.nombre}</span> : <span className="text-muted">-</span>}</td>
                      
                      <td className="text-center">
                        <span className="status-badge" className={getEstadoBadge(p.estado)}>{p.estado}</span>
                      </td>
                      
                      <td className="text-end">
                        <span className="price-display text-success">${parseFloat(p.total || 0).toFixed(2)}</span>
                      </td>
                      
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          {p.estado !== 'entregado' && p.estado !== 'cancelado' && (
                              <button className="btn btn-sm btn-success" onClick={() => marcarEntregado(p.id)} title="Marcar como Entregado" aria-label={`Marcar pedido ${p.id} como entregado`}>
                                <i className="fas fa-check"></i>
                              </button>
                          )}
                          <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/pedidos/editar/${p.id}`)} title="Editar Pedido" aria-label={`Editar pedido ${p.id}`}>
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-info" onClick={() => { setPedidoSeleccionado(p); setModalIsOpen(true); }} title="Ver Detalles" aria-label={`Ver detalles del pedido ${p.id}`}>
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => eliminarPedido(p.id)} title="Eliminar Pedido" aria-label={`Eliminar pedido ${p.id}`}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                  </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botón Flotante (Jerarquía Visual para la acción principal) */}
      <button 
        className="floating-action-btn text-white border-0" 
        onClick={() => navigate("/pedidos/nuevo")}
        aria-label="Crear nuevo pedido"
        title="Crear Nuevo Pedido"
      >
        <i className="fas fa-plus fs-4"></i>
      </button>

      {pedidoSeleccionado && (
        <ModalDetallesPedido 
          pedido={pedidoSeleccionado} 
          abierto={modalIsOpen} 
          onCerrar={() => setModalIsOpen(false)} 
        />
      )}
    </div>
  );
};

export default Pedidos;
