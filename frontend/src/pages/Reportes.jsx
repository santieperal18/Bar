import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import reportesService from "../services/reportes.service";
import clientesService from "../services/clientes.service";
import ModalInformes from "../components/ModalInformes";

const Reportes = ({ clienteId }) => {
  const { id } = useParams();

  const [resumenHoy, setResumenHoy] = useState({ total: 0, cantidad: 0 });
  const [productosTop, setProductosTop] = useState([]);
  const [repartidoresTop, setRepartidoresTop] = useState([]);
  const [clientes, setClientes] = useState([]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [tipoReporte, setTipoReporte] = useState("");
  const [paramsReporte, setParamsReporte] = useState({});

  useEffect(() => {
    cargarDatos();
    if (clienteId || id) abrirModal("cliente", { idCliente: id || clienteId });
  }, [id, clienteId]);

  const cargarDatos = async () => {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const [clis, reporteHoy, top, reps] = await Promise.all([
        clientesService.obtenerTodos(),
        reportesService.obtenerVentasDiarias(hoy),
        reportesService.obtenerProductosMasVendidos(hoy, hoy, 5),
        reportesService.obtenerDesempenoRepartidores(hoy)
      ]);
      setClientes(Array.isArray(clis) ? clis : []);
      setResumenHoy({ total: reporteHoy?.totalVentas || 0, cantidad: reporteHoy?.cantidadPedidos || 0 });
      setProductosTop(Array.isArray(top) ? top : []);
      setRepartidoresTop(Array.isArray(reps) ? reps : []);
    } catch (e) { console.error(e); }
  };

  const abrirModal = (tipo, params = {}) => {
    setTipoReporte(tipo);
    setParamsReporte(params);
    setModalAbierto(true);
  };

  const EXPORT_OPTS = [
    { tipo: 'diario',   icon: 'fa-calendar-day',  label: 'Cierre Diario'    },
    { tipo: 'semanal',  icon: 'fa-calendar-week', label: 'Balance Semanal'  },
    { tipo: 'mensual',  icon: 'fa-calendar-alt',  label: 'Resumen Mensual'  },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Reportes</div>
          <div className="page-subtitle">Métricas del día y exportación de balances</div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <div className="stat-card stat-accent" style={{ padding: '24px 24px' }}>
            <div className="stat-card-label">Facturación de hoy</div>
            <div className="stat-card-value" style={{ fontSize: 42 }}>${resumenHoy.total.toFixed(2)}</div>
            <div className="stat-card-sub">
              <i className="fas fa-receipt me-1"></i> {resumenHoy.cantidad} órdenes procesadas
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="card" style={{ height: '100%' }}>
            <div className="card-body">
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-2)', marginBottom: 14 }}>
                Exportar balances PDF
              </div>
              <div className="row g-2">
                {EXPORT_OPTS.map(opt => (
                  <div key={opt.tipo} className="col-4">
                    <button
                      className="btn btn-outline-secondary w-100 d-flex flex-column align-items-center"
                      style={{ gap: 8, padding: '14px 8px', minHeight: 80 }}
                      onClick={() => abrirModal(opt.tipo)}
                    >
                      <i className={`fas ${opt.icon}`} style={{ fontSize: 20, color: 'var(--accent)' }}></i>
                      <span style={{ fontSize: 12 }}>{opt.label}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="row g-3">
        {/* Top Productos */}
        <div className="col-12 col-lg-4">
          <div className="card h-100">
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fas fa-fire" style={{ color: 'var(--red)' }}></i>
              Productos estrella hoy
            </div>
            <div className="card-body" style={{ padding: '12px 16px' }}>
              {productosTop.length > 0 ? productosTop.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < productosTop.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 20, height: 20, background: 'var(--surface-3)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-2)', flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontWeight: 500, fontSize: 13 }}>{p.nombre}</span>
                  </div>
                  <span className="status-badge sb-delivered">{p.total_vendido} un.</span>
                </div>
              )) : (
                <div className="empty-state" style={{ padding: '32px 0' }}>
                  <i className="fas fa-chart-bar"></i>
                  <p>Aún no hay ventas hoy.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Repartidores */}
        <div className="col-12 col-lg-4">
          <div className="card h-100">
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fas fa-motorcycle" style={{ color: 'var(--blue)' }}></i>
              Top repartidores hoy
            </div>
            <div className="card-body" style={{ padding: '12px 16px' }}>
              {repartidoresTop.length > 0 ? repartidoresTop.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < repartidoresTop.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 20, height: 20, background: 'var(--surface-3)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-2)', flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontWeight: 500, fontSize: 13 }}>{r.nombre} {r.apellido}</span>
                  </div>
                  <span className="status-badge sb-preparing">{r.cantidad_entregas} viajes</span>
                </div>
              )) : (
                <div className="empty-state" style={{ padding: '32px 0' }}>
                  <i className="fas fa-motorcycle"></i>
                  <p>Sin entregas de delivery hoy.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ficha de cliente */}
        <div className="col-12 col-lg-4">
          <div className="card h-100">
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fas fa-id-card" style={{ color: 'var(--purple)' }}></i>
              Historial de cliente
            </div>
            <div className="card-body d-flex flex-column justify-content-center" style={{ padding: '20px' }}>
              <label className="form-label mb-2">Seleccioná un cliente para generar su reporte</label>
              <select
                className="form-select"
                onChange={e => { if (e.target.value) abrirModal('cliente', { idCliente: e.target.value }); }}
                defaultValue=""
              >
                <option value="">Elegir cliente…</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <ModalInformes
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        tipoReporte={tipoReporte}
        parametrosIniciales={paramsReporte}
      />
    </>
  );
};

export default Reportes;
