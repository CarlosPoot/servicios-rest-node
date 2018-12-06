
const express = require('express');
const fs = require('fs');
const path = require('path');
let app = express();
let { verificaTokenImg  }= require('../middlewares/autenticacion');

app.get("/imagen/:tipo/:img" , verificaTokenImg  ,( req, res)=>{

    let tipo = req.params.tipo;
    let img = req.params.img;

    let patImg =  path.resolve( __dirname, `../../upload/${tipo}/${img}`);

    if( fs.existsSync( patImg ) ){
        res.sendFile( patImg );
    }else{
        let noImage = path.resolve( __dirname , '../assets/nohay.png' );
        res.sendFile( noImage );
    }

});


module.exports = app;