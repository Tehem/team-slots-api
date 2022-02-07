import * as express from 'express';

import sosShifts from './sos-shifts';

const router = express.Router();

router.use('/sos-shifts', sosShifts);

export default router;
