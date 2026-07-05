import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import productosService from "../services/productos.service";
import categoriasService from "../services/categorias.service";

const FormularioProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      nombre: "",
      descripcion: "",
      precioSalon: "",
      precioMostrador: "",
      idCategoria: "",
      disponible: true,
      controlaStock: false,
      stockActual: 0,
      imagen: ""
    }
  });

  useEffect(() => {
    const cargar = async () => {
      setCategorias(await categoriasService.obtenerTodos());
      if (id) {
        const producto = await productosService.obtenerPorId(id);
        reset(producto);
      }
    };
    cargar();
  }, [id, reset]);

  const onSubmit = async (data) => {
    setCargando(true);
    try {
      const payload = {
        ...data,
        precioSalon: Number(data.precioSalon || 0),
        precioMostrador: Number(data.precioMostrador || 0),
        stockActual: Number(data.stockActual || 0)
      };
      if (id) {
        await productosService.actualizar(id, payload);
      } else {
        await productosService.crear(payload);
      }
      navigate("/productos");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">{id ? "Editar Producto" : "Nuevo Producto"}</div>
          <div className="page-subtitle">Precios diferenciados, visibilidad y stock cerrado</div>
        </div>
        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/productos")}>Volver</button>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nombre</label>
                <input className={`form-control ${errors.nombre ? "is-invalid" : ""}`} {...register("nombre", { required: true })} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Categoría</label>
                <select className="form-select" {...register("idCategoria", { required: true })}>
                  <option value="">Seleccionar…</option>
                  {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Precio salón</label>
                <input className="form-control" type="number" min="0" step="0.01" {...register("precioSalon")} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Precio mostrador/delivery</label>
                <input className="form-control" type="number" min="0" step="0.01" {...register("precioMostrador")} />
              </div>
              <div className="col-12">
                <label className="form-label">Descripción</label>
                <textarea className="form-control" rows="3" {...register("descripcion")} />
              </div>
              <div className="col-md-4">
                <div className="form-check form-switch mt-4">
                  <input className="form-check-input" type="checkbox" id="disponible" {...register("disponible")} />
                  <label className="form-check-label" htmlFor="disponible">Disponible</label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-check form-switch mt-4">
                  <input className="form-check-input" type="checkbox" id="controlaStock" {...register("controlaStock")} />
                  <label className="form-check-label" htmlFor="controlaStock">Controlar stock</label>
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label">Stock actual</label>
                <input className="form-control" type="number" min="0" step="1" {...register("stockActual")} />
              </div>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/productos")}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={cargando}>{cargando ? "Guardando..." : "Guardar"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormularioProducto;
