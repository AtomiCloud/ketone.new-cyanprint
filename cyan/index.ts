import { Cyan, StartTemplateWithLambda, IInquirer, IDeterminism } from '@atomicloud/cyan-sdk';
import { standardCyanModel } from './src/standard.ts';
import { PromptTemplate } from './src/template.ts';
import { PromptPlugin } from './src/plugin.ts';
import { PromptProcessor } from './src/processor.ts';
import { prefix } from './src/util.ts';

StartTemplateWithLambda(async (inquirer: IInquirer, determinism: IDeterminism): Promise<Cyan> => {
  const cyanType = await inquirer.select(
    'What do you want to create?',
    ['Template', 'Plugin', 'Processor'],
    `${prefix}create`,
  );

  const langType = await inquirer.select(
    'What language do you want to write in?',
    ['Typescript', 'C#', 'Javascript', 'Python'],
    `${prefix}language`,
  );

  const vars = await standardCyanModel(inquirer, cyanType);

  if (cyanType === 'Template') {
    return PromptTemplate(inquirer, langType, vars);
  } else if (cyanType === 'Plugin') {
    return PromptPlugin(inquirer, langType, vars);
  } else if (cyanType === 'Processor') {
    return PromptProcessor(inquirer, langType, vars);
  } else {
    throw new Error('Invalid cyan type');
  }
});
