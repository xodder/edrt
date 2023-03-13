import { ModelOperations } from '@vscode/vscode-languagedetection';
import fs from 'fs';
import path from 'path';

const modelRootPath = path.resolve(
  'node_modules',
  '@vscode',
  'vscode-languagedetection',
  'model'
);

const modelOperations = new ModelOperations({
  modelJsonLoaderFunc: async () => {
    return fs.promises
      .readFile(path.resolve(modelRootPath, 'model.json'))
      .then((data) => JSON.parse(data.toString()));
  },
  weightsLoaderFunc: async () => {
    return fs.promises
      .readFile(path.resolve(modelRootPath, 'group1-shard1of1.bin'))
      .then((data) => data.buffer);
  },
});

const toVerboseVersion: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  md: 'markdown',
};

async function detectLanguage(content: string) {
  const result = await modelOperations.runModel(content);

  let language = 'plaintext';

  if (result.length) {
    const bestMatch = result[0];
    const isCertain = bestMatch.confidence > 0.2;
    const matchedLanguage = bestMatch.languageId;

    // if (isCertain || (!isCertain && matchedLanguage !== 'ini')) {
    if (isCertain) {
      language = toVerboseVersion[matchedLanguage] || matchedLanguage;
    }
  }

  return language;
}

export default detectLanguage;
