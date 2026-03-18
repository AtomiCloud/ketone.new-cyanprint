import { type ProcessorOutput, StartProcessorWithLambda } from '@atomicloud/cyan-sdk';

StartProcessorWithLambda(async (input, fileHelper): Promise<ProcessorOutput> => {
  for (const file of fileHelper.resolveAll()) {
    file.writeFile();
  }
  return { directory: input.writeDir };
});
