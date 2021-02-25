class SantaMode {
    constructor(game) {
        this.game = game;
    }
    // votes = {[[{user:String,presents:{user:String,count:int}}],[...],...]}
    getResult(votes){
        let gifts = new Map();
        let user = "";
        let points = 0;
        let gifter  = "";
        let totalSpend = 0;
        let isRegistered = false;

        votes.forEach(vote =>{
            gifter = vote.name;
            vote.presents.forEach(present =>{
                user = present.name;
                points = present.count;
                console.log("points "+gifter+": "+ points);
                isRegistered = gifts.has(user);
                totalSpend += points;
                if (isRegistered){
                    gifts.set(user,gifts.get(user)+ points);
                }else {
                    gifts.set(user,points);
                }
            });
            console.log(gifter + " " + totalSpend);
            this.game.users.set(gifter,this.game.users.get(gifter)-totalSpend);
        });
        let result = [];
        console.log(gifts);
        gifts.forEach((v,k) =>result.push({user:k,count:v}));
        console.log(result);
        return result;
    }
    getStats(){
        console.log(this.game.users);
        let users = this.game.users;
        let res = [];
        users.forEach((v, k) => {
            res.push({user:k,points:v});
            console.log("key " + k);
            console.log("value " + v);
        });
        console.log(res);
        return res;
    }

}

module.exports = SantaMode;
