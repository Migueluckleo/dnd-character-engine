# Figma Sources

Fuente viva para implementar y auditar la UI contra Figma.

Origen inicial: `/Users/migueleo/Downloads/figma sources.docx`, creado por el usuario el 2026-05-15.

## Reglas De Uso

- Antes de cambiar UI, layout, estilos, copy visual, cards, modales, navegación o componentes, revisar esta fuente.
- Para una pantalla, usar primero el source de tipo `screen` o `flow`; después consultar módulos/componentes; al final consultar átomos.
- Si hay una URL Figma para el elemento, no inferir colores, medidas, tipografías, contenido ni jerarquía desde memoria.
- Al implementar, documentar qué source se usó en `CHANGELOG.md` y `HANDOFF.md`; si cambia UX/requerimientos, actualizar también `docs/requirements.md`, `docs/tasks.md` y `docs/behavioral_design.md`.
- Si un source no tiene suficiente detalle o falta una variante, marcarlo como pendiente de QA visual en vez de declarar paridad 1:1.
- No usar URLs privadas de Figma como assets runtime. Los assets necesarios deben bajarse o recrearse como assets locales.

## Archivo Figma

- Nombre: `DnD Character Engine`
- File key: `kwyCppseLygq4bUhYdFD7j`
- Link base: `https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine`

## Documentos Contractuales

- `docs/design_tokens.md`: tokens globales de color, tipografía, spacing, radios, sombras y assets.
- `docs/screen_contracts.md`: contrato por pantalla/flujo.
- `docs/component_contracts.md`: contrato por componentes y módulos reutilizables.
- `docs/card_contracts.md`: contrato específico de cards y estructuras repetidas.
- `docs/qa_checklist.md`: checklist de QA visual, funcional y de documentación.

## Cómo Pedir Un Cambio UI

Formato recomendado para el usuario:

```text
Implementa/ajusta <pantalla o componente>.
Source: <figma-source-key de esta tabla>
Objetivo: <qué debe cambiar>
Mantener: <qué no debe tocarse>
```

Ejemplo:

```text
Ajusta el modal de descripción de objeto.
Source: --inventory-modalWindow-itemDetails
Objetivo: respetar header, precio, regla destacada y descripción.
Mantener: lógica real de inventario y descripciones desde BD.
```

## Workflow Para Agentes

1. Identificar source(s) por nombre en esta tabla.
2. Consultar Figma con `fileKey` + `node-id`.
3. Extraer explícitamente: dimensiones, auto-layout, spacing, tipografías, colores, fills, borders, radios, sombras, variantes, contenido visible y estados.
4. Comparar contra `ui.html` / `style.css` / módulos `src/client`.
5. Implementar sólo el alcance pedido.
6. Validar build/typecheck.
7. Documentar source usado y cualquier aproximación.

## Flows

| Source key | Tipo | Uso | URL |
|---|---|---|---|
| `--flow-characterCreation` | flow | Flujo completo de creación de personaje. Fuente principal para orden, navegación, progreso y pantallas del wizard. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2196-11249&t=FkMjazqyW7luZCmS-11 |

## Screens

| Source key | Tipo | Uso | URL |
|---|---|---|---|
| `--dndCharacterEngine-characters-added` | screen | Home/Personajes con personajes creados, header, CTA y navegación inferior. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2086-825&t=FkMjazqyW7luZCmS-11 |
| `--dndCharacterEngine-character-opened` | screen | Personaje abierto, ficha principal, header, navegación interna y secciones. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2149-20457&t=FkMjazqyW7luZCmS-11 |
| `--dndCharacterEngine-character-equipment` | screen | Tab interno de Equipo. Slots equipados/vacíos y estructura de inventario equipado. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2132-4295&t=FkMjazqyW7luZCmS-11 |
| `--dndCharacterEngine-character-backpack` | screen | Tab interno de Mochila. Carga, monedas, buscador, cards y lista de objetos. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2119-1331&t=FkMjazqyW7luZCmS-11 |
| `--inventory-modalWindow-itemDetails` | screen/modal | Modal de detalle de objeto completo. Usar junto con módulos de item. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2152-30218&t=FkMjazqyW7luZCmS-11 |
| `--characterCreation-generalInformation-empty` | screen | Datos generales vacío. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2184-15476&t=FkMjazqyW7luZCmS-11 |
| `--characterCreation-generalInformation-filled` | screen | Datos generales con información capturada. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2184-15566&t=FkMjazqyW7luZCmS-11 |
| `--characterCreation-raceSelection` | screen | Selección de raza. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2185-16067&t=FkMjazqyW7luZCmS-11 |
| `--characterCreation-raceConfirmation` | screen | Confirmación de raza. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2186-15529&t=FkMjazqyW7luZCmS-11 |
| `--characterCreation-backgroundSelection` | screen | Selección de trasfondo. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2189-15583&t=FkMjazqyW7luZCmS-11 |
| `--characterCreation-backgroundConfirmation-languageSelection-empty` | screen | Confirmación de trasfondo, selección de idioma vacía. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2190-15694&t=FkMjazqyW7luZCmS-11 |
| `--characterCreation-backgroundConfirmation-languageSelection-filled` | screen | Confirmación de trasfondo, selección de idioma llena. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2191-48951&t=FkMjazqyW7luZCmS-11 |
| `--characterCreation-classSelection` | screen | Selección de clase. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2192-2498&t=FkMjazqyW7luZCmS-11 |
| `--characterCreation-equipmentSelection-unselected` | screen/state | Equipamiento sin seleccionar. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2192-2949&t=FkMjazqyW7luZCmS-11 |
| `--characterCreation-equipmentSelection-selected` | screen/state | Equipamiento seleccionado. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2192-3647&t=FkMjazqyW7luZCmS-11 |
| `--characterCreation-spellSelection-unselected` | screen/state | Selección de conjuros sin seleccionar. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2192-3940&t=FkMjazqyW7luZCmS-11 |
| `--characterCreation-spellSelection-selected` | screen/state | Selección de conjuros seleccionada. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2196-3430&t=FkMjazqyW7luZCmS-11 |
| `--characterCreation-attributesConfig-unselected` | screen/state | Configuración de atributos sin seleccionar. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2196-3919&t=FkMjazqyW7luZCmS-11 |
| `--characterCreation-attributesConfig-selected` | screen/state | Configuración de atributos seleccionada. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2196-4197&t=FkMjazqyW7luZCmS-11 |

## Components And Modules

| Source key | Tipo | Uso | URL |
|---|---|---|---|
| `--characterCreation-raceCard` | component | Card de raza en creación. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2185-16066&t=FkMjazqyW7luZCmS-11 |
| `--characterCreation-classCard` | component | Card de clase en creación. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2192-2699&t=FkMjazqyW7luZCmS-11 |
| `--characterCreation-trasfondoCard` | component | Card de trasfondo en creación. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2189-15724&t=FkMjazqyW7luZCmS-11 |
| `--characterCreation-spellCard` | component | Card de conjuro/truco en creación. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2195-3094&t=FkMjazqyW7luZCmS-11 |
| `--characterCreation-itemSelection` | component | Card de selección de item/equipamiento. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2192-3215&t=FkMjazqyW7luZCmS-11 |
| `--character-module-magicAtributes` | module | Bloque de atributos mágicos en ficha. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2149-20370&t=FkMjazqyW7luZCmS-11 |
| `--character-module-hitPoints` | module | Bloque de puntos de golpe. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2149-20445&t=FkMjazqyW7luZCmS-11 |
| `--character-module-characterStats` | module | Métricas de personaje abierto. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2149-20445&t=FkMjazqyW7luZCmS-11 |
| `--character-module-xp` | module | Bloque XP/nivel/progreso. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2149-20445&t=FkMjazqyW7luZCmS-11 |
| `--character-module-inventory` | module | Módulo general de inventario. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2149-29453&t=FkMjazqyW7luZCmS-11 |
| `--character-module-item` | module | Card/módulo de item en inventario. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2149-30045&t=FkMjazqyW7luZCmS-11 |
| `--item-modalWindow-module-item-header` | module | Header interno del modal de item: arte, summary, precio, divider y regla. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2152-3489&t=FkMjazqyW7luZCmS-11 |
| `--layout-modalWindow` | layout | Layout general de modal full-screen. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2152-3461&t=FkMjazqyW7luZCmS-11 |
| `--item-module-description` | module | Cuerpo/caja de descripción de objeto. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2152-3480&t=FkMjazqyW7luZCmS-11 |
| `--character-module-bio` | module | Biografía de personaje abierto. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2149-20711&t=FkMjazqyW7luZCmS-11 |
| `--home-characters-characterCard` | component | Card de personaje en roster/home. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2146-19925&t=FkMjazqyW7luZCmS-11 |
| `--character-characterSheet` | component/screen | Sheet principal de personaje abierto. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2149-20456&t=FkMjazqyW7luZCmS-11 |

## Navigation

| Source key | Tipo | Uso | URL |
|---|---|---|---|
| `--navigation-tabs` | component | Tabs internos de personaje/inventario. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2149-28964&t=FkMjazqyW7luZCmS-11 |
| `--navigation-navbar` | component | Navbar inferior principal. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2149-24406&t=FkMjazqyW7luZCmS-11 |

## Atoms

| Source key | Tipo | Uso | URL |
|---|---|---|---|
| `--main-button` | atom | Botón primario regular. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2146-19941&t=FkMjazqyW7luZCmS-11 |
| `--secondary-button` | atom | Botón secundario regular. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2147-19989&t=FkMjazqyW7luZCmS-11 |
| `--mini-button-main` | atom | Botón primario mini. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2147-20011&t=FkMjazqyW7luZCmS-11 |
| `--mini-button-secondary` | atom | Botón secundario mini. Normalizado desde la entrada original con guion largo. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2147-19989&t=FkMjazqyW7luZCmS-11 |
| `--text-button` | atom | Botón de texto. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2149-20059&t=FkMjazqyW7luZCmS-11 |
| `--atom-checkbox` | atom | Checkbox 24px usado en selección. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2192-3392&t=FkMjazqyW7luZCmS-11 |
| `--atom-separator` | atom | Divider/separador rojo. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2148-20031&t=FkMjazqyW7luZCmS-11 |
| `--atom-border` | atom | Borde decorativo/card strip. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2149-20422&t=FkMjazqyW7luZCmS-11 |
| `--sectionHeader` | atom | Header de sección. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2149-20077&t=FkMjazqyW7luZCmS-11 |
| `--atom-tab` | atom | Tab individual. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2149-24361&t=FkMjazqyW7luZCmS-11 |
| `--atom-caret` | atom | Caret de expandir/colapsar. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2149-29977&t=FkMjazqyW7luZCmS-11 |
| `--atom-tag` | atom | Tag/chip de estado o metadato. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2149-29985&t=FkMjazqyW7luZCmS-11 |
| `--alerts-notification` | atom/component | Toast/alerta/notificación. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2149-20313&t=FkMjazqyW7luZCmS-11 |
| `--atom-input` | atom | Input base y campos compuestos. | https://www.figma.com/design/kwyCppseLygq4bUhYdFD7j/DnD-Character-Engine?node-id=2182-16894&t=FkMjazqyW7luZCmS-11 |

## Pendientes Por Completar

Estos flujos existen en requerimientos/HANDOFF pero no estaban en el `.docx` inicial. Agregar URL exacta cuando el usuario confirme el source actual:

| Source pendiente | Motivo |
|---|---|
| `--flow-dice-attack` | Flujo `Lanzar Dado` / ataque. |
| `--flow-dice-spell` | Flujo de lanzamiento de conjuro. |
| `--flow-story-resolution` | Flujo `Resolución de historia`. |
| `--modal-hitPoints-adjust` | Modal de ajuste de puntos de golpe. Docs mencionan nodos `2052:305` / `2052:472`, confirmar si siguen vigentes. |
| `--screen-character-skills` | Tab Habilidades y tiradas de salvación. |
| `--screen-character-spells` | Tab Conjuros y trucos. |
| `--screen-character-journal` | Tab Diario. |
| `--screen-shop` | Tienda/objetos global, si existe en el Figma actual. |
| `--screen-glossary` | Glosario/reglas, si existe en el Figma actual. |
| `--screen-races-classes` | Razas y clases global, si existe en el Figma actual. |

## Checklist De Extracción De Specs

Al consultar un source, completar en notas de implementación:

- Node usado.
- Captura/screenshot revisado.
- Medidas principales: ancho, alto, padding, gap, radius.
- Tipografías: familia, tamaño, peso, line-height.
- Colores: texto, fondo, borde, divider, estados.
- Auto-layout: dirección, alignment, constraints, hug/fill/fixed.
- Estados/variantes: selected, disabled, empty, filled, collapsed, expanded.
- Copy visible en español.
- Componentes hijos usados.
- Diferencias aceptadas o pendientes.
