import { DateTime, Settings } from 'luxon';
import { calendar_v3 } from 'googleapis';
import config from '../config/index';
import logger from '../lib/logger';
import { buildEvent } from './calendarEvents';
import { createMeeting, deleteMeeting } from '../lib/calendar';
import { readBatchIds } from '../lib/batches';

Settings.defaultZone = 'utc';

export const createCaptainShifts = async (client: calendar_v3.Calendar, uuid: string, emails: string[]) => {
  let currentWeek = DateTime.fromJSDate(new Date()).startOf('week').plus({ week: 1 });

  for (const captainEmail of emails) {
    const captainStartDate = currentWeek.toFormat('yyyy-LL-dd');
    const captainEndDate = currentWeek.plus({ day: 5 }).toFormat('yyyy-LL-dd');

    const attendees = [];
    if (config.shifts.supervisorEmail !== undefined) {
      attendees.push({ email: config.shifts.supervisorEmail, optional: true });
    }
    attendees.push({ email: captainEmail });

    const captainEvent = buildEvent('sos-captain-shift', {
      startDate: captainStartDate,
      endDate: captainEndDate,
      attendees,
      interval: emails.length,
      intervalUnit: 'weeks',
    });

    logger.debug('Create captain event', {
      captainStartDate,
      captainEndDate,
      captainEmail,
      attendees,
      interval: emails.length,
    });

    await createMeeting(client, captainEvent, uuid);
    await new Promise((r) => setTimeout(r, config.shifts.calendarSleepTimeMs));
    currentWeek = currentWeek.plus({ week: 1 });
  }
};

export const createMemberShifts = async (client: calendar_v3.Calendar, uuid: string, shifts: string[][]) => {
  let currentDay = DateTime.fromJSDate(new Date()).startOf('week').plus({ week: 1 });

  for (const weekShifts of shifts) {
    for (const shift of weekShifts) {
      const shiftDate = currentDay.toFormat('yyyy-LL-dd');

      const attendees = [];
      if (config.shifts.supervisorEmail !== undefined) {
        attendees.push({ email: config.shifts.supervisorEmail, optional: true });
      }
      attendees.push({ email: shift });

      const shiftEvent = buildEvent('sos-shift', {
        startDate: shiftDate,
        attendees,
        interval: shifts.length,
        intervalUnit: 'weeks',
      });

      logger.debug('Create shift event', {
        shiftDate,
        shiftEmail: shift,
        attendees,
        interval: shifts.length,
      });

      await createMeeting(client, shiftEvent, uuid);
      await new Promise((r) => setTimeout(r, config.shifts.calendarSleepTimeMs));
      currentDay = currentDay.plus({ day: 1 });
    }
    //start of next week
    currentDay = currentDay.startOf('week').plus({ week: 1 });
  }
};

export const computeMemberShifts = (emails: string[], shiftsPerWeek = 4): string[][] => {
  const teamSize = emails.length;
  let notCaptainPlusShift = true;
  let noShiftAfterCaptainWeek = true;
  let lastCaptain = emails[teamSize - 1];

  // intermediary storage array
  type weekArray = { captain: string; shifts: string[] }[];
  const weeks: weekArray = [];

  // sorted lists
  const sortedMembers = emails.slice(0);
  const sortedCounts = Array(teamSize).fill(0);

  // we try to not have the captain do a shift when he's already captain
  if (teamSize <= shiftsPerWeek) {
    notCaptainPlusShift = false;
    logger.info('Too much shifts for team size, will have people cumulating');
  }

  // we try to have the captain rest (no shift) on the week after his captain week
  if (shiftsPerWeek + 1 >= teamSize) {
    noShiftAfterCaptainWeek = false;
    logger.info('Too much shifts for team size, cannot rest the captain the week after');
  }

  let iterations = 0;
  do {
    const weekShifts = [];
    const captain = emails[iterations % emails.length];

    let plannedShiftsForWeek = 0;
    let members = sortedMembers.slice(0);
    logger.debug(`Computing shift for week #${iterations + 1} where the captain is ${captain}`);

    if (notCaptainPlusShift) {
      logger.debug(`Removing captain ${captain} -> no shift for a captain on duty`);
      members = members.filter((m) => m !== captain);
    }

    if (noShiftAfterCaptainWeek) {
      logger.debug(`Removing previous captain ${lastCaptain} -> resting from previous duty`);
      members = members.filter((m) => m !== lastCaptain);
    }

    logger.debug('Eligible members for a shift', { members });
    while (plannedShiftsForWeek < shiftsPerWeek) {
      const memberShift = members.shift();
      if (memberShift === undefined) break; // just for TS to stay calm...

      weekShifts.push(memberShift);
      plannedShiftsForWeek += 1;

      const memberCountIndex = sortedMembers.indexOf(memberShift);
      sortedCounts[memberCountIndex] += 1;
      logger.info(
        `--> Shift #${plannedShiftsForWeek} for ${memberShift} (personal count: ${sortedCounts[memberCountIndex]})`,
      );
    }

    logger.debug(` *** Week #${iterations + 1} shifts`, { shifts: weekShifts });
    logger.info(` *** Current counts`, { sortedCounts });

    // update sorted list based on new count for each member
    sortedMembers.sort((a, b) => sortedCounts[sortedMembers.indexOf(a)] - sortedCounts[sortedMembers.indexOf(b)]);
    sortedCounts.sort((a, b) => a - b);

    lastCaptain = captain;
    weeks.push({ captain, shifts: weekShifts });

    iterations += 1;
    // limit the number of computations for large teams or uneven shift count
  } while (iterations <= teamSize * 2 && sortedCounts[0] !== sortedCounts[sortedCounts.length - 1]);

  // only keep the shifts
  return weeks.map((week) => week.shifts);
};

export const deleteShiftsByBatchId = async (client: calendar_v3.Calendar, uuid: string) => {
  logger.info(`Deleting events from batch #${uuid}`);
  const shiftIdsList = readBatchIds(uuid);

  logger.info(`Deleting ${shiftIdsList.length} events...`);
  for (const shiftId of shiftIdsList) {
    await deleteMeeting(client, shiftId);
    await new Promise((r) => setTimeout(r, config.shifts.calendarSleepTimeMs));
  }
};
