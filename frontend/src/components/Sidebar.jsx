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

const Sidebar = ({ isOpen, onClose }) => {
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

      <aside className={`sidebar${isOpen ? ' open' : ''}`}>
        <NavLink to="/pedidos" className="sidebar-brand" onClick={onClose}>
          <div className="sidebar-brand-icon">
            <i className="fas fa-wine-glass-alt"></i>
          </div>
          <div>
            <div className="sidebar-brand-name">La Esquina</div>
            <div className="sidebar-brand-sub">Resto Bar</div>
          </div>
        </NavLink>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <i className={`fas ${item.icon}`}></i>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {usuario.charAt(0).toUpperCase()}
            </div>
            <span className="sidebar-user-name">{usuario}</span>
          </div>

          <button className="sidebar-theme-toggle" onClick={toggleTheme}>
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
          </button>

          <button onClick={handleLogout} className="sidebar-logout">
            <i className="fas fa-sign-out-alt"></i>
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
