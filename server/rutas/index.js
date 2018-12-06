
const express = require('express')
const app = express()

app.use( require('./usuario') );
app.use( require('./login') );
app.use( require('./Categoria'));
app.use( require('./producto'));
app.use( require('./upload') );
app.use( require('./Imagenes') );

module.exports = app;