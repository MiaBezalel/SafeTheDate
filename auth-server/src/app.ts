import express from "express";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import "./lib/dotenv-init";
import "./lib/reflect-metadata";
import helmet from "helmet";
import compression from "compression";
import healthRouter from "./routes/health.router";
import authRouter from "./routes/auth.router";
import cors from "cors";
import { errorHandler } from "./utils/error";
import { ConsoleLogger } from "./utils/logger";
import { configureLogger } from "./lib/app-logger";
import cookieParser from "cookie-parser";
import setUpMongo from "../mongo/mongoDbManager";
import { useAuthorizationParser } from "./middlewares/AuthMiddelwares";
const SERVER_PORT = process.env.BACKEND_PORT || 80; // default port of http is 80
// Create Express App and Routes
const app = express();

// ---------App Middlewares--------



if (process.env.IS_DEVELOPMENT === "true") {
  // Swagger options
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'SafeTheDate API',
        version: '1.0.0',
        description: 'API documentation for SafeTheDate API',
      },
      servers: [
        {
          url: `http://localhost:${SERVER_PORT}`,
        },
      ],
    },
    apis: ['src/routes/*.ts'], // Path to the API routes
  };

  const swaggerSpec = swaggerJsdoc(swaggerOptions);

  // Swagger endpoint
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use(helmet()); // Security headers & policies addon
app.use(compression());

app.use(cookieParser());

app.use(
  cors({
    origin: [process.env.FRONTEND_ENDPOINT!, process.env.BACKEND_ENDPOINT!],
    methods: "DELETE, PUT, POST, GET, OPTIONS",
    allowedHeaders: [
      "Access-Control-Allow-Origin",
      "Content-Type",
      "Access-Control-Allow-Headers",
      "Access-Control-Allow-Methods",
      "Set-Cookie",
      "X-Requested-With",
    ],
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
configureLogger(ConsoleLogger.getInstance());

app.use(useAuthorizationParser());

// PUBLIC ROUTES
app.use("/", healthRouter);
app.use("/health", healthRouter);

setUpMongo();

// CLICK AUTH ROUTES
const router = express.Router();
router.use("/auth", authRouter);

app.use("/api", router);

// Global Error Handler
app.use(errorHandler());

console.log(process.env.IS_DEVELOPMENT === "true" ? "dev mode" : "prod mode");
if (process.env.IS_DEVELOPMENT === "false") {
  const https = require("https");
  const fs = require("fs");
  const options = {
    key: fs.readFileSync("../../../../etc/ssl/myserver.key"),
    cert: fs.readFileSync("../../../../etc/ssl/cs.crt"),
  };
  const server = https.createServer(options, app);
  server.listen(SERVER_PORT, () => {
    console.log("Listening on port " + SERVER_PORT);
  });
} else {
  app.listen(SERVER_PORT, () => {
    console.log("Listening on port " + SERVER_PORT);
  });
}
