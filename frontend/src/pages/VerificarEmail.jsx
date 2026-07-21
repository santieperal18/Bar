import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "../services/axios.config.js";
import "./Login.css";

export default function VerificarEmail() {
  const [params] = useSearchParams(); const [mensaje, setMensaje] = useState("Verificando email...");
  useEffect(() => { const token = params.get("token"); if (!token) { setMensaje("El enlace de verificación no es válido."); return; } axios.post("/auth/verificar-email", { token }).then((r) => setMensaje(r.data.mensaje)).catch((e) => setMensaje(e.response?.data?.error || "No se pudo verificar el email.")); }, [params]);
  return <div className="login-page"><div className="login-grid" /><div className="login-card"><div className="login-header"><h1>Email</h1><p>{mensaje}</p><div className="login-note"><Link to="/login">Ir a iniciar sesión</Link></div></div></div></div>;
}
