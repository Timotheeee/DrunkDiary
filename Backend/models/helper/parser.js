'use strict';


class Parser{

    parseTask(task,users){

        let responseText = task.description;
        let options = task.options;

        // if the first options field is empty, fill in the names of all players here
        if (options.A === "") {
            options = {};
            users.forEach( (key, value) => {
                options[value] = value;
            });
        }


        if (!responseText.match(tokenRegex)) return {des:responseText,options};
        let parts = this.getTokenArray(responseText);
        let i;
        if (responseText.match(nameRegex) || responseText.match(optionsRegex)){

            for (i = 0; i < parts.length;i++){
                if (parts[i].match(nameRegex)){
                    parts[i] = this.getRandomUser(users);
                }
                if((optionsRegex.test(parts[i]))){
                    let letter = parts[i].match(optionLetters);
                    parts[i] = options[letter];
                }
            }

        }

        else{

            let user1 = this.getRandomUser(users);
            let user2 = this.getRandomUser(users);
            while (user1 === user2){
                user2 = this.getRandomUser(users);
            }
            for (i = 0; i < parts.length;i++){
                if (parts[i].match("{name1}")){
                    parts[i] = user1;
                }
                if (parts[i].match("{user2}")){
                    parts[i] = user2;
                }
            }
        }
        return {des:parts.join(""),options:options};

    }
    getRandomUser(users){
        let size  = users.size;
        let i = Math.floor(Math.random()*size);
        // [i] is the position of random user data, [0] the name [1] the points.
        return Array.from( users)[i][0];
    }

    parseResponse(task,options){
        let responseTxt;
        let answers = task.answers;
        if(options.option === undefined) responseTxt = answers[Math.floor(Math.random()* answers.length)];
        else {
            responseTxt = task[options.option][Math.floor(Math.random()* task[options.option].length)];
        }
        let points = 0;
        let parts = this.getTokenArray(responseTxt);
        let i;
        let player;
        let hasNameParameter = options !== undefined && options.name !== undefined;
        for(i = 0; i < parts.length;i++){
            if (hasNameParameter){
                let name = options.name;
                if (parts[i].match(nameRegex)){
                    parts[i] = this.getNameString(name);
                    player = name;
                }
            }
            if(String(parts[i]).match(numberRegex)){
                let sips = this.getNumber(parts[i]);
                parts[i] = sips+ " sip" ;
                if (sips > 1 ) parts[i] += "s";
            }else if(String(parts[i]).match(pointRegex)){
                points = this.getNumber(parts[i]);
                parts[i] = points+ " point" ;
                if (points > 1 ) parts[i] += "s";
            }

        }
        // for later handling in taskMode
        if(!Array.isArray(player)){
            player = [player]
        }
        let isSingular = player.length-1;
        return {txt:this.getRightNumberForm(parts.join(""),isSingular),points:points,player:player};
    }

    getNumber (string) {
        let borders = string.match(/\d/g);
        let num = borders[0];
        let difference;
        if (borders.length > 1){
            difference = borders[1]-borders[0];
            num  = num*1.0 +  Math.floor(Math.random()*difference + 0.5);
        }
        return num;
    };


    getTokenArray (text){
        return text.split(tokenRegex);
    }
    getNameString(names){
        let isPlural = names.length -1;
        if(!isPlural) return names;
        let name = String(names);
        name = name.split(/(,)/);
        name[name.length-2] = " and ";
        name = name.join("");
        return name;
    }
    getRightNumberForm(responseString,isSingular){
        let index = 1;
        if (isSingular === 0){
            index = 0;
        }
        let preparedString = responseString.split(/(\[.*])/g);
        for(let i = 0; i < preparedString.length; i++){
            if(preparedString[i].match(/(\[.*])/g)){

                let options = preparedString[i].split(separatorTokenForPlural);

                preparedString[i] = options[index];

            }
        }
        return preparedString.join("").replace(/([\[\]])/g,"");
    }

}


const pointRegex = /{p\(\d,\d\)}/;
const numberRegex = /{n\(\d,\d\)}/;
const tokenRegex = /({.+?})/g;
const pluralTokenRegex = /(\[.+])/g;
const separatorTokenForPlural = /\//;
const numNameRegex = /{name\d}/;
const nameRegex = /{name}/;
const optionsRegex = /{.}/;
const optionLetters = /[A-D]/;
module.exports = Parser;
