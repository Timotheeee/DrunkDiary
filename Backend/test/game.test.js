'use strict';

const Game = require('../models/game.js');
const expect = require('chai').expect;


it('the game logic should work', () => {
    let players = ['tim', 'max', 'franz', 'filip'];
    let game = new Game(players);





    for (let i = 0; i < 100; i++) {

        let tasks = game.getResponse(null);
        expect(tasks.type.length>0).to.eql(true);
        expect(tasks.task.length>0).to.eql(true);
        expect(Object.keys(tasks.options).length>0).to.eql(true);
        
        let firstoption = tasks.options[Object.keys(tasks.options)[0]];
        let votes = [{ name: "tim", vote: firstoption }, { name: "franz", vote: firstoption }, { name: "filip", vote: firstoption }, { name: "max", vote: firstoption }];
        let resp = game.getResponse(votes);
        expect(resp.txt.length>0).to.eql(true);
        expect(resp.points>-1000000).to.eql(true);
    }



});