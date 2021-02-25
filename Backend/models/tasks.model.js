const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title:String,
    description: String,
    type: String,
    answers: [String],
    A:[String],
    B:[String],
    solution:String,
    options:Object,
});

const Task = mongoose.model("Tasks", taskSchema);

module.exports = Task;

