import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import productosService from "../services/productos.service";
import categoriasService from "../services/categorias.service";

const FormularioProducto = () => {
  const { id } = useParams();
  const [cargando, setCargando] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const navigate = useNavigate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { nombre: "", descripcion: "", precio: "", idCategoria: "", disponible: true, imagen: "" }
  });

  useEffect(() => {
    cargarCategorias();
    if (id) cargarProducto();
  }, [id]);

  const cargarCategorias = async () => {
    try {
      const data = await categoriasService.obtenerTodos();
      setCategorias(Array.isArray(data) ? data : []);
    } catch { setCategorias([]); }
  };

  const cargarProducto = async () => {
    try {
      setCargando(true);
      const producto = await productosService.obtenerPorId(id);
      if (producto) reset(producto);
    } catch {
      alert("Error al cargar los datos del producto");
      navigate("/productos");
    } finally { setCargando(false); }
  };

  const onSubmit = async (data) => {
    try {
      setCargando(true);
      data.precio = parseFloat(data.precio);
      if (id) {
        await productosService.actualizar(id, data);
      } else {
        await productosService.crear(data);
      }
      navigate("/productos");
    } catch (error) {
      alert(error.response?.data?.error || "Error al guardar el producto");
    } finally { setCargando(false); }
  };

  if (cargando && id) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 20px', gap: 16, color: 'var(--text-2)' }}>
        <div className="spinner-border text-primary"></div>
        <span>Cargando datos…</span>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">{id ? 'Editar Producto' : 'Nuevo Producto'}</div>
          <div className="page-subtitle">Complete los datos del producto</div>
        </div>
        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/productos")}>
          <i className="fas fa-arrow-left"></i> Volver
        </button>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-7">
          <div className="card">
            <div className="card-body" style={{ padding: '28px' }}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row g-3">
                  <div className="col-md-8">
                    <label htmlFor="prod-nombre" className="form-label">Nombre <span style={{ color: 'var(--red)' }}>*</span></label>
                    <input
                      id="prod-nombre"
                      type="text"
                      className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                      {...register("nombre", { required: "Obligatorio", minLength: { value: 3, message: "Mínimo 3 caracteres" } })}
                      placeholder="Ej: Café Americano"
                    />
                    {errors.nombre && <div className="invalid-feedback">{errors.nombre.message}</div>}
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="prod-precio" className="form-label">Precio <span style={{ color: 'var(--red)' }}>*</span></label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        id="prod-precio"
                        type="number"
                        step="0.01"
                        min="0"
                        className={`form-control ${errors.precio ? 'is-invalid' : ''}`}
                        {...register("precio", { required: "Obligatorio", min: { value: 0.01, message: "Mayor a 0" } })}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.precio && <div className="invalid-feedback d-block">{errors.precio.message}</div>}
                  </div>

                  <div className="col-12">
                    <label htmlFor="prod-descripcion" className="form-label">Descripción</label>
                    <textarea
                      id="prod-descripcion"
                      className="form-control"
                      {...register("descripcion")}
                      rows="2"
                      placeholder="Descripción del producto…"
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="prod-categoria" className="form-label">Categoría <span style={{ color: 'var(--red)' }}>*</span></label>
                    <select
                      id="prod-categoria"
                      className={`form-select ${errors.idCategoria ? 'is-invalid' : ''}`}
                      {...register("idCategoria", { required: "Seleccioná una categoría" })}
                    >
                      <option value="">Seleccionar categoría…</option>
                      {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                    {errors.idCategoria && <div className="invalid-feedback">{errors.idCategoria.message}</div>}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="prod-imagen" className="form-label">URL de imagen</label>
                    <input id="prod-imagen" type="url" className="form-control" {...register("imagen")} placeholder="https://…" />
                  </div>

                  {id && (
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="disponible" {...register("disponible")} />
                        <label className="form-check-label" htmlFor="disponible">Producto disponible</label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/productos")} disabled={cargando}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={cargando}>
                    {cargando
                      ? <><span className="spinner-border spinner-border-sm"></span> Guardando…</>
                      : <><i className={`fas ${id ? 'fa-save' : 'fa-check'}`}></i> {id ? 'Actualizar' : 'Crear Producto'}</>
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormularioProducto;
