import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

import routes from './routes/v0';

const app = express();

// health check endpoint
app.get('/healthcheck', (_, res) => res.sendStatus(200));

/** Body parser */
app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// global router
app.use('/api/v0', routes);

// error handlers
app.use(errorHandler);
app.use(notFoundHandler);

export default app;
