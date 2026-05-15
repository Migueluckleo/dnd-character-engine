# CHANGELOG

Registro retroactivo del proyecto. El código actual es la fuente principal de verdad; las fechas previas se basan en marcas de archivo y documentación disponible, por lo que algunas entradas se indican como estimadas.

## [2026-05-15] - Fix normalización defensiva de inventario cuando Vite carga tarde

### Cambios
- Se reforzaron los wrappers inline de `ui.html` para que nombres, tipos, atributos, chips e iconos de inventario tengan fallbacks en español si `window.DND_ITEM_HELPERS` aún no terminó de cargar.
- `itemLabel()` ya no cae directamente al nombre crudo en inglés; usa un mapa fallback de armaduras, armas y objetos comunes.
- `itemTypeLabel()`, `armorCategoryLabel()`, `weaponFamily()`, `weaponTraining()`, `itemRuleChips()` e `inventoryCardRows()` tienen salida defensiva en español.
- `itemImageHtml()` ya no devuelve vacío cuando el helper modular no está listo; renderiza un SVG fallback rojo brand por categoría.
- Cuando llega `dnd-client-ready`, la app vuelve a renderizar el inventario abierto, el drawer de descripción y la pantalla de cantidad si estaban visibles.
- El título interno del cuerpo del drawer cambió de `Description` a `Descripción`.

### Archivos modificados
- `ui.html`
- `CHANGELOG.md`
- `HANDOFF.md`
- `docs/tasks.md`
- `docs/requirements.md`
- `docs/behavioral_design.md`

### Validación
- `npm run typecheck:web`
- `npm run build:web`
- Build Vite confirmado con `Chain Mail` → `Cota de Mallas`, SVG fallback rojo y `Descripción` en `_site/ui.html`.
- `npm run prepublish:check`
- `/Users/migueleo/.local/bin/graphify update .`

### Fuente / certeza
- Basado en reporte directo del usuario: el drawer volvía a mostrar `Chain Mail`, `armor`, `Description` y sin icono tras los ajustes de carga/refactor.
- Causa corregida: wrappers demasiado delgados dependían de `window.DND_ITEM_HELPERS`; si el módulo cargaba tarde, la UI renderizaba valores crudos.

---

## [2026-05-15] - Ajuste visual de iconos fallback de inventario al rojo brand

### Cambios
- Se cambió el color de los iconos fallback de inventario a `#720000`, el rojo brand usado en titulares/dividers.
- `gameIconPath()` ya no usa el color por rareza para pintar iconos de Game-icons/Iconify.
- El SVG local de anillo y los fallbacks cuando falla una imagen local también usan el rojo brand.
- Las imágenes locales reales de objetos no se modifican.

### Archivos modificados
- `src/client/inventoryHelpers.ts`
- `CHANGELOG.md`
- `HANDOFF.md`
- `docs/tasks.md`
- `docs/requirements.md`
- `docs/behavioral_design.md`

### Validación
- `npm run typecheck:web`
- `npm run build:web`
- `npm run prepublish:check`
- `/Users/migueleo/.local/bin/graphify update .`

### Fuente / certeza
- Basado en solicitud directa del usuario: los iconos de armas, escudos y anillos se veían amarillentos y debían usar el rojo brand.

---

## [2026-05-15] - Fix refresh de sesión tras refactor Vite

### Cambios
- Se corrigió el arranque de `ui.html` para que producción ejecute `initAuth()` de inmediato y no dependa exclusivamente del evento `dnd-client-ready` emitido por el módulo Vite.
- Se agregó un guard `startAuthOnce()` para evitar doble inicialización cuando el evento de Vite llega después.
- En preview local se conserva la espera por `DND_CLIENT_READY`, con timeout de respaldo, porque el mock API sí vive en módulos Vite.

### Archivos modificados
- `ui.html`
- `CHANGELOG.md`
- `HANDOFF.md`
- `docs/tasks.md`
- `docs/requirements.md`
- `docs/behavioral_design.md`

### Validación
- `npm run typecheck:web`
- `npm run build:web`
- `npm run prepublish:check`
- `/Users/migueleo/.local/bin/graphify update .`

### Fuente / certeza
- Basado en reporte directo del usuario: al refrescar en `migueleo.com`, a veces quedaba la pantalla inicial con `Perfil local` y roster vacío hasta hacer logout/login.
- Causa probable: condición de arranque introducida por el refactor, donde la autenticación quedó bloqueada esperando un evento de módulo Vite que puede retrasarse o no observarse en refresh móvil.

---

## [2026-05-15] - Fix inventario tras Fase 4: descripciones, español e imágenes

### Cambios
- Se corrigió `src/client/inventoryHelpers.ts` para que `itemDescription()` vuelva a priorizar `item.description` y `item.properties.description` antes de generar descripciones automáticas.
- Se endureció el wrapper `itemDescription()` en `ui.html` para conservar descripciones explícitas aunque `window.DND_ITEM_HELPERS` todavía no esté disponible.
- Se restauró la regla documentada de US-127/US-145: las descripciones guardadas en BD/catalogo son fuente principal.
- Se corrigieron labels de inventario que habían quedado sin acentos (`Ácido`, `Frío`, `Relámpago`, `Munición`, `Poción`, `Objeto mágico`).
- Se reemplazaron mapas capturados demasiado temprano en `ui.html` por proxies vivos hacia `window.DND_ITEM_HELPERS`, evitando que constantes como `DAMAGE_ES`, `ITEM_NAME_ES` o `ITEM_RARITY_THEME` queden vacías antes de que cargue Vite.
- Se resolvieron las imágenes locales de inventario con `import.meta.glob()` para que Vite las incluya en producción; si una imagen local falla, el arte cae a un icono de respaldo en vez de desaparecer.
- Se agregó un respaldo SVG local para iconos críticos de anillo, reduciendo la dependencia visual de Iconify cuando no hay red.

### Archivos modificados
- `src/client/inventoryHelpers.ts`
- `ui.html`
- `CHANGELOG.md`
- `HANDOFF.md`
- `docs/tasks.md`
- `docs/requirements.md`
- `docs/behavioral_design.md`

### Validación
- `npm run typecheck`
- `npm run typecheck:web`
- `npm run build:web`
- `npm run prepublish:check`
- `/Users/migueleo/.local/bin/graphify update .`
- Build Vite confirmado con assets de `src/images/items` emitidos en `_site/assets`.

### Fuente / certeza
- Basado en reporte directo del usuario: las descripciones de inventario desaparecieron tras la extracción de helpers.
- Confirmado por prueba directa de `itemDescription()` con un item tipo pack que trae `description` explícita.
- Basado en reporte directo del usuario: nombres/características/atributos dejaron de normalizarse en español y no renderizaban imágenes como escudo/anillos.
- QA visual en navegador integrado sigue bloqueada por `ERR_BLOCKED_BY_CLIENT` al abrir `localhost`/`127.0.0.1`.

---

## [2026-05-14] - Fase 4 de modularización frontend: helpers de inventario/item display (US-148)

### Cambios
- Se creó `src/client/inventoryHelpers.ts` con todos los helpers puros de inventario/item display extraídos de `ui.html`.
- El módulo exporta interfaces (`ItemProperties`, `CatalogItem`, `InventoryEntry`, `RarityTheme`, `DrawerRule`), constantes (`ITEM_NAME_ES`, `DAMAGE_ES`, `ITEM_IMAGE_BASE`, `ITEM_IMAGE_BY_NAME`, `ITEM_IMAGE_BY_KIND`, `GAME_ICON_BY_KIND`, `ITEM_RARITY_THEME`, `ITEM_DEFAULT_THEME`, `INVENTORY_FILTER_LABELS`) y 29 funciones puras tipadas.
- El módulo expone `window.DND_ITEM_HELPERS` para que `ui.html` pueda delegarle en tiempo de ejecución.
- `src/client/main.ts` importa `./inventoryHelpers` como tercer módulo cliente.
- `ui.html` reemplaza todas las implementaciones inline de esos helpers por wrappers de una línea que delegan a `window.DND_ITEM_HELPERS`, conservando fallbacks seguros para el caso en que el módulo no haya cargado aún.
- No se cambió diseño, `style.css`, endpoints ni comportamiento observable.

### Archivos modificados
- `src/client/inventoryHelpers.ts` — creado (módulo nuevo)
- `src/client/main.ts` — agrega `import './inventoryHelpers'`
- `ui.html` — 29 bloques reemplazados por wrappers de una línea
- `CHANGELOG.md`, `HANDOFF.md`, `docs/tasks.md`, `docs/behavioral_design.md`

### Historias de usuario relacionadas
- US-148: Modularización frontend incremental sin rediseño

### Fuente / certeza
- Confirmado: `npx tsc --noEmit` → 0 errores
- Confirmado: `npx jest` → 126/126 tests passing
- Pendiente: `graphify update .` (no disponible en entorno CI — ejecutar localmente)

## [2026-05-15] - Fase 3 de modularización frontend: utilidades legacy

### Cambios
- Se creó `src/client/legacy-utils.ts` para alojar utilidades puras compartidas del cliente legacy.
- Se movieron a módulo funciones de escape de texto, formato de modificadores, delay, parsing de fórmulas de dados, tiradas de dados y mapeo de caras a clases CSS.
- `src/client/main.ts` ahora carga `legacy-utils` antes de `preview`.
- `ui.html` conserva wrappers globales mínimos para mantener compatibilidad con las llamadas existentes mientras se reduce el código inline.
- La extracción no cambia diseño, estilos, endpoints reales ni comportamiento previsto de preview.

### Archivos modificados
- `src/client/legacy-utils.ts`
- `src/client/main.ts`
- `ui.html`
- `CHANGELOG.md`
- `HANDOFF.md`
- `README.md`
- `SETUP.md`
- `docs/tasks.md`
- `docs/requirements.md`
- `docs/behavioral_design.md`

### Validación
- `npm run typecheck`
- `npm run typecheck:web`
- `npm run build:web`

### Fuente / certeza
- Basado en solicitud directa del usuario para continuar con Fase 3.
- Confirmado por typecheck backend/frontend y build Vite.

---

## [2026-05-15] - Fase 2 de modularización frontend: preview API

### Cambios
- Se extrajo el mock API de preview desde `ui.html` hacia `src/client/preview.ts`.
- `src/client/main.ts` ahora carga el módulo de preview antes de emitir `dnd-client-ready`.
- `ui.html` conserva la UI y el flujo actual, pero delega las llamadas de `PREVIEW_MODE` a `window.DND_PREVIEW_API.request(...)`.
- El arranque de la UI espera `DND_CLIENT_READY` cuando el módulo Vite aún no terminó de inicializar.
- Se redujo el tamaño de `ui.html` sin cambiar diseño, estilos ni endpoints reales.
- Se agregó el stub vacío `Prisma Seeds & Catalog Data.md` al `.gitignore` para evitar que un link generado por Obsidian/Graphify entre accidentalmente en un `git add .`.

### Archivos modificados
- `.gitignore`
- `src/client/preview.ts`
- `src/client/main.ts`
- `ui.html`
- `README.md`
- `SETUP.md`
- `docs/requirements.md`
- `docs/tasks.md`
- `docs/behavioral_design.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Validación
- `npm run typecheck:web`
- `npm run build:web`
- Pendiente: validación visual en navegador integrado, bloqueada por `ERR_BLOCKED_BY_CLIENT` al abrir `localhost`/`127.0.0.1`.

### Fuente / certeza
- Basado en solicitud directa del usuario para iniciar Fase 2.
- Confirmado por build Vite y typecheck frontend.

---

## [2026-05-15] - Regla obligatoria de documentación por cambio

### Cambios
- Se formalizó que todo cambio de código, configuración, workflow, UI, documentación o tooling debe quedar registrado antes de cerrar la tarea.
- Se estableció `CHANGELOG.md` + `HANDOFF.md` como documentación mínima obligatoria para cualquier cambio.
- Se aclaró que `docs/requirements.md`, `docs/tasks.md` y `docs/behavioral_design.md` también deben actualizarse cuando cambien comportamiento, UX, criterios de aceptación o alcance de producto.
- Se añadió la instrucción en `AGENTS.md`, `CLAUDE.md` y `HANDOFF.md` para que futuros agentes la respeten.

### Archivos modificados
- `AGENTS.md`
- `CLAUDE.md`
- `HANDOFF.md`
- `CHANGELOG.md`

### Historias de usuario relacionadas
- N/A — regla de proceso y continuidad del proyecto.

### Fuente / certeza
- Basado en instrucción directa del usuario.
- Confirmado por actualización de guías de agente y documentación viva.

---

## [2026-05-15] - Fase 1 de modularización frontend con Vite

### Cambios
- Se agregó Vite como bundler/desarrollo frontend sin rediseñar la UI existente.
- Se creó `src/client/main.ts` como entrypoint TypeScript mínimo para futuras extracciones desde `ui.html`.
- Se separó la configuración TypeScript del frontend en `tsconfig.client.json`, dejando `src/client` fuera del build backend.
- Se agregó `vite.config.ts` para construir el sitio estático en `_site/` y conservar archivos públicos como `config.public.js`, `.nojekyll` y `CNAME`.
- Se actualizaron scripts NPM: `dev:web`, `build:web`, `preview`, `preview:static` y `typecheck:web`.
- Se actualizó GitHub Pages para ejecutar `npm ci` y `npm run build:web` antes de publicar.
- Se mantuvo `ui.html` y `style.css` como fuente visual actual; la extracción por módulos queda para fases posteriores.
- Se actualizó Graphify local después del cambio estructural y se regeneraron etiquetas/wiki locales.

### Archivos modificados
- `.github/workflows/pages.yml`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `tsconfig.client.json`
- `vite.config.ts`
- `src/client/main.ts`
- `ui.html`
- `README.md`
- `SETUP.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Validación
- `npm run build:web`
- `npm run prepublish:check`
- `graphify update .`

### Fuente / certeza
- Confirmado por código actual
- Basado en solicitud directa del usuario para iniciar Fase 1
- Pendiente de extracción real de módulos desde `ui.html`

---

## [2026-05-13] - Wizard de creación alineado al Figma actual

### Cambios
- Se tomó como fuente visual activa el Figma `DnD Character Engine`, sección `Creación de personaje` (`2196:11249`).
- Se reestructuró el encabezado del wizard para usar el patrón Figma: `Atrás`, eyebrow `Nuevo personaje`, título de pantalla centrado y botón mini `Siguiente` con estado disabled/enabled.
- Se reemplazó la barra previa por diez segmentos de progreso con colores Figma (`#720000`, `#a26f6f`, `#c7c7c7`).
- Se aplicó el look parchment del Figma a formularios, cards de selección/review, equipamiento, conjuros, habilidades, atributos y puntos de golpe usando `page bg` y `dnd_card_bg`.
- Se ajustó el flujo visual para que `Equipamiento` ocurra antes de habilidades/conjuros y `Atributos del personaje` quede en la fase tardía antes de puntos de golpe.
- Se actualizó la sección de atributos recomendados con card 3x2 y CTA regular `Aplicar puntos recomendados`.
- Se normalizaron los inputs del wizard con `input-control` y el botón del header con `primary-btn-mini`.

### Archivos modificados
- `ui.html`
- `style.css`
- `CHANGELOG.md`
- `HANDOFF.md`
- `docs/requirements.md`

### Historias de usuario relacionadas
- US-112: Figma-Matched Character Creation Flow & Ability Score Preview
- US-113: Figma Visual Language for Mobile Character Creation
- US-115: Wizard Navigation State and External Styling
- US-122: Figma-Matched Creation Equipment and Inventory Detail
- US-135: Hardcore Race Ordering and Late Attribute Allocation
- US-146: New Style Template UI from Figma

### Fuente / certeza
- Confirmado por código actual
- Confirmado por Figma `DnD Character Engine` node `2196:11249`
- Basado en solicitud directa del usuario
- Pendiente de validación visual fina en navegador contra Figma

---

## [2026-05-13] - Limpieza de átomos de UI y caret

### Cambios
- Se reemplazó el contrato anterior `figma-btn*` / `figma-input*` por clases canónicas simples: `primary-btn`, `primary-btn-mini`, `secondary-btn`, `secondary-btn-mini`, `ghost-btn`, `ghost-btn-mini`, `input` e `input-control`.
- Se separó el caret de colapsar/desplegar como acción propia: `caret-btn` con hitbox de `24x24px` y vector interno `12x6px`, sin heredar estilos de botón mini.
- Se corrigió el buscador de Mochila para usar la variante de input con ícono, evitando renderizar un input visual dentro de otro input visual.
- Se actualizó la normalización global de controles para aplicar los átomos canónicos a botones, inputs, selects y textareas renderizados dinámicamente, sin reinyectar clases `figma-btn`.
- Se limpiaron botones visibles de inventario, personaje, auth y roster para usar clases atómicas simples en vez de mezclar nombres de acción con variantes visuales.

### Archivos modificados
- `ui.html`
- `style.css`
- `CHANGELOG.md`
- `HANDOFF.md`
- `.claude.md`
- `docs/requirements.md`
- `docs/tasks.md`
- `docs/behavioral_design.md`

### Historias de usuario relacionadas
- US-146: New Style Template UI from Figma

### Fuente / certeza
- Confirmado por código actual
- Basado en feedback directo del usuario
- Pendiente de validación visual fina contra Figma

---

## [2026-05-13] - Vista de prueba local sin login

### Cambios
- Se agregó `preview.html` como entrada separada para abrir `ui.html?preview=1` sin reemplazar la app deployada.
- Se creó `PREVIEW_MODE`, activado por query param `?preview=1`, `window.DND_PREVIEW_MODE` o `DND_PUBLIC_CONFIG.PREVIEW_MODE`.
- El preview usa un perfil local falso, datos demo en memoria, inventario, conjuros, habilidades, PG y catálogo mínimo sin llamar a la API real ni requerir login.
- Se agregó `npm run preview` para levantar un servidor estático local en el puerto 5500 y revisar cambios antes de hacer `git push`.
- El indicador de conexión muestra `Preview local` cuando el modo de prueba está activo.

### Archivos modificados
- `ui.html`
- `preview.html`
- `package.json`
- `README.md`
- `SETUP.md`
- `CHANGELOG.md`
- `HANDOFF.md`
- `docs/requirements.md`
- `docs/tasks.md`
- `docs/behavioral_design.md`
- `.claude.md`

### Historias de usuario relacionadas
- US-147: Vista de prueba local sin login

### Fuente / certeza
- Confirmado por código actual
- Basado en solicitud directa del usuario
- Pendiente de validación visual en navegador local

---

## [2026-05-12] - Átomos reutilizables para botones e inputs

### Cambios
- Se formalizaron átomos reutilizables de botones e inputs para evitar estilos sueltos entre controles.
- Se agregaron variantes canónicas de botón: `primary-btn`, `primary-btn-mini`, `secondary-btn`, `secondary-btn-mini`, `ghost-btn` y `ghost-btn-mini`.
- Se agregaron variantes/base de input: `input`, `input-icon` e `input-control`.
- Se aplicaron los átomos a acciones clave: `Agregar nuevo personaje`, `Tirar dado`, `Agregar objeto`, `Agregar experiencia`, `Ajustar puntos de golpe`, buscador de mochila, acciones de inventario y guardado de equipamiento.
- El CTA `Agregar objeto` del header de inventario quedó como botón mini, no regular.
- Se agregó una normalización global en UI para aplicar automáticamente los átomos canónicos a botones, inputs, selects y textareas ya existentes o renderizados por JS, usando solo los tamaños `regular` y `mini` para botones.

### Archivos modificados
- `ui.html`
- `style.css`
- `CHANGELOG.md`
- `HANDOFF.md`
- `.claude.md`
- `docs/requirements.md`
- `docs/tasks.md`
- `docs/behavioral_design.md`

### Historias de usuario relacionadas
- US-146: New Style Template UI from Figma

### Fuente / certeza
- Confirmado por código actual
- Basado en feedback del usuario
- Pendiente de validación visual en navegador contra Figma/Prototipo

---

## [2026-05-12] - Homologación visual de Mochila

### Cambios
- Se alineó la pantalla `Mochila` del inventario al Look & Feel del template Figma: tabs parchment, card de carga/monedas, buscador, cards de objetos y gaps de 16px.
- El header de personaje ahora cambia el CTA derecho a `Agregar objeto` cuando el usuario está en el tab `Inventario`; en los demás tabs conserva `Tirar dado`.
- Se eliminó el encabezado redundante interno de `Mochila`; la acción de agregar objeto vive en el header superior.
- El subtab inicial de `Inventario` ahora es `Mochila`, para coincidir con la pantalla de referencia.
- Se agregó buscador visual `Buscar objeto` + botón `Buscar` dentro de Mochila.
- La card de carga/monedas se rediseñó como módulo parchment con barra de carga roja, divisor vertical y columnas PO/PP/PC.
- Las cards de objetos se ajustaron con strips, cantidad, título serif, subtítulo italic, badge de estado en header y acciones inline en estado expandido.
- La munición ahora muestra subtipo contextual (`Municion para arco`, `Municion para ballesta`, etc.) cuando el catálogo trae `properties.weapon_type`.

### Archivos modificados
- `ui.html`
- `style.css`
- `CHANGELOG.md`
- `HANDOFF.md`
- `docs/requirements.md`
- `docs/tasks.md`
- `docs/behavioral_design.md`

### Historias de usuario relacionadas
- US-127: Rich Item, Spell and Cantrip Descriptions
- US-146: New Style Template UI from Figma

### Fuente / certeza
- Confirmado por código actual
- Basado en captura/spec `--module-inventory` y `--dndCharacterEngine-character-backpack` compartidos por el usuario
- Pendiente de validación visual en navegador contra Figma/Prototipo

---

## [2026-05-12] - Cards de inventario colapsadas por defecto

### Cambios
- Las cards de objetos del inventario ahora se renderizan colapsadas por defecto para permitir escanear más items en `Equipo`, `Mochila` y `Alijo`.
- El botón de colapsar/expandir ahora inicia con caret hacia abajo, `aria-expanded="false"` y etiqueta accesible `Expandir objeto`.
- Al expandir o colapsar una card, el botón actualiza texto, estado accesible y etiqueta (`Expandir objeto` / `Colapsar objeto`).
- Tocar la card sigue abriendo el modal `Descripción`; el caret controla solo el contenido inline de la card.

### Archivos modificados
- `ui.html`
- `CHANGELOG.md`
- `HANDOFF.md`
- `docs/requirements.md`
- `docs/tasks.md`
- `docs/behavioral_design.md`

### Historias de usuario relacionadas
- US-127: Rich Item, Spell and Cantrip Descriptions
- US-146: New Style Template UI from Figma

### Fuente / certeza
- Confirmado por código actual
- Basado en feedback del usuario
- Pendiente de validación visual en navegador contra Figma/Prototipo

---

## [2026-05-12] - Visibilidad de biografía y padding de navbar

### Cambios
- Se corrigió la navegación de la hoja de personaje para que la card `Biografía` solo se muestre en el tab `Personaje`.
- Al cambiar a `Inventario`, `Habilidades`, `Conjuros` o `Diario`, la biografía queda oculta junto con la ficha principal.
- Se ajustó la navegación inferior a `16px` de padding horizontal en la navbar principal y en la navbar interna de personaje.
- Se corrigió la grilla interna de la navbar de personaje: dejó de usar columnas fijas que sumaban `390px` y ahora usa columnas flexibles dentro del ancho útil, respetando realmente el padding lateral.

### Archivos modificados
- `ui.html`
- `style.css`
- `CHANGELOG.md`
- `HANDOFF.md`
- `docs/requirements.md`
- `docs/tasks.md`
- `docs/behavioral_design.md`

### Historias de usuario relacionadas
- US-117: Figma-Matched Character Detail Microflow and Bottom Navigation
- US-146: New Style Template UI from Figma

### Fuente / certeza
- Confirmado por código actual
- Basado en feedback visual del usuario
- Pendiente de validación visual en navegador contra Figma/Prototipo

---

## [2026-05-12] - Arquitectura `--module-item-header` en modal de objeto

### Cambios
- Se reestructuró el encabezado del modal `Descripción` para seguir la anatomía Figma `--module-item-header`.
- El header del objeto ahora usa arte a la izquierda y `item summary` a la derecha.
- Dentro de `item summary`, `main information` agrupa título/categoría y precio; debajo se renderizan divider rojo y regla destacada (`Ventaja` / `Atributo`).
- Se evitaron columnas flotantes para precio/regla, manteniendo wrapping libre para nombres, rarezas y ventajas largas.

### Archivos modificados
- `ui.html`
- `style.css`
- `CHANGELOG.md`
- `HANDOFF.md`
- `docs/requirements.md`
- `docs/tasks.md`
- `docs/behavioral_design.md`

### Historias de usuario relacionadas
- US-127: Rich Item, Spell and Cantrip Descriptions
- US-146: New Style Template UI from Figma

### Fuente / certeza
- Confirmado por código actual
- Basado en captura Figma `--module-item-header` compartida por el usuario
- Pendiente de validación visual en navegador contra Figma/Prototipo

---

## [2026-05-12] - Modal de descripción de objeto multilínea

### Cambios
- Se ajustó el modal `Descripción` de inventario para replicar la referencia visual: overlay, hoja con esquinas superiores redondeadas, título grande, botón de cerrar mini, header de objeto, precio, regla destacada y card interna de descripción.
- La regla destacada ahora usa etiqueta fija (`Ventaja` o `Atributo`) y valor completo con wrapping libre; ya no se trunca con `nowrap`, `overflow:hidden` ni `text-overflow`.
- Se agregó extracción de regla destacada desde `properties.advantage`, `properties.ventaja`, `properties.immunity`, `properties.description`, `properties.effect` o `description`.
- La rareza del modal ahora se lee desde `properties.rarity` además de campos directos, para objetos mágicos seeded como `magic_item`.
- La descripción interna se renderiza como card parchment independiente con top/bottom strips.

### Archivos modificados
- `ui.html`
- `style.css`
- `CHANGELOG.md`
- `HANDOFF.md`
- `docs/requirements.md`
- `docs/tasks.md`
- `docs/behavioral_design.md`

### Historias de usuario relacionadas
- US-127: Rich Item, Spell and Cantrip Descriptions
- US-146: New Style Template UI from Figma

### Fuente / certeza
- Confirmado por código actual
- Basado en captura de referencia compartida por el usuario
- Validado con parse de JS inline, balance de CSS y `npm run typecheck`
- Pendiente de validación visual en navegador contra Figma/Prototipo

---

## [2026-05-12] - Réplica de pantalla de personaje abierto

### Cambios
- Se ajustó el header de personaje abierto para replicar la referencia: `Atrás`, título centrado con eyebrow `Personaje`, nombre del personaje debajo y botón mini `Tirar dado`.
- Se separó `Biografía` de la card principal para renderizarla como una card independiente con top/bottom strips, igual que la pantalla de referencia.
- Se cambió el render de biografía a estructura de introducción + bullets con etiquetas rojas (`Ideal`, `Vínculo`, `Defecto`).
- Se agregó una capa CSS final específica para `body.character-detail-mode` que fuerza la arquitectura visual de la captura: card principal de 358px, padding, separadores rojos, XP, métricas, penalización, imagen, atributos, magia, PG y navegación inferior.
- Se ajustó el CTA de PG a botón regular Figma y los botones del header a tamaños mini.

### Archivos modificados
- `ui.html`
- `style.css`
- `CHANGELOG.md`
- `HANDOFF.md`
- `docs/requirements.md`
- `docs/tasks.md`
- `docs/behavioral_design.md`

### Historias de usuario relacionadas
- US-117: Figma-Matched Character Detail Microflow and Bottom Navigation
- US-125: Figma-Matched Hit Point Summary and Adjustment Modals
- US-146: New Style Template UI from Figma

### Fuente / certeza
- Confirmado por código actual
- Basado en captura de referencia compartida por el usuario
- Validado con parse de JS inline, balance de CSS y `npm run typecheck`
- Pendiente de validación visual en navegador contra Figma/Prototipo

---

## [2026-05-11] - Refinamiento de tokens desde Figma specs

### Cambios
- Se tomó la page `specs` de Figma como fuente de anatomía/tokens y la page `Prototipo` como fuente de composición de pantallas y reglas de uso.
- Se ajustaron tokens New Style: botón mini a `24px`, botón regular a `44px` y botón de cierre de modal a `32px`.
- Se alineó `.character-card-stats` con el componente Figma `--module-xp`: gap interno `8px`, padding superior `16px`, badge `Lvl` de `32x32`, tipografía XP `Source Serif Pro` 12px y barra de progreso de `4px`.
- Se corrigieron tipografías de la hoja abierta: valores de métricas y modificadores en `Source Serif Pro`, etiquetas de atributos en `Source Sans 3` 14px y valores rojos `#720000`.
- Se normalizaron acciones mini dentro de cards de inventario (`Eliminar`, `Vender`, `Equipar` / `Usar`) a altura `24px`, radio `4px`, fuente `Source Serif Pro` 10px y padding horizontal de `8px`.
- Se agregó el icono contextual de información al estado de penalización en sigilo, siguiendo el patrón visual del spec.

### Archivos modificados
- `style.css`
- `docs/requirements.md`
- `docs/tasks.md`
- `docs/behavioral_design.md`
- `HANDOFF.md`
- `CHANGELOG.md`

### Historias de usuario relacionadas
- US-146: New Style Template UI from Figma

### Fuente / certeza
- Confirmado por código actual
- Confirmado por Figma page `specs`
- Basado en aclaración del usuario sobre pages `specs` y `Prototipo`
- Pendiente de validación visual en navegador contra Figma

---

## [2026-05-11] - Ajuste Figma de card de personaje en roster

### Cambios
- Se reordenó la card de personaje creado para seguir la arquitectura indicada por Figma: nombre, raza/clase, divider rojo, métricas rápidas y biografía.
- Se reemplazaron las acciones siempre visibles/hover por un botón táctil de tres puntos verticales que despliega `Editar` y `Eliminar`.
- Se aplicó el divider rojo tokenizado (`outline 4px`, `outline-offset -2px`) dentro de la card de personaje.
- Se ajustó la tipografía del roster card al spec refinado: título `Source Serif Pro` 20px regular, raza/clase 10px italic, atributos `Source Sans 3` 14px regular y descripción `Source Sans Pro` 14px regular.
- Se ajustó el header interno de la card: separador `•` en `Source Serif Pro` 10px regular color `#110000` y menú de dots en caja `24x24` con vector visual `3x18` color `#720000`.
- Se alineó el `header_app` de Home al spec: contenedor horizontal de 358px, gap 32px, usuario `Source Serif Pro` 16px regular `#720000`, email `Source Sans Pro` 14px italic `#000000`, e icono logout `24x24` en `#720000`.
- Se corrigió una regla móvil posterior que sobrescribía el `header_app` y devolvía el título a `Prata 24px`; el logout ahora es un SVG inline sin pseudo-elemento, fondo ni contenedor circular.
- El divider de la card de personaje ahora usa degradado y taper visual para estrecharse/desvanecerse hacia la derecha.
- Se escapó el texto dinámico de nombre, raza, clase y biografía en el render del roster para evitar que datos del personaje rompan el HTML.

### Archivos modificados
- `ui.html`
- `style.css`
- `docs/requirements.md`
- `docs/tasks.md`
- `HANDOFF.md`
- `CHANGELOG.md`

### Historias de usuario relacionadas
- US-119: Figma-Matched Created Character Card
- US-146: New Style Template UI from Figma

### Fuente / certeza
- Confirmado por código actual
- Basado en captura/referencia Figma compartida por el usuario
- Confirmado por validación de JS inline y balance de CSS
- Pendiente de validación visual en navegador contra Figma

---

## [2026-05-11] - Primera alineación Figma de hoja de personaje abierto

### Cambios
- Se reestructuró la card principal de personaje abierto para usar secciones internas en vez de cards anidadas: métricas superiores, XP, imagen/atributos, magia y puntos de golpe.
- Se aplicaron dividers rojos degradados entre XP, perfil/atributos, magia y puntos de golpe.
- Se corrigió la cascada CSS para que los dividers de la hoja ganen sobre `.figma-red-divider` global y sean visibles en la ficha.
- Se forzó el orden visual de atributos de la hoja como Figma: `FUE`, `DES`, `CON` / `INT`, `SAB`, `CAR`.
- Se corrigieron las etiquetas de atributos para que la hoja muestre abreviaturas (`FUE`, `DES`, `CON`, `INT`, `SAB`, `CAR`) en lugar de nombres completos.
- El botón `Agregar experiencia` se separó de las clases genéricas `btn`, `btn-accent` y `btn-full`, y quedó como botón mini propio de 24px alto, `Source Serif Pro` 10px regular, padding horizontal de 8px, fill `#720000`, texto `#FFFFFF`, sin borde y radius `4px`.
- Se ajustó el padding interno de la card de personaje abierto a 16px laterales y 32px arriba/abajo, con 16px de separación vertical alrededor de los dividers.
- Se cambió el orden del bloque superior de la hoja: XP primero, luego `CA`, `Velocidad`, `B. Competencia`, después la penalización en sigilo y finalmente el divider.
- Se agrupó XP, métricas superiores y penalización opcional en el contenedor `.character-card-stats`, replicando el frame Figma `character card stats` para controlar sus espaciados internos sin depender del gap global de la card.
- La fila superior muestra `CA`, `Velocidad` y `B. Competencia` con columnas separadas por líneas verticales internas.
- El estado de penalización en sigilo se movió a una línea contextual entre las métricas superiores y XP, con copy `La armadura equipada causará penalización en tiradas de sigilo` cuando el personaje tiene armadura con `stealth_disadvantage`.
- El bloque XP ahora queda en una fila con badge de nivel, barra/progreso y botón `Agregar experiencia` a la derecha.
- La imagen del personaje usa un botón circular pequeño de cámara en la esquina inferior izquierda.
- Los atributos se muestran como una grilla 3x2 con separadores verticales y horizontales internos.
- La sección de magia queda en 3 columnas sin título adicional, igualando la arquitectura de la card de Figma.
- La sección de puntos de golpe conserva PG actuales, PG temporales, nota de máximos, nota de temporales y CTA de ajuste.
- La métrica `Velocidad` en la ficha abierta muestra solo el número, sin `pies`, para coincidir con el componente de Figma.

### Archivos modificados
- `ui.html`
- `style.css`
- `docs/requirements.md`
- `docs/tasks.md`
- `docs/behavioral_design.md`
- `HANDOFF.md`
- `CHANGELOG.md`

### Historias de usuario relacionadas
- US-117: Figma-Matched Character Detail Microflow and Bottom Navigation
- US-125: Figma-Matched Hit Point Summary and Adjustment Modals
- US-139: Full Item-Stat Hydration via Engine
- US-146: New Style Template UI from Figma

### Fuente / certeza
- Confirmado por código actual
- Basado en captura Figma compartida por el usuario con estados sin penalización y con penalización en sigilo
- Confirmado por validación de JS inline y balance de CSS
- Pendiente de validación visual en navegador contra Figma

---

## [2026-05-09] - New Style UI desde Figma pantallas template

### Cambios
- Se inició la migración visual del UI móvil al Figma `New-style`, sección `pantallas template`.
- Se tokenizó la capa New Style con variables CSS `--figma-*` para colores, tipografías, tamaños de fuente, espaciados, anchos/altos, radios, sombras y assets de fondo.
- La pantalla Home/Personajes ahora usa fondo de pergamino, encabezado rojo, orden de navegación inferior del template, cards de personaje tipo parchment y CTA rojo de agregar personaje.
- La ficha de personaje abierto se reestructuró para mostrar CA, Velocidad y B. Competencia, bloque de nivel/XP, imagen del personaje, atributos, estadísticas mágicas y PG con el layout base del template.
- La navegación del personaje abierto se alineó al flujo inferior de Figma: Personaje, Inventario, Habilidades, Conjuros y Diario.
- Inventario recibió estilos de template para tabs Equipo/Mochila/Alijo, card de Carga/monedas, slots vacíos punteados y cards de objetos en parchment.
- Las cards de inventario ahora siguen la guía anotada: cantidad como pill, nombre/tipo, control colapsable, atributos/daños separados por comas, precio/peso, descripción y acciones.
- El CTA de la card cambia por tipo de objeto: consumibles muestran `Usar`, equipables muestran `Equipar`/`Desequipar`; también se agregaron acciones `Eliminar` y `Vender` visuales.
- Las tarjetas de inventario ahora abren el modal `Descripción` al tocarlas, respetando la arquitectura de Figma: título, botón cerrar mini, bloque principal de item, regla destacada y cuerpo de descripción. Se retiró el bloque intermedio de metadata.
- Se inició la homologación de botones con clases/tokens de base para mini, regular, primary, secondary y ghost.
- Se reutilizaron los assets locales `src/images/page bg.png`, `src/images/ficha bg.png` y `src/images/dnd_card_bg.png`.

### Archivos modificados
- `ui.html`
- `style.css`
- `docs/requirements.md`
- `docs/tasks.md`
- `docs/behavioral_design.md`
- `HANDOFF.md`
- `CHANGELOG.md`

### Historias de usuario relacionadas
- US-117: Apertura de personaje y ficha principal
- US-119: Figma-Matched Created Character Card
- US-120: Figma-Matched Add Character CTA
- US-137: Figma Inventory Section
- US-138: Mochila Carry and Currency Summary
- US-145: Visual Identity for Inventory Items
- US-146: New Style Template UI from Figma

### Fuente / certeza
- Confirmado por código actual
- Confirmado por Figma `New-style` node `2086:824`
- Confirmado por validación `node --check` del JS inline
- Confirmado por `npx tsc --noEmit`
- Pendiente de validación visual en navegador contra Figma

---

## [2026-05-09] - Game-icons como fallback visual por rareza (US-145)

### Cambios
- Se integró Game-icons vía Iconify como fallback visual dirigido para ítems sin imagen local exacta.
- Se agregó mapeo por categoría/subtipo (`GAME_ICON_BY_KIND`) para armas, armaduras, municiones, pociones, objetos mágicos, herramientas, instrumentos, bolsas, libros, pergaminos y equipo.
- Las imágenes locales siguen teniendo prioridad; Game-icons cubre los huecos del catálogo sin requerir assets manuales para cada ítem.
- Se agregó `ITEM_RARITY_THEME` para colorear iconos y fondos por rareza:
  - Común: gris
  - Poco común: verde
  - Raro: azul
  - Muy raro: morado
  - Legendario: dorado
  - Artefacto: rojo/rosa
- Se añadió atribución en `README.md` por la licencia CC BY 3.0 de Game-icons.

### Archivos modificados
- `ui.html`
- `style.css`
- `README.md`

### Historias de usuario relacionadas
- US-145: Identidad visual de ítems con fallback de librería y código de color por rareza

### Fuente / certeza
- Confirmado por código actual
- Confirmado por validación de sintaxis del JS inline con `node --check`
- Pendiente de validación visual en navegador y conexión externa a Iconify en producción

---

## [2026-05-09] - Fix seed Prisma Client desactualizado

### Cambios
- `npm run db:seed` ahora ejecuta `prisma generate` antes de correr `ts-node prisma/seed.ts`.
- `npm run db:reset` reutiliza `npm run db:seed` para evitar que el seed use un Prisma Client viejo cuando cambia `schema.prisma`.
- Esto corrige el error local donde el seed rechazaba `Item.description` y `Item.source` aunque el schema/migración ya los tuviera.

### Archivos modificados
- `package.json`

### Historias de usuario relacionadas
- US-127: Catálogo de ítems con descripciones y fuente

### Fuente / certeza
- Confirmado por código actual
- Confirmado: `prisma generate` elimina el error de cliente desactualizado
- Pendiente de validación en entorno del usuario: correr `npm run db:seed` con acceso real a Supabase

---

## [2026-05-09] - Imágenes locales progresivas para ítems de inventario (US-145 parcial)

### Cambios
- US-145 retomada sin volver al sistema SVG genérico: se agregó un mapping de imágenes locales desde `src/images/items`.
- `ui.html` ahora asigna imagen exacta a ítems SRD con asset disponible (por ejemplo Leather Armor, Chain Mail, Shield, Longsword, Scimitar, Dagger, Potion of Healing, Backpack, Pouch, etc.).
- Se agregó fallback por subtipo para armas y objetos mágicos homebrew (`weapon_subtype`), usando variantes visuales disponibles para espadas, dagas, picas, martillos, cimitarras, estoques, tridentes, ballestas, arcos y otros.
- Las tarjetas de inventario, catálogo de agregar objeto y pantalla de cantidad muestran imagen cuando existe asset local; si no existe, la card conserva el layout textual sin romperse.
- `style.css` agrega `.item-art` para contener imágenes con proporción estable y estilo acorde a la plataforma.

### Archivos modificados
- `ui.html`
- `style.css`
- `docs/requirements.md`
- `docs/behavioral_design.md`
- `docs/tasks.md`

### Historias de usuario relacionadas
- US-145: En progreso / implementación parcial con imágenes locales

### Fuente / certeza
- Confirmado por código actual
- Confirmado por validación de sintaxis del JS inline con `node --check`
- Pendiente de validación visual en navegador

---

## [2026-05-09] - Rollback íconos SVG + regeneración XLS catálogo (US-145 revertido)

### Cambios
- **ROLLBACK US-145**: Se eliminaron los 34 símbolos SVG del sprite inline de `ui.html` por decisión del usuario (preferencia por imágenes únicas en lugar de íconos vectoriales genéricos).
- Eliminadas las funciones JS: `getItemIconId`, `getItemIconStyle`, `itemIconHtml`.
- Eliminadas las llamadas `itemIconHtml(item, n)` en `renderInventoryItemCard`, `renderInventoryCatalogCard` y `openInventoryQuantityScreen`.
- Eliminado el bloque CSS `.item-icon-wrap` de `style.css`.
- **XLS regenerado** — `Catálogo Completo DnD.xlsx` actualizado con 855 ítems (287 SRD + 568 homebrew), 4 hojas: Resumen, Catálogo Completo, SRD 5.1, Homebrew.
- Documentación de continuidad alineada: `behavioral_design.md` marca US-145 como pendiente/revertida, `tasks.md` registra T-073/T-074 y `requirements.md` agrega US-144/US-145 para cerrar la trazabilidad.

### Archivos modificados
- `ui.html` — rollback completo de íconos SVG (23 139 chars eliminados); sintaxis JS verificada limpia
- `style.css` — bloque `.item-icon-wrap` eliminado
- `Catálogo Completo DnD.xlsx` — regenerado con código de colores por rareza y fuente
- `docs/behavioral_design.md` — US-145 marcada como pendiente/revertida y XLS regenerado registrado en historial
- `docs/tasks.md` — T-071 actualizada; T-073 rollback y T-074 rediseño visual añadidas
- `docs/requirements.md` — US-144 y US-145 agregadas para continuidad

### Historias de usuario relacionadas
- US-145: revertida a ❌ Pendiente (rediseño pendiente con imágenes únicas por ítem)
- US-127: XLS de catálogo regenerado como fuente de QA
- US-144: registrada retroactivamente en `requirements.md` para cerrar el hueco documental

### Fuente / certeza
- Confirmado: `node --check` 0 errores tras rollback
- Confirmado por documentación actualizada: `CHANGELOG.md`, `HANDOFF.md`, `docs/behavioral_design.md`, `docs/tasks.md`, `docs/requirements.md`
- Pendiente: definir approach de imágenes únicas (US-145 requiere nueva spec)

---

## [2026-05-09] - Íconos SVG para todos los ítems del inventario (US-145)

### Cambios
- 34 símbolos SVG nuevos añadidos al sprite inline de `ui.html` con el prefijo `icon-item-*`.
- `getItemIconId(item)` — mapea `item_type` + patrones de nombre al id de símbolo correcto (espada, daga, hacha, martillo, lanza, arco, ballesta, armadura ligera/media/pesada, poción, pergamino, orbe, herramienta, etc.).
- `getItemIconStyle(item)` — devuelve `{ color, bg }` según rareza: gris (común), verde (poco común), azul (raro), morado (muy raro), naranja (legendario), rojo (artefacto). Ítems SRD usan color temático marrón.
- `itemIconHtml(item, size)` — helper unificado que genera `<div class="item-icon-wrap">` con el SVG correspondiente.
- `renderInventoryItemCard` y `renderInventoryCatalogCard` actualizados con ícono.
- `openInventoryQuantityScreen` muestra ícono + descripción del ítem antes de confirmar.
- `itemDescription()` ahora prioriza `item.description` (campo BD) sobre las descripciones generadas en código.
- CSS `.item-icon-wrap` añadido a `style.css`.

### Archivos modificados
- `ui.html` — 34 símbolos SVG, 3 funciones JS, 2 render functions actualizadas, openInventoryQuantityScreen mejorada
- `style.css` — `.item-icon-wrap` y reglas de layout

### Historias de usuario relacionadas
- US-145: Íconos visuales para todos los ítems del catálogo

### Fuente / certeza
- Confirmado: JS syntax check 0 errores
- Pendiente: validar visualmente en navegador que los íconos aparecen en mochila, catálogo y pantalla de cantidad

---

## [2026-05-09] - Catálogo de ítems completo: descripciones SRD + 568 ítems homebrew (US-127)

### Cambios
- Agregados campos `description String?` y `source String @default("srd")` al modelo `Item` en `prisma/schema.prisma`.
- Creada migración `20260509120000_add_item_description_source` con `ALTER TABLE "Item" ADD COLUMN`.
- Los 287 ítems SRD existentes (armaduras, armas, equipo, herramientas, objetos mágicos, etc.) recibieron descripciones de sabor en español con tono DnD clásico.
- Integrados 568 ítems homebrew extraídos de 4 PDFs del proyecto: 40 Magic Items (64 ítems), Infernal Machine Rebuild (95), Homebrew del Gremio (254), Todas las Armas (155).
- Todos los ítems homebrew incluyen rareza, requiere sintonía, tipo de ítem y descripción en inglés del PDF fuente.
- Catálogo total: **855 ítems** (287 SRD + 568 homebrew).
- Generado `Catálogo Completo DnD.xlsx` con 4 hojas: Resumen, Catálogo SRD, Homebrew, Objetos Mágicos.

### Archivos modificados
- `prisma/schema.prisma` — campos `description` y `source` en model Item
- `prisma/migrations/20260509120000_add_item_description_source/migration.sql` — migración nueva
- `prisma/seeds/item.ts` — 287 SRD items con description+source, 568 homebrew items añadidos
- `Catálogo Completo DnD.xlsx` — XLS actualizado con catálogo completo
- `docs/behavioral_design.md` — US-127 marcada ✅ Implementado

### Historias de usuario relacionadas
- US-127: Descripciones ricas de ítems

### Fuente / certeza
- Confirmado por scripts de extracción de PDFs: magic40.txt, infernal.txt, gremio.txt, todasarmas.txt
- Confirmado por gen_seed_descriptions.py: 238 descripciones SRD escritas
- Pendiente de validar: ejecutar migración en producción + re-seed + confirmar que la UI muestra descriptions en modal de ítem

---

## [2026-05-05] - Fix dados 3D: contexto WebGL perdido y condición de carrera (US-143)

### Cambios
- **Condición de carrera corregida**: `restoreResults()` ahora comprueba `diceFlow.rolling` y sale inmediatamente si hay una animación activa. Antes, el `setTimeout(..., 0)` disparaba `showResult()` justo mientras `rollInElement()` animaba el dado, destruyendo el renderer en medio de la animación (dado que desaparecía al pulsar "Lanzar dado").
- **Context Lost corregido**: `_disposeCtx` ahora elimina el canvas del DOM antes de llamar `forceContextLoss()`. `_createCtx` siempre crea un canvas nuevo en lugar de reutilizar el existente. Crear un `WebGLRenderer` sobre un canvas cuyo contexto ya fue descartado generaba el error `THREE.WebGLRenderer: Context Lost`.
- **Error browserCrypto eliminado**: Se retiró el script CDN de `@dice-roller/rpg-dice-roller` porque la librería no funciona en este entorno (accede a `globalThis.crypto.browserCrypto` internamente y falla). El fallback con `Math.random()` cubre el 100% de los casos de uso.
- **Dado 3D visible antes de pulsar "Lanzar dado"**: `showResult()` acepta `value = null` para mostrar el dado girando sin número. `restoreResults()` llama `showResult` siempre al reconstruir el DOM, incluso cuando aún no se ha tirado. Antes se mostraba el template CSS de hexágono en lugar del dado 3D.

### Flujo final estabilizado
1. Panel de dados se abre → `renderDiceFlow()` → `restoreResults()` → dado 3D gira sin número
2. Usuario pulsa "Lanzar dado" → `diceFlow.rolling = true` → `renderDiceFlow()` (sin restoreResults activo) → `rollInElement()` anima spin 1.1 s con renderer fresco
3. Spin termina → `diceFlow.rolling = false` → `renderDiceFlow()` → `restoreResults()` → dado 3D estático con número centrado

### Archivos modificados
- `ui.html` — `restoreResults`, `_disposeCtx`, `_createCtx`, `showResult`, head CDN scripts

### Historias de usuario relacionadas
- US-143: Three.js Inline 3D Dice (correcciones de estabilidad)

### Fuente / certeza
- Confirmado por errores de consola reportados por el usuario (`Context Lost`, `browserCrypto`)
- Confirmado por análisis de condición de carrera en `rollAttackD20` / `restoreResults`
- Pendiente de validación visual en navegador

---

## [2026-05-05] - Dados 3D inline por elemento (US-143 refactor)

### Cambios
- Se eliminó el overlay a pantalla completa (`#dice-3d-overlay`). El dado 3D ahora se renderiza **dentro del elemento `.dice-art`** que ya existe en el flujo de dados.
- Se creó el módulo `dice3D` (IIFE) con mapa de estado por elemento: `_state[elementId] → { renderer, scene, camera, mesh, canvas, idleId }`.
- `showResult(id, sides, value)` — instancia el dado en el elemento dado, inicia idle loop y opcionalmente muestra número si `value !== null`.
- `rollInElement(id, sides, finalValue)` — spin de 1.1 s con deceleración física, luego idle con número centrado.
- `restoreResults()` — llamada por `renderDiceFlow()` tras cada reconstrucción de innerHTML; detecta la pantalla activa y reinstancia todos los dados necesarios (incluyendo los dos dados de historia).
- Idle loop usa `canvas.isConnected` para auto-detenerse si el elemento es eliminado del DOM.
- `renderer.forceContextLoss()` en disposal para evitar fuga de contextos WebGL.
- Estilos CSS nuevos: `.dice-art.has-3d` elimina clip-path/background/border; `canvas.die-canvas` ocupa todo el elemento; `span.visible` overlay con opacidad para número.
- Se añadieron CSS para nuevos tipos de dado: `.d4`, `.d8`, `.d10`, `.d100` (`.d6`, `.d12`, `.d20` ya existían).

### Archivos modificados
- `ui.html` — módulo `dice3D` completo, `animateDiceResult`, `renderDiceFlow`
- `style.css` — `.dice-art.has-3d`, nuevos tipos de dado

### Historias de usuario relacionadas
- US-143: Three.js Inline 3D Dice

### Notas técnicas
- El dado de historia usa dos elementos distintos (`story-die-1`, `story-die-2`), cada uno con su propio renderer; ambos se instancian desde `restoreResults()`.
- Three.js r128 no requiere web workers ni WASM, funciona desde CDN en archivos estáticos.

### Fuente / certeza
- Basado en solicitud directa del usuario ("no quiero overlay, renderiza ahí mismo")
- Pendiente de validación visual en navegador

---

## [2026-05-05] - Integración rpg-dice-roller (US-142) — retirada

### Cambios
- Se integró inicialmente `@dice-roller/rpg-dice-roller@5` (jsDelivr CDN) y se delegó `rollDiceFormula()` a su motor.
- La librería falla en este entorno con `Cannot read properties of undefined (reading 'browserCrypto')` por acceso interno a `globalThis.crypto.browserCrypto`.
- Se retiró el script CDN en la misma sesión. `rollDiceFormula()` usa `Math.random()` como implementación definitiva con el mismo contrato `{ rolls, bonus, total }`.
- `parseDiceFormula()` se mantiene sin cambios para `diceFormulaSides()` y helpers.

## [2026-05-04] - Resolución de historia y localización completa ES

### Cambios
- Se implementó el flujo "Resolución de historia" en el modal de dados, reemplazando el genérico anterior.
- El flujo tiene 4 pantallas exactas al Figma: menú → selector de habilidad → tirada → resultado.
- Pantalla de selector: lista las 18 habilidades con modificador calculado (`+2`, `-1`, etc.); la habilidad seleccionada se resalta; el CTA queda deshabilitado hasta elegir.
- Pantalla de tirada: detecta ventaja/desventaja automáticamente. Sigilo con armadura de desventaja de sigilo → 2 dados, toma el menor. Condiciones activas (asustado, envenenado, restringido) → también 2 dados con desventaja. Caso normal → 1 dado.
- Pantalla de resultado: muestra ambos dados cuando aplica (el dado perdedor se desvanece, el ganador queda nítido). Resultado final = dado ganador + modificador de habilidad.
- Se tradujo `ITEM_NAME_ES` de ~30 entradas parciales a **257 items completos**: armaduras, armas, munición, equipo de aventurero, ropa, herramientas, instrumentos, packs, pociones, focos arcanos/druídicos y objetos mágicos.
- Se tradujo `SPELL_NAME_ES` de ~100 entradas (niveles 0-2) a **todos los niveles 0-9** cubriendo los 410 conjuros del SRD, incluyendo nombres con apóstrofos.
- Se corrigieron 4 puntos de render en la hoja de personaje que mostraban nombres de conjuros en inglés sin pasar por el mapa: card del flujo de dados, header del selector, lista de conjuros conocidos y `<select>` de lanzamiento.
- Los nombres en inglés se mantienen en la base de datos — todos los lookups del backend siguen funcionando sin cambios.

### Archivos modificados
- `ui.html` — nuevas funciones: `openStoryResolutionFlow`, `storySkillAdvantage`, `renderStoryResolutionSkills`, `renderStoryResolutionRoll`, `rollStoryDice`, `selectStorySkill`, `confirmStorySkill`; expansión de `ITEM_NAME_ES` y `SPELL_NAME_ES`; corrección de 4 render sites de conjuros
- `style.css` — estilos de `.story-skill-picker`, `.story-skill-row`, `.story-dual-dice`, `.story-die-winner`, `.story-adv-note`

### Historias de usuario relacionadas
- US-140: Resolución de historia con selección de habilidad y ventaja/desventaja automática (nueva)
- US-141: Localización completa ES de items y conjuros (nueva)

### Notas técnicas
- El dado perdedor en modo desventaja usa `.story-die-winner` para distinguir al ganador; si hay empate ambos quedan nítidos.
- `storySkillAdvantage()` es extensible: actualmente cubre sigilo+armadura y condiciones activas; en el futuro puede absorber ventaja por hechizos o rasgos.
- Sintaxis JS verificada con `node --check`: 0 errores.

### Fuente / certeza
- Basado en PDF Figma "Resolución de historia" proporcionado por el usuario
- Confirmado por `node --check` (0 errores)
- Pendiente de validación visual en navegador

---

## [2026-05-04] - Motor de hidratación completo + CA desde armadura equipada

### Cambios
- Se cableó el endpoint `/hydrated` con el motor `hydrate.ts` vía el nuevo adaptador `buildRawCharacter()` en `character.repository.ts`.
- Antes, `/hydrated` calculaba manualmente solo `unarmored_ac = 10 + DEX_mod` ignorando armadura equipada, armadura pesada con penalización de velocidad y desventaja de sigilo.
- Ahora `/hydrated` pasa los datos reales de Prisma al motor y devuelve todos los valores derivados correctos: CA con armadura/escudo, velocidad con penalización por armadura pesada, peso cargado, encumbrance, penalización de sigilo y PG con `level_1_hp_roll` real.
- Se agregó la card `Carga / Monedas` en la pestaña `Mochila` de Inventario: muestra capacidad de carga con barra de progreso y columnas de monedas (PO / PP / PC) con íconos SVG y colores diferenciados.
- La UI ahora lee `armor_class` (del motor) con fallback a `unarmored_ac`; `speed` muestra el valor final con penalización de armadura pesada en pies.
- Se agregó badge de `Desventaja sigilo` en equipamiento cuando `stealth_disadvantage = true` en algún ítem equipado.

### Archivos modificados
- `src/repositories/character.repository.ts` — nuevo `buildRawCharacter()` que traduce Prisma → `RawCharacter`
- `src/api/controllers/character.controller.ts` — `/hydrated` reescrito, usa `buildRawCharacter` + `hydrate()`
- `src/engine/hydrate.ts` — agrega `level_1_hp_roll` en `RawCharacter`
- `src/services/health.service.ts` — `calculateMaxHP` acepta `level1HpRoll` opcional
- `ui.html` — card Carga/Monedas, lectura de `armor_class`, velocidad en pies, badge sigilo
- `style.css` — `.inventory-carry-card` y estilos de monedas/barra de progreso

### Historias de usuario relacionadas
- US-138: Card Carga/Monedas en Mochila (nueva)
- US-139: Hidratación completa de stats desde ítems equipados (nueva)

### Notas técnicas
- `buildRawCharacter()` es la única fuente de traducción Prisma → motor; no hay lógica de negocio ahí.
- TypeCheck: 0 errores. Tests: 77/77 passing.
- El campo `level_1_hp_roll` requiere la migración `20260430161500_add_level_1_hp_roll` aplicada.

### Fuente / certeza
- Basado en solicitud directa del usuario
- Confirmado por `npm run typecheck` (0 errores) y `npm run test` (77/77)
- Pendiente de validación visual en navegador con personaje que lleve armadura equipada

---

## [2026-05-04] - Sugerencia de atributos e Inventario Figma

### Cambios
- El paso `Atributos del personaje` ahora muestra una sugerencia óptima de Point Buy basada en raza, clase y trasfondo.
- La sugerencia puede aplicarse con un botón y solo modifica valores base, conservando el contrato `base + bono racial` sin duplicar bonos raciales.
- Se integró la arquitectura Figma de `Inventario` dentro del personaje abierto con secciones internas `Equipo`, `Mochila` y `Alijo`.
- `Equipo` muestra slots equipados y estados vacíos para arma primaria, arma secundaria, escudo, armadura, botas, guantes/guanteletes, anillos y amuleto.
- `Mochila` conserva la lista real de inventario y agrega un flujo `Agregar objeto` con buscador, filtros, cards de catálogo y pantalla de cantidad.
- `Alijo` agrupa objetos no equipados/no consumibles mientras queda pendiente un modelo persistente de ubicación o almacenamiento.
- La UI muestra affordances para agregar monedas (`PO`, `PP`, `PC`) sin persistirlas todavía, porque el backend no tiene modelo de monedas.

### Archivos modificados
- `ui.html`
- `style.css`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-136: Ability Score Recommendation Engine
- US-137: Figma-Matched Inventory Section

### Fuente / certeza
- Basado en solicitud directa del usuario
- Confirmado por Figma (`2072:3743`, `2071:1169`, `2071:2299`, `2071:3139`)
- Confirmado por código actual
- Pendiente de validación visual en navegador

## [2026-05-04] - Orden experto de razas y atributos tardíos

### Cambios
- La selección de raza ahora agrupa variantes por familia/raza padre en lugar de depender del orden alfabético del catálogo.
- Los elfos se muestran juntos en orden explícito: `Drow`, `Elfo Alto`, `Elfo del Bosque`.
- La agrupación soporta futuras subrazas tiefling cuando existan en catálogo, pero no inventa subrazas ni reglas que no estén sembradas/validadas.
- El paso `Atributos del personaje` se movió a la fase final del wizard, después de raza, trasfondo, clase y equipamiento, y antes de validar habilidades/conjuros y tirar puntos de golpe.
- Se mantuvo el contrato de Point Buy: la UI muestra `base + bono racial = total final`, pero el payload sigue enviando solo atributos base.

### Archivos modificados
- `ui.html`
- `style.css`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-112: PDF-Matched Character Creation Flow & Ability Score Preview
- US-135: Hardcore Race Ordering and Late Attribute Allocation

### Fuente / certeza
- Basado en feedback directo de usuario avanzado
- Confirmado por código actual
- Pendiente de validación visual en navegador

## [2026-05-04] - Endurecimiento de credenciales de perfiles

### Cambios
- El registro de perfiles ahora genera hashes de contraseña con `scrypt` salteado y pepper de servidor derivado de `AUTH_SECRET`.
- Se conserva verificación de hashes PBKDF2 anteriores para compatibilidad.
- Producción falla al iniciar si `AUTH_SECRET` queda con el valor de desarrollo.
- El token de sesión ya no embebe correo ni datos innecesarios; conserva solo sujeto, emisión y expiración.
- La UI exige mínimo 10 caracteres de contraseña para registro/login.

### Archivos modificados
- `src/api/middleware/auth.ts`
- `src/api/controllers/auth.controller.ts`
- `ui.html`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-132: Player Profiles and Owned Character Roster

### Fuente / certeza
- Basado en solicitud directa del usuario sobre seguridad de correos y contraseñas
- Confirmado por código actual
- Pendiente de validación E2E en backend desplegado

## [2026-05-04] - Competencias de equipo y uso robusto de pociones

### Cambios
- La pestaña `Habilidades` ahora agrega una tercera subvista `Competencias` para mostrar armas, armaduras, escudos, herramientas y objetos competentes.
- Las competencias de equipo se derivan de clase, multiclase, raza/traits, trasfondo y registros `CharacterTool` cuando existen.
- Se corrigió el flujo de uso de consumibles para que el inventario cargado en la pestaña se conserve en memoria y el botón `Usar` pueda resolver correctamente el objeto.
- El modal de dados de consumibles ya no se cierra si la aplicación del efecto falla, permitiendo reintentar.
- El backend acepta `effect_total` como número coercible para evitar rechazos por formato al usar pociones desde la UI.
- Si una poción se aplica pero falla el refresco posterior del inventario, la UI conserva el resultado de PG y muestra una advertencia no bloqueante.

### Archivos modificados
- `ui.html`
- `style.css`
- `src/api/controllers/inventory.controller.ts`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-118: Character Image Upload and Figma-Matched Detail Subflows
- US-124: Consumable Use and Virtual Dice Modal
- US-131: Weapon Attack Proficiency and Skill Proficiency Visibility

### Fuente / certeza
- Basado en reporte directo del usuario
- Confirmado por código actual
- Pendiente de validación visual en navegador

## [2026-05-01] - Ficha abierta alineada con Figma

### Cambios
- Se verificó el nodo Figma `personaje abierto` (`2001:486`) y se ajustó la ficha para mostrar la fila de métricas del prototipo.
- La fila de resumen ahora muestra `CA`, `Velocidad`, `Nivel` y `B. Comp.` con el bonificador de competencia visible.
- Se retiró `Iniciativa` de esa fila porque no aparece en el bloque Figma de personaje abierto.
- Se ajustó el CTA de experiencia a `Agregar experiencia`, el label mágico a `Car. Mágica` y los atributos a nombres completos en mayúsculas.
- La grilla de tabs del personaje abierto se reforzó para respetar el layout Figma: `Ficha` ocupa dos columnas y las demás tabs se distribuyen en tres columnas.

### Archivos modificados
- `ui.html`
- `style.css`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-117: Figma-Matched Character Detail Microflow and Bottom Navigation
- US-118: Character Image Upload and Figma-Matched Detail Subflows

### Fuente / certeza
- Confirmado por Figma (`2001:486`)
- Confirmado por código actual
- Basado en solicitud directa del usuario
- Pendiente de validación visual en navegador

## [2026-05-01] - Competencia en ataques con arma y habilidades visibles

### Cambios
- El flujo `Tirar Dado` → `Ataque` ahora calcula y muestra el total real del ataque: d20 + modificador relevante + competencia solo si el personaje es competente con el arma.
- La UI determina el modificador de ataque según reglas DnD: Fuerza para cuerpo a cuerpo/arrojadizas, Destreza para armas a distancia y el mejor entre Fuerza/Destreza para armas con Sutileza.
- Las cards de armas equipadas muestran `Ataque +X` y si el personaje es `Competente` o `Sin competencia`.
- La pantalla de comprobación muestra la fórmula y el razonamiento de por qué se suma o no la competencia.
- La pestaña `Habilidades` ahora muestra resumen de competencias y badges por fila: `Competente`, `Experto` o `Sin competencia`, separado de tiradas de salvación.

### Archivos modificados
- `ui.html`
- `style.css`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-77: Skill Proficiency System
- US-128: Figma-Matched Attack Dice Flow
- US-131: Weapon Attack Proficiency and Skill Proficiency Visibility

### Fuente / certeza
- Confirmado por código actual
- Confirmado por documentación (`docs/plan.md`, `docs/requirements.md`)
- Basado en solicitud directa del usuario
- Pendiente de validación visual en navegador

## [2026-05-01] - Corrección de descuento visual de munición en ataques

### Cambios
- Se corrigió la visualización de munición restante para que flechas/virotes muestren la cantidad real después de un ataque, por ejemplo `x20` → `x19`.
- Se eliminó el clamp visual que forzaba munición a mostrarse como mínimo en el tamaño del paquete del catálogo.
- Se agregó una normalización de seguridad al primer disparo para inventarios heredados que aún tenían munición guardada como cantidad de paquete (`x1`/`x2`) en vez de unidades reales.

### Archivos modificados
- `ui.html`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-123: Equipment State and Hand-Occupancy Rules
- US-128: Figma-Matched Attack Dice Flow

### Fuente / certeza
- Basado en reporte directo del usuario
- Confirmado por código actual
- Pendiente de validación visual en navegador

## [2026-05-01] - Animación de dados virtuales

### Cambios
- Se agregó una simulación de tirada con movimiento para los dados virtuales: el número cambia rápidamente mientras el dado gira/rebota y luego se fija en el resultado real.
- La animación se aplica en ataque d20, cálculo de daño de arma, lanzamiento de conjuros/trucos, tiradas personalizadas y consumibles con dados.
- Los botones de tirada quedan deshabilitados durante la animación para evitar dobles lanzamientos.
- Se agregó fallback CSS para `prefers-reduced-motion`.

### Archivos modificados
- `ui.html`
- `style.css`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-124: Consumable Use and Virtual Dice Modal
- US-128: Figma-Matched Attack Dice Flow
- US-129: Figma-Matched Spell Dice Flow
- US-130: Animated Virtual Dice Feedback

### Fuente / certeza
- Basado en solicitud directa del usuario
- Confirmado por código actual
- Pendiente de validación visual en navegador

## [2026-05-01] - Flujos Figma de lanzamiento de dados

### Cambios
- Se reemplazó el comportamiento simple de `Tirar Dado` por una pantalla full-screen `Lanzar Dado` basada en Figma.
- Se agregó el flujo de ataque: selección de arma equipada, comprobación con d20, descuento de munición compatible al atacar, estados de 20 natural / 1 natural, confirmación manual de éxito o fallo, y cálculo de daño con crítico.
- Se agregó el flujo de lanzamiento de conjuro: tabs `Truco` / `Conjuro`, resumen de espacios disponibles, cards de conjuros con atributos, selector de dado derivado del catálogo, consumo de espacio para conjuros de nivel 1+ y resultado con instrucción de salvación contra CD.
- Se mantuvo una tirada genérica para `Resolución de historia`, `Tirada de salvación` y tiradas personalizadas.

### Archivos modificados
- `ui.html`
- `style.css`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-117: Figma-Matched Character Detail Microflow and Bottom Navigation
- US-123: Equipment State and Hand-Occupancy Rules
- US-127: Rules-Rich Item and Spell Descriptions
- US-128: Figma-Matched Attack Dice Flow
- US-129: Figma-Matched Spell Dice Flow

### Fuente / certeza
- Confirmado por Figma (`Lanzar Dado`, `Lanzar Dado Flujo de ataque`, `Lanzamiento de conjuro`)
- Confirmado por código actual
- Basado en solicitud directa del usuario
- Pendiente de validación visual en navegador

## [2026-05-01] - Corrección de equipamiento y curación por consumibles

### Cambios
- Se corrigió la carga del catálogo del wizard para incluir `items` desde el arranque y volver a asegurarlo antes de finalizar la creación del personaje.
- Se agregó una validación antes de crear personaje para evitar crear sin equipamiento cuando las selecciones no pudieron resolverse contra el catálogo.
- Se hizo idempotente el guardado de equipamiento retroactivo en la pestaña Inventario: ahora expande paquetes a sus artículos finales y solo agrega objetos faltantes, evitando incrementar cantidades si el selector reaparece.
- Se endureció el uso de consumibles de curación con dados: el backend exige el total tirado y aplica `PG actuales + total tirado`, respetando el máximo de PG.

### Archivos modificados
- `ui.html`
- `src/api/controllers/inventory.controller.ts`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-122: Figma-Matched Creation Equipment and Inventory Detail
- US-124: Consumable Use and Virtual Dice Modal

### Fuente / certeza
- Confirmado por revisión de código reportada por Claude
- Confirmado por código actual
- Pendiente de validación visual en navegador

## [2026-05-01] - Limpieza de código duplicado en ui.html

### Cambios
- Se eliminaron 425 líneas de código muerto: las definiciones no-activas de `wizardOpen` (×2), `wizardClose` (×2), `wizUpdateDots` (×2), `wizRenderStep` (×2), `wizValidateStep` (×2), `wizardNext` (×2), `wizardPrev` (×2), `wizStep1HTML` (×1), `wizStep4HTML` (×1), `wizSelectRace` (×1), `wizSelectBg` (×1), `wizSelectClass` (×2).
- Cada función del wizard ahora tiene exactamente **una** definición. Sin cambios en comportamiento — JavaScript ya usaba la última definición, ahora el archivo es inequívoco y menos frágil.
- Typecheck del backend: 0 errores.

### Archivos modificados
- `ui.html`
- `CHANGELOG.md`
- `HANDOFF.md`

### Fuente / certeza
- Confirmado por grep (0 duplicados restantes)
- Confirmado por TypeScript (`npm run typecheck` → 0 errores)

## [2026-05-01] - Corrección bug ASI: selección de atributo no se persistía

### Cambios
- Se reescribió `wizPdfAsiHTML` para usar atributo `selected` explícito en las opciones del select (en lugar de depender del orden del primer option), y para **siempre renderizar el div `#wiz-asi-summary-wrap`** en el DOM (antes era condicional y no existía en el primer render, impidiendo la actualización del badge de confirmación).
- Se reescribió `wizAsiType` para **NO llamar `wizRenderStep`** al cambiar el tipo (+2 / +1+1). En su lugar aplica toggle `display:none` en los divs `#asi-one-{i}` y `#asi-two-{i}` directamente, evitando el re-render que podía limpiar la selección de otros cards.
- Se extrajo la lógica compartida de actualizar el resumen a `wizAsiUpdateSummary()`.
- Se eliminó el reseteo erróneo de `wiz.data.spell_selections = []` que ocurría en `wizAsiStat` sin relación con la mejora de atributo.

### Archivos modificados
- `ui.html`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-121: Creación de personajes de nivel alto (ASI)

### Fuente / certeza
- Confirmado por análisis de código (causa raíz: #wiz-asi-summary no existía en DOM al primer render; wizAsiType causaba re-render que podía limpiar estado)
- Pendiente de validación visual en navegador

## [2026-05-01] - Compatibilidad de munición y descripciones robustas

### Cambios
- Se reforzó la regla de equipamiento para que la munición equipada coincida con el arma a distancia activa: arco con flechas, ballesta con virotes, honda con balas y cerbatana con agujas.
- Al equipar un arma a distancia se limpia la munición incompatible y se auto-equipa munición compatible cuando existe.
- Al intentar equipar manualmente munición incompatible con el arma a distancia equipada, el backend rechaza la acción con un mensaje en español.
- La UI normaliza estados heredados para no mostrar como equipada una munición incompatible que ya estuviera guardada antes de esta regla.
- Se enriquecieron las tarjetas de inventario y equipamiento con descripciones derivadas de reglas: tipo de arma, entrenamiento simple/marcial, alcance, daño, propiedades, tipo de armadura, CA, requisitos, peso, valor, consumibles, focos y kits.
- Se enriquecieron tarjetas de trucos y conjuros con escuela, componentes, alcance, tiempo, duración, concentración y efectos mecánicos cuando el catálogo los expone.
- Se limpiaron los tags de atributos para no usar emojis decorativos.

### Archivos modificados
- `ui.html`
- `src/api/controllers/inventory.controller.ts`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-122: Figma-Matched Creation Equipment and Inventory Detail
- US-123: Equipment State and Hand-Occupancy Rules
- US-127: Rules-Rich Item and Spell Descriptions

### Fuente / certeza
- Confirmado por solicitud del usuario
- Confirmado por código actual
- Pendiente de validación visual en navegador

## [2026-05-01] - Normalización de municiones en inventario

### Cambios
- Se corrigió la visualización de municiones con nombre de paquete, por ejemplo `Arrows (20)`, para mostrarlas como `Flechas` y cantidad efectiva `x20`.
- Se agregó normalización de cantidad para municiones al crear personajes, agregar inventario o desglosar paquetes, evitando que el nombre contenga el conteo y la cantidad muestre otro conteo separado.
- La UI ahora mantiene compatibilidad con inventarios existentes mostrando al menos el tamaño del paquete cuando la fila antigua contiene una cantidad menor.

### Archivos modificados
- `ui.html`
- `src/api/controllers/character.controller.ts`
- `src/api/controllers/inventory.controller.ts`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-122: Figma-Matched Creation Equipment and Inventory Detail
- US-123: Equipment State and Hand-Occupancy Rules

### Fuente / certeza
- Confirmado por reporte visual del usuario
- Confirmado por código actual
- Pendiente de validación visual en navegador

## [2026-05-01] - Loader global para solicitudes

### Cambios
- Se agregó un loader global accesible para mostrar feedback mientras la UI carga información o guarda cambios.
- El loader se conectó al helper central `api()` para cubrir llamadas de roster, ficha, wizard, inventario, combate, conjuros y guardados sin duplicar lógica por botón.
- Se agregó conteo de solicitudes concurrentes para mantener el loader visible hasta que termine la última llamada activa.
- Se agregó estilo visual de plataforma: overlay marrón, card, spinner crema, título y texto contextual.

### Archivos modificados
- `ui.html`
- `style.css`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-89: Character Roster
- US-90: Multi-Step Creation Wizard
- US-117: Figma-Matched Character Detail Microflow and Bottom Navigation
- US-122: Figma-Matched Creation Equipment and Inventory Detail
- US-126: Global Request Loader

### Fuente / certeza
- Confirmado por código actual
- Basado en solicitud del usuario
- Pendiente de validación visual en navegador

## [2026-05-01] - Puntos de golpe en personaje abierto y modales de ajuste

### Cambios
- Se agregó a la ficha de personaje abierto la sección Figma de `Puntos de Golpe` y `Puntos de Golpe temporales` antes de los datos de combate.
- Se agregó el botón `Ajustar puntos de golpe` con un modal de plataforma para aplicar daño, curar, establecer PG exactos, establecer PG temporales y limpiar PG temporales.
- Se actualizó el modal para igualar las dos pantallas Figma `Puntos de golpe Modal` (`2052:305` / `2052:472`): pantalla completa, header con flecha atrás, cards de estado, steppers de menos/mas, texto explicativo y CTA `Guardar cambios`.
- El guardado del modal ahora persiste valores exactos de PG actuales y PG temporales desde los steppers.
- Se agregó endpoint `POST /characters/:id/current-hp` para establecer PG actuales respetando el máximo calculado.
- Se corrigió la curación de combate para usar el máximo de PG calculado desde clase, nivel, raza y Constitución, en lugar de una estimación temporal.
- Se alineó el cálculo de PG máximo hidratado para aplicar mínimo de 1 PG por nivel adicional.

### Archivos modificados
- `ui.html`
- `style.css`
- `src/api/controllers/combat.controller.ts`
- `src/api/controllers/character.controller.ts`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-02: Health and Stamina Setup
- US-70: Death and Dying
- US-106: Dynamic HP Recalculation
- US-117: Figma-Matched Character Detail Microflow and Bottom Navigation
- US-125: Figma-Matched Hit Point Summary and Adjustment Modals

### Fuente / certeza
- Confirmado por Figma, nodo `2001:486` y subframe `2052:259`
- Confirmado por Figma, pantallas `2052:305` y `2052:472`
- Confirmado por código actual
- Pendiente de validación visual en navegador

## [2026-05-01] - Diagnóstico de creación de personaje demo

### Cambios
- Se mejoró `scripts/create-demo-via-api.js` para probar `localhost` y `127.0.0.1`, reportar la URL exacta que falla y sugerir el creador directo por Prisma cuando la API no sea alcanzable.

### Archivos modificados
- `scripts/create-demo-via-api.js`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-122: Figma-Matched Creation Equipment and Inventory Detail
- US-124: Consumable Use and Virtual Dice Modal

### Fuente / certeza
- Confirmado por reporte de usuario
- Confirmado por código actual

## [2026-04-30] - Consumibles, apertura de kits y dados virtuales

### Cambios
- Se agregó endpoint de uso de inventario para abrir packs/kits existentes y convertirlos en artículos individuales con cantidades.
- Se agregó acción `Abrir kit` en inventario para packs heredados o agregados como objeto.
- Se agregó acción `Usar` para consumibles como pociones, raciones, antitoxina, aceite, fuego de alquimista, ácido, agua bendita y objetos similares.
- Los consumibles con dados abren un modal visual de dados virtuales con el estilo de la plataforma.
- Las pociones de curación aplican el resultado al `current_hp` del personaje sin superar el máximo calculado.
- Los consumibles con daño o efecto externo muestran el resultado y descuentan una unidad para resolución en mesa.

### Archivos modificados
- `src/api/controllers/inventory.controller.ts`
- `ui.html`
- `style.css`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-62: Inventory System
- US-63: Item Quantities
- US-69: Equipment Packs
- US-122: Figma-Matched Creation Equipment and Inventory Detail
- US-124: Consumable Use and Virtual Dice Modal

### Fuente / certeza
- Confirmado por código actual
- Confirmado por reporte de usuario
- Confirmado por `node --check` del script de `ui.html`
- Confirmado por `npm run typecheck`
- Confirmado por `npm run test`

## [2026-04-30] - Reglas de equipamiento en inventario

### Cambios
- Se agregaron acciones `Equipar` / `Desequipar` en tarjetas de inventario para armas, armaduras, escudos y munición.
- Los objetos equipados ahora se identifican visualmente en la pestaña Inventario.
- El backend aplica reglas de ocupación de manos: armadura corporal única, escudo compatible con una sola arma de una mano, arma a dos manos/arco/ballesta excluye escudo y otras armas, doble arma limitado a armas ligeras o clases marciales configuradas.
- Al equipar arcos se equipan flechas automáticamente si existen; al equipar ballestas se equipan virotes automáticamente si existen.
- Las descripciones de paquetes/kits ahora listan los artículos incluidos y cantidades cuando el catálogo contiene `pack_contents`.

### Archivos modificados
- `src/api/controllers/inventory.controller.ts`
- `ui.html`
- `style.css`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-62: Inventory System
- US-63: Item Quantities
- US-64: Weapons Catalog
- US-65: Armor Catalog
- US-69: Equipment Packs
- US-122: Figma-Matched Creation Equipment and Inventory Detail
- US-123: Equipment State and Hand-Occupancy Rules

### Fuente / certeza
- Confirmado por código actual
- Confirmado por reporte de usuario
- Confirmado por `node --check` del script de `ui.html`
- Confirmado por `npm run typecheck`
- Confirmado por `npm run test`

## [2026-04-30] - Corrección de guardado de equipamiento retroactivo

### Cambios
- Se corrigió el guardado de equipamiento desde la pestaña Inventario para personajes creados antes del flujo `Equipamiento`.
- La UI ya no depende de recargar toda la ficha hidratada después de guardar equipamiento; ahora refresca directamente el inventario para evitar mostrar errores secundarios aunque el guardado haya sido exitoso.
- Se agregó una validación para evitar marcar el equipamiento como guardado cuando el catálogo local no logra resolver objetos válidos.

### Archivos modificados
- `ui.html`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-62: Inventory System
- US-69: Equipment Packs
- US-122: Figma-Matched Creation Equipment and Inventory Detail

### Fuente / certeza
- Confirmado por código actual
- Confirmado por reporte de usuario
- Confirmado por `node --check` del script de `ui.html`
- Confirmado por `npm run typecheck`
- Confirmado por `npm run test`

## [2026-04-30] - Flujo de Equipamiento e inventario detallado

### Cambios
- Se agregó el paso `Equipamiento` al wizard de creación, después de habilidades/conjuros y antes de puntos de golpe.
- Se añadieron opciones de equipamiento inicial por clase con grupos de selección, estado visual seleccionado, contador `0/1`, chips de atributos y presentación alineada al Figma.
- Se envían las elecciones de equipamiento al backend al crear personaje.
- El backend ahora agrega equipamiento seleccionado al inventario y desglosa paquetes en objetos usando tanto `item_id`/`quantity` como el formato sembrado `item`/`qty`.
- La pestaña Inventario ahora muestra tarjetas con cantidad, tipo de objeto, atributos principales y descripción breve.
- Personajes ya creados sin equipamiento de clase detectable pueden escoger su equipamiento desde la pestaña Inventario.

### Archivos modificados
- `ui.html`
- `style.css`
- `src/api/controllers/character.controller.ts`
- `src/api/controllers/inventory.controller.ts`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-62: Inventory System
- US-63: Item Quantities
- US-64: Weapons Catalog
- US-65: Armor Catalog
- US-69: Equipment Packs
- US-90: Multi-Step Creation Wizard
- US-122: Figma-Matched Creation Equipment and Inventory Detail

### Fuente / certeza
- Confirmado por código actual
- Confirmado por Figma, nodo `2047:6676` (`Equipamiento`)
- Confirmado por documentación
- Pendiente de validación E2E final con base de datos

## [2026-04-30] - Corrección de guardrails para creación de nivel alto

### Cambios
- Se corrigió la persistencia de subclases desbloqueadas en nivel 2/3+; el backend ahora exige y guarda subclase cuando `subclass_level <= initial_level`.
- Se agregó validación backend para ASI: hitos por clase, llaves válidas, total exacto de puntos y límite final de atributo 20.
- Se corrigió el conteo de conjuros para clases preparadoras: Clérigo, Druida, Paladín y Mago ahora generan selecciones visibles en la pestaña de conjuros.
- Se agregó validación para que conjuros/trucos enviados pertenezcan a la lista de la clase y al nivel de conjuro disponible.
- Se movió ASI antes de habilidades/conjuros en el wizard para que los modificadores afecten conteos, habilidades, conjuros y PG.
- Se ajustó la UI para que ASI sea obligatoria cuando corresponde y para que HP use Constitución final con raza + ASI.
- Se restauró el contrato `pointsUsed` de `validatePointBuy` para que la integración de ciclo de personaje vuelva a pasar.

### Archivos modificados
- `src/api/controllers/character.controller.ts`
- `src/services/ability-score.service.ts`
- `src/types/index.ts`
- `ui.html`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-85: Point Buy Validation
- US-90: Multi-Step Creation Wizard
- US-104: Ability Score Improvement (ASI)
- US-106: Dynamic HP Recalculation
- US-116: Auto-Advance Selection Reviews and Rolled Creation HP
- US-118: Character Image Upload and Figma-Matched Detail Subflows
- US-121: High-Level Character Creation Guardrails

### Fuente / certeza
- Confirmado por código actual
- Confirmado por documentación
- Confirmado por `npm run typecheck`
- Confirmado por `npm run test`

## [2026-04-30] - Creación de personajes de nivel alto (US-121)

### Cambios
- **Backend**: Se añadieron `getSpellsKnownAtLevel` y `getCantripsAtLevel` como funciones helper en `character.controller.ts`. La validación de conjuros y trucos en `POST /characters` ahora escala con `initial_level` en lugar de usar siempre los valores de nivel 1.
- **Backend**: Se añadió `asi_adjustments` al schema de creación (`z.record`). Los bonos ASI se aplican directamente sobre `base_*` antes de persistirlos y se incluyen en el cálculo de HP, modificadores de recursos y pools.
- **Frontend**: `wizNeedsSubclass()` ahora compara `subclass_level` contra `initial_level` en lugar de hardcodear nivel 1. Clases que desbloquean subclase en nivel 3 (Guerrero, Pícaro, Mago, etc.) muestran la selección de subclase al crear personajes de nivel 3+.
- **Frontend**: `wizPdfSubclassHTML()` filtra subclases por `initial_level` e incluye nota explicativa del nivel de desbloqueo.
- **Frontend**: `wizFlow()` incluye automáticamente un paso `asi` cuando `wizAsiCount() > 0` (personaje de nivel 4+).
- **Frontend**: `wizPdfAsiHTML()` renderiza una tarjeta por cada ASI alcanzada. El usuario elige +2 a un atributo o +1+1 a dos diferentes. Milestones por clase: Fighter [4,6,8,12,14,16,19], Rogue [4,8,10,12,16,19], resto [4,8,12,16,19].
- **Frontend**: `wizPdfCantripsHTML()` ahora obtiene todos los conjuros de la clase (`/catalog/spells?class=X`) y filtra en el cliente hasta `wizMaxSpellLevel()`. Los conjuros se agrupan por nivel (Nivel 1, Nivel 2…) cuando hay más de un nivel disponible.
- **Frontend**: `spellChoiceBlock()` acepta `maxSpellLevel` y renderiza grupos de nivel cuando es relevante.
- **Frontend**: Se añadieron tablas de progresión de trucos y conjuros conocidos para Bard, Cleric, Druid, Sorcerer, Warlock, Wizard, Ranger. Clases preparadas (Wizard, Cleric, Druid, Paladin) siguen usando el conteo de nivel 1 para la selección inicial.
- **Frontend**: `wizSetLevel()` resetea `asi_choices`, `cantrip_selections`, `spell_selections` y fuerza re-fetch de conjuros al cambiar nivel.
- **Frontend**: `wizardFinish()` calcula `asi_adjustments` desde `wiz.data.asi_choices` y lo envía al backend.
- **Frontend/style.css**: Se añadieron `.wiz-spell-level-group` y `.wiz-spell-level-label` para agrupar conjuros por nivel.

### Archivos modificados
- `src/api/controllers/character.controller.ts`
- `ui.html`
- `style.css`
- `CHANGELOG.md`
- `HANDOFF.md`

---

## [2026-04-27] - Inicialización del motor DnD 5e SRD (fecha estimada)

### Cambios
- Se creó el proyecto Node.js/TypeScript con Express, Prisma, Jest, scripts de desarrollo, pruebas y validación TypeScript.
- Se definió la arquitectura base de motor de reglas separado por controladores, servicios, repositorio y tipos.
- Se documentó la guía de setup para instalar dependencias, configurar PostgreSQL, ejecutar migraciones, sembrar catálogos y levantar el servidor.

### Archivos modificados
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `jest.config.ts`
- `SETUP.md`
- `src/index.ts`
- `src/types/index.ts`

### Historias de usuario relacionadas
- US-01: Base Ability Scores Management
- US-04: Proficiency Bonus Tracking
- US-89: Character Roster (List & Load)
- US-90: Multi-Step Creation Wizard

### Fuente / certeza
- Confirmado por código actual
- Confirmado por documentación
- Inferido por marcas de archivo

## [2026-04-28] - Modelo de datos, migraciones y catálogos SRD (fecha estimada)

### Cambios
- Se definió el esquema Prisma con catálogos estáticos para razas, clases, subclases, trasfondos, rasgos, objetos, conjuros, dotes, idiomas y progresión de espacios de conjuro.
- Se definieron datos transaccionales para personajes, clases de personaje, habilidades, herramientas, rasgos, dotes, idiomas, inventario, conjuros conocidos, espacios de conjuro, dados de golpe, recursos y estado activo.
- Se agregaron migraciones iniciales y migraciones para descripciones de conjuros de clase y campos del wizard de creación.
- Se crearon seeders para poblar catálogos SRD y progresiones.

### Archivos modificados
- `prisma/schema.prisma`
- `prisma/migrations/20260428140504_first_schema/migration.sql`
- `prisma/migrations/20260428143654_add_class_spell_description/migration.sql`
- `prisma/migrations/20260429025823_add_creation_wizard_fields/migration.sql`
- `prisma/seed.ts`
- `prisma/seeds/*.ts`

### Historias de usuario relacionadas
- US-07 a US-21: razas y subrazas
- US-22 a US-47: clases, progresión y subclases
- US-48 a US-61: trasfondos
- US-62 a US-69: equipo, armas, armaduras e inventario
- US-78: Concentration Mechanic
- US-79: Spell Slot Progression Tables
- US-83: Feats Data Structure
- US-84: Languages Catalog

### Fuente / certeza
- Confirmado por código actual
- Confirmado por documentación
- Inferido por marcas de archivo
- Pendiente de validación: completitud exacta de cada seed contra SRD/manual

## [2026-04-28] - Servicios del motor de reglas y endpoints API (fecha estimada)

### Cambios
- Se implementaron servicios puros para matemáticas, Point Buy, HP, AC, combate, estados, concentración, condiciones, descansos, habilidades, pasivas, inventario, multiclase, iniciativa, espacios de conjuro y XP.
- Se implementó la hidratación de personaje para calcular valores derivados en tiempo real.
- Se agregaron controladores Express para personajes, catálogos, combate, condiciones, descansos, conjuros e inventario.
- Se agregaron guards para Point Buy, selección de habilidades y estado de muerte.
- Se agregaron pruebas unitarias e integración para reglas críticas.

### Archivos modificados
- `src/services/*.ts`
- `src/engine/hydrate.ts`
- `src/repositories/character.repository.ts`
- `src/api/controllers/*.ts`
- `src/api/middleware/*.ts`
- `tests/unit/*.ts`
- `tests/integration/*.ts`

### Historias de usuario relacionadas
- US-01 a US-06: reglas base
- US-62 a US-88: inventario, combate, descanso, condiciones, multiclase, dotes, idiomas, iniciativa y XP
- US-89 a US-107: endpoints de personaje, creación, edición, hidratación y progreso

### Fuente / certeza
- Confirmado por código actual
- Confirmado por documentación
- Inferido por marcas de archivo
- Pendiente de validación: pruebas completas con base de datos real

## [2026-04-29] - Primer flujo visual mobile-first de creación basado en PDF (fecha estimada)

### Cambios
- Se agregó una UI standalone en `ui.html` para consumir la API desde archivo local.
- Se incorporó un roster de personajes, tarjetas móviles, vista de hoja de personaje, pestañas y controles de edición.
- Se formalizó el contrato del wizard mobile-first basado en `docs/Create Character.pdf`, con separación entre selección y pantallas de revisión.
- Se documentó el contrato de atributos: Point Buy conserva valores base, mientras la UI muestra preview final con bono racial.

### Archivos modificados
- `ui.html`
- `docs/Create Character.pdf`
- `docs/requirements.md`
- `docs/plan.md`
- `docs/tasks.md`
- `.claude.md`

### Historias de usuario relacionadas
- US-89: Character Roster (List & Load)
- US-90: Multi-Step Creation Wizard
- US-108: Respuesta inmediata de checkboxes en el wizard
- US-109: Descripción contextual de habilidades
- US-110: Editar personaje existente
- US-111: Selección de nivel inicial
- US-112: PDF-Matched Character Creation Flow & Ability Score Preview

### Fuente / certeza
- Confirmado por código actual
- Confirmado por documentación
- Basado en contexto del chat
- Inferido por marcas de archivo

## [2026-04-30] - Ajuste visual del wizard a PDF/Figma

### Cambios
- Se ajustó el flujo de creación para seguir la arquitectura de información del PDF: datos generales, raza, revisión de raza, atributos, trasfondo, revisión de trasfondo, rasgos de personalidad, clase, revisión de clase, subclase cuando aplica, habilidades, trucos/conjuros y cálculo de puntos de golpe.
- Se actualizó la pantalla de atributos para mostrar el valor final como número principal y el razonamiento explícito `Base X + Y raza = Z`.
- Se aplicó la paleta y lenguaje visual del PDF/Figma: fondo café, cards café, texto crema/tan, CTA rojo, títulos serif y progreso con barras horizontales.

### Archivos modificados
- `ui.html`
- `style.css`
- `docs/requirements.md`
- `docs/plan.md`
- `docs/tasks.md`
- `.claude.md`

### Historias de usuario relacionadas
- US-112: PDF-Matched Character Creation Flow & Ability Score Preview
- US-113: PDF Visual Language for Mobile Character Creation

### Fuente / certeza
- Confirmado por código actual
- Confirmado por documentación
- Basado en contexto del chat
- Pendiente de validación: comparación 1:1 final contra PDF/Figma

## [2026-04-30] - Navegación del wizard, estado disabled y separación CSS

### Cambios
- Se agregó comportamiento de back/cancel en el encabezado del wizard.
- Se actualizó el botón principal para permanecer deshabilitado hasta que la pantalla actual tenga los datos mínimos válidos.
- Se movieron estilos desde `ui.html` hacia `style.css` y se enlazó la hoja de estilos externa.
- Se validó el flujo básico en navegador: botón disabled inicial, habilitación al completar datos, cancelación desde header y selección de raza.

### Archivos modificados
- `ui.html`
- `style.css`

### Historias de usuario relacionadas
- US-113: PDF Visual Language for Mobile Character Creation
- US-115: Wizard Navigation State and External Styling

### Fuente / certeza
- Confirmado por código actual
- Basado en contexto del chat

## [2026-04-30] - Documentación de continuidad entre IAs

### Cambios
- Se agregó documentación retroactiva para que Claude o Codex continúen el proyecto sin depender del chat anterior.
- Se agregaron historias faltantes para continuidad entre IAs y estado/navegación del wizard.
- Se creó un handoff con estado actual, decisiones técnicas, archivos clave, riesgos, pendientes y comandos útiles.
- Se actualizó `.claude.md` con reglas persistentes de lectura previa y registro obligatorio de cambios.
- Se registró una inconsistencia de validación: `npm run test:unit` falla por una expectativa errónea de DC de concentración en `tests/unit/combat-state.service.test.ts`.
- Corregido posteriormente en la entrada de autoavance/PG por tirada: la expectativa ahora coincide con `max(10, floor(damage/2))`.

### Archivos modificados
- `CHANGELOG.md`
- `HANDOFF.md`
- `docs/requirements.md`
- `.claude.md`
- `tests/unit/combat-state.service.test.ts` (referenciado como pendiente, no modificado)

### Historias de usuario relacionadas
- US-114: AI Continuity Documentation
- US-115: Wizard Navigation State and External Styling
- US-78: Concentration Mechanic

### Fuente / certeza
- Confirmado por código actual
- Confirmado por documentación

## [2026-04-30] - Autoavance de selecciones y PG por tirada

### Cambios
- Raza, trasfondo, clase y subclase avanzan automáticamente a su pantalla `Tu selección` después de elegir una opción.
- Se agregó pantalla `Tu selección` para subclase cuando la clase requiere subclase a nivel 1.
- Las pantallas de selección vuelven a mostrarse dentro de cards visibles con borde, fondo y contenido.
- El paso de puntos de golpe ahora exige lanzar el dado antes de crear el personaje.
- El resultado del dado se envía como `hp_roll_base`, se persiste en `Character.level_1_hp_roll`, y el cálculo de PG usa `roll + modificador de Constitución` para nivel 1.
- Se agregó una migración Prisma y se regeneró el cliente Prisma.
- Se corrigió la expectativa unitaria de DC de concentración para que `damage = 18` espere `10`.
- La migración quedó creada, pero no aplicada desde esta sesión porque Prisma no pudo alcanzar la base remota configurada (`P1001`).

### Archivos modificados
- `ui.html`
- `style.css`
- `src/api/controllers/character.controller.ts`
- `prisma/schema.prisma`
- `prisma/migrations/20260430161500_add_level_1_hp_roll/migration.sql`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`
- `tests/unit/combat-state.service.test.ts`

### Historias de usuario relacionadas
- US-106: Dynamic HP Recalculation
- US-112: PDF-Matched Character Creation Flow & Ability Score Preview
- US-113: PDF Visual Language for Mobile Character Creation
- US-115: Wizard Navigation State and External Styling
- US-116: Auto-Advance Selection Reviews and Rolled Creation HP
- US-78: Concentration Mechanic

### Fuente / certeza
- Confirmado por código actual
- Confirmado por documentación
- Basado en solicitud directa del usuario

## [2026-04-30] - Ajuste Figma de cards Tu selección

### Cambios
- Se verificó en Figma el frame `2005:1847` y el nodo `2005:2000` de `Tu selección`.
- Se ajustó el markup para que el título `Tu selección` viva fuera de la card, como en Figma.
- Se ajustó la card de revisión a fondo `#64422b`, borde `#bbbbbb`, radio 8px, padding 16px, gap 10px, badges `#462f20`, título Roboto 16 bold `#ffd7ad` y descripción blanca 10px.
- Se aplicó el mismo patrón a reviews de raza, trasfondo, clase y subclase.

### Archivos modificados
- `ui.html`
- `style.css`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-113: PDF Visual Language for Mobile Character Creation
- US-116: Auto-Advance Selection Reviews and Rolled Creation HP

### Fuente / certeza
- Confirmado por Figma
- Confirmado por código actual

## [2026-04-30] - Microflujo Figma de detalle de personaje y navegación inferior

### Cambios
- Se reemplazó la navegación inferior móvil por los cuatro destinos del Figma: `Glosario y reglas`, `Personajes`, `Objetos y tienda`, y `Razas y clases`.
- Se agregaron pantallas placeholder para las secciones todavía no implementadas, conservando la arquitectura de información del producto.
- Se creó el microflujo de apertura de personaje con encabezado `Atrás`, nombre centrado y acción `Tirar Dado`.
- La vista de detalle oculta la navegación inferior y ofrece pestañas internas `Ficha`, `Habilidades`, `Conjuros`, `Diario` e `Inventario`.
- La pestaña `Ficha` muestra biografía, resumen de combate, progreso de XP, atributos y estadísticas mágicas con tokens visuales de Figma.

### Archivos modificados
- `ui.html`
- `style.css`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-89: Character Roster (List & Load)
- US-113: PDF Visual Language for Mobile Character Creation
- US-117: Figma-Matched Character Detail Microflow and Bottom Navigation

### Fuente / certeza
- Confirmado por Figma
- Confirmado por código actual
- Basado en solicitud directa del usuario
- Pendiente de validación: comparación visual 1:1 en navegador contra Figma

## [2026-04-30] - Imagen de personaje y subtabs Figma de habilidades/conjuros

### Cambios
- Se agregó subida de imagen desde la ventana de personaje abierto.
- La imagen se adapta al área hero fija del diseño con recorte `cover`, sin deformarse.
- La imagen se guarda localmente por personaje en el navegador mediante `localStorage`.
- El tab `Habilidades` ahora separa `Habilidades` y `Tiradas de salvación` como subtabs, siguiendo Figma.
- Las filas de habilidades y salvaciones muestran indicador de competencia, nombre y bono calculado por separado.
- El tab `Conjuros` ahora separa `Trucos` y `Conjuros` como subtabs.
- Los trucos/conjuros se renderizan como cards tipo Figma con escuela, chips de metadatos, descripción y `Ver más información`.

### Archivos modificados
- `ui.html`
- `style.css`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-78: Concentration Mechanic
- US-89: Character Roster (List & Load)
- US-107: Spell Slot & Spell Known Progression on Level-Up
- US-117: Figma-Matched Character Detail Microflow and Bottom Navigation
- US-118: Character Image Upload and Figma-Matched Detail Subflows

### Fuente / certeza
- Confirmado por Figma
- Confirmado por código actual
- Basado en solicitud directa del usuario
- Pendiente de validación: persistencia backend para imagen de personaje

## [2026-04-30] - Card Figma de personaje creado en roster

### Cambios
- Se verificó en Figma el componente `beast-card-B` dentro de la pantalla `Personajes`.
- Se ajustó la tarjeta de personaje creado para usar fondo decorativo, radio 2px, padding 16px y proporción compacta de 358x159.
- Se cambió la jerarquía de contenido a raza/clase, nombre, acciones, quick info y biografía.
- Se colocaron `Eliminar` y `Editar` como botones rojos compactos dentro de la tarjeta, sin romper el click principal para abrir detalle.
- La fila rápida ahora muestra CA, velocidad, PG actuales y nivel siguiendo el componente de Figma.

### Archivos modificados
- `ui.html`
- `style.css`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-89: Character Roster (List & Load)
- US-117: Figma-Matched Character Detail Microflow and Bottom Navigation
- US-119: Figma-Matched Created Character Card

### Fuente / certeza
- Confirmado por Figma
- Confirmado por código actual
- Basado en solicitud directa del usuario
- Pendiente de validación: comparación visual 1:1 en navegador contra Figma

## [2026-04-30] - CTA Figma para agregar personaje

### Cambios
- Se verificó en Figma el botón `Agregar nuevo personaje` de la pantalla `Personajes`.
- Se movió el CTA debajo de la lista de personajes creados para respetar la posición del prototipo.
- Se reemplazó el botón circular por un botón ancho de 44px de alto, fondo rojo `#720000`, borde `#92752b`, radio 4px, icono plus y texto `Agregar nuevo personaje`.
- Se mantuvo el botón de creación del estado vacío para cuando no existen personajes.

### Archivos modificados
- `ui.html`
- `style.css`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-90: Multi-Step Creation Wizard
- US-119: Figma-Matched Created Character Card
- US-120: Figma-Matched Add Character CTA

### Fuente / certeza
- Confirmado por Figma
- Confirmado por código actual
- Basado en solicitud directa del usuario
- Pendiente de validación: comparación visual 1:1 en navegador contra Figma

## [2026-04-30] - Corrección de visibilidad de conjuros en detalle

### Cambios
- Se corrigió un error de render en las cards de conjuros del detalle de personaje causado por variables `safeName` y `safeDesc` no definidas.
- Se agregó un helper tolerante para leer el nivel del conjuro desde la forma real del endpoint `known-spells`.
- El filtro de subtabs ahora separa `Trucos` y `Conjuros` usando el nivel normalizado del conjuro.
- La vista heredada de conjuros también muestra `Truco` o `Nv.X` usando el mismo helper.

### Archivos modificados
- `ui.html`
- `CHANGELOG.md`

### Historias de usuario relacionadas
- US-107: Spell Slot & Spell Known Progression on Level-Up
- US-118: Character Image Upload and Figma-Matched Detail Subflows

### Fuente / certeza
- Confirmado por código actual
- Basado en solicitud directa del usuario

## [2026-04-30] - Catálogo completo de items SRD 5.1

### Cambios
- Se reescribió `prisma/seeds/item.ts` con 287 items en 11 categorías: `armor` (13), `weapon` (37), `ammunition` (7), `gear` (83), `clothing` (6), `tool` (31), `instrument` (11), `pack` (8), `potion` (22), `focus` (13), `magic_item` (56).
- Armas: se añadieron Dart, Sling y Blowgun que faltaban. Munición: Arrows (20), Crossbow Bolts (20), Sling Bullets (20), Blowgun Needles (50), Quiver, Crossbow Bolt Case, Silver Arrow.
- Equipo de aventurero: todos los items referenciados en `background_data.ts` cubiertos con nombres exactos (23/23 verificados). Añadidos consumibles de combate (Holy Water, Acid, Alchemist's Fire, Antitoxin, Basic Poison), herramientas de exploración, spellbook, component pouch.
- Packs: todos con `pack_contents` mapeados a items del catálogo. Se añadieron Diplomat's Pack, Entertainer's Pack y Monster Hunter's Pack.
- Ropa: Common Clothes, Fine Clothes, Traveler's Clothes, Costume, Vestments, Robe como categoría propia.
- Herramientas: todas las artesanales del SRD, más kits (Disguise, Forgery, Herbalism, Healer's, Poisoner's, Navigator's, Thieves') y juegos de mesa completos.
- Instrumentos musicales: Bagpipes, Drum, Dulcimer, Flute, Horn, Lute, Lyre, Pan Flute, Shawm, Viol + alias genérico.
- Pociones: todas las del SRD (Healing x4, Giant Strength x5, Invisibility, Flying, Speed, Heroism, Resistance, Climbing, Water Breathing, etc.).
- Focos de conjuración: Arcane Focus (5 tipos), Holy Symbol (3 tipos + alias genérico), Druidic Focus (4 tipos), Component Pouch.
- Objetos mágicos SRD: +1/+2/+3 armas y armaduras, Bag of Holding, Cloak/Ring of Protection, Wand of Magic Missiles, Rope of Climbing, Pearl of Power, y ~50 items adicionales con rareza, descripción y flag de attunement.

### Archivos modificados
- `prisma/seeds/item.ts`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-62: Weapon Catalog
- US-63: Armor Catalog
- US-64: Adventuring Gear Catalog
- US-65: Tools Catalog
- US-66: Magic Items Catalog
- US-67: Equipment Packs
- US-68: Starting Equipment by Background
- US-69: Pack Contents Resolution

### Fuente / certeza
- Confirmado por SRD 5.1
- Verificado automáticamente: 23/23 items de trasfondos cubiertos
- Sintaxis TypeScript validada sin errores (tsc --noEmit)
- Basado en solicitud directa del usuario

## [2026-04-30] - Fix migración level_1_hp_roll (tabla "Character" vs "character")

### Cambios
- Se corrigió el SQL de la migración `20260430161500_add_level_1_hp_roll`.
- Error original: `ALTER TABLE "character"` → PostgreSQL case-sensitive rechazaba la tabla (42P01).
- Corrección: `ALTER TABLE "Character"` para coincidir con el nombre real creado en `20260428140504_first_schema`.
- Para aplicar: `npx prisma migrate resolve --rolled-back 20260430161500_add_level_1_hp_roll` seguido de `npx prisma migrate deploy`.

### Archivos modificados
- `prisma/migrations/20260430161500_add_level_1_hp_roll/migration.sql`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-106: Dynamic HP Recalculation (bloqueo resuelto)
- US-116: Auto-Advance Selection Reviews and Rolled Creation HP

### Fuente / certeza
- Confirmado por error P3018 / código 42P01 de Postgres
- Confirmado por revisión de migration.sql primera migración (`20260428140504_first_schema`)

## [2026-05-04] - Perfiles de jugador y roster por propietario

### Cambios
- Se agregó autenticación gratuita propia con registro, login, sesión por token firmado y cierre de sesión.
- Se agregó modelo `User` en Prisma y una migración para relacionar perfiles con personajes mediante `Character.user_id`.
- La creación de personajes ahora guarda el `user_id` del perfil activo cuando la solicitud incluye sesión.
- El roster `GET /characters` devuelve solo los personajes del perfil activo cuando el usuario está loggeado.
- Se agregó guardia de acceso para rutas `/characters/:id` y subrutas, rechazando acciones sobre personajes de otro perfil.
- La UI ahora muestra pantalla de login/registro antes del roster, guarda el token en `localStorage`, envía `Authorization: Bearer`, muestra el perfil activo y permite cerrar sesión.
- Se conserva compatibilidad local con personajes legados sin `user_id`; no se eliminan ni reasignan automáticamente.

### Archivos modificados
- `src/api/controllers/auth.controller.ts`
- `src/api/middleware/auth.ts`
- `src/api/controllers/character.controller.ts`
- `src/index.ts`
- `prisma/schema.prisma`
- `prisma/migrations/20260504120000_add_user_profiles/migration.sql`
- `ui.html`
- `style.css`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-89: Character Roster
- US-90: Full Wizard Character Creation
- US-132: Player Profiles and Owned Character Roster

### Fuente / certeza
- Confirmado por código actual
- Confirmado por documentación
- Basado en solicitud directa del usuario
- Validado con `npm run typecheck`
- Validado con `npx prisma validate`
- Pendiente de validación: migración contra Supabase remoto y prueba E2E en navegador

## [2026-05-04] - Compresión local de imagen de personaje

### Cambios
- La subida de imagen del personaje ahora redimensiona y comprime el archivo en navegador antes de guardarlo localmente.
- Se reemplazó el guardado directo del archivo completo en base64 por procesamiento con canvas, límite aproximado de 900×620 px y salida WebP/JPEG.
- Se conserva el comportamiento visual `cover` del hero y la persistencia local por personaje.

### Archivos modificados
- `ui.html`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-118: Character Image Upload and Figma-Matched Detail Subflows

### Fuente / certeza
- Confirmado por código actual
- Basado en solicitud directa del usuario
- Pendiente de validación visual en navegador con imagen pesada real

## [2026-05-04] - Preparación segura para GitHub y GitHub Pages

### Cambios
- Se endureció `.gitignore` para evitar subir `.env`, `.env.*`, `node_modules`, builds, coverage, logs y archivos temporales.
- Se actualizó `.env.example` con placeholders seguros e inclusión de `AUTH_SECRET` sin valores reales.
- Se agregó `config.public.js` para configuración pública de navegador; no debe contener secretos.
- Se agregó `index.html` y `.nojekyll` para entrada compatible con GitHub Pages.
- Se agregó workflow `.github/workflows/pages.yml` que publica únicamente archivos estáticos permitidos: `index.html`, `ui.html`, `style.css`, `config.public.js` y `.nojekyll`.
- Se eliminaron dependencias runtime a URLs privadas/remotas de Figma MCP y Google Fonts desde UI/CSS.
- Se agregó `README.md` y `SECURITY.md` con instrucciones de publicación segura y advertencia de que GitHub Pages no ejecuta backend.
- Se agregó `scripts/security-check.js`, `npm run security:check` y `npm run prepublish:check`.
- Se redactó del handoff el host privado de Supabase, remitiendo al `.env` local.

### Archivos modificados
- `.gitignore`
- `.env.example`
- `.github/workflows/pages.yml`
- `.nojekyll`
- `README.md`
- `SECURITY.md`
- `config.public.js`
- `index.html`
- `package.json`
- `scripts/security-check.js`
- `ui.html`
- `style.css`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-133: Safe GitHub Repository and GitHub Pages Publication

### Fuente / certeza
- Confirmado por código actual
- Basado en solicitud directa del usuario
- Validado con `npm run prepublish:check`
- Pendiente de validación: activar GitHub Pages en el repositorio real

## [2026-05-04] - Configuración de API pública para Pages

### Cambios
- Se actualizó `config.public.js` para apuntar `API_BASE_URL` a `https://www.migueleo.com`.
- Se documentó que esa URL debe responder como backend API para que el estado de conexión funcione en GitHub Pages.

### Archivos modificados
- `config.public.js`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-133: Safe GitHub Repository and GitHub Pages Publication

### Fuente / certeza
- Basado en solicitud directa del usuario
- Pendiente de validación: disponibilidad real de `/health` y endpoints API en `https://www.migueleo.com`

## [2026-05-04] - Preparación de backend público para Render

### Cambios
- Se agregó CORS seguro por entorno: en producción solo se aceptan orígenes configurados en `ALLOWED_ORIGINS`.
- Se agregaron scripts `postinstall`, `deploy:migrate` y `render:build` para generar Prisma Client, aplicar migraciones con `prisma migrate deploy`, compilar TypeScript y arrancar `dist/index.js`.
- Se agregó `render.yaml` para crear un Web Service gratuito sin secretos embebidos.
- Se actualizó `.env.example` con `ALLOWED_ORIGINS`.
- Se documentó la historia US-134 para separar GitHub Pages UI de API pública HTTPS.

### Archivos modificados
- `src/index.ts`
- `package.json`
- `.env.example`
- `render.yaml`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-132: Player Profiles and Owned Character Roster
- US-133: Safe GitHub Repository and GitHub Pages Publication
- US-134: Public Backend API Deployment

### Fuente / certeza
- Confirmado por código actual
- Basado en solicitud directa del usuario
- Validado con `npm run typecheck`
- Validado con `npm run test`
- Validado con `npm run build`
- Validado con `npm run security:check`
- Pendiente de validación: despliegue real en Render y prueba de `GET /health`

## [2026-05-04] - Ajuste de build Render con Node 20

### Cambios
- Se fijó Node 20 LTS en `package.json` y `render.yaml` para evitar builds con Node 24 por defecto.
- Se separó `render:build` de las migraciones: ahora solo genera Prisma Client y compila TypeScript.
- Las migraciones quedan para `npm run deploy:migrate` como Pre-Deploy Command o ejecución manual.

### Archivos modificados
- `package.json`
- `render.yaml`
- `.env.example`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-134: Public Backend API Deployment

### Fuente / certeza
- Confirmado por captura de Render usando Node 24 por defecto
- Basado en solicitud directa del usuario
- Pendiente de validación: redeploy en Render

## [2026-05-04] - Fix TypeScript build en Render

### Cambios
- Se agregó `ignoreDeprecations: "5.0"` en `tsconfig.json` para evitar que TypeScript falle el build por la advertencia de `moduleResolution: node10`.
- Se conservó `module: commonjs` para no cambiar el runtime compilado del backend.

### Archivos modificados
- `tsconfig.json`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-134: Public Backend API Deployment

### Fuente / certeza
- Confirmado por logs de Render
- Validado con `npm run build`
- Validado con `npm run prepublish:check`

## [2026-05-04] - Fix instalación de TypeScript en Render

### Cambios
- Se agregó `NPM_CONFIG_PRODUCTION=false` a la configuración de Render para que el build instale `devDependencies`.
- Esto evita que `npx tsc` intente usar el paquete incorrecto `tsc` cuando TypeScript no está instalado.

### Archivos modificados
- `render.yaml`
- `.env.example`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-134: Public Backend API Deployment

### Fuente / certeza
- Confirmado por logs de Render: `This is not the tsc command you are looking for`
- Pendiente de validación: redeploy en Render

## [2026-05-04] - Conexión UI Pages con API Render

### Cambios
- Se actualizó `config.public.js` para apuntar la UI publicada a la API desplegada en Render: `https://dnd-character-engine-api.onrender.com`.
- Se confirmó manualmente que `/health` responde `{"status":"ok"}` en la API pública.

### Archivos modificados
- `config.public.js`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-133: Safe GitHub Repository and GitHub Pages Publication
- US-134: Public Backend API Deployment

### Fuente / certeza
- Confirmado por captura del usuario de `GET /health`
- Pendiente de validación: GitHub Pages consumiendo la API pública tras push

## [2026-05-04] - Íconos locales para UI pública

### Cambios
- Se reemplazaron fallbacks de letras en navegación, placeholders y tarjeta de personaje por íconos SVG locales embebidos.
- La UI pública ya no depende de assets privados/remotos de Figma para mostrar navegación e indicadores rápidos.

### Archivos modificados
- `ui.html`
- `style.css`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-117: Figma-Matched Character Detail Microflow and Bottom Navigation
- US-119: Figma-Matched Created Character Card
- US-133: Safe GitHub Repository and GitHub Pages Publication

### Fuente / certeza
- Confirmado por código actual
- Basado en reporte del usuario en app publicada
- Pendiente de validación visual en GitHub Pages

## [2026-05-04] - Persistencia backend de imagen de personaje

### Cambios
- Se agregó `Character.image_data` al esquema Prisma y migración `20260504131500_add_character_image`.
- Se agregó endpoint `PATCH /characters/:id/image` para guardar imágenes comprimidas como data URL validada.
- La UI ahora envía la imagen comprimida al backend y usa `localStorage` solo como cache/fallback.
- Al cargar la ficha, la imagen se toma primero desde el personaje devuelto por API y luego desde cache local.

### Archivos modificados
- `prisma/schema.prisma`
- `prisma/migrations/20260504131500_add_character_image/migration.sql`
- `src/api/controllers/character.controller.ts`
- `ui.html`
- `docs/requirements.md`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-118: Character Image Upload and Figma-Matched Detail Subflows
- US-132: Player Profiles and Owned Character Roster

### Fuente / certeza
- Confirmado por código actual
- Basado en reporte del usuario en app publicada
- Pendiente de validación: migración en Render/Supabase y subida real desde GitHub Pages

## [2026-05-04] - Fix payload de imagen y errores API claros

### Cambios
- Se aumentó el límite JSON de Express a `2mb` para aceptar imágenes comprimidas del personaje.
- El middleware global de errores ahora traduce `ZodError` a 422, JSON inválido a 400 y payload demasiado grande a 413 con mensaje en español.
- Esto evita que errores esperados del upload aparezcan como 500 genérico.

### Archivos modificados
- `src/index.ts`
- `src/api/middleware/error-handler.ts`
- `CHANGELOG.md`
- `HANDOFF.md`

### Historias de usuario relacionadas
- US-118: Character Image Upload and Figma-Matched Detail Subflows

### Fuente / certeza
- Basado en error 500 reportado desde `PATCH /characters/:id/image`
- Pendiente de validación: redeploy en Render y subida real
