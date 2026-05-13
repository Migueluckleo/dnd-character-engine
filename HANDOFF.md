# HANDOFF

## Estado actual del proyecto

- Plataforma local para gestión de personajes DnD 5e SRD.
- Backend en Node.js/TypeScript con Express, Prisma y PostgreSQL.
- Motor de reglas organizado en servicios puros: Point Buy, modificadores, HP, AC, combate, descansos, condiciones, concentración, inventario, multiclase, iniciativa, habilidades, pasivas, espacios de conjuro y XP.
- UI standalone en `ui.html` que consume `http://localhost:3000` y usa `style.css`.
- El wizard de creación está orientado a mobile-first y debe seguir `docs/Create Character.pdf` y el Figma `DM-Dnd-App--Copy-`.
- La documentación viva principal está en `docs/requirements.md`, `docs/plan.md`, `docs/tasks.md`, `.claude.md`, `CHANGELOG.md` y este archivo.

## Últimos cambios realizados (2026-05-12) — Réplica de pantalla de personaje abierto (US-117 / US-125 / US-146)

### Qué se implementó
- El header de personaje abierto sigue la composición de la captura/Figma: `Atrás` a la izquierda, eyebrow `Personaje` y nombre centrado, botón mini `Tirar dado` a la derecha.
- La card principal de personaje abierto se reorganizó por secciones Figma: XP, métricas superiores, perfil/atributos, magia y puntos de golpe.
- Orden superior vigente de la hoja: XP primero, luego `CA`, `Velocidad`, `B. Competencia`, luego penalización en sigilo si aplica, luego divider rojo.
- El bloque XP + métricas + penalización opcional vive dentro de `.character-card-stats`, que implementa el componente Figma `--module-xp`. Mantener ahí los espaciados internos controlados por la pantalla: badge `Lvl` 32x32, barra XP 4px, métricas de 56px y penalización con icono informativo de 16px.
- Se agregaron dividers rojos degradados entre secciones y separadores internos verticales/horizontales en métricas, atributos y magia. Los dividers de ficha usan override específico `#detail-main-sheet .figma-red-divider.detail-section-divider` porque `.figma-red-divider` global puede ocultarlos si gana la cascada.
- La grilla de atributos de la hoja debe conservar el orden explícito Figma: `FUE`, `DES`, `CON` / `INT`, `SAB`, `CAR`.
- La hoja debe renderizar esas abreviaturas literalmente; no usar `STAT_ES[k]` porque eso devuelve nombres completos como Fuerza/Destreza/Constitución.
- El botón `Agregar experiencia` en la hoja es mini: 24px de alto, `Source Serif Pro` 10px regular, padding horizontal de 8px, fill `#720000`, texto `#FFFFFF`, sin borde y radius `4px`. No debe llevar clases genéricas `btn`, `btn-accent` ni `btn-full`, porque lo vuelven a convertir en botón regular/grande.
- Tokens New Style confirmados desde Figma page `specs`: mini button `24px`, regular button `44px`, close button `32px`. Acciones mini de cards de inventario (`Eliminar`, `Vender`, `Equipar`, `Usar`) deben usar 24px de alto, radius 4px y padding horizontal de 8px.
- La card interna de personaje abierto usa padding de 16px en eje X y 32px arriba/abajo. Los dividers tienen 16px de aire arriba y abajo por el `gap` del contenedor; no usar márgenes negativos.
- El estado con penalización en sigilo se muestra como línea contextual bajo las métricas superiores cuando el equipo equipado trae `stealth_disadvantage`; el estado sin penalización no muestra esa línea. Para armadura, el copy visible debe decir `La armadura equipada causará penalización en tiradas de sigilo`.
- El bloque XP usa badge de nivel, barra de progreso, valores actual/siguiente y botón `Agregar experiencia` en la misma fila.
- La imagen del personaje conserva upload, pero ahora el CTA se ve como botón circular de cámara en la esquina inferior izquierda.
- La sección de PG muestra PG actuales, PG temporales, máximo, nota de temporales y botón de ajuste.
- `Biografía` ya no vive dentro de `#detail-main-sheet`; ahora es una card parchment independiente debajo de la ficha principal. El render usa párrafo introductorio y lista con etiquetas rojas para `Ideal`, `Vínculo` y `Defecto`.
- `Biografía` pertenece solo al tab `Personaje`. `switchCharacterTab()` debe ocultar `.detail-bio` cuando el usuario cambia a `Inventario`, `Habilidades`, `Conjuros` o `Diario`.
- Las navbars New Style deben conservar `16px` de padding horizontal, tanto en la navegación principal inferior como en la navegación interna de personaje.
- La navbar interna de personaje no debe usar columnas fijas que sumen el ancho total de pantalla; usar `repeat(5, minmax(0, 1fr))` para que los tabs vivan dentro del padding lateral real.
- Hay una capa final CSS específica para `body.character-detail-mode` al final de `style.css` para evitar que reglas antiguas o tokens genéricos sobrescriban la pantalla de personaje abierto.
- El modal de objeto `Descripción` debe mantener una regla destacada visible y multilínea: etiqueta `Ventaja` cuando detecte ventaja/inmunidad desde `properties.advantage`, `properties.ventaja`, `properties.immunity`, `properties.effect`, `properties.description` o `description`; si no, etiqueta `Atributo`. No volver a usar `white-space: nowrap`, `overflow:hidden` ni ellipsis en `.item-description-rule`.
- La rareza del modal de objeto debe leerse con `itemRarity(item)` para aceptar `properties.rarity`; no depender solo de `item.rarity`.
- El header del modal `Descripción` debe conservar la anatomía Figma `--module-item-header`: arte del item a la izquierda; `item summary` a la derecha; `main information` con `titleAndCategory` y `price`; luego divider rojo y `advantages`. No volver a separar el precio como tercera columna independiente.
- Las cards de inventario en `Equipo`, `Mochila` y `Alijo` deben nacer colapsadas para maximizar escaneo. El caret expande/colapsa el detalle inline; tocar la card completa sigue abriendo el modal `Descripción`.
- La pantalla `Mochila` debe seguir el spec `--dndCharacterEngine-character-backpack`: tabs parchment, módulo `Carga`/PO/PP/PC, buscador `Buscar objeto` + botón `Buscar`, y cards de objeto con strips y gaps de 16px. La acción `Agregar objeto` vive en el header superior cuando el tab activo es `Inventario`, no como encabezado interno de Mochila. El subtab inicial de `Inventario` debe ser `Mochila`.
- Botones e inputs New Style deben usar átomos reutilizables: `figma-btn` + una sola variante de tamaño (`figma-btn--mini` o `figma-btn--regular`) + variante visual (`figma-btn--primary`, `figma-btn--secondary` o `figma-btn--ghost`). Inputs, selects y textareas deben usar `figma-input-control`; wrappers visuales pueden usar `figma-input`. No crear estilos locales de botón/input sin reutilizar estos átomos.
- `ui.html` instala un normalizador global de átomos (`installUiAtomObserver`) que aplica estas clases a controles existentes y a controles renderizados por JS. Al construir nuevas pantallas, se debe seguir declarando el átomo correcto en markup cuando sea posible; el normalizador es una red de consistencia, no una excusa para inventar clases nuevas.
- `Agregar objeto` en el header de inventario es botón mini (`figma-btn--mini`), no regular.

### Archivos modificados
- `ui.html`
- `style.css`
- `docs/requirements.md`
- `docs/tasks.md`
- `docs/behavioral_design.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Validación realizada
- Script inline de `ui.html`: correcto.
- Balance de llaves CSS: correcto.
- Typecheck: correcto.

### Pendientes inmediatos
1. Validar visualmente en navegador contra las dos variantes del Figma: sin penalización y con penalización en sigilo.
2. Ajustar tamaños finos si el contenido real, especialmente nombres largos o velocidades de 30/35 pies, rompe la proporción visual.

---

## Últimos cambios realizados (2026-05-11) — Card de personaje del roster (US-119 / US-146)

### Qué se implementó
- La card de personaje creado en Home/Personajes ahora sigue la arquitectura visual indicada por producto: nombre primero, subtítulo raza/clase, divider rojo, métricas rápidas y biografía.
- El spec tipográfico vigente para esta card es: título `Source Serif Pro` 20px regular, raza/clase `Source Serif Pro` 10px italic, atributos `Source Sans 3` 14px regular, descripción `Source Sans Pro` 14px regular.
- El header interno de la card usa layout horizontal: bloque nombre/clase en fill y menú de tres puntos de `24x24`; el vector de puntos debe medir visualmente `3x18` en `#720000`. El separador `•` entre raza y clase usa `Source Serif Pro` 10px regular en `#110000`.
- El `header_app` de Home usa ancho `358px`, layout horizontal con gap `32px`, usuario `Source Serif Pro` 16px regular `#720000`, email `Source Sans Pro` 14px italic `#000000` y logout `24x24` con vector `#720000`.
- Importante: no volver a agrupar `#roster-welcome` con `.detail-title` o `.detail-back` en reglas posteriores, porque sobrescribe el spec del `header_app`. El logout debe permanecer como SVG inline sin pseudo-elemento ni fondo circular.
- El divider usa rojo Figma con degradado y taper visual hacia la derecha; no debe volver a una línea sólida de grosor uniforme.
- Las acciones de personaje ya no viven como botones visibles/hover. Se movieron a un botón táctil de tres puntos verticales que abre un dropdown con `Editar` y `Eliminar`.
- El render del roster escapa nombre, raza, clase y biografía para evitar que contenido dinámico rompa la tarjeta.

### Archivos modificados
- `ui.html`
- `style.css`
- `docs/requirements.md`
- `docs/tasks.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Validación realizada
- Script inline de `ui.html`: correcto.
- Balance de llaves CSS: correcto.

### Pendientes inmediatos
1. Validar visualmente la card contra Figma en navegador real, especialmente escala tipográfica, espacios y dropdown de tres puntos.
2. Ajustar iconografía de velocidad si Figma requiere el ícono de bota exacto en lugar del icono actual de velocidad.

---

## Últimos cambios realizados (2026-05-09) — New Style UI desde Figma (US-146)

### Qué se implementó
- Se inició el gran cambio visual solicitado desde Figma `New-style`, sección `pantallas template`.
- `style.css` ahora contiene tokens CSS `--figma-*` derivados del template para colores, tipografías, tamaños, espaciados, medidas, radios, sombras y assets. Cualquier ajuste visual New Style debe preferir esos tokens antes que valores sueltos.
- Home/Personajes adopta fondo `page bg`, encabezado rojo, navegación inferior en orden Figma, cards de personaje tipo parchment y botón rojo de agregar personaje.
- Personaje abierto adopta fondo `ficha bg`, header Figma, navegación inferior de personaje, bloque parchment para stats, XP/nivel, imagen, atributos, magia y PG.
- Inventario adopta tabs `Equipo`, `Mochila`, `Alijo`, card de Carga/monedas, slots vacíos punteados y cards parchment para objetos.
- Las cards de inventario usan el patrón anotado por producto: pill de cantidad, nombre/tipo, colapsable, filas de daño/atributos y precio/peso, descripción y acciones.
- Regla de CTA en inventario: consumible = `Usar`; equipable = `Equipar`/`Desequipar`; packs = `Abrir kit`.
- Las cards de inventario abren el modal `Descripción` al tocarlas; debe respetar la arquitectura de Figma y no comportarse como drawer inferior. Los botones internos de Usar/Equipar/Abrir kit conservan su comportamiento sin abrir el modal.
- Los botones New Style deben usar los tokens/clases base de mini/regular/primary/secondary/ghost antes de crear reglas nuevas.
- Se conserva la lógica existente: API, autenticación, apertura de personaje, imagen, inventario, dados, conjuros y habilidades.

### Archivos modificados
- `ui.html`
- `style.css`
- `docs/requirements.md`
- `docs/tasks.md`
- `docs/behavioral_design.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Validación realizada
- `node --check` sobre el script inline de `ui.html`: correcto.
- `npx tsc --noEmit`: correcto.
- Balance de llaves CSS: correcto.

### Pendientes inmediatos
1. Validar visualmente en navegador contra Figma node `2086:824`.
2. Ajustar medidas finas de las cards y navegación si el screenshot no empata.
3. Extender el New Style a modales secundarios restantes como dados, HP y pantallas internas que aún conserven trazos del estilo anterior.

---

## Últimos cambios realizados (2026-05-09) — Imágenes locales progresivas para ítems (US-145 parcial)

### Extensión Game-icons / Iconify
- Game-icons vía Iconify se usa como fallback visual para ítems sin imagen local.
- Prioridad actual: imagen local exacta → imagen local por subtipo → Game-icons por categoría/subtipo → card textual.
- Los iconos de librería usan color por rareza:
  - común gris, poco común verde, raro azul, muy raro morado, legendario dorado, artefacto rojo/rosa.
- `README.md` contiene la atribución requerida por CC BY 3.0.
- Pendiente: validar visualmente en producción que Iconify carga desde GitHub Pages y no hay bloqueo de red/CSP.

### Fix operativo de seed
- `npm run db:seed` ahora corre `prisma generate` antes del seed para evitar Prisma Client desactualizado.
- Motivo: el seed usa `Item.description` y `Item.source`; si el cliente generado no está actualizado, Prisma lanza `Unknown argument description`.
- Validación pendiente en máquina del usuario/entorno con red: correr `npm run db:seed` después del cambio. En este entorno Codex la conexión directa a Supabase no está disponible.

### Qué se implementó
- US-145 se retomó con assets reales, sin volver al sistema SVG genérico revertido.
- `ui.html` contiene un mapping de imágenes locales desde `src/images/items`:
  - exacto por nombre para ítems SRD con imagen disponible;
  - fallback por subtipo para armas y magic items homebrew (`weapon_subtype`).
- Las imágenes aparecen en tarjetas de inventario, catálogo de agregar objeto y pantalla de cantidad.
- Si un ítem no tiene imagen, la card sigue funcionando con texto y atributos.

### Qué queda pendiente
- Agregar más assets y ampliar el mapping progresivamente.
- Validar visualmente en navegador con personajes que tengan mochila y catálogo cargados.
- Definir si a futuro las imágenes vivirán en repo, CDN controlado o almacenamiento propio.

---

## Últimos cambios realizados (2026-05-09) — Rollback íconos SVG + XLS regenerado

### Qué se implementó / revirtió
- **ROLLBACK COMPLETO de US-145** a petición del usuario: los 34 símbolos SVG, las 3 funciones JS (`getItemIconId`, `getItemIconStyle`, `itemIconHtml`) y el CSS `.item-icon-wrap` fueron eliminados de `ui.html` y `style.css`.
- El usuario prefiere imágenes únicas por ítem en lugar de íconos vectoriales genéricos.
- **XLS regenerado** — `Catálogo Completo DnD.xlsx` reconstruido desde `prisma/seeds/item.ts` con los 855 ítems, color por rareza y 4 hojas.
- **Documentación alineada** — `docs/behavioral_design.md`, `docs/tasks.md` y `docs/requirements.md` ya registran el rollback de US-145, la regeneración del XLS y el estado pendiente del rediseño visual de ítems.

### Estado actual de `ui.html`
- Sin íconos de ítem. Las cards de inventario y catálogo muestran solo texto (tipo + nombre + chips).
- `itemDescription()` sigue priorizando `item.description` del campo BD antes del fallback generado.

### Qué queda pendiente
- **US-145 rediseño**: definir approach de imágenes únicas (URL externa, blob en BD, sprite de imágenes, etc.) antes de re-implementar.
- **T-072**: conectar `item.description` al modal de detalle de ítem (un `<p>` adicional en el template).
- **T-074**: definir arquitectura visual de ítems sin volver al sistema de SVG genéricos revertido.
- Ejecutar migración local + seed para poblar los 855 ítems con descripciones en BD.

---

## Últimos cambios realizados (2026-05-09) — Íconos SVG para todos los ítems (US-145)

### Qué se implementó
- **34 íconos SVG** añadidos como `<symbol>` al sprite inline de `ui.html`. Cubren: espada, daga, espadón, hacha, martillo, lanza, arco, ballesta, garrote, armadura ligera/media/pesada, yelmo, escudo, anillo, amuleto, varita, bastón, capa, botas, guantes, poción, pergamino, orbe, flecha, antorcha, cuerda, herramienta, laúd, símbolo sagrado, foco arcano, ropa, estrella mágica, comida, engranaje, bolsa.
- **Sistema de colores por rareza**: los ítems homebrew y mágicos muestran el ícono en el color de su rareza. Los SRD usan el marrón temático del proyecto.
- **Un solo helper `itemIconHtml(item, size)`** utilizado en todas las vistas de inventario.
- **`itemDescription()`** ahora prioriza el campo `item.description` de la BD (llenado con 287 descripciones SRD en la tarea anterior).
- La pantalla de confirmación de cantidad ahora muestra el ícono + descripción completa del ítem antes de agregar.

### Por qué
- US-145: los jugadores necesitan reconocer ítems de un vistazo sin leer el nombre completo, especialmente en el inventario móvil.
- Los 855 ítems del catálogo (287 SRD + 568 homebrew) ahora tienen representación visual distintiva.

### Qué queda pendiente de validar
1. **Visualizar en navegador**: abrir el inventario de un personaje y confirmar que los íconos aparecen en mochila, stash, slots de equipo, catálogo de agregar y pantalla de cantidad.
2. **Migración de BD**: ejecutar `npx prisma migrate deploy` + `npx prisma db seed` para que los 855 ítems con descripción estén en la BD y los íconos usen el campo `description` real.
3. **Ítems mágicos**: verificar que las raresas de homebrew (very_rare, legendary) muestran los colores morado/naranja correctamente.

---

## Últimos cambios realizados (2026-05-09) — Catálogo completo: descripciones SRD + 568 ítems homebrew (US-127)

### Qué se implementó
- **Schema extendido**: dos nuevos campos en `model Item`: `description String?` (flavor text del ítem) y `source String @default("srd")` (trazabilidad de origen).
- **Migración lista**: `prisma/migrations/20260509120000_add_item_description_source/migration.sql` — solo requiere `npx prisma migrate deploy` en el servidor.
- **287 ítems SRD con descripción**: Armaduras, armas simples/marciales, equipo de aventurero, herramientas, instrumentos, packs, pociones, focos y objetos mágicos SRD. Todas las descripciones están en español con tono de fantasía DnD clásico.
- **568 ítems homebrew integrados** desde los 4 PDFs en `docs/`:
  - `magic40`: 64 objetos mágicos únicos (nivel common–legendary)
  - `infernal`: 95 ítems del Infernal Machine Rebuild (muy raros y legendarios)
  - `gremio`: 254 ítems del Homebrew del Gremio (variedad completa de rareza)
  - `todasarmas`: 155 armas mágicas (magic_weapon → magic_item en el seed)
- **Catálogo total: 855 ítems** en `prisma/seeds/item.ts`.
- **XLS actualizado**: `Catálogo Completo DnD.xlsx` — 4 hojas: Resumen, Catálogo SRD, Homebrew, Objetos Mágicos (624 en total).

### Por qué
- US-127 requiere que las tarjetas de ítem muestren descripción de sabor. El campo `description` en BD es el prerequisito para poblar la UI.
- Los PDFs de homebrew existían en `docs/` sin integrar. Su incorporación al seed permite que cualquier DM los asigne a personajes.
- El campo `source` permite filtrar por origen (SRD vs. homebrew específico) en la UI futura.

### Qué queda pendiente de validar
1. **Ejecutar migración en local**: `npx prisma migrate deploy` (o `dev` si se prefiere) para añadir las columnas a la BD.
2. **Re-seed**: `npx prisma db seed` para poblar los 855 ítems con sus descripciones.
3. **UI**: conectar el campo `description` al modal de detalle de ítem. Actualmente el campo existe en BD pero la UI todavía no lo muestra.
4. **Calidad de homebrew**: algunas descripciones extraídas del PDF tienen texto de bleed (artefacto del parser). Revisar spot-checks en la hoja `Homebrew` del XLS antes de usar en producción.

---

## Últimos cambios realizados (2026-05-05) — Fix dados 3D estabilizados (US-143)

**Tres bugs críticos corregidos en esta sesión:**

### 1. Dado desaparece al pulsar "Lanzar dado" (condición de carrera)
- **Causa**: `renderDiceFlow()` llama `restoreResults()` vía `setTimeout(..., 0)`. Cuando se pulsaba "Lanzar dado", `renderDiceFlow()` + `rollInElement()` se ejecutaban en secuencia. El setTimeout de `restoreResults()` disparaba justo mientras `rollInElement()` estaba animando, llamando `showResult()` que destruía el renderer activo.
- **Fix**: `restoreResults()` ahora comprueba `if (diceFlow.rolling) return;` al inicio. Como `diceFlow.rolling = true` se establece antes de `renderDiceFlow()`, el guard es efectivo.

### 2. THREE.WebGLRenderer: Context Lost
- **Causa**: `_disposeCtx` llamaba `forceContextLoss()` pero no eliminaba el canvas del DOM. `_createCtx` reutilizaba ese canvas (existente), creando un nuevo `WebGLRenderer` sobre un canvas cuyo contexto ya había sido descartado.
- **Fix**: `_disposeCtx` ahora elimina el canvas con `canvas.parentNode.removeChild(canvas)`. `_createCtx` siempre crea un canvas nuevo.

### 3. Error browserCrypto / rpg-dice-roller eliminado
- La librería `@dice-roller/rpg-dice-roller@5` accede a `globalThis.crypto.browserCrypto` internamente y no funciona en este entorno. Se retiró el script CDN completamente. `rollDiceFormula()` usa `Math.random()` como implementación definitiva.

### Estado del flujo de dados ahora
1. Panel abre → dado 3D gira sin número (pre-roll)
2. "Lanzar dado" → spin 1.1 s con renderer fresco → dado estático con número centrado
3. `renderDiceFlow()` post-roll → `restoreResults()` reinstancia dado con número visible

**Pendiente**: validar visualmente en navegador que los tres puntos anteriores funcionan en todos los flujos (ataque, daño, conjuro, historia, genérico).

## Últimos cambios realizados (2026-05-04) — Resolución de historia y localización ES

- Se implementó el flujo completo "Resolución de historia" en el modal de dados (4 pantallas, exactas al Figma PDF entregado por el usuario).
- Pantalla 1 (menú): botón ahora llama `openStoryResolutionFlow()` en vez del genérico.
- Pantalla 2 (selector): 18 habilidades con bono calculado; habilidad seleccionada resaltada en ámbar; CTA deshabilitado hasta elegir.
- Pantalla 3 (tirada): detecta ventaja/desventaja automáticamente — sigilo con `stealth_disadvantage`, condiciones activas. Muestra 1 o 2 dados según corresponda.
- Pantalla 4 (resultado): dado perdedor al 45% de opacidad, ganador nítido. Resultado final = dado ganador + modificador de habilidad.
- `ITEM_NAME_ES` expandido de ~30 a **257 items** completos. `SPELL_NAME_ES` expandido de ~100 a los **410 conjuros SRD** (niveles 0-9).
- Se corrigieron 4 puntos de render en la hoja de personaje que mostraban conjuros en inglés.
- Sintaxis JS verificada: 0 errores. Backend sin cambios.
- Se agregaron US-140 y US-141.
- Pendiente: validar visualmente en navegador el flujo completo con un personaje que tenga armadura con `stealth_disadvantage`.

## Últimos cambios realizados (2026-05-04) — Motor de hidratación completo

- Se cableó el endpoint `/hydrated` con el motor `hydrate.ts` usando el nuevo adaptador `buildRawCharacter()` en `character.repository.ts`.
- `buildRawCharacter()` traduce el resultado Prisma (snake_case, relaciones anidadas) a `RawCharacter` (camelCase, shape del motor). Es la única fuente de verdad para esta traducción.
- `/hydrated` eliminó ~120 líneas de cálculo manual y ahora devuelve: CA real con armadura/escudo, velocidad con penalización por armadura pesada, peso cargado y capacidad, desventaja de sigilo, HP con `level_1_hp_roll` real, y todos los demás stats del motor.
- `calculateMaxHP` acepta `level1HpRoll` opcional para usar la tirada real del mago en vez del máximo del dado.
- Se agregó la card `Carga / Monedas` en la pestaña `Mochila` con barra de progreso, íconos SVG de mochila y monedas (PO/PP/PC) en colores diferenciados.
- La UI lee `computed.armor_class` (del motor) con fallback a `unarmored_ac`; `computed.speed` muestra el valor final en pies con penalización de armadura pesada ya aplicada.
- Se agregó badge de `Desventaja sigilo` en equipamiento cuando algún ítem equipado tiene `stealth_disadvantage = true`.
- TypeCheck: 0 errores. Tests: 77/77 passing.
- Se agregaron US-138 y US-139.
- Pendiente: validar visualmente en navegador con un personaje que lleve armadura equipada (confirmar CA cambia, velocidad baja con armadura pesada, y que la card de carga muestre valores correctos).

## Últimos cambios realizados (2026-05-04)

- Se agregó recomendación óptima de atributos en el wizard: usa clase como prioridad principal, trasfondo como ajuste secundario y raza para mostrar el resultado final.
- La recomendación aplica valores base de Point Buy válidos y mantiene el contrato de no sumar bonos raciales al payload.
- Se inspeccionó Figma sección `Inventario` (`2072:3743`) y se integró en el personaje abierto con tabs internos `Equipo`, `Mochila` y `Alijo`.
- `Equipo` muestra slots equipados/vacíos como Figma; `Mochila` conserva inventario real y agrega flujo de búsqueda/filtros/cantidad para añadir objetos; `Alijo` agrupa objetos no equipados/no consumibles como solución temporal.
- Se agregaron US-136 y US-137.
- Pendiente: validar visualmente en navegador, modelar monedas (`PO`, `PP`, `PC`) y decidir si `Alijo` requiere persistencia real por ubicación.

## Últimos cambios realizados (2026-05-04)

- Se aplicó feedback de usuario avanzado al wizard de creación: razas agrupadas por familia/raza padre y atributos movidos a fase tardía.
- Orden de elfos en selección: `Drow`, `Elfo Alto`, `Elfo del Bosque`; las variantes ya no dependen del orden alfabético del catálogo.
- Tiefling queda preparado para agrupar futuras subrazas si el catálogo las contiene, pero no se inventaron subrazas ni mecánicas no validadas.
- `Atributos del personaje` ahora aparece después de raza/trasfondo/clase/equipamiento y antes de habilidades/conjuros/PG para conservar cálculos dependientes.
- Se agregó US-135.
- Pendiente: validar visualmente en navegador que la lista agrupada y el nuevo orden de pasos se sientan correctos en mobile.

## Últimos cambios realizados (2026-05-04)

- Se endureció el almacenamiento de credenciales de perfiles: nuevas contraseñas usan `scrypt` con salt y pepper de servidor (`AUTH_SECRET`).
- Se conserva compatibilidad de login para hashes PBKDF2 heredados.
- En producción, el backend falla al iniciar si `AUTH_SECRET` conserva el fallback de desarrollo.
- Los tokens de sesión ya no incluyen correo; solo `sub`, `iat` y `exp`.
- La UI y backend requieren mínimo 10 caracteres de contraseña.
- Pendiente: validar registro/login en Render después de redeploy con `AUTH_SECRET` real configurado.

## Últimos cambios realizados (2026-05-04)

- Se corrigió el upload de imágenes para producción: `express.json({ limit: '2mb' })` y `error-handler` ahora convierte `ZodError`/JSON inválido/payload grande a 422/400/413 en vez de 500 genérico.
- Pendiente: redeploy en Render y probar `PATCH /characters/:id/image` desde GitHub Pages.

## Últimos cambios realizados (2026-05-04)

- Se corrigió persistencia real de imágenes de personaje: `Character.image_data` en Prisma, migración `20260504131500_add_character_image`, endpoint `PATCH /characters/:id/image` y UI enviando imagen comprimida al backend.
- `localStorage` queda solo como cache/fallback, ya no como fuente principal.
- Pendiente: deploy en Render para aplicar migración y validar subida desde `https://www.migueleo.com`.

## Últimos cambios realizados (2026-05-04)

- Se corrigieron los íconos de la app pública: `ui.html` ahora incluye un sprite SVG local para navegación, placeholders y quick stats; `style.css` define tamaños/colores.
- Motivo: los assets originales de Figma MCP no son aptos para producción y los fallbacks de letras se veían incorrectos en GitHub Pages.

## Últimos cambios realizados (2026-05-04)

- API Render pública verificada: `https://dnd-character-engine-api.onrender.com/health` responde `{"status":"ok"}`.
- `config.public.js` ahora apunta GitHub Pages a `https://dnd-character-engine-api.onrender.com`.
- Pendiente: hacer commit/push y validar en `https://www.migueleo.com` que el estado cambie a conectado y permita login/registro.

## Últimos cambios realizados (2026-05-04)

- Render no estaba instalando `devDependencies`, por lo que `tsc` no existía durante build y `npx` intentaba usar el paquete incorrecto `tsc`.
- Se agregó `NPM_CONFIG_PRODUCTION=false` en `render.yaml` y `.env.example`.
- En Render Free, el Build Command recomendado es: `npm ci --include=dev && npm run prisma:generate && npm run deploy:migrate && npm run build`.

## Últimos cambios realizados (2026-05-04)

- Se corrigió el build de TypeScript en Render agregando `ignoreDeprecations: "5.0"` en `tsconfig.json`; esto evita que la advertencia de `moduleResolution: node10` falle como error.
- Validado con `npm run build` y `npm run prepublish:check`.

## Últimos cambios realizados (2026-05-04)

- Se ajustó deploy Render para fijar Node 20 LTS y separar build de migraciones.
- `package.json` ahora declara `engines.node = 20.x`.
- `render:build` ya no ejecuta migraciones; solo genera Prisma Client y compila TypeScript.
- `render.yaml` incluye `NODE_VERSION=20`. Las migraciones deben correr como Pre-Deploy Command (`npm run deploy:migrate`) o manualmente con `npx prisma migrate deploy`.

## Últimos cambios realizados (2026-05-04)

- Se preparó el backend para despliegue público en Render Free Web Service.
- `src/index.ts` ahora restringe CORS en producción mediante `ALLOWED_ORIGINS`; localmente mantiene compatibilidad cuando no hay orígenes configurados.
- `package.json` incluye `postinstall`, `deploy:migrate` y `render:build`.
- Se agregó `render.yaml` sin secretos embebidos: `DATABASE_URL` y `AUTH_SECRET` quedan como variables privadas `sync: false`.
- Se agregó US-134.
- Validado con `npm run typecheck`, `npm run test`, `npm run build` y `npm run security:check`.
- Pendiente: crear Web Service en Render, configurar `DATABASE_URL`, `AUTH_SECRET`, confirmar `/health` y actualizar `config.public.js` con la URL HTTPS real de API. Si `www.migueleo.com` es GitHub Pages, usar otra URL para API, por ejemplo la URL `onrender.com` o `api.migueleo.com`.

## Últimos cambios realizados (2026-05-04)

- `config.public.js` ahora apunta la UI publicada a `https://www.migueleo.com` como URL pública de API.
- Pendiente de validación: confirmar que `https://www.migueleo.com/health` responda desde un backend Express/Prisma. Si el dominio solo sirve GitHub Pages, la app seguirá marcando “Sin conexión”.

## Últimos cambios realizados (2026-05-04)

- Se preparó el proyecto para publicarse en GitHub sin exponer secretos: `.gitignore` endurecido, `.env.example` seguro, `README.md`, `SECURITY.md`, `config.public.js`, `index.html`, `.nojekyll` y workflow de GitHub Pages.
- El workflow `.github/workflows/pages.yml` publica únicamente archivos estáticos permitidos (`index.html`, `ui.html`, `style.css`, `config.public.js`, `.nojekyll`), no backend, no `.env`, no `node_modules`.
- Se eliminaron dependencias runtime a URLs privadas/remotas de Figma MCP y Google Fonts en UI/CSS.
- Se agregó `scripts/security-check.js` y `npm run prepublish:check`; validación pasada con typecheck, 126 tests y security check.
- Se agregó US-133.
- Nota de arquitectura: GitHub Pages solo despliega la UI estática. Login, perfiles y personajes requieren un backend Express/Prisma desplegado aparte y configurado en `config.public.js` con una URL pública sin secretos.

## Últimos cambios realizados (2026-05-04)

- La subida local de imagen de personaje ahora redimensiona y comprime antes de guardar en `localStorage`, evitando el error frecuente de imagen demasiado pesada.
- La UI usa canvas con límite aproximado de 900×620 px y salida WebP/JPEG antes de aplicar la imagen al hero del personaje.

## Últimos cambios realizados (2026-05-04)

- Se agregó US-132 para perfiles de jugador, login y roster por propietario.
- Backend: nuevo `User` en Prisma, migración `20260504120000_add_user_profiles`, endpoints `/auth/register`, `/auth/login`, `/auth/me`, `/auth/logout`, hashing PBKDF2 y token firmado con `AUTH_SECRET`.
- Backend: `GET /characters` filtra por `user_id` cuando hay sesión; `POST /characters` asigna dueño; las rutas `/characters/:id` y subrutas rechazan acceso a personajes de otro perfil.
- UI: pantalla de login/registro antes del roster, persistencia de token en `localStorage`, header con perfil activo, cierre de sesión y envío automático de `Authorization: Bearer`.
- Compatibilidad: personajes antiguos con `user_id = null` siguen existiendo y no se reasignan automáticamente. Pendiente decidir si habrá flujo de importación/adopción de personajes legados.
- Validado: `npm run typecheck`, `npx prisma validate`, `npm run prisma:generate`.
- Pendiente: aplicar migración en Supabase remoto; desde este entorno falló por restricción de red hacia el host privado configurado en `.env`.
- Importante: para Supabase/remoto usar `npx prisma migrate deploy`. No aceptar resets de `npm run db:migrate` / `prisma migrate dev` si Prisma detecta drift o migraciones editadas, porque ese flujo puede borrar datos.

## Últimos cambios realizados (2026-05-04)

- La pestaña `Habilidades` ahora incluye subvista `Competencias` para armas, armaduras, escudos, herramientas y objetos competentes.
- Las competencias se derivan desde clase primaria/multiclase, traits raciales, trasfondo y `CharacterTool`.
- El uso de consumibles/pociones ahora conserva una cache del inventario cargado en la pestaña para resolver correctamente el item al hacer clic en `Usar`.
- El modal de dados de consumibles permanece abierto si aplicar el efecto falla, para permitir reintento.
- El backend de inventario acepta `effect_total` como número coercible.
- Si una poción se aplica pero falla el refresco del inventario, la UI conserva los PG devueltos por la acción y muestra advertencia no bloqueante.

## Últimos cambios realizados (2026-05-01 — sesión 15)

- Se verificó Figma `personaje abierto` (`2001:486`) y se corrigió la ficha abierta para mostrar la fila de resumen exacta del prototipo: `CA`, `Velocidad`, `Nivel`, `B. Comp.`.
- El bonificador de competencia ahora es visible en la ficha abierta mediante `s-prof-visible`; `Iniciativa` queda fuera de esa fila Figma.
- Se ajustaron detalles visuales de la ficha: tabs en grilla Figma, CTA `Agregar experiencia`, label `Car. Mágica` y nombres completos de atributos en mayúsculas.

## Últimos cambios realizados (2026-05-01 — sesión 15 previa)

- Se ajustó el flujo `Tirar Dado` → `Ataque` para sumar competencia solo cuando el personaje es competente con el arma.
- La UI calcula el modificador de ataque según reglas DnD: FUE para cuerpo a cuerpo/arrojadizas, DES para distancia y mejor FUE/DES en armas con Sutileza.
- Las cards de ataque muestran `Ataque +X` y `Competente` / `Sin competencia`; la pantalla de tirada muestra fórmula y razonamiento.
- La pestaña `Habilidades` ahora muestra resumen de competencias y badges por fila para habilidades y tiradas de salvación.
- Se agregó US-131.

## Últimos cambios realizados (2026-05-01 — sesión 15 previa)

- Se corrigió el descuento visual de munición en ataques: `inventoryDisplayQuantity` ya no fuerza flechas/virotes a mostrarse como mínimo en el tamaño del paquete del catálogo.
- El primer disparo contra munición heredada guardada como paquete (`x1`/`x2`) se normaliza a unidades reales antes de descontar, y a partir de ahí queda marcada como cantidad unitaria localmente.
- Se actualizó US-128 con el criterio de que `x20` debe pasar a `x19` después de disparar.

## Últimos cambios realizados (2026-05-01 — sesión 15 previa)

- Se agregó animación de dados virtuales tipo “tirada”: el dado rebota/gira, cambia números durante casi un segundo y cae en el resultado final.
- La animación se integró en ataque d20, daño de armas, conjuros/trucos, tiradas personalizadas y consumibles con dados.
- Los botones de tirada se bloquean mientras el dado está rodando y hay fallback para `prefers-reduced-motion`.
- Se agregó US-130 para documentar el comportamiento.

## Últimos cambios realizados (2026-05-01 — sesión 15 previa)

- Se implementaron los microflujos Figma `Lanzar Dado Flujo de ataque` y `Lanzamiento de conjuro` desde el botón `Tirar Dado` del personaje abierto.
- El flujo de ataque lista armas equipadas, tira d20, descuenta munición compatible, maneja 20 natural / 1 natural, solicita confirmación de éxito o fallo y calcula daño con crítico.
- El flujo de conjuro muestra tabs `Truco` / `Conjuro`, espacios disponibles, cards de conjuros, selector de dado y resultado con instrucción de salvación contra CD.
- Se agregaron US-128 y US-129 para documentar estos flujos.

## Últimos cambios realizados (2026-05-01 — sesión 15 previa)

- Se corrigió el wizard para cargar `items` dentro de `wizLoadCatalog()` y asegurarlos nuevamente antes de `wizardFinish()`.
- `wizardFinish()` ahora bloquea la creación si hay grupos de equipamiento pero las selecciones no se resolvieron a IDs de catálogo.
- El equipamiento retroactivo desde Inventario ahora es idempotente: expande packs a artículos finales y solo agrega los objetos faltantes, evitando incrementos repetidos si `localStorage` se pierde.
- Los consumibles de curación con dados ahora exigen `effect_total` y aplican curación aditiva (`current_hp + tirada`) con límite de max HP.
- Se actualizaron US-122 y US-124 con estos criterios.

## Últimos cambios realizados (2026-05-01 — sesión 14)

- Se eliminaron 425 líneas de código muerto en `ui.html`: definiciones antiguas de `wizardOpen` (×2), `wizardClose` (×2), `wizUpdateDots` (×2), `wizRenderStep` (×2), `wizValidateStep` (×2), `wizardNext` (×2), `wizardPrev` (×2), `wizStep1HTML` (×1), `wizStep4HTML` (×1), `wizSelectRace` (×1), `wizSelectBg` (×1), `wizSelectClass` (×2). Cada función ahora tiene exactamente una definición. TypeScript: 0 errores.

## Últimos cambios anteriores (2026-05-01 — sesión 13)

- Se corrigió bug crítico de ASI (US-121): `wizAsiType` ya no llama a `wizRenderStep` al cambiar tipo — ahora hace toggle DOM en `#asi-one-{i}` / `#asi-two-{i}` sin re-renderizar el paso completo.
- Se reescribió `wizPdfAsiHTML`: los selects usan atributo `selected` explícito en la opción correcta, y el div `#wiz-asi-summary-wrap` siempre está presente en el DOM (antes era condicional y el badge no podía actualizarse tras la primera selección).
- Se extrajo `wizAsiUpdateSummary()` como función compartida por `wizAsiType` y `wizAsiStat`.
- Se eliminó `wiz.data.spell_selections = []` de `wizAsiStat` (reseteo erróneo que borraba conjuros al tocar ASI).

## Últimos cambios anteriores (2026-05-01 — sesión 12)

- Se reforzó la compatibilidad de munición equipada: arco/flechas, ballesta/virotes, honda/balas y cerbatana/agujas.
- Al equipar un arma a distancia, el backend limpia munición incompatible y auto-equipa munición compatible disponible.
- Al intentar equipar manualmente munición incompatible con el arma activa, el backend rechaza la acción con mensaje en español.
- La UI normaliza inventarios heredados para no mostrar como equipada una munición incompatible que ya existiera en base de datos.
- Se enriquecieron descripciones y tags de inventario/equipamiento desde el catálogo: armas simples/marciales, cuerpo a cuerpo/distancia/arrojadizas, daño, alcance, propiedades, armaduras ligeras/medias/pesadas, CA, requisitos, desventaja de sigilo, peso, valor, focos, consumibles y kits.
- Se enriquecieron tarjetas de trucos y conjuros con componentes, alcance, tiempo, duración, concentración y efectos mecánicos cuando existen en `effects`.
- Se agregó US-127 para descripciones robustas y tags limpios sin emojis.

## Últimos cambios realizados (2026-05-01 — sesión 11)

- Se normalizó la presentación de municiones en inventario: `Arrows (20)` se muestra como `Flechas` y cantidad efectiva `x20`; `Crossbow Bolts (20)` se muestra como `Virotes`.
- Se agregó normalización de cantidad para municiones al crear personajes, agregar inventario y desglosar paquetes.
- Se actualizó US-123 con el criterio de aceptación de nombres/cantidades de munición.

## Últimos cambios realizados (2026-05-01 — sesión 10)

- Se agregó loader global accesible para solicitudes de la UI.
- El loader se integró al helper central `api()` y usa contador de solicitudes concurrentes para evitar parpadeos.
- El loader diferencia mensajes de carga (`GET`) y guardado/cambios (`POST`, `PATCH`, `DELETE`, etc.).
- Se agregó US-126 en `docs/requirements.md`.

## Últimos cambios realizados (2026-05-01 — sesión 9)

- Se agregó la sección Figma de PG en `personaje abierto`: `Puntos de Golpe`, `Puntos de Golpe temporales` y botón `Ajustar puntos de golpe`.
- Se agregó modal de ajuste igualado a Figma `Puntos de golpe Modal` (`2052:305` / `2052:472`): pantalla completa, header con flecha atrás, cards de resumen, steppers menos/mas, texto de caída a cero y CTA `Guardar cambios`.
- El modal guarda valores exactos de PG actuales y PG temporales.
- Se agregó `POST /characters/:id/current-hp` para establecer PG actuales con límite de max HP calculado.
- Se corrigió `POST /characters/:id/heal` para usar max HP real calculado, no una estimación por Constitución.
- Se agregó US-125 en `docs/requirements.md`.

## Últimos cambios realizados (2026-05-01 — sesión 8)

- Se agregó script auxiliar para personaje demo completo: `scripts/create-demo-character.js` (Prisma directo).
- Se agregó/mejoró script API para personaje demo: `scripts/create-demo-via-api.js`, con detección de `localhost` / `127.0.0.1` y mensajes de diagnóstico cuando `fetch` falla.
- El demo se llama `Demo Inventario Completo` y está pensado para validar inventario, kits, consumibles, dados, armas, escudo, armadura y munición.

## Últimos cambios realizados (2026-04-30 — sesión 7)

- Se agregó US-124 para uso de consumibles, apertura de kits y modal de dados virtuales.
- `inventory.controller.ts` ahora expone uso de inventario para abrir packs/kits heredados, descontar consumibles y aplicar curación de pociones al `current_hp`.
- `ui.html` agrega acciones `Abrir kit` y `Usar`; objetos con dados abren un modal visual antes de aplicar el efecto.
- `style.css` agrega el modal de dados virtuales con estilo mobile-first de la plataforma.
- Validado con parse del script de `ui.html`, `npm run typecheck` y `npm run test`.

## Últimos cambios anteriores (2026-04-30 — sesión 6)

- Se agregó US-123 para reglas de equipamiento y ocupación de manos en inventario.
- La pestaña Inventario ahora muestra botón `Equipar` / `Desequipar` para armas, armaduras, escudos y munición.
- El backend aplica exclusividad de armadura corporal, compatibilidad de escudo con una sola arma de una mano, armas a dos manos/arcos/ballestas excluyentes y doble arma restringida a armas ligeras o clases marciales configuradas.
- Al equipar arco/ballesta se auto-equipa munición compatible existente (flechas/virotes).
- Las descripciones de paquetes/kits muestran artículos y cantidades desde `pack_contents`.
- Validado con parse del script de `ui.html`, `npm run typecheck` y `npm run test`.

## Últimos cambios anteriores (2026-04-30 — sesión 5)

- Se corrigió el guardado de equipamiento retroactivo desde la pestaña Inventario para personajes creados antes del flujo `Equipamiento`.
- Después de guardar, la UI refresca directamente el inventario con `GET /characters/:id` y deja `loadSheet()` como actualización secundaria no bloqueante.
- Se agregó guardia para no guardar ni marcar `localStorage` si las selecciones no se resuelven a objetos válidos del catálogo.
- Validado con parse del script de `ui.html`, `npm run typecheck` y `npm run test`.

## Últimos cambios anteriores (2026-04-30 — sesión 4)

- Se agregó el flujo `Equipamiento` del Figma (`2047:6676`) al wizard de creación (US-122).
- El wizard ahora solicita equipamiento de clase antes de tirar puntos de golpe y no permite continuar hasta completar cada grupo de selección.
- Las elecciones de equipamiento se persisten al crear personaje mediante `equipment_selections`.
- El backend desglosa paquetes tanto con `item_id`/`quantity` como con el formato actual de seeds `item`/`qty`.
- La pestaña Inventario muestra tarjetas ricas con cantidad, tipo, atributos principales y descripción breve.
- Si un personaje existente no tiene equipamiento de clase detectable, la pestaña Inventario permite escogerlo una vez y guardarlo.
- Pendiente: validación visual 1:1 en navegador y validación E2E con base de datos después de correr migraciones/seeds.

## Últimos cambios anteriores (2026-04-30 — sesión 3)

- Se corrigieron los guardrails de creación de personajes de nivel alto (US-121).
- El backend ahora persiste subclases desbloqueadas en nivel 2/3+, valida ASI por hitos de clase, exige conteos exactos de trucos/conjuros y valida que los conjuros pertenezcan a la lista de clase y nivel disponible.
- El wizard coloca ASI antes de habilidades/conjuros, exige completar ASI cuando aplica, y calcula conjuros/PG usando atributos finales con raza + ASI.
- Se restauró `pointsUsed` en `validatePointBuy` para alinear servicio e integración.
- Validado con `node --check` del script de `ui.html`, `npm run typecheck`, `npm run test:unit`, `npm run test:integration` y `npm run test`.

## Últimos cambios anteriores (2026-04-30 — sesión 2)

- Se implementó creación de personajes de nivel alto (US-121): paso ASI en el wizard, subclase dinámica para clases L3+, conjuros de nivel alto agrupados por nivel, validación backend escalada por nivel.
- Los `base_*` ahora almacenan: Point Buy base + ASI elegidas en wizard (los bonos raciales siguen sumándose en tiempo de lectura/hidratación).
- Ver detalles completos en CHANGELOG [2026-04-30].

## Últimos cambios anteriores

- Se separaron estilos del HTML hacia `style.css`.
- Se agregó back/cancel en el encabezado del wizard.
- Se dejó el botón `Siguiente` deshabilitado hasta que el paso actual sea válido.
- Se documentaron US-114 y US-115 en `docs/requirements.md`.
- Se creó `CHANGELOG.md` retroactivo.
- Se creó este `HANDOFF.md`.
- Se actualizó `.claude.md` con reglas persistentes de continuidad.
- Se ajustó el wizard para autoavanzar de selección a `Tu selección` en raza, trasfondo, clase y subclase.
- Se agregó persistencia de tirada de PG inicial con `level_1_hp_roll`.
- Se verificó en Figma la pantalla `Tu selección` (`2005:1847` / `2005:2000`) y se ajustaron las cards de review para empatar layout, colores, tipografías, padding, borde y badges.
- Se verificó en Figma el microflujo de personaje abierto (`2001:486`) y el roster/bottom nav (`29:314`).
- Se reemplazó la navegación inferior móvil por los cuatro destinos de Figma y se agregaron placeholders para secciones no implementadas.
- Se agregó vista de detalle de personaje con encabezado `Atrás`, nombre, `Tirar Dado`, tabs internos y ficha con biografía, combate, XP, atributos y magia.
- Se agregó subida local de imagen de personaje dentro del detalle; la imagen se adapta al hero fijo con `cover`.
- Se ajustaron los subtabs de detalle según Figma: `Habilidades` separa habilidades de tiradas de salvación, y `Conjuros` separa trucos de conjuros.
- Se verificó en Figma la tarjeta `beast-card-B` de la pantalla `Personajes` y se ajustó la card de personaje creado en el roster.
- Se verificó en Figma el CTA `Agregar nuevo personaje` y se reemplazó el botón circular por el botón ancho del prototipo.

## Historias de usuario relevantes

- US-89: roster de personajes. Implementada.
- US-90: wizard multi-step. En progreso, con flujo mobile/PDF activo.
- US-108: respuesta inmediata de checkboxes. Implementada.
- US-109: descripciones contextuales de habilidades. Implementada.
- US-110: edición de personaje existente. Implementada, pendiente de regresión completa.
- US-111: selección de nivel inicial. Implementada, pendiente de regresión completa.
- US-112: flujo de creación PDF y preview de atributos. En progreso, pendiente de validación visual final.
- US-113: lenguaje visual PDF/Figma. En progreso, pendiente de comparación 1:1.
- US-114: documentación de continuidad entre IAs. Implementada.
- US-115: navegación, estado disabled y estilos externos del wizard. Implementada.
- US-116: autoavance de selecciones y PG por tirada. Implementada, pendiente de validación visual final.
- US-117: microflujo Figma de detalle de personaje y navegación inferior. Implementada, pendiente de validación visual final.
- US-118: imagen de personaje y subtabs Figma de habilidades/conjuros. Implementada con persistencia local, pendiente de persistencia backend.
- US-119: tarjeta Figma de personaje creado en roster. Implementada, pendiente de validación visual final.
- US-120: CTA Figma para agregar personaje. Implementada, pendiente de validación visual final.
- US-121: creación de personajes de nivel alto con subclase, ASI y conjuros escalados. Implementada, pendiente de validación E2E con base de datos real.
- US-122: flujo Figma de Equipamiento e inventario detallado. Implementada, pendiente de validación visual y E2E con base de datos real; incluye catálogo de items precargado e idempotencia en equipamiento retroactivo.
- US-123: estado equipado, reglas de manos, normalización de municiones y bloqueo de munición incompatible. Implementada, pendiente de validación E2E con base de datos real.
- US-124: uso de consumibles, apertura de kits y dados virtuales. Implementada, pendiente de validación E2E con base de datos real; curaciones con dados son aditivas y requieren total tirado.
- US-125: resumen Figma de PG y modales de ajuste. Implementada, pendiente de validación visual en navegador.
- US-126: loader global para solicitudes. Implementada, pendiente de validación visual en navegador.
- US-127: descripciones robustas de items, trucos y conjuros con tags limpios. Implementada, pendiente de validación visual en navegador.
- US-128: flujo Figma de dados de ataque. Implementada, pendiente de validación visual en navegador.
- US-129: flujo Figma de lanzamiento de conjuro. Implementada, pendiente de validación visual en navegador.
- US-130: animación de dados virtuales. Implementada, pendiente de validación visual en navegador.
- US-131: competencia en ataques con arma y visibilidad de competencias en habilidades/equipo. Implementada, pendiente de validación visual en navegador.
- US-132: perfiles/login/roster por dueño. Implementada con hashing `scrypt` + pepper y token mínimo, pendiente de validación E2E en Render.
- US-133: publicación segura en GitHub/GitHub Pages. Implementada, pendiente de configuración real.
- US-134: API pública para GitHub Pages. Implementada, pendiente de validación final de despliegue.
- US-135: agrupación experta de razas y atributos tardíos. Implementada, pendiente de validación visual en navegador.
- US-136: recomendación óptima de atributos por raza/clase/trasfondo. Implementada, pendiente de validación visual.
- US-137: sección Inventario Figma con Equipo/Mochila/Alijo y agregar objeto. Implementada parcial, pendiente de monedas/alijo persistente y QA visual.
- US-138: card Carga/Monedas en Mochila con barra de progreso y columnas PO/PP/PC. Implementada, pendiente de validación visual en navegador.
- US-139: hidratación completa de stats desde ítems equipados (CA, velocidad, sigilo, PG, encumbrance). Implementada vía `buildRawCharacter` + `hydrate()`, pendiente de validación visual con personaje armado.
- US-140: flujo Figma "Resolución de historia" con selector de habilidad, ventaja/desventaja automática y resultado final. Implementada, pendiente de validación visual en navegador.
- US-141: localización completa ES de 257 items y 410 conjuros SRD. Implementada, pendiente de validación visual en navegador.

## Decisiones técnicas tomadas

- El código actual es la fuente principal de verdad; la documentación debe reflejarlo, no sustituirlo.
- Los valores de atributos persistidos son valores base de Point Buy. Los bonos raciales no se suman al payload ni a los campos `base_*`.
- En la UI de atributos, el número principal debe ser `base_score + racial_bonus`, con explicación visible, por ejemplo `Base 8 + +2 raza = 10`.
- Por feedback de usuario avanzado, `Atributos del personaje` ya no debe aparecer inmediatamente después de raza. Debe quedar en la fase tardía del wizard, después de raza/trasfondo/clase/equipamiento y antes de habilidades/conjuros/PG.
- La selección de raza debe agruparse por familia/raza padre. Los elfos deben permanecer juntos en orden `Drow`, `Elfo Alto`, `Elfo del Bosque`; no regresar al orden alfabético del catálogo.
- Tiefling puede agrupar subrazas futuras si existen datos validados en catálogo, pero no inventar subrazas ni mecánicas no sembradas.
- La sugerencia de atributos debe seguir siendo una ayuda editable, no una imposición: aplicar la recomendación solo cambia Point Buy base y el usuario puede modificarla manualmente.
- La arquitectura Figma de `Inventario` vive dentro del personaje abierto, no en la navegación inferior global: `Equipo`, `Mochila` y `Alijo` son subtabs internos del tab `Inventario`.
- `Alijo` actualmente es inferido desde inventario no equipado/no consumible; no hay columna de ubicación en base de datos. Si se requiere alijo real, agregar primero historia/migración.
- Monedas (`PO`, `PP`, `PC`) aparecen como affordance visual pendiente; no simular persistencia sin modelo backend.
- Los valores derivados se calculan en hidratación o servicios, no se duplican como estado persistido.
- La tirada inicial de PG sí se persiste como dato fuente (`Character.level_1_hp_roll`) porque es necesaria para recalcular max HP cuando cambia Constitución o nivel.
- La API permite CORS amplio para que `ui.html` funcione desde `file://`.
- La UI actual es standalone; no hay framework frontend ni bundler.
- El estilo visual mobile-first del wizard se centraliza en `style.css`.
- La navegación inferior móvil representa destinos de producto, no pestañas internas de personaje. El detalle de personaje se maneja como microflujo independiente y oculta el bottom nav.
- Las imágenes de personaje se guardan en `Character.image_data` después de redimensionar/comprimir en navegador; `localStorage` (`dnd-character-image:{characterId}`) queda como cache local.
- En el detalle de personaje, `Habilidades` y `Conjuros` tienen subtabs internos que no deben mezclarse con la navegación inferior de producto.
- En el detalle de personaje, `Habilidades` debe contener subtabs internos para `Habilidades`, `Tiradas de salvación` y `Competencias`; esta última muestra armas, armaduras, escudos, herramientas y objetos competentes.
- La card del roster debe seguir el componente Figma `beast-card-B`: raza/clase, nombre, acciones compactas, quick info y biografía; no debe volver al layout de cards genéricas.
- El CTA `Agregar nuevo personaje` debe ser el botón ancho de Figma bajo la lista de personajes, no un botón flotante/circular.
- El paso `Equipamiento` pertenece al flujo de creación antes de `Puntos de golpe`; sus selecciones se guardan como inventario real y los paquetes deben desglosarse en objetos con cantidades.
- Para personajes existentes sin equipamiento de clase detectable, la UI usa la pestaña Inventario como recuperación del flujo; después de guardar marca `localStorage` con `dnd-class-equipment:{characterId}` para no repetir el chooser.
- Las reglas de equipamiento se centralizan en `src/api/controllers/inventory.controller.ts`; no confiar solo en la UI para exclusividad de manos, escudo, arma a dos manos o munición automática.
- La doble arma se permite si ambas armas son ligeras o si el personaje tiene una clase marcial configurada en `dualWeaponClassAllowed`.
- Las municiones con notación de paquete en catálogo, como `Arrows (20)`, deben presentarse en UI con nombre limpio y cantidad efectiva, por ejemplo `Flechas x20`.
- Los packs heredados pueden abrirse desde Inventario para convertirse en artículos individuales. Los consumibles con dados usan modal visual; las curaciones modifican `current_hp`, mientras daño/efectos externos se reportan para resolución en mesa.
- El uso de pociones debe aplicar solo el total tirado como curación aditiva; si falla la aplicación del efecto, el modal no debe cerrarse.
- La ficha abierta de personaje muestra PG actuales, PG máximos y PG temporales como sección propia antes del bloque de combate. Los cambios de PG se hacen desde una pantalla modal Figma con steppers y deben refrescar la ficha después de guardar.
- La fila Figma de resumen de personaje abierto debe mostrar `CA`, `Velocidad`, `Nivel` y `B. Comp.`; no reemplazarla por iniciativa en futuras iteraciones.
- El feedback de carga/guardado debe pasar por el helper central `api()` para que el loader global cubra solicitudes sin duplicar lógica visual en cada función.
- El botón `Tirar Dado` abre un microflujo full-screen separado de los tabs internos del personaje; ataque y conjuro viven en UI standalone y usan endpoints existentes para descontar munición o consumir espacios de conjuro.
- Las tiradas virtuales usan animación CSS/JS local, sin librerías externas, para evitar agregar dependencias al UI standalone.
- La UI debe mostrar munición como unidades restantes reales después de atacar; no volver a aplicar `Math.max(cantidad, tamañoDelPaquete)` para flechas/virotes ya usados.
- Los resultados de daño de ataque/conjuro se presentan para resolución con el DM; no existe todavía modelo de enemigos/objetivos al cual aplicar daño automáticamente.
- El flujo de ataque con arma solo suma competencia si el personaje tiene competencia por grupo simple/marcial o por arma específica; no suma competencia al daño.
- La UI calcula la característica de ataque como FUE para cuerpo a cuerpo/arrojadizas, DES para distancia y el mayor entre FUE/DES para armas con Sutileza.
- La documentación de continuidad debe actualizarse después de cada cambio relevante.

## Archivos clave

- `ui.html`: UI standalone, roster, wizard, hoja de personaje, edición, llamadas API.
- `style.css`: estilos visuales del wizard y UI mobile-first.
- `index.html`: entrada estática para GitHub Pages que redirige a `ui.html`.
- `config.public.js`: configuración pública de navegador; solo debe contener URL pública de API, nunca secretos.
- `.github/workflows/pages.yml`: workflow de publicación estática en GitHub Pages con allowlist de archivos.
- `scripts/security-check.js`: revisión básica para evitar publicar secretos o dependencias privadas.
- `README.md` / `SECURITY.md`: instrucciones de despliegue estático y seguridad.
- `src/index.ts`: arranque Express y montaje de rutas.
- `src/api/controllers/character.controller.ts`: creación, edición, roster, hidratación, XP, multiclase, habilidades, idiomas y conjuros conocidos.
- `src/api/controllers/catalog.controller.ts`: catálogos para UI y creación.
- `src/api/controllers/auth.controller.ts`: registro, login, sesión actual y logout de perfiles.
- `src/api/middleware/auth.ts`: hash de contraseña, token firmado, auth opcional/requerida y guardia de acceso por dueño de personaje.
- `src/api/controllers/combat.controller.ts`: daño, curación, death saves, temp HP, iniciativa y reacción.
- `src/api/controllers/rest.controller.ts`: short rest y long rest.
- `src/api/controllers/spell.controller.ts`: espacios de conjuro, cast y concentración.
- `src/api/controllers/inventory.controller.ts`: inventario, equipamiento y sintonización.
- `src/services/*.ts`: reglas puras del motor DnD.
- `src/engine/hydrate.ts`: composición de datos crudos a hoja calculada.
- `prisma/schema.prisma`: modelo de datos principal.
- `prisma/migrations/20260504120000_add_user_profiles/migration.sql`: agrega tabla `User` y FK nullable desde `Character.user_id`.
- `prisma/migrations/20260430161500_add_level_1_hp_roll/migration.sql`: agrega la tirada base de PG de nivel 1.
- `prisma/seeds/*.ts`: catálogos SRD.
- `tests/unit/*.ts`: pruebas de servicios.
- `tests/integration/*.ts`: pruebas de flujos integrados de reglas.
- `docs/requirements.md`: historias de usuario y criterios.
- `docs/plan.md`: arquitectura, datos, servicios, endpoints y contrato del wizard.
- `docs/tasks.md`: tareas SDD y estado histórico.
- `.claude.md`: reglas persistentes para Claude.
- `CHANGELOG.md`: historial retroactivo y futuro.

## Pendientes prioritarios

1. ~~Aplicar la migración `20260430161500_add_level_1_hp_roll`~~ **PENDIENTE DE CONFIRMAR** — El SQL tenía `ALTER TABLE "character"` (minúscula) pero la tabla real es `"Character"` (mayúscula, creada en la primera migración). Se corrigió el archivo SQL. Para aplicar: `npx prisma migrate resolve --rolled-back 20260430161500_add_level_1_hp_roll` y luego `npx prisma migrate deploy`. Sin esta migración, abrir cualquier personaje falla con error 500 (P3018 / 42P01).
2. **Validar hidratación completa en navegador** — Equipar una armadura a un personaje y confirmar que la ficha muestra CA correcta (no `10 + DEX`), velocidad con penalización de armadura pesada cuando STR es baja, y card de Carga/Monedas con valores reales. Requiere que la migración `20260430161500_add_level_1_hp_roll` esté aplicada.
3. Validar visualmente el wizard, roster y microflujo de detalle contra `docs/Create Character.pdf` y Figma en navegador real, especialmente screenshots de autoavance, cards `Tu selección`, card `beast-card-B`, bottom nav, personaje abierto, tabs, textos, tipografías, paleta, espaciados y orden de pantallas.
4. Validar visualmente la nueva sección de PG y el modal `Puntos de golpe Modal` contra los nodos Figma `2052:305` y `2052:472`, incluyendo edición con steppers, guardado de PG actuales y guardado de PG temporales.
5. Validar visualmente el loader global durante cargas lentas y guardados, especialmente que no bloquee demasiado rápido la lectura del estado cuando la respuesta es inmediata.
6. ~~Limpiar `ui.html`~~ **COMPLETADO** — Se eliminaron 425 líneas de código muerto. Cada función del wizard ahora tiene exactamente una definición.
7. Validar visualmente la pantalla `Equipamiento` contra Figma y probar creación real de personaje con cada clase principal para detectar objetos faltantes en seeds.
8. Ejecutar pruebas completas con PostgreSQL configurado: `npm run test`, `npm run test:integration`, migraciones y seed.
9. **Validar end-to-end creación de personaje de nivel alto desde UI** — especialmente flujo de ASI corregido: Bardo Nv4 + Escuela de Saber + subclase + +2 CAR, verificar que la ficha abierta muestre el valor correcto.
10. ~~Verificar si el level-up wizard cubre completamente ASI/dotes, conjuros nuevos y selección de subclase fuera de nivel 1.~~ **IMPLEMENTADO** — El wizard ahora incluye paso de ASI para personajes L4+, muestra subclase para clases que la desbloquean en L3+, y ofrece conjuros hasta el nivel máximo accesible según la clase y nivel. Ver CHANGELOG [2026-04-30].
11. ~~Revisar seed data de items contra SRD/manual~~ **COMPLETADO** — `prisma/seeds/item.ts` reescrito con 287 items en 11 categorías (ver CHANGELOG [2026-04-30] Catálogo completo de items SRD 5.1). Ejecutar `npm run db:seed` después de aplicar la migración pendiente.
12. Definir persistencia backend para imagen/avatar de personaje si la plataforma debe sincronizar imágenes entre navegadores o dispositivos.
13. Validar visualmente en navegador los nuevos flujos `Lanzar Dado Flujo de ataque` y `Lanzamiento de conjuro` contra Figma: tamaños, spacing, estados disabled, textos, descuento de munición y consumo de espacios.
14. Validar visualmente la animación de dados en navegador real, incluyendo `prefers-reduced-motion` y que no permita doble tirada durante el movimiento.
15. Validar visualmente el nuevo desglose de ataque con competencia y los badges de habilidades/salvaciones en un personaje con armas competentes y otro con arma no competente.
16. Aplicar migración de perfiles en la base remota con `npx prisma migrate deploy`. Evitar `npm run db:migrate` contra Supabase si pregunta por reset del schema, porque puede borrar datos.
17. Definir política para personajes legados sin dueño: dejarlos en modo local, migrarlos manualmente a un perfil, o crear una acción explícita “Importar a mi perfil”.
18. Configurar `AUTH_SECRET` en `.env` antes de usar perfiles fuera de desarrollo local.
19. Activar GitHub Pages en el repositorio real y confirmar que el workflow publica el sitio estático.
20. Si se despliega backend aparte, actualizar `config.public.js` con la URL pública de la API. No agregar secretos en ese archivo.

## Riesgos o inconsistencias detectadas

- El daño de ataque/conjuro aún no puede aplicarse a criaturas objetivo porque el proyecto no tiene módulo de enemigos/combate contra NPCs; por ahora se muestra para resolución del DM.
- El endpoint `/hydrated` fue reescrito para usar `buildRawCharacter()` + `hydrate()`; la duplicación de cálculo manual fue eliminada. Si en el futuro se agrega lógica directamente en el controller (ej. stats adicionales), debe seguir usando el motor, no reimplementar fórmulas.
- `buildRawCharacter()` usa `as any` en varios cast de Prisma porque los tipos generados no siempre coinciden exactamente con las interfaces del motor. Si se regenera el cliente Prisma (ej. tras migración), verificar que los campos mapeados no cambien de nombre.
- La completitud exacta de seeds SRD está pendiente de validación contra manual.
- Las pruebas de integración pueden requerir PostgreSQL y `.env` correctamente configurados.
- La migración de `level_1_hp_roll` falló con P3018/42P01 porque el SQL usaba `"character"` (minúscula) pero la tabla en Postgres es `"Character"`. Corregido en `migration.sql`. Requiere `prisma migrate resolve --rolled-back` antes de re-aplicar.
- Los assets de Figma usados por `ui.html` son URLs del MCP de Figma y podrían expirar; conviene migrarlos a assets locales antes de considerar la UI estable.
- La imagen subida por el usuario solo persiste en el navegador actual; si se borra almacenamiento local o se cambia de dispositivo, se pierde.
- El usuario mencionó “chat del 30 de abril de 2025”, pero el contexto disponible en esta sesión y las marcas de archivo corresponden a 2026-04-30. La fecha histórica queda pendiente de validación.
- No se detectó repositorio git disponible en la carpeta durante trabajo previo; usar comparación por archivos y pruebas locales.
- La autenticación usa token firmado propio con `AUTH_SECRET`; si no se configura, usa un secreto de desarrollo. No usar el secreto de desarrollo en producción.
- Los perfiles nuevos no verán personajes antiguos con `user_id = null` en el roster loggeado; esto es intencional para privacidad, pero requiere flujo de migración si se quieren adoptar personajes creados antes de US-132.
- La migración de perfiles apunta a Supabase remoto según `.env`; requiere conectividad de red para aplicarse.
- GitHub Pages no ejecuta el backend; si `config.public.js` queda apuntando a `http://localhost:3000`, la UI publicada solo funcionará contra un servidor local del usuario.

## Comandos útiles

- `npm install`
- `cp .env.example .env`
- `npm run prisma:generate`
- `npm run db:migrate`
- `npx prisma migrate deploy`
- `npm run db:seed`
- `npm run dev`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:integration`
- `npm run test`
- `npm run security:check`
- `npm run prepublish:check`
- Abrir UI: `file:///Users/miguelleo/Desktop/dnd%20claude%20app/DnD%20personajes/ui.html`

## Regla de continuidad

Cuando el usuario indique: "Dime lo que hay que hacer", la IA debe leer primero:

1. `HANDOFF.md`
2. `CHANGELOG.md`
3. `requirements.md`
4. Estado actual del código

Después debe proponer los siguientes pasos concretos, priorizados y sin repetir trabajo ya documentado.
