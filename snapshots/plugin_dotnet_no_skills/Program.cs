using sulfone_helium;
using sulfone_helium.Domain.Plugin;

CyanEngine.StartPlugin(args, async (input) =>
{
    var (dir, config) = input;
    return new PluginOutput(dir);
});