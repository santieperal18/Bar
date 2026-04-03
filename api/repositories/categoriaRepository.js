import RepositorioBase from "./repositorioBase.js";
import Categoria from "../models/categoria.js";
import Producto from "../models/producto.js";

class CategoriaRepository extends RepositorioBase {
  constructor() {
    super(Categoria);
  }

  async obtenerTodos() {
    return this.modelo.findAll({
      order: [["tipo", "ASC"], ["nombre", "ASC"]]
    });
  }

  async obtenerPorTipo(tipo) {
    return this.modelo.findAll({
      where: { tipo },
      order: [["nombre", "ASC"]]
    });
  }

  async obtenerConProductos(id) {
    return this.modelo.findByPk(id, {
      include: {
        model: Producto,
        as: "productos"
      }
    });
  }
}

export default new CategoriaRepository();