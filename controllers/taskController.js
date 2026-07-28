const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");

const taskCounter = (() => {
  let lastTaskNumber = 0;
  return () => {
    lastTaskNumber += 1;
    return lastTaskNumber;
  };
})();

//CREATE
exports.create = async (req, res) => {
  if (!req.body) req.body = {};
  const { error, value } = taskSchema.validate(req.body, { abortEarly: false });
  if (error) {
  return res.status(400).json({
    message: error.message,
  });
}
  //When a task is created, the owner is saved
  //This line saves the email of the currently logged-in user into the task's userId field. 
  // From this point on, every task has an owner.
  const newTask = { id: taskCounter(), userId: global.user_id.email, ...value };
  global.tasks.push(newTask);
  const { userId, ...sanitizedTask } = newTask;
  return res.status(201).json(sanitizedTask);
};

//INDEX
exports.index = async (req, res) => {

    const userTasks = global.tasks.filter(
  (task) => task.userId === global.user_id.email,
);

if (userTasks.length === 0) {
  return res.status(404).json({
    message: "The requested task is not found for the current user"
  });
}

const sanitizedTasks = userTasks.map((task) => {
    const { userId, ...sanitizedTask } = task;
    return sanitizedTask;
  });

  return res.status(200).json(sanitizedTasks);
};
 
//SHOW
exports.show = async (req, res) =>  {
const taskId = parseInt(req.params?.id);
if(Number.isNaN(taskId))
{
return res.status(400).json({
   message: "Request data is invalid"
});
}
//The show function checks ownership
//There are two conditions:
const task = global.tasks.find((task) => {
      return task.id === taskId && task.userId === global.user_id.email; 
    });

if(!task) {
        return res.status(404).json({
        message: "The requested task is not found for the current user"
  });
}
const { userId, ...sanitizedTask } = task;
return res.status(200).json(sanitizedTask);

};

//UPDATE
exports.update = async (req, res) =>  {
if (!req.body) req.body = {};
  const { error, value } = patchTaskSchema.validate(req.body, { abortEarly: false });
  if (error) {
  return res.status(400).json({
    message: error.message,
  });
}
const taskId = parseInt(req.params?.id);
if(Number.isNaN(taskId))
{
return res.status(400).json({
   message: "Request data is invalid"
});
}
const task = global.tasks.find((task) => {
      return task.id === taskId && task.userId === global.user_id.email; 
    });

if(!task) {
        return res.status(404).json({
        message: "The requested task is not found for the current user"
  });
}

Object.assign(task, value);
const { userId, ...sanitizedTask } = task;
return res.status(200).json(sanitizedTask);

}

//DELETE TASK
exports.deleteTask=async(req,res)=>{
const taskId = parseInt(req.params?.id);
if(Number.isNaN(taskId))
{
return res.status(400).json({
   message: "Request data is invalid"
});
}

//Search the array and tell the position of the matching item.
const taskIndex = global.tasks.findIndex((task) => {
     return task.id === taskId && task.userId === global.user_id.email; 
    
    });

const task = global.tasks[taskIndex];   

if(!task) {
        return res.status(404).json({
        message: "The requested task is not found for the current user"
  });
}

global.tasks.splice(taskIndex, 1);

const { userId, ...sanitizedTask } = task;
return res.status(200).json(sanitizedTask);

}





