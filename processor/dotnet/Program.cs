using sulfone_helium;
using sulfone_helium.Domain.Processor;

CyanEngine.StartProcessor(args, async (input, fs) =>
{
    var (readDir, writeDir, globs, config) = input;
    return new ProcessorOutput(writeDir);
});