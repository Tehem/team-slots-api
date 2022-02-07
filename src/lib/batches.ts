import path from 'path';
import { createDirIfNotExists, readJSONFile, writeJSONFile } from './fileSystem';

const BATCHES_PATH = path.join(__dirname, '/../../batches');

export const writeIdToBatch = (uuid: string, id: string) => {
  const batchFile = path.join(BATCHES_PATH, `/${uuid}.json`);
  const content = readBatchIds(uuid);
  content.push(id);
  createDirIfNotExists(BATCHES_PATH);
  writeJSONFile(batchFile, content);
};

export const readBatchIds = (uuid: string) => {
  const batchFile = path.join(BATCHES_PATH, `/${uuid}.json`);
  return readJSONFile(batchFile);
};
