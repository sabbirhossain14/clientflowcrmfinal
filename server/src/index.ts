import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import * as helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import routes from './routes/index.js';
import { errors, notFound } from './middleware/errors.js';

const app = express();

app.use(helmet.default());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));
app.get('/api/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));
app.use('/api', routes);
app.use(notFound);
app.use(errors);

const port = Number(process.env.PORT || 4000);
connectDB()
  .then(() => app.listen(port, () => console.info(`ClientFlow API listening on ${port}`)))
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
