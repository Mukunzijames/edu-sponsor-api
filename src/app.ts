import express from 'express';

import dotenv from 'dotenv';
import routes from './routes';
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;