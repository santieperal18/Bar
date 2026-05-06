import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Encabezado = () => {
  const navigate = useNavigate();
  // Estado para controlar el menú en celulares
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleLogout = () => {
    // Lógica para cerrar sesión
    navigate('/login');
  };

  // Función para abrir/cerrar tocando las 3 rayitas
  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  // Función para cerrar el menú automáticamente al tocar un link
  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  return (
    <header className="bg-white shadow-sm sticky-top" style={{ zIndex: 1020 }}>
      {/* Barra superior secundaria (Info del local) - Se oculta en celulares */}
      <div className="bg-light border-bottom py-2 d-none d-md-block">
        <div className="container-fluid px-4 d-flex justify-content-between align-items-center small">
          <div className="text-muted fw-bold">
            <i className="fas fa-store me-2 text-primary"></i> 
            Resto Bar "La Esquina"
            <span className="ms-2 fw-normal opacity-75">| Sistema de Gestión</span>
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
          
          {/* Título y Logo solo visible en celulares */}
          <span className="navbar-brand fw-bold d-md-none d-flex align-items-center gap-2" style={{ color: 'var(--primary-color)' }}>
            <img 
              src="/logo.png" 
              alt="Logo" 
              style={{width: '32px', height: '32px', objectFit: 'cover', borderRadius: '50%'}} 
              onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/32x32/0b57d0/ffffff?text=LE"; }} 
            />
            La Esquina
          </span>

          {/* Botón hamburguesa (Controlado por React) */}
          <button 
            className="navbar-toggler border-0 shadow-none" 
            type="button" 
            onClick={toggleMenu}
            aria-label="Abrir menú de navegación"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Enlaces de navegación (Se muestran u ocultan según el estado menuAbierto) */}
          <div className={`collapse navbar-collapse mt-3 mt-lg-0 ${menuAbierto ? 'show' : ''}`} id="navbarNav">
            <ul className="navbar-nav me-auto gap-2">
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
            </ul>
            
            {/* Botón de salir */}
            <button onClick={handleLogout} className="btn btn-light text-danger rounded-pill px-4 fw-bold mt-3 mt-lg-0 border">
              <i className="fas fa-sign-out-alt me-2"></i>Salir
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Encabezado;
