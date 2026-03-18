using System;
using System.IO;
using sulfone_helium;
using sulfone_helium.Domain.Processor;

CyanEngine.StartProcessor(args, async (input, fs) =>
{
    var readDir = input.ReadDir;
    var writeDir = input.WriteDir;
    if (Directory.Exists(readDir))
    {
        foreach (var file in Directory.GetFiles(readDir, "*", SearchOption.AllDirectories))
        {
            var rel = Path.GetRelativePath(readDir, file);
            var dst = Path.Combine(writeDir, rel);
            Directory.CreateDirectory(Path.GetDirectoryName(dst));
            File.Copy(file, dst, true);
        }
    }
    return new ProcessorOutput(writeDir);
});