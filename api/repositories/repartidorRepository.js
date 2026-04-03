import RepositorioBase from "./repositorioBase.js";
import Repartidor from "../models/repartidor.js";

class RepartidorRepository extends RepositorioBase {
  constructor() {
    super(Repartidor);
  }

  async obtenerTodos() {
    return this.modelo.findAll({
      where: { activo: true },
      order: [["apellido", "ASC"], ["nombre", "ASC"]]
    });
  }

  async obtenerDisponibles() {
    return this.modelo.findAll({
      where: { 
        activo: true,
        // Aquí podrías agregar lógica para verificar si está ocupado
      },
      order: [["apellido", "ASC"]]
    });
  }

  async buscarPorNombre(nombre) {
    const { Op } = await import('sequelize');
    return this.modelo.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.like]: `%${nombre}%` } },
          { apellido: { [Op.like]: `%${nombre}%` } }
        ],
        activo: true
      }
    });
  }

  async obtenerConPedidosHoy() {
    const { Op } = await import('sequelize');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    
    return this.modelo.findAll({
      include: [{
        association: 'pedidos',
        where: {
          fecha: {
            [Op.between]: [hoy, manana]
          }
        },
        required: false
      }],
      where: { activo: true }
    });
  }
}

export default new RepartidorRepository();