import express from "express";
import categoriaService from "../services/categoriaService.js";

const router = express.Router();

// Obtener todas las categorías
router.get("/", async (req, res) => {
  try {
    const categorias = await categoriaService.obtenerTodos();
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener categoría por ID
router.get("/:id", async (req, res) => {
  try {
    const categoria = await categoriaService.obtenerPorId(parseInt(req.params.id));
    if (!categoria) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }
    res.json(categoria);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener categorías por tipo
router.get("/tipo/:tipo", async (req, res) => {
  try {
    const categorias = await categoriaService.obtenerPorTipo(req.params.tipo);
    res.json(categorias);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Crear nueva categoría
router.post("/", async (req, res) => {
  try {
    const categoriaCreada = await categoriaService.crear(req.body);
    res.status(201).json(categoriaCreada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar categoría
router.put("/:id", async (req, res) => {
  try {
    const categoriaActualizada = await categoriaService.actualizar(
      parseInt(req.params.id),
      req.body
    );
    res.json(categoriaActualizada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar categoría
router.delete("/:id", async (req, res) => {
  try {
    await categoriaService.eliminar(parseInt(req.params.id));
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;