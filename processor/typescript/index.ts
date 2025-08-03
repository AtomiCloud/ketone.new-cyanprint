import {
  type ProcessorOutput,
  StartProcessorWithLambda,
} from "@atomicloud/cyan-sdk";

StartProcessorWithLambda(
  async (input, fileHelper): Promise<ProcessorOutput> => {
    return { directory: input.writeDir };
  },
);
