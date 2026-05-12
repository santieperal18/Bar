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
        @page { margin: 0; }
        body { 
          font-family: 'monospace';
          width: 100%; /* Cambiado a 100% para ocupar todo el ancho en la prueba */
          margin: 0; 
          padding: 2mm;
          font-size: 12px;
          line-height: 1.1;
          color: #000;
        }
        .text-center { text-align: center; margin-bottom: 5px; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .header { margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 5px; }
        .info { margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        th { border-bottom: 1px dashed #000; text-align: left; }
        .total { border-top: 1px dashed #000; padding-top: 5px; font-size: 14px; }
        .footer { margin-top: 15px; font-size: 10px; border-top: 1px solid #000; padding-top: 5px; }
        .espaciador { height: 30px; } /* Para que la impresora saque un poco más de papel */
        td { padding: 2px 0; vertical-align: top; }
      </style>
    </head>
    <body>
      <div class="header text-center">
        <div class="bold" style="font-size: 16px;">RESTO BAR</div>
        <div class="bold">LA ESQUINA</div>
        <div>Pedido #${id}</div>
        <div>${fechaFormateada}</div>
      </div>

      <div class="info">
        <div><span class="bold">Cliente:</span> ${nombreCliente}</div>
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
          ${productos.map(p => `
            <tr>
              <td>${p.cantidad}</td>
              <td>${p.nombre || (p.Producto ? p.Producto.nombre : 'Articulo')}</td>
              <td class="text-right">$${parseFloat(p.subtotal).toFixed(2)}</td>
            </tr>
          `).join('')}
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