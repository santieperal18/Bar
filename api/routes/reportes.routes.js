import express from "express";
import reporteService from "../services/reporteService.js";

const router = express.Router();

router.get("/ventas/diarias", async (req, res) => {
  try {
    const data = await reporteService.obtenerVentasDiarias(req.query.fecha);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/ventas/semanales", async (req, res) => {
  try {
    const data = await reporteService.obtenerVentasSemanales(req.query.fechaInicio);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/ventas/mensuales", async (req, res) => {
  try {
    const data = await reporteService.obtenerVentasMensuales(req.query.anio, req.query.mes);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/productos/mas-vendidos", async (req, res) => {
  try {
    const data = await reporteService.obtenerProductosMasVendidos(req.query.fechaInicio, req.query.fechaFin, req.query.limite);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/clientes/frecuentes", async (req, res) => {
  try {
    const data = await reporteService.obtenerClientesFrecuentes(req.query.limite);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// NUEVA RUTA: Desempeño Repartidores
router.get("/repartidores/desempeno", async (req, res) => {
  try {
    const { fecha } = req.query;
    const data = await reporteService.obtenerDesempenoRepartidores(fecha);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/pdf", async (req, res) => {
  try {
    const { tipo, parametros } = req.body;
    const doc = await reporteService.generarPDFReporte(tipo, parametros);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-${tipo}.pdf`);
    doc.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;