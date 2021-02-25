const express = require('express');
const path = require('path');
const router = express.Router();
const taskController = require("../controllers/taskController");


router.get("/", async (req, res) => {
    await taskController.get(req, res);
});

router.get("/create",(req,res)=>{
    res.sendFile(path.join(__dirname,"../web/task.html"));
});

router.get("/:id", async (req, res) => {
    await taskController.getById(req, res);
});
router.delete("/:id",async(req,res)=>{
    await taskController.deleteById(req,res,req.params.id);
});

router.post("/create", async (req, res) => {
    await taskController.create(req, res);
});

module.exports = router;
