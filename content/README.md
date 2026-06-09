# Content

This directory is the **content library**: the durable, compounding asset of the project (see `docs/PLAN.md`). It is plain files in git: the app reads from here, and in Tier 2 the same files are deployed into hosted sandboxes.

## Layout

```
content/
  paths/                      # path manifests (ordered modules → unit ids)
    bgp-fundamentals.yaml
  units/                      # every unit, keyed by stable id (flat)
    <unit-id>/
      meta.yaml               # unit metadata (the spine)
      content.mdx             # teaching content (lessons & labs)
      # --- labs only below ---
      topology.clab.yml       # containerlab topology
      configs/                # per-node startup configs (the GUIDED starting state)
      tasks.yaml              # objectives + verification checks
      solution/               # answer-key configs + solution.mdx
```

Units are **flat and id-keyed**, not nested under paths. A path manifest references units by id, so the same unit could be reused across paths, and ordering/unlocks are derived from `prerequisites` rather than hand-maintained position.

## Unit types & lab modes

- `type: lesson`: theory. Just `meta.yaml` + `content.mdx`.
- `type: lab`: hands-on. Adds topology, configs, tasks, solution.
  - `mode: guided`: nodes boot partially configured; learner completes the task.
  - `mode: challenge`: blank slate; only base addressing. Same `tasks.yaml` grades it.

## Verification

`tasks.yaml` checks run a command on a node, parse JSON, and assert on a field. **Prefer JSON output** (`vtysh -c '... json'`) over regex on CLI text. Checks must be **idempotent and read-only**. In Tier 1 they render as a self-verify checklist; in Tier 2 the identical file becomes the auto-grader.

## Running a lab locally (Tier 1)

```bash
cd content/units/<unit-id>
containerlab deploy -t topology.clab.yml
docker exec -it clab-<lab-name>-r1 vtysh      # lab-name = topology `name:`
# ... do the lab ...
containerlab destroy -t topology.clab.yml
```
