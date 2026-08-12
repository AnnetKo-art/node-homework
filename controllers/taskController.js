const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");
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
        userId: global.user_id,
      },
      select: { id: true, title: true, isCompleted: true },
    });

    return res.status(201).json(task);
  } catch (err) {
    return next(err);
  }
};

//INDEX
exports.index = async (req, res, next) => {
  const tasks = await prisma.task.findMany({
    where: {
      userId: global.user_id, // only the tasks for this user
    },
    select: { title: true, isCompleted: true, id: true },
  });
  if (tasks.length === 0) {
    return res.status(404).json({
      message: "The requested task is not found for the current user",
    });
  }
  return res.status(200).json(tasks); //The word Return can be taken away here
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
