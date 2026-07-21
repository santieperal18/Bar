import axios from "./axios.config.js";

const obtener = async () => (await axios.get("/onboarding")).data;
const actualizarNegocio = async (datos) => (await axios.put("/onboarding/negocio", datos)).data;
const guardarMesas = async (cantidad) => (await axios.put("/onboarding/mesas", { cantidad })).data;
const guardarCategorias = async (categorias) => (await axios.post("/onboarding/categorias", { categorias })).data;
const importarProductos = async (productos) => (await axios.post("/onboarding/importar-productos", { productos })).data;
const importarClientes = async (csv) => (await axios.post("/onboarding/importar-clientes", { csv })).data;
const guardarMetodosPago = async (metodos) => (await axios.put("/onboarding/metodos-pago", { metodos })).data;
const guardarImpresoras = async (impresoras) => (await axios.put("/onboarding/impresoras", { impresoras })).data;
const completar = async () => (await axios.post("/onboarding/completar")).data;

export default { obtener, actualizarNegocio, guardarMesas, guardarCategorias, importarProductos, importarClientes, guardarMetodosPago, guardarImpresoras, completar };
