# Entregables de Diseño UX/UI — La Esquina

Material para la presentación del TP de **Diseño de Experiencia e Interfaz de Usuario**.

## Archivos

| Archivo | Qué es | Uso |
|---|---|---|
| **DOCUMENTO-DISENO.pdf** | Documento de justificación de decisiones UX/UI con capturas (8 páginas A4) | Entrega de texto |
| **DOCUMENTO-DISENO.html** | Fuente editable del documento | Editar y re-exportar |
| **POSTER-B2.pdf** | Poster en formato **B2 (500 × 700 mm)** listo para imprimir | Imprimir y montar sobre MDF/foamboard |
| **POSTER-B2.html** | Fuente editable del poster | Editar y re-exportar |
| **POSTER-B2.png** | Render del poster en imagen | Insertar en PowerPoint / Canva |
| **screenshots/** | Capturas reales de las 11 pantallas del sistema | Slides, documento |
| **UX-AUDIT.md** | Auditoría heurística de accesibilidad y UX | Anexo |

## Impresión del poster

El PDF ya está a tamaño real **B2 (500 × 700 mm)**. En la imprenta pedir
"imprimir a tamaño real / 100%, sin escalar". Montar sobre MDF 3 mm o foamboard 5 mm.

## Cómo regenerar (opcional)

Desde `frontend/` con el dev server corriendo (`npm run dev`):

```bash
node scripts/screenshots.mjs   # recaptura las pantallas (Chrome del sistema, datos de demo)
node scripts/render-docs.mjs   # regenera los PDF y el PNG del poster
```

> Requiere Google Chrome instalado y la devDependency `puppeteer-core`.
> Las capturas usan datos de demostración mockeados en `scripts/screenshots.mjs`.
