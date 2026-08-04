const express = require("express");
const userRouter = require("./routes/userRoutes");
const notFound = require("./middleware/not-found");
const errorHandler = require("./middleware/error-handler");
const authMiddleware = require("./middleware/auth");
const taskRouter = require("./routes/taskRoutes");
const pool = require("./db/pg-pool");

const app = express();
global.user_id = null;
global.users = [];
global.tasks = [];
app.use(express.json());
app.use("/api/users", userRouter);
app.use("/api/tasks", authMiddleware, taskRouter);

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ message: `db not connected, error: ${ err.message }` });
  }
});

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});

const shutdown = async () => {
  await pool.end();
};

process.on("SIGINT", shutdown);
module.exports = { app, server };

