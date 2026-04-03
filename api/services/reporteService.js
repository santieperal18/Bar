import PDFDocument from 'pdfkit';
import sequelize from '../db.js';
import pedidoRepository from '../repositories/pedidoRepository.js';
import clienteRepository from '../repositories/clienteRepository.js';

class ReporteService {

  // --- MÉTODOS DE DATOS (DASHBOARD) ---

  async obtenerVentasDiarias(fecha) {
    // 1. Determinamos la fecha base
    let fechaBase;
    if (fecha) {
        // Evitamos problemas de zona horaria agregando hora fija
        fechaBase = new Date(fecha + 'T12:00:00');
    } else {
        fechaBase = new Date();
    }

    // 2. Construimos INICIO y FIN respetando zona horaria local
    const fechaInicio = new Date(fechaBase.getFullYear(), fechaBase.getMonth(), fechaBase.getDate(), 0, 0, 0);
    const fechaFin = new Date(fechaBase.getFullYear(), fechaBase.getMonth(), fechaBase.getDate(), 23, 59, 59, 999);

    // 3. Buscamos los pedidos
    const pedidos = await pedidoRepository.obtenerPorFecha(fechaInicio, fechaFin);

    // 4. Calculamos el total manualmente
    const totalCalculado = pedidos.reduce((acumulador, pedido) => {
        return acumulador + Number(pedido.total || 0);
    }, 0);

    return {
        titulo: `Reporte Diario (${fechaInicio.toLocaleDateString()})`,
        totalVentas: totalCalculado,
        cantidadPedidos: pedidos.length,
        fecha: fechaInicio,
        detalle: pedidos // Importante: se llama 'detalle' para el PDF
    };
  }

  async obtenerVentasSemanales(fechaInicio) {
    const inicio = fechaInicio ? new Date(fechaInicio) : new Date();
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + 7);
    fin.setHours(23, 59, 59, 999);
    
    const pedidos = await pedidoRepository.obtenerPorFecha(inicio, fin);
    return this.#procesarReporte(pedidos, `Reporte Semanal (${inicio.toLocaleDateString()} - ${fin.toLocaleDateString()})`);
  }

  async obtenerVentasMensuales(anio, mes) {
    const year = anio || new Date().getFullYear();
    const month = mes || (new Date().getMonth() + 1);
    const inicio = new Date(year, month - 1, 1);
    const fin = new Date(year, month, 0); 
    fin.setHours(23, 59, 59, 999);

    const pedidos = await pedidoRepository.obtenerPorFecha(inicio, fin);
    return this.#procesarReporte(pedidos, `Reporte Mensual (${month}/${year})`);
  }

  async obtenerReporteCliente(idCliente) {
    const pedidos = await pedidoRepository.obtenerPorCliente(idCliente);
    const cliente = await clienteRepository.obtenerPorId(idCliente);
    const nombreCliente = cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente';
    return this.#procesarReporte(pedidos, `Historial: ${nombreCliente}`);
  }

  async obtenerProductosMasVendidos(fechaInicio, fechaFin, limite) {
    const limitNum = (!limite || isNaN(limite)) ? 5 : parseInt(limite);

    // SQL con filtro de fechas opcional
    const query = `
      SELECT p.nombre, SUM(pp.cantidad) as total_vendido, SUM(pp.subtotal) as total_ingresos
      FROM pedido_producto pp
      JOIN producto p ON pp.id_producto = p.id
      JOIN pedido ped ON pp.id_pedido = ped.id
      WHERE ped.estado != 'cancelado'
      ${fechaInicio && fechaFin ? `AND ped.fecha BETWEEN '${fechaInicio} 00:00:00' AND '${fechaFin} 23:59:59'` : ''}
      GROUP BY p.id
      ORDER BY total_vendido DESC
      LIMIT :limitNum
    `;

    try {
      return await sequelize.query(query, {
        replacements: { limitNum },
        type: sequelize.QueryTypes.SELECT
      });
    } catch (error) {
      console.warn("Fallback a PedidoProductos...", error.message);
      const queryBackup = query.replace('pedido_producto', 'PedidoProductos');
      return await sequelize.query(queryBackup, {
        replacements: { limitNum },
        type: sequelize.QueryTypes.SELECT
      });
    }
  }

  async obtenerClientesFrecuentes(limite) {
    const limitNum = (!limite || isNaN(limite)) ? 5 : parseInt(limite);
    const query = `
      SELECT c.nombre, c.apellido, COUNT(p.id) as cantidad_pedidos, SUM(p.total) as total_gastado
      FROM pedido p
      JOIN cliente c ON p.id_cliente = c.id
      WHERE p.estado != 'cancelado'
      GROUP BY c.id
      ORDER BY cantidad_pedidos DESC
      LIMIT :limitNum
    `;

    return await sequelize.query(query, {
      replacements: { limitNum },
      type: sequelize.QueryTypes.SELECT
    });
  }

  // --- NUEVO: ESTADÍSTICA DE REPARTIDORES DIARIA ---
  async obtenerDesempenoRepartidores(fecha) {
    const targetDate = fecha ? new Date(fecha) : new Date();
    const fechaInicio = targetDate.toISOString().split('T')[0] + ' 00:00:00';
    const fechaFin = targetDate.toISOString().split('T')[0] + ' 23:59:59';

    const query = `
      SELECT r.nombre, r.apellido, COUNT(p.id) as cantidad_entregas
      FROM repartidor r
      JOIN pedido p ON p.id_repartidor = r.id
      WHERE p.estado != 'cancelado' 
      AND p.fecha BETWEEN :fechaInicio AND :fechaFin
      GROUP BY r.id
      ORDER BY cantidad_entregas DESC
    `;

    return await sequelize.query(query, {
      replacements: { fechaInicio, fechaFin },
      type: sequelize.QueryTypes.SELECT
    });
  }

  // --- GENERACIÓN PDF ---

  async generarPDFReporte(tipo, parametros) {
    let datos;
    switch (tipo) {
      case 'diario': datos = await this.obtenerVentasDiarias(parametros.fecha); break;
      case 'semanal': datos = await this.obtenerVentasSemanales(parametros.fechaInicio); break;
      case 'mensual': datos = await this.obtenerVentasMensuales(parametros.anio, parametros.mes); break;
      case 'cliente': datos = await this.obtenerReporteCliente(parametros.idCliente); break;
      default: throw new Error("Tipo inválido");
    }

    const doc = new PDFDocument({ margin: 50 });
    doc.fontSize(20).text('Resto Bar La Esquina', { align: 'center' });
    doc.fontSize(12).text('Reporte Oficial', { align: 'center' });
    doc.moveDown();
    
    // Ahora 'datos.titulo' siempre existirá
    doc.fontSize(16).text(datos.titulo || "Reporte", { underline: true });
    doc.fontSize(10).text(`Generado: ${new Date().toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(12).font('Helvetica-Bold').text('Resumen:');
    doc.font('Helvetica');
    doc.text(`Pedidos: ${datos.cantidadPedidos}`);
    doc.text(`Total: $${datos.totalVentas}`);
    doc.moveDown();
    
    let y = 250;
    doc.font('Helvetica-Bold');
    this.#drawRow(doc, y, 'ID', 'Fecha', 'Cliente', 'Estado', 'Monto');
    this.#drawLine(doc, y + 15);
    y += 25;
    doc.font('Helvetica');

    // AQUÍ ESTABA EL ERROR: Aseguramos que 'datos.detalle' exista y sea un array
    (datos.detalle || []).forEach(pedido => {
      if (y > 700) { doc.addPage(); y = 50; }

      // VALIDACIÓN INTELIGENTE DE CLIENTE
      // Si viene del reporte mensual es string, si viene del diario es objeto
      let nombreCliente = "Cliente Final";
      if (typeof pedido.cliente === 'string') {
          nombreCliente = pedido.cliente;
      } else if (pedido.cliente && pedido.cliente.nombre) {
          nombreCliente = `${pedido.cliente.nombre} ${pedido.cliente.apellido}`;
      }

      this.#drawRow(
        doc, 
        y, 
        pedido.id.toString(), 
        new Date(pedido.fecha).toLocaleDateString(), 
        nombreCliente.substring(0,20), // Ahora es seguro hacer substring
        pedido.estado, 
        `$${pedido.total}`
      );
      y += 20;
    });

    doc.end();
    return doc;
  }

  #procesarReporte(pedidosEntidad, titulo) {
    const pedidos = pedidosEntidad.map(p => {
        const json = p.toJSON();
        return {
            id: json.id, 
            fecha: json.fecha, 
            total: parseFloat(json.total).toFixed(2),
            estado: json.estado, 
            // Esto devuelve un STRING
            cliente: json.cliente ? `${json.cliente.nombre} ${json.cliente.apellido}` : 'Final'
        };
    });
    return {
      titulo, 
      cantidadPedidos: pedidos.length, 
      detalle: pedidos, // CAMBIO CRÍTICO: antes era 'pedidos', ahora es 'detalle'
      totalVentas: pedidos.reduce((a, b) => a + parseFloat(b.total), 0).toFixed(2)
    };
  }

  #drawRow(doc, y, c1, c2, c3, c4, c5) {
    doc.fontSize(9).text(c1, 50, y).text(c2, 90, y).text(c3, 170, y).text(c4, 340, y).text(c5, 450, y, { align: 'right', width: 100 });
  }
  #drawLine(doc, y) {
    doc.strokeColor('#aaa').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
  }
}

export default new ReporteService();