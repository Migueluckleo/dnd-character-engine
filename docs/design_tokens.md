# Design Tokens

Contrato vivo de tokens visuales derivados del Figma `DnD Character Engine`.

Fuente primaria: `docs/figma_sources.md`.

## Regla

Todo valor visual repetible debe vivir como token o usar una clase canónica existente. Evitar valores sueltos nuevos en `style.css` salvo que el source Figma haya sido revisado y el token quede documentado aquí.

## Colores

| Token | Valor actual | Uso | Source / certeza |
|---|---:|---|---|
| `--figma-color-brand-primary` | `#720000` | Titulares rojos, CTA primario, close button, iconos fallback, dividers brand | Confirmado por requirements/HANDOFF y uso actual en CSS |
| `--figma-color-brand-primary-dark` | `#4f0000` | Estados oscuros del rojo brand | CSS actual |
| `--figma-color-divider-red` | `#7f1d1d` | Dividers rojos/degradados | CSS actual; validar contra `--atom-separator` |
| `--figma-color-border-brown` | `#76532e` | Bordes de cards/inputs/secciones | Figma requirements US-113 |
| `--figma-color-surface-brown` | `#64422b` | Superficies marrón medio | CSS actual |
| `--figma-color-surface-brown-dark` | `#462f20` | Superficies marrón oscuro | CSS actual |
| `--figma-color-accent-gold` | `#92752b` | Bordes/acento dorado | Figma requirements US-113 |
| `--figma-color-accent-cream` | `#ffd7ad` | Texto/acento claro en superficies oscuras | CSS actual |
| `--figma-color-text-primary` | `#090604` | Texto principal | CSS actual |
| `--figma-color-text-muted` | `#6f5d4e` | Texto secundario | CSS actual |
| `--figma-color-text-inverse` | `#fff4dc` | Texto sobre rojo/marrón | CSS actual |
| `--figma-color-paper-base` | `#f7f1df` | Fondo parchment base | CSS actual |
| `--figma-color-paper-shadow` | `#efe6d1` | Fondo/papel sombreado | CSS actual |
| `--figma-color-image-border` | `#bbbbbb` | Bordes de imagen/item art | CSS actual |
| `--figma-color-card-strip` | `rgba(231,154,68,.62)` | Tiras decorativas de cards | CSS actual; requirements menciona `.7` |
| `--figma-color-brand-wash` | `rgba(114,0,0,.10)` | Wash rojo suave, iconos fallback | CSS actual / fix inventario |

## Tipografía

| Token | Valor actual | Uso | Source / certeza |
|---|---|---|---|
| `--figma-font-heading` | `"Prata", Georgia, serif` | Títulos display, headers especiales | CSS actual |
| `--figma-font-serif` | `"Source Serif Pro", "Source Serif 4", Georgia, serif` | Cards, botones, títulos de card | Requirements US-113 |
| `--figma-font-primary` | `"Source Sans 3", "Roboto", Arial, sans-serif` | Body, metadata, textos operativos | Requirements US-113 |
| `--figma-font-data` | `"Roboto", Arial, sans-serif` | Métricas, valores numéricos | Requirements US-113 |

## Tamaños Tipográficos

| Token | Valor actual | Uso |
|---|---:|---|
| `--figma-font-size-xxs` | `10px` | Mini buttons, metadata compacta |
| `--figma-font-size-xs` | `12px` | Tabs, labels pequeños |
| `--figma-font-size-sm` | `14px` | Body pequeño, atributos |
| `--figma-font-size-md` | `16px` | Body y botones regulares |
| `--figma-font-size-lg` | `20px` | Títulos de cards |
| `--figma-font-size-xl` | `24px` | Headers medianos |
| `--figma-font-size-display` | `32px` | Títulos grandes de modal/sección |
| `--figma-font-size-auth-title` | `44px` | Auth title |

## Espaciado

| Token | Valor actual | Uso |
|---|---:|---|
| `--figma-space-3xs` | `2px` | Ajustes mínimos |
| `--figma-space-xxs` | `4px` | Gaps muy compactos |
| `--figma-space-xs` | `8px` | Gaps pequeños, padding mini |
| `--figma-space-sm` | `12px` | Padding compacto |
| `--figma-space-md` | `16px` | Padding base mobile |
| `--figma-space-lg` | `24px` | Separación media |
| `--figma-space-xl` | `32px` | Ritmo vertical principal |
| `--figma-space-2xl` | `48px` | Separación amplia |

## Medidas

| Token | Valor actual | Uso | Source / certeza |
|---|---:|---|---|
| `--figma-screen-width` | `390px` | Frame mobile Figma | Requirements US-146 |
| `--figma-screen-height` | `844px` | Frame mobile Figma | CSS actual |
| `--figma-nav-height` | `73px` | Navbar inferior | CSS actual |
| `--figma-card-width` | `358px` | Cards principales mobile | Requirements US-113 |
| `--figma-card-strip-height` | `5px` | Card strips | Requirements US-113 |
| `--figma-control-height` | `44px` | Inputs/controles regulares | CSS actual |
| `--figma-button-regular-height` | `44px` | Botón regular | Figma specs/HANDOFF |
| `--figma-button-mini-height` | `24px` | Botón mini | Figma specs/HANDOFF |
| `--figma-button-close-size` | `32px` | Close button | Figma specs/HANDOFF |
| `--figma-item-art-sm` | `64px` | Item art card | CSS actual |
| `--figma-item-art-md` | `118px` | Item art modal | CSS actual |

## Radios Y Sombras

| Token | Valor actual | Uso |
|---|---:|---|
| `--figma-radius-control` | `4px` | Botones, inputs |
| `--figma-radius-card` | `8px` | Cards |
| `--figma-radius-tab` | `9px` | Tabs |
| `--figma-radius-drawer` | `10px` | Modal/sheet |
| `--figma-radius-image` | `16px` | Imagen de personaje |
| `--figma-shadow-card` | `0 4px 2px rgba(0,0,0,.10)` | Cards |
| `--figma-shadow-nav` | `0 -4px 2px rgba(0,0,0,.10)` | Navbars |
| `--figma-shadow-drawer` | `0 -4px 12px rgba(0,0,0,.12)` | Modales |

## Assets Locales

| Token / uso | Asset | Regla |
|---|---|---|
| Page background | `src/images/page bg.png` | Usar en Home/wizard/páginas parchment |
| Sheet background | `src/images/ficha bg.png` | Usar en personaje abierto |
| Card background | `src/images/dnd_card_bg.png` | Usar en cards parchment |
| Item images | `src/images/items/*` | Resolver vía Vite/imports, no usar URLs Figma runtime |

## Pendiente De Extracción

- Confirmar todos los tokens con Figma MCP node por node.
- Documentar variables nativas de Figma si existen.
- Consolidar diferencias entre `--figma-color-card-strip` `.62` y requirements `.7`.
- Extraer estados disabled/focus/pressed/selected de botones, tabs, inputs y cards.

