import { type Cyan, type CyanGlob, GlobType, type IInquirer } from "@atomicloud/cyan-sdk";

export async function PromptPlugin(
  inquirer: IInquirer,
  langType: string,
  vars: any,
): Promise<Cyan> {
  const glob = (() => {
    if (langType == "Typescript") {
      return TypescriptValues();
    } else if (langType == "C#") {
      return CSharpValues();
    } else if (langType == "Python") {
      return PythonValues();
    } else if (langType == "Javascript") {
      return JavascriptValues();
    } else {
      throw new Error("Invalid language type");
    }
  })();

  return {
    processors: [
      {
        name: "cyan/default",
        files: [
          ...glob,
          {
            root: "plugin/common",
            exclude: [],
            glob: "**/*",
            type: GlobType.Copy,
          },
          {
            root: "plugin",
            exclude: [],
            glob: "cyan.yaml",
            type: GlobType.Template,
          },
        ],
        config: {
          vars,
          parser: {
            varSyntax: [
                ["{{", "}}"],
            ]
          }
        },
      },
    ],
    plugins: [],
  };
}

function CSharpValues(): CyanGlob[] {
  return [
    {
      root: "plugin/dotnet",
      glob: "**/*",
      type: GlobType.Template,
      exclude: [],
    },
  ];
}

function PythonValues(): CyanGlob[] {
  return [
    {
      root: "plugin/python",
      glob: "**/*",
      type: GlobType.Template,
      exclude: [],
    },
  ];
}

function JavascriptValues(): CyanGlob[] {
  return [
    {
      root: "plugin/javascript",
      glob: "**/*",
      type: GlobType.Template,
      exclude: [],
    },
  ];
}

function TypescriptValues(): CyanGlob[] {
  return [
    {
      root: "plugin/typescript",
      glob: "**/*",
      type: GlobType.Template,
      exclude: [],
    },
  ];
}
