import { GlobType, QuestionType, StartTemplateWithLambda } from '@atomicloud/cyan-sdk';

StartTemplateWithLambda(async (i, d) => {
  const name = await i.text('What is your name?');

  const age = await i.text({
    message: 'How old are you?',
    type: QuestionType.Text,
    validate: v => {
      try {
        const n = parseInt(v);
        if (n < 19) {
          return 'Age needs to be large than 19';
        }
        if (n > 150) return 'Age needs to be less than 150';
        return null;
      } catch {
        return 'Please enter a number';
      }
    },
  });

  return {
    processors: [
      {
        name: 'cyan/default',
        files: [
          {
            glob: '**/*',
            type: GlobType.Template,
            exclude: ['scripts', '.github', 'cyan.yaml'],
          },
        ],
        config: {
          vars: {
            name,
            age,
          },
          parser: {
            varSyntax: [['{{', '}}']],
          },
        },
      },
    ],
    plugins: [],
  };
});
