import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../services/axios.config.js";
import "./Login.css";

export default function Registro() {
  const [datos, setDatos] = useState({ restaurante: "", usuario: "", email: "", contrasena: "" });
  const [estado, setEstado] = useState({ cargando: false, error: "", exito: "" });
  const cambiar = (campo) => (e) => setDatos({ ...datos, [campo]: e.target.value });
  const enviar = async (e) => { e.preventDefault(); setEstado({ cargando: true, error: "", exito: "" }); try { const respuesta = await axios.post("/auth/registro", datos); setEstado({ cargando: false, error: "", exito: respuesta.data.mensaje }); } catch (error) { setEstado({ cargando: false, error: error.response?.data?.error || "No se pudo crear la cuenta", exito: "" }); } };
  return <div className="login-page"><div className="login-grid" /><div className="login-card"><div className="login-header"><h1>Crear restaurante</h1><p>Empezá tu espacio de trabajo en Frontbar</p></div><form onSubmit={enviar}>{[["restaurante", "Restaurante", "text"], ["usuario", "Usuario administrador", "text"], ["email", "Email", "email"], ["contrasena", "Contraseña", "password"]].map(([campo, etiqueta, tipo]) => <div className="login-field" key={campo}><label htmlFor={campo}>{etiqueta}</label><input id={campo} type={tipo} value={datos[campo]} onChange={cambiar(campo)} required minLength={campo === "contrasena" ? 12 : undefined} disabled={estado.cargando} /></div>)}<p className="login-note">12+ caracteres, mayúscula, minúscula, número y símbolo.</p>{estado.error && <div className="login-error">{estado.error}</div>}{estado.exito && <div className="login-note">{estado.exito}</div>}<button className="login-btn" disabled={estado.cargando}>{estado.cargando ? "Creando..." : "Crear cuenta"}</button><div className="login-note"><Link to="/login">Volver al inicio de sesión</Link></div></form></div></div>;
}
