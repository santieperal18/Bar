import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tu_clave_secreta_super_segura_2024";

// Middleware para verificar token JWT
export const verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }

    // Esperar formato: "Bearer token"
    const partes = authHeader.split(" ");
    if (partes.length !== 2 || partes[0] !== "Bearer") {
      return res.status(401).json({ error: "Formato de token inválido" });
    }

    const token = partes[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      if (decoded.tipo !== "access") {
        return res.status(401).json({ error: "Token inválido" });
      }

      req.usuario = decoded;
      next();
    } catch (jwtErr) {
      if (jwtErr.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expirado" });
      }
      return res.status(401).json({ error: "Token inválido" });
    }
  } catch (err) {
    return res.status(500).json({ error: "Error al verificar token" });
  }
};

// Middleware para verificar rol
export const verificarRol = (rolesPermitidos = []) => {
  return (req, res, next) => {
    try {
      if (!req.usuario) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      if (!rolesPermitidos.includes(req.usuario.roles)) {
        return res.status(403).json({ error: "Acceso denegado. Permisos insuficientes" });
      }

      next();
    } catch (err) {
      return res.status(500).json({ error: "Error al verificar rol" });
    }
  };
};

// Middleware para registrar intentos de acceso (logging)
export const registrarAcceso = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const usuario = req.usuario?.usuario || "anonimo";
  const metodo = req.method;
  const url = req.originalUrl;
  
  console.log(`[${timestamp}] ${usuario} - ${metodo} ${url}`);
  next();
};
