import { type Cyan, type CyanGlob, GlobType, type IInquirer } from '@atomicloud/cyan-sdk';

export async function PromptProcessor(
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
    Typescript: ['**/writing-processor-javascript/**', '**/writing-processor-python/**', '**/writing-processor-dotnet/**'],
    Javascript: ['**/writing-processor-typescript/**', '**/writing-processor-python/**', '**/writing-processor-dotnet/**'],
    Python: ['**/writing-processor-typescript/**', '**/writing-processor-javascript/**', '**/writing-processor-dotnet/**'],
    'C#': ['**/writing-processor-typescript/**', '**/writing-processor-javascript/**', '**/writing-processor-python/**'],
  };

  const skillsGlobs: CyanGlob[] =
    includeSkills === 'yes'
      ? [
          {
            root: 'processor/skills',
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
            root: 'processor/common',
            exclude: [],
            glob: '**/*',
            type: GlobType.Copy,
          },
          {
            root: 'processor',
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
      root: 'processor/dotnet',
      glob: '**/*',
      type: GlobType.Template,
      exclude: [],
    },
  ];
}

function PythonValues(): CyanGlob[] {
  return [
    {
      root: 'processor/python',
      glob: '**/*',
      type: GlobType.Template,
      exclude: [],
    },
  ];
}

function JavascriptValues(): CyanGlob[] {
  return [
    {
      root: 'processor/javascript',
      glob: '**/*',
      type: GlobType.Template,
      exclude: [],
    },
  ];
}

function TypescriptValues(): CyanGlob[] {
  return [
    {
      root: 'processor/typescript',
      glob: '**/*',
      type: GlobType.Template,
      exclude: [],
    },
  ];
}
