import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import onboardingService from "../services/onboarding.service.js";
import "./Onboarding.css";

const CATEGORIAS = [{ nombre: "Comidas", tipo: "comida" }, { nombre: "Bebidas", tipo: "bebida" }];
const PAGOS = [{ nombre: "Efectivo", tipo: "efectivo" }, { nombre: "Tarjeta", tipo: "tarjeta" }];
const PASOS = [{ clave: "negocio", texto: "Negocio" }, { clave: "operacion", texto: "Operación" }, { clave: "catalogo", texto: "Catálogo" }, { clave: "equipo", texto: "Equipo" }, { clave: "finalizar", texto: "Finalizar" }];

const leerTabla = async (archivo) => {
  const libro = XLSX.read(await archivo.arrayBuffer(), { type: "array" });
  return XLSX.utils.sheet_to_json(libro.Sheets[libro.SheetNames[0]], { defval: "" });
};

const editar = (lista, setLista, indice, campo, valor) => setLista(lista.map((item, i) => i === indice ? { ...item, [campo]: valor } : item));

export default function Onboarding() {
  const navigate = useNavigate();
  const [estado, setEstado] = useState(null);
  const [paso, setPaso] = useState("negocio");
  const [negocio, setNegocio] = useState({});
  const [mesas, setMesas] = useState(0);
  const [categorias, setCategorias] = useState(CATEGORIAS);
  const [pagos, setPagos] = useState(PAGOS);
  const [impresoras, setImpresoras] = useState([]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [tour, setTour] = useState(false);

  const cargar = async () => {
    try {
      const respuesta = await onboardingService.obtener();
      setEstado(respuesta);
      setNegocio(respuesta.restaurante);
      setMesas(respuesta.mesas.length);
      setCategorias(respuesta.categorias.length ? respuesta.categorias : CATEGORIAS);
      setPagos(respuesta.restaurante.metodosPago.length ? respuesta.restaurante.metodosPago : PAGOS);
      setImpresoras(respuesta.restaurante.impresoras);
    } catch (e) { setError(e.response?.data?.error || "No se pudo cargar la puesta en marcha."); }
  };

  useEffect(() => { cargar(); }, []);

  const ejecutar = async (accion, exito) => {
    setGuardando(true); setError(""); setMensaje("");
    try { await accion(); setMensaje(exito); await cargar(); }
    catch (e) { setError(e.response?.data?.error || "No se pudo guardar este paso."); }
    finally { setGuardando(false); }
  };

  const cargarLogo = (archivo) => {
    if (!archivo?.type.startsWith("image/")) return setError("Elegí un archivo de imagen válido.");
    const lector = new FileReader();
    lector.onload = () => setNegocio((actual) => ({ ...actual, logoUrl: lector.result }));
    lector.readAsDataURL(archivo);
  };

  const importarProductos = async (archivo) => {
    try {
      const filas = await leerTabla(archivo);
      await ejecutar(() => onboardingService.importarProductos(filas), `Importación finalizada: ${filas.length} filas procesadas.`);
    } catch { setError("No se pudo leer el archivo. Usá CSV o Excel con las columnas nombre, categoria y precio."); }
  };

  const importarClientes = async (archivo) => {
    try { await ejecutar(() => archivo.text().then(onboardingService.importarClientes), "Clientes importados correctamente."); }
    catch { setError("No se pudo leer el CSV de clientes."); }
  };

  if (!estado) return <div className="page-header"><div><h1>Preparando tu espacio</h1><p>{error || "Cargando configuración inicial..."}</p></div></div>;

  return <section className="onboarding-page">
    <div className="page-header"><div><div className="page-title">Puesta en marcha</div><div className="page-subtitle">Configurá tu restaurante y empezá a vender.</div></div><button type="button" className="btn btn-outline-secondary" onClick={() => setTour(true)}><i className="fas fa-map me-2" />Ver tour</button></div>
    <div className="row g-4"><aside className="col-lg-3"><div className="card"><div className="card-body"><div className="d-grid gap-2">{PASOS.map((item) => <button type="button" key={item.clave} className={`btn onboarding-step-btn ${paso === item.clave ? "is-active" : ""}`} onClick={() => setPaso(item.clave)}>{item.text}</button>)}</div><hr />{estado.pasos.map((item) => <div key={item.clave} className="d-flex gap-2 small mb-2"><i className={`fas ${item.listo ? "fa-check-circle text-success" : "fa-circle text-muted"}`} />{item.titulo}</div>)}</div></div></aside>
    <main className="col-lg-9">{error && <div className="alert alert-danger">{error}</div>}{mensaje && <div className="alert alert-success">{mensaje}</div>}
      {paso === "negocio" && <div className="card"><div className="card-body"><h1 className="h4">Datos comerciales</h1><div className="row g-3 mt-1"><Campo etiqueta="Nombre comercial" valor={negocio.nombre} alCambiar={(v) => setNegocio({ ...negocio, nombre: v })} /><Campo etiqueta="Zona horaria" valor={negocio.zonaHoraria} alCambiar={(v) => setNegocio({ ...negocio, zonaHoraria: v })} /><div className="col-md-4"><label className="form-label">Moneda</label><select className="form-select" value={negocio.moneda || "ARS"} onChange={(e) => setNegocio({ ...negocio, moneda: e.target.value })}><option value="ARS">ARS</option><option value="USD">USD</option><option value="UYU">UYU</option></select></div><div className="col-md-4"><label className="form-label">País</label><select className="form-select" value={negocio.pais || "AR"} onChange={(e) => setNegocio({ ...negocio, pais: e.target.value })}><option value="AR">Argentina</option><option value="UY">Uruguay</option><option value="CL">Chile</option></select></div><Campo etiqueta="Impuesto (%)" tipo="number" valor={negocio.porcentajeImpuesto} alCambiar={(v) => setNegocio({ ...negocio, porcentajeImpuesto: v })} /><Campo etiqueta="Razón social" valor={negocio.razonSocial} alCambiar={(v) => setNegocio({ ...negocio, razonSocial: v })} /><Campo etiqueta="CUIT / Identificación fiscal" valor={negocio.identificacionFiscal} alCambiar={(v) => setNegocio({ ...negocio, identificacionFiscal: v })} /><Campo etiqueta="Email comercial" tipo="email" valor={negocio.emailComercial} alCambiar={(v) => setNegocio({ ...negocio, emailComercial: v })} /><Campo etiqueta="Teléfono" valor={negocio.telefono} alCambiar={(v) => setNegocio({ ...negocio, telefono: v })} /><div className="col-md-6"><label className="form-label">Logo</label><input className="form-control" type="file" accept="image/*" onChange={(e) => cargarLogo(e.target.files[0])} /></div></div><button type="button" className="btn btn-primary mt-4" disabled={guardando} onClick={() => ejecutar(() => onboardingService.actualizarNegocio(negocio), "Datos comerciales guardados.")}>Guardar datos</button></div></div>}
      {paso === "operacion" && <div className="d-grid gap-4"><div className="card"><div className="card-body"><h1 className="h4">Mesas</h1><p className="text-muted">Hay {estado.mesas.length} mesas activas. Al reducir el número se eliminan únicamente mesas libres y sin pedidos.</p><div className="input-group" style={{ maxWidth: 320 }}><input type="number" min="0" max="250" className="form-control" value={mesas} onChange={(e) => setMesas(e.target.value)} /><button type="button" className="btn btn-primary" disabled={guardando} onClick={() => ejecutar(() => onboardingService.guardarMesas(mesas), "Mesas configuradas.")}>Guardar</button></div></div></div><Lista titulo="Métodos de pago" items={pagos} setItems={setPagos} campos={["nombre", "tipo"]} opciones={{ tipo: ["efectivo", "tarjeta", "transferencia", "billetera"] }} alGuardar={() => onboardingService.guardarMetodosPago(pagos)} ejecutar={ejecutar} guardando={guardando} texto="Métodos de pago guardados." /><Lista titulo="Impresoras" items={impresoras} setItems={setImpresoras} campos={["nombre", "destino"]} opciones={{ destino: ["cocina", "caja", "barra"] }} alGuardar={() => onboardingService.guardarImpresoras(impresoras)} ejecutar={ejecutar} guardando={guardando} texto="Impresoras guardadas." /></div>}
      {paso === "catalogo" && <div className="d-grid gap-4"><Lista titulo="Categorías" items={categorias} setItems={setCategorias} campos={["nombre", "tipo"]} opciones={{ tipo: ["comida", "bebida", "desayuno"] }} alGuardar={() => onboardingService.guardarCategorias(categorias)} ejecutar={ejecutar} guardando={guardando} texto="Categorías guardadas." /><Archivo titulo="Importar productos" ayuda="CSV o Excel: nombre, categoria, precio, precioSalon, costo y stockActual." aceptar=".csv,.xlsx,.xls" alCambiar={importarProductos} /><Archivo titulo="Importar clientes" ayuda="CSV con nombre, apellido, teléfono y email." aceptar=".csv,text/csv" alCambiar={importarClientes} /></div>}
      {paso === "equipo" && <div className="card"><div className="card-body"><h1 className="h4">Creá tu equipo</h1><p className="text-muted">Definí directamente usuarios, contraseñas iniciales y permisos para cada integrante.</p><Link className="btn btn-primary" to="/usuarios">Gestionar usuarios</Link></div></div>}
      {paso === "finalizar" && <div className="card"><div className="card-body"><h1 className="h4">Todo listo para empezar</h1><p className="text-muted">Podés volver a esta configuración desde el menú cuando lo necesites.</p><button type="button" className="btn btn-primary" disabled={guardando} onClick={() => ejecutar(async () => { await onboardingService.completar(); setTour(true); }, "Configuración inicial completada.")}>Finalizar puesta en marcha</button></div></div>}
    </main></div>{tour && <Tour cerrar={() => setTour(false)} irAVender={() => navigate("/salon")} />}</section>;
}

function Campo({ etiqueta, valor, alCambiar, tipo = "text" }) { return <div className="col-md-6"><label className="form-label">{etiqueta}</label><input className="form-control" type={tipo} value={valor ?? ""} onChange={(e) => alCambiar(e.target.value)} /></div>; }
function Archivo({ titulo, ayuda, aceptar, alCambiar }) { return <div className="card"><div className="card-body"><h1 className="h4">{titulo}</h1><p className="text-muted">{ayuda}</p><input className="form-control" type="file" accept={aceptar} onChange={(e) => e.target.files[0] && alCambiar(e.target.files[0])} /></div></div>; }
function Lista({ titulo, items, setItems, campos, opciones, alGuardar, ejecutar, guardando, texto }) { const agregar = () => setItems([...items, Object.fromEntries(campos.map((campo) => [campo, opciones[campo]?.[0] || ""]))]); return <div className="card"><div className="card-body"><h1 className="h4">{titulo}</h1>{items.map((item, indice) => <div className="row g-2 mb-2" key={item.id || indice}>{campos.map((campo) => <div className="col" key={campo}>{opciones[campo] ? <select className="form-select" value={item[campo] || opciones[campo][0]} onChange={(e) => editar(items, setItems, indice, campo, e.target.value)}>{opciones[campo].map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}</select> : <input className="form-control" placeholder={campo} value={item[campo] || ""} onChange={(e) => editar(items, setItems, indice, campo, e.target.value)} />}</div>)}</div>)}<button type="button" className="btn btn-light me-2" onClick={agregar}>Agregar</button><button type="button" className="btn btn-primary" disabled={guardando} onClick={() => ejecutar(alGuardar, texto)}>Guardar</button></div></div>; }
function Tour({ cerrar, irAVender }) { return <div className="modal-backdrop show" style={{ display: "block" }}><div className="modal d-block" tabIndex="-1"><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className="modal-header"><h2 className="modal-title h5">Recorrido rápido</h2><button type="button" className="btn-close" onClick={cerrar} /></div><div className="modal-body"><p><strong>Salón y Caja:</strong> abrí el turno, tomá pedidos y registrá cobros.</p><p><strong>Cocina:</strong> seguí las comandas y avanzá sus estados.</p><p><strong>Backoffice:</strong> revisá ventas, productos y reportes.</p></div><div className="modal-footer"><button type="button" className="btn btn-light" onClick={cerrar}>Quedarme aquí</button><button type="button" className="btn btn-primary" onClick={irAVender}>Ir a vender</button></div></div></div></div></div>; }
