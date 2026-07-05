import { useEffect, useState } from "react";
import reportesService from "../services/reportes.service";

const Reportes = () => {
  const [dashboard, setDashboard] = useState({
    facturacionHoy: 0,
    facturacionAyer: 0,
    variacionFacturacion: 0,
    ticketPromedio: 0,
    topProductos: []
  });

  useEffect(() => {
    reportesService.obtenerDashboardSupervivencia().then(setDashboard);
  }, []);

  const maxVentas = Math.max(...dashboard.topProductos.map((producto) => Number(producto.total_vendido || 0)), 1);

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard de Supervivencia</div>
          <div className="page-subtitle">Facturación del día, ticket promedio y top de ventas</div>
        </div>
      </div>

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

      <div className="card">
        <div className="card-header">Top 5 productos más vendidos</div>
        <div className="card-body d-flex flex-column gap-3">
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
          {dashboard.topProductos.length === 0 && (
            <div className="empty-state">
              <p>Aún no hay ventas para mostrar.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Reportes;
