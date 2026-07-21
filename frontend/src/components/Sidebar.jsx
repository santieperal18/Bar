import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const NAV_ITEMS = [
  { to: "/salon", icon: "fa-cash-register", label: "Salón y Caja" },
  { to: "/cocina", icon: "fa-fire-burner", label: "Cocina" },
  { to: "/pedidos", icon: "fa-receipt", label: "Pedidos" },
  { to: "/clientes", icon: "fa-users", label: "Clientes" },
  { to: "/productos", icon: "fa-utensils", label: "Productos" },
  { to: "/repartidores", icon: "fa-motorcycle", label: "Repartidores" },
  { to: "/reportes", icon: "fa-chart-bar", label: "Backoffice", permiso: "reportes.ver" },
  { to: "/usuarios", icon: "fa-user-shield", label: "Usuarios", permiso: "usuarios.gestionar" }
];

const Sidebar = ({ isOpen, onClose, collapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const usuario = localStorage.getItem("usuario") || "Admin";
  const permisos = JSON.parse(localStorage.getItem("permisos") || "[]");

  const handleLogout = async () => {
    try { await fetch(`${import.meta.env.VITE_APP_API_URL || "http://localhost:3000/api"}/auth/logout`, { method: "POST", credentials: "include", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }); } catch { /* La limpieza local debe ocurrir incluso sin red. */ }
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("permisos");
    navigate("/login");
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar${isOpen ? " open" : ""}${collapsed ? " collapsed" : ""}`}>
        <NavLink to="/salon" className="sidebar-brand" onClick={onClose}>
          <div className="sidebar-brand-icon">
            <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="La Esquina" />
          </div>
          <div className="sidebar-label">
            <div className="sidebar-brand-name">La Esquina</div>
            <div className="sidebar-brand-sub">Resto Bar SaaS</div>
          </div>
        </NavLink>

        <nav className="sidebar-nav">
          {NAV_ITEMS.filter((item) => !item.permiso || permisos.includes("*") || permisos.includes(item.permiso)).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              data-label={item.label}
              className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
            >
              <i className={`fas ${item.icon}`}></i>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}

          <button className="sidebar-pin-btn" onClick={onToggleCollapse}>
            <i className={`fas fa-chevron-${collapsed ? "right" : "left"}`}></i>
            <span className="sidebar-label">{collapsed ? "Expandir" : "Minimizar"}</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{usuario.charAt(0).toUpperCase()}</div>
            <span className="sidebar-user-name sidebar-label">{usuario}</span>
          </div>

          <button className="sidebar-theme-toggle" onClick={toggleTheme}>
            <i className={`fas ${theme === "dark" ? "fa-sun" : "fa-moon"}`}></i>
            <span className="sidebar-label">{theme === "dark" ? "Modo Claro" : "Modo Oscuro"}</span>
          </button>

          <button onClick={handleLogout} className="sidebar-logout">
            <i className="fas fa-sign-out-alt"></i>
            <span className="sidebar-label">Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
