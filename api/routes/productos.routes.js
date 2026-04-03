import express from "express";
import productoService from "../services/productoService.js";

const router = express.Router();

// Obtener todos los productos
router.get("/", async (req, res) => {
  try {
    const productos = await productoService.obtenerTodos();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener producto por ID
router.get("/:id", async (req, res) => {
  try {
    const producto = await productoService.obtenerPorId(parseInt(req.params.id));
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener productos por categoría
router.get("/categoria/:idCategoria", async (req, res) => {
  try {
    const productos = await productoService.obtenerPorCategoria(
      parseInt(req.params.idCategoria)
    );
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener productos por tipo (desayuno/comida/bebida)
router.get("/tipo/:tipo", async (req, res) => {
  try {
    const productos = await productoService.obtenerPorTipo(req.params.tipo);
    res.json(productos);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Crear nuevo producto
router.post("/", async (req, res) => {
  try {
    const productoCreado = await productoService.crear(req.body);
    res.status(201).json(productoCreado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar producto
router.put("/:id", async (req, res) => {
  try {
    const productoActualizado = await productoService.actualizar(
      parseInt(req.params.id),
      req.body
    );
    res.json(productoActualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar producto (marcar como no disponible)
router.delete("/:id", async (req, res) => {
  try {
    await productoService.eliminar(parseInt(req.params.id));
    res.status(204).end();
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

export default router;