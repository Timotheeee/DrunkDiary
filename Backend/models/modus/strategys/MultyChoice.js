class MultyChoice{

    getResult(reply,task){
        let winners = [];
        reply.forEach((vote)=>{
            if(vote.vote === task.solution){
                winners.push(vote.name);
            }
        });
        if(winners.length === 0){
            return {option:"B"}
        }else{
            return {name:winners,option: "A"}
        }
    }
}
module.exports  = MultyChoice;
