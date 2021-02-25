class AOrB{

    getResult(reply){
        let A = [];
        let B = [];
        reply.forEach((vote) =>{
            if (vote.vote === "A"){
                A.push(vote.name);
            } else{
                B.push(vote.name);
            }
        });
        const resultA = {option:"A",name:A};
        const resultB = {option:"B",name:B};
        if(A.length > B.length){
            return resultA
        }
        else if( A.length < B.length) {
            return resultB
        }else{
            let num = Math.random();
            if(num > 0.5){
                return resultA;
            }
            else{
                return resultB;
            }
    }

    }

}
module.exports = AOrB;
