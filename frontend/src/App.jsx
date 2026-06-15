import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider, useTheme } from './context/ThemeContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Pedidos from './pages/Pedidos';
import FormularioPedido from './pages/FormularioPedido';
import Clientes from './pages/Clientes';
import FormularioCliente from './pages/FormularioCliente';
import Productos from './pages/Productos';
import FormularioProducto from './pages/FormularioProducto';
import Repartidores from './pages/Repartidores';
import FormularioRepartidor from './pages/FormularioRepartidor';
import Reportes from './pages/Reportes';

const MobileTopbar = ({ onMenuOpen }) => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="mobile-topbar">
      <button className="mobile-menu-btn" onClick={onMenuOpen} aria-label="Abrir menú">
        <i className="fas fa-bars"></i>
      </button>
      <span className="mobile-brand">La Esquina</span>
      <button className="mobile-theme-btn" onClick={toggleTheme} aria-label="Cambiar tema">
        <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
      </button>
    </div>
  );
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === 'true'
  );

  const toggleCollapsed = () => {
    setSidebarCollapsed(v => {
      const next = !v;
      localStorage.setItem('sidebarCollapsed', String(next));
      return next;
    });
  };

  return (
    <ThemeProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div
                  className="app-layout"
                  style={{ '--sidebar-current-w': sidebarCollapsed ? '64px' : 'var(--sidebar-w)' }}
                >
                  <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    collapsed={sidebarCollapsed}
                    onToggleCollapse={toggleCollapsed}
                  />
                  <main className="app-main">
                    <MobileTopbar onMenuOpen={() => setSidebarOpen(true)} />
                    <div className="page-wrap fade-in">
                      <Routes>
                        <Route path="/"                          element={<Pedidos />} />
                        <Route path="/pedidos"                   element={<Pedidos />} />
                        <Route path="/pedidos/nuevo"             element={<FormularioPedido />} />
                        <Route path="/pedidos/editar/:id"        element={<FormularioPedido />} />
                        <Route path="/pedidos/duplicar/:id"      element={<FormularioPedido duplicar={true} />} />
                        <Route path="/clientes"                  element={<Clientes />} />
                        <Route path="/clientes/nuevo"            element={<FormularioCliente />} />
                        <Route path="/clientes/editar/:id"       element={<FormularioCliente />} />
                        <Route path="/productos"                 element={<Productos />} />
                        <Route path="/productos/nuevo"           element={<FormularioProducto />} />
                        <Route path="/productos/editar/:id"      element={<FormularioProducto />} />
                        <Route path="/repartidores"              element={<Repartidores />} />
                        <Route path="/repartidores/nuevo"        element={<FormularioRepartidor />} />
                        <Route path="/repartidores/editar/:id"   element={<FormularioRepartidor />} />
                        <Route path="/reportes"                  element={<Reportes />} />
                        <Route path="/reportes/cliente/:id"      element={<Reportes clienteId={true} />} />
                        <Route path="/reportes/:tipo"            element={<Reportes />} />
                      </Routes>
                    </div>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
