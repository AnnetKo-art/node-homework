const express = require("express");
const userRouter = require("./routes/userRoutes");
const notFound = require("./middleware/not-found");
const errorHandler = require("./middleware/error-handler");
const authMiddleware = require("./middleware/jwtMiddleware");
const taskRouter = require("./routes/taskRoutes");
const prisma = require("./db/prisma");
const analyticsRoutes = require("./routes/analyticsRoutes");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const rateLimiter = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

/*const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node Homework API",
      version: "1.0.0",
      description: "API Documentation for Node.js Backend Application",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local Development Server",
      },
      {
        url: "https://node-homework-backend-hanna-kovalenko.onrender.com",
        description: "Production Render Server",
      },
    ],
  },
  apis: ["./routes/*.js"],
};*/
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node Homework API",
      version: "1.0.0",
      description: "API Documentation for Node.js Backend Application",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local Development Server",
      },
      {
        url: "https://node-homework-backend-hanna-kovalenko.onrender.com",
        description: "Production Render Server",
      },
    ],

    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "jwt",
          description: "JWT authentication stored in an HTTP-only cookie. This field cannot be set manually here — the cookie is automatically attached by your browser after a successful POST /api/users/logon, since HTTP-only cookies are inaccessible to JavaScript (including Swagger UI) for security reasons.",
        },
        csrfAuth: {
          type: "apiKey",
          in: "header",
          name: "X-CSRF-TOKEN",
          description:
            "CSRF token. Log in via POST /api/users/logon, copy the csrfToken from the response body, then paste it here.",
        },
      },
    },
  },

  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

const app = express();
app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  }),
);
app.use(helmet());
app.use(express.json({limit: "1mb"}));
app.use(cookieParser());
app.use(xss());
//app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, {
    swaggerOptions: {
      requestInterceptor: (req) => {
        req.credentials = "include"; // Include cookies with every request
        return req;
      },
    },
  })
);



app.use("/api/users", userRouter);
app.use("/api/tasks", authMiddleware, taskRouter);
app.use("/api/analytics", authMiddleware, analyticsRoutes);

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

