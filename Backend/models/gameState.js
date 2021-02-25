'use strict';

const playingStates = require('../models/helper/states.js');
class GameState {
    constructor() {
            this.currentState = '';
            this.priorState = '';
    }
    nextState(game){
        this.priorState = this.currentState;
        switch (this.currentState) {
            case playingStates.taskStating:
                this.currentState = playingStates.taskResult;
                game.round += 1;
                break;
            case playingStates.taskResult:
                console.log(game.round);
                 if ( game.round % 4 === 0 && this.userHavePoints(game.users)) this.currentState = playingStates.santaStated;
                 else this.currentState = playingStates.taskStating;
                break;
            case playingStates.santaStated:
                this.currentState = playingStates.santaResult;
                break;
            case playingStates.santaResult:
                this.currentState = playingStates.taskStating;
                break;
            default:
                this.currentState = playingStates.taskStating;
        }
    }
    getCurrentState(){
        return this.currentState;
    }
    getPriorState(){
        return this.priorState;
    }
    userHavePoints(users){
        let result = false;
        Array.from(users.values()).forEach((points)=>{
            if (points >0) {
                result = true;
            }
        });
        return result;
    }


}
module.exports = GameState;



