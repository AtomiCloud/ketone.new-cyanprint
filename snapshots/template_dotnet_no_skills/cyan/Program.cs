using sulfone_helium;
using sulfone_helium.Domain.Core;

CyanEngine.StartTemplate(args, async (inquirer, determinism) =>
{
    return new Cyan
    {
        Processors = [
// {{processorsConfig}}
        ],
        Plugins = [
// {{pluginsConfig}}
        ],
    };
});