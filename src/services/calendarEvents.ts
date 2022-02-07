import path from 'path';
import { readJSONFile } from '../lib/fileSystem';

export type eventType = 'sos-shift' | 'sos-captain-shift';
export type eventIntervalUnit = 'days' | 'weeks' | 'months';

type attendee = {
  email: string;
  optional?: boolean;
};

export type eventProps = {
  startDate: string;
  endDate?: string;
  attendees: attendee[];
  interval: number;
  intervalUnit: eventIntervalUnit;
};

type eventDate = {
  date?: string;
  dateTime?: string;
  timeZone?: string;
};

export type calendarEvent = {
  summary: string;
  description: string;
  start: eventDate;
  end: eventDate;
  recurrence: string[];
  attendees: attendee[];
};

/**
 * Build an event object to pass to the sos-shifts lib
 *
 * @param {eventType} type : type of event to create
 * @param {eventProps} props : event properties
 * @returns {calendarEvent} the created event
 * @throws {Error} on unknown event type
 */
export const buildEvent = (type: eventType, props: eventProps): calendarEvent => {
  if (type === 'sos-captain-shift') {
    return buildCaptainEvent(props);
  } else if (type === 'sos-shift') {
    return buildShiftEvent(props);
  }

  throw new Error(`Unsupported event type ${type}`);
};

const getRecurrentRule = (interval: number, intervalUnit: eventIntervalUnit) => {
  const frequency = intervalUnit === 'days' ? 'DAILY' : intervalUnit === 'weeks' ? 'WEEKLY' : 'MONTHLY';
  return `RRULE:FREQ=${frequency};INTERVAL=${interval}`;
};

const buildShiftEvent = (event: eventProps): calendarEvent => {
  const templateFile = path.join(__dirname, '/../templates/sos-shift.template.json');
  const template = readJSONFile(templateFile, { summary: '', description: '' });
  const start = {
    dateTime: `${event.startDate}T8:00:00.000Z`,
    timeZone: 'Europe/Paris',
  };
  const end = {
    dateTime: `${event.startDate}T11:00:00.000Z`,
    timeZone: 'Europe/Paris',
  };
  const recurrence = [getRecurrentRule(event.interval, event.intervalUnit)];
  return {
    summary: template.summary || 'Shift',
    description: template.description || 'Shift description',
    start,
    end,
    recurrence,
    attendees: event.attendees,
  };
};

const buildCaptainEvent = (event: eventProps): calendarEvent => {
  const templateFile = path.join(__dirname, '/../templates/sos-captain-shift.template.json');
  const template = readJSONFile(templateFile, { summary: '', description: '' });
  const start = {
    date: `${event.startDate}`,
  };
  const end = {
    date: `${event.endDate}`,
  };
  const recurrence = [getRecurrentRule(event.interval, event.intervalUnit)];
  return {
    summary: template.summary || 'Captain Shift',
    description: template.description || 'Captain Shift description',
    start,
    end,
    recurrence,
    attendees: event.attendees,
  };
};
