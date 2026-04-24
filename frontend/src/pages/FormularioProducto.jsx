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
  
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: { nombre: "", descripcion: "", precio: "", idCategoria: "", disponible: true, imagen: "" }
  });

  useEffect(() => {
    cargarCategorias();
    if (id) {
      cargarProducto();
    }
  }, [id]);

  const cargarCategorias = async () => {
    try {
      const data = await categoriasService.obtenerTodos();
      // ESCUDO
      setCategorias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando categorías:", error);
      alert("Error al cargar las categorías");
      setCategorias([]);
    }
  };

  const cargarProducto = async () => {
    try {
      setCargando(true);
      const producto = await productosService.obtenerPorId(id);
      if (producto) reset(producto);
    } catch (error) {
      console.error("Error cargando producto:", error);
      alert("Error al cargar los datos del producto");
      navigate("/productos");
    } finally {
      setCargando(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setCargando(true);
      data.precio = parseFloat(data.precio);
      
      if (id) {
        await productosService.actualizar(id, data);
        alert("Producto actualizado exitosamente");
      } else {
        await productosService.crear(data);
        alert("Producto creado exitosamente");
      }
      navigate("/productos");
    } catch (error) {
      console.error("Error guardando producto:", error);
      alert(error.response?.data?.error || "Error al guardar el producto");
    } finally {
      setCargando(false);
    }
  };

  const idCategoriaSeleccionada = watch("idCategoria");
  const catSeguras = Array.isArray(categorias) ? categorias : [];
  const categoriaSeleccionada = catSeguras.find(c => c.id == idCategoriaSeleccionada);

  if (cargando && id) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando...</span></div>
        <p className="mt-3">Cargando datos del producto...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0"><i className={`fas ${id ? 'fa-edit' : 'fa-hamburger'} me-2`}></i>{id ? "Editar Producto" : "Nuevo Producto"}</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row">
                  <div className="col-md-8 mb-3">
                    <label className="form-label"><i className="fas fa-tag me-2 text-primary"></i>Nombre <span className="text-danger">*</span></label>
                    <input type="text" className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} {...register("nombre", { required: "Obligatorio", minLength: { value: 3, message: "Mínimo 3 caracteres" }})} placeholder="Ej: Café Americano" />
                    {errors.nombre && <div className="invalid-feedback">{errors.nombre.message}</div>}
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label"><i className="fas fa-dollar-sign me-2 text-primary"></i>Precio <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input type="number" step="0.01" min="0" className={`form-control ${errors.precio ? 'is-invalid' : ''}`} {...register("precio", { required: "Obligatorio", min: { value: 0.01, message: "Mayor a 0" }})} placeholder="0.00" />
                    </div>
                    {errors.precio && <div className="invalid-feedback d-block">{errors.precio.message}</div>}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label"><i className="fas fa-align-left me-2 text-primary"></i>Descripción</label>
                  <textarea className="form-control" {...register("descripcion")} rows="3" placeholder="Descripción detallada..." />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label"><i className="fas fa-layer-group me-2 text-primary"></i>Categoría <span className="text-danger">*</span></label>
                    <select className={`form-select ${errors.idCategoria ? 'is-invalid' : ''}`} {...register("idCategoria", { required: "Obligatorio" })}>
                      <option value="">Seleccionar categoría...</option>
                      {catSeguras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                    {errors.idCategoria && <div className="invalid-feedback">{errors.idCategoria.message}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label"><i className="fas fa-image me-2 text-primary"></i>URL de Imagen</label>
                    <input type="url" className="form-control" {...register("imagen")} placeholder="https://..." />
                  </div>
                </div>

                {id && (
                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="disponible" {...register("disponible")} />
                      <label className="form-check-label" htmlFor="disponible">Producto disponible</label>
                    </div>
                  </div>
                )}

                <div className="d-flex justify-content-between mt-4">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/productos")} disabled={cargando}><i className="fas fa-arrow-left me-2"></i>Volver</button>
                  <button type="submit" className="btn btn-primary" disabled={cargando}>
                    {cargando ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Guardando...</> : <><i className={`fas ${id ? 'fa-save' : 'fa-check'} me-2`}></i>{id ? "Actualizar" : "Crear"}</>}
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
