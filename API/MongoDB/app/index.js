import express from "express";
import brandsRoutes from "./routes/brandsRoutes.js";
import categoriesRoutes from "./routes/categoriesRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import { connectDb } from "./config/dbConnection.js";
import dotenv from "dotenv";

dotenv.config();
connectDb();
const app = express();

app.use(express.json());
app.use("/api/brands", brandsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productsRoutes);
app.use(errorHandler);

export { app };
