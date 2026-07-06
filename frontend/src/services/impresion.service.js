/**
 * Servicio para manejar la impresión de tickets en impresoras térmicas
 */
const imprimirTicketPedido = (pedido) => {
  const { id, fecha, cliente, productos, total, tipoEntrega, direccionEntrega, observaciones } = pedido;
  
  const fechaFormateada = new Date(fecha).toLocaleString('es-AR');
  const nombreCliente = typeof cliente === 'string' ? cliente : 
                       (cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Consumidor Final');

  // Construir el HTML del ticket
  const ticketHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @page { margin: 1cm; size: auto; }
        body { 
          font-family: 'monospace';
          width: 100%;
          margin: 0; 
          padding: 5mm;
          font-size: 42px; /* Aumentado 50% extra */
          line-height: 1.2;
          color: #000;
        }
        .text-center { text-align: center; margin-bottom: 30px; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .header { margin-bottom: 40px; border-bottom: 6px dashed #000; padding-bottom: 30px; }
        .info { margin-bottom: 40px; }
        .cliente-info { font-size: 55px; display: block; margin-top: 10px; border: 2px solid #000; padding: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        th { border-bottom: 6px dashed #000; text-align: left; padding: 15px 0; font-size: 35px; }
        .item-cant { font-size: 52px; font-weight: bold; }
        .item-precio { font-size: 50px; font-weight: bold; }
        .total { border-top: 8px solid #000; padding-top: 30px; font-size: 75px; }
        .footer { margin-top: 80px; font-size: 28px; border-top: 4px solid #000; padding-top: 30px; }
        .espaciador { height: 100px; } 
        td { padding: 20px 0; vertical-align: top; }
      </style>
    </head>
    <body>
      <div class="header text-center">
        <div class="bold" style="font-size: 80px;">RESTO BAR</div>
        <div class="bold">LA ESQUINA</div>
        <div>Pedido #${id}</div>
        <div>${fechaFormateada}</div>
      </div>

      <div class="info">
        <div><span class="bold">Cliente:</span> <span class="cliente-info bold">${nombreCliente}</span></div>
        <div><span class="bold">Entrega:</span> ${tipoEntrega.toUpperCase()}</div>
        ${direccionEntrega ? `<div><span class="bold">Dir:</span> ${direccionEntrega}</div>` : ''}
      </div>

      <table>
        <thead>
          <tr>
            <th width="20%">Cant</th>
            <th width="50%">Prod</th>
            <th width="30%" class="text-right">Subt</th>
          </tr>
        </thead>
        <tbody>
          ${productos.map(p => {
            const pivot = p.PedidoProducto || {};
            const cantidad = p.cantidad || pivot.cantidad || 1;
            const subtotal = p.subtotal || pivot.subtotal || (Number(p.precio || pivot.precioUnitario || 0) * Number(cantidad));
            const guarnicion = p.guarnicion || pivot.guarnicion;
            return `
            <tr>
              <td class="item-cant">${cantidad}</td>
              <td>
                ${p.nombre || (p.Producto ? p.Producto.nombre : 'Articulo')}
                ${guarnicion ? `<div class="bold">Guarnicion: ${guarnicion}</div>` : ''}
              </td>
              <td class="text-right item-precio">$${parseFloat(subtotal).toFixed(2)}</td>
            </tr>
          `}).join('')}
        </tbody>
      </table>

      <div class="total text-right bold">
        TOTAL: $${parseFloat(total).toFixed(2)}
      </div>

      ${observaciones ? `<div style="margin-top: 10px; font-style: italic;">Obs: ${observaciones}</div>` : ''}

      <div class="footer text-center">
        *** Gracias por su compra ***<br>
        Software de Gestión "La Esquina"
      </div>
      <div class="espaciador"></div>

      <script>
        window.onload = () => {
          window.print();
          setTimeout(() => { window.close(); }, 500);
        };
      </script>
    </body>
    </html>
  `;

  // Crear un iframe oculto para imprimir
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(ticketHTML);
  doc.close();

  // Limpiar el DOM después de imprimir
  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 2000);
};

export default {
  imprimirTicketPedido
};
