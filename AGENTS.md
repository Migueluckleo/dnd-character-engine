## graphify

This project may have a local knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:
- Every code, config, workflow, UI, or documentation change must be recorded in the living docs before the task is considered complete. At minimum update `CHANGELOG.md` and `HANDOFF.md`; when behavior/product requirements change, also update `docs/requirements.md`, `docs/tasks.md`, and `docs/behavioral_design.md`.
- Before any UI/layout/style/component change, read `docs/figma_sources.md` and the relevant companion contract (`docs/design_tokens.md`, `docs/screen_contracts.md`, `docs/component_contracts.md`, `docs/card_contracts.md`, `docs/qa_checklist.md`). Use the relevant Figma source key(s) as the design contract, document which source key(s) were used, and mark any approximation as pending visual QA.
- IF graphify-out/GRAPH_REPORT.md EXISTS, read it before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
