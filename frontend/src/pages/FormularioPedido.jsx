import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import pedidosService from "../services/pedidos.service";
import clientesService from "../services/clientes.service";
import productosService from "../services/productos.service";
import repartidoresService from "../services/repartidores.service";

const FormularioPedido = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [mostrarSugerenciasCliente, setMostrarSugerenciasCliente] = useState(false);
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      tipoEntrega: location.state?.tipoEntrega || "mostrador",
      idMesa: location.state?.idMesa || ""
    }
  });

  const tipoEntrega = watch("tipoEntrega");
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      setError("");

      try {
        const [clis, prods, reps, pedido] = await Promise.all([
          clientesService.obtenerTodos(),
          productosService.obtenerTodos(),
          repartidoresService.obtenerTodos(),
          id ? pedidosService.obtenerPorId(id) : Promise.resolve(null)
        ]);

        setClientes(clis);
        setProductos(prods);
        setRepartidores(reps);

        if (pedido) {
          setValue("tipoEntrega", pedido.tipoEntrega || "mostrador");
          setValue("idCliente", pedido.idCliente || "");
          setBusquedaCliente(pedido.cliente ? `${pedido.cliente.nombre} ${pedido.cliente.apellido}` : "");
          setValue("idMesa", pedido.idMesa || "");
          setValue("direccionEntrega", pedido.direccionEntrega || "");
          setValue("idRepartidor", pedido.idRepartidor || "");
          setCarrito(
            (pedido.productos || []).map((producto) => ({
              id: producto.id,
              nombre: producto.nombre,
              precio: Number(producto.PedidoProducto?.precioUnitario ?? producto.precio ?? 0),
              cantidad: Number(producto.PedidoProducto?.cantidad ?? 1)
            }))
          );
        }
      } catch (err) {
        setError(err.response?.data?.error || "No se pudo cargar el pedido");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [id, setValue]);

  const agregar = (producto) => {
    const precio = Number(
      tipoEntrega === "salon"
        ? (producto.precioSalon ?? producto.precio ?? 0)
        : (producto.precioMostrador ?? producto.precio ?? 0)
    );

    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      if (existe) {
        return prev.map((item) => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1, precio } : item);
      }
      return [...prev, { id: producto.id, nombre: producto.nombre, precio, cantidad: 1 }];
    });
  };

  const restar = (idProducto) => {
    setCarrito((prev) => prev.flatMap((item) => {
      if (item.id !== idProducto) return [item];
      if (item.cantidad === 1) return [];
      return [{ ...item, cantidad: item.cantidad - 1 }];
    }));
  };

  const clientesFiltrados = busquedaCliente.trim()
    ? clientes
      .filter((cliente) => `${cliente.nombre} ${cliente.apellido} ${cliente.telefono || ""}`.toLowerCase().includes(busquedaCliente.toLowerCase()))
      .slice(0, 8)
    : [];

  const seleccionarCliente = (cliente) => {
    setValue("idCliente", cliente.id);
    setBusquedaCliente(`${cliente.nombre} ${cliente.apellido}`);
    setMostrarSugerenciasCliente(false);
  };

  const limpiarCliente = () => {
    setValue("idCliente", "");
    setBusquedaCliente("");
    setMostrarSugerenciasCliente(false);
  };

  const onSubmit = async (data) => {
    setGuardando(true);
    setError("");

    try {
      const payload = {
        ...data,
        productos: carrito.map((item) => ({ id: item.id, cantidad: item.cantidad }))
      };

      if (id) {
        await pedidosService.actualizar(id, payload);
      } else {
        await pedidosService.crear(payload);
      }

      navigate((data.idMesa || location.state?.idMesa) ? "/salon" : "/pedidos");
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo guardar el pedido");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="card">
        <div className="card-body">Cargando pedido...</div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">{id ? `Editar Pedido #${id}` : "Nueva Comanda"}</div>
          <div className="page-subtitle">
            {location.state?.mesaNumero ? `Mesa ${location.state.mesaNumero}` : "Comanda rapida con doble precio"}
          </div>
        </div>
        <button className="btn btn-outline-secondary" type="button" onClick={() => navigate(-1)}>Volver</button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            {error}
          </div>
        )}

        <div className="row g-4">
          <div className="col-12 col-xl-8">
            <div className="card mb-4">
              <div className="card-header">Datos del pedido</div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label" htmlFor="tipoEntrega">Canal</label>
                    <select className="form-select" id="tipoEntrega" {...register("tipoEntrega")}>
                      <option value="mostrador">Mostrador</option>
                      <option value="delivery">Delivery</option>
                      <option value="salon">Salon</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label" htmlFor="idCliente">Cliente</label>
                    <input type="hidden" {...register("idCliente")} />
                    <div className="position-relative">
                      <div className="input-group">
                        <input
                          className="form-control"
                          id="idCliente"
                          name="clienteTexto"
                          type="text"
                          value={busquedaCliente}
                          placeholder="Buscar cliente por nombre o telefono"
                          autoComplete="off"
                          onFocus={() => setMostrarSugerenciasCliente(true)}
                          onChange={(e) => {
                            setBusquedaCliente(e.target.value);
                            setValue("idCliente", "");
                            setMostrarSugerenciasCliente(true);
                          }}
                        />
                        {busquedaCliente && (
                          <button type="button" className="btn btn-outline-secondary" onClick={limpiarCliente} aria-label="Limpiar cliente">
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                      {mostrarSugerenciasCliente && clientesFiltrados.length > 0 && (
                        <div className="list-group position-absolute w-100 shadow" style={{ zIndex: 20, maxHeight: 220, overflowY: "auto" }}>
                          {clientesFiltrados.map((cliente) => (
                            <button
                              key={cliente.id}
                              type="button"
                              className="list-group-item list-group-item-action"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                seleccionarCliente(cliente);
                              }}
                            >
                              <div style={{ fontWeight: 600 }}>{cliente.nombre} {cliente.apellido}</div>
                              {cliente.telefono && <div style={{ fontSize: 12, color: "var(--text-2)" }}>{cliente.telefono}</div>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {!busquedaCliente && <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 4 }}>Sin cliente: consumidor final</div>}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label" htmlFor="idMesa">Mesa</label>
                    <input className="form-control" id="idMesa" readOnly {...register("idMesa")} />
                  </div>
                  {tipoEntrega === "delivery" && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label" htmlFor="direccionEntrega">Direccion</label>
                        <input className="form-control" id="direccionEntrega" {...register("direccionEntrega")} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" htmlFor="idRepartidor">Repartidor</label>
                        <select className="form-select" id="idRepartidor" {...register("idRepartidor")}>
                          <option value="">Sin asignar</option>
                          {repartidores.map((repartidor) => <option key={repartidor.id} value={repartidor.id}>{repartidor.nombre} {repartidor.apellido}</option>)}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">Menu rapido</div>
              <div className="card-body">
                <div className="product-grid">
                  {productos.map((producto) => (
                    <button key={producto.id} type="button" className="product-card" onClick={() => agregar(producto)}>
                      <div className="product-card-name">{producto.nombre}</div>
                      <div className="product-card-price">
                        ${Number(tipoEntrega === "salon" ? producto.precioSalon : producto.precioMostrador).toFixed(2)}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                        {tipoEntrega === "salon" ? "Precio salon" : "Precio mostrador/delivery"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div className="ticket-card">
              <div className="card-header">Ticket</div>
              <div className="ticket-body">
                {carrito.map((item) => (
                  <div key={item.id} className="ticket-item">
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.nombre}</div>
                      <div style={{ color: "var(--text-2)", fontSize: 12 }}>${item.precio.toFixed(2)} x {item.cantidad}</div>
                    </div>
                    <div className="qty-wrap">
                      <button type="button" className="qty-btn del" onClick={() => restar(item.id)}><i className="fas fa-minus"></i></button>
                      <span className="qty-num">{item.cantidad}</span>
                      <button type="button" className="qty-btn" onClick={() => agregar(item)}><i className="fas fa-plus"></i></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="ticket-footer">
                <div className="ticket-total-label">Total</div>
                <div className="ticket-total">${total.toFixed(2)}</div>
                <button type="submit" className="btn btn-primary w-100 mt-3" disabled={carrito.length === 0 || guardando}>
                  {guardando ? "Guardando..." : "Confirmar pedido"}
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
