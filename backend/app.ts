require('dotenv').config();
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';

import indexRouter from './src/routes/index';

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json({ limit: '120mb' }));
app.use(express.urlencoded({ limit: '120mb', extended: true }));
app.use(bodyParser.json({ limit: '120mb' }));
app.use(bodyParser.urlencoded({ limit: '120mb', extended: true }));
app.use(cookieParser());

app.use('/api', indexRouter);

app.use(express.static(path.join(__dirname, 'public')));

export default app;