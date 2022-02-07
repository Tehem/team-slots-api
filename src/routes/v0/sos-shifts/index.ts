import * as express from 'express';

import { deleteSosShift, deleteSosShiftValidator, postSosShift, postSosShiftValidator } from './sos-shifts.controller';

const router = express.Router();

router.post('/', postSosShiftValidator, postSosShift);
router.delete('/', deleteSosShiftValidator, deleteSosShift);

export default router;
