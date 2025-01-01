import { StartProcessorWithLambda } from "@atomicloud/cyan-sdk";

StartProcessorWithLambda(async (input, fileHelper) => {
  return { directory: input.writeDir };
});
