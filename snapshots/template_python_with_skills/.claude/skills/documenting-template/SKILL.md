---
name: documenting-template
description: Guide for documenting and using CyanPrint templates
---

# Documenting CyanPrint Templates

## How to Use This Template

### Creating a Project

To create a new project from this template, run:

```bash
cyanprint create {username}/{name}
```

Replace `{username}/{name}` with the template's full identifier (e.g., `cyan/new`).

### Interactive Prompts

When you run `cyanprint create`, the template will ask a series of questions. Each question has a unique key (the `id` field) that you can use for automation.

## Standard Question Keys

All CyanPrint templates use the `cyan/new/` prefix for their question keys:

| Key                      | Question                                  | Description                                                 |
| ------------------------ | ----------------------------------------- | ----------------------------------------------------------- |
| `cyan/new/create`        | What do you want to create?               | Choose: Template, Plugin, Processor, or Resolver            |
| `cyan/new/language`      | What language do you want to write in?    | Choose: Typescript, C#, Javascript, or Python               |
| `cyan/new/skills`        | Include Claude Code skills and CLAUDE.md? | Choose: yes or no - whether to include skills and CLAUDE.md |
| `cyan/new/username`      | CyanPrint username                        | Your username from https://cyanprint.dev                    |
| `cyan/new/name`          | Template name                             | Unique name under your account                              |
| `cyan/new/description`   | Template description                      | Short description of your template                          |
| `cyan/new/email`         | Email                                     | Your email address                                          |
| `cyan/new/more-tags/{N}` | Add a tag?                                | yes/no - whether to add another tag                         |
| `cyan/new/tag/{N}`       | Tag to add                                | The tag value (repeats for each tag)                        |
| `cyan/new/project`       | Project URL                               | Valid URL to this project's site                            |
| `cyan/new/source`        | Source URL                                | Valid URL to this project source code                       |

### Using Answer State for Automation

You can pre-answer questions using an answer state file:

```yaml
# answer_state.yaml
cyan/new/create: Template
cyan/new/language: Typescript
cyan/new/skills: yes
cyan/new/username: myuser
cyan/new/name: my-template
cyan/new/description: A sample template
cyan/new/email: user@example.com
cyan/new/project: https://example.com/project
cyan/new/source: https://github.com/example/project
```

Then run:

```bash
cyanprint create {username}/{name} --answers answer_state.yaml
```

## Generated Output Structure

After running `cyanprint create`, you'll get a directory structure like this:

```
{template-name}/
├── cyan/
│   ├── index.ts              # Template entry point
│   ├── src/
│   │   ├── standard.ts       # Standard prompting logic
│   │   ├── template.ts       # Template generation logic
│   │   ├── plugin.ts         # Plugin generation logic
│   │   ├── processor.ts      # Processor generation logic
│   │   ├── resolver.ts       # Resolver generation logic
│   │   └── util.ts           # Utility functions
│   ├── package.json          # Dependencies
│   └── tsconfig.json         # TypeScript config
├── template/                  # Template artifact files
│   ├── typescript/           # TypeScript template scaffolding
│   ├── javascript/           # JavaScript template scaffolding
│   ├── python/               # Python template scaffolding
│   ├── dotnet/               # C# template scaffolding
│   └── common/               # Shared files
├── plugin/                    # Plugin artifact files
│   ├── typescript/
│   ├── javascript/
│   ├── python/
│   ├── dotnet/
│   └── common/
├── processor/                 # Processor artifact files
│   ├── typescript/
│   ├── javascript/
│   ├── python/
│   ├── dotnet/
│   └── common/
├── resolver/                  # Resolver artifact files
│   ├── typescript/
│   ├── javascript/
│   ├── python/
│   ├── dotnet/
│   └── common/
├── cyan.yaml                 # CyanPrint metadata
├── CLAUDE.md                 # Claude Code instructions (if skills: yes)
├── .claude/
│   └── skills/               # Claude Code skills (if skills: yes)
└── README.md                 # Documentation
```

## Template Metadata (cyan.yaml)

The `cyan.yaml` file contains metadata about the template:

```yaml
info:
  name: {{ username }}/{{ name }}
  description: {{ description }}
  version: 1.0.0
  authors:
    - name: {{ username }}
      email: {{ email }}
  tags:
    {{- range $tag := .Tags }}
    - {{ $tag }}
    {{- end }}
  project: {{ project }}
  source: {{ source }}

build:
  blob: ghcr.io/{{ username }}/{{ name }}-blob
  template: ghcr.io/{{ username }}/{{ name }}-template
```

## Next Steps

After generating your template:

1. **Review the generated code**: Check `cyan/index.ts` for the entry point
2. **Customize prompts**: Modify `cyan/src/standard.ts` for custom questions
3. **Add template files**: Place your scaffolding files in the appropriate directories
4. **Test locally**: Run `cyanprint test template` to verify behavior
5. **Publish**: Use `cyanprint push template --build` to publish
