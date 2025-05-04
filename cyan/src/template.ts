import {
  Cyan,
  CyanGlob,
  GlobType,
  IInquirer,
  QuestionType,
} from "@atomicloud/cyan-sdk";
import { indent, prefix, referenceValid } from "./util.ts";
import * as os from "os";

export async function PromptTemplate(
  inquirer: IInquirer,
  langType: string,
  vars: any,
): Promise<Cyan> {
  let processors: string[] = [];
  let plugins: string[] = [];
  
  let processorCount = 0;
  let processorQ = async () => await inquirer.select("Add a processor?", ["yes", "no"],`${prefix}more-processors/${processorCount}`) === "yes";

  while (await processorQ()) {
    const proc = await inquirer.text({
      message: "Processor to add",
      id: `${prefix}processor/${processorCount++}`,
      type: QuestionType.Text,
      desc: "Processors you are planning to use. You can find them at https://cyanprint.dev/registry",
      validate: referenceValid,
    });
    processors.push(proc);
  }

  let pluginCount = 0;
  let pluginQ = async () => await inquirer.select("Add a plugin?", ["yes", "no"],`${prefix}more-plugins/${pluginCount}`) === "yes";
  while (await pluginQ()) {
    const plug = await inquirer.text({
      message: "Plugin to add",
      id: `${prefix}plugin/${pluginCount++}`,
      type: QuestionType.Text,
      desc: "Plugins you are planning to use. You can find them at https://cyanprint.dev/registry",
      validate: referenceValid,
    });
    plugins.push(plug);
  }

  const [processorsConfig, pluginsConfig, glob] = (() => {
    if (langType == "Typescript") {
      return TypescriptValues(processors, plugins);
    } else if (langType == "C#") {
      return CSharpValues(processors, plugins);
    } else if (langType == "Python") {
      return PythonValues(processors, plugins);
    } else if (langType == "Javascript") {
      return JavascriptValues(processors, plugins);
    } else {
      throw new Error("Invalid language type");
    }
  })();

  return {
    processors: [
      {
        name: "cyan/default:7",
        files: [
          ...glob,
          {
            root: "template/common",
            exclude: [],
            glob: "**/*",
            type: GlobType.Copy,
          },
          {
            root: "template",
            exclude: [],
            glob: "cyan.yaml",
            type: GlobType.Template,
          },
        ],
        config: {
          vars: {
            ...vars,
            processors: JSON.stringify(processors),
            plugins: JSON.stringify(plugins),
            processorsConfig,
            pluginsConfig,
          },
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

function CSharpValues(
  processors: string[],
  plugins: string[],
): [string, string, CyanGlob[]] {
  const proc = processors
    .map(
      (p) => `new CyanProcessor
{
    Name = "${p}",
    Files = new List<CyanGlob>(),
    Config = new { }
},`,
    )
    .join(os.EOL);

  const plug = plugins
    .map(
      (p) => `new CyanPlugin
{
    Name = "${p}",
    Config = new { }
},`,
    )
    .join(os.EOL);

  return [
    indent(proc, 12),
    indent(plug, 12),
    [
      {
        root: "template/dotnet",
        glob: "**/*",
        type: GlobType.Template,
        exclude: [],
      },
    ],
  ];
}

function PythonValues(
  processors: string[],
  plugins: string[],
): [string, string, CyanGlob[]] {
  const proc = processors
    .map(
      (p) => `CyanProcessor(
    name="${p}",
    files=[],
    config={},
),`,
    )
    .join(os.EOL);

  const plug = plugins
    .map(
      (p) => `CyanProcessor(
    name="${p}",
    config={},
),`,
    )
    .join(os.EOL);

  return [
    indent(proc, 12),
    indent(plug, 12),
    [
      {
        root: "template/python",
        glob: "**/*",
        type: GlobType.Template,
        exclude: [],
      },
    ],
  ];
}

function JavascriptValues(
  processors: string[],
  plugins: string[],
): [string, string, CyanGlob[]] {
  const proc = processors
    .map(
      (p) => `{
  name: "${p}",
  files: [],
  config: {},
},`,
    )
    .join(os.EOL);
  const plug = plugins
    .map(
      (p) => `{
  name: "${p}",
  config: {},
},`,
    )
    .join(os.EOL);

  return [
    indent(proc, 6),
    indent(plug, 6),
    [
      {
        root: "template/javascript",
        glob: "**/*",
        type: GlobType.Template,
        exclude: [],
      },
    ],
  ];
}

function TypescriptValues(
  processors: string[],
  plugins: string[],
): [string, string, CyanGlob[]] {
  const proc = processors
    .map(
      (p) => `{
  name: "${p}",
  files: [],
  config: {},
},`,
    )
    .join(os.EOL);
  const plug = plugins
    .map(
      (p) => `{
  name: "${p}",
  config: {},
},`,
    )
    .join(os.EOL);

  return [
    indent(proc, 6),
    indent(plug, 6),
    [
      {
        root: "template/typescript",
        glob: "**/*",
        type: GlobType.Template,
        exclude: [],
      },
    ],
  ];
}
