import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import clientesService from "../services/clientes.service";

const FormularioCliente = () => {
  const { id } = useParams();
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { nombre: "", apellido: "", telefono: "", email: "", direccion: "", activo: true }
  });

  useEffect(() => {
    if (id) cargarCliente();
  }, [id]);

  const cargarCliente = async () => {
    try {
      setCargando(true);
      const cliente = await clientesService.obtenerPorId(id);
      reset(cliente);
    } catch {
      alert("Error al cargar los datos del cliente");
      navigate("/clientes");
    } finally { setCargando(false); }
  };

  const onSubmit = async (data) => {
    try {
      setCargando(true);
      if (id) {
        await clientesService.actualizar(id, data);
      } else {
        await clientesService.crear(data);
      }
      navigate("/clientes");
    } catch (error) {
      alert(error.response?.data?.error || "Error al guardar el cliente");
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
          <div className="page-title">{id ? 'Editar Cliente' : 'Nuevo Cliente'}</div>
          <div className="page-subtitle">Complete los datos del cliente</div>
        </div>
        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/clientes")}>
          <i className="fas fa-arrow-left"></i> Volver
        </button>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-7">
          <div className="card">
            <div className="card-body" style={{ padding: '28px' }}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="cli-nombre" className="form-label">Nombre <span style={{ color: 'var(--red)' }}>*</span></label>
                    <input
                      id="cli-nombre"
                      type="text"
                      className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                      {...register("nombre", { required: "El nombre es obligatorio", minLength: { value: 2, message: "Mínimo 2 caracteres" } })}
                      placeholder="Ej: Juan"
                    />
                    {errors.nombre && <div className="invalid-feedback">{errors.nombre.message}</div>}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="cli-apellido" className="form-label">Apellido <span style={{ color: 'var(--red)' }}>*</span></label>
                    <input
                      id="cli-apellido"
                      type="text"
                      className={`form-control ${errors.apellido ? 'is-invalid' : ''}`}
                      {...register("apellido", { required: "El apellido es obligatorio", minLength: { value: 2, message: "Mínimo 2 caracteres" } })}
                      placeholder="Ej: Pérez"
                    />
                    {errors.apellido && <div className="invalid-feedback">{errors.apellido.message}</div>}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="cli-telefono" className="form-label">Teléfono</label>
                    <input
                      id="cli-telefono"
                      type="tel"
                      className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                      {...register("telefono", { pattern: { value: /^[0-9+\-\s()]*$/, message: "Formato de teléfono inválido" } })}
                      placeholder="Ej: 351-1234567"
                    />
                    {errors.telefono && <div className="invalid-feedback">{errors.telefono.message}</div>}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="cli-email" className="form-label">Email</label>
                    <input
                      id="cli-email"
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      {...register("email", { pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Email inválido" } })}
                      placeholder="ejemplo@email.com"
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                  </div>

                  <div className="col-12">
                    <label htmlFor="cli-direccion" className="form-label">Dirección</label>
                    <textarea
                      id="cli-direccion"
                      className="form-control"
                      {...register("direccion")}
                      rows="2"
                      placeholder="Dirección completa para delivery"
                    />
                  </div>

                  {id && (
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="activo" {...register("activo")} />
                        <label className="form-check-label" htmlFor="activo">Cliente activo</label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/clientes")} disabled={cargando}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={cargando}>
                    {cargando
                      ? <><span className="spinner-border spinner-border-sm"></span> Guardando…</>
                      : <><i className={`fas ${id ? 'fa-save' : 'fa-check'}`}></i> {id ? 'Actualizar' : 'Crear Cliente'}</>
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

export default FormularioCliente;
