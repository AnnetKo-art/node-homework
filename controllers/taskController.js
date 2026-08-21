const { taskSchema, patchTaskSchema,querySchema } = require("../validation/taskSchema");
const prisma = require("../db/prisma");

//CREATE
exports.create = async (req, res, next) => {
  if (!req.body) req.body = {};
  const { error, value } = taskSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
  try {
    const task = await prisma.task.create({
      data: {
        title: value.title,
        isCompleted: value.isCompleted,
        priority: value.priority,
        userId: global.user_id,
      },
      select: { id: true, title: true, isCompleted: true, priority: true },
    });

    return res.status(201).json(task);
  } catch (err) {
    return next(err);
  }
};

//Stretch Goal: Add Sorting Support
// Helper function to build the orderBy object safely
const getOrderBy = (query) => {
  const validSortFields = ["title", "priority", "createdAt", "id", "isCompleted"];
  const sortBy = query.sortBy || "createdAt";
  const sortDirection = query.sortDirection === "asc" ? "asc" : "desc";
    
  if (validSortFields.includes(sortBy)) {
    return { [sortBy]: sortDirection };
  }
  return { createdAt: "desc" }; // default fallback
};


//INDEX
exports.index = async (req, res, next) => {
  try {
    // 1. Validate pagination and search parameters using Joi
    const { error, value } = querySchema.validate(req.query, { abortEarly: false });
    
    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        details: error.details,
      });
    }
    // Before Joi Validation:
   // const page = parseInt(req.query.page) || 1;
    //const limit = parseInt(req.query.limit) || 10;
    const page = value.page;  // with Joi validation
    const limit = value.limit;
    
    const skip = (page - 1) * limit;
   
    const whereClause = {
      userId: global.user_id,
    };
    // Filtering - searching by title with a find query parameter
//if (req.query.find) {
    //  whereClause.title = {
      //  contains: req.query.find, 
       // mode: "insensitive",   
     // };
   // }
   if (value.find) {
      whereClause.title = {
        contains: value.find, 
        mode: "insensitive",   
      };
    }

//stretching goal - Filtering by Completion Status
     const { isCompleted } = req.query;
    if (isCompleted !== undefined) {
      whereClause.isCompleted = req.query.isCompleted === 'true';
    }
// stretching goal - Filtering by Priority
const { priority } = req.query;
    if (priority) {
      whereClause.priority = req.query.priority;
    }

    // Stretching goal - Filtering by Minimum Date (min_date parameter)
const { min_date } = req.query;
if (min_date) {
  whereClause.createdAt = {
    gte: new Date(min_date)  // Greater than or equal to
  };
}
// Stretching goal - Filtering by Maximum Date (min_date parameter)
const { max_date } = req.query;
if (max_date) {
  whereClause.createdAt = {
    lte: new Date(max_date)  // Less than or equal to
  };
}

  const tasks = await prisma.task.findMany({
    where: whereClause,
    select: { title: true,
            isCompleted: true,
            id: true,
            priority: true,
            createdAt:true,
            User: {
                    select: {
                    name: true,
                    email: true
      }
    }
     },
     skip: skip,
      take: limit,
      //orderBy: { createdAt: 'desc' },//before sorting was implemented
      orderBy: getOrderBy(req.query), // Integrated sorting here!
  });
// Get total count for pagination metadata
const totalTasks = await prisma.task.count({
  where: whereClause
});

const pagination = {
      page,
      limit,
      total: totalTasks,
      pages: Math.ceil(totalTasks / limit),
      hasNext: page * limit < totalTasks,
      hasPrev: page > 1
    };

  return res.status(200).json({tasks, pagination}); //The word Return can be taken away here
} catch (err) {
    return next(err);
  }
};

//SHOW
exports.show = async (req, res, next) => {
  const taskId = parseInt(req.params?.id);
  if (Number.isNaN(taskId)) {
    return res.status(400).json({
      message: "Request data is invalid",
    });
  }
  try {
    const task = await prisma.task.findUnique({
      where: {
        id_userId: {
          id: taskId,
          userId: global.user_id,
        },
      },

      select: {
        id: true,
        title: true,
        isCompleted: true,
        priority: true,
        User: {          // This part is added for having a test passed.
      select: {
        name: true,
        email: true
      }
    }
      },
    });

    if (!task) {
      return res.status(404).json({
        message: "The requested task is not found for the current user",
      });
    }
    return res.status(200).json(task);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({
        message: "The requested task is not found for the current user",
      });
    }
    return next(err);
  }
};

//UPDATE
exports.update = async (req, res, next) => {
  const taskId = parseInt(req.params?.id);
  if (Number.isNaN(taskId)) {
    return res.status(400).json({
      message: "Request data is invalid",
    });
  }
  if (!req.body) req.body = {};
  const { error, value } = patchTaskSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  if (Object.keys(value).length === 0) {
    return res.status(400).json({
      message: "No fields provided to update",
    });
  }
  let updatedTask;
  try {
    updatedTask = await prisma.task.update({
      data: value,
      where: {
        id: taskId,
        userId: global.user_id,
      },
      select: {
        title: true,
        isCompleted: true,
        id: true,
        priority: true,
      },
    });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({
        message: "The requested task is not found for the current user",
      });
    }

    return next(err);
  }
  return res.status(200).json(updatedTask);
};

//DELETE TASK
exports.deleteTask = async (req, res, next) => {
  const taskId = parseInt(req.params?.id);
  if (Number.isNaN(taskId)) {
    return res.status(400).json({
      message: "Request data is invalid",
    });
  }
  let deletedTask;
  try {
    deletedTask = await prisma.task.delete({
      where: {
        id: taskId,
        userId: global.user_id,
      },
      select: {
        id: true,
        title: true,
        isCompleted: true,
        priority: true,
      },
    });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({
        message: "The requested task is not found for the current user",
      });
    }
    return next(err);
  }
  return res.status(200).json(deletedTask);
};

// Bulk create with validation / Method for POST /api/tasks/bulk
exports.bulkCreate = async (req, res, next) => {
  const { tasks } = req.body;

  // Validate the tasks array
  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({ 
      error: "Invalid request data. Expected an array of tasks." 
    });
  }

  // Validate all tasks before insertion
  const validTasks = [];
  for (const task of tasks) {
    const { error, value } = taskSchema.validate(task);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details,
      });
    }
    validTasks.push({
      title: value.title,
      isCompleted: value.isCompleted || false,
      priority: value.priority || 'medium',
      userId: global.user_id
    });
  }

  // Use createMany for batch insertion
  try {
    const result = await prisma.task.createMany({
      data: validTasks,
      skipDuplicates: false
    });

    res.status(201).json({
      message: "success!",
      tasksCreated: result.count,
      totalRequested: validTasks.length
    });
  } catch (err) {
    return next(err);
  }
};