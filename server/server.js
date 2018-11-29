require("./config");
const mongoose = require('mongoose');
const path = require('path'); //para obtener la ruta correcta de la carpeta public
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Habilitar carpeta publica
//utilizo middleware de node
app.use( express.static(  path.resolve(  __dirname , "../public" ) ) );

app.use( require('./rutas/index') );



mongoose.connect('mongodb://localhost:27017/cafe',  { useCreateIndex: true, useNewUrlParser: true},( error , res )=>{
    if( error) throw error;

    console.log("Conectado a la base de datos");
});

app.listen( process.env.PORT , ()=>{
    console.log("Escuchando en el puerto 3000");
})