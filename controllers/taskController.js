const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");
const pool = require("../db/pg-pool");

//CREATE
exports.create = async (req, res,next) => {
  if (!req.body) req.body = {};
  const { error, value } = taskSchema.validate(req.body, { abortEarly: false });
  if (error) {
  return res.status(400).json({
    message: error.message,
  });
}  
  const task  = await pool.query(`INSERT INTO tasks (title, is_completed, user_id) 
  VALUES ( $1, $2, $3 ) RETURNING id, title, is_completed`,
 // [value.title, value.is_completed, global.user_id]);
 [value.title, value.isCompleted, global.user_id]);
  return res.status(201).json(task.rows[0]);
};

//INDEX
exports.index = async (req, res,next) => {
   const tasks = await pool.query(
        "SELECT id, title, is_completed FROM tasks WHERE user_id = $1",
        [global.user_id]
    );
if (tasks.rows.length === 0) {
  return res.status(404).json({
    message: "The requested task is not found for the current user"
  });
}
  return res.status(200).json(tasks.rows);
};
 
//SHOW
exports.show = async (req, res,next) =>  {
const taskId = parseInt(req.params?.id);
if(Number.isNaN(taskId))
{
return res.status(400).json({
   message: "Request data is invalid"
});
}
const task = await pool.query(
        "SELECT id, title, is_completed FROM tasks WHERE id = $1 AND user_id = $2",
        [taskId, global.user_id]
    );

if(task.rowCount === 0) {
        return res.status(404).json({
        message: "The requested task is not found for the current user"
  });
}
return res.status(200).json(task.rows[0]);

};

//UPDATE
exports.update = async (req, res,next) =>  {
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

if (Object.keys(value).length === 0) {
        return res.status(400).json({
        message: "No fields provided to update"
  });
}

    let keys = Object.keys(value);
    keys = keys.map((key) => key === "isCompleted" ? "is_completed" : key);
    
    const setClauses = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
    const idParm = `$${keys.length + 1}`;
    const userParm = `$${keys.length + 2}`;
    const updatedTask = await pool.query(
        `UPDATE tasks SET ${setClauses} 
         WHERE id = ${idParm} AND user_id = ${userParm} 
         RETURNING id, title, is_completed`,
        [...Object.values(value), taskId, global.user_id]
    );
    if (updatedTask.rowCount === 0) {
        return res.status(404).json({
            message: "The requested task is not found for the current user"
        });
    }
return res.status(200).json(updatedTask.rows[0]);

}

//DELETE TASK
exports.deleteTask=async(req,res, next)=>{
const taskId = parseInt(req.params?.id);
if(Number.isNaN(taskId))
{
return res.status(400).json({
   message: "Request data is invalid"
});
}

const deletedTask = await pool.query(
        `DELETE FROM tasks 
         WHERE id = $1 AND user_id = $2 
         RETURNING id, title, is_completed`,
        [taskId, global.user_id]
    );

if(deletedTask.rowCount===0) {
        return res.status(404).json({
        message: "The requested task is not found for the current user"
  });
}
return res.status(200).json(deletedTask.rows[0]);

}





