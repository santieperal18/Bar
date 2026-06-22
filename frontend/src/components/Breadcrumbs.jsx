import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Etiquetas legibles por segmento de ruta
const LABELS = {
  pedidos: 'Pedidos',
  clientes: 'Clientes',
  productos: 'Productos',
  repartidores: 'Repartidores',
  reportes: 'Reportes',
  nuevo: 'Nuevo',
  editar: 'Editar',
  duplicar: 'Duplicar',
  cliente: 'Cliente',
};

const esId = (seg) => /^\d+$/.test(seg);

const Breadcrumbs = () => {
  const { pathname } = useLocation();
  const segmentos = pathname.split('/').filter(Boolean);

  // En la raíz del panel (lista de pedidos) no mostramos breadcrumb
  if (segmentos.length === 0) return null;

  // Construye las migas acumulando la ruta; oculta los IDs numéricos
  const crumbs = [];
  let acumulado = '';
  segmentos.forEach((seg) => {
    acumulado += `/${seg}`;
    if (esId(seg)) return; // no mostramos el id crudo como miga
    crumbs.push({ label: LABELS[seg] || seg, to: acumulado });
  });

  return (
    <nav className="breadcrumbs" aria-label="Ruta de navegación">
      <Link to="/pedidos">
        <i className="fas fa-home" aria-hidden="true"></i>
        <span className="visually-hidden"> Inicio</span>
      </Link>
      {crumbs.map((c, i) => {
        const ultimo = i === crumbs.length - 1;
        return (
          <React.Fragment key={c.to}>
            <i className="fas fa-chevron-right bc-sep" aria-hidden="true"></i>
            {ultimo ? (
              <span className="bc-current" aria-current="page">{c.label}</span>
            ) : (
              <Link to={c.to}>{c.label}</Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
