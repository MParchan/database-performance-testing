import express from "express";
import brandRoutes from "./routes/brandsRoutes.js";
import categoryRoutes from "./routes/categoriesRoutes.js";
import productRoutes from "./routes/productsRoutes.js";
import roleRoutes from "./routes/rolesRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());
app.use("/api/brands", brandRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/roles", roleRoutes);
app.use(errorHandler);

export { app };
