import validator from 'validator';
import os from 'node:os';
const isInt = validator.isInt;

const prefix = 'cyan/new/';

const indent = (input: string, indent: number) => {
  const lf = os.EOL;
  const ind = ' '.repeat(indent);
  return input
    .split(lf)
    .map(x => `${ind}${x}`)
    .join(lf);
};

const referenceValid = (input: string) => {
  let fullRef = input;

  if (input.includes(':')) {
    if (input.split(':').length !== 2) {
      return 'Invalid reference, can only have one colon';
    }
    const [fullref, version] = input.split(':');
    if (!isInt(version, { min: 0 })) {
      return 'Invalid reference, version must be a positive integer';
    }
    fullRef = fullref;
  }

  const parts = fullRef.split('/');
  if (parts.length !== 2) {
    return 'Invalid reference, must be in the format username/template or username/template:version';
  }
  const [username, template] = parts;
  const usernameError = usernameValidator('Reference username')(username);
  if (usernameError) return usernameError;
  const templateError = usernameValidator('Reference template')(template);
  if (templateError) return templateError;
  return null;
};

const usernameValidator = (type: string) => (input: string) => {
  if (input.length < 1 || input.length > 256) {
    return `${type} must be between 1 and 256 characters`;
  }
  if (!input.match(/^[a-z](\-?[a-z0-9]+)*$/)) {
    return `${type} can only contain alphanumeric characters and dashes, and cannot end or start with dashes or numbers`;
  }
  return null;
};

export { usernameValidator, referenceValid, indent, prefix };
