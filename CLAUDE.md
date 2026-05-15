# CLAUDE.md — Guía de trabajo para Claude y Codex

Este archivo es la guía de conducta para cualquier agente (Claude, Codex, o cualquier LLM) que trabaje en este proyecto. **Léelo completo antes de tocar cualquier archivo.**

---

## 1. Metodología: Spec-Driven Development (SDD)

Todo trabajo sigue este orden sin excepción:

1. **Especificación** — la tarea debe tener una US en `docs/requirements.md` antes de implementarse.
2. **Planificación** — si la tarea es compleja, documentar el approach en `docs/plan.md`.
3. **Seguimiento** — cada tarea se registra en `docs/tasks.md` con estado (pendiente / en curso / hecho).
4. **Implementación** — solo escribir código cuando la US y el criterio de aceptación están aprobados.
5. **Documentación** — al terminar, registrar todos los cambios en los documentos vivos (ver sección 3). Si no queda documentado, la tarea no está terminada.

---

## 2. Convenciones de código

| Contexto | Idioma |
|---|---|
| Variables, funciones, tablas de BD, commits | **Inglés** |
| UI, mensajes al usuario, textos en pantalla | **Español** |
| Comentarios en código | Inglés |
| Documentación (este archivo, HANDOFF, CHANGELOG, behavioral_design) | **Español** |

- Redondeo siempre hacia abajo (`Math.floor`).
- Nunca hardcodear reglas de DnD — usar el motor de cálculo en `src/`.
- Nunca modificar `prisma/schema.prisma` sin documentar la migración en HANDOFF.md.

---

## 3. Documentos vivos — actualizar en CADA cambio

Estos archivos deben estar siempre al día. **Cualquier cambio de código, configuración, workflow, UI, documentación o tooling debe quedar registrado antes de considerar completa la tarea.**

Mínimo obligatorio:
- `CHANGELOG.md`
- `HANDOFF.md`

Además, cuando cambien comportamiento, requerimientos, UX, criterios de aceptación o alcance de producto:
- `docs/requirements.md`
- `docs/tasks.md`
- `docs/behavioral_design.md`

Para cualquier cambio de UI/layout/estilos/componentes, también revisar `docs/figma_sources.md` y el contrato companion relevante: `docs/design_tokens.md`, `docs/screen_contracts.md`, `docs/component_contracts.md`, `docs/card_contracts.md` y `docs/qa_checklist.md`. Registrar en `CHANGELOG.md` y `HANDOFF.md` qué source key(s) de Figma se usaron; si no se pudo verificar una medida/variante, marcarlo como pendiente de QA visual.

### 3a. `CHANGELOG.md`
Agrega una entrada al inicio del archivo con este formato exacto:

```
## [YYYY-MM-DD] - <Título breve de lo implementado> (<US relacionada>)

### Cambios
- Descripción de cada cambio relevante
- ...

### Archivos modificados
- `archivo.ts` — qué cambió
- ...

### Historias de usuario relacionadas
- US-XXX: descripción

### Fuente / certeza
- Confirmado por <evidencia>
- Pendiente de <validación>
```

### 3b. `HANDOFF.md`
Actualiza la sección **"Últimos cambios realizados"** con:
- Qué se implementó
- Por qué (problema que resuelve o US que cubre)
- Qué queda pendiente de validar

### 3c. `docs/behavioral_design.md`
**Este es el más importante para el producto.** Actualízalo cuando:
- Se implementa una US nueva → cambiar su **Estado** a `✅ Implementado`
- Se implementa parcialmente → marcar `⚠️ Parcial — descripción`
- Se detecta un AC que no se cumple → agregar nota al criterio correspondiente
- Se crea una US nueva → agregar la sección completa con JTBD, historia y ACs

**Formato de estado para cada US:**
```
**Estado:** ✅ Implementado
**Estado:** ⚠️ Parcial — descripción de qué falta
**Estado:** ❌ Pendiente
```

Al final del documento, **siempre agregar una fila** al historial de cambios:
```
| YYYY-MM-DD | Descripción del cambio | US-XXX |
```

### 3d. `docs/tasks.md`
Marcar las tareas completadas y agregar tareas nuevas que surjan durante la implementación.

---

## 4. Cómo agregar una nueva US al behavioral design

Cuando el usuario pida una funcionalidad nueva, **antes de implementar**, agregar la US en `docs/behavioral_design.md` con este template:

```markdown
### US-XXX — Nombre descriptivo
*Como [tipo de usuario], quiero [acción] para [beneficio].*

**Estado:** ❌ Pendiente

**Criterios de aceptación:**
- AC XXX.1: [criterio observable en la UI, sin tecnicismos]
- AC XXX.2: ...
```

Luego, al implementar, cambiar el estado a `✅ Implementado` y agregar la fila al historial.

---

## 5. Generación del .docx

El archivo `behavioral design.docx` en la raíz se genera a partir de `docs/behavioral_design.md`.
Para regenerarlo:

```bash
python3 scripts/build_behavioral_design.py
```

**Nunca editar el .docx directamente** — los cambios se perderán en la siguiente generación.
La fuente de verdad es siempre `docs/behavioral_design.md`.

---

## 6. Stack técnico (referencia rápida)

| Capa | Tecnología |
|---|---|
| Backend | Node.js + TypeScript + Express |
| ORM | Prisma + PostgreSQL |
| Motor de reglas | `src/engine/` — servicios puros, sin side effects |
| UI | `ui.html` + `style.css` con infraestructura Vite/TypeScript gradual |
| Deploy | Render (backend) + GitHub Pages o Render Static (frontend) |
| Tests | Jest + `tests/` |

---

## 7. Comandos útiles

```bash
# Typecheck
npx tsc --noEmit

# Tests
npx jest

# Dev server
npm run dev

# Frontend dev server
npm run dev:web

# Frontend static build
npm run build:web

# Generar behavioral design .docx
python3 scripts/build_behavioral_design.py

# Aplicar migración Prisma
npx prisma migrate deploy
```

---

## 8. Reglas de oro

1. **No implementes sin US.** Si no hay US, créala primero en `docs/behavioral_design.md`.
2. **No termines sin documentar.** Todo cambio debe quedar registrado. CHANGELOG + HANDOFF son mínimos; requirements/tasks/behavioral_design aplican cuando cambia producto o comportamiento.
3. **No rompas el motor de reglas.** Cualquier cambio en `src/engine/` requiere tests que pasen.
4. **No hardcodees reglas de DnD** en la UI. Todo cálculo va al backend.
5. **El .docx se genera, no se edita.** La fuente de verdad es el .md.

---

*Última actualización: Mayo 2026*

## graphify

This project may have a local knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- Every code, config, workflow, UI, or documentation change must be recorded in the living docs before the task is considered complete. At minimum update `CHANGELOG.md` and `HANDOFF.md`; when behavior/product requirements change, also update `docs/requirements.md`, `docs/tasks.md`, and `docs/behavioral_design.md`.
- IF graphify-out/GRAPH_REPORT.md EXISTS, read it before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
