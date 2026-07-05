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
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [cargandoCobro, setCargandoCobro] = useState(false);

  const cargar = async () => {
    try {
      const salon = await operacionesService.obtenerSalon();
      setData(salon);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo cargar el salon y caja");
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirMesa = (mesa) => {
    navigate("/pedidos/nuevo", { state: { idMesa: mesa.id, tipoEntrega: "salon", mesaNumero: mesa.numero } });
  };

  const pedirCuenta = async (pedido) => {
    try {
      setError("");
      setInfo("");
      await pedidosService.pedirCuenta(pedido.id);
      setInfo(`La mesa ${pedido.idMesa || ""} paso a pidiendo cuenta.`);
      await cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo marcar la cuenta");
    }
  };

  const iniciarCobro = (pedido) => {
    setError("");
    setInfo("");
    setCobro(pedido);
    setPagos({
      efectivo: Number(pedido.total || 0).toFixed(2),
      tarjeta: "",
      transferencia: ""
    });
    window.requestAnimationFrame(() => {
      document.getElementById("panel-cobro")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const cobrar = async () => {
    try {
      setError("");
      setInfo("");

      if (!data.turnoCaja) {
        setError("Primero tenes que abrir un turno de caja.");
        return;
      }

      const lista = metodos
        .map((metodoPago) => ({ metodoPago, monto: Number(pagos[metodoPago] || 0) }))
        .filter((pago) => pago.monto > 0);

      if (!lista.length) {
        setError("Ingresa al menos un metodo de pago.");
        return;
      }

      setCargandoCobro(true);
      await operacionesService.cobrarPedido(cobro.id, lista);
      setInfo(`Pedido #${cobro.id} cobrado correctamente.`);
      setCobro(null);
      setPagos({ efectivo: "", tarjeta: "", transferencia: "" });
      await cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo cobrar el pedido");
    } finally {
      setCargandoCobro(false);
    }
  };

  const abrirTurno = async () => {
    try {
      setError("");
      setInfo("");
      await operacionesService.abrirTurno(Number(apertura || 0));
      setApertura("");
      setInfo("Turno abierto correctamente.");
      await cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo abrir el turno");
    }
  };

  const cerrarTurno = async () => {
    try {
      setError("");
      setInfo("");
      await operacionesService.cerrarTurno();
      setInfo("Turno cerrado correctamente.");
      await cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo cerrar el turno");
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Salon y Caja</div>
          <div className="page-subtitle">Mapa fijo de mesas, comanda rapida y cierre de turno</div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      {info && (
        <div className="alert alert-success mb-4" role="alert">
          {info}
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-8">
          <div className="card">
            <div className="card-header">Mapa de mesas</div>
            <div className="card-body">
              <div className="mesa-grid">
                {data.mesas?.map((mesa) => (
                  <div
                    key={mesa.id}
                    className={`mesa-card ${mesa.estado}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => !mesa.pedidoActivo && abrirMesa(mesa)}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && !mesa.pedidoActivo) {
                        e.preventDefault();
                        abrirMesa(mesa);
                      }
                    }}
                  >
                    <span className="mesa-numero">Mesa {mesa.numero}</span>
                    <span className={`status-badge ${MESA_STYLES[mesa.estado]}`}>{mesa.estado.replace("_", " ")}</span>
                    {mesa.pedidoActivo ? (
                      <>
                        <div className="mesa-total">${Number(mesa.pedidoActivo.total || 0).toFixed(2)}</div>
                        <div className="mesa-actions">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => navigate(`/pedidos/editar/${mesa.pedidoActivo.id}`)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => pedirCuenta(mesa.pedidoActivo)}
                          >
                            Pedir cuenta
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => iniciarCobro(mesa.pedidoActivo)}
                          >
                            Cobrar
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="mesa-hint">Tocar para abrir comanda</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card h-100">
            <div className="card-header">Caja basica</div>
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
                  <button type="button" className="btn btn-outline-danger" onClick={cerrarTurno}>Cerrar turno</button>
                </>
              ) : (
                <>
                  <p style={{ color: "var(--text-2)", margin: 0 }}>No hay turno abierto. Abri caja para empezar a facturar.</p>
                  <input
                    className="form-control"
                    id="montoApertura"
                    name="montoApertura"
                    value={apertura}
                    onChange={(e) => setApertura(e.target.value)}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Monto de apertura"
                  />
                  <button type="button" className="btn btn-primary" onClick={abrirTurno}>Abrir turno</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {cobro && (
        <div className="card" id="panel-cobro">
          <div className="card-header">Cobrar pedido #{cobro.id}</div>
          <div className="card-body">
            <div className="row g-3 align-items-end">
              {metodos.map((metodo) => (
                <div key={metodo} className="col-12 col-md-4">
                  <label className="form-label" htmlFor={`pago-${metodo}`} style={{ textTransform: "capitalize" }}>{metodo}</label>
                  <input
                    className="form-control"
                    id={`pago-${metodo}`}
                    name={`pago-${metodo}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={pagos[metodo]}
                    onChange={(e) => setPagos((prev) => ({ ...prev, [metodo]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <div className="d-flex justify-content-between align-items-center mt-3">
              <strong>Total a cobrar: ${Number(cobro.total || 0).toFixed(2)}</strong>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setCobro(null)}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={cobrar} disabled={cargandoCobro}>
                  {cargandoCobro ? "Cobrando..." : "Confirmar cobro"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SalonCaja;
