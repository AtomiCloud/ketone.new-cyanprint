---
name: ecosystem-upgrade
description: Drive a whole CyanPrint template-chain (ketone) through an ecosystem upgrade — baseline bump (e.g. nixos-26.05 + nix-registry/v3), modern nix-based generated CI, and republish — safely, in dependency order, and to a fixed point. Use when running /ecosystem-upgrade, performing a chain-wide baseline/registry bump across the ketone templates, upgrading the template ecosystem, or re-running the chain upgrade.
---

# Ecosystem Upgrade (maintainer skill)

Make the whole ketone CyanPrint template chain bump **repeatable**: a maintainer drives the chain
through an ecosystem upgrade (baseline + generated CI + republish) **safely and to a fixed point**,
from this skill alone — without re-deriving the wave order, the gate levels, or the convergence
rules each time.

This skill **orchestrates**; for the per-repo mechanics it links to the in-repo skills that own them
(rather than duplicating them), and inlines the small amount of `cyanprint update` mechanics this
workflow needs in [§1](#1-how-to-update) (no separate "cyanprint" skill exists in this repo):

- **[`upgrade`](../upgrade/SKILL.md)** — bumping SDK packages and Docker runtimes inside a single
  repo (the per-repo dependency refresh).
- **[`ci-cd-workflows`](../ci-cd-workflows/SKILL.md)** — the nix/nscloud CI pattern the generated CI
  is modeled on (`AtomiCloud/actions.setup-nix@v2` + `nix develop .#ci -c <script>`).

## When to Use

- Running `/ecosystem-upgrade`.
- Bumping the whole chain to a new baseline (nixpkgs release, `nix-registry` major) or registry.
- Fixing the **generated** CI centrally in `new` so the rest of the chain inherits it.
- Re-running a chain upgrade after a previous one (the steps are idempotent by design).

## Prerequisites

- A dev toolchain providing **cyanprint ≥ 2.22.0** (managed-files tracking in `.cyan_state` — which
  the convergence guarantee in [§3](#3-convergence--bounded-no-infinite-loop) depends on). Verify
  first: `direnv exec . cyanprint --version`.
- The CyanPrint **coordinator** (`coord.cyanprint.dev:9000`) reachable — `cyanprint update` and
  snapshot regen read **published** coordinator state.
- One git worktree **per repo**; PR per repo. **Never `cyanprint push` locally** and **never merge
  yourself** — publishing happens only via the user's merge → release CI.

## Mental model — two dependency axes

The chain has a **cycle**, so there is no clean leaf-first order. Two axes point opposite ways:

1. **Authoring dep** (`.cyan_state.yaml`) — "this repo was _scaffolded from_ these." Refreshed by
   `cyanprint update`, which re-applies the latest **published** versions of its sources (flake,
   `nix/`, generated CI…) back into the repo, with conflict resolution.
2. **Composition dep** (`cyan.yaml` `templates:`) — "when this template _runs_, it materializes
   these other templates into its output." Pinned at push time; since cyanprint **2.21.1** the
   composition also **materializes into snapshot fixtures** (expect wide snapshot diffs when crossing
   that boundary).

```text
Authoring (.cyan_state):   nix ← new   |   workspace ← new   |   new ← nix, workspace   (CYCLE)
Composition (cyan.yaml):   workspace → atomi/nix   |   nix → none   |   new → none
```

Because of the cycle, ordering is by **publish gates** (below), and a bounded **convergence pass**
settles the remaining cyclic pins.

## The three things this skill guarantees

### 1. How to update

There are **two distinct modes by repo role — do not conflate them**:

- **Wave-1 `new` (the chain root) — direct edit, NOT `cyanprint update`.** `new`'s own authoring
  sources (`atomi/nix`, `atomi/workspace`) are downstream (waves 2–3) and **not yet published** on the
  new baseline, so running `cyanprint update` on `new` now reads **stale published** coordinator state
  and **reverts** the very upgrade you are making (see
  [§2](#2-wait-for-cd-before-the-next-wave-the-released-gate)). In wave 1 you therefore **hand-apply**
  the baseline to `new`'s managed files. `new` only re-enters a `cyanprint update` convergence pass
  **later**, once the downstream waves have published on the new baseline (see
  [§3](#3-convergence--bounded-no-infinite-loop)).
- **Downstream waves (`nix`, `workspace`, …) — driven by `cyanprint update`.** These inherit the new
  baseline + generated CI from their already-published upstream; do **not** hand-port their managed
  files.

**Wave-1 `new` (direct edit):**

1. Bump `new`'s own inputs in `flake.nix` (`nixpkgs-25xx → nixos-26.05`, `atomipkgs v2 → v3`, and the
   `cyanprint` input to a ref providing **≥ 2.22.0**), then re-lock (`nix flake update`) and **reload
   the dev shell**.
2. **Hand-apply** the same baseline rename to the managed `nix/*.nix` — do **not** run `cyanprint
update` yet (it would revert it). Keep repo-specific edits minimal.
3. Fix the generated CI and regenerate snapshots (`cyanprint test … --parallel 1
--update-snapshots`); verify the new baseline is present (e.g. `grep -rl 'nixos-26.05' snapshots`).

**Downstream waves (`cyanprint update`):**

1. Confirm the upstream wave has **published** (the `released` gate,
   [§2](#2-wait-for-cd-before-the-next-wave-the-released-gate)).
2. Run `cyanprint update` to propagate managed files owned by the resolvers (the `atomi/nix` resolver
   owns `nix/*.nix`); reconcile conflicts keeping repo-specific edits minimal.
3. Regenerate snapshots/fixtures (`cyanprint test … --parallel 1 --update-snapshots`) and verify the
   new baseline is present.

**`cyanprint update` mechanics (the minimum this workflow needs):**

- `cyanprint update [PATH]` (alias `cyan u`; `PATH` defaults to `.`) re-applies the **latest
  published** version of each authoring source recorded in `.cyan_state.yaml` back into the repo.
- It reads published state from the coordinator (`-c/--coordinator-endpoint`, env
  `CYANPRINT_COORDINATOR`, default `http://coord.cyanprint.dev:9000`) — so it only ever pulls a
  version that the upstream's release CD has **already published** (this is why the wave gate in
  [§2](#2-wait-for-cd-before-the-next-wave-the-released-gate) matters: updating before the upstream
  publishes re-pins the OLD version).
- Flags: `-i/--interactive` to pick specific versions; `--force` to run on a dirty tree without the
  confirmation prompt. Prefer a clean tree so the managed-file diff is reviewable; use `-i` when a
  conflict needs a human choice. `.cyan_state.yaml` records the per-source version/answer history and
  is what makes each managed file **single-owned** (the termination guarantee in
  [§3](#3-convergence--bounded-no-infinite-loop)).
- Use `--parallel 1` for test/regen (serial is required while dep-materialization is in play).

### 2. Wait for CD before the next wave (the `released` gate)

A downstream repo must **wait for its upstream's release CD to publish** before it updates.
Updating before the upstream is published reads **stale coordinator state** and re-pins the old
version. The order of the waves is therefore gated on _publication_, not merely on merge:

```text
merge upstream PR  →  CI green  →  release CD runs  →  coordinator records new published version
                                                       └─► only now may the downstream `cyanprint update`
```

In-scope waves (each gated on the prior being **published**, confirmed by the user/CD, before
starting the next):

| Wave | Repo        | Action                                                       | Publishes         |
| ---- | ----------- | ------------------------------------------------------------ | ----------------- |
| 1    | `new`       | bump flake → 26.05+v3; fix **generated** CI; regen snapshots | `cyan/new`        |
| 2    | `nix`       | `cyanprint update` (inherits CI from `new`); regen snapshots | `atomi/nix@v3`    |
| 3    | `workspace` | `cyanprint update` (pulls `nix@v3` + CI); regen fixtures     | `atomi/workspace` |

After each wave: open the PR, babysit CI to green, then **stop and surface** for the user to merge.
Do not begin the next wave until the upstream's publish is confirmed.

### 3. Convergence — bounded, no infinite loop

The authoring cycle (`new ↔ nix/workspace`) means a repo published _before_ its dependency moved may
need a **bounded re-converge**. Settle it like this:

1. After all waves, re-run `cyanprint update` on any repo whose dependency was published _after_ that
   repo was last pushed.
2. Re-run `cyanprint update` until it is a **no-op** (no managed-file changes, clean snapshot regen).
3. Apply a **hard cap** (e.g. **3 iterations** per repo). **Single-ownership of each managed file
   guarantees termination** — every managed file has exactly one owning resolver, so updates cannot
   ping-pong indefinitely.
4. If a repo has **not settled within the cap**, **stop and surface** the diff to the maintainer —
   do **not** keep looping. A non-converging file is a bug in ownership/pins to investigate, not
   something to brute-force.

Convergence is reached when, for every in-scope repo: `cyanprint update` is a no-op, snapshots/
fixtures show the new baseline, and PR CI is green.

## Per-repo acceptance (apply to each wave)

- `cyanprint test … --parallel 1` green.
- Snapshots/fixtures regenerated and show the new baseline (e.g. `nixos-26.05` + `nix-registry/v3`).
- The repo's own dev env builds: `direnv exec . nix develop -c true`.
- Generated CI is nix-based (`nix develop .#ci -c cyanprint test … --parallel 1` on an nscloud runner
  with `actions.setup-nix`); no apt `setup-ubuntu.sh` in the test path.
- After convergence: `cyanprint update` is a no-op; PR CI green. **Never merge / never push locally.**

## Git safety

- PR per repo on a dedicated branch; never push to `main`/`master`; never force-push.
- Never `cyanprint push` locally — publishing is the user's merge → release CD.
- Leave the actual merge to the user; this skill stops at "PR green, waiting for merge".
