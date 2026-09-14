//connect route paths to  controller functions
const express = require("express");
const userController = require("../controllers/userController");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const router = express.Router();

/**
 * @openapi
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     parameters:
 *       - in: header
 *         name: X-Recaptcha-Test
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional reCAPTCHA bypass token for testing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               password:
 *                 type: string
 *                 example: "StrongP@ss1"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or reCAPTCHA failure
 */
router.post("/register", userController.register);
/**
 * @openapi
 * /api/users/logon:
 *   post:
 *     summary: Log in an existing user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "StrongP@ss1"
 *     responses:
 *       200:
 *         description: Logged in successfully
 *       401:
 *         description: Invalid credentials
 */
router.post("/logon", userController.logon);
/**
 * @openapi
 * /api/users/logoff:
 *   post:
 *     summary: Log off current user
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *         csrfAuth: []
 *     responses:
 *       200:
 *         description: Logged off successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/logoff", jwtMiddleware, userController.logoff);
module.exports = router;




