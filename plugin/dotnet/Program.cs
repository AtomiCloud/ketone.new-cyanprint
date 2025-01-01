using sulfone_helium;
using sulfone_helium_domain.Plugin;

CyanEngine.StartPlugin(args, async (input) =>
{
    var (dir, config) = input;
    return new PluginOutput(dir);
});