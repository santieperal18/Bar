import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import repartidoresService from "../services/repartidores.service";

const FormularioRepartidor = () => {
  const { id } = useParams();
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { nombre: "", apellido: "", telefono: "", vehiculo: "", activo: true }
  });

  useEffect(() => {
    if (id) cargarRepartidor();
  }, [id]);

  const cargarRepartidor = async () => {
    try {
      setCargando(true);
      const repartidor = await repartidoresService.obtenerPorId(id);
      if (repartidor) reset(repartidor);
    } catch {
      alert("Error al cargar los datos del repartidor");
      navigate("/repartidores");
    } finally { setCargando(false); }
  };

  const onSubmit = async (data) => {
    try {
      setCargando(true);
      if (id) {
        await repartidoresService.actualizar(id, data);
      } else {
        await repartidoresService.crear(data);
      }
      navigate("/repartidores");
    } catch (error) {
      alert(error.response?.data?.error || "Error al guardar el repartidor");
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
          <div className="page-title">{id ? 'Editar Repartidor' : 'Nuevo Repartidor'}</div>
          <div className="page-subtitle">Complete los datos del repartidor</div>
        </div>
        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/repartidores")}>
          <i className="fas fa-arrow-left"></i> Volver
        </button>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-body" style={{ padding: '28px' }}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="rep-nombre" className="form-label">Nombre <span style={{ color: 'var(--red)' }}>*</span></label>
                    <input
                      id="rep-nombre"
                      type="text"
                      className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                      {...register("nombre", { required: "El nombre es obligatorio", minLength: { value: 2, message: "Mínimo 2 caracteres" } })}
                      placeholder="Ej: Juan"
                    />
                    {errors.nombre && <div className="invalid-feedback">{errors.nombre.message}</div>}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="rep-apellido" className="form-label">Apellido <span style={{ color: 'var(--red)' }}>*</span></label>
                    <input
                      id="rep-apellido"
                      type="text"
                      className={`form-control ${errors.apellido ? 'is-invalid' : ''}`}
                      {...register("apellido", { required: "El apellido es obligatorio", minLength: { value: 2, message: "Mínimo 2 caracteres" } })}
                      placeholder="Ej: Pérez"
                    />
                    {errors.apellido && <div className="invalid-feedback">{errors.apellido.message}</div>}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="rep-telefono" className="form-label">Teléfono <span style={{ color: 'var(--red)' }}>*</span></label>
                    <input
                      id="rep-telefono"
                      type="tel"
                      className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                      {...register("telefono", { required: "El teléfono es obligatorio", pattern: { value: /^[0-9+\-\s()]*$/, message: "Formato inválido" } })}
                      placeholder="Ej: 351-1234567"
                    />
                    {errors.telefono && <div className="invalid-feedback">{errors.telefono.message}</div>}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="rep-vehiculo" className="form-label">Vehículo</label>
                    <select id="rep-vehiculo" className="form-select" {...register("vehiculo")}>
                      <option value="">Sin especificar</option>
                      <option value="Moto 110cc">Moto 110cc</option>
                      <option value="Moto 125cc">Moto 125cc</option>
                      <option value="Moto 150cc">Moto 150cc</option>
                      <option value="Auto chico">Auto chico</option>
                      <option value="Auto mediano">Auto mediano</option>
                      <option value="Bicicleta">Bicicleta</option>
                      <option value="Cuadriciclo">Cuadriciclo</option>
                    </select>
                  </div>

                  {id && (
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="activo" {...register("activo")} />
                        <label className="form-check-label" htmlFor="activo">Repartidor activo</label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/repartidores")} disabled={cargando}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={cargando}>
                    {cargando
                      ? <><span className="spinner-border spinner-border-sm"></span> Guardando…</>
                      : <><i className={`fas ${id ? 'fa-save' : 'fa-check'}`}></i> {id ? 'Actualizar' : 'Crear Repartidor'}</>
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

export default FormularioRepartidor;
