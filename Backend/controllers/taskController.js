const Task = require("../models/tasks.model");

exports.get = async (req, res) =>{
    const tasks = await Task.find();
    await res.json(tasks);
};

exports.getById = async (req, res) => {
    const task = await Task.findById(req.params.id);
    await res.json(task);
};

exports.deleteById = async (req,res,id)=>{
    Task.remove({ _id: id }, function(err) {
        if (!err) {
            console.log("task whit" + id + "got removed from mongo db");
            res.send("task whit" + id + "got removed from mongo db")
        }
        else {
            console.log(err);
        }
    });
};

exports.create = async (req, res) => {
    const task = new Task(req.body.task);
    await task.save().then(() => console.log("Task created"));

    res.send("Task created \n");
};
