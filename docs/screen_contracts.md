# Screen Contracts

Contratos por pantalla y flujo. Cada pantalla debe vincular source Figma, módulos usados, datos esperados y QA obligatorio.

Fuente primaria de URLs: `docs/figma_sources.md`.

## Regla

Antes de modificar una pantalla, identificar su contrato aquí y los source keys asociados. Si el contrato no existe, agregarlo antes o durante el cambio.

## Home / Personajes

| Campo | Contrato |
|---|---|
| Source | `--dndCharacterEngine-characters-added` |
| Componentes | `--home-characters-characterCard`, `--main-button`, `--navigation-navbar` |
| Código actual | `ui.html` roster, `style.css` New Style home |
| Datos visibles | Usuario, email, lista de personajes, CTA `Agregar nuevo personaje` |
| Reglas | Card: nombre, raza/clase, divider rojo, métricas, biografía, menú de tres puntos. CTA full-width 358px. |
| QA | Validar empty state, personajes existentes, logout, CTA, nav activa, texto no roto en mobile. |

## Personaje Abierto / Ficha

| Campo | Contrato |
|---|---|
| Source | `--dndCharacterEngine-character-opened`, `--character-characterSheet` |
| Componentes | `--character-module-xp`, `--character-module-characterStats`, `--character-module-magicAtributes`, `--character-module-hitPoints`, `--character-module-bio`, `--navigation-tabs`, `--navigation-navbar` |
| Código actual | `ui.html` detail sheet, `style.css` character detail |
| Datos visibles | Header, XP/nivel, CA, Velocidad, B. Competencia, imagen, atributos, magia, PG, biografía |
| Reglas | Orden Figma: XP -> métricas -> penalización opcional -> imagen/atributos -> magia -> PG. Atributos: `FUE`, `DES`, `CON` / `INT`, `SAB`, `CAR`. |
| QA | Validar con/sin imagen, con/sin penalización sigilo, nombre largo, nivel 1/20, HP actuales/temp. |

## Inventario / Equipo

| Campo | Contrato |
|---|---|
| Source | `--dndCharacterEngine-character-equipment` |
| Componentes | `--character-module-inventory`, `--character-module-item`, `--atom-caret`, `--atom-tag` |
| Código actual | `renderInventoryEquipmentView`, `renderInventorySlotCard`, `renderInventoryItemCard` |
| Datos visibles | Slots equipados y vacíos, arma primaria/secundaria, escudo, armadura, botas, guantes, anillos, amuleto |
| Reglas | Empty slots con estado punteado Figma. Cards colapsadas por defecto. Tocar card abre modal `Descripción`. |
| QA | Validar equipo vacío, equipo completo, escudo/armadura, acciones equipar/desequipar y español en labels. |

## Inventario / Mochila

| Campo | Contrato |
|---|---|
| Source | `--dndCharacterEngine-character-backpack` |
| Componentes | `--character-module-inventory`, `--character-module-item`, `--atom-input`, `--main-button` |
| Código actual | `renderInventoryBackpackView`, `renderInventoryAddObjectScreen`, `inventoryCatalogResultsHTML` |
| Datos visibles | Carga, monedas PO/PP/PC, buscador, cards de objetos, botón buscar |
| Reglas | Subtab inicial de inventario debe ser Mochila. CTA `Agregar objeto` vive en header superior. |
| QA | Buscar objeto, filtros, cantidad, descripciones, imágenes, fallback icon rojo, refresh móvil. |

## Modal De Detalle De Objeto

| Campo | Contrato |
|---|---|
| Source | `--inventory-modalWindow-itemDetails` |
| Componentes | `--layout-modalWindow`, `--item-modalWindow-module-item-header`, `--item-module-description`, `--mini-button-main` |
| Código actual | `openItemDescriptionDrawer`, `itemImageHtml`, `itemDescription` |
| Datos visibles | Título `Descripción`, arte, nombre, tipo/rareza, precio, regla destacada, descripción completa |
| Reglas | No bottom drawer. Header debe agrupar arte + summary; precio no debe ser columna desconectada. Texto siempre en español si existe mapping. |
| QA | Validar items con imagen local, fallback icon, rareza, descripción BD, pack, arma, armadura, anillo. |

## Creación De Personaje

| Campo | Contrato |
|---|---|
| Source | `--flow-characterCreation` |
| Screens | Todos los `--characterCreation-*` |
| Componentes | Race/class/background/spell/item cards, checkbox, inputs, buttons |
| Código actual | Wizard en `ui.html`, estilos wizard en `style.css` |
| Reglas | Orden aprobado: Datos generales -> Raza -> Confirmación Raza -> Trasfondo -> Confirmación Trasfondo -> Personalidad -> Clase -> Confirmación/Subclase -> Equipamiento -> Habilidades/Conjuros -> Atributos -> ASI -> PG. |
| QA | Validar flujo completo por clase, estados selected/unselected, progreso, botón siguiente, textos largos y mobile 390px. |

## Pendientes

Crear contratos cuando el usuario confirme sources:

- Dados: ataque, conjuro, resolución de historia.
- HP modal.
- Habilidades.
- Conjuros.
- Diario.
- Tienda.
- Glosario.
- Razas y clases global.

