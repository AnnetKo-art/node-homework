const express = require("express");
const router = express.Router();
const {
  create,
  index,
  show,
  update,
  deleteTask,
  bulkCreate
} = require("../controllers/taskController");

/**
 * @openapi
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *         csrfAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: "Complete assignment 11"
 *               isCompleted:
 *                 type: boolean
 *                 default: false
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation error
 *   get:
 *     summary: Get all tasks for the authenticated user
 *     tags: [Tasks]
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
 *           maximum: 100
 *           default: 10
 *         description: Number of tasks per page
 *       - in: query
 *         name: find
 *         schema:
 *           type: string
 *         description: Search tasks by title
 *       - in: query
 *         name: isCompleted
 *         schema:
 *           type: boolean
 *         description: Filter tasks by completion status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter tasks by priority
 *       - in: query
 *         name: min_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Return tasks created on or after this date
 *       - in: query
 *         name: max_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Return tasks created on or before this date
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, priority, createdAt, id, isCompleted]
 *           default: createdAt
 *         description: Field used to sort tasks
 *       - in: query
 *         name: sortDirection
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort direction
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.post("/", create);//create
router.get("/", index);//index
/**
 * @openapi
 * /api/tasks/bulk:
 *   post:
 *     summary: Bulk create multiple tasks
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *         csrfAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tasks
 *             properties:
 *               tasks:
 *                 type: array
 *                 description: Array of tasks to create
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - title
 *                   properties:
 *                     title:
 *                       type: string
 *                       minLength: 3
 *                       maxLength: 30
 *                       example: "Complete Swagger documentation"
 *                     isCompleted:
 *                       type: boolean
 *                       default: false
 *                       example: false
 *                     priority:
 *                       type: string
 *                       enum: [low, medium, high]
 *                       default: medium
 *                       example: high
 *     responses:
 *       201:
 *         description: Tasks created successfully
 *       400:
 *         description: Invalid request data or validation failure
 *       401:
 *         description: Unauthorized
 */
router.post("/bulk", bulkCreate);//bulkCreate
/**
 * @openapi
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a specific task by ID
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task found
 *       404:
 *         description: Task not found
 *   patch:
 *     summary: Update an existing task
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *         csrfAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               isCompleted:
 *                 type: boolean
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: Task updated successfully
 *   delete:
 *     summary: Delete a task by ID
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *         csrfAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task deleted successfully
 */
router.get("/:id",show);//show
router.patch("/:id",update);//update
router.delete("/:id",deleteTask);//deleteTask


module.exports = router;




