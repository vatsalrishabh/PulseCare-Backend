const jwt = require('jsonwebtoken');
const secret = process.env.JwtSecret;

const makeJwtToken =(userData)=>{

    return jwt.sign(userData,secret); //returns the token to frontend
}

const verifyJwtToken =(tokenFromFrontend)=>{
    if(!tokenFromFrontend) return null;
    try{
        return jwt.verify(tokenFromFrontend,secret); //takes token form frontend and 
    }catch(error){
        return null;
    }
   
}

module.exports={
makeJwtToken,
verifyJwtToken,
};