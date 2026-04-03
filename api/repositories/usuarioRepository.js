import RepositorioBase from "./repositorioBase.js";
import Usuario from "../models/usuario.js";

class UsuarioRepository extends RepositorioBase {
  constructor() {
    super(Usuario);
  }

  async obtenerPorUsuario(usuario) {
    return this.modelo.findOne({
      where: { usuario }
    });
  }
}

export default new UsuarioRepository();
