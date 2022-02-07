import { z } from 'zod';
import { processRequestBody } from 'zod-express-middleware';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import logger from '../../../lib/logger';
import { getClient } from '../../../lib/calendar';
import {
  computeMemberShifts,
  createCaptainShifts,
  createMemberShifts,
  deleteShiftsByBatchId,
} from '../../../services/sosShifts';

const bodyPostSosShiftSchema = z.object({
  teamMembers: z.string().array().nonempty(),
  shiftsPerWeek: z.number(),
});

type BodyPostSosShift = z.infer<typeof bodyPostSosShiftSchema>;
export const postSosShiftValidator = processRequestBody(bodyPostSosShiftSchema);

/**
 * Post SosShift : create event
 */
export async function postSosShift(req: Request<unknown, unknown, BodyPostSosShift>, res: Response): Promise<Response> {
  logger.info('[sos-shifts.controller#postSosShift] Starting to create sos shifts', {
    body: req.body,
  });

  const uuid = uuidv4();

  try {
    const { teamMembers, shiftsPerWeek } = req.body;
    const client = getClient();

    await createCaptainShifts(client, uuid, teamMembers);

    const shifts = computeMemberShifts(teamMembers, shiftsPerWeek);

    await createMemberShifts(client, uuid, shifts);

    logger.info('[sos-shifts.controller#postSosShift] Sos Shifts successfully created', {
      teamMembers,
      shifts,
    });

    return res.status(200).json({ batchId: uuid, teamMembers, shifts });
  } catch (error) {
    logger.error('[sos-shifts.controller#postSosShift] Error creating sos shifts', {
      error,
      batchId: uuid,
      body: req.body,
    });

    return res.status(500).json({
      batchId: uuid,
      error: 'Error creating sos shifts'
    });
  }
}

const bodyDeleteSosShiftSchema = z.object({
  batchId: z.string(),
});

type BodyDeleteSosShift = z.infer<typeof bodyDeleteSosShiftSchema>;
export const deleteSosShiftValidator = processRequestBody(bodyDeleteSosShiftSchema);

/**
 * Delete sos shifts by batch id
 * @param {e.Request<unknown, unknown, BodyDeleteSosShift>} req
 * @param {e.Response} res
 * @returns {Promise<e.Response>}
 */
export async function deleteSosShift(
  req: Request<unknown, unknown, BodyDeleteSosShift>,
  res: Response,
): Promise<Response> {
  logger.info('[sos-shifts.controller#deleteSosShift] Starting to delete a sos shift', {
    body: req.body,
  });

  try {
    const { batchId } = req.body;
    const client = getClient();

    await deleteShiftsByBatchId(client, batchId);

    logger.info('[sos-shifts.controller#deleteSosShift] Sos Shifts successfully deleted', {
      batchId,
    });

    return res.status(200).json({ batchId });
  } catch (error) {
    logger.error('[sos-shifts.controller#deleteSosShift] Error deleting sos shifts', {
      error,
      body: req.body,
    });

    return res.status(500).json({ error: 'Error deleting sos shifts' });
  }
}
