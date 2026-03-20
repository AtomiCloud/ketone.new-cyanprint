using sulfone_helium;
using sulfone_helium.Domain.Resolver;

CyanEngine.StartResolver(args, async (input) =>
{
    var (config, files) = input;
    // Process files and return resolved output
    // Note: Resolver returns a single output; the engine may call this multiple times
    var file = files.FirstOrDefault();
    if (file != null)
    {
        return new ResolverOutput(file.Path, file.Content);
    }
    return new ResolverOutput("", "");
});
