//taskDao just for prototping here.
const Parser = require("../helper/parser.js");
const TaskDAO = require("../helper/taskDAO.js");
const Vote = require("../modus/strategys/VoteForPlayer.js");
const AOrB = require("../modus/strategys/VoteForAorB.js");
const MultyChoice = require("../modus/strategys/MultyChoice.js");
const mc = new MultyChoice();
const aOrB = new AOrB();
const vote = new Vote();
class TaskMode {
    constructor(game) {
    this.strategys = new  Map();
    this.currentTaskType = null;
    this.currentTask = null;
    this.game = game;
    this.users = this.game.users;

    this.strategys.set("voteForPlayer",vote.getResult);
    this.strategys.set("A or B",aOrB.getResult);
    this.strategys.set("MultyChoice",mc.getResult);
    }




    setTask(){
        this.currentTask = taskDAO.getTask();
        this.currentTaskType = this.currentTask.type;
        let task = parser.parseTask(this.currentTask,this.users,);

        return {type:this.currentTaskType,task:task.des,options:task.options,title:this.currentTask.title};
    }
// todo refactor
    evaluateTask(reply) {
    if (this.currentTaskType === "basic") {
        this.game.states.nextState(this.game);
        return null;
    }
    let result =  this.strategys.get(this.currentTaskType)(reply,this.currentTask);
    let response = parser.parseResponse(this.currentTask,result);

    if (response.points > 0 && response.player[0] === undefined) {
        let keys = Object.keys(this.game.users);

        for(let i = 0; i < keys.length;i++){
            this.game.users.set(keys[i],this.game.users.get(keys[i])+response.points);
        }
    }
    else if (response.points> 0)response.player.forEach((name)=>{this.game.users.set(name,this.users.get(name)+response.points)});
    return response;
    }



}
const taskDAO = new TaskDAO();
const parser = new Parser();



module.exports = TaskMode;
