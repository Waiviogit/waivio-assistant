import * as fsp from 'node:fs/promises';
import * as path from 'node:path';
import { AGENTS } from '../constants/nodes';
import { dropWeaviateIndex, createWeaviateIndex } from '../store/weaviateStore';

const lunchAll = async (): Promise<void> => {
  const agentNames = Object.values(AGENTS).filter(
    (a) => a !== AGENTS.ObjectSearch,
  );

  for (const indexName of agentNames) {
    await dropWeaviateIndex(indexName);

    const filePath = path.join(__dirname, `../lib/${indexName}.txt`);
    const text = await fsp.readFile(filePath, 'utf8');
    await createWeaviateIndex({ text, indexName });
  }
};

lunchAll();
