import usuarioRepository from "../repositories/usuarioRepository.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tu_clave_secreta_super_segura_2024";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "tu_clave_refresh_super_segura_2024";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
const SALT_ROUNDS = 12; // Aumentado para mayor seguridad

class UsuarioService {
  async login(usuario, contrasena) {
    // Validar entrada
    if (!usuario || !contrasena) {
      throw new Error("Usuario y contraseña son requeridos");
    }

    // Sanitizar entrada
    usuario = String(usuario).trim();
    if (usuario.length < 3 || usuario.length > 50) {
      throw new Error("Formato de usuario inválido");
    }

    // Buscar el usuario
    const usuarioEncontrado = await usuarioRepository.obtenerPorUsuario(usuario);
    
    if (!usuarioEncontrado) {
      // Simular delay para prevenir timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      throw new Error("Usuario o contraseña inválidos");
    }

    // Verificar la contraseña
    const contraseñaValida = await bcryptjs.compare(contrasena, usuarioEncontrado.contrasena);
    
    if (!contraseñaValida) {
      throw new Error("Usuario o contraseña inválidos");
    }

    // Generar JWT
    const token = jwt.sign(
      { 
        id: usuarioEncontrado.id, 
        usuario: usuarioEncontrado.usuario,
        roles: usuarioEncontrado.roles,
        tipo: "access"
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Generar Refresh Token
    const refreshToken = jwt.sign(
      { 
        id: usuarioEncontrado.id, 
        usuario: usuarioEncontrado.usuario,
        tipo: "refresh"
      },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );

    return {
      token,
      refreshToken,
      usuario: usuarioEncontrado.usuario,
      id: usuarioEncontrado.id,
      roles: usuarioEncontrado.roles
    };
  }

  async refreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new Error("Refresh token requerido");
      }

      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      
      if (decoded.tipo !== "refresh") {
        throw new Error("Token inválido");
      }

      const usuario = await usuarioRepository.obtenerPorId(decoded.id);
      if (!usuario) {
        throw new Error("Usuario no encontrado");
      }

      // Generar nuevo access token
      const newAccessToken = jwt.sign(
        { 
          id: usuario.id, 
          usuario: usuario.usuario,
          roles: usuario.roles,
          tipo: "access"
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return {
        token: newAccessToken,
        usuario: usuario.usuario,
        id: usuario.id
      };
    } catch (err) {
      throw new Error("Refresh token inválido o expirado");
    }
  }

  async verificarToken(token) {
    try {
      if (!token) {
        throw new Error("Token requerido");
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      
      if (decoded.tipo !== "access") {
        throw new Error("Token inválido");
      }

      return decoded;
    } catch (err) {
      throw new Error("Token inválido o expirado");
    }
  }

  async crearUsuarioOwner() {
    try {
      const usuarioExistente = await usuarioRepository.obtenerPorUsuario(process.env.ADMIN_USERNAME || "main");
      if (usuarioExistente) {
        return; // Ya existe
      }

      const contraseñaHasheada = await bcryptjs.hash(process.env.ADMIN_PASSWORD || "main123", SALT_ROUNDS);
      
      await usuarioRepository.crear({
        usuario: process.env.ADMIN_USERNAME || "main",
        contrasena: contraseñaHasheada,
        roles: "owner"
      });

      console.log("✅ Usuario administrador creado correctamente");
    } catch (err) {
      console.error("Error al crear usuario owner:", err.message);
    }
  }
}

export default new UsuarioService();
export { JWT_SECRET, JWT_REFRESH_SECRET };
