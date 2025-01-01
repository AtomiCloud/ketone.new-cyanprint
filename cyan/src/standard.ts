// Ask the standard shared questions
import { IInquirer, QuestionType } from '@atomicloud/cyan-sdk';
import { usernameValidator } from './util.ts';
import isEmail from 'validator/lib/isEmail';
import isURL from 'validator/lib/isURL';

export async function standardCyanModel(
  inquirer: IInquirer,
  cyanType: string,
): Promise<{
  project: string;
  source: string;
  username: string;
  name: string;
  desc: string;
  email: string;
  tags: string;
}> {
  const username = await inquirer.text({
    message: 'CyanPrint username',
    desc: 'You can find it in your profile in https://cyanprint.dev',
    type: QuestionType.Text,
    validate: usernameValidator('Username'),
  });

  const name = await inquirer.text({
    message: 'Template name',
    desc: 'Unique name under your account',
    type: QuestionType.Text,
    validate: usernameValidator('Template'),
  });

  const description = await inquirer.text({
    message: `${cyanType} description`,
    desc: `Short description of your ${cyanType.toLowerCase()}`,
    type: QuestionType.Text,
  });

  const email = await inquirer.text({
    message: 'Email',
    desc: 'Your email',
    type: QuestionType.Text,
    validate: e => (isEmail(e) ? null : 'Invalid email'),
  });

  const tags: string[] = [];
  let cont = (await inquirer.select('Add a tag?', ['yes', 'no'])) === 'yes';
  while (cont) {
    const tag = await inquirer.text({
      message: 'Tag to add',
      type: QuestionType.Text,
      validate: usernameValidator('Tag'),
    });
    tags.push(tag);
    cont = (await inquirer.select('Add a tag?', ['yes', 'no'])) === 'yes';
  }

  const project = await inquirer.text({
    message: 'Project URL',
    desc: "Valid URL to this project's site",
    type: QuestionType.Text,
    validate: url => (isURL(url, { require_protocol: true }) ? null : 'Invalid URL'),
  });

  const source = await inquirer.text({
    message: 'Source URL',
    desc: 'Valid URL to this project source code',
    type: QuestionType.Text,
    validate: url => (isURL(url, { require_protocol: true }) ? null : 'Invalid URL'),
  });

  return {
    project,
    source,
    username,
    name,
    desc: description,
    email,
    tags: JSON.stringify(tags),
  };
}
