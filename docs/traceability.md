# Traceability Map

Mapa vivo de trazabilidad entre producto, Figma, documentación, código y validación.

Este archivo existe para reducir silos en Graphify. Cada sección declara relaciones explícitas para que el grafo conecte requerimientos, tareas, contratos visuales, módulos, funciones y pruebas.

## Reglas De Uso

- Cada cambio funcional o visual debe enlazar al menos una User Story, una tarea, una pantalla/componente Figma cuando aplique, los archivos/funciones tocados y la validación ejecutada.
- Si una implementación vive temporalmente en `ui.html`, registrar también el helper o módulo destino cuando exista.
- Si una sección de docs describe comportamiento de UI, debe mencionar las funciones o renderizadores que implementan ese comportamiento.
- Si un source Figma está pendiente, registrar el source key esperado y marcarlo como pendiente de extracción.

## Inventario: Identidad Visual, Español Y Helpers

Product scope:

- `US-122` Figma-matched creation equipment and inventory detail.
- `US-127` robust item descriptions and item rule attributes.
- `US-137` Figma-matched inventory section.
- `US-141` full Spanish localisation of items and spells.
- `US-145` visual identity for inventory items.
- `US-146` New Style template UI from Figma.
- `US-148` incremental frontend modularization without redesign.

Tasks:

- `T-081` extrae helpers de inventario/item display a `src/client/inventoryHelpers.ts`.
- `T-082` restaura prioridad de descripciones explícitas de inventario.
- `T-083` restaura normalización en español e imágenes locales tras Fase 4.
- `T-085` alinea iconos fallback de inventario al rojo brand.
- `T-086` blinda inventario contra carga tardía de helpers Vite.

Figma sources and contracts:

- `docs/figma_sources.md` source `--dndCharacterEngine-character-backpack`.
- `docs/figma_sources.md` source `--character-module-inventory`.
- `docs/figma_sources.md` source `--character-module-item`.
- `docs/figma_sources.md` source `--inventory-modalWindow-itemDetails`.
- `docs/figma_sources.md` source `--item-modalWindow-module-item-header`.
- `docs/figma_sources.md` source `--item-module-description`.
- `docs/card_contracts.md` section `Inventory Item Card`.
- `docs/card_contracts.md` section `Catalog Item Card`.
- `docs/component_contracts.md` section `Item Header Module`.
- `docs/component_contracts.md` section `Description Module`.
- `docs/design_tokens.md` brand red token `#720000`.

Implementation files:

- `ui.html` renders inventory screens, cards, drawer and fallbacks.
- `src/client/inventoryHelpers.ts` owns canonical item labels, item type labels, chips, descriptions, image resolution and fallback icon HTML.
- `src/client/main.ts` imports `src/client/inventoryHelpers.ts` and publishes `window.DND_CLIENT_READY`.
- `src/client/preview.ts` provides demo inventory data through `window.DND_PREVIEW_API`.
- `style.css` owns visual treatment for inventory cards, item art, modal and buttons.
- `src/images/items/` contains local item art used by Vite asset resolution.

Implementation functions:

- `ui.html` function `renderDetailInventory(c)` renders the inventory tab shell.
- `ui.html` function `renderInventoryBackpackView(items)` renders `Mochila`.
- `ui.html` function `renderInventoryEquipmentView(items)` renders `Equipo`.
- `ui.html` function `renderInventoryStashView(items)` renders `Alijo`.
- `ui.html` function `renderInventoryItemCard(inv, options = {})` renders inventory item cards.
- `ui.html` function `openItemDescriptionDrawer(encodedItemId)` renders the Figma item description modal.
- `ui.html` function `renderInventoryCatalogCard(item)` renders add-object catalog cards.
- `ui.html` function `openInventoryQuantityScreen(itemId)` renders quantity confirmation.
- `ui.html` function `itemLabel(name)` must delegate to `window.DND_ITEM_HELPERS.itemLabel` when available and keep Spanish fallback when unavailable.
- `ui.html` function `itemImageHtml(item, altText)` must delegate to `window.DND_ITEM_HELPERS.itemImageHtml` when available and keep local red fallback when unavailable.
- `ui.html` function `refreshItemDisplaysAfterHelpersReady()` refreshes visible inventory when Vite helpers become available.
- `src/client/inventoryHelpers.ts` function `itemLookupKey(value)` connects display names, `item_id` values and `equipment:*` refs.
- `src/client/inventoryHelpers.ts` function `itemLabel(name)` localizes item labels to Spanish.
- `src/client/inventoryHelpers.ts` function `itemTypeLabel(item)` localizes item type labels.
- `src/client/inventoryHelpers.ts` function `itemRuleChips(item)` creates rule chips in Spanish.
- `src/client/inventoryHelpers.ts` function `itemDescription(item)` prioritizes `item.description` and `item.properties.description`.
- `src/client/inventoryHelpers.ts` function `itemImagePath(item)` resolves local item art through Vite assets.
- `src/client/inventoryHelpers.ts` function `fallbackItemIconSvg(item)` creates local brand-red fallback art.
- `src/client/inventoryHelpers.ts` function `itemImageHtml(item, altText)` renders item art with no blank visual state.

Validation:

- `npm run typecheck:web`.
- `npm run build:web`.
- Preview URL: `http://127.0.0.1:5173/ui.html?preview=1` or alternate Vite port.
- Manual check: inventory item names must show Spanish labels such as `Cota de Mallas`, `Escudo`, `Poción de Curación`, `Yelmo del Pavor`.
- Manual check: item drawer must show Spanish type, price, rule row and description.
- Manual check: fallback item icons must use brand red `#720000`, not yellow/gold.

Graphify bridge keywords:

- Inventory and Equipment API connects to `InventoryService`, `inventory.controller.ts`, `renderDetailInventory(c)`, `src/client/inventoryHelpers.ts`, `US-145`, `US-146`, `T-081`, `T-086`.
- Behavioral Design Inventory connects to `docs/behavioral_design.md`, `docs/card_contracts.md`, `ui.html`, `src/client/inventoryHelpers.ts`.

## Character Creation Wizard

Product scope:

- `US-122` equipment choices during creation.
- `US-135` grouped race selection.
- `US-136` point-buy suggestion.
- `US-146` New Style Figma character creation flow.
- `US-148` frontend modularization without redesign.

Tasks:

- `T-077` migrates mobile UI to New Style Figma.
- `T-087` creates canonical Figma Sources and companion contracts.
- `T-088` enriches Figma contracts with explicit implementation mappings.
- Wizard Figma normalization work documented in `CHANGELOG.md` and `HANDOFF.md`.

Figma sources and contracts:

- `docs/figma_sources.md` source `--flow-characterCreation`.
- `docs/figma_sources.md` source `--characterCreation-generalInformation-empty`.
- `docs/figma_sources.md` source `--characterCreation-raceSelection`.
- `docs/figma_sources.md` source `--characterCreation-backgroundSelection`.
- `docs/figma_sources.md` source `--characterCreation-classSelection`.
- `docs/figma_sources.md` source `--characterCreation-equipmentSelection-unselected`.
- `docs/figma_sources.md` source `--characterCreation-equipmentSelection-selected`.
- `docs/figma_sources.md` source `--characterCreation-spellSelection-unselected`.
- `docs/figma_sources.md` source `--characterCreation-spellSelection-selected`.
- `docs/figma_sources.md` source `--characterCreation-attributesConfig-unselected`.
- `docs/figma_sources.md` source `--characterCreation-attributesConfig-selected`.
- `docs/card_contracts.md` sections `Race Card`, `Class Card`, `Background Card`, `Equipment Selection Card`, `Spell Card`.
- `docs/component_contracts.md` sections `Button`, `Input`, `Checkbox`, `Tag / Chip`, `Separator`.

Implementation files:

- `ui.html` owns the current wizard renderers and fallbacks.
- `src/client/preview.ts` provides preview catalog data for wizard validation.
- `src/client/main.ts` coordinates Vite module readiness.
- `style.css` owns wizard visual treatment, cards, buttons and progress.

Implementation functions:

- `ui.html` function `wizardOpen()` opens the wizard.
- `ui.html` function `wizRenderStep(n)` routes wizard screen rendering.
- `ui.html` function `wizFlow()` defines wizard flow order.
- `ui.html` function `wizPdfGeneralHTML()` renders general information.
- `ui.html` function `wizPdfRaceHTML()` renders race selection.
- `ui.html` function `wizPdfBackgroundHTML()` renders background selection.
- `ui.html` function `wizPdfClassHTML()` renders class selection.
- `ui.html` function `wizPdfEquipmentHTML()` renders equipment selection.
- `ui.html` function `wizEquipmentOptionHTML(group, option, selected)` renders equipment cards.
- `ui.html` function `wizPdfCantripsHTML()` renders cantrip selection.
- `ui.html` function `wizPdfAttributesHTML()` renders attributes.
- `ui.html` function `wizardFinish()` sends final character payload.
- `ui.html` function `catalogLookupKey(value)` normalizes race, class and background keys.
- `ui.html` function `raceNameEs(value)` localizes race names.
- `ui.html` function `classNameEs(value)` localizes class names.
- `ui.html` function `backgroundNameEs(value)` localizes background names.

Validation:

- `npm run typecheck:web`.
- `npm run build:web`.
- Preview URL: `http://127.0.0.1:5173/ui.html?preview=1` or alternate Vite port.
- Manual check: wizard race/class/background cards must show Spanish labels and descriptions.
- Manual check: wizard button atoms follow `docs/component_contracts.md`.

Graphify bridge keywords:

- Character Creation & Progression connects to `wizRenderStep(n)`, `wizardFinish()`, `docs/figma_sources.md`, `docs/card_contracts.md`, `US-146`.
- Behavioral Design Character Creation connects to `docs/behavioral_design.md`, `docs/screen_contracts.md`, `ui.html`.

## Preview Mode And Runtime Readiness

Product scope:

- `US-147` local production-mirror preview without login.
- `US-148` incremental frontend modularization without redesign.

Tasks:

- `T-079` creates production-mirror local preview.
- `T-080` extracts legacy pure utilities to a client module.
- `T-081` extracts inventory helpers to a client module.
- `T-084` restores robust login start after Vite refactor.
- `T-086` protects inventory if Vite helpers load late.

Implementation files:

- `ui.html` owns boot, auth, preview mode switch, and compatibility wrappers.
- `src/client/main.ts` imports `legacy-utils`, `preview` and `inventoryHelpers`.
- `src/client/preview.ts` exposes `window.DND_PREVIEW_API`.
- `src/client/legacy-utils.ts` exposes `window.DND_UTILS`.
- `src/client/inventoryHelpers.ts` exposes `window.DND_ITEM_HELPERS`.
- `vite.config.ts` configures local frontend runtime.
- `config.public.js` provides public runtime configuration.

Implementation functions and globals:

- `ui.html` constant `PREVIEW_MODE` switches local preview behavior.
- `ui.html` function `api(method, path, body)` delegates preview requests to `window.DND_PREVIEW_API.request`.
- `ui.html` function `startAuthOnce()` guards auth bootstrap.
- `ui.html` function `refreshItemDisplaysAfterHelpersReady()` refreshes inventory after helper readiness.
- `src/client/main.ts` sets `window.DND_CLIENT_READY = true`.
- `src/client/main.ts` dispatches `dnd-client-ready`.
- `src/client/preview.ts` constant `PREVIEW_ITEMS` contains demo inventory items.
- `src/client/preview.ts` function `request(method, path, body)` handles preview API calls.

Validation:

- `npm run dev:web`.
- `npm run typecheck:web`.
- `npm run build:web`.
- Browser preview URL with `?preview=1`.
- Manual check: refresh should not require logout/login.
- Manual check: preview must not call production API for characters, inventory, auth, spells, skills or catalog data.

Graphify bridge keywords:

- Local Preview connects `US-147`, `src/client/preview.ts`, `src/client/main.ts`, `ui.html`, `T-084`.
- Frontend Modularization connects `US-148`, `window.DND_UTILS`, `window.DND_ITEM_HELPERS`, `window.DND_CLIENT_READY`.

## Figma Governance And Design Consistency

Product scope:

- `US-146` New Style template UI from Figma.
- Process requirement: every UI/layout/style/component/card/modal/navigation change consults Figma sources and companion contracts.

Tasks:

- `T-087` creates canonical Figma Sources and companion contracts.
- `T-088` enriches component and card contracts.
- `T-089` normalizes typography and icon color in atomized buttons.

Documentation files:

- `docs/figma_sources.md` is the source registry.
- `docs/design_tokens.md` is the token registry.
- `docs/screen_contracts.md` maps screens and flows.
- `docs/component_contracts.md` maps reusable components.
- `docs/card_contracts.md` maps cards.
- `docs/qa_checklist.md` defines visual and functional QA.
- `AGENTS.md` and `CLAUDE.md` require docs updates and Figma source use.

Implementation files:

- `ui.html` contains current renderers.
- `style.css` contains current CSS tokens and component styles.
- `src/client/*` contains extracted frontend helpers and runtime modules.

Validation:

- Every UI task should record consulted Figma source keys in `CHANGELOG.md` and `HANDOFF.md`.
- Every behavior/product change should update `docs/requirements.md`, `docs/tasks.md` and `docs/behavioral_design.md`.
- Every frontend change should run `npm run typecheck:web` and `npm run build:web`.

Graphify bridge keywords:

- Figma Sources connects `docs/figma_sources.md`, `docs/design_tokens.md`, `docs/screen_contracts.md`, `docs/component_contracts.md`, `docs/card_contracts.md`, `docs/qa_checklist.md`, `ui.html`, `style.css`.
- UI atoms connect `--main-button`, `--mini-button-main`, `.primary-btn`, `.primary-btn-mini`, `installUiAtomObserver()`, `T-089`.

## Backend Rule Engine And Hydration

Product scope:

- `FR-01` through `FR-13` core DnD mechanics.
- `US-62` through `US-69` inventory initialization, equipment and item rules.
- `US-117` through `US-125` hydrated character sheet and detail flows.
- `US-139` equipped item effects on sheet stats.
- `US-140` story resolution dice flow.

Documentation files:

- `docs/requirements.md` defines functional requirements and user stories.
- `docs/plan.md` defines architecture plan and hydration flow.
- `docs/tasks.md` tracks implementation tasks.
- `docs/behavioral_design.md` defines player-facing behavior and UX.

Implementation files:

- `src/services/hydrate.ts` hydrates character details.
- `src/services/armor.service.ts` calculates AC.
- `src/services/hp.service.ts` calculates HP.
- `src/services/inventory.service.ts` manages inventory/equipment rules.
- `src/services/attack.service.ts` calculates attack modifiers.
- `src/controllers/character.controller.ts` exposes character endpoints.
- `src/controllers/inventory.controller.ts` exposes inventory endpoints.
- `prisma/schema.prisma` defines data model.
- `prisma/seeds/item.ts` seeds item catalog.

UI connection points:

- `ui.html` function `renderCharacterTab(tab)` renders character detail tabs.
- `ui.html` function `renderDetailInventory(c)` renders hydrated inventory.
- `ui.html` function `renderSkillList()` renders skills.
- `ui.html` function `openStoryResolutionFlow()` renders story dice flow.
- `ui.html` function `renderAttackWeapons()` renders attack weapon selection.

Validation:

- `npm run typecheck`.
- `npm run test`.
- `npm run typecheck:web`.
- `npm run build:web`.

Graphify bridge keywords:

- Architecture Plan & Hydration Flow connects `docs/plan.md`, `src/services/hydrate.ts`, `src/controllers/character.controller.ts`, `ui.html`.
- Inventory & Equipment API connects `src/services/inventory.service.ts`, `src/controllers/inventory.controller.ts`, `prisma/seeds/item.ts`, `src/client/inventoryHelpers.ts`.

## Public Deployment And Security

Product scope:

- `US-133` public GitHub repository and GitHub Pages static deployment.
- `US-134` public backend deployment readiness.

Documentation files:

- `README.md`.
- `SECURITY.md`.
- `SETUP.md`.
- `docs/requirements.md` status table for `US-133` and `US-134`.

Implementation and config files:

- `.gitignore` protects local secrets and generated artifacts.
- `.env.example` documents public env requirements.
- `config.public.js` exposes non-secret frontend config.
- `scripts/prepublish-check.sh` validates public publishing safety.
- `.github/workflows/pages.yml` builds public static UI.
- `vite.config.ts` builds frontend assets.

Validation:

- `npm run prepublish:check`.
- `npm run build:web`.
- Manual check: no `.env`, API keys, database credentials or private Figma asset URLs in public bundle.

Graphify bridge keywords:

- README & Pages Setup connects `US-133`, `.github/workflows/pages.yml`, `config.public.js`, `scripts/prepublish-check.sh`.
- Security Policy connects `SECURITY.md`, `.gitignore`, `.env.example`, `US-133`, `US-134`.

