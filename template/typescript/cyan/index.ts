import {StartTemplateWithLambda} from "@atomicloud/cyan-sdk";

StartTemplateWithLambda(async (i, d) => {
  return {
    processors: [
// {{processorsConfig}}  
    ],
    plugins: [
// {{pluginsConfig}}
    ],
  }
});
