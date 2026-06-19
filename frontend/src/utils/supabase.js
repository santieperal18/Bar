import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let client;

if (supabaseUrl && supabaseKey) {
  client = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client inicializado');
} else {
  // Sin variables de entorno no inicializamos el cliente (evita romper la app
  // al importar). Cualquier uso lanza un error claro que la UI puede capturar.
  console.error('❌ Variables de entorno de Supabase no configuradas (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY)');
  const faltante = () => {
    throw new Error('Supabase no está configurado: faltan las variables de entorno.');
  };
  client = new Proxy({}, { get: faltante, apply: faltante });
}

export const supabase = client;
