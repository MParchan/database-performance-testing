import express from "express";
import productRoutes from "./routes/productRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());
app.use("/api/products", productRoutes);
app.use("/api/brands", brandRoutes);
app.use(errorHandler);

export { app };
