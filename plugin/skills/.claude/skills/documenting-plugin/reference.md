# README Template for CyanPrint Plugins

Use this template when generating README.MD for a plugin. Replace all `{placeholder}` values with actual content extracted from the plugin's `cyan.yaml` and entry point code.

---

# {artifact-name}

{description}

## Purpose

{purpose}

This plugin operates as a **{validation|transformation}** plugin. It receives the generated directory and {validates files/transforms files} using native OS operations.

## Configuration Schema

| Key          | Type   | Default         | Description   |
| ------------ | ------ | --------------- | ------------- |
| {config-key} | {type} | {default-value} | {description} |

## Behavior

### What this plugin does

- Describe the main operations the plugin performs
- List files it reads, modifies, or validates
- Describe any commands it executes

### Error/Warning Messages

{error-messages}

| Condition   | Severity      | Message        |
| ----------- | ------------- | -------------- |
| {condition} | error/warning | {message text} |

## Integration Example

Reference this plugin in your template's `cyan.yaml`:

```yaml
plugins: [username/plugin-name:version]
```

## Requirements

- List any external tools or dependencies the plugin expects to be available
- List any file structure assumptions
