import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../../docs/screenshots');
mkdirSync(OUT, { recursive: true });

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://localhost:5173';

// ───────── Datos mock ─────────
const clientes = [
  { id: 1, nombre: 'María',   apellido: 'Gómez',    telefono: '351 555-1020', direccion: 'Av. Colón 1450',    email: 'maria.gomez@mail.com',   activo: true,  fechaRegistro: '2026-01-12' },
  { id: 2, nombre: 'Juan',    apellido: 'Pérez',    telefono: '351 555-3344', direccion: 'Bv. San Juan 233',   email: 'juanperez@mail.com',     activo: true,  fechaRegistro: '2026-02-03' },
  { id: 3, nombre: 'Lucía',   apellido: 'Fernández',telefono: '351 555-7788', direccion: 'Rondeau 980',        email: 'lucia.f@mail.com',       activo: true,  fechaRegistro: '2026-02-19' },
  { id: 4, nombre: 'Diego',   apellido: 'Martínez', telefono: '351 555-2211', direccion: 'Obispo Trejo 540',   email: 'diego.m@mail.com',       activo: false, fechaRegistro: '2026-03-08' },
  { id: 5, nombre: 'Sofía',   apellido: 'Romero',   telefono: '351 555-9090', direccion: 'Achával Rodríguez 70',email: 'sofia.romero@mail.com', activo: true,  fechaRegistro: '2026-03-22' },
];

const repartidores = [
  { id: 1, nombre: 'Carlos',  apellido: 'Suárez', telefono: '351 444-1010', vehiculo: 'Moto Honda Wave', activo: true  },
  { id: 2, nombre: 'Nahuel',  apellido: 'Ortiz',  telefono: '351 444-2020', vehiculo: 'Moto Zanella',    activo: true  },
  { id: 3, nombre: 'Brian',   apellido: 'López',  telefono: '351 444-3030', vehiculo: 'Bicicleta',       activo: false },
];

const productos = [
  { id: 1, nombre: 'Milanesa napolitana', descripcion: 'Con papas fritas', precio: 6800, idCategoria: 1, disponible: true  },
  { id: 2, nombre: 'Hamburguesa completa', descripcion: 'Doble cheddar y bacon', precio: 5900, idCategoria: 1, disponible: true  },
  { id: 3, nombre: 'Pizza muzzarella',     descripcion: 'Porción x8',          precio: 7200, idCategoria: 2, disponible: true  },
  { id: 4, nombre: 'Empanada de carne',    descripcion: 'Frita o al horno',    precio: 950,  idCategoria: 2, disponible: true  },
  { id: 5, nombre: 'Ensalada César',       descripcion: 'Pollo, crutones',     precio: 4800, idCategoria: 3, disponible: true  },
  { id: 6, nombre: 'Café con leche',       descripcion: 'En jarrito',          precio: 1800, idCategoria: 4, disponible: true  },
  { id: 7, nombre: 'Cerveza artesanal',    descripcion: 'Pinta IPA',           precio: 3200, idCategoria: 5, disponible: true  },
  { id: 8, nombre: 'Flan casero',          descripcion: 'Con dulce de leche',  precio: 2600, idCategoria: 6, disponible: false },
];

const hoy = '2026-06-29';
const t = (h, m) => `${hoy}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`;
const pedidos = [
  { id: 1043, fecha: t(13,42), estado: 'pendiente',  tipoEntrega: 'delivery', total: 13700, cliente: clientes[0], repartidor: repartidores[0], productos: [{ nombre: 'Milanesa napolitana', cantidad: 2 }] },
  { id: 1042, fecha: t(13,28), estado: 'preparando', tipoEntrega: 'salon',    total: 7200,  cliente: clientes[1], productos: [{ nombre: 'Pizza muzzarella', cantidad: 1 }] },
  { id: 1041, fecha: t(13,15), estado: 'en_camino',  tipoEntrega: 'delivery', total: 11800, cliente: clientes[2], repartidor: repartidores[1], productos: [{ nombre: 'Hamburguesa completa', cantidad: 2 }] },
  { id: 1040, fecha: t(12,58), estado: 'entregado',  tipoEntrega: 'delivery', total: 5700,  cliente: clientes[4], repartidor: repartidores[0], productos: [{ nombre: 'Empanada de carne', cantidad: 6 }] },
  { id: 1039, fecha: t(12,40), estado: 'entregado',  tipoEntrega: 'salon',    total: 9600,  cliente: clientes[3], productos: [{ nombre: 'Pizza muzzarella', cantidad: 1 }, { nombre: 'Cerveza artesanal', cantidad: 1 }] },
  { id: 1038, fecha: t(12,22), estado: 'cancelado',  tipoEntrega: 'delivery', total: 4800,  cliente: clientes[1], productos: [{ nombre: 'Ensalada César', cantidad: 1 }] },
];

const reporteVentas = { totalVentas: 152300, cantidadPedidos: 24 };
const productosTop = [
  { nombre: 'Milanesa napolitana', total_vendido: 38 },
  { nombre: 'Hamburguesa completa', total_vendido: 31 },
  { nombre: 'Pizza muzzarella',     total_vendido: 27 },
  { nombre: 'Empanada de carne',    total_vendido: 24 },
  { nombre: 'Café con leche',       total_vendido: 19 },
];
const repartidoresTop = [
  { nombre: 'Carlos', apellido: 'Suárez', cantidad_entregas: 14 },
  { nombre: 'Nahuel', apellido: 'Ortiz',  cantidad_entregas: 11 },
  { nombre: 'Brian',  apellido: 'López',  cantidad_entregas: 6  },
];

function mockFor(url) {
  if (!url.includes('/api/')) return null;
  if (url.includes('/reportes/ventas'))               return reporteVentas;
  if (url.includes('/reportes/productos'))            return productosTop;
  if (url.includes('/reportes/repartidores'))         return repartidoresTop;
  if (url.includes('/reportes/clientes'))             return clientes;
  if (url.includes('/repartidores/disponibles'))      return repartidores.filter(r => r.activo);
  if (url.includes('/repartidores'))                  return repartidores;
  if (url.includes('/clientes'))                      return clientes;
  if (url.includes('/productos'))                     return productos;
  if (url.includes('/pedidos'))                       return pedidos;
  return null;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const shots = [
  { name: 'landing',        path: '/',              w: 1440, h: 900, full: true  },
  { name: 'login',          path: '/login',         w: 1440, h: 900, fill: [['#usuario', 'admin'], ['#contrasena', 'laesquina']] },
  { name: 'contratar',      path: '/contratar',     w: 1440, h: 1050, full: true },
  { name: 'pedidos',        path: '/pedidos',       w: 1440, h: 900 },
  { name: 'pedidos-nuevo',  path: '/pedidos/nuevo', w: 1440, h: 980 },
  { name: 'clientes',       path: '/clientes',      w: 1440, h: 900 },
  { name: 'productos',      path: '/productos',     w: 1440, h: 900 },
  { name: 'repartidores',   path: '/repartidores',  w: 1440, h: 900 },
  { name: 'reportes',       path: '/reportes',      w: 1440, h: 950 },
  { name: 'pedidos-mobile', path: '/pedidos',       w: 390,  h: 844, mobile: true },
  { name: 'landing-mobile', path: '/',              w: 390,  h: 844, mobile: true, full: true },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--force-color-profile=srgb'],
});

for (const s of shots) {
  const page = await browser.newPage();
  await page.setViewport({ width: s.w, height: s.h, deviceScaleFactor: 2, isMobile: !!s.mobile, hasTouch: !!s.mobile });
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('token', 'demo');
    localStorage.setItem('usuario', 'Equipo La Esquina');
    localStorage.setItem('theme', 'light');
  });
  await page.setRequestInterception(true);
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': '*, authorization, content-type',
  };
  page.on('request', (req) => {
    const isApi = req.url().includes('/api/');
    if (isApi && req.method() === 'OPTIONS') {
      req.respond({ status: 204, headers: CORS, body: '' });
      return;
    }
    const data = mockFor(req.url());
    if (data !== null) {
      req.respond({ status: 200, contentType: 'application/json', headers: CORS, body: JSON.stringify(data) });
    } else {
      req.continue();
    }
  });

  try {
    await page.goto(BASE + s.path, { waitUntil: 'networkidle2', timeout: 30000 });
  } catch (e) {
    console.warn('goto warn', s.name, e.message);
  }
  await sleep(1400); // fuentes + animaciones
  if (s.fill) {
    for (const [sel, val] of s.fill) {
      try { await page.click(sel, { clickCount: 3 }); await page.type(sel, val); } catch (e) { /* noop */ }
    }
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await sleep(300);
  }
  await page.screenshot({ path: resolve(OUT, s.name + '.png'), fullPage: !!s.full });
  console.log('✓', s.name);
  await page.close();
}

await browser.close();
console.log('Listo →', OUT);
