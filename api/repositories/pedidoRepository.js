import RepositorioBase from "./repositorioBase.js";
import Pedido from "../models/pedido.js";
import Cliente from "../models/cliente.js";
import Repartidor from "../models/repartidor.js";
import PedidoProducto from "../models/pedidoProducto.js";
import Producto from "../models/producto.js";
import { Op } from "sequelize";

class PedidoRepository extends RepositorioBase {
  constructor() {
    super(Pedido);
  }

  async obtenerTodos({ pagina = 1, limite = 10 } = {}) {
    const offset = (pagina - 1) * limite;
    return this.modelo.findAll({
      include: [
        { model: Cliente, as: "cliente" },
        { model: Repartidor, as: "repartidor" },
        { 
          model: Producto, 
          as: "productos",
          through: { attributes: ['cantidad', 'precioUnitario', 'subtotal'] }
        }
      ],
      order: [["fecha", "DESC"]],
      limit: parseInt(limite),
      offset: parseInt(offset)
    });
  }

  async obtenerPorId(id) {
    return this.modelo.findByPk(id, {
      include: [
        { model: Cliente, as: "cliente" },
        { model: Repartidor, as: "repartidor" },
        {
          model: Producto,
          as: "productos",
          through: { attributes: ['cantidad', 'precioUnitario', 'subtotal'] }
        }
      ]
    });
  }

  async obtenerPorFecha(fechaInicio, fechaFin) {
    return this.modelo.findAll({
      where: {
        fecha: {
          [Op.between]: [fechaInicio, fechaFin]
        },
        estado: { [Op.ne]: 'cancelado' }
      },
      include: [
        { model: Cliente, as: "cliente" },
        { 
            model: Producto, 
            as: "productos",
            through: { attributes: ['cantidad', 'precioUnitario', 'subtotal'] }
        }
      ],
      order: [["fecha", "ASC"]]
    });
  }

  async obtenerPorCliente(idCliente) {
    return this.modelo.findAll({
      where: { idCliente },
      include: [
        { model: Cliente, as: "cliente" },
        { model: Producto, as: "productos" }
      ],
      order: [["fecha", "DESC"]]
    });
  }

  async filtrar(filtros) {
    const condiciones = {};
    if (filtros.cliente) condiciones.idCliente = filtros.cliente;
    if (filtros.estado) condiciones.estado = filtros.estado;
    if (filtros.tipoEntrega) condiciones.tipoEntrega = filtros.tipoEntrega;
    
    // Filtro de fechas con ajuste de fin de día
    if (filtros.fechaDesde && filtros.fechaHasta) {
        const desde = new Date(filtros.fechaDesde); // 00:00:00
        const hasta = new Date(filtros.fechaHasta);
        hasta.setHours(23, 59, 59, 999); // Ajustamos al final del día
        
        condiciones.fecha = {
            [Op.between]: [desde, hasta]
        };
    }

    return this.modelo.findAll({
        where: condiciones,
        include: [
            { model: Cliente, as: "cliente" },
            { model: Repartidor, as: "repartidor" },
            // IMPORTANTE: Ahora incluimos productos al filtrar
            { 
              model: Producto, 
              as: "productos",
              through: { attributes: ['cantidad', 'precioUnitario'] }
            }
        ],
        order: [["fecha", "DESC"]]
    });
  }

  async crearConProductos(datosPedido, productos) {
    const transaction = await this.modelo.sequelize.transaction();
    try {
      const pedido = await this.modelo.create(datosPedido, { transaction });
      let total = 0;
      const productosPedido = [];

      for (const producto of productos) {
        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;
        productosPedido.push({
          idPedido: pedido.id,
          idProducto: producto.id,
          cantidad: producto.cantidad,
          precioUnitario: producto.precio,
          subtotal: subtotal
        });
      }

      await PedidoProducto.bulkCreate(productosPedido, { transaction });
      await pedido.update({ total }, { transaction });
      await transaction.commit();
      return await this.obtenerPorId(pedido.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default new PedidoRepository();