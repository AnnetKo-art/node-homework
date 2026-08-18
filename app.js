const express = require("express");
const userRouter = require("./routes/userRoutes");
const notFound = require("./middleware/not-found");
const errorHandler = require("./middleware/error-handler");
const authMiddleware = require("./middleware/auth");
const taskRouter = require("./routes/taskRoutes");
const prisma = require("./db/prisma");

const app = express();
app.use(express.json());
app.use("/api/users", userRouter);
app.use("/api/tasks", authMiddleware, taskRouter);

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'not connected', error: err.message });
  }
});

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});


const shutdown = async () => {
  await prisma.$disconnect();
    console.log("Prisma disconnected");
  server.close(() => {
    process.exit(0);
  });
};



process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);//this line was added after AI Reviewer recommendations.
module.exports = { app, server };

