import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Encabezado = () => {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleLogout = () => {
    navigate('/login');
  };

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  return (
    <header className="bg-white shadow-sm sticky-top" style={{ zIndex: 1020 }}>
      {/* Barra superior secundaria (Info del local) - Se oculta en celulares */}
      <div className="bg-light border-bottom py-2 d-none d-md-block">
        <div className="container-fluid px-4 d-flex justify-content-between align-items-center small">
          <div className="text-muted fw-bold">
            <i className="fas fa-utensils me-2 text-primary"></i> 
            Sistema de Gestión
          </div>
          <div className="d-flex gap-4 text-muted fw-bold">
            <span><i className="fas fa-phone me-2"></i>+54 351 323-7878</span>
            <span><i className="far fa-clock me-2"></i>06:00 - 15:00 hs</span>
            <span><i className="fas fa-user-circle me-2"></i>Admin</span>
          </div>
        </div>
      </div>

      {/* Barra de Navegación Principal */}
      <nav className="navbar navbar-expand-lg navbar-light py-3">
        <div className="container-fluid px-4">
          
          {/* BRANDING: Logo y Nombre visibles siempre */}
          <NavLink to="/pedidos" className="navbar-brand d-flex align-items-center gap-3 text-decoration-none" onClick={cerrarMenu}>
            <div className="bg-light rounded-circle d-flex justify-content-center align-items-center overflow-hidden border" style={{width: '45px', height: '45px', flexShrink: 0}}>
              <img 
                src="/logo.png" 
                alt="Logo La Esquina" 
                style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                onError={(e) => { 
                  e.target.onerror = null; 
                  e.target.src = "https://via.placeholder.com/45x45/0b57d0/ffffff?text=LE"; 
                }} 
              />
            </div>
            <div className="d-flex flex-column">
              <span className="fw-bold fs-5 lh-1 text-dark" style={{ color: 'var(--primary-color)' }}>La Esquina</span>
              <span className="text-primary fw-bold text-uppercase d-none d-sm-block" style={{fontSize: '0.65rem', letterSpacing: '1px'}}>Resto Bar</span>
            </div>
          </NavLink>

          {/* Botón hamburguesa */}
          <button 
            className="navbar-toggler border-0 shadow-none" 
            type="button" 
            onClick={toggleMenu}
            aria-label="Abrir menú de navegación"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Enlaces de navegación */}
          <div className={`collapse navbar-collapse mt-3 mt-lg-0 ${menuAbierto ? 'show' : ''}`} id="navbarNav">
            <ul className="navbar-nav ms-auto gap-2 align-items-lg-center">
              <li className="nav-item">
                <NavLink 
                  to="/pedidos" 
                  onClick={cerrarMenu}
                  className={({isActive}) => `nav-link modern-nav-link ${isActive ? 'active' : ''}`}
                >
                  <i className="fas fa-shopping-cart me-2"></i>Pedidos
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink 
                  to="/clientes" 
                  onClick={cerrarMenu}
                  className={({isActive}) => `nav-link modern-nav-link ${isActive ? 'active' : ''}`}
                >
                  <i className="fas fa-users me-2"></i>Clientes
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink 
                  to="/productos" 
                  onClick={cerrarMenu}
                  className={({isActive}) => `nav-link modern-nav-link ${isActive ? 'active' : ''}`}
                >
                  <i className="fas fa-hamburger me-2"></i>Productos
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink 
                  to="/repartidores" 
                  onClick={cerrarMenu}
                  className={({isActive}) => `nav-link modern-nav-link ${isActive ? 'active' : ''}`}
                >
                  <i className="fas fa-motorcycle me-2"></i>Repartidores
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink 
                  to="/reportes" 
                  onClick={cerrarMenu}
                  className={({isActive}) => `nav-link modern-nav-link ${isActive ? 'active' : ''}`}
                >
                  <i className="fas fa-chart-bar me-2"></i>Reportes
                </NavLink>
              </li>
              <li className="nav-item ms-lg-3 mt-3 mt-lg-0">
                <button onClick={handleLogout} className="btn btn-light text-danger rounded-pill px-4 fw-bold border w-100">
                  <i className="fas fa-sign-out-alt me-2"></i>Salir
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Encabezado;
