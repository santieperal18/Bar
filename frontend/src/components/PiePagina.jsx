import React from 'react';

function PiePagina() {
  return (
    <footer className="bg-white border-top py-3 mt-auto">
      <div className="container-fluid px-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small text-muted">
          <div className="mb-2 mb-md-0">
            <i className="fas fa-store me-2 text-primary"></i>
            <span className="fw-bold text-dark">Resto Bar "La Esquina"</span> &copy; {new Date().getFullYear()}
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="bg-light px-2 py-1 rounded border">Sistema de Gestión v1.0</span>
            <span className="d-none d-md-inline text-light">|</span>
            <a href="#" className="text-muted text-decoration-none d-none d-md-inline hover-primary">
              <i className="fas fa-headset me-1"></i>Soporte Técnico
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default PiePagina;
