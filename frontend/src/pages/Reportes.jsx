import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import reportesService from "../services/reportes.service";
import clientesService from "../services/clientes.service";
import ModalInformes from "../components/ModalInformes";

const Reportes = ({ clienteId }) => {
  const { id } = useParams();
  
  const [resumenHoy, setResumenHoy] = useState({ total: 0, cantidad: 0 });
  const [productosTopHoy, setProductosTopHoy] = useState([]);
  const [desempenoRepartidores, setDesempenoRepartidores] = useState([]);
  const [clientes, setClientes] = useState([]);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tipoReporte, setTipoReporte] = useState("");
  const [parametrosReporte, setParametrosReporte] = useState({});

  useEffect(() => {
    cargarDatosGenerales();
    if (clienteId || id) abrirModalReporte("cliente", { idCliente: id || clienteId });
  }, [id, clienteId]);

  const cargarDatosGenerales = async () => {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const [clientesData, reporteHoy, topProd, topRepartidores] = await Promise.all([
        clientesService.obtenerTodos(),
        reportesService.obtenerVentasDiarias(hoy),
        reportesService.obtenerProductosMasVendidos(hoy, hoy, 5),
        reportesService.obtenerDesempenoRepartidores(hoy)
      ]);

      setClientes(Array.isArray(clientesData) ? clientesData : []);
      setResumenHoy({ total: reporteHoy?.totalVentas || 0, cantidad: reporteHoy?.cantidadPedidos || 0 });
      setProductosTopHoy(Array.isArray(topProd) ? topProd : []);
      setDesempenoRepartidores(Array.isArray(topRepartidores) ? topRepartidores : []);
    } catch (error) { console.error(error); }
  };

  const abrirModalReporte = (tipo, params = {}) => {
    setTipoReporte(tipo); setParametrosReporte(params); setModalAbierto(true);
  };

  return (
    <div className="container-fluid py-4 fade-in">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-0">Centro de Reportes</h2>
        <p className="text-muted small">Métricas del día y exportación de documentos</p>
      </div>

      {/* Zona 1: KPIs y Acciones Principales */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-xl-4">
          <div className="card bg-primary text-white border-0 shadow-sm h-100 p-3">
            <div className="card-body d-flex flex-column justify-content-center">
              <h6 className="text-uppercase fw-bold opacity-75 mb-3">Facturación de Hoy</h6>
              <h1 className="display-4 fw-bold mb-0">${resumenHoy.total.toFixed(2)}</h1>
              <div className="mt-3 bg-white bg-opacity-25 rounded p-2 d-inline-block w-auto">
                <i className="fas fa-shopping-bag me-2"></i>{resumenHoy.cantidad} órdenes procesadas
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm h-100 p-3">
            <h6 className="text-uppercase fw-bold text-muted mb-4">Exportar Balances PDF</h6>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <button className="btn btn-light border w-100 py-4 h-100 text-dark hover-primary smooth-transition" onClick={() => abrirModalReporte('diario')}>
                  <i className="fas fa-calendar-day fs-2 mb-2 text-primary d-block"></i>
                  <span className="fw-bold">Cierre Diario</span>
                </button>
              </div>
              <div className="col-12 col-md-4">
                <button className="btn btn-light border w-100 py-4 h-100 text-dark hover-primary smooth-transition" onClick={() => abrirModalReporte('semanal')}>
                  <i className="fas fa-calendar-week fs-2 mb-2 text-primary d-block"></i>
                  <span className="fw-bold">Balance Semanal</span>
                </button>
              </div>
              <div className="col-12 col-md-4">
                <button className="btn btn-light border w-100 py-4 h-100 text-dark hover-primary smooth-transition" onClick={() => abrirModalReporte('mensual')}>
                  <i className="fas fa-calendar-alt fs-2 mb-2 text-primary d-block"></i>
                  <span className="fw-bold">Resumen Mensual</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zona 2: Métricas en Detalle (Grilla modular) */}
      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-4 pb-0">
              <h6 className="fw-bold text-dark"><i className="fas fa-fire text-danger me-2"></i>Productos Estrella</h6>
            </div>
            <div className="card-body">
              {productosTopHoy.length > 0 ? productosTopHoy.map((p, i) => (
                <div key={i} className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                  <span className="fw-bold text-muted">{i+1}. {p.nombre}</span>
                  <span className="badge bg-success rounded-pill">{p.total_vendido} un.</span>
                </div>
              )) : <p className="text-muted text-center mt-4">Aún no hay ventas registradas hoy.</p>}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
             <div className="card-header bg-white border-0 pt-4 pb-0">
              <h6 className="fw-bold text-dark"><i className="fas fa-motorcycle text-primary me-2"></i>Top Repartidores</h6>
            </div>
            <div className="card-body">
              {desempenoRepartidores.length > 0 ? desempenoRepartidores.map((r, i) => (
                <div key={i} className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                  <span className="fw-bold text-muted">{r.nombre} {r.apellido}</span>
                  <span className="badge bg-primary rounded-pill">{r.cantidad_entregas} viajes</span>
                </div>
              )) : <p className="text-muted text-center mt-4">No hay despachos de delivery.</p>}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
             <div className="card-header bg-white border-0 pt-4 pb-0">
              <h6 className="fw-bold text-dark"><i className="fas fa-id-card text-info me-2"></i>Ficha de Cliente</h6>
            </div>
            <div className="card-body d-flex flex-column justify-content-center">
              <label htmlFor="selector-cliente" className="form-label text-muted small">Generar historial de consumos</label>
              <select id="selector-cliente" className="form-select bg-light py-3" onChange={(e) => {
                  if(e.target.value) abrirModalReporte('cliente', { idCliente: e.target.value });
              }}>
                <option value="">Buscar cliente en base de datos...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <ModalInformes abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} tipoReporte={tipoReporte} parametrosIniciales={parametrosReporte} />
    </div>
  );
};

export default Reportes;
