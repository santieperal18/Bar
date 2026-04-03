import clienteRepository from '../repositories/clienteRepository.js';

class ClienteService {
  async obtenerTodos() {
    const clientes = await clienteRepository.obtenerTodos();
    return clientes.map(this.#convertirSalida);
  }

  async obtenerPorId(id) {
    const cliente = await clienteRepository.obtenerPorId(id);
    return cliente ? this.#convertirSalida(cliente) : null;
  }

  async crear(datos) {
    await this.#validarCliente(datos);
    const datosProcesados = this.#convertirEntrada(datos);
    const creado = await clienteRepository.crear(datosProcesados);
    return this.#convertirSalida(creado);
  }

  async actualizar(id, datos) {
    await this.#validarCliente(datos, id);
    const datosProcesados = this.#convertirEntrada(datos);
    const actualizado = await clienteRepository.actualizar(id, datosProcesados);
    return this.#convertirSalida(actualizado);
  }

  async eliminar(id) {
    // En lugar de eliminar, marcamos como inactivo
    const actualizado = await clienteRepository.actualizar(id, { activo: false });
    return this.#convertirSalida(actualizado);
  }

  async buscarPorNombre(nombre) {
    const clientes = await clienteRepository.buscarPorNombre(nombre);
    return clientes.map(this.#convertirSalida);
  }

  async #validarCliente(datos, idActual = null) {
    // Validar email único
    if (datos.email) {
      const { Op } = await import('sequelize');
      const condiciones = {
        email: datos.email,
        activo: true
      };
      
      if (idActual) {
        condiciones.id = { [Op.ne]: idActual };
      }
      
      const existente = await clienteRepository.buscar(condiciones);
      if (existente.length > 0) {
        throw new Error(`Ya existe un cliente registrado con el email: ${datos.email}`);
      }
    }

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
      
      const existente = await clienteRepository.buscar(condiciones);
      if (existente.length > 0) {
        throw new Error(`Ya existe un cliente registrado con el teléfono: ${datos.telefono}`);
      }
    }
  }

  #convertirSalida(cliente) {
    const obj = cliente.toJSON ? cliente.toJSON() : cliente;
    return obj;
  }

  #convertirEntrada(datos) {
    // Eliminar campos no necesarios para la BD
    const { confirmarEmail, confirmarTelefono, ...datosProcesados } = datos;
    return { ...datosProcesados };
  }
}

export default new ClienteService();