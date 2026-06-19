import { supabase } from '../utils/supabase';

/**
 * Guarda una solicitud de contratación en la base de datos (Supabase).
 *
 * Requiere una tabla `solicitudes_contratacion` con una política RLS que
 * permita INSERT al rol anónimo. Ver el SQL en el README / instrucciones.
 *
 * @param {Object} datos - { nombre, email, telefono, empresa, pais, tipo_negocio, mensaje }
 */
export async function crearSolicitud(datos) {
  const { data, error } = await supabase
    .from('solicitudes_contratacion')
    .insert([datos])
    .select();

  if (error) {
    throw error;
  }
  return data;
}

export default { crearSolicitud };
