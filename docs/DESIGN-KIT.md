# Design a campaign kit

In **Images**, open **Design a campaign kit**. Add a campaign brief, optional brand, intended headline and shared visual direction. **Build draft kit** creates four editable prompts: portrait poster, square social graphic, landscape thumbnail and portrait motion concept.

Edit any prompt and select **Use in Images** or **Use in Video**. This only transfers prompt and orientation to the existing maker. It never submits a job. Review engine, style, cast, source media and terms, then deliberately use the ordinary Make button. Existing settings are not silently reset. Prompts cannot guarantee consistent appearance, exact typography, valid claims or licensed commercial output. Add and verify text and logos in an editor.

## Persistence and safety

- Drafts live only in the current browser tab. Export JSON to keep them; refresh clears them. Exported files contain your brief and copy, so treat them as project data.
- Import accepts the version-1 four-output schema, preserves prompt edits, and rejects unexpected execution fields. It does not import engine selections, remote URLs, credentials or jobs. Imports and rebuilds ask before replacing an existing kit.
- Brief/settings edits require a rebuild before handoff/export. The video maker accepts at most 2,000 characters; longer drafts are rejected without truncation. Image prompts accept at most 8,192 characters.

## Verification

Run `node --test tests/design-kit.test.cjs` for dependency-free contract tests. These run in the CPU CI workflow alongside the existing Python suite.

For browser tests, use an installed Playwright module and Chromium:

```
PLAYWRIGHT_MODULE=/absolute/path/to/playwright node tests/design-kit-browser.cjs
```

The browser harness serves the actual frontend through request interception, with synthetic API fixtures and no listening socket. It checks layout, validation, export/import, edited handoffs, unchanged engine selections, no execution during planning, and the existing image-maker submission/error path. It does not run inference or contact a production service. The owned browser is closed in `finally`; receipts are in `docs/evidence/design-kit-20261010/`.

## Provenance

Inspired by the canvas and plan-review interaction in Anil-matcha/Open-AI-Design-Agent. This is an original implementation, not a copy of its React UI or MuAPI backend. No new provider, cloud adapter, account, credential, paid fallback or LLM call is added. Product/repository separation and upstream PR review are recorded in `PRODUCT-REPOSITORIES.md`.
