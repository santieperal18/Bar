import productoRepository from '../repositories/productoRepository.js';
import categoriaRepository from '../repositories/categoriaRepository.js';

class ProductoService {
  async obtenerTodos() {
    const productos = await productoRepository.obtenerTodos();
    return productos.map(this.#convertirSalida);
  }

  async obtenerPorId(id) {
    const producto = await productoRepository.obtenerPorId(id);
    return producto ? this.#convertirSalida(producto) : null;
  }

  async obtenerPorCategoria(idCategoria) {
    const productos = await productoRepository.obtenerPorCategoria(idCategoria);
    return productos.map(this.#convertirSalida);
  }

  async obtenerPorTipo(tipo) {
    const productos = await productoRepository.obtenerPorTipo(tipo);
    return productos.map(this.#convertirSalida);
  }

  async crear(datos) {
    await this.#validarProducto(datos);
    await this.#validarCategoria(datos.idCategoria);
    
    const datosProcesados = this.#convertirEntrada(datos);
    const creado = await productoRepository.crear(datosProcesados);
    return this.#convertirSalida(creado);
  }

  async actualizar(id, datos) {
    await this.#validarProducto(datos, id);
    if (datos.idCategoria) {
      await this.#validarCategoria(datos.idCategoria);
    }
    
    const datosProcesados = this.#convertirEntrada(datos);
    const actualizado = await productoRepository.actualizar(id, datosProcesados);
    return this.#convertirSalida(actualizado);
  }

  async eliminar(id) {
    // Marcamos como no disponible en lugar de eliminar
    const actualizado = await productoRepository.actualizar(id, { disponible: false });
    return this.#convertirSalida(actualizado);
  }

  async #validarProducto(datos, idActual = null) {
    // Validar nombre único
    if (datos.nombre) {
      const { Op } = await import('sequelize');
      const condiciones = {
        nombre: datos.nombre,
        disponible: true
      };
      
      if (idActual) {
        condiciones.id = { [Op.ne]: idActual };
      }
      
      const existente = await productoRepository.buscar(condiciones);
      if (existente.length > 0) {
        throw new Error(`Ya existe un producto con el nombre: ${datos.nombre}`);
      }
    }

    // Validar precio positivo
    if (datos.precio && parseFloat(datos.precio) <= 0) {
      throw new Error("El precio debe ser mayor a cero");
    }
  }

  async #validarCategoria(idCategoria) {
    const categoria = await categoriaRepository.obtenerPorId(idCategoria);
    if (!categoria) {
      throw new Error(`La categoría con ID ${idCategoria} no existe`);
    }
  }

  #convertirSalida(producto) {
    const obj = producto.toJSON ? producto.toJSON() : producto;
    // Convertir precio a número decimal
    if (obj.precio) {
      obj.precio = parseFloat(obj.precio);
    }
    return obj;
  }

  #convertirEntrada(datos) {
    return { ...datos };
  }
}

export default new ProductoService();