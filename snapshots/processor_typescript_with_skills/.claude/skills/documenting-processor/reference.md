# Processor README Template

Use this template when generating README.MD for a CyanPrint processor.

---

# {artifact-name}

{description}

## Purpose

{purpose}

Describe what the processor does: variable substitution, code generation, file transformation, content injection, etc.

## Configuration Schema

| Key          | Type   | Default         | Description   |
| ------------ | ------ | --------------- | ------------- |
| {config-key} | {type} | {default-value} | {description} |

Extract these from the entry point code by finding all `input.config` property accesses.

## File Handling

{file-handling}

Describe:

- Which glob patterns are processed (from cyan.yaml)
- What glob types are used (Template globs are read for transformation, Copy globs are copied as-is)
- What transformations are applied to file content
- Whether new files are created or existing files are modified

## Before/After Examples

{before-after-examples}

### Input

```
// Example input file content before processing
```

### Output

```
// Example output file content after processing
```

## Integration

Reference this processor in a template's `cyan.yaml`:

```yaml
processors: [username/processor-name:version]
```
