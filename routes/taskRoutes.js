const express = require("express");
const router = express.Router();
const {
  create,
  index,
  show,
  update,
  deleteTask
} = require("../controllers/taskController");

router.post("/", create);//create
router.get("/", index);//index
router.get("/:id",show);//show
router.patch("/:id",update);//update
router.delete("/:id",deleteTask);//deleteTask


module.exports = router;




