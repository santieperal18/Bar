import React from 'react';
import './WhatsAppFloat.css';

// Número en formato internacional sin signos (código país + número).
// Cambialo por el número real del negocio.
const WHATSAPP_NUMERO = '543513237878';
const MENSAJE = 'Hola! Quiero hacer un pedido / consultar por el servicio de comida y delivery de La Esquina.';

function WhatsAppFloat({ numero = WHATSAPP_NUMERO, mensaje = MENSAJE }) {
  const href = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

  return (
    <a
      className="wa-float"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      title="Escribinos por WhatsApp"
    >
      <i className="fab fa-whatsapp"></i>
      <span className="wa-float-tooltip">¿Hablamos?</span>
    </a>
  );
}

export default WhatsAppFloat;
