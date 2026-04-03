import repartidorRepository from '../repositories/repartidorRepository.js';

class RepartidorService {
  async obtenerTodos() {
    const repartidores = await repartidorRepository.obtenerTodos();
    return repartidores.map(this.#convertirSalida);
  }

  async obtenerPorId(id) {
    const repartidor = await repartidorRepository.obtenerPorId(id);
    return repartidor ? this.#convertirSalida(repartidor) : null;
  }

  async obtenerDisponibles() {
    const repartidores = await repartidorRepository.obtenerDisponibles();
    return repartidores.map(this.#convertirSalida);
  }

  async crear(datos) {
    await this.#validarRepartidor(datos);
    const datosProcesados = this.#convertirEntrada(datos);
    const creado = await repartidorRepository.crear(datosProcesados);
    return this.#convertirSalida(creado);
  }

  async actualizar(id, datos) {
    await this.#validarRepartidor(datos, id);
    const datosProcesados = this.#convertirEntrada(datos);
    const actualizado = await repartidorRepository.actualizar(id, datosProcesados);
    return this.#convertirSalida(actualizado);
  }

  async eliminar(id) {
    // Marcamos como inactivo en lugar de eliminar
    const actualizado = await repartidorRepository.actualizar(id, { activo: false });
    return this.#convertirSalida(actualizado);
  }

  async buscarPorNombre(nombre) {
    const repartidores = await repartidorRepository.buscarPorNombre(nombre);
    return repartidores.map(this.#convertirSalida);
  }

  async #validarRepartidor(datos, idActual = null) {
    // Validar teléfono único
    if (datos.telefono) {
      const { Op } = await import('sequelize');
      const condiciones = {
        telefono: datos.telefono,
        activo: true
      };
      
      if (idActual) {
        condiciones.id = { [Op.ne]: idActual };
      }
      
      const existente = await repartidorRepository.buscar(condiciones);
      if (existente.length > 0) {
        throw new Error(`Ya existe un repartidor con el teléfono: ${datos.telefono}`);
      }
    }
  }

  #convertirSalida(repartidor) {
    const obj = repartidor.toJSON ? repartidor.toJSON() : repartidor;
    return obj;
  }

  #convertirEntrada(datos) {
    return { ...datos };
  }
}

export default new RepartidorService();