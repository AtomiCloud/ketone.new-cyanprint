# Template SDK Reference

## Package Names

| Language   | Package                | Entry Point                |
| ---------- | ---------------------- | -------------------------- |
| TypeScript | `@atomicloud/cyan-sdk` | `StartTemplateWithLambda`  |
| JavaScript | `@atomicloud/cyan-sdk` | `StartTemplateWithLambda`  |
| Python     | `cyanprintsdk`         | `start_template_with_fn`   |
| C#         | `sulfone_helium`       | `CyanEngine.StartTemplate` |

## TypeScript

```typescript
import { StartTemplateWithLambda, type IInquirer, type IDeterminism, type Cyan, GlobType } from '@atomicloud/cyan-sdk';

StartTemplateWithLambda(async (i: IInquirer, d: IDeterminism): Promise<Cyan> => {
  const name = await i.text('Project name', 'name');
  const language = await i.select('Language', 'language', ['TypeScript', 'Python']);

  return {
    processors: [
      {
        name: 'cyan/default',
        files: [
          {
            root: `template/${language.toLowerCase()}`,
            glob: '**/*',
            exclude: [],
            type: GlobType.Template,
          },
        ],
        config: {
          vars: { name, language },
        },
      },
    ],
    plugins: [],
  };
});
```

## JavaScript

```javascript
const { StartTemplateWithLambda } = require('@atomicloud/cyan-sdk');

StartTemplateWithLambda(async (i, d) => {
  const name = await i.text('Project name', 'name');
  const language = await i.select('Language', 'language', ['TypeScript', 'Python']);

  return {
    processors: [
      {
        name: 'cyan/default',
        files: [{ root: `template/${language.toLowerCase()}`, glob: '**/*', type: 0, exclude: [] }],
        config: {
          vars: { name, language },
        },
      },
    ],
    plugins: [],
  };
});
```

## Python

```python
from cyanprintsdk import start_template_with_fn, IInquirer, IDeterminism, Cyan, CyanProcessor, CyanGlob, GlobType

def template_fn(i: IInquirer, d: IDeterminism) -> Cyan:
    name = i.text("Project name", "name")
    language = i.select("Language", "language", ["TypeScript", "Python"])

    return Cyan(
        processors=[
            CyanProcessor(
                name="cyan/default",
                files=[
                    CyanGlob(
                        root=f"template/{language.lower()}",
                        glob="**/*",
                        exclude=[],
                        type=GlobType.Template,
                    )
                ],
                config={"vars": {"name": name, "language": language}},
            )
        ],
        plugins=[],
    )

start_template_with_fn(template_fn)
```

## C#

```csharp
using sulfone_helium;

Cyan TemplateFn(IInquirer i, IDeterminism d)
{
    var name = i.Text("Project name", "name");
    var language = i.Select("Language", "language", new[] { "TypeScript", "Python" });

    return new Cyan
    {
        Processors = new[]
        {
            new CyanProcessor
            {
                Name = "cyan/default",
                Files = new[]
                {
                    new CyanGlob
                    {
                        Root = $"template/{language.ToLower()}",
                        Glob = "**/*",
                        Exclude = Array.Empty<string>(),
                        Type = GlobType.Template,
                    }
                },
                Config = new { vars = new { name, language } },
            }
        },
        Plugins = Array.Empty<CyanPlugin>(),
    };
}

CyanEngine.StartTemplate(TemplateFn);
```

## Type Definitions

### Cyan

```typescript
interface Cyan {
  processors: CyanProcessor[];
  plugins: CyanPlugin[];
}
```

### CyanProcessor

```typescript
interface CyanProcessor {
  name: string;
  files: CyanGlob[];
  config: unknown;
}
```

### CyanPlugin

```typescript
interface CyanPlugin {
  name: string;
  config: unknown;
}
```

### CyanGlob

```typescript
interface CyanGlob {
  root?: string;
  glob: string;
  exclude: string[];
  type: GlobType;
}
```

### GlobType

```typescript
enum GlobType {
  Template = 0, // Process {{var}} substitution
  Copy = 1, // Copy files as-is
}
```

### IInquirer

```typescript
interface IInquirer {
  text(msg: string, id: string): Promise<string>;
  textQ(options: {
    message: string;
    id: string;
    validate?(v: string): string | null;
    default?: string;
    initial?: string;
  }): Promise<string>;
  select(msg: string, id: string, options: string[]): Promise<string>;
  selectQ(options: { message: string; id: string; choices: { value: string; label: string }[] }): Promise<string>;
  checkbox(msg: string, id: string, options: string[]): Promise<string[]>;
  checkboxQ(options: { message: string; id: string; choices: { value: string; label: string }[] }): Promise<string[]>;
  confirm(msg: string, id: string): Promise<boolean>;
  confirmQ(options: { message: string; id: string; default?: boolean; errorMessage?: string }): Promise<boolean>;
  password(msg: string, id: string): Promise<string>;
  passwordQ(options: { message: string; id: string; confirmation?: boolean }): Promise<string>;
  dateSelect(msg: string, id: string): Promise<string>;
  dateSelectQ(options: {
    message: string;
    id: string;
    min?: string;
    max?: string;
    validate?(v: string): string | null;
  }): Promise<string>;
}
```

### IDeterminism

```typescript
interface IDeterminism {
  get(key: string, origin: () => string): string;
}
```

## Default Processor Config

The `cyan/default` processor accepts this config shape:

```typescript
{
  vars: Record<string, string>,    // Variables for {{var}} substitution
  varSyntax?: [string, string][],  // Custom delimiters, default [["{{", "}}"]]
}
```
