# QA Checklist

Checklist obligatoria para cambios visuales o de flujo.

## Antes De Implementar

- [ ] Leer `graphify-out/GRAPH_REPORT.md`.
- [ ] Leer `docs/figma_sources.md`.
- [ ] Identificar source key(s) Figma.
- [ ] Leer contrato correspondiente:
  - [ ] `docs/design_tokens.md`
  - [ ] `docs/screen_contracts.md`
  - [ ] `docs/component_contracts.md`
  - [ ] `docs/card_contracts.md`
- [ ] Confirmar qué se mantiene fuera de alcance.
- [ ] Si falta source, agregarlo como pendiente o pedir URL.

## Durante Implementación

- [ ] Mantener lógica/API existente salvo que el usuario pida cambio funcional.
- [ ] Usar tokens/clases existentes antes de crear estilos nuevos.
- [ ] No usar URLs privadas Figma runtime.
- [ ] UI visible en español.
- [ ] No dejar fallbacks que muestren nombres/tipos/atributos crudos en inglés.
- [ ] Para items, respetar descripción de BD/catalogo antes de texto generado.
- [ ] Para assets, usar rutas locales o imports/build pipeline.

## QA Visual Mobile

- [ ] 390px de ancho aproximado.
- [ ] Sin overflow horizontal.
- [ ] Texto cabe en botones/cards.
- [ ] Navbar respeta padding horizontal 16px.
- [ ] Dividers rojos visibles.
- [ ] Cards no anidan cards innecesarias.
- [ ] Estados selected/unselected/disabled visibles.
- [ ] Modales full-screen no se comportan como bottom drawer si Figma indica modal.
- [ ] Safe area móvil no tapa CTA/nav.

## QA Por Área

### Home / Personajes

- [ ] Empty state.
- [ ] Lista con 1 personaje.
- [ ] Lista con varios personajes.
- [ ] Nombre largo.
- [ ] Menú editar/eliminar.
- [ ] CTA `Agregar nuevo personaje`.

### Personaje Abierto

- [ ] Ficha con imagen.
- [ ] Ficha sin imagen.
- [ ] XP nivel bajo/alto.
- [ ] Métricas CA/Velocidad/B. Competencia.
- [ ] Atributos en orden `FUE`, `DES`, `CON`, `INT`, `SAB`, `CAR`.
- [ ] PG actuales/máximos/temp.
- [ ] Biografía con y sin bullets.

### Inventario

- [ ] Equipo vacío.
- [ ] Equipo con arma/armadura/escudo/anillos.
- [ ] Mochila con búsqueda.
- [ ] Catálogo con filtros.
- [ ] Cantidad de munición/packs.
- [ ] Modal de descripción.
- [ ] Imagen local.
- [ ] Icono fallback rojo.
- [ ] Refresh no rompe nombres ES ni iconos.

### Wizard

- [ ] Datos generales vacío/lleno.
- [ ] Raza selected/unselected.
- [ ] Trasfondo + idioma vacío/lleno.
- [ ] Clase selected/unselected.
- [ ] Equipamiento selected/unselected.
- [ ] Conjuros selected/unselected.
- [ ] Atributos selected/unselected.
- [ ] Flujo completo crea personaje real.

## Validación Técnica

- [ ] `npm run typecheck:web`
- [ ] `npm run build:web`
- [ ] `npm run prepublish:check` si el cambio toca código o antes de push.
- [ ] `git diff --check`
- [ ] `graphify update .` después de cambios de código/docs.
- [ ] Si se modificaron docs y hay API key disponible, correr extracción semántica Graphify.

## Documentación

- [ ] `CHANGELOG.md` actualizado.
- [ ] `HANDOFF.md` actualizado.
- [ ] `docs/tasks.md` actualizado.
- [ ] `docs/requirements.md` actualizado si cambió comportamiento/criterio.
- [ ] `docs/behavioral_design.md` actualizado si cambió UX/producto.
- [ ] Source key(s) usados mencionados en el cierre.
- [ ] Aproximaciones o pendientes de QA visual declarados.

