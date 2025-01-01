import { PluginOutput, StartPluginWithLambda } from "@atomicloud/cyan-sdk";

StartPluginWithLambda(async (input): Promise<PluginOutput> => {
  return { directory: input.directory };
});
