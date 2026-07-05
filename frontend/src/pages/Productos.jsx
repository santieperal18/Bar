import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import categoriasService from "../services/categorias.service";
import productosService from "../services/productos.service";

const Productos = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState({ nombre: "", tipo: "comida", descripcion: "" });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    try {
      setCargando(true);
      const [prods, cats] = await Promise.all([
        productosService.obtenerTodos(),
        categoriasService.obtenerTodos()
      ]);
      setProductos(Array.isArray(prods) ? prods : []);
      setCategorias(Array.isArray(cats) ? cats : []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "No se pudieron cargar productos y categorias");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const eliminar = async (id) => {
    try {
      await productosService.eliminar(id);
      await cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo ocultar el producto");
    }
  };

  const crearCategoria = async () => {
    try {
      if (!nuevaCategoria.nombre.trim()) {
        setError("La categoria necesita un nombre.");
        return;
      }
      await categoriasService.crear(nuevaCategoria);
      setNuevaCategoria({ nombre: "", tipo: "comida", descripcion: "" });
      await cargar();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo crear la categoria");
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Productos y Categorias</div>
          <div className="page-subtitle">Backoffice del menu, rentabilidad y stock basico</div>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => navigate("/productos/nuevo")}>Nuevo Producto</button>
      </div>

      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-8">
          <div className="table-wrap">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoria</th>
                  <th className="text-end">Salon</th>
                  <th className="text-end">Mostrador</th>
                  <th className="text-end">Costo</th>
                  <th className="text-end">Margen</th>
                  <th className="text-center">Stock</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando && (
                  <tr>
                    <td colSpan="8">Cargando productos...</td>
                  </tr>
                )}
                {!cargando && productos.length === 0 && (
                  <tr>
                    <td colSpan="8">Todavia no hay productos cargados.</td>
                  </tr>
                )}
                {productos.map((producto) => {
                  const margen = Number(producto.precioMostrador || 0) - Number(producto.costo || 0);
                  return (
                    <tr key={producto.id}>
                      <td>
                        <strong>{producto.nombre}</strong>
                        <div style={{ color: "var(--text-2)", fontSize: 12 }}>{producto.disponible ? "Visible" : "Oculto"}</div>
                      </td>
                      <td>{producto.categoria?.nombre || "-"}</td>
                      <td className="text-end">${Number(producto.precioSalon || 0).toFixed(2)}</td>
                      <td className="text-end">${Number(producto.precioMostrador || 0).toFixed(2)}</td>
                      <td className="text-end">${Number(producto.costo || 0).toFixed(2)}</td>
                      <td className="text-end" style={{ color: margen >= 0 ? "var(--green)" : "var(--red)" }}>${margen.toFixed(2)}</td>
                      <td className="text-center">
                        {producto.controlaStock ? (
                          <span className={`status-badge ${Number(producto.stockActual || 0) > 3 ? "sb-preparing" : "sb-cancelled"}`}>{producto.stockActual}</span>
                        ) : (
                          <span className="status-badge sb-default">No aplica</span>
                        )}
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-1">
                          <button type="button" className="btn btn-icon-sm text-primary" onClick={() => navigate(`/productos/editar/${producto.id}`)} aria-label={`Editar ${producto.nombre}`}><i className="fas fa-pen"></i></button>
                          <button type="button" className="btn btn-icon-sm text-danger" onClick={() => eliminar(producto.id)} aria-label={`Ocultar ${producto.nombre}`}><i className="fas fa-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card">
            <div className="card-header">Alta rapida de categoria</div>
            <div className="card-body d-flex flex-column gap-3">
              <input
                id="nombreCategoria"
                name="nombreCategoria"
                className="form-control"
                placeholder="Nombre"
                value={nuevaCategoria.nombre}
                onChange={(e) => setNuevaCategoria((prev) => ({ ...prev, nombre: e.target.value }))}
              />
              <select
                id="tipoCategoria"
                name="tipoCategoria"
                className="form-select"
                value={nuevaCategoria.tipo}
                onChange={(e) => setNuevaCategoria((prev) => ({ ...prev, tipo: e.target.value }))}
              >
                <option value="desayuno">Desayuno</option>
                <option value="comida">Comida</option>
                <option value="bebida">Bebida</option>
              </select>
              <textarea
                id="descripcionCategoria"
                name="descripcionCategoria"
                className="form-control"
                rows="3"
                placeholder="Descripcion"
                value={nuevaCategoria.descripcion}
                onChange={(e) => setNuevaCategoria((prev) => ({ ...prev, descripcion: e.target.value }))}
              />
              <button type="button" className="btn btn-primary" onClick={crearCategoria}>Crear categoria</button>
              <div className="d-flex flex-wrap gap-2">
                {categorias.map((categoria) => <span key={categoria.id} className="status-badge sb-active">{categoria.nombre}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Productos;
