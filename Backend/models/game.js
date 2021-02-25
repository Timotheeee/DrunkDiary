'use strict';
const states = require('../models/helper/states.js');
const GameState = require('../models/gameState.js');
const Tasks = require('../models/helper/taskDAO.js');
const TaskMode = require('../models/modus/taskMode.js');
const SantaMode = require('../models/modus/santaMode.js');
class Game{
    constructor(users) {
        this.users = new Map();
        users.forEach(uName=>{
            this.users.set(uName,1);
        });
        this.round  = 0;
        this.states = new GameState();
        this.taskMode = new TaskMode(this);
        this.santaMode = new SantaMode(this);
        this.start();
    }
    getUsers (){
    let users = [];
    Array.from( this.users.keys()).forEach((uName)=>{
            users.push({uName:uName,points:this.users.get(uName)});
        });
        return users;
    }
    // check if this really works
    removeUser (uName){
        this.users.delete(uName);
    }
    putResults () {

    }
    start(){
        this.states.nextState();
    }

    getResponse(reply){
        let response;
        switch (this.states.currentState) {
            case states.taskStating:
                response = this.taskMode.setTask();
                break;

            case states.taskResult:
                response = this.taskMode.evaluateTask(reply);
                break;

            case states.santaStated:
                response = this.santaMode.getStats();
                break;
            case states.santaResult:
                response = this.santaMode.getResult(reply);
                break;
            default:
                break;
        }
        this.states.nextState(this);
        return response;

    }
}


module.exports = Game;
