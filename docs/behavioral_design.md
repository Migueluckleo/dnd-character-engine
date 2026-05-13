# Behavioral Design — DnD Character Engine

> **Fuente de verdad para experiencia de usuario.**
> Este archivo se actualiza automáticamente en cada deployment o nueva integración.
> No incluye detalles técnicos de implementación.
>
> **Generación del .docx:** ejecutar `python3 scripts/build_behavioral_design.py`

---

## Versión

| Campo | Valor |
|---|---|
| Versión | 1.0 |
| Última actualización | Mayo 2026 |
| Mantenido por | Claude / Codex (automático) |

---

## Principios de diseño

1. **Reglas sin fricción.** Las reglas de DnD se aplican automáticamente en segundo plano; el jugador nunca calcula.
2. **Rol primero.** Las animaciones, los textos y los flujos están diseñados para reforzar el teatro de la mesa, no para parecer una hoja de cálculo.
3. **Transparencia total.** Cada total de ataque, bonificador de habilidad o cálculo de puntos de golpe muestra su razonamiento desglosado.
4. **Mobile-first, sesión-ready.** La interfaz está diseñada para usarse con una sola mano mientras se juega. Las acciones más frecuentes requieren el mínimo de toques posible.
5. **Idioma del jugador.** Toda la UI está en español. Los nombres de ítems, conjuros, clases y razas usan el vocabulario reconocido por la comunidad hispanohablante de DnD.

---

## ÁREA 1 — Perfil de jugador

> **JOB TO BE DONE:** Quiero tener un espacio propio donde mis personajes sean solo míos y pueda acceder desde cualquier dispositivo sin perder datos entre sesiones.

### US-132 — Registro e inicio de sesión
*Como jugador, quiero crear un perfil y acceder a él con mis credenciales para que mis personajes sean privados y estén disponibles desde cualquier dispositivo.*

**Criterios de aceptación:**
- AC 132.1: La pantalla de bienvenida ofrece dos opciones visibles: Crear cuenta y Entrar. Si no hay sesión activa, es la primera pantalla que ve el usuario.
- AC 132.2: El registro solicita correo electrónico, contraseña y, opcionalmente, un nombre visible que aparecerá en la plataforma.
- AC 132.3: La contraseña exige mínimo diez caracteres. El campo muestra un contador o indicador mientras se escribe.
- AC 132.4: Al iniciar sesión correctamente, el usuario llega directamente al roster de sus personajes sin pasos adicionales.
- AC 132.5: La sesión persiste entre cierres de la app. El usuario no necesita volver a iniciar sesión en cada visita.
- AC 132.6: El encabezado del roster muestra el nombre visible del perfil activo y un control de Cerrar sesión.
- AC 132.7: Si el usuario intenta ver o modificar un personaje que no le pertenece, recibe un mensaje de error en español sin exposición de datos ajenos.
- AC 132.8: Los errores de credenciales incorrectas se comunican con un mensaje concreto, nunca con un estado de carga infinita.

---

## ÁREA 2 — Creación de personaje

> **JOB TO BE DONE:** Quiero crear un personaje de DnD 5e siguiendo las reglas del manual sin tener que memorizarlas.

### US-90 / US-112 — Flujo de creación paso a paso
*Como jugador nuevo o experimentado, quiero un asistente de creación que me guíe paso a paso para no cometer errores en la aplicación de reglas.*

**Criterios de aceptación:**
- AC 90.1: El asistente presenta los pasos en el orden correcto: datos generales → raza → trasfondo → clase → subclase (si aplica al nivel elegido) → atributos → conjuros (si aplica) → equipamiento → PG iniciales.
- AC 90.2: El botón de avanzar permanece deshabilitado hasta que la pantalla actual tenga selecciones válidas.
- AC 90.3: Cada selección avanza automáticamente a la pantalla de revisión de esa elección, sin necesidad de tocar un botón adicional.
- AC 90.4: Una barra o indicador de progreso visible en el encabezado muestra en qué paso está el jugador y cuántos quedan.
- AC 90.5: El botón Atrás en el encabezado permite retroceder al paso anterior sin perder las elecciones ya realizadas en pasos anteriores.
- AC 90.6: La pantalla de revisión de cada selección muestra el nombre, la descripción y los atributos relevantes de lo elegido.

### US-135 — Selección de raza agrupada
*Como jugador, quiero ver las variantes de raza agrupadas por familia para encontrar lo que busco sin escanear una lista plana.*

**Criterios de aceptación:**
- AC 135.1: Las razas aparecen agrupadas: enanos, elfos, medianos, gnomos, humanos, semielfo, semiork, tiefling, dracónido.
- AC 135.2: Las variantes de elfo siempre aparecen juntas en el orden: Drow, Elfo Alto, Elfo del Bosque.
- AC 135.3: El card de raza seleccionada muestra los bonificadores raciales, idiomas, velocidad, tamaño y rasgos principales.

### US-136 — Recomendación de atributos
*Como jugador que no conoce todas las builds, quiero que la app me sugiera cómo distribuir mis atributos según mi clase para empezar con una build viable.*

**Criterios de aceptación:**
- AC 136.1: La pantalla de atributos muestra una distribución recomendada antes de los controles manuales.
- AC 136.2: La recomendación explica en español por qué prioriza cada atributo, mencionando la clase y el trasfondo seleccionados.
- AC 136.3: El jugador puede aplicar la recomendación con un toque o ignorarla y distribuir manualmente.
- AC 136.4: Los controles de Point Buy muestran siempre el valor final con el bono racial sumado y el valor base por separado.

### US-116 — Tirada de puntos de golpe al crear
*Como jugador, quiero lanzar el dado de vida de mi personaje al crearlo para que sus PG iniciales tengan el drama de la tirada.*

**Criterios de aceptación:**
- AC 116.1: El último paso antes de finalizar la creación muestra el dado de vida de la clase con un botón de Lanzar.
- AC 116.2: El dado se anima visualmente antes de mostrar el resultado. El jugador ve el resultado de la tirada, el modificador de Constitución y el total de PG.
- AC 116.3: El botón de crear personaje permanece deshabilitado hasta que el dado haya sido lanzado.

### US-121 — Creación de personaje de nivel alto
*Como jugador que empieza una campaña en nivel 5 u 8, quiero que el asistente escale las elecciones de subclase, atributos y conjuros automáticamente al nivel elegido.*

**Criterios de aceptación:**
- AC 121.1: Si la clase del personaje desbloquea subclase antes del nivel inicial elegido, el paso de subclase aparece obligatoriamente en el wizard.
- AC 121.2: Si el nivel inicial genera mejoras de puntuación de atributo (ASI), aparece un paso dedicado donde el jugador elige los atributos a mejorar.
- AC 121.3: La selección de trucos y conjuros muestra el número correcto de elecciones para el nivel inicial, agrupadas por nivel de conjuro disponible.
- AC 121.4: La previsualización de PG al final usa la Constitución final (incluyendo bonos raciales y ASI) y muestra el cálculo desglosado.

---

## ÁREA 3 — Ficha y estadísticas

> **JOB TO BE DONE:** Quiero consultar las estadísticas de mi personaje de un vistazo durante la partida, sin buscar entre papeles.

### US-117 — Apertura de personaje y ficha principal
*Como jugador en partida, quiero abrir mi personaje y ver sus stats más importantes en una sola pantalla.*

**Criterios de aceptación:**
- AC 117.1: Al tocar una tarjeta de personaje en el roster, se abre su ficha en pantalla completa. La navegación inferior permanece visible.
- AC 117.2: El encabezado muestra el nombre del personaje y un botón Atrás para regresar al roster.
- AC 117.3: La fila de resumen de combate muestra CA, Velocidad, Nivel y Bonificador de competencia como valores destacados.
- AC 117.4: La ficha incluye PG actuales y máximos, PG temporales, atributos base con modificadores y tiradas de salvación.
- AC 117.5: La pestaña de Habilidades muestra las 18 habilidades con su modificador calculado y un indicador visual de si el personaje tiene competencia.
- AC 117.6: La pestaña de Tiradas de salvación está separada de Habilidades. Muestra las 6 tiradas con sus modificadores.

### US-118 — Imagen del personaje
*Como jugador, quiero subir una imagen de mi personaje para que su ficha tenga identidad visual.*

**Criterios de aceptación:**
- AC 118.1: El área de imagen del personaje permite seleccionar una foto del dispositivo.
- AC 118.2: La imagen se adapta al espacio disponible sin distorsión, usando recorte centrado.
- AC 118.3: La imagen persiste entre sesiones y dispositivos del mismo perfil.

### US-119 / US-120 — Roster y acceso rápido
*Como jugador con varios personajes, quiero ver tarjetas compactas en el roster que me digan lo esencial de cada uno.*

**Criterios de aceptación:**
- AC 119.1: Cada tarjeta muestra: raza y clase, nombre, CA, velocidad, PG actuales y nivel en una fila compacta.
- AC 119.2: Los botones Editar y Eliminar están dentro de la tarjeta sin que su uso active la apertura del personaje.
- AC 119.3: El botón Agregar nuevo personaje aparece debajo de la lista. En estado vacío, un CTA grande cubre la pantalla.

### US-125 — Ajuste de puntos de golpe
*Como jugador durante un combate, quiero ajustar mis PG rápidamente cuando recibo daño o me curan.*

**Criterios de aceptación:**
- AC 125.1: El botón Ajustar puntos de golpe abre un modal con controles de menos y más para PG actuales y PG temporales.
- AC 125.2: El modal muestra el estado actual antes de editar para que el jugador no pierda contexto.
- AC 125.3: Los PG actuales no pueden superar el máximo calculado. El sistema aplica el límite automáticamente.
- AC 125.4: Al guardar, la ficha se actualiza inmediatamente con los nuevos valores.

### US-126 — Indicador de carga global
*Como jugador, quiero ver una señal visual cuando la app está cargando o guardando para no perder tiempo tocando botones que no responden.*

**Criterios de aceptación:**
- AC 126.1: Un indicador de carga aparece centrado en pantalla durante cualquier operación de red.
- AC 126.2: El indicador usa el lenguaje visual de la plataforma (marrón, crema, rojo) y es reconocible como estado de espera.
- AC 126.3: Si hay varias operaciones simultáneas, el indicador permanece visible hasta que todas terminen.
- AC 126.4: El indicador informa si se está cargando información o guardando cambios.

---

## ÁREA 4 — Lanzamiento de dados

> **JOB TO BE DONE:** Quiero lanzar dados siguiendo las reglas correctas y compartir el resultado con mi DM sin interrumpir el flujo de la sesión.

### US-130 — Dados 3D animados
*Como jugador, quiero ver un dado tridimensional que gire antes de mostrar el resultado para que la tirada se sienta real.*

**Estado:** ✅ Implementado

**Criterios de aceptación:**
- AC 130.1: Al abrir el panel de tirada, el dado 3D correspondiente al tipo (d4, d6, d8, d10, d12, d20, d100) aparece girando antes de lanzar.
- AC 130.2: Cada tipo de dado tiene su forma geométrica correcta y un color diferenciado.
- AC 130.3: Al pulsar Lanzar dado, el dado gira con aceleración y se detiene mostrando el resultado centrado en la cara.
- AC 130.4: El dado permanece visible con el resultado después de la tirada.
- AC 130.5: El botón de lanzar queda deshabilitado durante la animación. No es posible lanzar dos veces por accidente.
- AC 130.6: Si el dispositivo no soporta animaciones 3D, la tirada funciona igualmente con una animación de respaldo.

### US-128 — Flujo de ataque con arma
*Como jugador en combate, quiero resolver un ataque con arma paso a paso —tirada de ataque, resultado, daño— sin tener que calcular nada.*

**Estado:** ✅ Implementado

**Criterios de aceptación:**
- AC 128.1: Al elegir Ataque, se muestran únicamente las armas equipadas, con el bonificador de ataque calculado visible en la tarjeta.
- AC 128.2: La pantalla de comprobación muestra la fórmula del ataque: d20 + modificador de atributo + competencia (si aplica).
- AC 128.3: Un 20 natural muestra la pantalla de Éxito Rotundo y salta al cálculo de daño con dados duplicados.
- AC 128.4: Un 1 natural muestra la pantalla de Fallo Crítico.
- AC 128.5: Una tirada normal lleva a la pantalla ¿Éxito o fallo? donde el jugador confirma el resultado según la CA del enemigo.
- AC 128.6: La pantalla de daño muestra el total infligido con el razonamiento: dados + modificador + crítico cuando aplica.

### US-144 — Armas arrojadizas: cuerpo a cuerpo o lanzar
*Como jugador con un arma arrojadiza equipada, quiero elegir si la uso en cuerpo a cuerpo o si la lanzo antes de tirar el dado.*

**Estado:** ✅ Implementado

**Criterios de aceptación:**
- AC 144.1: Al seleccionar un arma arrojadiza, aparece una pantalla intermedia con dos opciones: Cuerpo a cuerpo y Lanzar.
- AC 144.2: La opción Cuerpo a cuerpo muestra el alcance estándar de 5 ft.
- AC 144.3: La opción Lanzar muestra el alcance corto y largo del arma según las reglas.
- AC 144.4: En la pantalla de tirada, un indicador muestra el modo elegido para que el jugador y el DM tengan contexto claro.
- AC 144.5: Si el jugador elige Lanzar, se descuenta automáticamente una unidad del arma en el inventario al lanzar el d20.
- AC 144.6: Antes de lanzar el dado, la pantalla informa cuántas unidades quedan del arma y avisa que se descontará una al lanzar.
- AC 144.7: El botón Atrás desde la pantalla de tirada regresa a la selección de modo, no al listado de armas.

### US-128b — Descuento de munición
*Como arquero o ballestero, quiero que mi munición se descuente automáticamente al atacar para llevar el control sin interrumpir el combate.*

**Estado:** ✅ Implementado

**Criterios de aceptación:**
- AC 128b.1: Al iniciar un ataque con arma a distancia, la pantalla muestra la munición compatible equipada y su cantidad actual.
- AC 128b.2: Un aviso informa que la munición se descuenta al lanzar el dado, independientemente del resultado del ataque.
- AC 128b.3: Después del ataque, el inventario refleja la unidad descontada. Si quedan 19 flechas, muestra Flechas x19.

### US-129 — Flujo de lanzamiento de conjuro
*Como lanzador de conjuros, quiero lanzar trucos y conjuros con el flujo correcto de espacios y dados desde la pantalla de mi personaje.*

**Estado:** ✅ Implementado

**Criterios de aceptación:**
- AC 129.1: La opción Lanzamiento de conjuro muestra tabs separados para Trucos y Conjuros.
- AC 129.2: Los trucos indican claramente que no consumen espacio de conjuro.
- AC 129.3: Los conjuros de nivel 1 en adelante muestran los espacios disponibles por nivel antes de seleccionar.
- AC 129.4: Al elegir un conjuro, el jugador selecciona el dado a lanzar cuando el conjuro ofrece varias opciones.
- AC 129.5: La pantalla de resultado muestra el daño total y, si el conjuro requiere salvación, instruye al jugador para que indique la CD.
- AC 129.6: Al lanzar un conjuro de nivel 1+, el espacio se consume y los espacios disponibles se actualizan.

### US-140 — Resolución de historia
*Como jugador en una situación narrativa, quiero elegir la habilidad relevante y lanzar un d20 con ventaja/desventaja automática según mi estado.*

**Estado:** ✅ Implementado

**Criterios de aceptación:**
- AC 140.1: La opción Resolución de historia abre un selector de las 18 habilidades con el bonificador calculado de cada una.
- AC 140.2: La habilidad seleccionada se resalta visualmente. El botón de lanzar está deshabilitado hasta elegir una.
- AC 140.3: Si el jugador selecciona Sigilo y lleva armadura con penalización de sigilo, automáticamente se muestran dos dados (desventaja).
- AC 140.4: Las condiciones activas como Asustado, Envenenado o Restringido también activan la tirada con desventaja automáticamente.
- AC 140.5: En la pantalla de resultado, el dado ganador aparece nítido y el dado perdedor aparece atenuado.

### US-128c — Tiradas genéricas y de salvación
*Como jugador, quiero lanzar dados con fórmulas personalizadas o tiradas de salvación cuando la situación lo requiera.*

**Estado:** ✅ Implementado

**Criterios de aceptación:**
- AC 128c.1: El menú de dados incluye acceso a Tirada de salvación y Tirada personalizada.
- AC 128c.2: La tirada personalizada permite especificar el tipo y cantidad de dados antes de lanzar.
- AC 128c.3: El resultado de cualquier tirada muestra siempre el total y su composición.

---

## ÁREA 5 — Inventario y equipamiento

> **JOB TO BE DONE:** Quiero gestionar el equipo de mi personaje de forma realista, con las reglas de ocupación de manos aplicadas automáticamente.

### US-122 — Equipamiento inicial al crear personaje
*Como jugador que acaba de crear un personaje, quiero elegir el equipo inicial de mi clase en el asistente de creación.*

**Estado:** ✅ Implementado

**Criterios de aceptación:**
- AC 122.1: El paso de Equipamiento muestra las opciones de equipo inicial de la clase agrupadas por elección.
- AC 122.2: Cada grupo requiere exactamente una selección antes de poder continuar.
- AC 122.3: Al terminar la creación, el equipo seleccionado aparece en el inventario con cantidades correctas.
- AC 122.4: Los paquetes de equipo como el Pack de Explorador se desglosan automáticamente en sus artículos individuales.
- AC 122.5: Un personaje creado antes de este flujo puede elegir su equipo inicial desde la pestaña de Inventario si aún no lo tiene.

### US-123 — Equipar y desequipar objetos
*Como jugador, quiero equipar y desequipar armas, armadura, escudo y munición con las reglas de ocupación de manos aplicadas automáticamente.*

**Estado:** ✅ Implementado

**Criterios de aceptación:**
- AC 123.1: Cada ítem equipable del inventario muestra un botón Equipar o Desequipar. Los ítems equipados tienen un indicador visual diferenciado.
- AC 123.2: Equipar una armadura de cuerpo desequipa automáticamente cualquier otra armadura de cuerpo equipada.
- AC 123.3: Equipar un escudo desequipa automáticamente armas a dos manos o armas a distancia.
- AC 123.4: Equipar un arco auto-equipa las flechas disponibles; equipar una ballesta auto-equipa los virotes disponibles.
- AC 123.5: Intentar equipar munición incompatible con el arma a distancia equipada muestra un mensaje de error claro en español.
- AC 123.6: Las cantidades de munición se muestran como "Flechas x19", nunca como bundle completo si ya se han gastado unidades.

### US-124 — Uso de consumibles
*Como jugador, quiero usar pociones y otros consumibles desde el inventario para que sus efectos se apliquen automáticamente.*

**Estado:** ✅ Implementado

**Criterios de aceptación:**
- AC 124.1: Los consumibles muestran un botón Usar en su tarjeta de inventario.
- AC 124.2: Los consumibles con dados abren el modal de dados antes de aplicar el efecto.
- AC 124.3: Las pociones de curación aplican el resultado al PG actual sin superar el máximo calculado.
- AC 124.4: Al usar un consumible, su cantidad se reduce en uno. Si llega a cero, desaparece del inventario.
- AC 124.5: Los packs y kits muestran un botón Abrir que los desglosa en sus artículos individuales con las cantidades correctas.

### US-137 — Estructura del inventario: Equipo, Mochila, Alijo
*Como jugador, quiero ver mi inventario organizado en secciones que reflejen dónde están mis objetos.*

**Estado:** ✅ Implementado

**Criterios de aceptación:**
- AC 137.1: La pestaña Inventario tiene tres secciones internas: Equipo, Mochila y Alijo.
- AC 137.2: Equipo muestra los slots del personaje con los ítems actualmente equipados.
- AC 137.3: Mochila lista todo el inventario y permite agregar nuevos objetos a través de un buscador con filtros y tarjetas de ítem.
- AC 137.4: El flujo de agregar objeto requiere confirmar la cantidad antes de añadir al inventario.

### US-138 — Carga y monedas
*Como jugador, quiero ver de un vistazo cuánto peso cargo y qué monedas tengo.*

**Estado:** ⚠️ Parcial — monedas implementadas; barra de carga sin cálculo automático por peso de ítems

**Criterios de aceptación:**
- AC 138.1: La sección Mochila incluye una tarjeta que muestra el peso actual, el peso máximo y una barra de progreso visual.
- AC 138.2: La misma tarjeta muestra las columnas de monedas: PO (oro), PP (plata) y PC (cobre) con iconos diferenciados.

### US-127 — Descripciones ricas de ítems y conjuros
*Como jugador, quiero que las tarjetas de objetos y conjuros muestren sus atributos de reglas para entender su uso sin consultar el manual.*

**Estado:** ✅ Implementado

**Criterios de aceptación:**
- AC 127.1: Las tarjetas de arma muestran el tipo de entrenamiento requerido (simple/marcial), el daño, el alcance y las propiedades.
- AC 127.2: Las tarjetas de armadura muestran la categoría, la CA resultante, el requisito de Fuerza si aplica, y si impone desventaja en Sigilo.
- AC 127.3: Las tarjetas de conjuro muestran nivel, escuela, componentes, alcance, tiempo de lanzamiento, duración, concentración y descripción resumida.
- AC 127.4: Las etiquetas de atributos no usan emojis decorativos. Son textuales y legibles.

**Notas de implementación (2026-05-09):**
- Campo `description String?` y `source String @default("srd")` agregados a `model Item` en `prisma/schema.prisma`.
- Migración: `20260509120000_add_item_description_source`.
- Los 287 ítems SRD existentes tienen descripción de sabor en español con tono DnD.
- 568 ítems homebrew integrados desde 4 PDFs del proyecto (magic40, infernal, gremio, todasarmas).
- Total catálogo: 855 ítems. Seed en `prisma/seeds/item.ts`.

---

### US-145 — Iconos visuales para todos los ítems del catálogo
*Como jugador, quiero ver un ícono representativo junto a cada objeto de mi inventario para identificarlos de un vistazo sin leer el nombre completo.*

**Estado:** 🟡 En progreso / implementación parcial con imágenes locales

**Criterios de aceptación:**
- AC 145.1: Cada ítem debe tener una identidad visual reconocible que no dependa de íconos SVG genéricos por categoría.
- AC 145.2: La solución visual pendiente debe respetar la preferencia del usuario: imágenes únicas por ítem o un sistema visual equivalente aprobado antes de implementarse.
- AC 145.3: La rareza, fuente y tipo del objeto deben seguir mostrándose como atributos textuales limpios, sin emojis decorativos en tags.
- AC 145.4: La mochila, el catálogo de agregar objetos y la pantalla de confirmación de cantidad deben usar el mismo sistema visual cuando US-145 se reimplemente.
- AC 145.5: La pantalla de confirmación de cantidad debe conservar la descripción del ítem y sus atributos principales.
- AC 145.6: Las armas, armaduras, municiones, consumibles, herramientas y objetos mágicos deben diferenciarse visualmente sin ensuciar la lectura de sus datos.

**Notas de implementación / rollback (2026-05-09):**
- Se implementó temporalmente un sistema de 34 símbolos SVG inline, pero fue revertido el mismo día por decisión del usuario.
- Rollback confirmado: se eliminaron los símbolos SVG, las funciones `getItemIconId`, `getItemIconStyle`, `itemIconHtml` y el bloque CSS `.item-icon-wrap`.
- La razón de producto es explícita: el usuario prefiere imágenes únicas o una identidad visual específica por ítem, no íconos vectoriales genéricos.
- Implementación parcial posterior: `ui.html` usa assets locales en `src/images/items` para mapear ítems exactos y subtipos de armas/magic items sin volver al sistema SVG.
- Extensión posterior: Game-icons vía Iconify se usa como fallback dirigido para ítems sin imagen local, con color por rareza de objeto mágico.
- `itemDescription()` debe seguir priorizando el campo `item.description` de BD sobre descripciones generadas en código.
- Pendiente de validación: revisar visualmente en navegador mochila, catálogo y pantalla de cantidad; confirmar carga externa de Iconify en producción.

---

## ÁREA 6 — Estado del personaje en partida

> **JOB TO BE DONE:** Quiero que mi hoja de personaje refleje exactamente el estado actual de mi personaje durante el combate sin tener que actualizarla manualmente.

### US-139 — Estadísticas derivadas del equipo equipado
*Como jugador, quiero que la CA, la velocidad y otras estadísticas cambien automáticamente cuando equipo o desequipo objetos.*

**Estado:** ✅ Implementado

**Criterios de aceptación:**
- AC 139.1: La CA mostrada en la ficha refleja la armadura equipada, el escudo equipado y el modificador de Destreza cuando aplica.
- AC 139.2: Si el personaje lleva armadura pesada y no cumple el requisito de Fuerza, la velocidad se muestra reducida en 10 ft.
- AC 139.3: Si algún objeto equipado impone desventaja en Sigilo, aparece un indicador visual en la pestaña de equipamiento.
- AC 139.4: Los PG máximos usan la tirada real del dado de vida del nivel 1 cuando está registrada.
- AC 139.5: La capacidad de carga y el peso actual se calculan sumando todos los ítems del inventario, incluyendo los equipados.

### US-131 — Competencia con armas y habilidades
*Como jugador, quiero ver claramente con qué armas y habilidades soy competente para no sumar el bonificador donde no corresponde.*

**Estado:** ✅ Implementado

**Criterios de aceptación:**
- AC 131.1: En el flujo de ataque, cada arma equipada muestra la etiqueta Competente o Sin competencia.
- AC 131.2: La pantalla de tirada de ataque muestra si el bonificador de competencia fue sumado o no, y el motivo.
- AC 131.3: La pestaña Habilidades muestra las Competencias de equipo en una sección dedicada.

### US-141 — Localización completa al español
*Como jugador hispanohablante, quiero que todos los nombres de objetos, conjuros, razas y clases aparezcan en español.*

**Estado:** ✅ Implementado (257 ítems y 410 conjuros traducidos)

**Criterios de aceptación:**
- AC 141.1: Los 257 ítems del SRD aparecen en español en toda la interfaz.
- AC 141.2: Los 410 conjuros del SRD aparecen con su nombre en español en las pestañas de Conjuros y en los flujos de lanzamiento.
- AC 141.3: Si un ítem o conjuro no tiene traducción registrada, aparece su nombre en inglés como alternativa. Nunca aparece un campo vacío.

---

## ÁREA 7 — Reglas automáticas de DnD

> **JOB TO BE DONE:** Quiero que la app conozca las reglas de DnD para no tener que calcular modificadores, bonificadores ni restricciones durante la partida.

### Razas (US-07 a US-21)
*Como jugador, quiero que al elegir una raza y subrraza mis bonificadores, idiomas, sentidos y rasgos raciales queden aplicados automáticamente.*

**Estado:** ✅ Implementado

**Criterios de aceptación:**
- Raza.1: Los bonificadores de atributo racial se suman a las puntuaciones base. La UI siempre muestra base + bono por separado.
- Raza.2: Rasgos como visión en la oscuridad, resistencias, idiomas y competencias con armas específicas aparecen registrados en la ficha.
- Raza.3: Rasgos que se usan una vez por descanso, como el Aliento del Dracónido, muestran un contador de usos disponibles.
- Raza.4: La selección de subrraza desbloquea únicamente las opciones disponibles para la raza padre elegida.

### Clases (US-22 a US-47)
*Como jugador, quiero que al elegir una clase mis dados de golpe, competencias, recursos de clase y capacidades mágicas queden configurados automáticamente.*

**Estado:** ✅ Implementado

**Criterios de aceptación:**
- Clase.1: El tipo de dado de vida, las competencias en armas y armaduras, y las tiradas de salvación se asignan automáticamente al elegir la clase.
- Clase.2: Las habilidades que el jugador debe elegir presentan únicamente las opciones válidas para esa clase, en el número correcto.
- Clase.3: Los recursos de clase muestran el número de usos disponibles según el nivel y se restauran en descanso cuando corresponde.
- Clase.4: La subclase aparece en el flujo de creación únicamente cuando el nivel del personaje alcanza el nivel de desbloqueo de esa clase.

### Magia (US-78 a US-82)
*Como lanzador de conjuros, quiero que los espacios de conjuro, la CD de conjuro y el bono de ataque mágico se calculen automáticamente.*

**Estado:** ✅ Implementado

**Criterios de aceptación:**
- Magia.1: Los espacios de conjuro se calculan según la clase y el nivel del personaje. Se muestran agrupados por nivel.
- Magia.2: La CD de salvación de conjuro y el bono de ataque con conjuro aparecen en la ficha, calculados con el atributo de lanzamiento de la clase.
- Magia.3: La concentración activa se muestra con el nombre del conjuro en curso. Si el personaje empieza a concentrarse en uno nuevo, el anterior se cancela.
- Magia.4: Los conjuros de un solo uso por descanso muestran su estado de disponibilidad claramente.

### Trasfondos (US-48 a US-61)
*Como jugador, quiero que mi trasfondo aplique automáticamente las competencias en habilidades, idiomas y herramientas.*

**Estado:** ✅ Implementado

**Criterios de aceptación:**
- Trasfondo.1: Al elegir el trasfondo, las competencias en habilidades incluidas se agregan al personaje sin duplicarse con las de la clase.
- Trasfondo.2: Los idiomas y herramientas del trasfondo aparecen en la ficha como competencias registradas.
- Trasfondo.3: Los rasgos de personalidad, ideales, vínculos y defectos del trasfondo están disponibles para consulta en la ficha.

### Descansos (US-70 a US-73)
*Como jugador, quiero que un descanso corto o largo restaure automáticamente los recursos correctos según las reglas.*

**Estado:** ✅ Implementado

**Criterios de aceptación:**
- Descanso.1: El descanso corto permite gastar dados de golpe para recuperar PG. Cada dado gastado muestra el resultado y el modificador de Constitución sumado.
- Descanso.2: El descanso largo recupera todos los PG perdidos y la mitad de los dados de golpe gastados, con un mínimo de uno.
- Descanso.3: Los recursos con recuperación por descanso corto o largo se recargan automáticamente al confirmar el descanso.

---

## ÁREA 8 — Acceso y disponibilidad

> **JOB TO BE DONE:** Quiero acceder a la plataforma desde el navegador de mi móvil sin instalar nada, y que mis datos estén guardados en la nube.

### US-133 / US-134 — Plataforma web pública
*Como jugador, quiero acceder a la plataforma desde cualquier navegador móvil sin necesidad de instalar una app.*

**Estado:** ✅ Implementado

**Criterios de aceptación:**
- US133.1: La plataforma es accesible desde un navegador web estándar en móvil. No requiere descarga de app.
- US133.2: La URL pública de la plataforma carga la interfaz con el visual language correcto en la primera visita.
- US133.3: Los datos del personaje se sincronizan con el servidor. El jugador puede cerrar el navegador y retomar desde donde dejó.
- US133.4: La plataforma funciona en modo degradado si hay problemas de conexión, informando al jugador del estado.

---

## ÁREA 9 — New Style UI templates

> **JOB TO BE DONE:** Quiero que la plataforma se sienta como una herramienta de fantasía pulida y coherente con el nuevo Figma, sin perder las funciones ya construidas.

### US-146 — Migración visual a New Style
*Como jugador, quiero que Home, personaje abierto e Inventario sigan el nuevo template visual de Figma para que la experiencia sea consistente y más inmersiva.*

**Estado:** 🟡 En progreso / pendiente de QA visual

**Criterios de aceptación:**
- US146.1: Home usa fondo de pergamino, encabezado rojo, navegación inferior en orden `Personajes`, `Tienda`, `Glosario`, `Razas y clases`, cards parchment y CTA rojo de agregar personaje.
- US146.1a: La card de personaje creado muestra nombre, raza/clase, divider rojo degradado/taper, métricas (`CA`, velocidad, PG, nivel) y biografía en ese orden; las acciones `Editar` y `Eliminar` se muestran únicamente desde el menú táctil de tres puntos. Tipografías: título `Source Serif Pro` 20px regular, raza/clase 10px italic, atributos `Source Sans 3` 14px regular y descripción `Source Sans Pro` 14px regular.
- US146.2: Personaje abierto usa fondo de ficha, header con Atrás/nombre/Tirar dado, navegación inferior interna y bloque parchment para CA, Velocidad, B. Competencia, XP, imagen, atributos, magia y PG.
- US146.2a: La card de personaje abierto se divide internamente con dividers rojos degradados visibles: XP, métricas superiores, estado opcional de penalización en sigilo, imagen/atributos, magia y PG. XP, métricas y penalización viven en `.character-card-stats`, que implementa la anatomía Figma `--module-xp`: espaciado interno controlado, badge `Lvl` 32x32, barra XP 4px, botón mini y métricas 3 columnas. Los estados con y sin penalización deben mantener la misma arquitectura, cambiando solo la línea contextual de penalización. La grilla de atributos debe leerse `FUE`, `DES`, `CON` / `INT`, `SAB`, `CAR`; el botón `Agregar experiencia` es mini de 24px alto con `Source Serif Pro` 10px regular y padding horizontal de 8px. La card interna usa padding 16px en X, 32px arriba/abajo y 16px de separación alrededor de dividers.
- US146.2b: El header de personaje abierto usa composición de tres columnas: `Atrás` a la izquierda, eyebrow `Personaje` y nombre centrado, y botón mini `Tirar dado` a la derecha. La biografía es una card parchment independiente debajo de la ficha principal, con título `Biografía`, párrafo introductorio y bullets para `Ideal`, `Vínculo` y `Defecto`; solo debe mostrarse en el tab `Personaje`.
- US146.3: Inventario usa tabs `Equipo`, `Mochila`, `Alijo`, card de `Carga` con monedas, slots vacíos punteados y cards parchment de objetos.
- US146.4: Los colores, tipografías, tamaños, espacios, radios y sombras del template viven como tokens CSS derivados del Figma para evitar valores sueltos.
- US146.4a: Las navbars New Style usan padding horizontal de 16px. Sus columnas internas deben ser flexibles para respetar el ancho útil; no deben sumar el ancho total de pantalla antes de aplicar padding.
- US146.5: Al tocar una tarjeta de inventario, se abre el drawer `Descripción` con arte del ítem, nombre, tipo/rareza, valor, atributos clave y descripción completa.
- US146.5a: En el modal `Descripción`, la regla destacada debe mostrar etiqueta (`Ventaja` o `Atributo`) y valor completo. Los textos largos como ventajas, inmunidades o atributos múltiples pueden ocupar varios renglones; no deben truncarse ni ocultarse.
- US146.5b: El header del modal `Descripción` debe mapear al componente Figma `--module-item-header`: arte a la izquierda, `item summary` a la derecha, `main information` con `titleAndCategory` + `price`, divider rojo y bloque `advantages`. El precio no debe separarse como una tercera columna independiente.
- US146.6: La migración visual no rompe autenticación, apertura de personaje, carga de imagen, inventario, dados, habilidades, conjuros ni llamadas API.
- US146.7: Cualquier pantalla secundaria no migrada al nuevo template se mantiene como pendiente explícito de validación visual.

---

## Historial de cambios de este documento

| Fecha | Cambio | US relacionada |
|---|---|---|
| 2026-05-12 | US-146 ajustada — biografía solo visible en tab `Personaje` y navbar con padding horizontal de 16px | US-117 / US-146 |
| 2026-05-12 | US-146 extendida — modal `Descripción` alineado a arquitectura Figma `--module-item-header` | US-127 / US-146 |
| 2026-05-12 | US-146 extendida — modal `Descripción` de objeto con regla destacada multilínea, rareza desde properties y card interna de descripción | US-127 / US-146 |
| 2026-05-12 | US-146 extendida — réplica de pantalla de personaje abierto con header, ficha principal y biografía como card independiente | US-117 / US-125 / US-146 |
| 2026-05-11 | US-146 refinada desde Figma `specs` — tokens mini/regular/close, `.character-card-stats` alineado a `--module-xp` y acciones mini de inventario | US-146 |
| 2026-05-11 | US-146 extendida — hoja de personaje abierto con secciones, dividers, estado de penalización en sigilo y grillas internas | US-117 / US-125 / US-146 |
| 2026-05-11 | US-146 extendida — card de personaje del roster con menú de tres puntos, dropdown Editar/Eliminar y divider rojo | US-119 / US-146 |
| 2026-05-09 | US-146 extendida — tokens CSS `--figma-*` y drawer de descripción para objetos de inventario | US-146 |
| 2026-05-09 | US-146 creada — migración visual a Figma `New-style` / `pantallas template` para Home, personaje abierto e Inventario | US-146 |
| 2026-05-07 | Documento creado — baselined desde behavioral design.docx v1.0 | Todas |
| 2026-05-09 | US-145 extendida — Game-icons/Iconify como fallback por categoría con color por rareza | US-145 |
| 2026-05-09 | US-145 retomada parcialmente — imágenes locales en `src/images/items` con mapping exacto y fallback por subtipo | US-145 |
| 2026-05-09 | US-145 revertida — rollback de íconos SVG genéricos; pendiente rediseño con imágenes únicas o sistema visual aprobado | US-145 |
| 2026-05-09 | XLS de catálogo regenerado — 855 ítems, 4 hojas y color por rareza/fuente para revisión de contenido | US-127 |
| 2026-05-09 | US-145 implementada temporalmente — 34 íconos SVG para todos los ítems, revertido el mismo día por decisión de producto | US-145 |
| 2026-05-09 | US-127 implementada — 287 descripciones SRD + 568 ítems homebrew integrados, migración description/source | US-127 |
| 2026-05-05 | US-144 implementada — armas arrojadizas con selección de modo y descuento de cantidad | US-144 |
| 2026-05-05 | US-143 estabilizada — dados 3D sin context loss ni condición de carrera | US-130 |
| 2026-05-04 | US-140 implementada — resolución de historia con ventaja/desventaja automática | US-140 |
| 2026-05-04 | US-141 completada — 257 ítems y 410 conjuros en español | US-141 |

---

*DnD Character Engine · Behavioral Design — actualizado automáticamente en cada deployment*
