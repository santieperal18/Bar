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
  
  const obtenerFechaLocal = () => new Date().toISOString().split('T')[0];
  const ObtenerFechaMañana = () => {
    const ahora = new Date();
    ahora.setDate(ahora.getDate() + 1);
    return ahora.toISOString().split('T')[0];
  };

  const [filtros, setFiltros] = useState({
    cliente: "", estado: "", tipoEntrega: "", 
    fechaDesde: obtenerFechaLocal(), fechaHasta: ObtenerFechaMañana()
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
    } catch (error) { setClientes([]); }
  };

  const buscar = async () => {
    setCargando(true);
    const params = Object.fromEntries(Object.entries(filtros).filter(([_, v]) => v !== ""));
    try {
        const data = await pedidosService.buscarFiltrado(params);
        setPedidos(Array.isArray(data) ? data : []);
    } catch (error) { setPedidos([]); } 
    finally { setCargando(false); }
  };

  const marcarEntregado = async (id) => {
    if(!window.confirm("¿Marcar el pedido como entregado?")) return;
    try {
      await pedidosService.actualizarEstado(id, 'entregado');
      setPedidos(peds => peds.map(p => p.id === id ? {...p, estado: 'entregado'} : p));
    } catch(e) { alert("Error al actualizar estado"); }
  };

  const eliminarPedido = async (id) => {
    if(!window.confirm("Esta acción es irreversible. ¿Eliminar pedido?")) return;
    try {
      await pedidosService.eliminar(id);
      setPedidos(peds => peds.filter(p => p.id !== id));
    } catch (error) { alert("Error al eliminar"); }
  };

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
    <> {/* Fragmento para liberar al botón flotante de la animación */}
      <div className="container-fluid py-4 fade-in overflow-hidden">
        
        {/* ENCABEZADO DE PÁGINA CON BRANDING */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border">
          <div className="d-flex align-items-center gap-3">
            {/* Contenedor del Logo (Círculo) */}
            <div className="bg-light rounded-circle d-flex justify-content-center align-items-center overflow-hidden border" style={{width: '64px', height: '64px', flexShrink: 0}}>
              <img 
                src="/logo.png" 
                alt="Logo La Esquina" 
                style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                onError={(e) => { 
                  e.target.onerror = null; 
                  e.target.src = "https://via.placeholder.com/64x64/0b57d0/ffffff?text=LE"; 
                }} 
              />
            </div>
            <div>
              <p className="text-primary fw-bold small text-uppercase mb-1" style={{letterSpacing: '1px'}}>
                <i className="fas fa-utensils me-2"></i>Resto Bar La Esquina
              </p>
              <h2 className="mb-0 fw-bold text-dark lh-1">Monitor de Pedidos</h2>
            </div>
          </div>
        </div>

        {/* Tarjeta de Filtros Accesibles */}
        <div className="card border-0 mb-4 overflow-hidden shadow-sm">
          <div className="card-body p-4">
            <div className="row g-3 align-items-end">
               <div className="col-12 col-md-4 col-lg-3">
                 <label htmlFor="filtro-cliente" className="form-label">Cliente</label>
                 <select id="filtro-cliente" className="form-select bg-light" value={filtros.cliente} onChange={e => setFiltros({...filtros, cliente: e.target.value})}>
                   <option value="">Todos los clientes</option>
                   {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
                 </select>
               </div>
               <div className="col-12 col-md-4 col-lg-2">
                 <label htmlFor="filtro-estado" className="form-label">Estado</label>
                 <select id="filtro-estado" className="form-select bg-light" value={filtros.estado} onChange={e => setFiltros({...filtros, estado: e.target.value})}>
                   <option value="">Todos</option>
                   <option value="pendiente">Pendiente</option>
                   <option value="preparando">Preparando</option>
                   <option value="en_camino">En Camino</option>
                   <option value="entregado">Entregado</option>
                 </select>
               </div>
               <div className="col-6 col-md-4 col-lg-2">
                  <label htmlFor="filtro-desde" className="form-label">Desde</label>
                  <input id="filtro-desde" type="date" className="form-control bg-light" value={filtros.fechaDesde} onChange={e => setFiltros({...filtros, fechaDesde: e.target.value})} />
               </div>
               <div className="col-6 col-md-4 col-lg-2">
                  <label htmlFor="filtro-hasta" className="form-label">Hasta</label>
                  <input id="filtro-hasta" type="date" className="form-control bg-light" value={filtros.fechaHasta} onChange={e => setFiltros({...filtros, fechaHasta: e.target.value})} />
               </div>
               <div className="col-12 col-md-8 col-lg-3 d-flex gap-2">
                 <button className="btn btn-primary flex-grow-1" onClick={buscar} disabled={cargando}>
                   {cargando ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fas fa-search me-2"></i>} Buscar
                 </button>
                 <button className="btn btn-outline-secondary" aria-label="Restablecer filtros" onClick={() => {
                    setFiltros({...filtros, cliente: "", estado: "", tipoEntrega: "", fechaDesde: obtenerFechaLocal(), fechaHasta: ObtenerFechaMañana()});
                 }}>
                   <i className="fas fa-undo"></i>
                 </button>
               </div>
            </div>
          </div>
        </div>

        {/* Tabla Responsive Optimizada */}
        <div className="card border-0 shadow-sm position-relative overflow-hidden w-100">
          {cargando && (
            <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center bg-white" style={{zIndex: 10, opacity: 0.8}}>
               <div className="spinner-border text-primary"></div>
            </div>
          )}
          <div className="w-100">
            <table className="table table-hover table-borderless mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="ps-3 ps-md-4">ID</th>
                  <th className="d-none d-md-table-cell">Hora</th>
                  <th>Cliente</th>
                  <th className="d-none d-lg-table-cell" style={{minWidth: '220px'}}>Resumen</th>
                  <th className="d-none d-md-table-cell text-center">Tipo</th>
                  <th className="text-center">Estado</th>
                  <th className="text-end">Total</th>
                  <th className="text-center pe-3 pe-md-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5">
                        <div className="text-muted">
                          <i className="fas fa-inbox fs-1 mb-3 opacity-50"></i>
                          <h5>No se encontraron resultados</h5>
                          <p className="mb-0">Ajusta los filtros o intenta con otra búsqueda.</p>
                        </div>
                      </td>
                    </tr>
                ) : (
                    pedidos.map(p => (
                    <tr key={p.id}>
                        <td className="ps-3 ps-md-4 fw-bold text-muted">#{p.id}</td>
                        <td className="d-none d-md-table-cell text-muted">{new Date(p.fecha).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                        <td>
                          <span className="fw-bold text-dark">{p.cliente ? `${p.cliente.nombre} ${p.cliente.apellido}` : 'Consumidor Final'}</span>
                          {p.repartidor && <div className="small text-muted d-block d-lg-none mt-1"><i className="fas fa-motorcycle me-1"></i>{p.repartidor.nombre}</div>}
                        </td>
                        <td className="d-none d-lg-table-cell text-muted small text-truncate" style={{maxWidth: '220px'}}>
                          {p.productos?.map(prod => `${prod.PedidoProducto?.cantidad || prod.cantidad}x ${prod.nombre}`).join(', ')}
                        </td>
                        <td className="d-none d-md-table-cell text-center text-muted">
                          {p.tipoEntrega === 'delivery' ? <i className="fas fa-motorcycle" title="Delivery"></i> : <i className="fas fa-store" title="Local"></i>}
                        </td>
                        <td className="text-center">
                          <span className={getEstadoBadge(p.estado)}>
                            {p.estado === 'entregado' && <i className="fas fa-check-circle"></i>}
                            {p.estado === 'en_camino' && <i className="fas fa-route"></i>}
                            {p.estado === 'preparando' && <i className="fas fa-fire"></i>}
                            {p.estado !== 'entregado' && p.estado !== 'en_camino' && p.estado !== 'preparando' && p.estado}
                          </span>
                        </td>
                        <td className="text-end fw-bold text-dark">${parseFloat(p.total || 0).toFixed(2)}</td>
                        <td className="text-center pe-3 pe-md-4">
                          <div className="d-flex justify-content-center gap-1">
                            {p.estado !== 'entregado' && p.estado !== 'cancelado' && (
                                <button className="btn btn-sm btn-light text-success" onClick={() => marcarEntregado(p.id)} aria-label="Entregar">
                                  <i className="fas fa-check"></i>
                                </button>
                            )}
                            <button className="btn btn-sm btn-light text-secondary" onClick={() => { setPedidoSeleccionado(p); setModalIsOpen(true); }} aria-label="Ver detalles">
                              <i className="fas fa-eye"></i>
                            </button>
                            <button className="btn btn-sm btn-light text-primary d-none d-sm-inline-flex" onClick={() => navigate(`/pedidos/editar/${p.id}`)} aria-label="Editar">
                              <i className="fas fa-pen"></i>
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
      </div>

      <button className="floating-action-btn border-0" onClick={() => navigate("/pedidos/nuevo")} aria-label="Crear pedido">
        <i className="fas fa-plus fs-4"></i>
      </button>

      {pedidoSeleccionado && (
        <ModalDetallesPedido pedido={pedidoSeleccionado} abierto={modalIsOpen} onCerrar={() => setModalIsOpen(false)} />
      )}
    </>
  );
};

export default Pedidos;
