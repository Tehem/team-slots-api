import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getClient } from '../lib/calendar';
import { readJSONFile } from '../lib/fileSystem';

import { computeMemberShifts, createCaptainShifts, createMemberShifts } from '../services/sosShifts';
import readline from 'readline';

/* eslint-disable no-console */

/**
 * Entry point for the script
 * @returns {Promise<void>}
 */
function main() {
  const client = getClient();
  const uuid = uuidv4();
  const shiftsPerWeek = 3;

  // captains in the order of creation
  const teamFile = path.join(__dirname, '/../config/team.json');
  const captains = readJSONFile(teamFile);
  if (captains.length === 0) {
    console.log('Empty team');
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const shifts = computeMemberShifts(captains, shiftsPerWeek);
  console.log('About to create captain shifts: ', captains);
  console.log('About to create shifts: ', shifts);

  rl.question('Do you confirm (yes)/no ? ', async (answer) => {
    rl.close();
    if (answer === 'yes') {
      await createCaptainShifts(client, uuid, captains);
      await createMemberShifts(client, uuid, shifts);
      console.log('Batch ID: ', uuid);
    } else {
      console.log('Operation cancelled');
    }
  });
}

main();
