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
      const [clis, prods, reps] = await Promise.all([
        clientesService.obtenerTodos(),
        productosService.obtenerTodos(),
        repartidoresService.obtenerTodos()
      ]);
      setClientes(clis);
      setProductos(prods);
      setRepartidores(reps);
    };
    cargar();
  }, []);

  const agregar = (producto) => {
    const precio = Number(
      tipoEntrega === "salon"
        ? (producto.precioSalon ?? producto.precio ?? 0)
        : (producto.precioMostrador ?? producto.precio ?? 0)
    );

    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      if (existe) {
        return prev.map((item) => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item);
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

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      productos: carrito.map((item) => ({ id: item.id, cantidad: item.cantidad }))
    };
    if (id) {
      await pedidosService.actualizar(id, payload);
    } else {
      await pedidosService.crear(payload);
    }
    navigate(location.state?.idMesa ? "/salon" : "/pedidos");
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">{id ? `Editar Pedido #${id}` : "Nueva Comanda"}</div>
          <div className="page-subtitle">{location.state?.mesaNumero ? `Mesa ${location.state.mesaNumero}` : "Comanda rápida con doble precio"}</div>
        </div>
        <button className="btn btn-outline-secondary" type="button" onClick={() => navigate(-1)}>Volver</button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row g-4">
          <div className="col-12 col-xl-8">
            <div className="card mb-4">
              <div className="card-header">Datos del pedido</div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Canal</label>
                    <select className="form-select" {...register("tipoEntrega")}>
                      <option value="mostrador">Mostrador</option>
                      <option value="delivery">Delivery</option>
                      <option value="salon">Salón</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Cliente</label>
                    <select className="form-select" {...register("idCliente")}>
                      <option value="">Consumidor final</option>
                      {clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.nombre} {cliente.apellido}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Mesa</label>
                    <input className="form-control" readOnly {...register("idMesa")} />
                  </div>
                  {tipoEntrega === "delivery" && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label">Dirección</label>
                        <input className="form-control" {...register("direccionEntrega")} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Repartidor</label>
                        <select className="form-select" {...register("idRepartidor")}>
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
              <div className="card-header">Menú rápido</div>
              <div className="card-body">
                <div className="product-grid">
                  {productos.map((producto) => (
                    <button key={producto.id} type="button" className="product-card" onClick={() => agregar(producto)}>
                      <div className="product-card-name">{producto.nombre}</div>
                      <div className="product-card-price">
                        ${Number(tipoEntrega === "salon" ? producto.precioSalon : producto.precioMostrador).toFixed(2)}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-3)" }}>{tipoEntrega === "salon" ? "Precio salón" : "Precio mostrador/delivery"}</div>
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
                <button type="submit" className="btn btn-primary w-100 mt-3" disabled={carrito.length === 0}>Confirmar pedido</button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FormularioPedido;
