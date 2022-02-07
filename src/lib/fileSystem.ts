import fs from 'fs';
import logger from './logger';

const fileExistsAndHasAccess = (path: string, accessMode: number) => {
  try {
    fs.accessSync(path, accessMode);
    return true;
  } catch (err) {
    logger.info(`File does not exist or does not match mode ${accessMode}`);
    return false;
  }
};

export const fileExistsAndReadable = (path: string) => {
  return fileExistsAndHasAccess(path, fs.constants.R_OK);
};

export const fileExistsAndWritable = (path: string) => {
  return fileExistsAndHasAccess(path, fs.constants.R_OK | fs.constants.W_OK);
};

export const createDirIfNotExists = (path: string) => {
  if (fs.existsSync(path)) {
    return;
  }
  try {
    logger.debug('Creating directory', { path: path });
    fs.mkdirSync(path);
  } catch (err: any) {
    if (err.code === 'EEXIST') {
      // curDir already exists!
      return;
    }
    logger.error('Cannot create directory', { path: path, err });
  }
};

export const readJSONFile = (path: string, defaultValue: Array<unknown> | Record<string, unknown> = []) => {
  if (!fileExistsAndReadable(path)) return defaultValue;
  try {
    logger.debug('Reading file', { path });
    const rawData = fs.readFileSync(path, 'utf8');
    return JSON.parse(rawData);
  } catch (err) {
    logger.error('Cannot read file', { path, err });
    return defaultValue;
  }
};

export const writeJSONFile = (path: string, content: Array<unknown> | Record<string, unknown>) => {
  try {
    logger.debug('Writing file', { path });
    fs.writeFileSync(path, JSON.stringify(content));
  } catch (err) {
    logger.error('Cannot write file', { path, err });
  }
};
