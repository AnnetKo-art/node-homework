const express = require("express");
const router = express.Router();
const analyticsController= require("../controllers/analyticsController");

/**
 * @openapi
 * /api/analytics/users:
 *   get:
 *     summary: Get users list with statistics
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: Analytics summary for users, including task counts and up to 5 incomplete tasks per user
 */
router.get("/users", analyticsController.getUsersWithStats );

/**
 * @openapi
 * /api/analytics/users/{id}:
 *   get:
 *     summary: Get analytics for a specific user
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user's numeric ID
 *     responses:
 *       200:
 *         description: Analytics data for the specified user, including task stats by completion status, the 10 most recent tasks, and weekly task creation counts
 *       400:
 *         description: Invalid or non-numeric user ID
 *       404:
 *         description: User not found
 */
router.get("/users/:id", analyticsController.getUserAnalytics );
//router.get("/users", analyticsController.getUsersWithStats );
/**
 * @openapi
 * /api/analytics/tasks/search:
 *   get:
 *     summary: Search across tasks for analytics
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search term matched against task title or user name (case-insensitive)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of results to return
 *     responses:
 *       200:
 *         description: Matching tasks, ranked by relevance (exact title match, then starts-with, then contains)
 *       400:
 *         description: Search query missing or shorter than 2 characters
 */
router.get("/tasks/search", analyticsController.searchTasks );

module.exports = router;

















//getUserAnalytics, getUsersWithStats, and searchTasks