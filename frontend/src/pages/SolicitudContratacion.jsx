import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { crearSolicitud } from '../services/solicitudes.service';
import WhatsAppFloat from '../components/WhatsAppFloat';
import './SolicitudContratacion.css';

const TIPOS_SERVICIO = [
  'Delivery a domicilio',
  'Catering para eventos',
  'Comida para empresas / viandas',
  'Reserva de mesa',
  'Otro',
];

const ESTADO_INICIAL = {
  nombre: '',
  email: '',
  telefono: '',
  tipo_servicio: '',
  zona: '',
  mensaje: '',
};

function SolicitudContratacion() {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validar = () => {
    if (!form.nombre.trim()) return 'Ingresá tu nombre.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Ingresá un email válido.';
    if (!form.telefono.trim()) return 'Ingresá un teléfono o WhatsApp de contacto.';
    if (!form.tipo_servicio) return 'Elegí el tipo de servicio que necesitás.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = validar();
    if (msg) { setError(msg); return; }

    setError('');
    setEnviando(true);
    try {
      await crearSolicitud({
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim(),
        tipo_servicio: form.tipo_servicio,
        zona: form.zona.trim() || null,
        mensaje: form.mensaje.trim() || null,
      });
      setEnviado(true);
    } catch (err) {
      console.error('Error al guardar la solicitud:', err);
      setError('No pudimos enviar tu solicitud. Probá de nuevo o escribinos por WhatsApp.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="solicitud" data-bs-theme="light">
      <div className="sol-card">
        <Link to="/" className="sol-back">
          <i className="fas fa-arrow-left"></i> Volver
        </Link>

        {enviado ? (
          <div className="sol-success">
            <div className="sol-success-icon"><i className="fas fa-check"></i></div>
            <h1>¡Solicitud enviada!</h1>
            <p>
              Gracias, <strong>{form.nombre.split(' ')[0]}</strong>. Recibimos tu
              pedido y nos vamos a comunicar a la brevedad para coordinar todo.
            </p>
            <Link to="/" className="sol-btn">Volver al inicio</Link>
          </div>
        ) : (
          <>
            <header className="sol-head">
              <span className="sol-brand-icon">
                <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="La Esquina" />
              </span>
              <h1>Solicitá nuestro servicio</h1>
              <p>
                Delivery, catering o comida para tu empresa: contanos qué
                necesitás y coordinamos tu pedido. Solo te pedimos lo esencial.
              </p>
            </header>

            <form className="sol-form" onSubmit={handleSubmit} noValidate>
              <div className="sol-field">
                <label htmlFor="nombre">Nombre y apellido *</label>
                <input
                  id="nombre" name="nombre" type="text" autoComplete="name"
                  placeholder="Ej: Juan Pérez"
                  value={form.nombre} onChange={handleChange}
                />
              </div>

              <div className="sol-row">
                <div className="sol-field">
                  <label htmlFor="email">Email *</label>
                  <input
                    id="email" name="email" type="email" autoComplete="email"
                    placeholder="tucorreo@ejemplo.com"
                    value={form.email} onChange={handleChange}
                  />
                </div>
                <div className="sol-field">
                  <label htmlFor="telefono">Teléfono / WhatsApp *</label>
                  <input
                    id="telefono" name="telefono" type="tel" autoComplete="tel"
                    placeholder="+54 9 ..."
                    value={form.telefono} onChange={handleChange}
                  />
                </div>
              </div>

              <div className="sol-row">
                <div className="sol-field">
                  <label htmlFor="tipo_servicio">Tipo de servicio *</label>
                  <select id="tipo_servicio" name="tipo_servicio" value={form.tipo_servicio} onChange={handleChange}>
                    <option value="">Seleccionar...</option>
                    {TIPOS_SERVICIO.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="sol-field">
                  <label htmlFor="zona">Zona / dirección de entrega</label>
                  <input
                    id="zona" name="zona" type="text"
                    placeholder="Barrio o dirección"
                    value={form.zona} onChange={handleChange}
                  />
                </div>
              </div>

              <div className="sol-field">
                <label htmlFor="mensaje">Detalle del pedido (opcional)</label>
                <textarea
                  id="mensaje" name="mensaje" rows="3"
                  placeholder="Contanos qué querés pedir, fecha, cantidad de personas..."
                  value={form.mensaje} onChange={handleChange}
                />
              </div>

              {error && (
                <div className="sol-error">
                  <i className="fas fa-circle-exclamation"></i> {error}
                </div>
              )}

              <button type="submit" className="sol-btn" disabled={enviando}>
                {enviando
                  ? <><span className="sol-spinner"></span> Enviando...</>
                  : <><i className="fas fa-paper-plane"></i> Enviar solicitud</>}
              </button>

              <p className="sol-legal">
                Al enviar aceptás que nos pongamos en contacto con vos. No compartimos tus datos.
              </p>
            </form>
          </>
        )}
      </div>

      <WhatsAppFloat />
    </div>
  );
}

export default SolicitudContratacion;
