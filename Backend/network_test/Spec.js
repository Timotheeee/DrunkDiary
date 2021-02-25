"use strict";
var env = jasmine.getEnv();
//var ip = "http://160.85.252.71:8080/";
var ip = "http://localhost:8080/";
var name = "aaa";
var tasks;
var results;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('sockets', function () {

    var token;
    var socket;


    axios({
        method: 'post',
        url: (ip + "api/user/validate"),
        data: { email: "A@a.com", password: "Oooooo5!" },
    })
        .then(function (response) {
            console.log(response);
            token = response.data.token;
            socket = io.connect(ip);

            console.log(socket);
            console.log("sending: " + token);
            socket.emit('authenticate', { token });
            socket.on('authenticated', () => { console.log("auth"); })
            socket.on('task', (data) => { tasks = data; })
            socket.on('resultEvaluated', (data) => { results = data; })
        })
        .catch((error) => {
            console.log('Error: ', error.message);
        });


    beforeEach(function () {

    });

    it('sockets are working', function (done) {
        let currentRoom = null;
        sleep(1500).then(() => {
            socket.emit('identify', name, (partyCode) => { currentRoom = partyCode });
            sleep(300).then(() => {
                if (currentRoom === null)
                    socket.emit('createRoom', "d", (partyCode) => { currentRoom = partyCode });

                sleep(300).then(() => {
                    socket.emit('userJoinedAndReady', currentRoom, name);
                    sleep(300).then(() => {
                        console.log(currentRoom);
                        env.expect(currentRoom > 0).toBeTruthy();
                        socket.emit('startGame', currentRoom);
                        sleep(300).then(() => {
                            console.log("tasks: ");
                            console.log(tasks);
                            let firstoption = tasks.options[Object.keys(tasks.options)[0]];
                            console.log(firstoption);
                            let vote = { name, vote: firstoption };
                            socket.emit('vote', vote,()=>{});
                            sleep(300).then(() => {
                                console.log("results: ");
                                console.log(results);
                                env.expect(results.length>0).toBeTruthy();
                                done();
                            });
                        });
                        
    
    
                    })
                });

            });

            


        })

    });


});

describe('API', function () {


    it('task API works', function (done) {
        axios({
            method: 'get',
            //url: (ip + "api/user/getUser/A@a.com"),
            url: (ip + "api/tasks/"),
            data: {},
        })
            .then(function (response) {
                console.log(response);
                env.expect(response.data.length > 0).toBeTruthy();
                done();
            })
    });

    it('user API works', function (done) {
        axios({
            method: 'get',
            url: (ip + "api/user/"),
            data: {},
        })
            .then(function (response) {
                console.log(response);
                env.expect(response.data.length > 0).toBeTruthy();
                done();
            })
    });

    it('pin API works', function (done) {
        axios({
            method: 'get',
            url: (ip + "api/pin/"),
            data: {},
        })
            .then(function (response) {
                console.log(response);
                env.expect(response.data.length > 0).toBeTruthy();
                done();
            })
    });


});

