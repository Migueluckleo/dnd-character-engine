# Card Contracts

Contratos especificos para cards, porque son el patron visual mas repetido del producto.

Usar junto con `docs/figma_sources.md`, `docs/design_tokens.md` y `docs/component_contracts.md`.

## Regla General

Toda card debe declarar:

- Figma source.
- Node.
- Variants.
- Implementation mapping.
- Content contract.
- Data contract.
- Rules.
- Anti-patterns.
- Pending extraction.

Si una card tiene source Figma, no se debe inventar spacing, color, tipografia, jerarquia, contenido visible ni acciones. Si falta una variante, se marca pendiente antes de implementar una interpretacion nueva.

## Home Character Card

Figma source:

- `--home-characters-characterCard`

Node:

- `2146:19925`

Variants:

- Default / created character
- Dead character
- Empty roster state (screen-level, not same component)
- Menu closed
- Menu open
- Long biography
- Missing biography fallback

Implementation mapping:

- Renderer = `renderRosterCard(c)` in `ui.html`
- Card root = `.roster-card`
- Title row = `.rc-title-row`
- Name = `.rc-name`
- Menu wrapper = `.rc-menu`
- Menu button = `.rc-menu-btn`
- Menu actions = `.rc-actions`
- Race/class line = `.rc-sub`
- Divider = `.figma-red-divider.rc-divider`
- Quick metrics = `.rc-quick`
- Biography = `.rc-bio`
- Dead badge = `.rc-dead`

Content contract:

- Name.
- Race and class in Spanish.
- Red divider.
- Quick metrics: CA, speed, current HP, level.
- Biography from personality traits, ideals, bonds and flaws.
- Fallback biography only when all biography fields are empty.
- Three-dot menu for edit/delete.

Data contract:

- Name from character API.
- Race label must use `RACE_NAME_ES` before raw catalog value.
- Class label must use `CLASS_NAME_ES` before raw catalog value.
- Armor class from hydrated/computed value, then unarmored fallback.
- Speed from race base speed.
- HP from `current_hp`.

Rules:

- Edit and Delete live inside the three-dot menu.
- Do not show permanent Edit/Delete buttons on the card surface.
- Use the Figma red divider treatment, not a generic border.
- Long names and long biographies must remain contained in the card.
- Tapping the card opens the character; tapping menu actions must stop propagation.

Anti-patterns:

- No English race/class labels when Spanish maps exist.
- No emoji for combat metrics if a local icon/SVG exists.
- No visible destructive action outside the menu.
- No replacing biography with placeholder copy when API fields exist.

Pending extraction:

- Exact menu open positioning from Figma.
- Exact dead-state visual from Figma.
- Mobile overflow measurements for very long character names.

## Inventory Item Card

Figma source:

- `--character-module-item`

Node:

- `2149:30045`

Variants:

- Collapsed
- Expanded
- Equipped
- Attuned
- Compact equipped slot
- Usable
- Pack / kit
- Missing local image fallback
- Empty description fallback

Implementation mapping:

- Renderer = `renderInventoryItemCard(inv, options = {})`
- Card root = `.inventory-item-card`
- Compact slot variant = `.inventory-slot-card`
- Collapsed state = `.collapsed`
- Header = `.inventory-item-head`
- Quantity = `.inventory-qty`
- Title block = `.inventory-item-title`
- Header status = `.inventory-head-status`
- Caret = `.caret-btn.inventory-collapse-btn` + `.caret-icon`
- Body = `.inventory-card-body`
- Detail rows = `.inventory-detail-line`
- Status row = `.inventory-status-row`
- Actions = `.inventory-card-actions`
- Secondary actions = `.secondary-btn-mini`
- Primary compact action = `.primary-btn-mini`
- Equip active action = `.ghost-btn-mini.equipped`
- Item art/fallback = `itemImageHtml(item, name)`

Content contract:

- Quantity.
- Item name in Spanish through `itemLabel`.
- Item type in Spanish through `itemTypeLabel`.
- Equipped/attuned status in Spanish.
- Caret for expand/collapse.
- Damage, attribute chips, price and weight when available.
- Description from database/catalog through `itemDescription`.
- Actions: Eliminar, Vender, Usar, Abrir kit, Equipar or Desequipar.

Data contract:

- Item object comes from `inv.item`, `itemByName(inv.item_id)`, or item catalog fallback.
- Labels must go through helper maps/functions before raw catalog keys.
- Description must come from catalog/database helper, not from card-local hardcoded copy.
- Row details must use `inventoryCardRows(item)` helper when available.
- Fallback item art must be generated locally and use brand red.

Rules:

- Cards are collapsed by default.
- Tapping the card opens the item description modal.
- The caret only expands/collapses the inline card.
- Buttons inside the card must stop propagation.
- Fallback icons for weapons, shields, rings, potions and gear use brand red `#720000`, not yellow/gold.
- Text labels must be Spanish: `Arma`, `Armadura`, `Escudo`, `Pocion`, `Objeto magico`, `Atributo`, `Precio`, `Peso`.

Anti-patterns:

- No raw English values like `Chain Mail`, `armor`, `weapon`, `shield`, `ring`, `wondrous item` if a Spanish helper exists.
- No yellow/gold fallback icons for equipment categories.
- No empty image box when no local asset exists.
- No replacing database descriptions with generic placeholder text.
- No action button that also opens the modal by propagation.

Pending extraction:

- Exact expanded/collapsed heights from Figma.
- Exact equipped/attuned chip colors.
- Exact compact equipped-slot variant.

## Catalog Item Card

Figma source:

- `--character-module-item`
- `--dndCharacterEngine-character-backpack`

Nodes:

- Item module: `2149:30045`
- Backpack screen: `2119:1331`

Variants:

- Catalog result
- Filtered result
- Search result
- Quantity selection handoff
- Missing image fallback

Implementation mapping:

- Renderer = `renderInventoryCatalogCard(item)`
- Catalog list = `.inventory-catalog-list`
- Card root = `.inventory-item-card.inventory-catalog-card`
- Header = `.inventory-item-head`
- Art/fallback = `itemImageHtml(item, itemLabel(item.name))`
- Title = `.inventory-item-title`
- Filter/status chip = `.inventory-status-row`
- Item chips = `.equipment-chip-row`
- CTA = `.primary-btn-mini`
- Quantity screen = `openInventoryQuantityScreen(item.item_id)`

Content contract:

- Item art or red fallback icon.
- Type in Spanish.
- Name in Spanish.
- Category/filter chip in Spanish.
- Attribute chips.
- Description.
- CTA `Agregar`.

Data contract:

- Results come from `/catalog/items`.
- Search must match Spanish label and raw catalog name.
- Filters must use `INVENTORY_FILTER_LABELS`.
- Quantity default uses `ammunitionBundleSize(item) || 1`.

Rules:

- Use the same item visual language as inventory cards.
- `Agregar` opens quantity selection, not immediate silent add.
- Catalog card content must not diverge from inventory card naming helpers.
- Long descriptions must stay contained.

Anti-patterns:

- No separate visual system for catalog cards.
- No raw English category chips.
- No Figma asset URLs at runtime.

Pending extraction:

- Exact catalog-list gap and max visible rows from Figma.
- Empty search state source.

## Equipment Selection Card

Figma source:

- `--characterCreation-itemSelection`
- `--characterCreation-equipmentSelection-unselected`
- `--characterCreation-equipmentSelection-selected`

Nodes:

- Item selection component: `2192:3215`
- Unselected state screen: `2192:2949`
- Selected state screen: `2192:3647`

Variants:

- Unselected
- Selected
- Single-choice group
- Pack / kit contents
- Multiple quantity option
- Missing catalog item fallback

Implementation mapping:

- Screen renderer = `wizPdfEquipmentHTML()`
- Group renderer = `wizEquipmentGroupHTML(group)`
- Card renderer = `wizEquipmentOptionHTML(group, option, selected)`
- Group root = `.equipment-group`
- Group header = `.equipment-group-head`
- Card list = `.equipment-card-list`
- Card root = `.equipment-option`
- Selected state = `.equipment-option.selected`
- Main row = `.equipment-option-main`
- Checkbox atom = `.equipment-check`
- Title = `.equipment-option-title`
- Pack grid = `.equipment-pack-grid`
- Item chips = `.equipment-chip-row`

Content contract:

- Checkbox.
- Type label.
- Option label.
- Badge.
- Description.
- Pack contents when item is a pack.
- Chips when item is not a pack.
- Group progress: selected count / required count.

Data contract:

- Class equipment comes from `equipmentGroupsForClass(c)`.
- Item details are resolved through `itemByName(entry.name)`.
- Description uses `itemDescription(first)`.
- Type label uses `itemTypeLabel(first)`.

Rules:

- Selecting a card updates wizard state and rerenders the group.
- Selected state must be visually distinct beyond checkbox text.
- Pack contents must be shown as structured contents, not as one raw paragraph.
- Missing catalog item must not crash the screen.

Anti-patterns:

- No native browser checkbox styling if Figma checkbox atom is expected.
- No English equipment type labels.
- No hidden group progress.

Pending extraction:

- Exact selected border/fill from Figma.
- Exact checkbox atom dimensions beyond the 24px contract.
- Multi-select group variant if Figma has it.

## Race Card

Figma source:

- `--characterCreation-raceCard`
- `--characterCreation-raceSelection`

Nodes:

- Race card: `2185:16066`
- Race selection screen: `2185:16067`

Variants:

- Unselected
- Selected
- Family group
- Review/confirmation
- Long trait list

Implementation mapping:

- Selection renderer = `wizPdfRaceHTML()`
- Group renderer = `raceFamilyGroupsHTML(wiz.catalog.races)`
- Option card = `.wiz-option-card`
- Selected state = `.wiz-option-card.selected`
- Review card = `.review-card`
- Name = `.oc-name`
- Badges = `.oc-badges` / `.oc-badge`
- Description = `.oc-desc`

Content contract:

- Race name in Spanish.
- Family/group presentation when relevant.
- Ability bonuses.
- Speed.
- Darkvision if present.
- Race description.

Data contract:

- Race catalog comes from `/catalog/races`.
- Names use `RACE_NAME_ES`.
- Descriptions use `RACE_DESC`.
- Stat labels use `STAT_NAMES`.
- Catalog keys may arrive as snake_case (`high_elf`) or display names (`High Elf`); UI must normalize through `catalogLookupKey()` before falling back to raw text.

Rules:

- Race selection auto-advances to race review after selection.
- Family grouping must preserve related variants together.
- Missing descriptions use a neutral Spanish fallback.

Anti-patterns:

- No raw race names if Spanish map exists.
- No splitting race families into unrelated visual groups.
- No unbounded trait text overflowing card width.

Pending extraction:

- Exact selected card treatment.
- Exact family header treatment.

## Class Card

Figma source:

- `--characterCreation-classCard`
- `--characterCreation-classSelection`

Nodes:

- Class card: `2192:2699`
- Class selection screen: `2192:2498`

Variants:

- Unselected
- Selected
- Spellcasting class
- Non-spellcasting class
- Review/confirmation
- Subclass unlocked

Implementation mapping:

- Selection renderer = `wizPdfClassHTML()`
- Option card = `.wiz-option-card`
- Selected state = `.wiz-option-card.selected`
- Name = `.oc-name`
- Badges = `.oc-badges` / `.oc-badge`
- Review = `.review-card.class-summary-card`
- Subclass grid = `#wiz-subclass-grid`

Content contract:

- Class name in Spanish.
- Hit die.
- Spellcasting ability when available.
- Role/description.
- Subclass options when unlocked by level.

Data contract:

- Class catalog comes from `/catalog/classes`.
- Names use `CLASS_NAME_ES`.
- Descriptions/roles use `CLASS_DESC`.
- Stat labels use `STAT_NAMES`.
- Catalog keys may arrive as snake_case (`fighter`) or display names (`Fighter`); UI must normalize through `catalogLookupKey()` before falling back to raw text.

Rules:

- Changing class clears dependent choices: skills, cantrips, spells, subclass and cached spell class.
- Selected class auto-advances to class review.
- Spellcasting classes must show magic badge; non-spellcasters show hit die.

Anti-patterns:

- No stale spell/cantrip selections after class change.
- No raw class names if Spanish map exists.
- No hiding hit die.

Pending extraction:

- Exact spellcaster/non-spellcaster visual distinction.
- Exact subclass card source if separate in Figma.

## Background Card

Figma source:

- `--characterCreation-trasfondoCard`
- `--characterCreation-backgroundSelection`

Nodes:

- Background card: `2189:15724`
- Background selection screen: `2189:15583`

Variants:

- Unselected
- Selected
- Review/confirmation
- Language selection empty
- Language selection filled

Implementation mapping:

- Selection renderer = `wizPdfBackgroundHTML()`
- Review renderer = `wizPdfBackgroundReviewHTML()`
- Option card = `.wiz-option-card`
- Selected state = `.wiz-option-card.selected`
- Name = `.oc-name`
- Badges = `.oc-badges` / `.oc-badge`
- Description = `.oc-desc`
- Review = `.review-card`

Content contract:

- Background name in Spanish.
- Skill proficiencies in Spanish.
- Language choice count when available.
- Background description.

Data contract:

- Background catalog comes from `/catalog/backgrounds`.
- Names use `BG_NAME_ES`.
- Descriptions use `BG_DESC`.
- Skill labels use `SKILL_NAMES` or local `skillMap`.
- Catalog keys may arrive as snake_case (`folk_hero`) or display names (`Folk Hero`); UI must normalize through `catalogLookupKey()` before falling back to raw text.

Rules:

- Background selection auto-advances to background review.
- Language selection states must match the dedicated Figma screens.
- Empty language choices must still explain the state in Spanish.

Anti-patterns:

- No raw skill IDs such as `athletics`, `history`, `persuasion`.
- No English background names if Spanish map exists.
- No skipping the background review screen.

Pending extraction:

- Exact language selector card/field contract.
- Exact filled/empty language state details.

## Spell Card

Figma source:

- `--characterCreation-spellCard`
- `--characterCreation-spellSelection-unselected`
- `--characterCreation-spellSelection-selected`

Nodes:

- Spell card: `2195:3094`
- Spell selection unselected: `2192:3940`
- Spell selection selected: `2196:3430`

Variants:

- Cantrip
- Level 1+ spell
- Unselected
- Selected
- Concentration
- Long components
- No spells for selected class

Implementation mapping:

- Spell screen renderer = `wizPdfCantripsHTML()`
- Choice block = `spellChoiceBlock(...)`
- Selected state = wizard spell selection state
- Empty state = `.card` / `.detail-empty` depending screen

Content contract:

- Spell name.
- School and level.
- Casting metadata.
- Components.
- Concentration/ritual if present.
- Description.
- Selected/prepared state.

Data contract:

- Cantrips come from `/catalog/spells?class=<class>&level=0`.
- Class spells come from `/catalog/spells?class=<class>`.
- Available spells are filtered by wizard max spell level.
- Selection count uses class and level rules.

Rules:

- Cantrips and levelled spells are separate sections.
- The screen must show an explicit empty state for classes with no initial spell choices.
- Selected state must survive rerender while the same class is selected.

Anti-patterns:

- No spells above accessible level.
- No stale spells after class change.
- No hidden concentration/component metadata.

Pending extraction:

- Exact selected/unselected spell-card visuals.
- Exact spell metadata row order from Figma.

## Future Card Contracts

Agregar contratos con el mismo formato cuando existan Figma sources confirmados:

- Dice roll cards.
- Skills/saving throw cards.
- Spell detail cards outside creation.
- Journal cards.
- Shop cards.
- Glossary cards.
- Race/class global browsing cards.
