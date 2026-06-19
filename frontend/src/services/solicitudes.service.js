import { supabase } from '../utils/supabase';

/**
 * Guarda una solicitud del servicio de comida/delivery en la BD (Supabase).
 *
 * Requiere una tabla `solicitudes_servicio` con una política RLS que
 * permita INSERT al rol anónimo. Ver el SQL en las instrucciones.
 *
 * @param {Object} datos - { nombre, email, telefono, tipo_servicio, zona, mensaje }
 */
export async function crearSolicitud(datos) {
  const { data, error } = await supabase
    .from('solicitudes_servicio')
    .insert([datos])
    .select();

  if (error) {
    throw error;
  }
  return data;
}

export default { crearSolicitud };
