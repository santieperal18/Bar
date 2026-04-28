import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Encabezado from "./components/Encabezado";
import PiePagina from "./components/PiePagina";
import ProtectedRoute from "./components/ProtectedRoute";

// Páginas
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

import './App.css';
import './styles/professional.css';
import './styles/restoBar.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="resto-bg min-vh-100 d-flex flex-column">
                <Encabezado />
                <main className="flex-grow-1 py-4">
                  <div className="container-fluid">
                    <Routes>
                      <Route path="/" element={<Pedidos />} />
                      <Route path="/pedidos" element={<Pedidos />} />
                      <Route path="/pedidos/nuevo" element={<FormularioPedido />} />
                      <Route path="/pedidos/editar/:id" element={<FormularioPedido />} />
                      <Route path="/pedidos/duplicar/:id" element={<FormularioPedido duplicar={true} />} />
                      
                      <Route path="/clientes" element={<Clientes />} />
                      <Route path="/clientes/nuevo" element={<FormularioCliente />} />
                      <Route path="/clientes/editar/:id" element={<FormularioCliente />} />
                      
                      <Route path="/productos" element={<Productos />} />
                      <Route path="/productos/nuevo" element={<FormularioProducto />} />
                      <Route path="/productos/editar/:id" element={<FormularioProducto />} />
                      
                      <Route path="/repartidores" element={<Repartidores />} />
                      <Route path="/repartidores/nuevo" element={<FormularioRepartidor />} />
                      <Route path="/repartidores/editar/:id" element={<FormularioRepartidor />} />
                      
                      <Route path="/reportes" element={<Reportes />} />
                      <Route path="/reportes/cliente/:id" element={<Reportes clienteId={true} />} />
                      <Route path="/reportes/:tipo" element={<Reportes />} />
                    </Routes>
                  </div>
                </main>
                <PiePagina />
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

/* =========================================
   ESTILOS BASE Y ANIMACIONES (Principio 2)
   ========================================= */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in { animation: fadeIn 0.5s ease-out; }

.smooth-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Scrollbar personalizado */
.custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #8B4513; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #5D2906; }

/* =========================================
   TABLAS Y TARJETAS (Jerarquía y Simplicidad)
   ========================================= */
.table-hover tbody tr { transition: background-color 0.2s ease; }
.table-hover tbody tr:hover { background-color: rgba(139, 69, 19, 0.05) !important; }

.product-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
  border-radius: 8px;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  border-color: #8B4513;
}

.product-card.added {
  border-color: #28a745;
  background-color: rgba(40, 167, 69, 0.05);
}

/* =========================================
   ESTADOS Y BADGES (Feedback visual)
   ========================================= */
.status-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
}

.status-pending { background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba; }
.status-preparing { background-color: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
.status-delivering { background-color: #cce5ff; color: #004085; border: 1px solid #b8daff; }
.status-delivered { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.status-cancelled { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }

.price-display {
  font-family: 'Poppins', 'Inter', sans-serif;
  font-weight: 700;
}

/* =========================================
   ACCESIBILIDAD Y UX (Principio 5)
   ========================================= */
/* Foco claro para navegación con teclado (Tab) */
button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible {
  outline: 3px solid #8B4513 !important;
  outline-offset: 2px;
  box-shadow: none !important;
}

.empty-state {
  padding: 4rem 2rem;
  text-align: center;
}

.empty-state-icon {
  font-size: 3.5rem;
  color: #dee2e6;
  margin-bottom: 1rem;
}

.loading-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

/* Tooltips CSS nativos */
.custom-tooltip {
  position: relative;
  display: inline-block;
  cursor: help;
}

.custom-tooltip .tooltip-text {
  visibility: hidden;
  width: max-content;
  background-color: #343a40;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 6px 12px;
  position: absolute;
  z-index: 10;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 0.8rem;
}

.custom-tooltip:hover .tooltip-text,
.custom-tooltip:focus .tooltip-text {
  visibility: visible;
  opacity: 1;
}

/* =========================================
   BOTÓN FLOTANTE (Jerarquía de Acción Principal)
   ========================================= */
.floating-action-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 65px;
  height: 65px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);
  z-index: 1000;
  transition: all 0.3s ease;
  background-color: #8B4513 !important; /* Tu color temático */
}

.floating-action-btn:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 8px 25px rgba(139, 69, 19, 0.4);
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(139, 69, 19, 0.5); }
  70% { box-shadow: 0 0 0 15px rgba(139, 69, 19, 0); }
  100% { box-shadow: 0 0 0 0 rgba(139, 69, 19, 0); }
}

@media (max-width: 768px) {
  .floating-action-btn {
    bottom: 20px;
    right: 20px;
    width: 55px;
    height: 55px;
  }
}

export default App;
