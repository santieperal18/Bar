import React, { useState } from 'react';
import reportesService from '../services/reportes.service';

const ModalInformes = ({ abierto, onCerrar, tipoReporte, parametrosIniciales }) => {
  const [cargando, setCargando] = useState(false);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());

  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  const descargar = async () => {
    try {
      setCargando(true);
      let params = {};
      if (tipoReporte === 'diario')  params = { fecha };
      if (tipoReporte === 'semanal') params = { fechaInicio: fecha };
      if (tipoReporte === 'mensual') params = { anio, mes };
      if (tipoReporte === 'cliente') params = parametrosIniciales;

      const blob = await reportesService.generarPDF(tipoReporte, params);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte-${tipoReporte}-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Error al generar el PDF.');
    } finally { setCargando(false); }
  };

  if (!abierto) return null;

  const TITULOS = { diario: 'Cierre Diario', semanal: 'Balance Semanal', mensual: 'Resumen Mensual', cliente: 'Historial de Cliente' };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onCerrar}
    >
      <div
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 440, boxShadow: '0 24px 64px rgba(0,0,0,0.7)', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="fas fa-file-pdf" style={{ color: 'var(--accent)', fontSize: 15 }}></i>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-1)' }}>
              {TITULOS[tipoReporte] || 'Reporte'}
            </span>
          </div>
          <button
            onClick={onCerrar}
            style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20 }}>
            Configurá los parámetros para generar el documento PDF.
          </p>

          {(tipoReporte === 'diario' || tipoReporte === 'semanal') && (
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">
                {tipoReporte === 'semanal' ? 'Semana desde' : 'Fecha'}
              </label>
              <input type="date" className="form-control" value={fecha} onChange={e => setFecha(e.target.value)} />
            </div>
          )}

          {tipoReporte === 'mensual' && (
            <div className="row g-2">
              <div className="col-7">
                <label className="form-label">Mes</label>
                <select className="form-select" value={mes} onChange={e => setMes(e.target.value)}>
                  {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div className="col-5">
                <label className="form-label">Año</label>
                <input type="number" className="form-control" value={anio} onChange={e => setAnio(e.target.value)} min="2020" max="2099" />
              </div>
            </div>
          )}

          {tipoReporte === 'cliente' && (
            <div style={{ padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-2)' }}>
              <i className="fas fa-user me-2" style={{ color: 'var(--accent)' }}></i>
              Generando historial para cliente ID: <strong style={{ color: 'var(--text-1)' }}>{parametrosIniciales?.idCliente}</strong>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface-2)', display: 'flex', gap: 10 }}>
          <button className="btn btn-outline-secondary" onClick={onCerrar} disabled={cargando}>
            Cancelar
          </button>
          <button className="btn btn-primary flex-grow-1" onClick={descargar} disabled={cargando}>
            {cargando
              ? <><span className="spinner-border spinner-border-sm"></span> Generando…</>
              : <><i className="fas fa-download"></i> Descargar PDF</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalInformes;
