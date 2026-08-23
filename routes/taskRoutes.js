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

router.post("/", create);//create
router.get("/", index);//index
//router.post("/bulk", bulkCreate);//bulkCreate
router.get("/:id",show);//show
router.post("/bulk", bulkCreate);//bulkCreate
router.patch("/:id",update);//update
router.delete("/:id",deleteTask);//deleteTask


module.exports = router;




