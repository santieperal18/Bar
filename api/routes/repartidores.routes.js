import express from "express";
import repartidorService from "../services/repartidorService.js";

const router = express.Router();

// Obtener todos los repartidores
router.get("/", async (req, res) => {
  try {
    const repartidores = await repartidorService.obtenerTodos();
    res.json(repartidores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener repartidores disponibles
router.get("/disponibles", async (req, res) => {
  try {
    const repartidores = await repartidorService.obtenerDisponibles();
    res.json(repartidores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener repartidor por ID
router.get("/:id", async (req, res) => {
  try {
    const repartidor = await repartidorService.obtenerPorId(parseInt(req.params.id));
    if (!repartidor) {
      return res.status(404).json({ error: "Repartidor no encontrado" });
    }
    res.json(repartidor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar repartidores por nombre
router.get("/buscar/:nombre", async (req, res) => {
  try {
    const repartidores = await repartidorService.buscarPorNombre(req.params.nombre);
    res.json(repartidores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear nuevo repartidor
router.post("/", async (req, res) => {
  try {
    const repartidorCreado = await repartidorService.crear(req.body);
    res.status(201).json(repartidorCreado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar repartidor
router.put("/:id", async (req, res) => {
  try {
    const repartidorActualizado = await repartidorService.actualizar(
      parseInt(req.params.id),
      req.body
    );
    res.json(repartidorActualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar repartidor (marcar como inactivo)
router.delete("/:id", async (req, res) => {
  try {
    await repartidorService.eliminar(parseInt(req.params.id));
    res.status(204).end();
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

export default router;