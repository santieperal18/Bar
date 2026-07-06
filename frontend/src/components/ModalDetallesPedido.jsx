import React from 'react';

const ESTADO_CONFIG = {
  pendiente:   { label: 'Pendiente',   cls: 'sb-pending'    },
  preparando:  { label: 'Preparando',  cls: 'sb-preparing'  },
  en_camino:   { label: 'En camino',   cls: 'sb-delivering' },
  entregado:   { label: 'Entregado',   cls: 'sb-delivered'  },
  cancelado:   { label: 'Cancelado',   cls: 'sb-cancelled'  },
};

const ModalDetallesPedido = ({ pedido, abierto, onCerrar }) => {
  if (!abierto || !pedido) return null;

  const ec = ESTADO_CONFIG[pedido.estado] || { label: pedido.estado, cls: 'sb-default' };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onCerrar}
    >
      <div
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 560, boxShadow: '0 24px 64px rgba(0,0,0,0.7)', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="fas fa-receipt" style={{ color: 'var(--accent)', fontSize: 15 }}></i>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-1)' }}>Pedido #{pedido.id}</span>
            <span className={`status-badge ${ec.cls}`}>{ec.label}</span>
          </div>
          <button
            onClick={onCerrar}
            style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>
          {/* Cliente + Fecha */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--text-2)', marginBottom: 4 }}>Cliente</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)' }}>
                {pedido.cliente ? `${pedido.cliente.nombre} ${pedido.cliente.apellido}` : 'Consumidor Final'}
              </div>
              {pedido.cliente?.telefono && (
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 3 }}>
                  <i className="fas fa-phone me-1"></i>{pedido.cliente.telefono}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--text-2)', marginBottom: 4 }}>Fecha y Hora</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)' }}>
                {new Date(pedido.fecha).toLocaleDateString('es-ES')}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>
                {new Date(pedido.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Productos */}
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--text-2)', marginBottom: 10 }}>Productos</div>
          <div style={{ background: 'var(--surface-2)', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Cant.', 'Producto', 'Precio u.', 'Subtotal'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-2)', borderBottom: '1px solid var(--border)', textAlign: i > 1 ? 'right' : 'left' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.isArray(pedido.productos) && pedido.productos.map((prod, index) => {
                  const cant = prod.PedidoProducto?.cantidad || prod.cantidad || 1;
                  const precio = parseFloat(prod.PedidoProducto?.precioUnitario || prod.precio || 0);
                  const guarnicion = prod.PedidoProducto?.guarnicion;
                  return (
                    <tr key={`${prod.id}-${guarnicion || 'sin'}-${index}`}>
                      <td style={{ padding: '10px 14px', color: 'var(--accent)', fontWeight: 700 }}>{cant}×</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-1)', fontWeight: 500 }}>
                        {prod.nombre}
                        {guarnicion && (
                          <div style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 700, marginTop: 2 }}>
                            Guarnicion: {guarnicion}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-2)', textAlign: 'right', fontSize: 13 }}>${precio.toFixed(2)}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-1)', fontWeight: 700, textAlign: 'right' }}>${(cant * precio).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer: tipo + total */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 18px' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--text-2)', marginBottom: 4 }}>Modalidad</div>
              <div style={{ fontWeight: 600, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: 7 }}>
                {pedido.tipoEntrega === 'delivery'
                  ? <><i className="fas fa-motorcycle" style={{ color: 'var(--blue)' }}></i> Delivery</>
                  : <><i className="fas fa-store" style={{ color: 'var(--text-3)' }}></i> Retiro en local</>
                }
              </div>
              {pedido.repartidor && (
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 3 }}>
                  {pedido.repartidor.nombre} {pedido.repartidor.apellido}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--text-2)', marginBottom: 4 }}>Total</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
                ${parseFloat(pedido.total || 0).toFixed(2)}
              </div>
            </div>
          </div>

          {pedido.observaciones && (
            <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-2)', fontStyle: 'italic' }}>
              "{pedido.observaciones}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          <button className="btn btn-outline-secondary w-100" onClick={onCerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetallesPedido;
