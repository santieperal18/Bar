import categoriaRepository from '../repositories/categoriaRepository.js';

class CategoriaService {
  async obtenerTodos() {
    const categorias = await categoriaRepository.obtenerTodos();
    return categorias.map(this.#convertirSalida);
  }

  async obtenerPorId(id) {
    const categoria = await categoriaRepository.obtenerPorId(id);
    return categoria ? this.#convertirSalida(categoria) : null;
  }

  async obtenerPorTipo(tipo) {
    const categorias = await categoriaRepository.obtenerPorTipo(tipo);
    return categorias.map(this.#convertirSalida);
  }

  async crear(datos) {
    await this.#validarCategoria(datos);
    const datosProcesados = this.#convertirEntrada(datos);
    const creado = await categoriaRepository.crear(datosProcesados);
    return this.#convertirSalida(creado);
  }

  async actualizar(id, datos) {
    await this.#validarCategoria(datos, id);
    const datosProcesados = this.#convertirEntrada(datos);
    const actualizado = await categoriaRepository.actualizar(id, datosProcesados);
    return this.#convertirSalida(actualizado);
  }

  async eliminar(id) {
    // Verificar que no haya productos asociados
    const categoria = await categoriaRepository.obtenerConProductos(id);
    if (categoria && categoria.productos && categoria.productos.length > 0) {
      throw new Error('No se puede eliminar la categoría porque tiene productos asociados');
    }
    
    return await categoriaRepository.eliminar(id);
  }

  async #validarCategoria(datos, idActual = null) {
    // Validar nombre único
    if (datos.nombre) {
      const { Op } = await import('sequelize');
      const condiciones = {
        nombre: datos.nombre
      };
      
      if (idActual) {
        condiciones.id = { [Op.ne]: idActual };
      }
      
      const existente = await categoriaRepository.buscar(condiciones);
      if (existente.length > 0) {
        throw new Error(`Ya existe una categoría con el nombre: ${datos.nombre}`);
      }
    }

    // Validar tipo válido
    const tiposValidos = ['desayuno', 'comida', 'bebida'];
    if (datos.tipo && !tiposValidos.includes(datos.tipo)) {
      throw new Error(`Tipo inválido. Tipos válidos: ${tiposValidos.join(', ')}`);
    }
  }

  #convertirSalida(categoria) {
    const obj = categoria.toJSON ? categoria.toJSON() : categoria;
    return obj;
  }

  #convertirEntrada(datos) {
    return { ...datos };
  }
}

export default new CategoriaService();