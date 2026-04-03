import RepositorioBase from "./repositorioBase.js";
import Cliente from "../models/cliente.js";

class ClienteRepository extends RepositorioBase {
  constructor() {
    super(Cliente);
  }

  async obtenerTodos() {
    return this.modelo.findAll({
      where: { activo: true },
      order: [["apellido", "ASC"], ["nombre", "ASC"]]
    });
  }

  async buscarPorNombre(nombre) {
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
}

export default new ClienteRepository();