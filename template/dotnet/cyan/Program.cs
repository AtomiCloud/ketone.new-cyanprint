using sulfone_helium;
using sulfone_helium.Domain.Core;

CyanEngine.StartTemplate(args, async (inquirer, determinism) =>
{
    var name = await inquirer.Text("Project name", "cyan/new/name");
    var description = await inquirer.Text("Project description", "cyan/new/description");
    var openVar = "{" + "{";
    var closeVar = "}" + "}";

    return new Cyan
    {
        Processors =
        [
            new CyanProcessor
            {
                Name = "cyan/default",
                Files =
                [
                    new CyanGlob
                    {
                        Root = "templates",
                        Glob = "**/*",
                        Type = GlobType.Template,
                        Exclude = [],
                    },
                ],
                Config = new
                {
                    vars = new { projectName = name, projectDescription = description },
                    parser = new
                    {
                        varSyntax = new[]
                        {
                            new[] { openVar, closeVar },
                            new[] { "// " + openVar, closeVar },
                            new[] { "# " + openVar, closeVar },
                        },
                    },
                },
            },
        ],
        Plugins = [],
    };
});
