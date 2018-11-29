//importo expres
const express = require("express");
//Para encryptar contraseñas
const bcrypt = require("bcrypt");
const Usuario = require("../modelo/usuario");

const jwt = require('jsonwebtoken');
const app = express();

const {
    OAuth2Client
} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({
        email: body.email
    }, (err, usuarioDB) => {
        if (err) {
            return res.header(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            return res.header(400).json({
                ok: false,
                err: "Usuario o contraseña incorrecta"
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.header(400).json({
                ok: false,
                err: "Usuario o contraseñaa incorrecta"
            });
        }

        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, {
            expiresIn: process.env.CADUCIDAD_TOKEN
        });

        res.json({
            ok: true,
            usuario: usuarioDB,
            token: token
        });


    });

});


async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async (req, res) => {
    let token = req.body.idtoken;
    let googleUser = await verify(token).catch(e => {
        return res.header(403).json({
            ok: false,
            err: e
        });
    });

    Usuario.findOne( { email : googleUser.email } , ( err , usuarioDB )=>{
        if( usuarioDB ){
            if(usuarioDB.google === false){
                return res.header(400).json({
                    ok : false,
                    err : {
                        message : "Debe usar su autenticación normal"
                    }
                });
            }else{
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, {
                    expiresIn: process.env.CADUCIDAD_TOKEN
                });
        
                return res.json({
                    ok : true,
                    usuario : usuarioDB
                });
            }
        }else{

            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email =  googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save( (err , usuarioDB)=>{
                if (err) {
                    return res.header(500).json({
                        ok: false,
                        err
                    });
                }

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, {
                    expiresIn: process.env.CADUCIDAD_TOKEN
                });

                return res.json({
                    ok : true,
                    usuario : usuarioDB
                });

            });
        }
    });
});

module.exports = app;