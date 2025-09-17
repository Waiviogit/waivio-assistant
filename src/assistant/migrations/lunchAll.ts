import * as fsp from 'node:fs/promises';
import * as path from 'node:path';
import { AGENTS, QA_COLLECTION } from '../constants/nodes';
import {
  dropWeaviateIndex,
  createWeaviateIndex,
  createQAWeaviateIndex,
} from '../store/weaviateStore';

const lunchAll = async (): Promise<void> => {
  const agentNames = Object.values(AGENTS);

  // Create regular agent collections
  for (const indexName of agentNames) {
    await dropWeaviateIndex(indexName);

    const filePath = path.join(__dirname, `../lib/${indexName}.txt`);
    const text = await fsp.readFile(filePath, 'utf8');
    await createWeaviateIndex({ text, indexName });
  }

  // Create QA collection
  await dropWeaviateIndex(QA_COLLECTION);
  const qaFilePath = path.join(__dirname, '../lib/qa.json');
  const qaText = await fsp.readFile(qaFilePath, 'utf8');
  const qaData = JSON.parse(qaText);
  await createQAWeaviateIndex(qaData, QA_COLLECTION);
};

lunchAll();
