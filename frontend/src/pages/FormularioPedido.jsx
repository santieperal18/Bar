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
  const [mobileTab, setMobileTab] = useState('menu');
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [mostrarResultadosCli, setMostrarResultadosCli] = useState(false);

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: { tipoEntrega: "local", estado: "pendiente" }
  });

  const tipoEntrega = watch("tipoEntrega");
  const totalItems = carrito.reduce((acc, i) => acc + i.cantidad, 0);

  // Filtrar clientes por búsqueda
  const clientesFiltrados = busquedaCliente.length > 0
    ? clientes.filter(c => 
        `${c.nombre} ${c.apellido}`.toLowerCase().includes(busquedaCliente.toLowerCase())
      )
    : [];

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
            if (pedido.cliente) {
              setBusquedaCliente(`${pedido.cliente.nombre} ${pedido.cliente.apellido}`);
            }
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
      } catch (e) { console.error(e); }
    };
    init();
  }, [id, setValue]);

  const seleccionarCliente = (c) => {
    setValue("idCliente", c.id);
    setBusquedaCliente(`${c.nombre} ${c.apellido}`);
    setMostrarResultadosCli(false);
  };

  const agregar = (prod) => {
    const existe = carrito.find(i => i.id === prod.id);
    if (existe) {
      setCarrito(carrito.map(i => i.id === prod.id ? { ...i, cantidad: i.cantidad + 1 } : i));
    } else {
      setCarrito([...carrito, { id: prod.id, nombre: prod.nombre, precio: parseFloat(prod.precio), cantidad: 1 }]);
    }
  };

  const restar = (pid) => {
    const item = carrito.find(i => i.id === pid);
    if (item.cantidad > 1) {
      setCarrito(carrito.map(i => i.id === pid ? { ...i, cantidad: i.cantidad - 1 } : i));
    } else {
      setCarrito(carrito.filter(i => i.id !== pid));
    }
  };

  const total = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

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
    } catch (e) { console.error(e); }
    finally { setCargando(false); }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 gap-3">
        <div>
          <div className="page-title">{id ? `Editar Orden #${id}` : 'Nueva Comanda'}</div>
          <div className="page-subtitle">Resto Bar La Esquina</div>
        </div>
        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/pedidos")}>
          <i className="fas fa-arrow-left"></i> Volver
        </button>
      </div>

      {/* POS Tab bar — mobile only */}
      <div className="pos-tabs">
        <button
          type="button"
          className={`pos-tab${mobileTab === 'menu' ? ' active' : ''}`}
          onClick={() => setMobileTab('menu')}
        >
          <i className="fas fa-utensils"></i> Menú
        </button>
        <button
          type="button"
          className={`pos-tab${mobileTab === 'ticket' ? ' active' : ''}`}
          onClick={() => setMobileTab('ticket')}
        >
          <i className="fas fa-receipt"></i> Ticket
          {totalItems > 0 && <span className="pos-tab-badge">{totalItems}</span>}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row g-4">

          {/* ── Izquierda ── */}
          <div className={`col-12 col-xl-8 pos-section${mobileTab === 'menu' ? ' visible' : ''}`}>

            {/* Logística */}
            <div className="card mb-4">
              <div className="card-header">
                <i className="fas fa-map-marker-alt me-2" style={{ color: 'var(--accent)' }}></i>
                Logística
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label">Cliente</label>
                    <div className="position-relative">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Buscar cliente por nombre..." 
                        value={busquedaCliente}
                        onChange={(e) => {
                          setBusquedaCliente(e.target.value);
                          setMostrarResultadosCli(true);
                        }}
                        onFocus={() => setMostrarResultadosCli(true)}
                      />
                      <input type="hidden" {...register("idCliente")} />
                      
                      {mostrarResultadosCli && (busquedaCliente || clientesFiltrados.length > 0) && (
                        <ul className="dropdown-menu show w-100 shadow-sm" style={{ maxHeight: '200px', overflowY: 'auto', zIndex: 1000 }}>
                          <li className="dropdown-item py-2 border-bottom" style={{ cursor: 'pointer' }} onClick={() => {
                            setValue("idCliente", "");
                            setBusquedaCliente("");
                            setMostrarResultadosCli(false);
                          }}>
                            <i className="fas fa-user-slash me-2 text-muted"></i><strong>Consumidor Final (Mostrador)</strong>
                          </li>
                          {clientesFiltrados.map(c => (
                            <li key={c.id} className="dropdown-item py-2" style={{ cursor: 'pointer' }} onClick={() => seleccionarCliente(c)}>
                              <i className="fas fa-user me-2 text-primary-light"></i> {c.nombre} {c.apellido}
                            </li>
                          ))}
                          {busquedaCliente && clientesFiltrados.length === 0 && (
                            <li className="dropdown-item disabled text-muted">No se encontraron clientes</li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <label className="form-label">Modalidad</label>
                    <select className="form-select" {...register("tipoEntrega")}>
                      <option value="local">Retiro Local</option>
                      <option value="delivery">Delivery</option>
                    </select>
                  </div>
                  {id && (
                    <div className="col-6 col-md-3">
                      <label className="form-label">Estado</label>
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
                      <div className="col-12 col-md-4">
                        <label className="form-label">Repartidor</label>
                        <select className="form-select" {...register("idRepartidor")}>
                          <option value="">Sin asignar</option>
                          {repartidores.map(r => <option key={r.id} value={r.id}>{r.nombre} {r.apellido}</option>)}
                        </select>
                      </div>
                      <div className="col-12 col-md-8">
                        <label className="form-label">Dirección de entrega</label>
                        <input type="text" className="form-control" {...register("direccionEntrega")} placeholder="Calle y número…" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Menú */}
            <div className="card">
              <div className="card-header">
                <i className="fas fa-utensils me-2" style={{ color: 'var(--accent)' }}></i>
                Menú rápido
              </div>
              <div className="card-body" style={{ maxHeight: 420, overflowY: 'auto' }}>
                <div className="product-grid">
                  {productos.map(p => (
                    <div key={p.id} className="product-card" onClick={() => agregar(p)}>
                      <div className="product-card-name">{p.nombre}</div>
                      <div className="product-card-price">${parseFloat(p.precio || 0).toFixed(2)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Toca para agregar</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Derecha: Ticket ── */}
          <div className={`col-12 col-xl-4 pos-section${mobileTab === 'ticket' ? ' visible' : ''}`}>
            <div className="ticket-card">
              <div className="card-header">
                <i className="fas fa-receipt me-2" style={{ color: 'var(--accent)' }}></i>
                Ticket de venta
              </div>

              <div className="ticket-body">
                {carrito.length === 0 ? (
                  <div className="empty-state" style={{ padding: '40px 0' }}>
                    <i className="fas fa-shopping-bag" style={{ opacity: 0.15 }}></i>
                    <p>Seleccioná productos del menú</p>
                  </div>
                ) : carrito.map(item => (
                  <div key={item.id} className="ticket-item">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>{item.nombre}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>${item.precio.toFixed(2)} /u</div>
                    </div>
                    <div className="qty-wrap">
                      <button type="button" className={`qty-btn${item.cantidad === 1 ? ' del' : ''}`} onClick={() => restar(item.id)}>
                        <i className={`fas ${item.cantidad === 1 ? 'fa-trash-alt' : 'fa-minus'}`}></i>
                      </button>
                      <span className="qty-num">{item.cantidad}</span>
                      <button type="button" className="qty-btn" onClick={() => agregar(item)}>
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="ticket-footer">
                <div className="ticket-total-label">A cobrar</div>
                <div className="ticket-total mb-4">${total.toFixed(2)}</div>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  style={{ minHeight: 48, fontSize: 15 }}
                  disabled={cargando || carrito.length === 0}
                >
                  {cargando
                    ? <><span className="spinner-border spinner-border-sm"></span> Procesando…</>
                    : <><i className="fas fa-check-circle"></i> Confirmar Orden</>
                  }
                </button>
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
};

export default FormularioPedido;
