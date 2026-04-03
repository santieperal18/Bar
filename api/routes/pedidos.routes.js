import express from "express";
import pedidoService from "../services/pedidoService.js";

const router = express.Router();

// Obtener todos los pedidos
router.get("/", async (req, res) => {
  try {
    const { pagina, limite } = req.query;
    const pedidos = await pedidoService.obtenerTodos({ pagina, limite });
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener pedido por ID
router.get("/:id", async (req, res) => {
  try {
    const pedido = await pedidoService.obtenerPorId(parseInt(req.params.id));
    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener pedidos por cliente
router.get("/cliente/:idCliente", async (req, res) => {
  try {
    const pedidos = await pedidoService.obtenerPorCliente(
      parseInt(req.params.idCliente)
    );
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Filtrar pedidos
router.get("/filtrar/buscar", async (req, res) => {
  try {
    const pedidos = await pedidoService.filtrar(req.query);
    res.json(pedidos);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Crear nuevo pedido
router.post("/", async (req, res) => {
  try {
    const pedidoCreado = await pedidoService.crear(req.body);
    res.status(201).json(pedidoCreado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar pedido
router.put("/:id", async (req, res) => {
  try {
    const pedidoActualizado = await pedidoService.actualizar(
      parseInt(req.params.id),
      req.body
    );
    res.json(pedidoActualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar estado del pedido
router.patch("/:id/estado", async (req, res) => {
  try {
    const { estado } = req.body;
    const pedidoActualizado = await pedidoService.actualizarEstado(
      parseInt(req.params.id),
      estado
    );
    res.json(pedidoActualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar pedido
router.delete("/:id", async (req, res) => {
  try {
    await pedidoService.eliminar(parseInt(req.params.id));
    res.status(204).end();
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

export default router;