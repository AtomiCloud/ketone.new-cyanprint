# CyanPrint Resolver Test Reference

## test.cyan.yaml Format

```yaml
test_cases:
  - name: 'deep-merge-json'
    description: 'Deep merge two JSON files from different templates'
    resolver_inputs:
      - path: 'package.json'
        content: |
          {
            "name": "base-project",
            "version": "1.0.0",
            "dependencies": {
              "lodash": "^4.0.0"
            }
          }
        origin:
          template: 'base-template'
          layer: 0
      - path: 'package.json'
        content: |
          {
            "dependencies": {
              "express": "^4.0.0"
            },
            "devDependencies": {
              "typescript": "^5.0.0"
            }
          }
        origin:
          template: 'extended-template'
          layer: 1
    config:
      strategy: deep-merge
      preserveKeys:
        - name
        - version
    validate:
      - command: "jq '.name' package.json | grep -q 'base-project'"
        description: 'Name preserved from base'
      - command: "jq '.dependencies | keys | length' package.json | grep -q '2'"
        description: 'Dependencies merged'
    snapshots:
      - path: 'package.json'
        name: 'deep-merged-package'

  - name: 'priority-by-layer'
    description: 'Higher layer number takes priority'
    resolver_inputs:
      - path: 'settings.yaml'
        content: |
          debug: false
          logLevel: info
        origin:
          template: 'base'
          layer: 0
      - path: 'settings.yaml'
        content: |
          debug: true
          logLevel: debug
        origin:
          template: 'dev-overlay'
          layer: 2
      - path: 'settings.yaml'
        content: |
          debug: false
          logLevel: warn
        origin:
          template: 'production'
          layer: 1
    config:
      strategy: highest-layer-wins
    snapshots:
      - path: 'settings.yaml'
        name: 'priority-resolved-settings'

  - name: 'commutativity-check-order-1'
    description: 'Verify same result regardless of input order (order 1)'
    resolver_inputs:
      - path: 'config.json'
        content: '{"a": 1}'
        origin:
          template: 'template-a'
          layer: 0
      - path: 'config.json'
        content: '{"b": 2}'
        origin:
          template: 'template-b'
          layer: 1
    config:
      strategy: deep-merge
    snapshots:
      - path: 'config.json'
        name: 'commutative-merge-result'

  - name: 'commutativity-check-order-2'
    description: 'Verify same result regardless of input order (order 2)'
    resolver_inputs:
      - path: 'config.json'
        content: '{"b": 2}'
        origin:
          template: 'template-b'
          layer: 1
      - path: 'config.json'
        content: '{"a": 1}'
        origin:
          template: 'template-a'
          layer: 0
    config:
      strategy: deep-merge
    snapshots:
      - path: 'config.json'
        name: 'commutative-merge-result'

  - name: 'three-way-merge'
    description: 'Resolve conflict from three different templates'
    resolver_inputs:
      - path: 'tsconfig.json'
        content: |
          {
            "compilerOptions": {
              "target": "ES2020",
              "lib": ["ES2020"]
            }
          }
        origin:
          template: 'base'
          layer: 0
      - path: 'tsconfig.json'
        content: |
          {
            "compilerOptions": {
              "lib": ["DOM"],
              "jsx": "react"
            }
          }
        origin:
          template: 'web'
          layer: 1
      - path: 'tsconfig.json'
        content: |
          {
            "compilerOptions": {
              "strict": true
            }
          }
        origin:
          template: 'strict'
          layer: 2
    config:
      strategy: deep-merge
      arrayStrategy: unique-concat
    snapshots:
      - path: 'tsconfig.json'
        name: 'three-way-merged-tsconfig'
```

## Key Points

### resolver_inputs

- All entries in `resolver_inputs` **must have the same `path`** — they represent conflicting versions of the same file
- Each entry has an `origin` with both `template` (string) and `layer` (number)
- **`layer` is a number** (0, 1, 2, etc.), NOT a string — do not quote it

### origin structure

```yaml
origin:
  template: 'template-name' # string: which template produced this file
  layer: 0 # number: layer number (numeric priority)
```

### config

The `config` section maps directly to `input.config` in the resolver code. Use keys that match what the resolver reads.

### snapshots

Snapshots capture the expected resolved output. They are stored in `__snapshots__/{test-case-name}/`:

```
__snapshots__/
├── deep-merge-json/
│   └── deep-merged-package.snap
├── priority-by-layer/
│   └── priority-resolved-settings.snap
└── commutativity-check-order-1/
    └── commutative-merge-result.snap
```

### validate

Optional commands run against the resolved output to check specific properties:

```yaml
validate:
  - command: "jq '.key' file.json | grep -q 'expected'"
    description: 'Human-readable check description'
```

## Running Tests

```bash
# Run all tests
cyanprint test resolver .

# Update snapshots
cyanprint test resolver . --update-snapshots

# Verbose output
cyanprint test resolver . --verbose

# Specific test case
cyanprint test resolver . --case "deep-merge-json"
```
