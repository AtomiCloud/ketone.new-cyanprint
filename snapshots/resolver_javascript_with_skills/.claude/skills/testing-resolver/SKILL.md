---
name: testing-resolver
description: Test this CyanPrint resolver. Use when the user asks to write resolver tests, add test cases with conflicting files, update snapshots, or debug resolver test failures. Covers test.cyan.yaml format with resolver_inputs (multiple files, same path), config, and snapshots.
---

# Testing this Resolver

## Step 1: Understand what to test

Read the entry point code (`cyan/index.ts` or equivalent) to find:

- What `input.config` keys the resolver reads (e.g., `config.strategy`, `config.preserveKeys`)
- What resolution strategy it uses (last-wins, deep-merge, priority-based)
- How it uses `FileOrigin` (template name, layer number)

## Step 2: Write test.cyan.yaml

Create a `test.cyan.yaml` file in the resolver root:

```yaml
test_cases:
  - name: 'merge-two-files'
    description: 'Merge two conflicting files'
    resolver_inputs:
      - path: 'config.yaml'
        content: 'version: 1'
        origin:
          template: 'template-a'
          layer: 0
      - path: 'config.yaml'
        content: 'version: 2'
        origin:
          template: 'template-b'
          layer: 1
    config:
      # Key each entry to YOUR resolver's actual config keys from the entry point
      strategy: highest-layer-wins
    snapshots:
      - path: 'config.yaml'
        name: 'resolved-output'
```

### resolver_inputs

Define multiple entries with **the same `path`** but different origins. This is the conflict being resolved:

```yaml
resolver_inputs:
  - path: 'config.yaml' # Same path for ALL entries
    content: 'version: 1'
    origin:
      template: 'template-a'
      layer: 0 # IMPORTANT: number, NOT string — do NOT quote it
  - path: 'config.yaml' # Same path
    content: 'version: 2'
    origin:
      template: 'template-b'
      layer: 1
```

### config

Keys must match the `input.config` keys your resolver actually reads. Extract them from the entry point code — do NOT invent fictional config keys.

### validate

Optional shell commands to verify output:

```yaml
validate:
  - command: "grep -q 'version: 2' config.yaml"
    description: 'Higher layer won'
```

### snapshots

Declare expected resolved output:

```yaml
snapshots:
  - path: 'config.yaml'
    name: 'resolved-output'
```

## Step 3: Run and iterate

```bash
# Run all resolver tests
cyanprint test resolver .

# Run with verbose output
cyanprint test resolver . --verbose

# Update snapshots after intentional changes
cyanprint test resolver . --update-snapshots
```

## Commutativity Testing

Always include tests that verify the resolver produces the same output regardless of input order:

```yaml
test_cases:
  - name: 'commutativity-order-1'
    resolver_inputs:
      - path: 'config.json'
        content: '{"a": 1}'
        origin: { template: 'a', layer: 0 }
      - path: 'config.json'
        content: '{"b": 2}'
        origin: { template: 'b', layer: 1 }
    config: { strategy: deep-merge }
    snapshots:
      - path: 'config.json'
        name: 'commutative-result'

  - name: 'commutativity-order-2'
    resolver_inputs:
      - path: 'config.json'
        content: '{"b": 2}'
        origin: { template: 'b', layer: 1 }
      - path: 'config.json'
        content: '{"a": 1}'
        origin: { template: 'a', layer: 0 }
    config: { strategy: deep-merge }
    snapshots:
      - path: 'config.json'
        name: 'commutative-result'
```

Both tests should snapshot to the same `commutative-result`.

See [reference.md](./reference.md) for complete examples.
