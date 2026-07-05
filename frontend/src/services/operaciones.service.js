import axios from "./axios.config.js";

const obtenerSalon = async () => (await axios.get("/operaciones/salon")).data;
const actualizarMesa = async (id, estado) => (await axios.patch(`/operaciones/salon/mesas/${id}`, { estado })).data;
const obtenerCocina = async () => (await axios.get("/operaciones/cocina")).data;
const avanzarCocina = async (id) => (await axios.patch(`/operaciones/cocina/${id}/avanzar`)).data;
const obtenerTurno = async () => (await axios.get("/operaciones/caja/turno")).data;
const abrirTurno = async (montoApertura) => (await axios.post("/operaciones/caja/turno", { montoApertura })).data;
const cerrarTurno = async () => (await axios.post("/operaciones/caja/turno/cerrar")).data;
const cobrarPedido = async (id, pagos) => (await axios.post(`/operaciones/caja/pedidos/${id}/cobrar`, { pagos })).data;

export default {
  obtenerSalon,
  actualizarMesa,
  obtenerCocina,
  avanzarCocina,
  obtenerTurno,
  abrirTurno,
  cerrarTurno,
  cobrarPedido
};
