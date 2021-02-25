const jwt = require("jsonwebtoken");
const secret = require("../config").secret;
function auth(req,res,next) {
    let apiUserRequests = /\/api\/user\/.*/;
    let apiLogRequest = /\/log/;
    if(req.url.match(apiUserRequests) || req.url.match(apiLogRequest)){ // TODO: before deployment, fix access to user/
        next();
    }else {
        let token;
        if(req.cookies)
            token = req.cookies.token;

        let payload;
        try {
            payload = jwt.verify(token, secret);
        } catch (error) {
        }
        if (payload === null || payload === undefined){
            res.status(401).send("Nice try");
        } else {
            next();
        }
    }
}
module.exports = auth;
