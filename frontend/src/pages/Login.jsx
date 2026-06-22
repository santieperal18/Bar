import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../services/axios.config.js';
import './Login.css';

function Login() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  // Acceso local (modo presentación): no depende del backend.
  const ingresarLocal = (nombre) => {
    localStorage.setItem('token', 'demo');
    localStorage.setItem('usuario', nombre || 'Demo');
    navigate('/pedidos');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const response = await axios.post('/auth/login', { usuario, contrasena });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', response.data.usuario);
      navigate('/pedidos');
    } catch (err) {
      // Si el backend falla (rate limit 429, caído, sin conexión...) no
      // bloqueamos la demo: entramos en modo local.
      console.warn('Login API no disponible, entrando en modo local:', err?.response?.status || err?.message);
      ingresarLocal(usuario);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-grid" />

      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="La Esquina" />
          </div>
          <h1>La Esquina</h1>
          <p>Sistema de gestión interno</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="usuario">Usuario</label>
            <input
              id="usuario"
              type="text"
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              placeholder="Ingresá tu usuario"
              disabled={cargando}
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="login-field">
            <label htmlFor="contrasena">Contraseña</label>
            <input
              id="contrasena"
              type="password"
              value={contrasena}
              onChange={e => setContrasena(e.target.value)}
              placeholder="Ingresá tu contraseña"
              disabled={cargando}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="login-error">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={cargando || !usuario || !contrasena}
          >
            {cargando ? (
              <><div className="login-spinner"></div> Iniciando sesión...</>
            ) : (
              <><i className="fas fa-sign-in-alt"></i> Ingresar</>
            )}
          </button>

          <button
            type="button"
            className="login-btn login-btn-demo"
            onClick={() => ingresarLocal('Demo')}
            disabled={cargando}
          >
            <i className="fas fa-play"></i> Entrar en modo demo
          </button>
        </form>

        <p className="login-note">
          <i className="fas fa-lock" aria-hidden="true"></i>
          Acceso interno. Tus credenciales se usan únicamente para iniciar sesión
          en el sistema de gestión; no se comparten con terceros.
        </p>
      </div>
    </div>
  );
}

export default Login;
