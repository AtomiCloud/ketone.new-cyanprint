import { type Cyan, StartTemplateWithLambda, type IInquirer, type IDeterminism } from '@atomicloud/cyan-sdk';
import { standardCyanModel } from './src/standard.ts';
import { PromptTemplate } from './src/template.ts';
import { PromptPlugin } from './src/plugin.ts';
import { PromptProcessor } from './src/processor.ts';
import { PromptResolver } from './src/resolver.ts';
import { prefix } from './src/util.ts';

StartTemplateWithLambda(async (inquirer: IInquirer, determinism: IDeterminism): Promise<Cyan> => {
  const cyanType = await inquirer.select(
    'What do you want to create?',
    ['Template', 'Plugin', 'Processor', 'Resolver'],
    `${prefix}create`,
  );

  const langType = await inquirer.select(
    'What language do you want to write in?',
    ['Typescript', 'C#', 'Javascript', 'Python'],
    `${prefix}language`,
  );

  const includeSkills = await inquirer.select(
    'Include Claude Code skills and CLAUDE.md?',
    ['yes', 'no'],
    `${prefix}skills`,
  );

  const vars = await standardCyanModel(inquirer, cyanType);

  if (cyanType === 'Template') {
    return PromptTemplate(inquirer, langType, vars, includeSkills);
  } else if (cyanType === 'Plugin') {
    return PromptPlugin(inquirer, langType, vars, includeSkills);
  } else if (cyanType === 'Processor') {
    return PromptProcessor(inquirer, langType, vars, includeSkills);
  } else if (cyanType === 'Resolver') {
    return PromptResolver(inquirer, langType, vars, includeSkills);
  } else {
    throw new Error('Invalid cyan type');
  }
});
