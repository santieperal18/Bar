import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import pedidosService from "../services/pedidos.service";
import clientesService from "../services/clientes.service";
import productosService from "../services/productos.service";
import repartidoresService from "../services/repartidores.service";

const FormularioPedido = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [repartidores, setRepartidores] = useState([]); 
  const [carrito, setCarrito] = useState([]);

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: { tipoEntrega: "local", estado: "pendiente" }
  });
  
  const tipoEntrega = watch("tipoEntrega");

  useEffect(() => {
    const init = async () => {
      try {
        const [cli, prod, rep] = await Promise.all([
            clientesService.obtenerTodos(), 
            productosService.obtenerTodos(),
            repartidoresService.obtenerTodos() 
        ]);
        
        setClientes(Array.isArray(cli) ? cli : []);
        setProductos(Array.isArray(prod) ? prod : []);
        setRepartidores(Array.isArray(rep) ? rep : []);
        
        if (id) { 
          const pedido = await pedidosService.obtenerPorId(id);
          if (pedido) {
            setValue("idCliente", pedido.idCliente);
            setValue("tipoEntrega", pedido.tipoEntrega);
            setValue("estado", pedido.estado);
            setValue("observaciones", pedido.observaciones);
            setValue("direccionEntrega", pedido.direccionEntrega);
            setValue("idRepartidor", pedido.idRepartidor); 
            
            if (Array.isArray(pedido.productos)) {
                setCarrito(pedido.productos.map(p => ({
                    id: p.id,
                    nombre: p.nombre,
                    precio: parseFloat(p.PedidoProducto?.precioUnitario || p.precio),
                    cantidad: p.PedidoProducto?.cantidad || 1
                })));
            }
          }
        }
      } catch (error) {
        console.error("Error al inicializar formulario:", error);
      }
    };
    init();
  }, [id, setValue]);

  // UX Mejorada: Control de cantidades fluido
  const agregar = (prod) => {
    const existe = carrito.find(i => i.id === prod.id);
    if(existe) {
        setCarrito(carrito.map(i => i.id === prod.id ? {...i, cantidad: i.cantidad + 1} : i));
    } else {
        setCarrito([...carrito, { id: prod.id, nombre: prod.nombre, precio: parseFloat(prod.precio), cantidad: 1 }]);
    }
  };

  const restar = (id) => {
    const existe = carrito.find(i => i.id === id);
    if(existe.cantidad > 1) {
        setCarrito(carrito.map(i => i.id === id ? {...i, cantidad: i.cantidad - 1} : i));
    } else {
        quitar(id);
    }
  };

  const quitar = (id) => setCarrito(carrito.filter(i => i.id !== id));
  
  const total = Array.isArray(carrito) ? carrito.reduce((acc, i) => acc + ((i.precio || 0) * (i.cantidad || 1)), 0) : 0;

  const onSubmit = async (data) => {
    if (data.tipoEntrega === 'local') data.idRepartidor = null;
    const payload = { 
        ...data, 
        fecha: new Date(), 
        productos: carrito.map(i => ({ id: i.id, cantidad: i.cantidad, precio: i.precio })) 
    };
    
    try {
        setCargando(true);
        id ? await pedidosService.actualizar(id, payload) : await pedidosService.crear(payload);
        navigate("/pedidos");
    } catch(e) { 
        console.error("Error al guardar:", e);
    } finally { 
        setCargando(false); 
    }
  };

  return (
    <div className="container-fluid py-4 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0 fw-bold" style={{ color: 'var(--text-dark)' }}>
            {id ? "Editar Pedido #"+id : "Nuevo Pedido"}
          </h2>
          <p className="text-muted small mb-0">Completá los datos del cliente y armá la comanda</p>
        </div>
        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/pedidos")}>
          <i className="fas fa-arrow-left me-2"></i>Volver
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row g-4">
          
          {/* COLUMNA IZQUIERDA: Configuración y Productos (Jerarquía Visual) */}
          <div className="col-lg-8">
            
            {/* Sección 1: Datos del Envío */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <h5 className="fw-bold mb-3 border-bottom pb-2">1. Datos de Entrega</h5>
                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">Cliente</label>
                        <select className="form-select" {...register("idCliente", {required: true})}>
                            <option value="">Seleccionar Consumidor Final...</option>
                            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
                        </select>
                    </div>
                    
                    <div className="col-md-3">
                        <label className="form-label small fw-bold text-muted">Modalidad</label>
                        <select className="form-select" {...register("tipoEntrega")}>
                            <option value="local">Local</option>
                            <option value="delivery">Delivery</option>
                        </select>
                    </div>

                    {id && (
                        <div className="col-md-3">
                            <label className="form-label small fw-bold text-muted">Estado Actual</label>
                            <select className="form-select" {...register("estado")}>
                                <option value="pendiente">Pendiente</option>
                                <option value="preparando">Preparando</option>
                                <option value="en_camino">En Camino</option>
                                <option value="entregado">Entregado</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </div>
                    )}

                    {tipoEntrega === 'delivery' && (
                        <>
                          <div className="col-md-4 fade-in">
                              <label className="form-label small fw-bold text-muted"><i className="fas fa-helmet-safety me-1"></i>Repartidor</label>
                              <select className="form-select" style={{borderColor: 'var(--primary-color)'}} {...register("idRepartidor")}>
                                  <option value="">Sin asignar...</option>
                                  {repartidores.map(r => <option key={r.id} value={r.id}>{r.nombre} {r.apellido}</option>)}
                              </select>
                          </div>
                          <div className="col-md-8 fade-in">
                              <label className="form-label small fw-bold text-muted">Dirección de Entrega</label>
                              <input type="text" className="form-control" {...register("direccionEntrega")} placeholder="Ej: Av. Colón 1234, B° Centro" />
                          </div>
                        </>
                    )}
                </div>
              </div>
            </div>

            {/* Sección 2: Catálogo de Productos (Simplicidad) */}
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="fw-bold mb-3 border-bottom pb-2">2. Catálogo de Productos</h5>
                <div className="grid-responsive custom-scrollbar" style={{maxHeight: '400px', overflowY: 'auto', paddingRight: '10px'}}>
                    {productos.map(p => (
                        <div key={p.id} className="product-card p-3 d-flex flex-column justify-content-between h-100 bg-light">
                            <div>
                                <h6 className="fw-bold mb-1">{p.nombre}</h6>
                                <span className="price-display text-success">${parseFloat(p.precio || 0).toFixed(2)}</span>
                            </div>
                            <button 
                              type="button" 
                              className="btn btn-sm mt-3 w-100 fw-bold"
                              style={{backgroundColor: 'var(--primary-color)', color: 'white'}}
                              onClick={() => agregar(p)}
                              aria-label={`Agregar ${p.nombre} al pedido`}
                            >
                              <i className="fas fa-plus me-1"></i> Agregar
                            </button>
                        </div>
                    ))}
                </div>
              </div>
            </div>

          </div>

          {/* COLUMNA DERECHA: El "Ticket" o Carrito (Retroalimentación constante) */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 sticky-top" style={{top: '20px'}}>
              <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
                <h5 className="fw-bold"><i className="fas fa-receipt me-2 text-muted"></i>Resumen del Pedido</h5>
              </div>
              <div className="card-body d-flex flex-column" style={{minHeight: '400px'}}>
                
                {/* Listado del Carrito */}
                <div className="flex-grow-1 custom-scrollbar" style={{overflowY: 'auto', maxHeight: '300px'}}>
                    {carrito.length === 0 ? (
                        <div className="empty-state p-3 text-center">
                            <i className="fas fa-shopping-basket fs-1 text-muted opacity-25 mb-3"></i>
                            <p className="text-muted small">El pedido está vacío.<br/>Agregá productos desde el catálogo.</p>
                        </div>
                    ) : (
                        <ul className="list-group list-group-flush">
                            {carrito.map(item => (
                                <li key={item.id} className="list-group-item px-0 py-3 border-bottom smooth-transition">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <span className="fw-bold text-dark">{item.nombre}</span>
                                        <span className="fw-bold text-success">${(item.precio * item.cantidad).toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-muted small">${item.precio.toFixed(2)} c/u</span>
                                        <div className="btn-group btn-group-sm" role="group">
                                            <button type="button" className="btn btn-outline-secondary" onClick={() => restar(item.id)} aria-label="Disminuir cantidad">
                                              <i className={`fas ${item.cantidad === 1 ? 'fa-trash text-danger' : 'fa-minus'}`}></i>
                                            </button>
                                            <span className="btn btn-outline-secondary disabled fw-bold" style={{width: '40px', opacity: 1}}>{item.cantidad}</span>
                                            <button type="button" className="btn btn-outline-secondary" onClick={() => agregar(item)} aria-label="Aumentar cantidad">
                                              <i className="fas fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Zona de Totales y Acción */}
                <div className="border-top pt-3 mt-3">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="text-uppercase fw-bold text-muted">Total</span>
                        <span className="fs-3 fw-bold text-dark">${total.toFixed(2)}</span>
                    </div>
                    
                    <button 
                      type="submit" 
                      className="btn btn-lg w-100 fw-bold d-flex justify-content-center align-items-center"
                      style={{backgroundColor: carrito.length === 0 ? '#e5e7eb' : 'var(--primary-color)', color: carrito.length === 0 ? '#9ca3af' : 'white'}}
                      disabled={cargando || carrito.length === 0}
                    >
                      {cargando ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      ) : (
                        <i className="fas fa-check-circle me-2"></i>
                      )}
                      {cargando ? "Guardando..." : "Confirmar Pedido"}
                    </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
};

export default FormularioPedido;
