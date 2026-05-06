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
            clientesService.obtenerTodos(), productosService.obtenerTodos(), repartidoresService.obtenerTodos() 
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
            setValue("direccionEntrega", pedido.direccionEntrega);
            setValue("idRepartidor", pedido.idRepartidor); 
            if (Array.isArray(pedido.productos)) {
                setCarrito(pedido.productos.map(p => ({
                    id: p.id, nombre: p.nombre, 
                    precio: parseFloat(p.PedidoProducto?.precioUnitario || p.precio),
                    cantidad: p.PedidoProducto?.cantidad || 1
                })));
            }
          }
        }
      } catch (error) { console.error(error); }
    };
    init();
  }, [id, setValue]);

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
        setCarrito(carrito.filter(i => i.id !== id));
    }
  };

  const total = carrito.reduce((acc, i) => acc + (i.precio * i.cantidad), 0);

  const onSubmit = async (data) => {
    if (data.tipoEntrega === 'local') data.idRepartidor = null;
    const payload = { 
        ...data, fecha: new Date(), 
        productos: carrito.map(i => ({ id: i.id, cantidad: i.cantidad, precio: i.precio })) 
    };
    try {
        setCargando(true);
        id ? await pedidosService.actualizar(id, payload) : await pedidosService.crear(payload);
        navigate("/pedidos");
    } catch(e) { console.error(e); } 
    finally { setCargando(false); }
  };

  return (
    <div className="container-fluid py-4 fade-in">
      
      {/* ENCABEZADO ESTILO PUNTO DE VENTA (POS) */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3 bg-white p-3 px-4 rounded-pill shadow-sm border">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-light rounded-circle d-flex justify-content-center align-items-center overflow-hidden border" style={{width: '48px', height: '48px', flexShrink: 0}}>
            <img 
              src="/logo.png" 
              alt="Logo" 
              style={{width: '100%', height: '100%', objectFit: 'cover'}} 
              onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/48x48/0b57d0/ffffff?text=LE"; }} 
            />
          </div>
          <div className="d-flex flex-column justify-content-center">
            <span className="text-primary fw-bold text-uppercase mb-0" style={{fontSize: '0.7rem', letterSpacing: '1px'}}>Resto Bar La Esquina</span>
            <h4 className="mb-0 fw-bold text-dark lh-1">{id ? `Editando Orden #${id}` : "Nueva Comanda"}</h4>
          </div>
        </div>
        <button type="button" className="btn btn-light border rounded-pill px-4 fw-bold text-muted hover-primary" onClick={() => navigate("/pedidos")}>
          <i className="fas fa-arrow-left me-2"></i> Volver al Monitor
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row g-4">
          
          {/* LADO IZQUIERDO: Operación */}
          <div className="col-12 col-xl-8">
            
            <div className="card border-0 shadow-sm p-4 mb-4">
              <h5 className="fw-bold mb-4" style={{color: 'var(--primary-color)'}}><i className="fas fa-map-marker-alt me-2"></i>1. Logística</h5>
              <div className="row g-3">
                  <div className="col-12 col-md-6">
                      <label htmlFor="select-cliente" className="form-label">Asignar Cliente</label>
                      <select id="select-cliente" className="form-select bg-light" {...register("idCliente", {required: true})}>
                          <option value="">Consumidor Final (Mostrador)</option>
                          {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
                      </select>
                  </div>
                  
                  <div className="col-6 col-md-3">
                      <label htmlFor="select-modalidad" className="form-label">Modalidad</label>
                      <select id="select-modalidad" className="form-select bg-light" {...register("tipoEntrega")}>
                          <option value="local">Retiro Local</option>
                          <option value="delivery">Delivery</option>
                      </select>
                  </div>

                  {id && (
                      <div className="col-6 col-md-3">
                          <label htmlFor="select-estado" className="form-label">Estado</label>
                          <select id="select-estado" className="form-select bg-light" {...register("estado")}>
                              <option value="pendiente">Pendiente</option>
                              <option value="preparando">Preparando</option>
                              <option value="en_camino">En Camino</option>
                              <option value="entregado">Entregado</option>
                              <option value="cancelado">Cancelado</option>
                          </select>
                      </div>
                  )}

                  {tipoEntrega === 'delivery' && (
                      <div className="col-12 row g-3 fade-in mt-0">
                        <div className="col-12 col-md-4">
                            <label htmlFor="select-repartidor" className="form-label text-primary">Repartidor</label>
                            <select id="select-repartidor" className="form-select border-primary" {...register("idRepartidor")}>
                                <option value="">Sin asignar</option>
                                {repartidores.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                            </select>
                        </div>
                        <div className="col-12 col-md-8">
                            <label htmlFor="input-direccion" className="form-label">Dirección destino</label>
                            <input id="input-direccion" type="text" className="form-control bg-light" {...register("direccionEntrega")} placeholder="Ingresa la calle y número" />
                        </div>
                      </div>
                  )}
              </div>
            </div>

            <div className="card border-0 shadow-sm p-4">
              <h5 className="fw-bold mb-4" style={{color: 'var(--primary-color)'}}><i className="fas fa-hamburger me-2"></i>2. Menú Rápido</h5>
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3 custom-scrollbar" style={{maxHeight: '450px', overflowY: 'auto'}}>
                  {productos.map(p => (
                      <div key={p.id} className="col">
                        <div className="card h-100 bg-light border-0 shadow-none p-3 smooth-transition hover-primary" style={{cursor: 'pointer'}} onClick={() => agregar(p)}>
                            <div className="d-flex flex-column h-100 justify-content-between">
                                <div>
                                    <h6 className="fw-bold text-dark mb-1 lh-sm">{p.nombre}</h6>
                                    <span className="fw-bold text-success fs-5">${parseFloat(p.precio || 0).toFixed(2)}</span>
                                </div>
                                <button type="button" className="btn btn-sm btn-white mt-3 w-100 fw-bold border" aria-label={`Agregar ${p.nombre}`}>
                                  <i className="fas fa-plus text-primary"></i>
                                </button>
                            </div>
                        </div>
                      </div>
                  ))}
              </div>
            </div>

          </div>

          {/* LADO DERECHO: Carrito / Ticket fijo */}
          <div className="col-12 col-xl-4 mt-4 mt-xl-0">
            <div className="card border-0 shadow-sm sticky-top" style={{top: '20px'}}>
              <div className="card-header bg-white border-bottom-0 pt-4 pb-2 px-4">
                <h5 className="fw-bold mb-0 text-dark">Ticket de Venta</h5>
              </div>
              <div className="card-body p-0 d-flex flex-column" style={{minHeight: '450px'}}>
                
                <div className="flex-grow-1 custom-scrollbar px-4 pb-2" style={{overflowY: 'auto', maxHeight: '350px'}}>
                    {carrito.length === 0 ? (
                        <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted p-5 text-center">
                            <i className="fas fa-shopping-bag fs-1 mb-3" style={{opacity: 0.2}}></i>
                            <p className="mb-0">Añade productos para<br/>iniciar la comanda</p>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-3 mt-3">
                            {carrito.map(item => (
                                <div key={item.id} className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3">
                                    <div className="d-flex flex-column">
                                        <span className="fw-bold text-dark lh-1">{item.nombre}</span>
                                        <span className="text-muted small mt-1">${item.precio.toFixed(2)} /u</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <button type="button" className="btn-qty" onClick={() => restar(item.id)} aria-label="Restar">
                                          <i className={`fas ${item.cantidad === 1 ? 'fa-trash-alt text-danger' : 'fa-minus'}`}></i>
                                        </button>
                                        <span className="fw-bold text-center" style={{width: '24px'}}>{item.cantidad}</span>
                                        <button type="button" className="btn-qty" onClick={() => agregar(item)} aria-label="Sumar">
                                          <i className="fas fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer del Ticket estilo impreso */}
                <div className="bg-light p-4 rounded-bottom-4 mt-auto" style={{ borderTop: '2px dashed #dee2e6' }}>
                    <div className="d-flex justify-content-between align-items-end mb-4">
                        <span className="fw-bold text-muted text-uppercase tracking-wider">A Cobrar</span>
                        <span className="fs-2 fw-bold text-dark lh-1">${total.toFixed(2)}</span>
                    </div>
                    
                    <button type="submit" className="btn btn-primary btn-lg w-100 py-3 fs-5 rounded-4" disabled={cargando || carrito.length === 0}>
                      {cargando ? (
                        <span className="spinner-border spinner-border-sm me-2"></span>
                      ) : (
                        <i className="fas fa-check-circle me-2"></i>
                      )}
                      Procesar Orden
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
