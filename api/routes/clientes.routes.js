import express from "express";
import clienteService from "../services/clienteService.js";

const router = express.Router();

// Obtener todos los clientes
router.get("/", async (req, res) => {
  try {
    const clientes = await clienteService.obtenerTodos();
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener cliente por ID
router.get("/:id", async (req, res) => {
  try {
    const cliente = await clienteService.obtenerPorId(parseInt(req.params.id));
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar clientes por nombre
router.get("/buscar/:nombre", async (req, res) => {
  try {
    const clientes = await clienteService.buscarPorNombre(req.params.nombre);
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear nuevo cliente
router.post("/", async (req, res) => {
  try {
    const clienteCreado = await clienteService.crear(req.body);
    res.status(201).json(clienteCreado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar cliente
router.put("/:id", async (req, res) => {
  try {
    const clienteActualizado = await clienteService.actualizar(
      parseInt(req.params.id),
      req.body
    );
    res.json(clienteActualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar cliente (marcar como inactivo)
router.delete("/:id", async (req, res) => {
  try {
    await clienteService.eliminar(parseInt(req.params.id));
    res.status(204).end();
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

export default router;