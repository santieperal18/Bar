import pedidoRepository from '../repositories/pedidoRepository.js';
import clienteRepository from '../repositories/clienteRepository.js';
import productoRepository from '../repositories/productoRepository.js';
import repartidorRepository from '../repositories/repartidorRepository.js';

class PedidoService {
  async obtenerTodos({ pagina = 1, limite = 10 } = {}) {
    const pedidos = await pedidoRepository.obtenerTodos({ pagina, limite });
    return pedidos.map(this.#convertirSalida);
  }

  async obtenerPorId(id) {
    const pedido = await pedidoRepository.obtenerPorId(id);
    return pedido ? this.#convertirSalida(pedido) : null;
  }

  async obtenerPorCliente(idCliente) {
    const pedidos = await pedidoRepository.obtenerPorCliente(idCliente);
    return pedidos.map(this.#convertirSalida);
  }

  async filtrar(filtros) {
    const pedidos = await pedidoRepository.filtrar(filtros);
    return pedidos.map(this.#convertirSalida);
  }

  async crear(datos) {
    // Validar que haya productos
    if (!datos.productos || datos.productos.length === 0) {
      throw new Error("El pedido debe tener al menos un producto");
    }
    
    console.log("📦 Datos recibidos para crear pedido:", datos);
    
    // Preparar datos del pedido
    const datosPedido = {
      idCliente: datos.idCliente ? parseInt(datos.idCliente) : null,
      idRepartidor: datos.tipoEntrega === 'delivery' && datos.idRepartidor 
        ? parseInt(datos.idRepartidor) 
        : null,
      tipoEntrega: datos.tipoEntrega || 'local',
      direccionEntrega: datos.direccionEntrega || null,
      observaciones: datos.observaciones || null,
      estado: datos.estado || 'pendiente',
      total: 0 // Se calculará después
    };
    
    // Validar cliente si se especifica
    if (datosPedido.idCliente) {
      const cliente = await clienteRepository.obtenerPorId(datosPedido.idCliente);
      if (!cliente) {
        throw new Error(`Cliente con ID ${datosPedido.idCliente} no encontrado`);
      }
    }
    
    // Validar repartidor si es delivery
    if (datosPedido.tipoEntrega === 'delivery' && datosPedido.idRepartidor) {
      const repartidor = await repartidorRepository.obtenerPorId(datosPedido.idRepartidor);
      if (!repartidor || !repartidor.activo) {
        throw new Error(`Repartidor con ID ${datosPedido.idRepartidor} no encontrado o inactivo`);
      }
    }
    
    // Validar productos
    const productosValidos = [];
    for (const productoPedido of datos.productos) {
      const producto = await productoRepository.obtenerPorId(productoPedido.id);
      if (!producto || !producto.disponible) {
        throw new Error(`Producto con ID ${productoPedido.id} no encontrado o no disponible`);
      }
      
      productosValidos.push({
        id: producto.id,
        cantidad: productoPedido.cantidad || 1,
        precio: parseFloat(producto.precio),
        subtotal: parseFloat(producto.precio) * (productoPedido.cantidad || 1)
      });
    }
    
    // Calcular total
    const total = productosValidos.reduce((sum, p) => sum + p.subtotal, 0);
    datosPedido.total = total;
    
    console.log("✅ Datos procesados del pedido:", datosPedido);
    console.log("✅ Productos validados:", productosValidos);
    
    // Crear el pedido con productos
    const creado = await pedidoRepository.crearConProductos(datosPedido, productosValidos);
    return this.#convertirSalida(creado);
  }

  async actualizar(id, datos) {
    console.log("📝 Actualizando pedido ID:", id);
    console.log("📝 Datos para actualizar:", datos);
    
    // Preparar datos para actualización
    const datosActualizacion = {};
    
    if (datos.idCliente !== undefined) {
      datosActualizacion.idCliente = datos.idCliente ? parseInt(datos.idCliente) : null;
    }
    
    if (datos.idRepartidor !== undefined) {
      datosActualizacion.idRepartidor = datos.idRepartidor ? parseInt(datos.idRepartidor) : null;
    }
    
    if (datos.tipoEntrega !== undefined) {
      datosActualizacion.tipoEntrega = datos.tipoEntrega;
    }
    
    if (datos.direccionEntrega !== undefined) {
      datosActualizacion.direccionEntrega = datos.direccionEntrega;
    }
    
    if (datos.observaciones !== undefined) {
      datosActualizacion.observaciones = datos.observaciones;
    }
    
    if (datos.estado !== undefined) {
      datosActualizacion.estado = datos.estado;
    }
    
    console.log("✅ Datos procesados para actualización:", datosActualizacion);
    
    const actualizado = await pedidoRepository.actualizar(id, datosActualizacion);
    return this.#convertirSalida(actualizado);
  }

  async actualizarEstado(id, estado) {
    const estadosValidos = ['pendiente', 'preparando', 'en_camino', 'entregado', 'cancelado'];
    
    if (!estadosValidos.includes(estado)) {
      throw new Error(`Estado inválido. Estados válidos: ${estadosValidos.join(', ')}`);
    }
    
    const actualizado = await pedidoRepository.actualizar(id, { estado });
    return this.#convertirSalida(actualizado);
  }

  async eliminar(id) {
    return await pedidoRepository.eliminar(id);
  }

  #convertirSalida(pedido) {
    const obj = pedido.toJSON ? pedido.toJSON() : pedido;
    
    // Formatear fechas
    if (obj.fecha && typeof obj.fecha === 'string') {
      obj.fecha = new Date(obj.fecha).toISOString();
    }
    
    // Convertir números
    if (obj.total) {
      obj.total = parseFloat(obj.total);
    }
    
    // Asegurar que los productos tengan la estructura correcta
    if (obj.productos) {
      obj.productos = obj.productos.map(producto => {
        const prod = producto.toJSON ? producto.toJSON() : producto;
        if (prod.precio) {
          prod.precio = parseFloat(prod.precio);
        }
        if (prod.PedidoProducto) {
          prod.cantidad = prod.PedidoProducto.cantidad;
          prod.precioUnitario = parseFloat(prod.PedidoProducto.precioUnitario);
          prod.subtotal = parseFloat(prod.PedidoProducto.subtotal);
        }
        return prod;
      });
    }
    
    return obj;
  }

  #convertirEntrada(datos) {
    return { ...datos };
  }
}

export default new PedidoService();