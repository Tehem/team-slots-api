import fs from 'fs';
import path from 'path';
import { calendar_v3, google } from 'googleapis';

import logger from '../lib/logger';
import { calendarEvent } from '../services/calendarEvents';
import { writeIdToBatch } from './batches';
import { GaxiosResponse } from 'gaxios/build/src/common';
import Calendar = calendar_v3.Calendar;
import Schema$Event = calendar_v3.Schema$Event;

const credentialsPath = path.join(__dirname, '/../config/credentials.json');
const tokenPath = path.join(__dirname, '/../config/token.json');

let calendarClient: Calendar | null = null;

/**
 *
 * @returns {calendar_v3.Calendar}
 */
export const getClient = () => {
  if (calendarClient) return calendarClient;

  const credentialsRaw = fs.readFileSync(credentialsPath);
  const credentials = JSON.parse(credentialsRaw.toString());

  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  const tokenRaw = fs.readFileSync(tokenPath);
  const token = JSON.parse(tokenRaw.toString());

  oAuth2Client.setCredentials(token);

  calendarClient = google.calendar({ version: 'v3', auth: oAuth2Client });
  return calendarClient;
};

export const createMeeting = async (client: Calendar, event: calendarEvent, uuid: string) => {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result: GaxiosResponse<Schema$Event> = await client.events.insert({
      calendarId: 'primary',
      resource: {
        ...event,
        guestsCanModify: true,
        guestsCanInviteOthers: true,
        guestsCanSeeOtherGuests: true,
        transparency: 'transparent',
        visibility: 'public',
      },
    });

    logger.info('event created', { id: result.data.id, link: result.data.htmlLink });
    // console.log("event created", event);

    // write to batch
    if (result.data.id) {
      writeIdToBatch(uuid, result.data.id);
    }

    return result.data;
  } catch (err) {
    logger.error('There was an error contacting the Calendar service', { error: err });
    return null;
  }
};

export const deleteMeeting = async (client: Calendar, eventId: string) => {
  try {
    await client.events.delete({
      calendarId: 'primary',
      eventId,
    });
    logger.info(`event ${eventId} deleted`);
  } catch (err) {
    logger.error('There was an error deleting an event from calendar', { eventId, error: err });
  }
};
