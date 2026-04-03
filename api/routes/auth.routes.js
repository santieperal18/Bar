import express from "express";
import { body, validationResult } from "express-validator";
import usuarioService from "../services/usuarioService.js";

const router = express.Router();

// Login con validación robusta
router.post("/login", [
  body("usuario")
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Usuario debe tener entre 3 y 50 caracteres")
    .matches(/^[a-zA-Z0-9_\-\.]+$/)
    .withMessage("Usuario solo puede contener letras, números, guiones y puntos"),
  
  body("contrasena")
    .isLength({ min: 6, max: 100 })
    .withMessage("Contraseña inválida")
], async (req, res) => {
  try {
    // Validar y obtener errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Validación fallida", details: errors.array() });
    }

    const { usuario, contrasena } = req.body;

    const resultado = await usuarioService.login(usuario, contrasena);
    
    // Enviar refresh token como HttpOnly cookie (mas seguro)
    res.cookie("refreshToken", resultado.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    // Enviar access token en el body
    res.json({
      token: resultado.token,
      usuario: resultado.usuario,
      id: resultado.id,
      roles: resultado.roles
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// Refresh token
router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token requerido" });
    }

    const resultado = await usuarioService.refreshToken(refreshToken);

    res.json({
      token: resultado.token,
      usuario: resultado.usuario,
      id: resultado.id
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ mensaje: "Sesión cerrada correctamente" });
});

export default router;
