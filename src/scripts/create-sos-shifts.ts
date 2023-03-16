import path from 'path';
import {v4 as uuidv4} from 'uuid';
import config from '../config/index';

import {getClient} from '../lib/calendar';
import {readJSONFile} from '../lib/fileSystem';

import {
  computeCaptainShifts,
  computeMemberShifts,
  createCaptainShifts,
  createMemberShifts
} from '../services/sosShifts';
import readline from 'readline';

/* eslint-disable no-console */

/**
 * Entry point for the script
 * @returns {Promise<void>}
 */
function main() {
  const client = getClient();
  const uuid = uuidv4();
  const shiftsPerWeek = config.shifts.shiftsPerWeek;

  // captains in the order of creation
  const teamFile = path.join(__dirname, '/../config/team.json');
  const captains = readJSONFile(teamFile);
  if (captains.length === 0) {
    console.error('Configuration error : your team.json file is missing or empty, please create and fill a team.json file in config directory. See README.md for details.')
    return;
  }

  // mentors
  let mentors: string[] = [];
  if (config.shifts.useMentors) {
    const mentorFile = path.join(__dirname, '/../config/mentors.json');
    mentors = readJSONFile(mentorFile);
    if (mentors.length === 0) {
      console.error('Configuration error : your mentors.json file is missing or empty, please disable mentors in configuration or create and fill a mentors.json file in config directory. See README.md for details.');
      return;
    }
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const captainShifts = computeCaptainShifts(captains, mentors);
  console.log('About to create captain shifts: ', {captainShifts});

  let shifts: string[][] = [];
  if (config.shifts.useDailyShifts) {
    shifts = computeMemberShifts(captains, shiftsPerWeek);
    console.log('About to create shifts: ', {shifts});
  }

  rl.question('Do you confirm (yes)/no ? ', async (answer) => {
    rl.close();
    if (answer === 'yes') {
      await createCaptainShifts(client, uuid, captains, mentors);

      if (config.shifts.useDailyShifts) {
        await createMemberShifts(client, uuid, shifts);
      }
      console.log('Batch ID (for deletion): ', uuid);
    } else {
      console.log('Operation cancelled');
    }
  });
}

main();
