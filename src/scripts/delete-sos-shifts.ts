import { getClient } from '../lib/calendar';

import { deleteShiftsByBatchId } from '../services/sosShifts';
import readline from 'readline';

/* eslint-disable no-console */

/**
 * Entry point for the script
 * @returns {Promise<void>}
 */
function main() {
  const client = getClient();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Please provide the batch ID: ', async (batchId) => {
    rl.close();
    if (batchId !== '') {
      await deleteShiftsByBatchId(client, batchId);
      console.log('Operation successful');
    } else {
      console.log('Operation cancelled');
    }
  });
}

main();
