import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const NAV_ITEMS = [
  { to: '/pedidos',      icon: 'fa-receipt',    label: 'Pedidos'      },
  { to: '/clientes',     icon: 'fa-users',       label: 'Clientes'     },
  { to: '/productos',    icon: 'fa-utensils',    label: 'Productos'    },
  { to: '/repartidores', icon: 'fa-motorcycle',  label: 'Repartidores' },
  { to: '/reportes',     icon: 'fa-chart-bar',   label: 'Reportes'     },
];

const Sidebar = ({ isOpen, onClose, collapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const usuario = localStorage.getItem('usuario') || 'Admin';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar${isOpen ? ' open' : ''}${collapsed ? ' collapsed' : ''}`}>

        {/* Brand */}
        <NavLink to="/pedidos" className="sidebar-brand" onClick={onClose}>
          <div className="sidebar-brand-icon">
            <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="La Esquina" />
          </div>
          <div className="sidebar-label">
            <div className="sidebar-brand-name">La Esquina</div>
            <div className="sidebar-brand-sub">Resto Bar</div>
          </div>
        </NavLink>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              data-label={item.label}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <i className={`fas ${item.icon}`}></i>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}

          {/* Collapse toggle — desktop only */}
          <button className="sidebar-pin-btn" onClick={onToggleCollapse} title={collapsed ? 'Expandir menú' : 'Minimizar menú'}>
            <i className={`fas fa-chevron-${collapsed ? 'right' : 'left'}`}></i>
            <span className="sidebar-label">{collapsed ? 'Expandir' : 'Minimizar'}</span>
          </button>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user" title={collapsed ? usuario : ''}>
            <div className="sidebar-user-avatar">
              {usuario.charAt(0).toUpperCase()}
            </div>
            <span className="sidebar-user-name sidebar-label">{usuario}</span>
          </div>

          <button className="sidebar-theme-toggle" onClick={toggleTheme} title={collapsed ? (theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro') : ''}>
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            <span className="sidebar-label">{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
          </button>

          <button onClick={handleLogout} className="sidebar-logout" title={collapsed ? 'Cerrar sesión' : ''}>
            <i className="fas fa-sign-out-alt"></i>
            <span className="sidebar-label">Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
