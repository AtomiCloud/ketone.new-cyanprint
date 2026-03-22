# Plan 3: Claude Code Skills & CLAUDE.md

**Spec sections**: Part E (all)

## Overview

Create 12 Claude Code skills (3 per artifact type) and 4 CLAUDE.md files, stored in each artifact directory. Add a yes/no question to the meta-template to conditionally include them via `GlobType.Copy`. Skills must be created BEFORE testing (Plan 4) since tests cover the skills-included variants.

## Steps

### 3.1 Create skill directory structure

Each artifact type gets 3 skills in `{artifact}/skills/`:

```
{artifact}/skills/
├── writing-{artifact}/
│   └── SKILL.md
├── documenting-{artifact}/
│   └── SKILL.md
└── testing-{artifact}/
    └── SKILL.md
```

The generated output places these at `.claude/skills/` via GlobType.Copy.

### 3.2 Write template skills (3 files)

**`template/skills/writing-template/SKILL.md`**:

- YAML front matter: `name: writing-template`, `description: Guide for writing CyanPrint templates`
- How templates work: `StartTemplateWithLambda` entry point, `Cyan`/`CyanGlob`/`GlobType` types, `IInquirer` for user prompts, variable syntax `{{ }}`
- **How to search the CyanPrint registry** for processors/plugins/resolvers to use:
  - Registry API base: `https://api.zinc.sulfone.raichu.cluster.atomi.cloud/api/v1/`
  - Search: `GET /api/v1/{Template,Processor,Plugin,Resolver}?Search=<query>&Limit=<n>&Skip=<n>`
  - Get by slug: `GET /api/v1/{Type}/slug/{username}/{name}` — returns full details + README
  - Browse web: `https://cyanprint.dev/registry`
- **Default processor**: `cyan/default` (always used — the standard CyanPrint template processor)
- Note: In the future, common plugins and resolvers should be documented here too

**`template/skills/documenting-template/SKILL.md`**:

- How to USE this template: what command to run (`cyanprint create {username}/{name}`)
- What question KEYS are used (the `id` fields in `IInquirer` calls): list all keys from `standardCyanModel()` + template-specific keys with their `cyan/new/` prefix (e.g., `cyan/new/username`, `cyan/new/name`, `cyan/new/description`, `cyan/new/email`, `cyan/new/more-tags/{N}`, `cyan/new/tag/{N}`, `cyan/new/project`, `cyan/new/source`)
- What each question means and what values to provide
- What the generated output directory structure looks like

**`template/skills/testing-template/SKILL.md`**:

- How to write `test.cyan.yaml` for templates
- `answer_state` + `deterministic_state` format
- `validate` commands for validation
- Fixture directories structure
- `cyanprint test template` command

### 3.3 Write processor skills (3 files)

**`processor/skills/writing-processor/SKILL.md`**:

- How processors work: SDK entry points (`StartProcessorWithLambda` / `start_processor_with_fn` / `CyanEngine.StartProcessor`)
- `ProcessorInput` (config + readDir), `ProcessorOutput` (records of path→content)
- Stream-based file transformation pattern

**`processor/skills/documenting-processor/SKILL.md`**:

- How to USE this processor: what config to pass in (generically), how to reference it in a template's `processors:` array, what it transforms
- Example of using a processor reference in a template's `cyan.yaml`

**`processor/skills/testing-processor/SKILL.md`**:

- How to write `test.cyan.yaml` for processors: `input` dir + `config`, snapshots/, `cyanprint test processor`

### 3.4 Write plugin skills (3 files)

**`plugin/skills/writing-plugin/SKILL.md`**:

- How plugins work: SDK entry points (`StartPluginWithLambda` / `start_plugin_with_fn` / `CyanEngine.StartPlugin`)
- `PluginOutput`, directory passthrough, validation vs transformation

**`plugin/skills/documenting-plugin/SKILL.md`**:

- How to USE this plugin: what config to pass in, how to reference it in a template's `plugins:` array, what it validates/transforms

**`plugin/skills/testing-plugin/SKILL.md`**:

- How to write `test.cyan.yaml` for plugins: `validate` commands, snapshots/, `cyanprint test plugin`

### 3.5 Write resolver skills (3 files)

**`resolver/skills/writing-resolver/SKILL.md`**:

- How resolvers work: SDK entry points (`StartResolverWithLambda` / `start_resolver_with_fn` / `CyanEngine.StartResolver`)
- `ResolverInput` (config + files array with path/content/origin), `ResolverOutput` (path + content)
- Multi-origin conflict resolution, template/layer concept
- Used directly in template definition via `resolvers:` field in `cyan.yaml`

**`resolver/skills/documenting-resolver/SKILL.md`**:

- How to USE this resolver: how it's referenced in a template's `resolvers:` array in `cyan.yaml`, what conflicts it resolves, how it receives `ResolverInput` with multi-origin files

**`resolver/skills/testing-resolver/SKILL.md`**:

- How to write `test.cyan.yaml` for resolvers: `resolver_inputs` (path + origin.template + origin.layer), snapshots/, `cyanprint test resolver`

### 3.6 Write 4 CLAUDE.md files

Create artifact-specific CLAUDE.md at each artifact root:

**`template/CLAUDE.MD`**:

- Project overview: what this template is
- Key files: `cyan/index.ts`, `cyan.yaml`, `cyan/Dockerfile`, `cyan/blob.Dockerfile`, `test.cyan.yaml`
- Development workflow: edit → test → publish
- SDK types: `Cyan`, `CyanGlob`, `GlobType`, `IInquirer`
- Build/Push: how `build:` section works, `cyanprint push template --build`
- Testing: `cyanprint test template`, answer_state format
- Project structure diagram

**`processor/CLAUDE.MD`**, **`plugin/CLAUDE.MD`**, **`resolver/CLAUDE.MD`** — same sections adapted for each artifact type.

### 3.7 Add skills question to meta-template

In `cyan/index.ts`, after the `langType` selection and before `standardCyanModel`:

```typescript
const includeSkills = await inquirer.select(
  'Include Claude Code skills and CLAUDE.md?',
  ['yes', 'no'],
  `${prefix}skills`,
);
```

Key resolves to `cyan/new/skills`. Pass `includeSkills` through to each `Prompt*` function.

### 3.8 Update `cyan/src/resolver.ts` for conditional skills

In `PromptResolver`, when `includeSkills === 'yes'`, add two extra `CyanGlob` entries:

```typescript
{
  root: "resolver/skills",
  exclude: [],
  glob: "**/*",
  type: GlobType.Copy,
  dest: ".claude/skills",
},
{
  root: "resolver",
  exclude: [],
  glob: "CLAUDE.MD",
  type: GlobType.Copy,
}
```

When `includeSkills === 'no'`, omit these entries.

### 3.9 Update `cyan/src/plugin.ts` for conditional skills

Same pattern as resolver — add conditional skills + CLAUDE.MD globs.

### 3.10 Update `cyan/src/processor.ts` for conditional skills

Same pattern.

### 3.11 Update `cyan/src/template.ts` for conditional skills

Same pattern, but skills root is `template/skills` and CLAUDE.MD root is `template`.

### 3.12 Update function signatures

All `Prompt*` functions need the `includeSkills` parameter:

- `PromptTemplate(inquirer, langType, vars, includeSkills)`
- `PromptPlugin(inquirer, langType, vars, includeSkills)`
- `PromptProcessor(inquirer, langType, vars, includeSkills)`
- `PromptResolver(inquirer, langType, vars, includeSkills)`

## Acceptance criteria

- 12 skill files exist in `{artifact}/skills/{skill-name}/SKILL.md` with YAML front matter
- 4 CLAUDE.MD files exist in `{template,processor,plugin,resolver}/CLAUDE.MD`
- Skills question at key `cyan/new/skills` appears in meta-template flow
- When "yes": `.claude/skills/` and `CLAUDE.MD` included in generated output
- When "no": neither included
- writing-template documents CyanPrint registry API search endpoints
- writing-template mentions default processor `cyan/default`
- documenting skills explain how to USE the artifact (question keys, commands, config)
- testing skills explain how to write test.cyan.yaml
- Skill content is self-contained (no external doc dependencies)
