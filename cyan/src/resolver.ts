import { type Cyan, type CyanGlob, GlobType, type IInquirer } from '@atomicloud/cyan-sdk';

export async function PromptResolver(
  inquirer: IInquirer,
  langType: string,
  vars: any,
  includeSkills: string,
): Promise<Cyan> {
  const glob = (() => {
    if (langType == 'Typescript') {
      return TypescriptValues();
    } else if (langType == 'C#') {
      return CSharpValues();
    } else if (langType == 'Python') {
      return PythonValues();
    } else if (langType == 'Javascript') {
      return JavascriptValues();
    } else {
      throw new Error('Invalid language type');
    }
  })();

  const langSkillMap: Record<string, string[]> = {
    Typescript: ['**/writing-resolver-javascript/**', '**/writing-resolver-python/**', '**/writing-resolver-dotnet/**'],
    Javascript: ['**/writing-resolver-typescript/**', '**/writing-resolver-python/**', '**/writing-resolver-dotnet/**'],
    Python: ['**/writing-resolver-typescript/**', '**/writing-resolver-javascript/**', '**/writing-resolver-dotnet/**'],
    'C#': ['**/writing-resolver-typescript/**', '**/writing-resolver-javascript/**', '**/writing-resolver-python/**'],
  };

  const skillsGlobs: CyanGlob[] =
    includeSkills === 'yes'
      ? [
          {
            root: 'resolver/skills',
            exclude: langSkillMap[langType] ?? [],
            glob: '**/*',
            type: GlobType.Copy,
          },
        ]
      : [];

  return {
    processors: [
      {
        name: 'cyan/default',
        files: [
          ...glob,
          {
            root: 'resolver/common',
            exclude: [],
            glob: '**/*',
            type: GlobType.Copy,
          },
          {
            root: 'resolver',
            exclude: [],
            glob: 'cyan.yaml',
            type: GlobType.Template,
          },
          ...skillsGlobs,
        ],
        config: {
          vars,
          parser: {
            varSyntax: [['{{', '}}']],
          },
        },
      },
    ],
    plugins: [],
  };
}

function CSharpValues(): CyanGlob[] {
  return [
    {
      root: 'resolver/dotnet',
      glob: '**/*',
      type: GlobType.Template,
      exclude: [],
    },
  ];
}

function PythonValues(): CyanGlob[] {
  return [
    {
      root: 'resolver/python',
      glob: '**/*',
      type: GlobType.Template,
      exclude: [],
    },
  ];
}

function JavascriptValues(): CyanGlob[] {
  return [
    {
      root: 'resolver/javascript',
      glob: '**/*',
      type: GlobType.Template,
      exclude: [],
    },
  ];
}

function TypescriptValues(): CyanGlob[] {
  return [
    {
      root: 'resolver/typescript',
      glob: '**/*',
      type: GlobType.Template,
      exclude: [],
    },
  ];
}
