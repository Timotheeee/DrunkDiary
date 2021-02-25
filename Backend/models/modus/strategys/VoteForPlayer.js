class Vote{


    /*takes an array of votes*/
    getResult(votes) {
        let map = new Map();
        votes.forEach((vote)=>{
            if (map.get(vote.vote)) map.set(vote.vote,map.get(vote.vote)+1);
            else map.set(vote.vote,1);
        });

        let result = [];
        map.forEach((v, k) =>{
            result.push({v:v,k:k});
        });
        let name = "";
        let highScore = 0;
        for(let i = 0;i < result.length; i++){
            if (result[i].v > highScore) {
                highScore = result[i].v;
                name = result[i].k;
            }
            else if(result[i].v === highScore){
                if (Math.random() > 0.5){
                    name = result[i].k;
                }
            }
        }
        return {name: name};

    }

}
module.exports = Vote;
