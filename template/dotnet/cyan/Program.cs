using sulfone_helium;
using sulfone_helium_domain.Core;

CyanEngine.StartTemplate(args, async (inquirer, determinism) =>
{
    return new Cyan
    {
        Processors = new[]
        {
{{processorsConfig}}
        },
        Plugins = new[]
        {
{{pluginsConfig}}
        },
    };
});