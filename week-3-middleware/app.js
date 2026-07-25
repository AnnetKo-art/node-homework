const express = require("express");
const dogsRouter = require("./routes/dogs");
const { randomUUID } = require("crypto");

const app = express();
// Request ID Middleware
app.use((req, res, next) => {
  req.requestId = randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
});

//  Custom Logging Middleware
const requestLogger = (req, res, next) => {
  console.log(
    `[${new Date().toISOString()}]: ${req.method} ${req.path} (${req.requestId})`,
  );
  next();
};

app.use(requestLogger);
app.use(express.json());
app.use("/images", express.static("week-3-middleware/public/images"));

app.use("/", dogsRouter); // Do not remove this line

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    requestId: req.requestId,
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: "Internal Server Error",
    requestId: req.requestId,
  });
});

if (require.main === module) {
  app.listen(3000, () => {
    console.log("Dog rescue app is listening on port 3000...");
  });
}

module.exports = app;
