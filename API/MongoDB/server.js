import { app } from "./app/index.js";

const port = 5002;

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
