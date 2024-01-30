import { app } from "./app/index.js";

const port = 5000;

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
