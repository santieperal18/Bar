import { useEffect, useState } from "react";
import operacionesService from "../services/operaciones.service";

const columnas = ["pendiente", "preparando", "listo"];

const Cocina = () => {
  const [comandas, setComandas] = useState([]);

  const cargar = async () => {
    setComandas(await operacionesService.obtenerCocina());
  };

  useEffect(() => {
    cargar();
  }, []);

  const avanzar = async (id) => {
    await operacionesService.avanzarCocina(id);
    await cargar();
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Cocina</div>
          <div className="page-subtitle">KDS Lite unificado para reemplazar el papel</div>
        </div>
      </div>

      <div className="kds-grid">
        {columnas.map((estado) => (
          <div key={estado} className="card">
            <div className="card-header" style={{ textTransform: "capitalize" }}>{estado}</div>
            <div className="card-body d-flex flex-column gap-3">
              {comandas.filter((pedido) => pedido.estado === estado).map((pedido) => (
                <button key={pedido.id} className="kds-card" onClick={() => avanzar(pedido.id)}>
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>#{pedido.id}</strong>
                    <span className="status-badge sb-active">{pedido.tipoEntrega}</span>
                  </div>
                  <div style={{ color: "var(--text-2)", fontSize: 13 }}>
                    {pedido.mesa ? `Mesa ${pedido.mesa.numero}` : pedido.cliente ? `${pedido.cliente.nombre} ${pedido.cliente.apellido}` : "Mostrador"}
                  </div>
                  <div className="kds-items">
                    {pedido.productos?.map((producto, index) => (
                      <div key={`${producto.id}-${producto.PedidoProducto?.guarnicion || "sin"}-${index}`}>
                        {producto.PedidoProducto?.cantidad || producto.cantidad}x {producto.nombre}
                        {producto.PedidoProducto?.guarnicion && (
                          <span style={{ color: "var(--accent)", fontWeight: 700 }}> - {producto.PedidoProducto.guarnicion}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </button>
              ))}
              {comandas.filter((pedido) => pedido.estado === estado).length === 0 && (
                <div className="empty-state" style={{ padding: "28px 12px" }}>
                  <p>Sin comandas</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Cocina;
