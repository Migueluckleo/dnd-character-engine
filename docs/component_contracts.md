# Component Contracts

Contratos explícitos de componentes reutilizables. Usar junto con `docs/figma_sources.md` y `docs/design_tokens.md`.

## Regla General

Un componente no debe inventar colores, spacing, tipografía, tamaño o estados si existe átomo/módulo Figma.

Cada componente debe documentar:

- Figma source.
- Node.
- Variants.
- Implementation mapping.
- Rules.
- Anti-patterns.
- Pending extraction.

## Button

Figma source:

- Primary / Regular: `--main-button`
- Primary / Mini: `--mini-button-main`
- Secondary / Regular: `--secondary-button`
- Secondary / Mini: `--mini-button-secondary`
- Text / Ghost: `--text-button`

Nodes:

- Primary / Regular: `2146:19941`
- Primary / Mini: `2147:20011`
- Secondary / Regular: `2147:19989`
- Secondary / Mini: `2147:19989` (same source as secondary until Figma exposes a separate node)
- Text / Ghost: `2149:20059`

Variants:

- Primary / Regular
- Primary / Mini
- Secondary / Regular
- Secondary / Mini
- Ghost / Regular
- Ghost / Mini
- Text
- Disabled
- Loading (pending Figma extraction)

Implementation mapping:

- Primary / Regular = `.primary-btn`
- Primary / Mini = `.primary-btn-mini`
- Secondary / Regular = `.secondary-btn`
- Secondary / Mini = `.secondary-btn-mini`
- Ghost / Regular = `.ghost-btn`
- Ghost / Mini = `.ghost-btn-mini`
- Modal close = `.item-description-close` / close atom

Rules:

- Usar mini button en headers, acciones compactas, cards de inventario y acciones secundarias dentro de cards.
- Usar regular button para CTA principal de pantalla o acciones de flujo.
- Los botones regulares miden `44px` de alto.
- Los botones mini miden `24px` de alto.
- El close de modal mide `32px`.
- Usar `Source Serif Pro` para botones New Style.
- Usar `#720000` para primary.
- El texto de primary debe ser blanco `#ffffff`.
- Los iconos, glifos y spans internos de un botón deben heredar `currentColor` del botón.
- Tabs, chips, steppers, dados y choice cards son controles especializados; no deben recibir átomos CTA por normalización automática.
- No cambiar tamaño/color desde clases de acción.

Anti-patterns:

- No crear clases como `.save-button`, `.delete-character-button`, `.inventory-action-button` para definir tamaño, color o tipografía.
- No usar botones regulares en headers compactos.
- No poner texto largo dentro de mini button.
- No usar emoji como icono de botón si ya existe átomo/icono.
- No definir color propio en `.add-icon`, SVGs o wrappers internos de icono cuando viven dentro de un botón atomizado.

Pending extraction:

- Disabled exact colors from Figma.
- Pressed/focus states.
- Whether secondary mini has a distinct node or reuses secondary regular.

## Input

Figma source:

- Base input: `--atom-input`

Node:

- `2182:16894`

Variants:

- Text input
- Search input
- Select-like input
- Textarea (implementation variant, pending Figma extraction)
- Icon input
- Disabled
- Error (pending Figma extraction)

Implementation mapping:

- Base control = `.input-control`
- Wrapper = `.input`
- Icon wrapper = `.input.input-icon`
- Search field = `.inventory-search-field` + `.input.input-icon` + `.input-control`

Rules:

- Inputs, selects and textareas in New Style screens must use `.input-control`.
- Composed fields may wrap the control with `.input`.
- Icon fields must use `.input.input-icon`.
- The inner control must not draw a second border when wrapped.
- Placeholder and value text must fit mobile width.

Anti-patterns:

- No custom one-off input borders.
- No separate decorative icon outside the input if Figma shows it integrated.
- No viewport-scaled font sizes.

Pending extraction:

- Exact disabled/error/focus states.
- Search icon position from Figma.

## Checkbox

Figma source:

- `--atom-checkbox`

Node:

- `2192:3392`

Variants:

- Unchecked
- Checked
- Disabled unchecked
- Disabled checked

Implementation mapping:

- Wizard equipment checkbox = `.equipment-check`
- Future canonical class = `.checkbox-atom` (not yet implemented)

Rules:

- Hitbox must be `24px`.
- Use in selection cards, not as a generic decorative mark.
- Checked state must be visible without relying only on color.

Anti-patterns:

- No tiny native checkbox if Figma expects 24px atom.
- No using checkbox atom as caret or radio replacement.

Pending extraction:

- Exact border/fill/checkmark dimensions.

## Caret

Figma source:

- `--atom-caret`

Node:

- `2149:29977`

Variants:

- Collapsed
- Expanded
- Disabled (pending)

Implementation mapping:

- Inventory card collapse = `.caret-btn` + `.caret-icon`

Rules:

- Hitbox must be `24px x 24px`.
- Internal vector approximately `12px x 6px`.
- Color must use brand red `#720000`.
- Use caret only for expand/collapse.

Anti-patterns:

- No mini button for caret.
- No text labels inside caret.
- No layout shift when toggling.

Pending extraction:

- Exact rotation/animation from Figma.

## Tag / Chip

Figma source:

- `--atom-tag`

Node:

- `2149:29985`

Variants:

- Metadata tag
- Status tag
- Filter chip
- Selected filter chip
- Disabled tag (pending)

Implementation mapping:

- Equipment/item chips = `.equip-chip`
- Inventory status row = `.inventory-status-row em`
- Inventory head status = `.inventory-head-status em`
- Inventory filters = `.inventory-filter-chips button`

Rules:

- Tags must use Spanish labels.
- Tags should be compact and scannable.
- Tags must not contain emoji.
- Rarity/source/type remain textual attributes, not decorative symbols.

Anti-patterns:

- No raw English keys like `armor`, `weapon`, `heavy`.
- No unbounded long tags that overflow card width.

Pending extraction:

- Exact padding/radius/color per tag variant.

## Separator / Divider

Figma source:

- `--atom-separator`

Node:

- `2148:20031`

Variants:

- Horizontal red divider
- Gradient/taper divider
- Section divider

Implementation mapping:

- Figma red divider = `.figma-red-divider`
- Character/card section dividers = existing New Style divider rules

Rules:

- Use red brand/divider treatment for major section separation.
- Roster card divider must fade/taper horizontally.
- Dividers must remain visible even when generic divider styles exist elsewhere.

Anti-patterns:

- No plain full-width border if Figma expects tapered divider.
- No dividers that create extra layout jumps.

Pending extraction:

- Exact gradient stops from node.

## Navigation

Figma source:

- Bottom navbar: `--navigation-navbar`
- Tabs: `--navigation-tabs`
- Individual tab: `--atom-tab`

Nodes:

- Bottom navbar: `2149:24406`
- Tabs: `2149:28964`
- Atom tab: `2149:24361`

Variants:

- Navbar active item
- Navbar inactive item
- Tab active
- Tab inactive
- Tab disabled (pending)

Implementation mapping:

- Main bottom nav = `.bottom-nav-figma`
- Character internal tabs = `.detail-tabs`
- Inventory section tabs = `.inventory-section-tabs`

Rules:

- Navbars use `16px` horizontal padding.
- Internal grid columns must fit inside padded content width.
- Active state must be obvious in red brand.
- Character opened tabs are: `Ficha`, `Habilidades`, `Conjuros`, `Diario`, `Inventario`.
- Inventory subtabs are: `Equipo`, `Mochila`, `Alijo`.

Anti-patterns:

- No fixed columns that sum to full viewport before padding.
- No nav item text that wraps awkwardly or overlaps.

Pending extraction:

- Exact active indicator geometry.

## Modal Layout

Figma source:

- `--layout-modalWindow`

Node:

- `2152:3461`

Variants:

- Full-screen modal
- Item details modal
- Confirmation modal (pending)

Implementation mapping:

- Item detail modal = `.item-description-drawer` + `.item-description-sheet`
- Item use modal = `.item-use-modal`
- Dice flow modal = `.dice-flow-modal`

Rules:

- Item detail must behave as a full-screen modal/sheet, not bottom drawer.
- Modal content must respect safe area and mobile viewport.
- Close action must be visible and reachable.

Anti-patterns:

- No bottom drawer for item details.
- No nested cards inside modal unless Figma module calls for an inner content card.

Pending extraction:

- HP modal and dice modal nodes.

## Item Header Module

Figma source:

- `--item-modalWindow-module-item-header`

Node:

- `2152:3489`

Variants:

- Item with image
- Item with fallback icon
- Item with price
- Item without price
- Magic item with rarity

Implementation mapping:

- Modal header = `.module-item-header`
- Art = `.item-description-art .item-art`
- Summary = `.item-description-summary`
- Main information = `.item-description-main-info`
- Title/category = `.item-description-title-category`
- Price = `.item-description-price`
- Highlighted rule = `.item-description-rule`

Rules:

- Arte del item va a la izquierda.
- `item summary` va a la derecha.
- `main information` agrupa `titleAndCategory` + `price`.
- Después van divider rojo y `advantages` / regla destacada.
- Precio no debe ser una tercera columna desconectada.
- Nombre, tipo, atributos y descripción deben estar en español cuando exista mapping.

Anti-patterns:

- No separar precio como columna aislada.
- No mostrar raw English (`Chain Mail`, `armor`, `Description`) si existe fallback ES.
- No remover el bloque de arte si una imagen falla; usar fallback rojo.

Pending extraction:

- Exact modal header spacing after MCP inspection.

## Description Module

Figma source:

- `--item-module-description`

Node:

- `2152:3480`

Variants:

- Short description
- Long description
- Empty description fallback

Implementation mapping:

- Description body = `.item-description-body`

Rules:

- Title visible: `Descripción`.
- Body uses catalog/DB description first.
- Generated fallback only when explicit description is absent.
- Text must wrap; no ellipsis for rule description.

Anti-patterns:

- No `Description` in English.
- No truncating full item description in modal.

Pending extraction:

- Exact padding and strip/border values.
