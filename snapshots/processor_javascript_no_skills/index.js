import { StartProcessorWithLambda } from '@atomicloud/cyan-sdk';

StartProcessorWithLambda(async (input, fileHelper) => {
  for (const file of fileHelper.resolveAll()) {
    file.writeFile();
  }
  return { directory: input.writeDir };
});
