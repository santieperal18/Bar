import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import operacionesService from "../services/operaciones.service";
import pedidosService from "../services/pedidos.service";

const MESA_STYLES = {
  libre: "sb-active",
  ocupada: "sb-cancelled",
  pidiendo_cuenta: "sb-delivering"
};

const metodos = ["efectivo", "tarjeta", "transferencia"];

const SalonCaja = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ mesas: [], turnoCaja: null });
  const [apertura, setApertura] = useState("");
  const [cobro, setCobro] = useState(null);
  const [pagos, setPagos] = useState({ efectivo: "", tarjeta: "", transferencia: "" });

  const cargar = async () => {
    const salon = await operacionesService.obtenerSalon();
    setData(salon);
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirMesa = (mesa) => {
    navigate("/pedidos/nuevo", { state: { idMesa: mesa.id, tipoEntrega: "salon", mesaNumero: mesa.numero } });
  };

  const pedirCuenta = async (pedido) => {
    await pedidosService.pedirCuenta(pedido.id);
    await cargar();
  };

  const cobrar = async () => {
    const lista = metodos
      .map((metodoPago) => ({ metodoPago, monto: Number(pagos[metodoPago] || 0) }))
      .filter((pago) => pago.monto > 0);
    await operacionesService.cobrarPedido(cobro.id, lista);
    setCobro(null);
    setPagos({ efectivo: "", tarjeta: "", transferencia: "" });
    await cargar();
  };

  const abrirTurno = async () => {
    await operacionesService.abrirTurno(Number(apertura || 0));
    setApertura("");
    await cargar();
  };

  const cerrarTurno = async () => {
    await operacionesService.cerrarTurno();
    await cargar();
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Salón y Caja</div>
          <div className="page-subtitle">Mapa fijo de mesas, comanda rápida y cierre de turno</div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-8">
          <div className="card">
            <div className="card-header">Mapa de mesas</div>
            <div className="card-body">
              <div className="mesa-grid">
                {data.mesas?.map((mesa) => (
                  <button key={mesa.id} className={`mesa-card ${mesa.estado}`} onClick={() => mesa.pedidoActivo ? null : abrirMesa(mesa)}>
                    <span className="mesa-numero">Mesa {mesa.numero}</span>
                    <span className={`status-badge ${MESA_STYLES[mesa.estado]}`}>{mesa.estado.replace("_", " ")}</span>
                    {mesa.pedidoActivo ? (
                      <>
                        <div className="mesa-total">${Number(mesa.pedidoActivo.total || 0).toFixed(2)}</div>
                        <div className="mesa-actions">
                          <button className="btn btn-sm btn-outline-secondary" onClick={(e) => { e.stopPropagation(); navigate(`/pedidos/editar/${mesa.pedidoActivo.id}`); }}>Editar</button>
                          <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); pedirCuenta(mesa.pedidoActivo); }}>Pedir cuenta</button>
                          <button className="btn btn-sm btn-outline-primary" onClick={(e) => { e.stopPropagation(); setCobro(mesa.pedidoActivo); }}>Cobrar</button>
                        </div>
                      </>
                    ) : (
                      <div className="mesa-hint">Tocar para abrir comanda</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card h-100">
            <div className="card-header">Caja básica</div>
            <div className="card-body d-flex flex-column gap-3">
              {data.turnoCaja ? (
                <>
                  <div className="stat-card stat-accent">
                    <div className="stat-card-label">Turno abierto</div>
                    <div className="stat-card-value">${Number(data.turnoCaja.totalFacturado || 0).toFixed(2)}</div>
                    <div className="stat-card-sub">Apertura: ${Number(data.turnoCaja.montoApertura || 0).toFixed(2)}</div>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    {metodos.map((metodo) => (
                      <div key={metodo} className="d-flex justify-content-between">
                        <span style={{ textTransform: "capitalize" }}>{metodo}</span>
                        <strong>${Number(data.turnoCaja.porMetodo?.[metodo] || 0).toFixed(2)}</strong>
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-outline-danger" onClick={cerrarTurno}>Cerrar turno</button>
                </>
              ) : (
                <>
                  <p style={{ color: "var(--text-2)", margin: 0 }}>No hay turno abierto. Abrí caja para empezar a facturar.</p>
                  <input className="form-control" value={apertura} onChange={(e) => setApertura(e.target.value)} type="number" min="0" step="0.01" placeholder="Monto de apertura" />
                  <button className="btn btn-primary" onClick={abrirTurno}>Abrir turno</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {cobro && (
        <div className="card">
          <div className="card-header">Cobrar pedido #{cobro.id}</div>
          <div className="card-body">
            <div className="row g-3 align-items-end">
              {metodos.map((metodo) => (
                <div key={metodo} className="col-12 col-md-4">
                  <label className="form-label" style={{ textTransform: "capitalize" }}>{metodo}</label>
                  <input className="form-control" type="number" min="0" step="0.01" value={pagos[metodo]} onChange={(e) => setPagos((prev) => ({ ...prev, [metodo]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div className="d-flex justify-content-between align-items-center mt-3">
              <strong>Total a cobrar: ${Number(cobro.total || 0).toFixed(2)}</strong>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary" onClick={() => setCobro(null)}>Cancelar</button>
                <button className="btn btn-primary" onClick={cobrar}>Confirmar cobro</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SalonCaja;
