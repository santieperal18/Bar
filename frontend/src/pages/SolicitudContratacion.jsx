import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { crearSolicitud } from '../services/solicitudes.service';
import WhatsAppFloat from '../components/WhatsAppFloat';
import './SolicitudContratacion.css';

const PAISES = [
  'Argentina', 'Uruguay', 'Chile', 'Paraguay', 'Bolivia', 'Perú',
  'Colombia', 'Ecuador', 'México', 'España', 'Otro',
];

const TIPOS_NEGOCIO = [
  'Resto bar', 'Restaurante', 'Bar', 'Cafetería', 'Food truck',
  'Panadería', 'Delivery / Dark kitchen', 'Otro',
];

const ESTADO_INICIAL = {
  nombre: '',
  email: '',
  telefono: '',
  empresa: '',
  pais: '',
  tipo_negocio: '',
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
    if (!form.empresa.trim()) return 'Ingresá el nombre de tu local o empresa.';
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
        telefono: form.telefono.trim() || null,
        empresa: form.empresa.trim(),
        pais: form.pais || null,
        tipo_negocio: form.tipo_negocio || null,
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
              Gracias, <strong>{form.nombre.split(' ')[0]}</strong>. Recibimos tus
              datos y nuestro equipo se va a poner en contacto a la brevedad.
            </p>
            <Link to="/" className="sol-btn">Volver al inicio</Link>
          </div>
        ) : (
          <>
            <header className="sol-head">
              <span className="sol-brand-icon">
                <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="La Esquina" />
              </span>
              <h1>Sumá tu local</h1>
              <p>
                Contanos un poco sobre tu negocio y activamos el sistema de gestión
                para tu local. Solo te pedimos lo esencial.
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
                  <label htmlFor="telefono">Teléfono / WhatsApp</label>
                  <input
                    id="telefono" name="telefono" type="tel" autoComplete="tel"
                    placeholder="+54 9 ..."
                    value={form.telefono} onChange={handleChange}
                  />
                </div>
              </div>

              <div className="sol-field">
                <label htmlFor="empresa">Nombre del local o empresa *</label>
                <input
                  id="empresa" name="empresa" type="text"
                  placeholder="Ej: Resto Bar La Esquina"
                  value={form.empresa} onChange={handleChange}
                />
              </div>

              <div className="sol-row">
                <div className="sol-field">
                  <label htmlFor="pais">País</label>
                  <select id="pais" name="pais" value={form.pais} onChange={handleChange}>
                    <option value="">Seleccionar país...</option>
                    {PAISES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="sol-field">
                  <label htmlFor="tipo_negocio">Tipo de negocio</label>
                  <select id="tipo_negocio" name="tipo_negocio" value={form.tipo_negocio} onChange={handleChange}>
                    <option value="">Seleccionar...</option>
                    {TIPOS_NEGOCIO.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="sol-field">
                <label htmlFor="mensaje">Mensaje (opcional)</label>
                <textarea
                  id="mensaje" name="mensaje" rows="3"
                  placeholder="Contanos qué necesitás..."
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
