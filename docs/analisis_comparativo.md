# Análisis Comparativo: requirements.md vs. Manual del Jugador (PHB 5e)

> **Metodología:** Revisión completa de los Capítulos 1–10 del Manual del Jugador (260 páginas) y comparación sistemática contra los 69 User Stories del `requirements.md`.

---

## RESUMEN EJECUTIVO

El `requirements.md` tiene una **cobertura excelente** para las mecánicas de raza, clase y trasfondo. La mayoría de los Acceptance Criteria están correctamente especificados. Sin embargo, se identificaron:

- **1 error factual** (bug que producirá un defecto)
- **19 mecánicas faltantes** organizadas por categoría

---

## 🔴 ERROR — Corregir antes de implementar

### Bug: Tamaño del Gnomo — AC 17.2

**Actual en requirements.md:**
```
"The `size` attribute must be rigidly set to `medium`."
```

**Corrección según el Manual:**
Los gnomos miden entre 3 y 4 pies de altura (el texto del manual los describe como "midiendo la mitad que" un humano). Su tamaño correcto es **`small`**, no `medium`.

**Impacto:** Afecta directamente AC 17.2, y también las reglas de armas `heavy` (AC 68.4 establece que armas con propiedad `heavy` imponen desventaja a criaturas de tamaño `small`). Un gnomo con tamaño `medium` nunca recibiría esa penalización, lo cual rompe las reglas de combate.

**Corrección:**
```
AC 17.2: The `size` attribute must be rigidly set to `small`.
```

---

## 🟡 MECÁNICAS FALTANTES

Las siguientes mecánicas existen en el Manual pero **no están cubiertas** en ningún User Story del `requirements.md`. Se organizan por prioridad de implementación.

---

### Categoría 1: Combate Core (Capítulo 9)

#### M-01: Tiradas de Salvación de Muerte (Death Saving Throws)
Cuando un personaje llega a 0 Puntos de Golpe y no muere instantáneamente, cae inconsciente y debe tirar 1d20 al inicio de cada uno de sus turnos:
- Resultado 10+: 1 éxito acumulado. 3 éxitos = estabilizado (0 PG pero no hace más tiradas).
- Resultado 1–9: 1 fallo acumulado. 3 fallos = muerte.
- **Natural 20:** El personaje recupera exactamente 1 PG e inmediatamente recupera la consciencia.
- **Natural 1:** Cuenta como 2 fallos en lugar de 1.
- El contador se reinicia al recuperar cualquier PG.
- Recibir daño a 0 PG suma 1 fallo adicional (golpe crítico = 2 fallos).

**Campos necesarios en la BD:** `death_saves_success` y `death_saves_fail` ya están en el schema de `Character`. Falta la lógica en el `CombatService`.

#### M-02: Muerte Instantánea (Instant Death)
Si el daño recibido reduce los PG a 0 **y** el daño restante es ≥ al máximo de PG del personaje, el personaje muere instantáneamente (sin tiradas de salvación de muerte).

*Ejemplo del manual:* Un clérigo con 12 PG máx. y 6 PG actuales recibe 18 de daño. Llega a 0 PG con 12 de daño restante. Como 12 ≥ 12 (su máximo), muere al instante.

#### M-03: Puntos de Golpe Temporales (Temporary HP)
- Forman un **pool separado** de los PG normales; se pierden primero al recibir daño.
- No se acumulan: si el personaje ya tiene PG temporales, solo conserva el valor más alto (el nuevo o el existente).
- No pueden ser curados ni recuperados con descanso.
- No contribuyen al cálculo de muerte instantánea (M-02).

**Campo necesario:** `temp_hp` ya está en el schema de `Character`. Falta la lógica en el `HealthService`.

#### M-04: Ataques de Oportunidad (Opportunity Attacks)
Cuando una criatura hostil sale voluntariamente del alcance de un personaje sin realizar la acción de **Retirada**, el personaje puede usar su **reacción** para hacer un ataque de arma cuerpo a cuerpo contra ella. Este ataque ocurre antes de que la criatura salga del alcance.

*Impacta directamente en:* AC 23.5 (Furia), AC 25.4 (Movimiento Rápido del Bárbaro), y múltiples rasgos de clase que consumen la reacción.

#### M-05: Iniciativa
Al inicio de todo combate, cada participante hace una **tirada de Destreza** (1d20 + modificador de DES) para determinar el orden de turno. Los empates entre jugadores los resuelven los jugadores; los empates entre PJs y monstruos los resuelve el DM.

**Campo necesario:** Agregar `initiative_bonus` como valor calculado en el `MathService` (= `dexterity_modifier`).

#### M-06: Ataques Desarmados (no-Monk)
Para personajes sin niveles en Monje, un ataque desarmado inflige **1 de daño contundente + modificador de Fuerza**. El Monk overridea esto con su dado de Artes Marciales (AC 42.5), pero el valor base para todas las otras clases no está especificado en el requirements.

---

### Categoría 2: Descanso (Capítulo 8)

Las palabras "descanso corto" y "descanso prolongado" aparecen en **17 Acceptance Criteria** del requirements.md, pero en ningún lugar se definen. Son mecánicas fundamentales del sistema.

#### M-07: Descanso Corto (Short Rest)
- Duración mínima: **1 hora** de inactividad (sin combate, lanzamiento de conjuros ni actividad extenuante).
- Durante un descanso corto, el personaje puede gastar uno o más **Dados de Golpe** de su pool para recuperar PG: tira el dado + modificador de CON por cada dado gastado y suma al total de PG actuales.
- Recupera recursos que se especifican como "short or long rest" (ej. Ki, Action Surge, bardic inspiration nivel 5+, etc.).

#### M-08: Descanso Prolongado (Long Rest)
- Duración mínima: **8 horas** (al menos 6 de sueño, máximo 2 horas de actividad ligera).
- Al finalizar: recupera **todos los PG perdidos**.
- Al finalizar: recupera hasta la **mitad del total** de sus Dados de Golpe (redondeando hacia abajo, mínimo 1).
- Un personaje solo puede beneficiarse de un descanso prolongado cada 24 horas.
- El personaje debe comenzar con al menos 1 PG.

---

### Categoría 3: Habilidades y Pruebas (Capítulo 7)

#### M-09: Pruebas Pasivas (Passive Checks)
Ciertos rasgos referencian "puntuaciones pasivas" (AC 9.8, AC 11.5, etc.). La fórmula no está especificada en requirements:

```
Puntuación Pasiva = 10 + modificador de habilidad total
```

Si el personaje tiene ventaja en esa prueba: +5. Si tiene desventaja: -5.

El caso más importante es la **Percepción Pasiva**: `10 + wisdom_modifier + proficiency_bonus` (si hay competencia en Percepción).

#### M-10: Catálogo de Habilidades (Skills)
A lo largo del requirements se referencian skill_ids como `athletics`, `intimidation`, `perception`, etc., pero **nunca se define el catálogo completo** con su característica asociada. Este es un catálogo crítico para sembrar la BD.

Las 18 habilidades del PHB 5e y sus características:

| Habilidad | Característica |
|---|---|
| `acrobatics` | Destreza |
| `animal_handling` | Sabiduría |
| `arcana` | Inteligencia |
| `athletics` | Fuerza |
| `deception` | Carisma |
| `history` | Inteligencia |
| `insight` | Sabiduría |
| `intimidation` | Carisma |
| `investigation` | Inteligencia |
| `medicine` | Sabiduría |
| `nature` | Inteligencia |
| `perception` | Sabiduría |
| `performance` | Carisma |
| `persuasion` | Carisma |
| `religion` | Inteligencia |
| `sleight_of_hand` | Destreza |
| `stealth` | Destreza |
| `survival` | Sabiduría |

---

### Categoría 4: Conjuros (Capítulo 10)

#### M-11: Concentración (Concentration)
Múltiples conjuros del juego requieren concentración (ej. `faerie_fire` de los Drow en AC 12.12, `darkness` de Tieflings en AC 21.5, etc.). Las reglas no están en el requirements:

- Solo se puede mantener un conjuro de concentración a la vez. Lanzar otro lo cancela.
- Si el personaje recibe daño mientras se concentra, debe superar una **tirada de salvación de Constitución** con CD = máx(10, daño_recibido / 2). Fallo = conjuro cancelado.
- Quedar incapacitado o morir también cancela la concentración.

**Campo necesario:** `active_concentration_spell_id` en `ActiveState` o directamente en `Character`.

#### M-12: Tabla de Espacios de Conjuros por Nivel de Clase
El requirements.md define `SpellSlotTracker` en el schema, y hace referencia a los espacios de conjuros de cada clase, pero **nunca define la tabla completa de cuántos espacios hay por nivel**. Esto es crítico para la fase de seeding.

*Ejemplo parcial (Mago):*

| Nivel | 1° | 2° | 3° | 4° | 5° |
|---|---|---|---|---|---|
| 1 | 2 | — | — | — | — |
| 2 | 3 | — | — | — | — |
| 3 | 4 | 2 | — | — | — |
| 4 | 4 | 3 | — | — | — |
| 5 | 4 | 3 | 2 | — | — |

Esta tabla existe para cada clase lanzadora (Bardo, Brujo*, Clérigo, Druida, Explorador**, Hechicero, Mago, Paladín**). *El Brujo tiene una tabla diferente (Pact Magic). **Explorador y Paladín comienzan a lanzar conjuros en nivel 2.

---

### Categoría 5: Condiciones (Apéndice A)

#### M-13: Catálogo de Condiciones
Son referenciadas en docenas de Acceptance Criteria (AC 9.8 "advantage on saving throws against poison", AC 13.4 "immunity to magical sleep", AC 23.5 "resistance to bludgeoning", etc.) pero nunca se define un catálogo formal.

Las condiciones del PHB que impactan mecánicamente al sistema son:

| Condición | Efecto mecánico clave |
|---|---|
| `frightened` | Desventaja en pruebas y ataques mientras la fuente esté en línea de visión; no puede acercarse voluntariamente a la fuente. |
| `charmed` | No puede atacar al encantador ni seleccionarlo como objetivo de efectos dañinos. El encantador tiene ventaja en pruebas de interacción social. |
| `poisoned` | Desventaja en tiradas de ataque y pruebas de característica. |
| `prone` | Solo puede arrastrarse. Desventaja en ataques. Ataques a distancia contra ella con desventaja; ataques CaC con ventaja (si atacante a ≤5 pies). |
| `grappled` | Velocidad = 0. |
| `incapacitated` | No puede realizar acciones ni reacciones. |
| `unconscious` | Incapacitado + tumbado + falla Fuerza/Destreza saves automáticamente + ataques contra ella con ventaja + cualquier ataque a ≤5 pies es crítico. |
| `blinded` | Falla pruebas que dependan de vista. Desventaja en ataques. Ventaja en ataques contra él. |
| `deafened` | Falla automáticamente pruebas que requieran oír. |
| `invisible` | Fuertemente escondido. Ventaja en ataques. Desventaja en ataques contra él. |
| `petrified` | Incapacitado + falla saves automáticamente + resistencia a todo daño + inmune veneno/enfermedad. |
| `stunned` | Incapacitado + no puede moverse + falla saves FUE/DES + ataques contra él con ventaja. |
| `restrained` | Velocidad = 0 + desventaja en ataques + ventaja en ataques contra él + desventaja en DEX saves. |

#### M-14: Agotamiento (Exhaustion)
El requirements menciona fatiga en varios lugares pero no la define formalmente. Es una condición con 6 niveles acumulativos:

| Nivel | Efecto |
|---|---|
| 1 | Desventaja en pruebas de característica |
| 2 | Velocidad reducida a la mitad |
| 3 | Desventaja en tiradas de ataque y salvación |
| 4 | PG máximos reducidos a la mitad |
| 5 | Velocidad = 0 |
| 6 | Muerte |

Terminar un descanso prolongado reduce el nivel en 1.

---

### Categoría 6: Personalización (Capítulo 6)

#### M-15: Multiclase
El requirements.md menciona soporte futuro para multiclase (AC 22.1) pero no define ningún Acceptance Criteria para ello. Para el plan.md, el schema ya soporta múltiples clases. Se recomienda agregar al menos un US básico cubriendo:
- Requisitos mínimos de características para acceder a una segunda clase.
- Cómo se agregan competencias al hacer multiclase (tabla reducida, no se obtienen todas las competencias de inicio).
- Cómo se calculan los espacios de conjuros para personajes multiclase lanzadores.
- La regla de que `Defensa sin Armadura` no puede obtenerse de dos clases diferentes.

#### M-16: Catálogo de Dotes (Feats)
Las dotes son referenciadas como seleccionables en US-08 (Humano Variante), US-24 (ASI), AC 29.3 (Pacto del Brujo) pero **ninguna dote está definida**. Hay 42 dotes en el PHB. Para la implementación mínima se necesita al menos definir la estructura de datos y algunas dotes básicas (ej. Lucky, Alert, War Caster, Resilient).

---

### Categoría 7: Catálogos de Referencia

#### M-17: Catálogo de Idiomas
Referenciados en prácticamente todas las razas (`common`, `elvish`, `dwarvish`, `halfling`, `draconic`, `gnomish`, `infernal`, `orc`, `thieves_cant`, `druidic`, etc.) pero nunca se define el catálogo. Necesario para sembrar la tabla que los user stories usan como `language_id`.

#### M-18: Tabla de Costos de Point Buy
AC 1.2 menciona el sistema de Point Buy (27 puntos, valores de 8 a 15) pero no especifica los costos individuales:

| Puntuación | Costo |
|---|---|
| 8 | 0 |
| 9 | 1 |
| 10 | 2 |
| 11 | 3 |
| 12 | 4 |
| 13 | 5 |
| 14 | 7 |
| 15 | 9 |

*Nota: Los costos de 14 y 15 no son lineales (salta de 5 a 7 a 9).*

#### M-19: Tirada de Dados de Golpe en Nivel Superior (HP level-up clarification)
El requirements dice que la fórmula fija para subir de nivel es `(die_size / 2) + 1`. Esto es correcto y equivale al "resultado medio redondeando hacia arriba" que especifica el manual. Sin embargo, conviene aclarar que el manual permite **alternativamente** tirar el dado real; el valor fijo es la opción determinista. El sistema debe soportar ambas opciones o documentar claramente cuál se usa.

---

## ✅ LO QUE ESTÁ CORRECTO (validaciones del manual)

Los siguientes puntos fueron verificados contra el manual y están correctamente especificados:

- **Fórmula de modificador** (FR-01): `floor((score - 10) / 2)` ✓
- **Tabla de XP/Nivel** (FR-09): Todos los valores verificados ✓
- **Escala de bono de competencia** (FR-05): Verificada ✓
- **Defensa Sin Armadura del Bárbaro** (AC 23.4): `10 + DEX + CON` ✓
- **Defensa Sin Armadura del Monje** (AC 42.4): `10 + DEX + WIS` ✓
- **Resiliencia Dracónica del Hechicero** (AC 38.6): `13 + DEX` sin armadura ✓
- **Recuperación de Magia de Pacto** (AC 28.6): Descanso corto O prolongado ✓ (esto es único del Brujo y distinto de los conjuradores normales)
- **Inspiración de Bardo nivel 5** (AC 27.5): Recuperación en descanso corto O prolongado ✓
- **Velocidad del Bárbaro nivel 5** (AC 25.4): `+10 pies` sin armadura pesada ✓
- **Colmillo de Ataque del Semiorco** (AC 20.6): Dado adicional en crítico con arma CaC ✓
- **Armadura del Enano de la Montaña** (AC 10.4): Armadura ligera y media ✓
- **Velocidad del Elfo del Bosque** (AC 12.7): `35 pies` ✓
- **Visión en Oscuridad del Drow** (AC 12.10): `120 pies` ✓
- **Magia Drow** (AC 12.12): `dancing_lights` gratis, `faerie_fire` a nivel 3, `darkness` a nivel 5, CHA como característica ✓
- **Resistencia al veneno del Halfling Robusto** (AC 14.4): Confirmado ✓
- **Arma de Aliento del Dragonborn** (AC 16.3, 16.4): DC y daño escalable confirmados ✓

---

## 📋 RESUMEN DE ACCIONES RECOMENDADAS

### Prioridad Alta (bloquea implementación)
1. **Corregir AC 17.2**: Tamaño del Gnomo → `small`
2. **Agregar M-10**: Catálogo de habilidades (necesario para sembrar BD)
3. **Agregar M-07/M-08**: Definir Descanso Corto y Prolongado (referenciados en 17 ACs)
4. **Agregar M-12**: Tabla completa de espacios de conjuros por nivel/clase (necesaria para seeding)
5. **Agregar M-17**: Catálogo de idiomas (necesario para sembrar BD)
6. **Agregar M-18**: Tabla de costos de Point Buy

### Prioridad Media (necesario antes de Phase 4)
7. **Agregar M-01**: Death Saving Throws
8. **Agregar M-02**: Instant Death
9. **Agregar M-03**: Temporary HP logic
10. **Agregar M-13**: Condiciones como catálogo formal
11. **Agregar M-11**: Reglas de Concentración
12. **Agregar M-14**: Agotamiento

### Prioridad Baja (puede diferirse)
13. **Agregar M-04**: Oportunity Attacks (mecánica de combate, no afecta creación de personaje)
14. **Agregar M-05**: Iniciativa (ídem)
15. **Agregar M-09**: Pruebas Pasivas
16. **Agregar M-15**: Requisitos de Multiclase
17. **Agregar M-16**: Al menos estructura de datos para Dotes
18. **Aclarar M-19**: Política de HP level-up (fijo vs. aleatorio)
