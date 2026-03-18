# Template Testing Reference

## test.cyan.yaml Format

```yaml
test_cases:
  - name: 'test-case-name'
    description: 'Description of what this test verifies'
    answer_state:
      # Keys here are YOUR prompt IDs from i.text(msg, id), i.select(msg, id, opts), etc.
      name: my-project
      language: TypeScript
      features:
        - docker
        - ci
      use_linting: true
    deterministic_state:
      # Keys here match d.get(key, ...) calls in your entry point
      timestamp: '1234567890'
      uuid: '00000000-0000-0000-0000-000000000000'
    validate:
      - command: 'test -f package.json'
        description: 'package.json exists'
      - command: 'test -d src'
        description: 'src directory exists'
      - command: "grep -q 'my-project' package.json"
        description: 'Project name appears in package.json'
    snapshots:
      - path: '.'
        name: 'full-output'
```

## Complete Example with Multiple Test Cases

```yaml
test_cases:
  - name: 'typescript-basic'
    description: 'Basic TypeScript project generation'
    answer_state:
      name: ts-project
      language: TypeScript
      description: A TypeScript project
      author: testuser
      use_docker: true
    deterministic_state:
      timestamp: '1700000000'
    validate:
      - command: 'test -f tsconfig.json'
        description: 'TypeScript config exists'
      - command: 'test -f Dockerfile'
        description: 'Dockerfile exists'
      - command: "grep -q 'ts-project' package.json"
        description: 'Project name in package.json'
    snapshots:
      - path: '.'
        name: 'ts-basic-output'

  - name: 'python-minimal'
    description: 'Minimal Python project without Docker'
    answer_state:
      name: py-project
      language: Python
      description: A Python project
      author: testuser
      use_docker: false
    deterministic_state:
      timestamp: '1700000000'
    validate:
      - command: 'test -f pyproject.toml'
        description: 'Python config exists'
      - command: 'test ! -f Dockerfile'
        description: 'No Dockerfile when Docker disabled'
    snapshots:
      - path: '.'
        name: 'py-minimal-output'
```

## Field Reference

### answer_state

Maps prompt IDs to their pre-filled values. The keys MUST match the `id` parameter used in your `IInquirer` calls:

| IInquirer Call                      | answer_state Value Type                   |
| ----------------------------------- | ----------------------------------------- |
| `i.text(msg, "name")`               | `name: "string value"`                    |
| `i.select(msg, "lang", opts)`       | `lang: "selected option"`                 |
| `i.checkbox(msg, "features", opts)` | `features: ["opt1", "opt2"]`              |
| `i.confirm(msg, "use_docker")`      | `use_docker: true` or `use_docker: false` |
| `i.password(msg, "token")`          | `token: "secret value"`                   |
| `i.dateSelect(msg, "date")`         | `date: "2024-01-15"`                      |

### deterministic_state

Maps `d.get()` keys to fixed values for deterministic test output:

| Code                                              | deterministic_state                            |
| ------------------------------------------------- | ---------------------------------------------- |
| `d.get("timestamp", () => Date.now().toString())` | `timestamp: "1234567890"`                      |
| `d.get("uuid", () => crypto.randomUUID())`        | `uuid: "00000000-0000-0000-0000-000000000000"` |

### validate

Shell commands executed in the generated output directory. Each must exit with code 0 to pass:

```yaml
validate:
  - command: 'test -f file.txt' # Check file exists
    description: 'file.txt exists'
  - command: 'test -d src' # Check directory exists
    description: 'src directory exists'
  - command: "grep -q 'text' file.txt" # Check file contents
    description: 'file.txt contains expected text'
```

### snapshots

Directories or files to snapshot for comparison:

```yaml
snapshots:
  - path: '.' # Snapshot entire output
    name: 'full-output'
  - path: 'src' # Snapshot just src directory
    name: 'source-files'
```

Snapshots are stored in `__snapshots__/` and updated with `cyanprint test template . --update-snapshots`.

## Running Tests

```bash
# Run all test cases
cyanprint test template .

# Update snapshots
cyanprint test template . --update-snapshots
```
