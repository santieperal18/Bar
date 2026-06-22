# Auditoría UX/UI — La Esquina

Evaluación heurística de todas las pantallas (Landing, Login, Pedidos, Clientes,
Productos, Repartidores, Reportes y sus formularios) contra los criterios de
estructura, interfaz, responsive, accesibilidad, i18n y ética.

## ✅ Cumplido / corregido en esta iteración

**Estructura y navegación**
- Flujo claro: Landing pública → Login → panel. Sidebar consistente en todo el panel.
- **Breadcrumbs** agregados (`Breadcrumbs.jsx`) visibles en todas las pantallas internas.
- Cada página tiene título + subtítulo y botón de acción primaria.

**Interfaz visual**
- Jerarquía por color/tamaño/espaciado (design tokens en `index.css`).
- Estados de elementos interactivos: hover, active, `:focus-visible` (teclado),
  e `is-invalid` en formularios.
- Microinteracciones: transiciones, `fade-in`, animaciones con `prefers-reduced-motion`.

**Responsive**
- Layouts dobles desktop (tabla) / mobile (cards) en todos los listados.
- **Tamaño táctil ≥ 42–44px** en botones de ícono para dispositivos touch.
- Tipografías e imágenes fluidas (`clamp()`, `object-fit`).

**Accesibilidad**
- **Skip link** "Saltar al contenido" + landmark `<main id="contenido">`.
- Foco de teclado visible y consistente.
- `aria-label` en buscadores; labels asociadas (`htmlFor`/`id`) en todos los formularios.
- Imágenes con `alt`; íconos decorativos con `aria-hidden`.

**Ética y equidad**
- Sin patrones oscuros. Copy neutral, sin estereotipos.
- Nota de **uso de datos** en el login (acceso interno, sin terceros).

**Internacionalización**
- `<html lang="es">`. Sin texto incrustado en imágenes de contenido (el logo de marca
  es la única excepción y lleva `alt`).

## ⚠️ Pendiente / recomendaciones

- **LTR/RTL**: la app es monolingüe (es-AR). Para soportar RTL habría que externalizar
  textos (i18n con `react-i18next`) y manejar `dir`. No implementado por alcance.
- **Pruebas de usabilidad reales + SUS**: son un proceso con usuarios que el equipo debe
  ejecutar (no se puede simular en código). Recomendado: 5 usuarios, tareas guiadas
  (crear pedido, buscar cliente, exportar reporte) y cuestionario SUS de 10 ítems.
- **Contraste**: revisar textos `--text-3` sobre superficies oscuras con un medidor
  (objetivo AA 4.5:1) en una pasada dedicada.

## Hallazgos no relacionados con UX (contexto)
- El backend REST fue eliminado del repo; las pantallas de datos no cargan sin él.
  La Landing y el Login funcionan de forma autónoma.
