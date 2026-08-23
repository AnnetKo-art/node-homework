const prisma = require("../db/prisma");

//Method for GET /api/analytics/users/:id that returns user statistics
exports.getUserAnalytics = async (req, res, next) => {
  // Parse and validate the user ID from req.params
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({
      message: "Request data is invalid",
    });
  }

  try {
    // 404 Check: Check whether the user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Use groupBy to count tasks by completion status
    const taskStats = await prisma.task.groupBy({
      by: ['isCompleted'],
      where: { userId },
      _count: {
        id: true
      }
    });

    // findMany with eager loading to get recent tasks (last 10)
    const recentTasks = await prisma.task.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        isCompleted: true,
        priority: true,
        createdAt: true,
        userId: true,
        User: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    //Calculate weekly progress using groupBy (tasks in the last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyProgress = await prisma.task.groupBy({
      by: ['createdAt'],
      where: {
        userId,
        createdAt: {
          gte: oneWeekAgo
        }
      },
      _count: {
        id: true
      }
    });

    // Return response with taskStats, recentTasks, and weeklyProgress
    return res.status(200).json({
      taskStats,
      recentTasks,
      weeklyProgress
    });

  } catch (err) {
    return next(err);
  }
};

//Method for GET /api/analytics/users that shows all users with task statistics
exports.getUsersWithStats = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get users with task counts and limited incomplete tasks using include and skip/take
    const usersRaw = await prisma.user.findMany({
      include: {
        Task: {
          where: { isCompleted: false },
          select: { id: true },
          take: 5
        },
        _count: {
          select: {
            Task: true
          }
        }
      },
      skip: skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
    // 3. Transform to only include the fields we want
    const users = usersRaw.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      _count: user._count,
      Task: user.Task
    }));
   
    const totalUsers = await prisma.user.count();
    const pagination = {
      page,
      limit,
      total: totalUsers,
      pages:  Math.ceil(totalUsers / limit),
      hasNext: page * limit < totalUsers,
      hasPrev: page > 1
    };

    return res.status(200).json({
      users,
      pagination
    });
  } catch (err) {
    return next(err);
  }
};

// Task Search with Raw SQL / Method  for GET /api/analytics/tasks/search
exports.searchTasks = async (req, res, next) => {
  try {
    const searchQuery = req.query.q;

    // 1. Validate search query (must be at least 2 characters)
    if (!searchQuery || searchQuery.trim().length < 2) {
      return res.status(400).json({ 
        error: "Search query must be at least 2 characters long" 
      });
    }

    // 2. Get limit from query (default to 20 if not provided)
    const limit = parseInt(req.query.limit) || 20;

    // 3. Construct search patterns outside the query for proper parameterization
    const searchPattern = `%${searchQuery}%`;
    const exactMatch = searchQuery;
    const startsWith = `${searchQuery}%`;

    // 4. Use prisma.$queryRaw with template literals for parameterized queries
    const searchResults = await prisma.$queryRaw`
      SELECT 
        t.id,
        t.title,
        t.is_completed as "isCompleted",
        t.priority,
        t.created_at as "createdAt",
        t.user_id as "userId",
        u.name as "user_name"
      FROM tasks t
      JOIN users u ON t.user_id = u.id
      WHERE t.title ILIKE ${searchPattern}
         OR u.name ILIKE ${searchPattern}
      ORDER BY 
        CASE 
          WHEN t.title ILIKE ${exactMatch} THEN 1
          WHEN t.title ILIKE ${startsWith} THEN 2
          WHEN t.title ILIKE ${searchPattern} THEN 3
          ELSE 4
        END,
        t.created_at DESC
      LIMIT ${parseInt(limit)}
    `;

    // 5. Return results with query string, results array, and count number
    return res.status(200).json({
      results: searchResults,
      query: searchQuery,
      count: searchResults.length
    });

  } catch (err) {
    return next(err);
  }
};