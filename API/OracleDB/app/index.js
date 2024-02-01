import express from "express";
import brandsRoutes from "./routes/brandsRoutes.js";
import categoriesRoutes from "./routes/categoriesRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import rolesRoutes from "./routes/rolesRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import ordersRoutes from "./routes/ordersRoutes.js";
import eventsRoutes from "./routes/eventsRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());
app.use("/api/brands", brandsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/events", eventsRoutes);
app.use(errorHandler);

export { app };
