const express = require("express");
const userRoute = require("./routes/user");
const taskRoute = require("./routes/task");

const port = process.env.PORT ?? 3000;
const app = express();

app.use(express.json());
app.use(userRoute);
app.use(taskRoute);

app.listen(port, () => {
    console.log("Server at port: " + port);
});
