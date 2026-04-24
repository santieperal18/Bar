import axios from "./axios.config.js";

const obtenerTodos = async () => {
  const response = await axios.get("/repartidores");
  
  // Imprimimos la verdad en la consola (Apretá F12 para ver esto)
  console.log("🕵️ MODO DETECTIVE - Respuesta cruda:", response);

  // Escudo Triple: Buscamos el Array donde sea que se haya escondido
  if (Array.isArray(response)) return response; // Si axios.config ya lo limpió
  if (Array.isArray(response.data)) return response.data; // Lo estándar
  if (Array.isArray(response.data?.data)) return response.data.data; // Si el back lo envolvió
  if (Array.isArray(response.data?.repartidores)) return response.data.repartidores; // Si el back le puso nombre

  // Si llega acá, es porque no mandó ninguna lista.
  return []; 
};

const obtenerDisponibles = async () => {
  const response = await axios.get("/repartidores/disponibles");
  return response.data;
};

const obtenerPorId = async (id) => {
  const response = await axios.get(`/repartidores/${id}`);
  return response.data;
};

const buscarPorNombre = async (nombre) => {
  const response = await axios.get(`/repartidores/buscar/${nombre}`);
  return response.data;
};

const crear = async (repartidor) => {
  const response = await axios.post("/repartidores", repartidor);
  return response.data;
};

const actualizar = async (id, repartidor) => {
  const response = await axios.put(`/repartidores/${id}`, repartidor);
  return response.data;
};

const eliminar = async (id) => {
  await axios.delete(`/repartidores/${id}`);
};

export default {
  obtenerTodos,
  obtenerDisponibles,
  obtenerPorId,
  buscarPorNombre,
  crear,
  actualizar,
  eliminar
};
