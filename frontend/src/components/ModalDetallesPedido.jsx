import React from 'react';

const ModalDetallesPedido = ({ pedido, abierto, onCerrar }) => {
  // Si no está abierto o no hay pedido, no dibujamos nada
  if (!abierto || !pedido) return null;

  return (
    // LA MAGIA: Esta capa oscura cubre toda la pantalla (Pop-up real)
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 1050 }}
      tabIndex="-1"
      onClick={onCerrar} // Si hace clic afuera, se cierra
    >
      <div 
        className="modal-dialog modal-dialog-centered modal-lg" 
        onClick={e => e.stopPropagation()} // Evita que se cierre al hacer clic adentro de la caja blanca
      >
        <div className="modal-content shadow-lg border-0 rounded-4">
          
          {/* Encabezado del Pop-up */}
          <div className="modal-header bg-light border-bottom-0 rounded-top-4">
            <h5 className="modal-title fw-bold" style={{ color: 'var(--primary-color)' }}>
              <i className="fas fa-receipt me-2"></i>
              Detalle del Pedido #{pedido.id}
            </h5>
            <button type="button" className="btn-close" onClick={onCerrar} aria-label="Cerrar"></button>
          </div>

          {/* Cuerpo del Pop-up */}
          <div className="modal-body p-4">
            <div className="row mb-4">
              <div className="col-sm-6">
                <p className="mb-1 text-muted small text-uppercase fw-bold">Cliente</p>
                <p className="fs-5 fw-bold mb-0">
                  {pedido.cliente ? `${pedido.cliente.nombre} ${pedido.cliente.apellido}` : 'Consumidor Final'}
                </p>
                {pedido.cliente && pedido.cliente.telefono && (
                  <p className="text-muted small mb-0"><i className="fas fa-phone me-1"></i>{pedido.cliente.telefono}</p>
                )}
              </div>
              <div className="col-sm-6 text-sm-end mt-3 mt-sm-0">
                <p className="mb-1 text-muted small text-uppercase fw-bold">Fecha y Hora</p>
                <p className="mb-0 fw-bold">{new Date(pedido.fecha).toLocaleDateString()} - {new Date(pedido.fecha).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                <span className={`badge mt-2 status-badge status-${pedido.estado === 'entregado' ? 'delivered' : 'pending'}`}>
                  {pedido.estado}
                </span>
              </div>
            </div>

            <h6 className="fw-bold mb-3 border-bottom pb-2">Productos</h6>
            <div className="table-responsive">
              <table className="table table-sm table-borderless">
                <thead className="table-light">
                  <tr>
                    <th>Cant.</th>
                    <th>Producto</th>
                    <th className="text-end">Precio U.</th>
                    <th className="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(pedido.productos) && pedido.productos.map(prod => {
                    const cantidad = prod.PedidoProducto?.cantidad || prod.cantidad || 1;
                    const precio = parseFloat(prod.PedidoProducto?.precioUnitario || prod.precio || 0);
                    return (
                      <tr key={prod.id} className="border-bottom">
                        <td className="fw-bold">{cantidad}x</td>
                        <td>{prod.nombre}</td>
                        <td className="text-end text-muted">${precio.toFixed(2)}</td>
                        <td className="text-end fw-bold">${(cantidad * precio).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Fila de Totales y Envío */}
            <div className="row mt-4 bg-light p-3 rounded-3">
              <div className="col-6">
                <p className="mb-0 text-muted small fw-bold text-uppercase">Modalidad</p>
                <p className="mb-0 fw-bold">
                  {pedido.tipoEntrega === 'delivery' ? <><i className="fas fa-motorcycle me-2 text-primary"></i>Delivery</> : <><i className="fas fa-store me-2 text-secondary"></i>Retiro en Local</>}
                </p>
              </div>
              <div className="col-6 text-end">
                <p className="mb-0 text-muted small fw-bold text-uppercase">Total</p>
                <p className="mb-0 fs-3 fw-bold text-success">${parseFloat(pedido.total || 0).toFixed(2)}</p>
              </div>
            </div>

            {pedido.observaciones && (
              <div className="mt-3">
                <p className="mb-1 text-muted small fw-bold text-uppercase">Observaciones</p>
                <p className="small mb-0 p-2 bg-light rounded text-danger fst-italic">"{pedido.observaciones}"</p>
              </div>
            )}
          </div>

          {/* Pie del Pop-up */}
          <div className="modal-footer border-top-0">
            <button type="button" className="btn btn-secondary w-100" onClick={onCerrar}>Cerrar Detalles</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDetallesPedido;
