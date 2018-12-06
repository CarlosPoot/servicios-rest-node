const  jwt = require('jsonwebtoken');


let verificaToken = (  req , res , next  ) =>{
    
    let token = req.get('token')

    jwt.verify(  token , process.env.SEED ,( err , decode ) =>{

        if( err ){
            return res.status(401).json({
                ok : false,
                err
            });
        }

        req.usuario = decode.usuario;
        next();
    });

}

let verificaTokenImg = (  req , res , next  ) =>{
    
    let token = req.query.token;

    jwt.verify(  token , process.env.SEED ,( err , decode ) =>{

        if( err ){
            return res.status(401).json({
                ok : false,
                err : "Token invalido"
            });
        }

        req.usuario = decode.usuario;
        next();
    });

}



let verificaAdminRol = (  req, res, next  ) =>{
    let usuario = req.usuario

    if( usuario.role === "ADMIN_ROLE" ){
        next();
    }else{
        return res.header(400).json({
            ok : false,
            err :{
                message : "El usuario no es administrador"
            }
        });
    }

}


module.exports = {
    verificaToken,
    verificaAdminRol,
    verificaTokenImg
}