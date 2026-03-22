import { type Cyan, type CyanGlob, GlobType, type IInquirer } from '@atomicloud/cyan-sdk';

export async function PromptTemplate(
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
    Typescript: ['**/writing-template-javascript/**', '**/writing-template-python/**', '**/writing-template-dotnet/**'],
    Javascript: ['**/writing-template-typescript/**', '**/writing-template-python/**', '**/writing-template-dotnet/**'],
    Python: ['**/writing-template-typescript/**', '**/writing-template-javascript/**', '**/writing-template-dotnet/**'],
    'C#': ['**/writing-template-typescript/**', '**/writing-template-javascript/**', '**/writing-template-python/**'],
  };

  const skillsGlobs: CyanGlob[] =
    includeSkills === 'yes'
      ? [
          {
            root: 'template/skills',
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
            root: 'template/common',
            exclude: [],
            glob: '**/*',
            type: GlobType.Copy,
          },
          {
            root: 'template',
            exclude: [],
            glob: 'cyan.yaml',
            type: GlobType.Template,
          },
          ...skillsGlobs,
        ],
        config: {
          vars,
          parser: {
            varSyntax: [
              ['{{', '}}'],
              ['// {{', '}}'],
              ['# {{', '}}'],
            ],
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
      root: 'template/dotnet',
      glob: '**/*',
      type: GlobType.Template,
      exclude: [],
    },
  ];
}

function PythonValues(): CyanGlob[] {
  return [
    {
      root: 'template/python',
      glob: '**/*',
      type: GlobType.Template,
      exclude: [],
    },
  ];
}

function JavascriptValues(): CyanGlob[] {
  return [
    {
      root: 'template/javascript',
      glob: '**/*',
      type: GlobType.Template,
      exclude: [],
    },
  ];
}

function TypescriptValues(): CyanGlob[] {
  return [
    {
      root: 'template/typescript',
      glob: '**/*',
      type: GlobType.Template,
      exclude: [],
    },
  ];
}
