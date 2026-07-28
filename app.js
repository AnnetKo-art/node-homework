const express = require("express");
const userRouter = require("./routes/userRoutes");
const notFound = require("./middleware/not-found");
const errorHandler = require("./middleware/error-handler");
const authMiddleware = require("./middleware/auth");
const taskRouter = require("./routes/taskRoutes");

//const timeRouter = require("./routes/timeRoutes");

const app = express();
global.user_id = null;
global.users = [];
global.tasks = [];
app.use(express.json());
app.use("/api/users", userRouter);
app.use("/api/tasks", authMiddleware, taskRouter);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});

module.exports = { app, server };

/* PART OF WEEK2 ASSIGNMENT
app.use("/api", timeRouter);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.post("/testpost", (req, res) => {
  res.status(200).json({
    message: "POST route works",
  });
});


app.all("/*splat", (req, res) => {
  res.status(404).json({
    message: `No route found for ${req.method} ${req.path}`,
  });
});

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});

module.exports = { app, server };*/
