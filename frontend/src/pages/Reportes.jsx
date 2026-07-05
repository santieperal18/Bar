import { useEffect, useState } from "react";
import reportesService from "../services/reportes.service";

const Reportes = () => {
  const [dashboard, setDashboard] = useState({
    facturacionHoy: 0,
    facturacionAyer: 0,
    variacionFacturacion: 0,
    ticketPromedio: 0,
    topProductos: [],
    productosLentos: [],
    categorias: {},
    ventasPorHora: []
  });
  const [error, setError] = useState("");

  useEffect(() => {
    reportesService
      .obtenerDashboardSupervivencia()
      .then((data) => {
        setDashboard({
          facturacionHoy: 0,
          facturacionAyer: 0,
          variacionFacturacion: 0,
          ticketPromedio: 0,
          topProductos: [],
          productosLentos: [],
          categorias: {},
          ventasPorHora: [],
          ...data
        });
        setError("");
      })
      .catch((err) => {
        setError(err.response?.data?.error || "No se pudo cargar el dashboard");
      });
  }, []);

  const maxVentas = Math.max(...dashboard.topProductos.map((producto) => Number(producto.total_vendido || 0)), 1);
  const maxHora = Math.max(...dashboard.ventasPorHora.map((fila) => Number(fila.total || 0)), 1);

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard de Supervivencia</div>
          <div className="page-subtitle">Ventas, productos lentos, categorías fuertes y picos horarios</div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="stat-card stat-accent">
            <div className="stat-card-label">Facturación de hoy</div>
            <div className="stat-card-value">${Number(dashboard.facturacionHoy || 0).toFixed(2)}</div>
            <div className="stat-card-sub">Ayer: ${Number(dashboard.facturacionAyer || 0).toFixed(2)}</div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className={`stat-card ${dashboard.variacionFacturacion >= 0 ? "stat-green" : "stat-red"}`}>
            <div className="stat-card-label">Vs ayer</div>
            <div className="stat-card-value">{Number(dashboard.variacionFacturacion || 0).toFixed(1)}%</div>
            <div className="stat-card-sub">Comparativo diario</div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="stat-card stat-blue">
            <div className="stat-card-label">Ticket promedio</div>
            <div className="stat-card-value">${Number(dashboard.ticketPromedio || 0).toFixed(2)}</div>
            <div className="stat-card-sub">Ingresos promedio por pedido</div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-header">Top vendidos</div>
            <div className="card-body d-flex flex-column gap-3">
              {dashboard.topProductos.length === 0 && <span style={{ color: "var(--text-2)" }}>Sin ventas registradas.</span>}
              {dashboard.topProductos.map((producto, index) => (
                <div key={producto.nombre} className="top-product-row">
                  <div className="d-flex justify-content-between">
                    <strong>{index + 1}. {producto.nombre}</strong>
                    <span>{producto.total_vendido} un.</span>
                  </div>
                  <div className="top-product-bar">
                    <span style={{ width: `${(Number(producto.total_vendido || 0) / maxVentas) * 100}%` }}></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-header">Productos para revisar</div>
            <div className="card-body d-flex flex-column gap-2">
              {dashboard.productosLentos.length === 0 && <span style={{ color: "var(--text-2)" }}>Sin productos para mostrar.</span>}
              {dashboard.productosLentos.map((producto, index) => (
                <div key={`${producto.nombre}-${index}`} className="d-flex justify-content-between">
                  <span>{producto.nombre}</span>
                  <span className="status-badge sb-cancelled">{producto.total_vendido} un.</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-header">Categorías clave</div>
            <div className="card-body d-flex flex-column gap-3">
              <div>
                <div className="stat-card-label">Más vendida</div>
                <strong>{dashboard.categorias?.masVendida?.nombre || "Sin datos"}</strong>
                <div style={{ color: "var(--text-2)", fontSize: 13 }}>
                  Facturación: ${Number(dashboard.categorias?.masVendida?.facturacion || 0).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="stat-card-label">Más rentable</div>
                <strong>{dashboard.categorias?.masRentable?.nombre || "Sin datos"}</strong>
                <div style={{ color: "var(--text-2)", fontSize: 13 }}>
                  Margen: ${Number(dashboard.categorias?.masRentable?.margen || 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-header">Picos por hora</div>
            <div className="card-body d-flex flex-column gap-3">
              {dashboard.ventasPorHora.length === 0 && <span style={{ color: "var(--text-2)" }}>Sin ventas por hora todavia.</span>}
              {dashboard.ventasPorHora.map((fila) => (
                <div key={fila.hora} className="top-product-row">
                  <div className="d-flex justify-content-between">
                    <strong>{fila.hora}:00</strong>
                    <span>${Number(fila.total || 0).toFixed(2)}</span>
                  </div>
                  <div className="top-product-bar">
                    <span style={{ width: `${(Number(fila.total || 0) / maxHora) * 100}%` }}></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reportes;
