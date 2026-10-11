# Product and repository boundaries

Source-checked 2026-10-10. Product direction: the old coding effort is being stood down; VibeXStudio is repurposed; GameLab by Genex and Media Lab remain separate products.

## Media Lab

Canonical controller: https://github.com/kerpopule/autoedu-media-lab, Apache-2.0. The former kerpopule/media-lab-studio URL redirects here. Public product entry: https://autoedu.ai/MediaLab. The independent controller does not require the legacy coding monorepo or native VibeXStudio client. Keep model licenses and private runtime data separate from the controller license and public source.

At inspection, Media Lab main was f33df5a60ae4cfa96a58823b190e1d7b9650cc85 and had no open PRs. This feature is based on that exact source. No second Media Lab repository, Genex dependency or MuAPI account is introduced.

Do not deploy updates from kerpopule/vibexstudio by assumption. Its older source, local worktrees and compatibility identifiers are historical evidence, not the new product authority. Do not delete or rename them to implement the product split.

## GameLab by Genex

Verified upstream: https://github.com/genex-games/genex-desktop (MIT). The separately published upstream skill/plugin repository is https://github.com/genex-games/genex. Do not fold either into Media Lab, imply their hosted backend is self-hostable, rename their repositories, or wire their paid/publishing defaults into Media Lab. A product bridge should pass scoped asset/job references, not silently share state roots, permissions or credentials.

The inspected local AutoEDU review branch is autoedu/gamelab. Its audit predates upstream dev by 48 commits. This is an audit checkout, not verified evidence of the installed GameLab runtime. Current upstream dev at inspection: bf0844b49ebac271af4d62de6cbb20e9afbbd28e. No dedicated kerpopule GameLab remote was found in the current owner inventory. This review does not establish which installed/downloaded GameLab build is in use.

Open Genex PRs were inspected by title, body, file inventory and current checks; only #70 received a full diff review here:

- #70, shell-rc isolation: 72a28a8427c87f773d06bf717fcabcce7692d463. Forces SHLVL=1 after environment composition to avoid an outer bash shell reading the user's rc file before sandboxing. Includes a fake-home regression for run and long-lived spawn. Gate and documentation checks passed; rig/fast checks skipped. Prioritize qualification for a GameLab update, but CI does not establish the installed macOS app is fixed. Not merged or cherry-picked here.
- #58, computer-use session/referee: 643a252536da08ac9e900800de2bf6ed37661fd7. Broad new execution authority, not a Media Lab design dependency. Gate and documentation checks passed, rig/fast skipped. Needs separate permission and target-boundary testing.
- #67, Opencode support: c7bb7213c0cbd8460e2f7f02acdba802e20893c2. No checks reported. Do not import an unrelated coding adapter for the stood-down coding effort.
- #54, Windows Blender/Unity: 70fb6b5a1dd576d1d084e52670292eeac80d924d. No checks reported. Outside this Mac/media feature.
- #59, Windows first-run: dc18e4447dc72efe0282e0150051868b4c9b19d9. Draft, no checks reported. Not an automatic update candidate.

Recently merged changes include #68 cover-preview/publish UI, #66 dialog/menu wait, and #65 Windows stdin transport. They are already upstream and should not be reapplied as open-PR patches. GameLab upgrades must be built and exercised in their own workspace before installing; this document is not upgrade proof.

## VibeXStudio

https://vibexstudio.com is the repurposed space-design studio. kerpopule/vibexstudio has no open PRs at inspection. Do not route Media Lab feature work through its old coding product or merge the current space-design, game and media deliverables into one codebase.

## Design Agent source review

Reference: https://github.com/Anil-matcha/Open-AI-Design-Agent, MIT frontend/proxy code. Its creative backend uses hosted MuAPI; it is not a local-generation controller. We borrowed the interaction concept, not backend/provider code.

All three open upstream diffs were inspected:

- #2, viewport-relative input/toolbar offsets, 5182e1431c5f496a2805aec92bc7c04c7092a13c. Useful reminder to test small screens and controls; the new native panel uses normal document flow and responsive grid rather than copying fixed offsets. No checks reported.
- #3, build scripts, 1c7949bf365aa76a40a7be89c1b262b0f4ad2a8e. Excluded: root package.json has an extra closing brace, removes workspace scripts and targets src paths belonging to the library rather than the workspace root. Do not copy this as a repair. No checks reported.
- #4, generation callbacks, ebc0ce7650baad0d13797ccd471c883e78be3161. Draft, no checks reported. Deduplicated completion/error events are a useful design principle. Its generic-error callback/activity handling and null-URL completion path need qualification. Media Lab retains its canonical job polling and maker recovery rather than importing this event model.

No upstream PRs were merged, no repository renamed or archived, and no public source or live deployment changed by this local feature candidate.
