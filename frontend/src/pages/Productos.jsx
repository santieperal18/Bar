import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import categoriasService from "../services/categorias.service";
import productosService from "../services/productos.service";

const Productos = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState({ nombre: "", tipo: "comida", descripcion: "" });

  const cargar = async () => {
    const [prods, cats] = await Promise.all([
      productosService.obtenerTodos(),
      categoriasService.obtenerTodos()
    ]);
    setProductos(prods);
    setCategorias(cats);
  };

  useEffect(() => {
    cargar();
  }, []);

  const eliminar = async (id) => {
    await productosService.eliminar(id);
    await cargar();
  };

  const crearCategoria = async () => {
    await categoriasService.crear(nuevaCategoria);
    setNuevaCategoria({ nombre: "", tipo: "comida", descripcion: "" });
    await cargar();
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Productos y Categorías</div>
          <div className="page-subtitle">Backoffice del menú, visibilidad y stock básico</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/productos/nuevo")}>Nuevo Producto</button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-8">
          <div className="table-wrap">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th className="text-end">Salón</th>
                  <th className="text-end">Mostrador</th>
                  <th className="text-center">Stock</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => (
                  <tr key={producto.id}>
                    <td>
                      <strong>{producto.nombre}</strong>
                      <div style={{ color: "var(--text-2)", fontSize: 12 }}>{producto.disponible ? "Visible" : "Oculto"}</div>
                    </td>
                    <td>{producto.categoria?.nombre || "-"}</td>
                    <td className="text-end">${Number(producto.precioSalon || 0).toFixed(2)}</td>
                    <td className="text-end">${Number(producto.precioMostrador || 0).toFixed(2)}</td>
                    <td className="text-center">
                      {producto.controlaStock ? <span className="status-badge sb-preparing">{producto.stockActual}</span> : <span className="status-badge sb-default">No aplica</span>}
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-1">
                        <button className="btn btn-icon-sm text-primary" onClick={() => navigate(`/productos/editar/${producto.id}`)}><i className="fas fa-pen"></i></button>
                        <button className="btn btn-icon-sm text-danger" onClick={() => eliminar(producto.id)}><i className="fas fa-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card">
            <div className="card-header">Alta rápida de categoría</div>
            <div className="card-body d-flex flex-column gap-3">
              <input className="form-control" placeholder="Nombre" value={nuevaCategoria.nombre} onChange={(e) => setNuevaCategoria((prev) => ({ ...prev, nombre: e.target.value }))} />
              <select className="form-select" value={nuevaCategoria.tipo} onChange={(e) => setNuevaCategoria((prev) => ({ ...prev, tipo: e.target.value }))}>
                <option value="desayuno">Desayuno</option>
                <option value="comida">Comida</option>
                <option value="bebida">Bebida</option>
              </select>
              <textarea className="form-control" rows="3" placeholder="Descripción" value={nuevaCategoria.descripcion} onChange={(e) => setNuevaCategoria((prev) => ({ ...prev, descripcion: e.target.value }))} />
              <button className="btn btn-primary" onClick={crearCategoria}>Crear categoría</button>
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
