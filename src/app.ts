import express from "express";
import { setupRoutes } from "./routes";
import knex from "knex";
import { ModelFactory } from "./models";

// Initialize DB
let environment = process.env.NODE_ENV || "development";

const { config } = require("../knexfile");
const db = knex(config[environment]);


// Initialize models
const modelFactory = new ModelFactory(db);

// Create Express app
const app = express();

// Middleware
app.use(express.json());

// Set up routes
setupRoutes(app, modelFactory, db);

export { app };
