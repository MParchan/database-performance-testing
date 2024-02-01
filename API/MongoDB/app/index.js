import express from "express";
import categoriesRoutes from "./routes/categoriesRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import { connectDb } from "./config/dbConnection.js";
import dotenv from "dotenv";

dotenv.config();
connectDb();
const app = express();

app.use(express.json());
app.use("/api/categories", categoriesRoutes);
app.use(errorHandler);

export { app };
