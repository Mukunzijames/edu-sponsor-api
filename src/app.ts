import express from 'express';

import dotenv from 'dotenv';
import routes from './routes';
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";
import cors from "cors";
import { rawBodyMiddleware, jsonParserMiddleware } from './middleware/stripe';
import path from 'path';

dotenv.config();

const app = express();

app.use(cors());

// Use raw body middleware for Stripe webhooks
app.use(rawBodyMiddleware);
app.use(jsonParserMiddleware);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

app.use("/api", routes);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;