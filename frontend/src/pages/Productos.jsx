import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import productosService from "../services/productos.service";
import categoriasService from "../services/categorias.service";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [filtros, setFiltros] = useState({ texto: "", categoria: "", soloDisponibles: false });
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { cargarDatos(); }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros, productos]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [prods, cats] = await Promise.all([
        productosService.obtenerTodos(),
        categoriasService.obtenerTodos()
      ]);
      setProductos(Array.isArray(prods) ? prods : []);
      setCategorias(Array.isArray(cats) ? cats : []);
    } catch { setProductos([]); setCategorias([]); }
    finally { setCargando(false); }
  };

  const aplicarFiltros = () => {
    let lista = [...productos];
    if (filtros.texto) {
      const q = filtros.texto.toLowerCase();
      lista = lista.filter(p => p.nombre?.toLowerCase().includes(q) || p.descripcion?.toLowerCase().includes(q));
    }
    if (filtros.categoria) {
      lista = lista.filter(p => p.idCategoria === parseInt(filtros.categoria));
    }
    if (filtros.soloDisponibles) {
      lista = lista.filter(p => p.disponible);
    }
    setProductosFiltrados(lista);
  };

  const limpiar = () => {
    setFiltros({ texto: "", categoria: "", soloDisponibles: false });
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await productosService.eliminar(id);
      setProductos(prev => prev.filter(p => p.id !== id));
    } catch { alert("Error al eliminar el producto"); }
  };

  const getCategoria = (idCat) => categorias.find(c => c.id === idCat);
  const getTipoBadge = (tipo) => {
    const map = { desayuno: 'sb-desayuno', comida: 'sb-comida', bebida: 'sb-bebida' };
    return map[tipo] || 'sb-default';
  };

  const lista = productosFiltrados;

  if (cargando) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 20px', gap: 16, color: 'var(--text-2)' }}>
        <div className="spinner-border text-primary"></div>
        <span>Cargando productos…</span>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Productos</div>
          <div className="page-subtitle">Catálogo del menú y disponibilidad</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/productos/nuevo")}>
          <i className="fas fa-plus"></i> Nuevo Producto
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <div className="stat-card-label">Total</div>
            <div className="stat-card-value">{productos.length}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card stat-green">
            <div className="stat-card-label">Disponibles</div>
            <div className="stat-card-value">{productos.filter(p => p.disponible).length}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card stat-accent">
            <div className="stat-card-label">Desayunos</div>
            <div className="stat-card-value">{productos.filter(p => getCategoria(p.idCategoria)?.tipo === 'desayuno').length}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card stat-blue">
            <div className="stat-card-label">Bebidas</div>
            <div className="stat-card-value">{productos.filter(p => getCategoria(p.idCategoria)?.tipo === 'bebida').length}</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filter-panel mb-3">
        <div className="row g-2 align-items-end">
          <div className="col-12 col-md-4">
            <div className="input-group">
              <span className="input-group-text"><i className="fas fa-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre o descripción…"
                value={filtros.texto}
                onChange={e => setFiltros({ ...filtros, texto: e.target.value })}
              />
            </div>
          </div>
          <div className="col-12 col-md-3">
            <select className="form-select" value={filtros.categoria} onChange={e => setFiltros({ ...filtros, categoria: e.target.value })}>
              <option value="">Todas las categorías</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="col-12 col-md-3 d-flex align-items-center gap-2">
            <div className="form-check mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                id="soloDisp"
                checked={filtros.soloDisponibles}
                onChange={e => setFiltros({ ...filtros, soloDisponibles: e.target.checked })}
              />
              <label className="form-check-label" htmlFor="soloDisp">Solo disponibles</label>
            </div>
          </div>
          <div className="col-12 col-md-2">
            <button className="btn btn-outline-secondary w-100" onClick={limpiar}>
              <i className="fas fa-undo"></i> Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* ── DESKTOP: Tabla ── */}
      <div className="show-desktop">
        <div className="table-wrap">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th style={{ width: 50 }}>#</th>
                <th>Nombre</th>
                <th className="d-none d-lg-table-cell">Descripción</th>
                <th className="d-none d-md-table-cell">Categoría</th>
                <th className="d-none d-md-table-cell text-center" style={{ width: 100 }}>Tipo</th>
                <th className="text-end" style={{ width: 90 }}>Precio</th>
                <th className="text-center" style={{ width: 110 }}>Disponible</th>
                <th className="text-center" style={{ width: 90 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 ? (
                <tr><td colSpan="8">
                  <div className="empty-state">
                    <i className="fas fa-utensils"></i>
                    <h6>Sin productos</h6>
                    <p>No se encontraron resultados con los filtros actuales.</p>
                  </div>
                </td></tr>
              ) : lista.map(p => {
                const cat = getCategoria(p.idCategoria);
                return (
                  <tr key={p.id}>
                    <td style={{ color: 'var(--text-2)', fontSize: 13, fontWeight: 600 }}>#{p.id}</td>
                    <td><span style={{ fontWeight: 600 }}>{p.nombre}</span></td>
                    <td className="d-none d-lg-table-cell" style={{ color: 'var(--text-2)', fontSize: 13, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.descripcion || <span style={{ color: 'var(--text-3)' }}>—</span>}
                    </td>
                    <td className="d-none d-md-table-cell" style={{ color: 'var(--text-2)' }}>
                      {cat?.nombre || '—'}
                    </td>
                    <td className="d-none d-md-table-cell text-center">
                      {cat?.tipo && (
                        <span className={`status-badge ${getTipoBadge(cat.tipo)}`}>{cat.tipo}</span>
                      )}
                    </td>
                    <td className="text-end" style={{ fontWeight: 700, color: 'var(--accent)' }}>
                      ${parseFloat(p.precio || 0).toFixed(2)}
                    </td>
                    <td className="text-center">
                      <span className={`status-badge ${p.disponible ? 'sb-active' : 'sb-inactive'}`}>
                        {p.disponible ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-1">
                        <button className="btn btn-icon-sm text-primary" onClick={() => navigate(`/productos/editar/${p.id}`)} title="Editar">
                          <i className="fas fa-pen"></i>
                        </button>
                        <button className="btn btn-icon-sm text-danger" onClick={() => eliminar(p.id)} title="Eliminar">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MOBILE: Cards ── */}
      <div className="show-mobile">
        {lista.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-utensils"></i>
            <h6>Sin productos</h6>
            <p>No se encontraron resultados con los filtros actuales.</p>
          </div>
        ) : (
          <div className="m-list">
            {lista.map(p => {
              const cat = getCategoria(p.idCategoria);
              return (
                <div key={p.id} className="m-card">
                  {/* Fila 1: nombre + precio */}
                  <div className="m-row">
                    <span className="m-name">{p.nombre}</span>
                    <span className="m-price">${parseFloat(p.precio || 0).toFixed(2)}</span>
                  </div>

                  {/* Fila 2: badges + acciones */}
                  <div className="m-row" style={{ alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {cat?.tipo && (
                        <span className={`status-badge ${getTipoBadge(cat.tipo)}`} style={{ fontSize: 11 }}>{cat.tipo}</span>
                      )}
                      <span className={`status-badge ${p.disponible ? 'sb-active' : 'sb-inactive'}`} style={{ fontSize: 11 }}>
                        {p.disponible ? 'Disponible' : 'No disponible'}
                      </span>
                    </div>
                    <div className="m-actions">
                      <button className="btn btn-icon-sm text-primary" onClick={() => navigate(`/productos/editar/${p.id}`)} title="Editar">
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="btn btn-icon-sm text-danger" onClick={() => eliminar(p.id)} title="Eliminar">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button className="fab-btn" onClick={() => navigate("/productos/nuevo")} aria-label="Nuevo producto">
        <i className="fas fa-plus"></i>
      </button>
    </>
  );
};

export default Productos;
