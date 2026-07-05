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
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [error, setError] = useState("");
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      nombre: "",
      descripcion: "",
      precioSalon: "",
      precioMostrador: "",
      costo: "",
      idCategoria: "",
      disponible: true,
      controlaStock: false,
      stockActual: 0,
      imagen: ""
    }
  });

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargandoInicial(true);
        const cats = await categoriasService.obtenerTodos();
        setCategorias(Array.isArray(cats) ? cats : []);
        if (id) {
          const producto = await productosService.obtenerPorId(id);
          reset(producto);
        }
        setError("");
      } catch (err) {
        setError(err.response?.data?.error || "No se pudo cargar el producto");
      } finally {
        setCargandoInicial(false);
      }
    };
    cargar();
  }, [id, reset]);

  const onSubmit = async (data) => {
    setCargando(true);
    setError("");
    try {
      const payload = {
        ...data,
        precioSalon: Number(data.precioSalon || 0),
        precioMostrador: Number(data.precioMostrador || 0),
        costo: Number(data.costo || 0),
        idCategoria: Number(data.idCategoria),
        stockActual: Number(data.stockActual || 0)
      };
      if (id) {
        await productosService.actualizar(id, payload);
      } else {
        await productosService.crear(payload);
      }
      navigate("/productos");
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo guardar el producto");
    } finally {
      setCargando(false);
    }
  };

  if (cargandoInicial) {
    return (
      <div className="card">
        <div className="card-body">Cargando producto...</div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">{id ? "Editar Producto" : "Nuevo Producto"}</div>
          <div className="page-subtitle">Precios, costo, visibilidad y stock cerrado</div>
        </div>
        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/productos")}>Volver</button>
      </div>

      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="nombre">Nombre</label>
                <input id="nombre" className={`form-control ${errors.nombre ? "is-invalid" : ""}`} {...register("nombre", { required: true })} />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="idCategoria">Categoria</label>
                <select id="idCategoria" className="form-select" {...register("idCategoria", { required: true })}>
                  <option value="">Seleccionar...</option>
                  {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label" htmlFor="precioSalon">Precio salon</label>
                <input id="precioSalon" className="form-control" type="number" min="0" step="0.01" {...register("precioSalon")} />
              </div>
              <div className="col-md-4">
                <label className="form-label" htmlFor="precioMostrador">Precio mostrador/delivery</label>
                <input id="precioMostrador" className="form-control" type="number" min="0" step="0.01" {...register("precioMostrador")} />
              </div>
              <div className="col-md-4">
                <label className="form-label" htmlFor="costo">Costo</label>
                <input id="costo" className="form-control" type="number" min="0" step="0.01" {...register("costo")} />
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="descripcion">Descripcion</label>
                <textarea id="descripcion" className="form-control" rows="3" {...register("descripcion")} />
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
                <label className="form-label" htmlFor="stockActual">Stock actual</label>
                <input id="stockActual" className="form-control" type="number" min="0" step="1" {...register("stockActual")} />
              </div>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/productos")}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={cargando || categorias.length === 0}>
                {cargando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormularioProducto;
