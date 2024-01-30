import express from "express";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const port = 5000;

app.use(express.json());
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
