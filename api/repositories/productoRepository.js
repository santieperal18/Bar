import RepositorioBase from "./repositorioBase.js";
import Producto from "../models/producto.js";
import Categoria from "../models/categoria.js";

class ProductoRepository extends RepositorioBase {
  constructor() {
    super(Producto);
  }

  async obtenerTodos() {
    return this.modelo.findAll({
      where: { disponible: true },
      include: {
        model: Categoria,
        as: "categoria"
      },
      order: [["nombre", "ASC"]]
    });
  }

  async obtenerPorCategoria(idCategoria) {
    return this.modelo.findAll({
      where: { 
        idCategoria,
        disponible: true 
      },
      include: {
        model: Categoria,
        as: "categoria"
      }
    });
  }

  async obtenerPorTipo(tipo) {
    return this.modelo.findAll({
      include: {
        model: Categoria,
        as: "categoria",
        where: { tipo }
      },
      where: { disponible: true }
    });
  }
}

export default new ProductoRepository();