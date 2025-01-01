import { StartPluginWithLambda } from "@atomicloud/cyan-sdk";

StartPluginWithLambda(async (input) => {
  return { directory: input.directory };
});
