import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

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

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="app-layout">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <main className="app-main">
                  <div className="mobile-topbar">
                    <button
                      className="mobile-menu-btn"
                      onClick={() => setSidebarOpen(true)}
                      aria-label="Abrir menú"
                    >
                      <i className="fas fa-bars"></i>
                    </button>
                    <span className="mobile-brand">La Esquina</span>
                  </div>
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
  );
}

export default App;
